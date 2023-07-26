import { Controller } from 'egg';
import validateInput from '../decorator/inputValidate';
import checkPermission from '../decorator/checkPermission';
import { nanoid } from 'nanoid';

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
  title: 'string',
};
const channelCreateRules = {
  name: 'string',
  workId: 'number',
};

class WorkController extends Controller {
  @validateInput(workCreateRules, 'workValidateFail')
  @checkPermission('Work', 'workNoPermissionFail')
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
      ...(title && { title: { $regex: title, $options: 'i' } }),
      ...(isTemplate && { isTemplate: !!parseInt(isTemplate) }),
    };
    const listCondition: IndexCondition = {
      select: 'id author copiedCount coverImg desc title user isHot createdAt',
      populate: { path: 'user', select: 'username nickName picture' },
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
      select: 'id author copiedCount coverImg desc title user isHot createdAt',
      populate: { path: 'user', select: 'username nickName picture' },
      find: { isTemplate: true, isPublic: true },
      ...(pageIndex && { pageIndex: parseInt(pageIndex) }),
      ...(pageSize && { pageSize: parseInt(pageSize) }),
    };
    const res = await service.work.getList(listCondition);
    ctx.helper.success({ ctx, res });
  }

  @checkPermission('Work', 'workNoPermissionFail')
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const payload = ctx.request.body;
    const res = await ctx.model.Work.findOneAndUpdate({ id }, payload, {
      new: true,
    }).lean();
    ctx.helper.success({ ctx, res });
  }

  @checkPermission('Work', 'workNoPermissionFail')
  async delete() {
    const { ctx } = this;
    const { id } = ctx.params;
    const res = await ctx.model.Work.findOneAndRemove({ id })
      .select('_id id title')
      .lean();
    ctx.helper.success({ ctx, res });
  }

  @checkPermission('Work', 'workNoPermissionFail', { action: 'publish' })
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

  @checkPermission('Work', 'workNoPermissionFail')
  async myWork() {
    const { ctx } = this;
    const { id } = ctx.params;
    const res = await this.ctx.model.Work.findOne({ id }).lean();
    ctx.helper.success({ ctx, res });
  }

  @validateInput(channelCreateRules, 'channelValidateFail')
  @checkPermission(
    { casl: 'Channel', mongoose: 'Work' },
    'workNoPermissionFail',
    { value: { type: 'body', valueKey: 'workId' } }
  )
  async createChannel() {
    const { ctx } = this;
    const { name, workId } = ctx.request.body;
    const newChannel = {
      id: nanoid(6),
      name,
    };
    const res = await ctx.model.Work.findOneAndUpdate(
      { id: workId },
      { $push: { channels: newChannel } }
    );
    if (res) {
      ctx.helper.success({ ctx, res: newChannel });
    } else {
      ctx.helper.error({ ctx, errorType: 'channelOperateFail' });
    }
  }
  @checkPermission(
    { casl: 'Channel', mongoose: 'Work' },
    'workNoPermissionFail'
  )
  async getWorkChannel() {
    const { ctx } = this;
    const { id } = ctx.params;
    const work = await ctx.model.Work.findOne({ id });
    if (work) {
      ctx.helper.success({
        ctx,
        res: { count: work?.channels?.length, list: work.channels },
      });
    }
  }
  @checkPermission(
    { casl: 'Channel', mongoose: 'Work' },
    'workNoPermissionFail',
    { key: 'channels.id' }
  )
  async updateChannelName() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { name } = ctx.request.body;
    const work = await ctx.model.Work.findOneAndUpdate(
      { 'channels.id': id },
      { $set: { 'channels.$.name': name } }
    );
    if (work) {
      ctx.helper.success({ ctx, res: { name } });
    } else {
      ctx.helper.error({ ctx, errorType: 'channelOperateFail' });
    }
  }
  @checkPermission(
    { casl: 'Channel', mongoose: 'Work' },
    'workNoPermissionFail',
    { key: 'channels.id' }
  )
  async deleteChannel() {
    const { ctx } = this;
    const { id } = ctx.params;
    const work = await ctx.model.Work.findOneAndUpdate(
      { 'channels.id': id },
      { $pull: { channels: { id } } },
      { new: true }
    );
    if (work) {
      ctx.helper.success({ ctx, res: work });
    } else {
      ctx.helper.error({ ctx, errorType: 'channelOperateFail' });
    }
  }
}

export default WorkController;
