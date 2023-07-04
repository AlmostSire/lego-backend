import { Controller } from "egg";

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { query, body } = ctx.request;
    const { baseUrl } = ctx.app.config;
    //const res = await this.app.axiosInstance.get('/api/breeds/image/random');
    const persons = await ctx.service.dog.showPlayers();
    console.log("result", persons);
    //console.log('axios', res.data);
    const resp = {
      query,
      id,
      body,
      baseUrl,
      persons,
      mongooseId: ctx.app.mongoose,
    };

    ctx.helper.success({ ctx, res: resp });
  }

  async getDog() {
    const { ctx, service } = this;
    const resp = await service.dog.show();

    await ctx.render("test.nj", { url: resp.message });
  }
}

export default HomeController;
