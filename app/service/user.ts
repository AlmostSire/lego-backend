import { Service } from "egg";
import { UserProps } from "../model/user";
import { SendSmsRequest } from "@alicloud/dysmsapi20170525";

interface GiteeUserResp {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email: string;
}

export default class UserService extends Service {
  async createByEmail(payload: UserProps) {
    const { username, password } = payload;
    // 进行密码加密，生成hash值
    const hash = await this.ctx.genHash(password);
    const userCreatedData: Partial<UserProps> = {
      username,
      password: hash,
      email: username,
    };
    return this.app.model.User.create(userCreatedData);
  }

  async findById(id: string) {
    return this.app.model.User.findById(id);
  }

  async findByUsername(username: string) {
    return this.app.model.User.findOne({ username });
  }

  async loginByCellphone(cellphone: string) {
    const { ctx, app } = this;
    // 检查用户是否存在
    let user = await this.findByUsername(cellphone);
    // 不存在，新建一个用户
    if (!user) {
      const userCreateData: Partial<UserProps> = {
        username: cellphone,
        phoneNumber: cellphone,
        nickName: `乐高${cellphone.slice(-4)}`,
        type: "cellphone",
      };
      user = await ctx.model.User.create(userCreateData);
    }
    return app.jwt.sign(
      { username: user.username, _id: user._id },
      app.config.jwt.secret,
      { expiresIn: app.config.jwtExpires }
    );
  }

  async sendSMS(phoneNumber: string, veriCode: string) {
    // 配置参数
    const sendSmsRequest = new SendSmsRequest({
      signName: "阿里云短信测试",
      templateCode: "SMS_154950909",
      phoneNumbers: phoneNumber,
      templateParam: `{\"code\":\"${veriCode}\"}`,
    });

    return this.app.ALClient.sendSms(sendSmsRequest);
  }

  async getAccessToken(code: string) {
    const { ctx, app } = this;
    const { cid, secret, redirectURL, authURL } = app.config.giteeOauthConfig;
    const { data, status } = await ctx.curl(authURL, {
      method: "POST",
      contentType: "json",
      dataType: "json",
      data: {
        code,
        client_id: cid,
        redirect_uri: redirectURL,
        client_secret: secret,
      },
    });
    app.logger.info(data);
    if (status !== 200) {
      throw new Error("获取令牌失败！");
    }
    return data.access_token;
  }

  async getGiteeUserData(access_token: string) {
    const { ctx, app } = this;
    const { giteeUserAPI } = app.config.giteeOauthConfig;
    const { data, status } = await ctx.curl<GiteeUserResp>(
      `${giteeUserAPI}?access_token=${access_token}`,
      {
        dataType: "json",
      }
    );
    if (status !== 200) {
      throw new Error("获取 gitee 用户信息失败");
    }
    return data;
  }

  async loginByGitee(code: string) {
    const { ctx, app } = this;
    // 获取 access_token
    const accessToken = await this.getAccessToken(code);

    // 获取用户的信息
    const { id, name, avatar_url, email } = await this.getGiteeUserData(
      accessToken
    );
    // 检查用用户信息是否存在
    let user = await this.findByUsername(`Gitee${id}`);
    if (!user) {
      const userCreateData: Partial<UserProps> = {
        oauthID: id,
        provider: "gitee",
        username: `Gitee${id}`,
        picture: avatar_url,
        nickName: name,
        email,
        type: "oauth",
      };
      user = await ctx.model.User.create(userCreateData);
    }
    // 生成 token 返回
    return app.jwt.sign(
      { username: user.username, _id: user._id },
      app.config.jwt.secret,
      { expiresIn: app.config.jwtExpires }
    );
  }
}
