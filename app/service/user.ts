import { Service } from "egg";
import { UserProps } from "../model/user";

export default class UserService extends Service {
  async createByEmail(payload: UserProps) {
    const { username, password } = payload;
    const userCreatedData: Partial<UserProps> = {
      username,
      password,
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
