import { Controller } from "egg";

const userCreateRules = {
  username: "email",
  password: {
    type: "password",
    min: 8,
  },
};

const sendCodeRules = {
  phoneNumber: {
    type: "string",
    format: /^1[3-9]\d{9}$/,
    message: "手机号码格式错误",
  },
};

const userCreateRulesByPhone = {
  phoneNumber: {
    type: "string",
    format: /^1[3-9]\d{9}$/,
    message: "手机号码格式错误",
  },
  veriCode: { type: "string", format: /^\d{4}$/, message: "验证码格式错误" },
};

export const userErrorMessages = {
  userValidateFail: {
    errno: 101001,
    message: "输入信息验证失败",
  },
  // 创建用户，写入数据库，失败
  createUserAlreadyExits: {
    errno: 101002,
    message: "该邮箱已被注册，请直接登录",
  },
  // 用户不存在或者密码错误
  loginCheckFailInfo: {
    errno: 101003,
    message: "该用户不存在或者密码错误",
  },
  // 登录校验失败
  loginValidateFail: {
    errno: 101004,
    message: "登录校验失败",
  },
  // 发送短信验证码过于频繁
  sendVeriCodeFrequentlyFailInfo: {
    errno: 101005,
    message: "请勿频繁获取短信验证码",
  },
  // 登录时，验证码不正确
  loginVeriCodeIncorrectFailInfo: {
    errno: 101006,
    message: "验证码不正确",
  },
  // 验证码发送失败
  sendVeriCodeError: {
    errno: 101007,
    message: "验证码发送失败",
  },
};

export default class UserController extends Controller {
  async sendVericode() {
    const { ctx, app, service } = this;
    const { phoneNumber } = ctx.request.body;
    // 检查用户输入
    const error = this.validateInput(sendCodeRules);
    if (error) {
      return ctx.helper.error({ ctx, type: "userValidateFail", error });
    }
    // 获取 redis 数据
    // phoneVeriCode-1331111222
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`);
    // 判断是否存在
    if (preVeriCode) {
      return ctx.helper.error({ ctx, type: "sendVeriCodeFrequentlyFailInfo" });
    }

    // 发送短信验证码
    // 判断运行环境
    const veriCode = Math.floor(Math.random() * 9000 + 1000).toString();
    if (app.config.env === "prod") {
      const resp = await service.user.sendSMS(phoneNumber, veriCode);
      if (resp.body.code !== "OK") {
        return ctx.helper.error({ ctx, type: "sendVeriCodeError" });
      }
    }

    await app.redis.set(`phoneVeriCode-${phoneNumber}`, veriCode, "ex", 60);
    ctx.helper.success({
      ctx,
      msg: "验证码发送成功",
      res: app.config.env === "local" ? { veriCode } : null,
    });
  }

  async loginByCellphone() {
    const { ctx, app, service } = this;
    const { phoneNumber, veriCode } = ctx.request.body;
    // 检查用户输入
    const error = this.validateInput(userCreateRulesByPhone);
    if (error) {
      return ctx.helper.error({ ctx, type: "userValidateFail", error });
    }

    // 验证码是否正确
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`);
    if (preVeriCode !== veriCode) {
      return ctx.helper.error({ ctx, type: "loginVeriCodeIncorrectFailInfo" });
    }

    const token = await service.user.loginByCellphone(phoneNumber);
    ctx.helper.success({ ctx, res: { token }, msg: "登录成功" });
  }

  async createByEmail() {
    const { ctx, service } = this;
    const error = this.validateInput(userCreateRules);
    if (error) {
      return ctx.helper.error({ ctx, type: "userValidateFail", error });
    }
    const { username } = ctx.request.body;
    const user = await service.user.findByUsername(username);
    if (user) {
      return ctx.helper.error({ ctx, type: "createUserAlreadyExits", error });
    }
    const userData = await service.user.createByEmail(ctx.request.body);
    ctx.helper.success({ ctx, res: userData });
  }

  validateInput(rules: any) {
    const { ctx, app, logger } = this;
    const error = app.validator.validate(rules, ctx.request.body);
    logger.warn(error);
    return error;
  }

  async loginByEmail() {
    const { ctx, service, app } = this;
    // 检查用户输入
    const error = this.validateInput(userCreateRules);
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
    const verifyPwd = await ctx.compare(password, user.password as string);
    if (!verifyPwd) {
      return ctx.helper.error({ ctx, type: "loginCheckFailInfo" });
    }

    // // 设置 cookie
    // ctx.cookies.set("username", username, { encrypt: true });

    // 设置 session
    // ctx.session.username = user.username;

    // Registered claims 注册相关信息
    // Public claims 公共信息：should be unique like email, address or phone_number
    const token = app.jwt.sign({ username: user.username }, app.config.secret, {
      expiresIn: 60 * 60,
    });

    return ctx.helper.success({ ctx, res: { token }, msg: "登录成功" });
  }

  async getUserInfo() {
    const { ctx, service } = this;
    // // 获取用户信息
    // const userData = await service.user.findById(ctx.params.id);

    // // 获取 cookie
    // const username = ctx.cookies.get("username", { encrypt: true });

    // 获取 session
    // const { username } = ctx.session;

    const user = await service.user.findByUsername(ctx.state.user.username);
    ctx.helper.success({ ctx, res: user });
  }
}
