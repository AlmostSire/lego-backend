import { Service } from "egg";
import { WorkProps } from "../model/work";
import { Types } from "mongoose";
import { nanoid } from "nanoid";
import { IndexCondition } from "../controller/work";

const defaultCondition: Required<IndexCondition> = {
  pageIndex: 0,
  pageSize: 10,
  select: "",
  populate: "",
  customSort: { createdAt: -1 },
  find: {},
};

export default class WorkService extends Service {
  async createEmptyWork(payload: WorkProps) {
    const { ctx } = this;
    // 拿到对应的 user id
    const { username, _id } = ctx.state.user;
    // 拿到独一无二的 URL id
    const uuid = nanoid(6);
    const newEmptyWork: Partial<WorkProps> = {
      ...payload,
      user: Types.ObjectId(_id),
      author: username,
      uuid,
    };
    return ctx.model.Work.create(newEmptyWork);
  }

  async getList(condition: IndexCondition) {
    const { pageIndex, pageSize, select, populate, customSort, find } = {
      ...defaultCondition,
      ...condition,
    };
    const skip = pageIndex * pageSize;
    const res = await this.ctx.model.Work.find(find)
      .select(select)
      .populate(populate)
      .skip(skip)
      .limit(pageSize)
      .sort(customSort)
      .lean();
    const count = await this.ctx.model.Work.find(find).countDocuments();
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
    }).lean();
    return `${H5BaseURL}/p/${id}-${res?.uuid}`;
  }
}
