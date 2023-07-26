import { Controller } from 'egg';
import { GlobalErrorTypes } from '../error';
import defineRoles from '../roles/roles';
import { subject } from '@casl/ability';
import { difference, assign } from 'lodash/fp';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';
type Action = 'read' | 'create' | 'update' | 'delete';
const caslMethodMapping: Record<Method, Action> = {
  GET: 'read',
  POST: 'create',
  PATCH: 'update',
  DELETE: 'delete',
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
  // 查找记录时候的 value 的来源，默认为 ctx.params
  // 来源对应的 URL 参数 或者 ctx.request.body, valueKey 数据来源的键值
  value?: { type: 'params' | 'body'; valueKey: string };
}

const defaultOtpions: IOptions = {
  key: 'id',
  value: { type: 'params', valueKey: 'id' },
};

/**
 *
 * @param modelName model 的名称，可以好似普通的字符串，也可以是 casl 和 mongoose 的映射关系
 * @param errorType 返回的错误类型，来自于 GlobalErrorTypes
 * @param options 特殊的配置选项，可以自定义 action 以及查询条件，详见上面的 IOptions 选项
 * @returns function
 */

export default function checkPermission(
  modelName: 'User' | 'Work' | ModelMapping,
  errorType: GlobalErrorTypes,
  options?: IOptions
) {
  return function (...args) {
    const descriptor = args[args.length - 1];
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const that = this as Controller;
      // @ts-ignore
      const { ctx, app } = that;
      const { method } = ctx.request;
      const searchOptions = assign(
        defaultOtpions,
        options
      ) as Required<IOptions>;
      const { key, value } = searchOptions;
      const { type, valueKey } = value;
      // 构建 query
      const source = type === 'params' ? ctx.params : ctx.request.body;
      const query = {
        [key]: source[valueKey],
      };
      // 构建 modelName
      const mongooseModelName =
        typeof modelName === 'string' ? modelName : modelName.mongoose;
      const caslModelName =
        typeof modelName === 'string' ? modelName : modelName.casl;
      const action = options?.action
        ? options.action
        : caslMethodMapping[method as Method];
      // 判断用户是否登录
      if (!ctx.state && !ctx.state.user) {
        return ctx.helper.error({ ctx, errorType });
      }
      let permission = false;
      let keyPermission = true;
      // 获取定义的 roles
      const ability = defineRoles(ctx.state.user);
      // 获取 rule，判断是否有对应的条件
      const rule = ability.relevantRuleFor(action, caslModelName);
      console.log('rule', rule);

      if (rule?.conditions) {
        // 假如存在 condition，查询对应的数据
        const certainRecord = await ctx.model[mongooseModelName]
          .findOne(query)
          .lean();
        if (certainRecord) {
          permission = ability.can(
            action,
            subject(caslModelName, certainRecord)
          );
        }
      } else {
        permission = ability.can(action, caslModelName);
      }

      // 判断 rule 中是否有对应的受限字段
      if (rule?.fields?.length) {
        // 1 过滤 request.body *
        // 2 获取当前 payload 的 keys 和允许的 fields 做比较
        const payloadKeys = Object.keys(ctx.request.body);
        const diffKeys = difference(payloadKeys, rule.fields);
        keyPermission = diffKeys.length === 0;
        console.log('diffKeys', diffKeys);
      }
      // console.log(permission, keyPermission);
      if (!permission || !keyPermission) {
        return ctx.helper.error({ ctx, errorType });
      }
      // const userId = ctx.state.user._id;
      // const certainRecord = await ctx.model[modelName].findOne({ id });
      // if (!certainRecord || certainRecord[userKey].toString() !== userId) {
      //   return ctx.helper.error({ ctx, errorType });
      // }
      await originalMethod.apply(this, args);
    };
  };
}
