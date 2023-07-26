import { Service } from 'egg';
import { SendSmsRequest } from '@alicloud/dysmsapi20170525';

export interface GiteeUserResp {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email: string;
}

export default class UserService extends Service {
  async createByEmail({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
    // 密码加密
    const hash = await this.ctx.genHash(password);
    // 创建用户
    return this.ctx.model.User.create({
      username,
      password: hash,
      email: username,
    });
  }

  async findById(id: string) {
    return this.ctx.model.User.findById(id);
  }

  async findByUsername(username: string) {
    return this.ctx.model.User.findOne({ username });
  }

  async sendSMS(phoneNumber: string, veriCode: string) {
    let sendSmsRequest = new SendSmsRequest({
      signName: '阿里云短信测试',
      templateCode: 'SMS_154950909',
      phoneNumbers: phoneNumber,
      templateParam: `{\"code\":\"${veriCode}\"}`,
    });

    return await this.app.ALClient.sendSms(sendSmsRequest);
  }

  async loginByCellphone(cellphone: string) {
    const { ctx, app } = this;
    // 检查用户是否存在
    let user = await this.findByUsername(cellphone);
    // 不存在则新建用户
    if (!user) {
      user = await ctx.model.User.create({
        username: cellphone,
        phoneNumber: cellphone,
        nickName: `lego${cellphone.slice(-4)}`,
        type: 'cellphone',
      });
    }
    // 生成 token 返回
    const payload = { username: user.username, _id: user._id };
    return app.jwt.sign(payload, app.config.jwt.secret);
  }

  async getAccessToken(code: string) {
    const { ctx, app } = this;
    const { cid, secret, redirecURL, authURL } = app.config.giteeOauthConfig;
    const { data } = await ctx.curl(authURL, {
      method: 'post',
      contentType: 'json',
      dataType: 'json',
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
        dataType: 'json',
      }
    );
    app.logger.info(data);
    return data;
  }

  async loginByGitee(code: string) {
    const { ctx, app } = this;
    // 获取 access_token
    const accessToken = await this.getAccessToken(code);
    // 获取 gitee 用户信息
    const userData = await this.getGiteeUserData(accessToken);
    // 检查用户信息是否存在
    const { id, name, avatar_url, email } = userData;
    let user = await this.findByUsername(`Gitee${id}`);
    // 如果用户信息不存在，新建用户
    if (!user) {
      user = await ctx.model.User.create({
        oauthID: id.toString(),
        provider: 'gitee',
        username: `Gitee${id}`,
        picture: avatar_url,
        nickName: name,
        email,
        type: 'oauth',
      });
    }
    // 返回 token
    return app.jwt.sign(
      { username: user.username, _id: user._id },
      app.config.jwt.secret
    );
  }
}
