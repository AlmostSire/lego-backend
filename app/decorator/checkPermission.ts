import { Controller } from "egg";
import { GlobalErrorTypes } from "../error";

export default function checkPermission(
  modelName: string,
  errorType: GlobalErrorTypes,
  userKey = "user"
) {
  return function (...args) {
    const descriptor = args[args.length - 1];
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const that = this as Controller;
      // @ts-ignore
      const { ctx, app } = that;
      const { id } = ctx.params;
      const userId = ctx.state.user._id;

      const certainRecord = await ctx.model[modelName].findOne({ id });
      if (!certainRecord || certainRecord[userKey].toString() !== userId) {
        return ctx.helper.error({ ctx, errorType });
      }
      await originalMethod.apply(this, args);
    };
  };
}
