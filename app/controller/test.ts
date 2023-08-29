import { Controller } from "egg";

export default class TestController extends Controller {
  async index() {
    const { ctx, app } = this;
    const { query, body } = ctx.request;
    const { id } = ctx.params;
    const { baseUrl } = app.config;
    const resp = await app.axiosInstance.get("/api/breeds/image/random");
    // None Debug Info Warnnig Error
    ctx.logger.debug("debug info");
    ctx.logger.info("res data", resp.data);
    ctx.logger.warn("warnning");
    ctx.logger.error(new Error("whoops"));
    const res = {
      query,
      id,
      body,
      baseUrl,
    };
    ctx.helper.success({ ctx, res });
  }

  async show() {
    const { ctx, service } = this;
    const resp = await service.dog.show();
    await ctx.render("test.nj", { url: resp.message });
  }
}
