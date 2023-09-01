import { Controller } from "egg";

const userCreateRule = {
  username: "email",
  password: {
    type: "password",
    min: 8,
  },
};

export const userErrorMessages = {
  createUserValidateFail: {
    errno: 101001,
    message: "创建用户验证失败",
  },
  // 创建用户，写入数据库，失败
  createUserAlreadyExits: {
    errno: 101001,
    message: "该邮箱已被注册，请直接登录",
  },
};

export default class UserController extends Controller {
  async createByEmail() {
    const { ctx, service, app, logger } = this;
    const error = app.validator.validate(userCreateRule, ctx.request.body);
    logger.warn(error);
    if (error) {
      return ctx.helper.error({
        ctx,
        type: "createUserValidateFail",
        error,
      });
    }
    const { username } = ctx.request.body;
    const user = await service.user.findByUsername(username);
    if (user) {
      return ctx.helper.error({
        ctx,
        type: "createUserValidateFail",
        error,
      });
    }
    const userData = await service.user.createByEmail(ctx.request.body);
    ctx.helper.success({ ctx, res: userData });
  }

  async getUserInfo() {
    const { ctx, service } = this;
    const userData = await service.user.findById(ctx.params.id);
    ctx.helper.success({ ctx, res: userData });
  }
}
