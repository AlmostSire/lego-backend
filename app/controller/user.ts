import { Controller } from "egg";

const userCreateRules = {
  username: "email",
  password: { type: "password", min: 8 },
};

export const userErrorMessages = {
  userValidateFail: {
    errno: 101001,
    message: "输入信息验证失败",
  },
  createUserAlreadyExists: {
    errno: 101002,
    message: "该邮箱已被注册，请直接登录",
  },
  loginCheckFailInfo: {
    errno: 101003,
    message: "该用户不存在或密码错误",
  },
  loginValidateFail: {
    errno: 101004,
    message: "登录校验失败",
  },
};

export default class UserController extends Controller {
  async createByEmail() {
    const { ctx, service } = this;
    const errors = this.validateUserInput();
    if (errors) {
      return ctx.helper.error({
        ctx,
        errorType: "userValidateFail",
        error: errors,
      });
    }
    const user = await service.user.findByUserName(ctx.request.body.username);
    if (user) {
      return ctx.helper.error({
        ctx,
        errorType: "createUserAlreadyExists",
      });
    }
    const userData = await service.user.createByEmail(ctx.request.body);
    ctx.helper.success({ ctx, res: userData });
  }

  validateUserInput() {
    const { ctx, app } = this;
    const errors = app.validator.validate(userCreateRules, ctx.request.body);
    ctx.logger.warn(errors);
    return errors;
  }

  async loginByEmail() {
    const { ctx } = this;
    // 检查用户输入
    const errors = this.validateUserInput();
    if (errors) {
      return ctx.helper.error({
        ctx,
        errorType: "userValidateFail",
        error: errors,
      });
    }
    // 根据 username 取得用户信息
    const { username, password } = ctx.request.body;
    const user = await ctx.service.user.findByUserName(username);
    // 检查用户是否存在
    if (!user) {
      return ctx.helper.error({
        ctx,
        errorType: "loginCheckFailInfo",
      });
    }

    const verifyPwd = await ctx.compare(password, user.password);
    // 验证密码是否成功
    if (!verifyPwd) {
      return ctx.helper.error({
        ctx,
        errorType: "loginCheckFailInfo",
      });
    }
    //ctx.cookies.set("username", user.username, { encrypt: true });
    ctx.session.username = user.username;
    return ctx.helper.success({
      ctx,
      res: user.toJSON(),
      msg: "登录成功",
    });
  }

  async show() {
    const { ctx } = this;
    //const username = ctx.cookies.get("username", { encrypt: true });
    const username = ctx.session.username;
    if (!username) {
      return ctx.helper.error({
        ctx,
        errorType: "loginValidateFail",
      });
    }
    //const userData = await service.user.findById(ctx.params.id);
    ctx.helper.success({ ctx, res: username });
  }
}
