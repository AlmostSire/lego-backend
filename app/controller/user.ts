import { Controller } from "egg";

const userCreateRule = {
  username: "email",
  password: {
    type: "password",
    min: 8,
  },
};

export const userErrorMessages = {
  userValidateFail: {
    errno: 101001,
    message: "输入信息验证失败",
  },
  // 创建用户，写入数据库，失败
  createUserAlreadyExits: {
    errno: 101001,
    message: "该邮箱已被注册，请直接登录",
  },
  // 用户不存在或者密码错误
  loginCheckFailInfo: {
    errno: 101002,
    message: "该用户不存在或者密码错误",
  },
};

export default class UserController extends Controller {
  async createByEmail() {
    const { ctx, service } = this;
    const error = this.validateInput();
    if (error) {
      return ctx.helper.error({ ctx, type: "userValidateFail", error });
    }
    const { username } = ctx.request.body;
    const user = await service.user.findByUsername(username);
    if (user) {
      return ctx.helper.error({ ctx, type: "createUserAlreadyExits", error });
    }
    const userData = await service.user.createByEmail(ctx.request.body);
    console.log(userData, "userData");
    ctx.helper.success({ ctx, res: userData });
  }

  validateInput() {
    const { ctx, app, logger } = this;
    const error = app.validator.validate(userCreateRule, ctx.request.body);
    logger.warn(error);
    return error;
  }

  async loginByEmail() {
    const { ctx, service } = this;
    // 检查用户输入
    const error = this.validateInput();
    if (error) {
      return ctx.helper.error({ ctx, type: "userValidateFail", error });
    }

    // 根据 username 取得用户信息
    const { username, password } = ctx.request.body;
    const user = await service.user.findByUsername(username);

    // 检查用户是否存在
    if (!user) {
      return ctx.helper.error({ ctx, type: "loginCheckFailInfo" });
    }
    // 验证密码是否成功
    const verifyPwd = await ctx.compare(password, user.password);
    if (!verifyPwd) {
      return ctx.helper.error({ ctx, type: "loginCheckFailInfo" });
    }

    // // 设置 cookie
    // ctx.cookies.set("username", username, { encrypt: true });

    // 设置 session
    ctx.session.username = user.username;

    return ctx.helper.success({ ctx, res: user.toJSON(), msg: "登录成功" });
  }

  async getUserInfo() {
    const { ctx } = this;
    // // 获取用户信息
    // const userData = await service.user.findById(ctx.params.id);

    // // 获取 cookie
    // const username = ctx.cookies.get("username", { encrypt: true });

    // 获取 session
    const { username } = ctx.session;
    if (!username) {
      return ctx.helper.error({ ctx, type: "loginCheckFailInfo" });
    }
    ctx.helper.success({ ctx, res: username });
  }
}
