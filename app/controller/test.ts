import { Controller } from "egg";
import { version as appVersion } from "../../package.json";

export default class TestController extends Controller {
  async index() {
    const { ctx, app } = this;

    const { status } = app.redis;
    const { version } = await app.mongoose.connection.db.command({
      buildInfo: 1,
    });

    ctx.helper.success({
      ctx,
      res: {
        dbVersion: version,
        redisStatus: status,
        appVersion,
        env: process.env.PING_ENV,
      },
    });
  }
}
