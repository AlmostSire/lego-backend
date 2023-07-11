import { Context } from "egg";
import { globalErrorMessages, GlobalErrorTypes } from "../error";

interface SuccessRespType {
  ctx: Context;
  res?: any;
  msg?: string;
}

interface ErrorRespType {
  ctx: Context;
  errorType: GlobalErrorTypes;
  error?: any;
}

export default {
  success({ ctx, res, msg }: SuccessRespType) {
    ctx.body = {
      errno: 0,
      data: res ? res : null,
      message: msg || "请求成功",
    };
    ctx.status = 200;
  },
  error({ ctx, errorType, error }: ErrorRespType) {
    const { message, errno } = globalErrorMessages[errorType];
    ctx.body = {
      errno,
      message: message || "请求错误",
      error,
    };
    ctx.status = 200;
  },
};
