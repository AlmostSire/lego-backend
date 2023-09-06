import { Context } from "egg";
import { globalErrorMessages, GlobalErrorTypes } from "../error";

interface SuccessRespType {
  ctx: Context;
  res?: any;
  msg?: string;
}

interface ErrorRespType {
  ctx: Context;
  type: GlobalErrorTypes;
  error?: any;
}

export default {
  success({ ctx, res, msg }: SuccessRespType) {
    ctx.body = {
      errno: 0,
      data: res ? res : null,
      mesage: msg ? msg : "请求成功",
    };
    ctx.status = 200;
  },

  error({ ctx, type, error }: ErrorRespType) {
    ctx.body = {
      ...globalErrorMessages[type],
      error,
    };
    ctx.status = 200;
  },
};
