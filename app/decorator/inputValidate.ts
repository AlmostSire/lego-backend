import { Controller } from "egg";
import { GlobalErrorTypes } from "../error";

export default function validateInput(rules: any, errorType: GlobalErrorTypes) {
  return function (...args) {
    const descriptor = args[args.length - 1];
    const originalMethod = descriptor.value;
    descriptor.value = function (...arg: any[]) {
      const that = this as Controller;
      // @ts-ignore
      const { ctx, app } = that;
      const errors = app.validator.validate(rules, ctx.request.body);
      if (errors) {
        return ctx.helper.error({ ctx, errorType, error: errors });
      }
      return originalMethod.apply(this, arg);
    };
  };
}
