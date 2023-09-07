import { Context } from "egg";

export default () => {
  return async (ctx: Context, next: () => Promise<any>) => {
    try {
      await next();
    } catch (error: any) {
      if (error && error.status === 401) {
        return ctx.helper.error({ ctx, type: "loginValidateFail" });
      } else if (ctx.path === "/api/utils/upload") {
        if (error && error.status === 400) {
          return ctx.helper.error({
            ctx,
            type: "imageUploadFileFormatError",
            error: error.message,
          });
        }
      }
      throw error;
    }
  };
};
