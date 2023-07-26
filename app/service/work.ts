import { Service } from 'egg';
import { nanoid } from 'nanoid';
import { WorkProps } from '../model/work';
import { Types } from 'mongoose';
import { IndexCondition } from '../controller/work';

const defaultIndexCondition: Required<IndexCondition> = {
  pageIndex: 0,
  pageSize: 10,
  select: '',
  populate: '',
  customSort: {
    createdAt: -1,
  },
  find: {},
};

export default class WorkService extends Service {
  async createEmptyWork(payload: Partial<WorkProps>) {
    const { ctx } = this;
    // 拿到对应的 user id
    const { username, _id } = ctx.state.user;
    // 拿到一个独一无二的 URL id
    const uuid = nanoid(6);

    return ctx.model.Work.create({
      ...payload,
      user: Types.ObjectId(_id),
      uuid,
      author: username,
    });
  }

  async getList(condition: IndexCondition) {
    const finalCondition = {
      ...defaultIndexCondition,
      ...condition,
    };
    const { pageIndex, pageSize, select, populate, find, customSort } =
      finalCondition;
    const skip = pageIndex * pageSize;
    const res = await this.ctx.model.Work.find(find)
      .select(select)
      .populate(populate)
      .skip(skip)
      .limit(pageSize)
      .sort(customSort)
      .lean();

    const count = await this.ctx.model.Work.find(find).count();

    return {
      count,
      list: res,
      pageIndex,
      pageSize,
    };
  }

  async publish(id: number, isTemplate = false) {
    const { ctx, app } = this;
    const { H5BaseURL } = app.config;
    const payload: Partial<WorkProps> = {
      status: 2,
      latestPublishAt: new Date(),
      isTemplate,
    };
    const res = await ctx.model.Work.findOneAndUpdate({ id }, payload, {
      new: true,
    });
    console.log(res, 'res');
    return `${H5BaseURL}/p/${id}-${res?.uuid}`;
  }
}
