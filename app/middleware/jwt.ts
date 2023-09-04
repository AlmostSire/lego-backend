import { Context, EggAppConfig } from "egg";
import { verify } from "jsonwebtoken";

const getTokenValue = (ctx: Context) => {
  // JWT Header 格式
  // Authorization:Bearer tokenXXX
  const { authorization } = ctx.header;
  if (!authorization) {
    return false;
  }
  const parts = authorization.trim().split(" ");
  if (parts.length !== 2) {
    return false;
  }
  const scheme = parts[0];
  const credentials = parts[1];
  if (/^Bearer$/i.test(scheme)) {
    return credentials;
  } else {
    return false;
  }
};

export default (options: EggAppConfig["jwt"]) => {
  return async (ctx: Context, next: () => Promise<any>) => {
    // 从 header 获取对应的 token
    const token = getTokenValue(ctx);
    if (!token) {
      return ctx.helper.error({ ctx, type: "loginCheckFailInfo" });
    }
    // 判断 secret 是否存在
    const { secret } = options;
    if (!secret) {
      throw new Error("Secret not provided");
    }

    try {
      const decoded = verify(token, secret);
      ctx.state.user = decoded;
      await next();
    } catch (error) {
      return ctx.helper.error({ ctx, type: "loginValidateFail" });
    }
  };
};
