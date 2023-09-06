import { Controller } from "egg";
import { GlobalErrorTypes } from "../error";

type Method = () => void;

export default function validateInput(rules: any, type: GlobalErrorTypes) {
  const methodDecorator: MethodDecorator = function (...args) {
    const descriptor = args[args.length - 1] as TypedPropertyDescriptor<Method>;
    const originalMethod = descriptor.value;
    if (originalMethod) {
      descriptor.value = function () {
        const that = this as Controller;
        // @ts-ignore
        const { ctx, app } = that;
        const error = app.validator.validate(rules, ctx.request.body);
        if (error) {
          ctx.logger.warn(error);
          return ctx.helper.error({ ctx, type, error });
        }
        return originalMethod.apply(this);
      };
    }
  };

  return methodDecorator;
}
