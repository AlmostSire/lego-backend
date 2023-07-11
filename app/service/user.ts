import { Service } from "egg";
import { UserProps } from "../model/user";
import * as $Dysmsapi from "@alicloud/dysmsapi20170525";

export interface GiteeUserResp {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email: string;
}

export default class UserService extends Service {
  public async createByEmail(payload: UserProps) {
    const { username, password } = payload;
    const hash = await this.ctx.genHash(password);
    const userCreateData: Partial<UserProps> = {
      username,
      password: hash,
      email: username,
    };

    return this.ctx.model.User.create(userCreateData);
  }

  async findById(id: string) {
    return this.ctx.model.User.findById(id);
  }

  async sendSMS(phoneNumber: string, veriCode: string) {
    let sendSmsRequest = new $Dysmsapi.SendSmsRequest({
      signName: "阿里云短信测试",
      templateCode: "SMS_154950909",
      phoneNumbers: phoneNumber,
      templateParam: `{\"code\":\"${veriCode}\"}`,
    });

    const resp = await this.app.ALClient.sendSms(sendSmsRequest);
    return resp;
  }

  async findByUserName(username: string) {
    return this.ctx.model.User.findOne({ username });
  }

  async loginByCellphone(cellphone: string) {
    const { ctx, app } = this;

    const user = await this.findByUserName(cellphone);
    // 检查用户是否存在
    if (user) {
      // generate token
      const token = app.jwt.sign(
        { username: user.username, _id: user._id },
        app.config.jwt.secret
      );
      return token;
    }
    // 新建一个用户
    const userCreatedData: Partial<UserProps> = {
      username: cellphone,
      phoneNumber: cellphone,
      nickName: `lego${cellphone.slice(-4)}`,
      type: "cellphone",
    };

    const newUser = await ctx.model.User.create(userCreatedData);
    const token = app.jwt.sign(
      { username: newUser.username, _id: newUser._id },
      app.config.jwt.secret
    );
    return token;
  }

  async getAccessToken(code: string) {
    const { ctx, app } = this;
    const { cid, secret, redirecURL, authURL } = app.config.giteeOauthConfig;
    const { data } = await ctx.curl(authURL, {
      method: "post",
      contentType: "json",
      dataType: "json",
      data: {
        code,
        client_id: cid,
        redirect_uri: redirecURL,
        client_secret: secret,
      },
    });
    app.logger.info(data);
    return data.access_token;
  }

  async getGiteeUserData(access_token: string) {
    const { ctx, app } = this;
    const { giteeUserAPI } = app.config.giteeOauthConfig;
    const { data } = await ctx.curl<GiteeUserResp>(
      `${giteeUserAPI}?access_token=${access_token}`,
      {
        dataType: "json",
      }
    );
    app.logger.info(data);
    return data;
  }

  async loginByGitee(code: string) {
    const { ctx, app } = this;
    // 获取 access_token
    const accessToken = await this.getAccessToken(code);
    // 获取用户信息
    const user = await this.getGiteeUserData(accessToken);
    // 检查用户信息是否存在
    const { id, name, avatar_url, email } = user;
    // Gitee + id
    // Github + id
    // VX + id
    // 假如已经存在
    const existUser = await this.findByUserName(`Gitee${id}`);
    if (existUser) {
      const token = app.jwt.sign(
        { username: existUser.username, _id: existUser._id },
        app.config.jwt.secret
      );
      return token;
    }
    // 假如不存在，新建用户
    const userCreateData: Partial<UserProps> = {
      oauthID: id.toString(),
      provider: "gitee",
      username: `Gitee${id}`,
      picture: avatar_url,
      nickName: name,
      email,
      type: "oauth",
    };

    const newUser = await ctx.model.User.create(userCreateData);
    const token = app.jwt.sign(
      { username: newUser.username, _id: newUser._id },
      app.config.jwt.secret
    );
    return token;
  }
}
