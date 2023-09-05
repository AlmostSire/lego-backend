import { Service } from "egg";
import { UserProps } from "../model/user";
import { SendSmsRequest } from "@alicloud/dysmsapi20170525";

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
    return app.jwt.sign({ username: user.username }, app.config.jwt.secret);
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
}
