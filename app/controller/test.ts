import { Controller } from "egg";

export default class TestController extends Controller {
  async index() {
    const { ctx, app, service } = this;
    const { query, body } = ctx.request;
    const { id } = ctx.params;
    const { baseUrl } = app.config;
    const users = await service.dog.show();
    const res = {
      query,
      id,
      body,
      baseUrl,
      users,
    };
    ctx.helper.success({ ctx, res });
  }

  async show() {
    const { ctx, service } = this;
    const resp = await service.dog.show();
    await ctx.render("test.nj", { url: resp.message });
  }
}
