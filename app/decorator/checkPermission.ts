import { Controller } from "egg";
import { GlobalErrorTypes } from "../error";

type Method = (...args: any[]) => void;

export default function checkPermission(
  modelName: "User" | "Work",
  type: GlobalErrorTypes,
  userKey = "user"
) {
  const methodDecorator: MethodDecorator = function (...args) {
    const descriptor = args[args.length - 1] as TypedPropertyDescriptor<Method>;
    const originalMethod = descriptor.value;
    if (originalMethod) {
      descriptor.value = async function (...args: any[]) {
        const that = this as Controller;
        // @ts-ignore
        const { ctx, app } = that;
        const { id } = ctx.params;
        const userId = ctx.state.user._id;
        const record = await ctx.model[modelName].findOne({ id });
        if (!record || record[userKey].toString() !== userId) {
          return ctx.helper.error({ ctx, type });
        }
        return originalMethod.apply(this, args);
      };
    }
  };

  return methodDecorator;
}
