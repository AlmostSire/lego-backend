import { Service } from "egg";
import { UserProps } from "../model/user";

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
}
