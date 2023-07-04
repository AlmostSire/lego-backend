import { Context } from "egg";
import { userErrorMessages } from "../controller/user";

interface RespType {
  ctx: Context;
  res?: any;
  msg?: string;
}

interface ErrorRespType {
  ctx: Context;
  errorType: keyof typeof userErrorMessages;
  error?: any;
}

export default {
  success({ ctx, res, msg }: RespType) {
    ctx.body = {
      errno: 0,
      data: res ? res : null,
      message: msg || "请求成功",
    };
    ctx.status = 200;
  },
  error({ ctx, errorType, error }: ErrorRespType) {
    const { message, errno } = userErrorMessages[errorType];
    ctx.body = {
      errno,
      message: message || "请求错误",
      error,
    };
    ctx.status = 200;
  },
};