import { Controller } from "egg";
import validateInput from "../decorator/inputValidate";
import checkPermission from "../decorator/checkPermission";
import { nanoid } from "nanoid";

const workCreateRules = {
  title: "string",
};

const channelCreateRules = {
  name: "string",
  workId: "number",
};

export interface IndexCondition {
  pageIndex?: number;
  pageSize?: number;
  select?: string | string[];
  populate?: { path?: string; select?: string } | string;
  customSort?: Record<string, any>;
  find?: Record<string, any>;
}

export default class WorkController extends Controller {
  @validateInput(channelCreateRules, "channelValidateFail")
  @checkPermission(
    { casl: "Channel", mongoose: "Work" },
    "workNoPermissionFail",
    { value: { type: "body", valueKey: "workId" } }
  )
  async createChannel() {
    const { ctx } = this;
    const { name, workId } = ctx.request.body;
    const newChannel = {
      name,
      id: nanoid(6),
    };
    const work = await ctx.model.Work.findOneAndUpdate(
      { id: workId },
      { $push: { channels: newChannel } }
    );
    if (!work) {
      return ctx.helper.error({ ctx, type: "channelOperateFail" });
    }
    ctx.helper.success({ ctx, res: newChannel });
  }

  @checkPermission(
    { casl: "Channel", mongoose: "Work" },
    "workNoPermissionFail"
  )
  async getWorkChannels() {
    const { ctx } = this;
    const { id } = ctx.params;
    const work = await ctx.model.Work.findOne({ id }).lean();
    if (!work) {
      ctx.helper.error({ ctx, type: "channelOperateFail" });
    }
    ctx.helper.success({
      ctx,
      res: { count: work?.channels?.length || 0, list: work?.channels || [] },
    });
  }

  @checkPermission(
    { casl: "Channel", mongoose: "Work" },
    "workNoPermissionFail",
    { key: "channels.id" }
  )
  async updateChannelName() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { name } = ctx.request.body;
    const work = await ctx.model.Work.findOneAndUpdate(
      { "channels.id": id },
      { $set: { "channels.$.name": name } }
    ).lean();
    if (!work) {
      ctx.helper.error({ ctx, type: "channelOperateFail" });
    }
    ctx.helper.success({ ctx, res: { name } });
  }

  @checkPermission(
    { casl: "Channel", mongoose: "Work" },
    "workNoPermissionFail",
    { key: "channels.id" }
  )
  async deleteChannel() {
    const { ctx } = this;
    const { id } = ctx.params;
    const work = await ctx.model.Work.findOneAndUpdate(
      { "channels.id": id },
      { $pull: { channels: { id } } },
      { new: true }
    );
    ctx.helper.success({ ctx, res: work?.channels });
  }

  @validateInput(workCreateRules, "workValidateFail")
  @checkPermission("Work", "workNoPermissionFail")
  async createWork() {
    const { ctx, service } = this;
    const workData = await service.work.createEmptyWork(ctx.request.body);
    ctx.helper.success({ ctx, res: workData });
  }

  async myList() {
    const { ctx } = this;
    const { pageIndex, pageSize, isTemplate, title } = ctx.query;
    const findCondition = {
      user: ctx.state.user._id,
      ...(title && { title: { $regex: title, $options: "i" } }),
      ...(isTemplate && { isTemplate: !!parseInt(isTemplate) }),
    };
    const listCondition: IndexCondition = {
      select: "id author copiedCount coverImg desc title user isHot createdAt",
      populate: { path: "user", select: "username nickName picture" },
      find: findCondition,
      ...(pageIndex && { pageIndex: parseInt(pageIndex) }),
      ...(pageSize && { pageSize: parseInt(pageSize) }),
    };
    const res = await ctx.service.work.getList(listCondition);
    ctx.helper.success({ ctx, res });
  }

  @checkPermission("Work", "workNoPermissionFail")
  async getMyWork() {
    const { ctx } = this;
    const { id } = ctx.params;
    const res = await this.ctx.model.Work.findOne({ id }).lean();
    ctx.helper.success({ ctx, res });
  }

  async template() {
    const { ctx } = this;
    const { id } = ctx.params;
    const res = await this.ctx.model.Work.findOne({ id }).lean();
    console.log(res, "res");
    if (!res || !res.isTemplate) {
      return ctx.helper.error({ ctx, type: "workNoPublicFail" });
    }
    ctx.helper.success({ ctx, res });
  }

  async templateList() {
    const { ctx } = this;
    const { pageIndex, pageSize } = ctx.query;

    const listCondition: IndexCondition = {
      select: "id author copiedCount coverImg desc title user isHot createdAt",
      populate: { path: "user", select: "username nickName picture" },
      find: {
        // isPublic: true,
        isTemplate: true,
      },
      ...(pageIndex && { pageIndex: parseInt(pageIndex) }),
      ...(pageSize && { pageSize: parseInt(pageSize) }),
    };
    const res = await ctx.service.work.getList(listCondition);
    ctx.helper.success({ ctx, res });
  }

  @checkPermission("Work", "workNoPermissionFail")
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;

    const payload = ctx.request.body;
    const res = await ctx.model.Work.findOneAndUpdate({ id }, payload, {
      new: true,
    }).lean();
    ctx.helper.success({ ctx, res });
  }

  @checkPermission("Work", "workNoPermissionFail")
  async delete() {
    const { ctx } = this;
    const { id } = ctx.params;

    const res = await ctx.model.Work.findOneAndDelete({ id })
      .select("_id id title")
      .lean();
    ctx.helper.success({ ctx, res });
  }

  @checkPermission("Work", "workNoPermissionFail", { action: "publish" })
  async publish(isTemplate: boolean) {
    const { ctx, service } = this;
    const url = await service.work.publish(ctx.params.id, isTemplate);
    ctx.helper.success({ ctx, res: { url } });
  }

  async publishWork() {
    await this.publish(false);
  }

  async publishTemplate() {
    await this.publish(true);
  }
}
