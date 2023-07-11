import { Controller } from "egg";
import validateInput from "../decorator/inputValidate";
import checkPermission from "../decorator/checkPermission";

export interface IndexCondition {
  pageIndex?: number;
  pageSize?: number;
  select?: string | string[];
  populate?:
    | string
    | {
        path?: string;
        select?: string;
      };
  customSort?: Record<string, any>;
  find?: Record<string, any>;
}

const workCreateRules = {
  title: "string",
};

class WorkController extends Controller {
  @validateInput(workCreateRules, "workValidateFail")
  async createWork() {
    const { ctx, service } = this;
    const workData = await service.work.createEmptyWork(ctx.request.body);
    ctx.helper.success({ ctx, res: workData });
  }

  async myList() {
    const { ctx, service } = this;
    const userId = ctx.state.user._id;
    const { pageIndex, pageSize, isTemplate, title } = ctx.query;
    const findCondition = {
      user: userId,
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
    const res = await service.work.getList(listCondition);
    ctx.helper.success({ ctx, res });
  }
  async templateList() {
    const { ctx, service } = this;
    const { pageIndex, pageSize } = ctx.query;

    const listCondition: IndexCondition = {
      select: "id author copiedCount coverImg desc title user isHot createdAt",
      populate: { path: "user", select: "username nickName picture" },
      find: { isTemplate: true, isPublic: true },
      ...(pageIndex && { pageIndex: parseInt(pageIndex) }),
      ...(pageSize && { pageSize: parseInt(pageSize) }),
    };
    const res = await service.work.getList(listCondition);
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

    const res = await ctx.model.Work.findOneAndUpdate({ id })
      .select("_id id title")
      .lean();
    ctx.helper.success({ ctx, res });
  }

  @checkPermission("Work", "workNoPermissionFail")
  async publish(isTemplate: boolean) {
    const { ctx, service } = this;
    const { id } = ctx.params;

    const url = await service.work.publish(id, isTemplate);
    ctx.helper.success({ ctx, res: { url } });
  }

  async publishWork() {
    await this.publish(false);
  }

  async publishTemplate() {
    await this.publish(true);
  }
}

export default WorkController;
