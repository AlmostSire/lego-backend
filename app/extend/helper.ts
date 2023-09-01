import { Context } from "egg";
import { userErrorMessages } from "../controller/user";

interface RespType {
  ctx: Context;
  res?: any;
  errType?: keyof typeof userErrorMessages;
  msg?: string;
}

interface ErrorRespType {
  ctx: Context;
  type: keyof typeof userErrorMessages;
  error?: any;
}

export default {
  success({ ctx, res, msg }: RespType) {
    ctx.body = {
      errno: 0,
      data: res ? res : null,
      mesage: msg ? msg : "请求成功",
    };
    ctx.status = 200;
  },

  error({ ctx, type, error }: ErrorRespType) {
    ctx.body = {
      ...userErrorMessages[type],
      error,
    };
    ctx.status = 200;
  },
};
