import { Controller } from 'egg';
import validateInput from '../decorator/inputValidate';

const userCreateRules = {
  username: 'email',
  password: { type: 'password', min: 8 },
};

const sendCodeRules = {
  phoneNumber: {
    type: 'string',
    format: /^1[3-9]\d{9}$/,
    message: '手机号码格式错误',
  },
};

const userPhoneCreateRules = {
  ...sendCodeRules,
  veriCode: { type: 'string', format: /^\d{4}$/, message: '验证码格式错误' },
};

export default class UserController extends Controller {
  /**邮箱密码注册登录*/
  @validateInput(userCreateRules, 'userValidateFail')
  async createByEmail() {
    const { ctx, service } = this;
    const { username } = ctx.request.body;
    // 检查用户是否注册过
    const user = await service.user.findByUsername(username);
    if (user) {
      return ctx.helper.error({
        ctx,
        errorType: 'createUserAlreadyExists',
      });
    }
    // 没有注册，创建新用户
    const userData = await service.user.createByEmail(ctx.request.body);
    ctx.helper.success({ ctx, res: userData });
  }
  async getUserInfo() {
    const { ctx, service } = this;
    // 获取 cookie
    // const username = ctx.cookies.get("username", { encrypt: true });

    // 获取 session
    // const username = ctx.session.username;

    const user = await service.user.findByUsername(ctx.state.user.username);
    if (!user) {
      return ctx.helper.error({ ctx, errorType: 'loginValidateFail' });
    }
    // toJSON or toObject 转换成 json 对象
    const userData = user.toJSON();
    ctx.helper.success({ ctx, res: userData });
  }
  @validateInput(userCreateRules, 'userValidateFail')
  async loginByEmail() {
    const { ctx, app } = this;
    const { username, password } = ctx.request.body;
    // 检查用户是否存在
    const user = await ctx.service.user.findByUsername(username);
    if (!user || !user.password) {
      return ctx.helper.error({
        ctx,
        errorType: 'loginCheckFailInfo',
      });
    }

    // 验证密码是否正确
    const verifyPwd = await ctx.compare(password, user.password);
    if (!verifyPwd) {
      return ctx.helper.error({
        ctx,
        errorType: 'loginCheckFailInfo',
      });
    }

    // 设置 cookie
    // ctx.cookies.set("username", user.username, { encrypt: true });

    // 设置 session
    // ctx.session.username = user.username;

    // 用户信息生成 token
    // Registered claims 注册相关的信息
    // Public claims 公共信息：should be unique like email, address or phone_number
    const token = app.jwt.sign(
      { username: user.username, _id: user._id },
      app.config.jwt.secret,
      {
        expiresIn: app.config.jwtExpires,
      }
    );
    ctx.helper.success({
      ctx,
      res: { token },
      msg: '登录成功',
    });
  }
  /**手机号验证码登录*/
  @validateInput(sendCodeRules, 'userValidateFail')
  async sendVeriCode() {
    const { ctx, app, service } = this;
    const { phoneNumber } = ctx.request.body;
    const key = `phoneVeriCode-${phoneNumber}`;
    // 检查持久化存储，是否存在
    const preVeriCode = await app.redis.get(key);
    // 已存在，提示不要频繁发送
    if (preVeriCode) {
      return ctx.helper.error({
        ctx,
        errorType: 'sendVeriCodeFrequentlyFailInfo',
      });
    }
    // 不存在，生成验证码
    const veriCode = Math.floor(Math.random() * 9000 + 1000).toString();

    // 发送短信
    if (app.config.env === 'prod') {
      const resp = await service.user.sendSMS(phoneNumber, veriCode);
      if (resp.body.code !== 'OK') {
        return ctx.helper.error({ ctx, errorType: 'sendVeriCodeError' });
      }
    }
    // 持久化数据
    await app.redis.set(key, veriCode, 'ex', 60);
    ctx.helper.success({
      ctx,
      res: app.config.env === 'local' ? { veriCode } : null,
      msg: '验证码发送成功',
    });
  }
  @validateInput(userPhoneCreateRules, 'userValidateFail')
  async loginByCellphone() {
    const { ctx, app } = this;
    const { phoneNumber, veriCode } = ctx.request.body;
    // 判断验证码是否正确
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`);
    if (preVeriCode !== veriCode) {
      return ctx.helper.error({
        ctx,
        errorType: 'loginVeriCodeIncorrectFailInfo',
      });
    }
    const token = await ctx.service.user.loginByCellphone(phoneNumber);
    return ctx.helper.success({ ctx, res: { token } });
  }
  /**Oauth2第三方授权登录 */
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
      await ctx.render('success.nj', { token });
    } catch (error) {
      return ctx.helper.error({ ctx, errorType: 'giteeOauthError' });
    }
  }
}
