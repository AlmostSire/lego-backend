import { Controller } from "egg";
import validateInput from "../decorator/inputValidate";

const userCreateRules = {
  username: "email",
  password: { type: "password", min: 8 },
};

const sendCodeRules = {
  phoneNumber: {
    type: "string",
    format: /^1[3-9]\d{9}$/,
    message: "手机号码格式错误",
  },
};

const userPhoneCreateRules = {
  ...sendCodeRules,
  veriCode: { type: "string", format: /^\d{4}$/, message: "验证码格式错误" },
};

export default class UserController extends Controller {
  @validateInput(userCreateRules, "userValidateFail")
  async createByEmail() {
    const { ctx, service } = this;

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

  @validateInput(sendCodeRules, "userValidateFail")
  async sendVeriCode() {
    const { ctx, app, service } = this;
    const { phoneNumber } = ctx.request.body;

    // 获取 redis 数据
    // phoneVeriCode-1331111222
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`);
    // 判断是否存在
    if (preVeriCode) {
      return ctx.helper.error({
        ctx,
        errorType: "sendVeriCodeFrequentlyFailInfo",
      });
    }
    // 生成验证码
    const veriCode = Math.floor(Math.random() * 9000 + 1000).toString();

    // 发送短信
    // 判断是否为生产环境
    if (app.config.env === "prod") {
      const resp = await service.user.sendSMS(phoneNumber, veriCode);
      if (resp.body.code !== "OK") {
        return ctx.helper.error({ ctx, errorType: "sendVeriCodeError" });
      }
    }

    await app.redis.set(`phoneVeriCode-${phoneNumber}`, veriCode, "ex", 60);
    ctx.helper.success({
      ctx,
      res: app.config.env === "local" ? { veriCode } : null,
      msg: "验证码发送成功",
    });
  }
  @validateInput(userPhoneCreateRules, "userValidateFail")
  async loginByCellphone() {
    const { ctx, app } = this;
    const { phoneNumber, veriCode } = ctx.request.body;

    // 验证码是否正确
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`);
    if (preVeriCode !== veriCode) {
      return ctx.helper.error({
        ctx,
        errorType: "loginVeriCodeIncorrectFailInfo",
      });
    }

    const token = await ctx.service.user.loginByCellphone(phoneNumber);
    return ctx.helper.success({ ctx, res: { token } });
  }
  // 检查用户输入
  @validateInput(userCreateRules, "userValidateFail")
  async loginByEmail() {
    const { ctx, app } = this;

    // 根据 username 取得用户信息
    const { username, password } = ctx.request.body;
    const user = await ctx.service.user.findByUserName(username);
    console.log(user);
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
    //ctx.session.username = user.username;
    // Registered claims 注册相关的信息
    // Public claims 公共信息：should be unique like email, address or phone_number
    const token = app.jwt.sign(
      { username: user.username, _id: user._id },
      app.config.jwt.secret,
      {
        expiresIn: 60 * 60,
      }
    );
    return ctx.helper.success({
      ctx,
      res: { token },
      msg: "登录成功",
    });
  }

  async oauth() {
    const { ctx, app } = this;
    const { cid, redirecURL } = app.config.giteeOauthConfig;
    ctx.redirect(
      `https://gitee.com/oauth/authorize?client_id=${cid}&redirect_uri=${redirecURL}&response_type=code`
    );
  }

  async oauthByGitee() {
    const { ctx } = this;
    const { code } = ctx.request.query;
    try {
      const token = await ctx.service.user.loginByGitee(code);
      //return ctx.helper.success({ ctx, res: { token } });
      // console.log(token, "token");
      await ctx.render("success.nj", { token });
    } catch (error) {
      return ctx.helper.error({ ctx, errorType: "giteeOauthError" });
    }
  }

  async show() {
    const { ctx, service } = this;
    // const username = ctx.cookies.get("username", { encrypt: true });
    // const username = ctx.session.username;
    const userData = await service.user.findByUserName(ctx.state.user.username);
    console.log(userData);
    ctx.helper.success({ ctx, res: userData?.toJSON() });
  }
}
