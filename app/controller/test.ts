import { Controller } from "egg";

export default class TestController extends Controller {
  async index() {
    const { ctx } = this;
    const { query, body } = ctx.request;
    const { id } = ctx.params;
    ctx.body = {
      query,
      id,
      body,
    };
    ctx.status = 200;
  }

  async show() {
    const { ctx, service } = this;
    const resp = await service.dog.show();
    await ctx.render("test.nj", { url: resp.message });
  }
}
