import { Controller } from "egg";
import { GlobalErrorTypes } from "../error";
import defineRoles from "../roles/roles";
import { subject } from "@casl/ability";
import { difference, assign } from "lodash/fp";

type Fn = (...args: any[]) => void;
type Method = "GET" | "POST" | "PATCH" | "DELETE";
type Action = "read" | "create" | "update" | "delete";

const caslMethodMapping: Record<Method, Action> = {
  GET: "read",
  POST: "create",
  PATCH: "update",
  DELETE: "delete",
};

interface ModelMapping {
  mongoose: string;
  casl: string;
}
interface IOptions {
  // 自定义 action
  action?: string;
  // 查找记录时候的 key，默认为 id
  key?: string;
  // 查找记录时候 value 的 来源 默认为 ctx.params
  // 来源于对应的 URL 参数 或者 ctx.request.body, valueKey 数据来源的键值
  value?: { type: "params" | "body"; valueKey: string };
}

const defaultSearchOptions = {
  key: "id",
  value: { type: "params", valueKey: "id" },
};

/**
 *
 * @param modelName model 的名称，可以是普通的字符串，也可以是 casl 和 mongoose 的映射关系
 * @param errorType 返回的错误类型，来自 GlobalErrorTypes
 * @param options 特殊配置选项，可以自定义 action 以及查询条件，详见上面的 IOptions 选项
 * @return function
 */

export default function checkPermission(
  modelName: string | ModelMapping,
  errorType: GlobalErrorTypes,
  options?: IOptions
) {
  const methodDecorator: MethodDecorator = function (...args) {
    const descriptor = args[args.length - 1] as TypedPropertyDescriptor<Fn>;
    const originalMethod = descriptor.value;
    if (originalMethod) {
      descriptor.value = async function (...args: any[]) {
        console.log("我正在鉴权");
        const that = this as Controller;
        // @ts-ignore
        const { ctx } = that;
        const method = ctx.request.method as Method;
        const { key, value } = assign(defaultSearchOptions, options || {});
        const { type, valueKey } = value;
        const source = type === "params" ? ctx.params : ctx.request.body;
        // 构建一个 query
        const query = {
          [key]: source[valueKey],
        };
        // 构建 modelname
        const mongooseModelName =
          typeof modelName === "string" ? modelName : modelName.mongoose;
        const caslModelName =
          typeof modelName === "string" ? modelName : modelName.casl;

        // 构建 action
        const action =
          options && options.action
            ? options.action
            : caslMethodMapping[method];

        // 判断是否登录
        if (!ctx.state && !ctx.state.user) {
          return ctx.helper.error({ ctx, type: errorType });
        }
        let permision = false;
        let keyPermission = true;
        // 获取定义的 roles
        const ability = defineRoles(ctx.state.user);
        // 获取 rule 判断是否存在对应的条件
        const rule = ability.relevantRuleFor(action, caslModelName);
        console.log(rule);
        if (rule && rule.conditions) {
          // 存在 condition，先查询对应的数据
          const record = await ctx.model[mongooseModelName].findOne(query);
          if (!record) {
            return ctx.helper.error({ ctx, type: "workNoExistFail" });
          }
          permision = ability.can(action, subject(caslModelName, record));
        } else {
          permision = ability.can(action, caslModelName);
        }
        // 判断 rule 中是否有对应的受限字段
        if (rule && rule.fields) {
          const payloadKeys = Object.keys(ctx.request.body);
          const diffKeys = difference(payloadKeys, rule.fields);
          console.log(diffKeys);
          keyPermission = diffKeys.length === 0;
        }
        console.log(permision, keyPermission);
        if (!permision || !keyPermission) {
          return ctx.helper.error({ ctx, type: errorType });
        }
        return originalMethod.apply(this, args);
      };
    }
  };

  return methodDecorator;
}
