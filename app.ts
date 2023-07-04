import { Application, IBoot } from "egg";
//import assert from "assert";
import { join } from "path";

export default class AppBoot implements IBoot {
  private readonly app: Application;
  constructor(app: Application) {
    this.app = app;
    app.sessionMap = {};
    app.sessionStore = {
      async get(key) {
        app.logger.info("key", key);
        return app.sessionMap[key];
      },
      async set(key, value) {
        app.logger.info("key", key);
        app.logger.info("value", value);
        app.sessionMap[key] = value;
      },
      async destroy(key) {
        delete app.sessionMap[key];
      },
    };
  }
  configWillLoad() {
    console.log("config", this.app.config.baseUrl);
    console.log("enable middleware", this.app.config.coreMiddleware);
    this.app.config.coreMiddleware.unshift("myLogger");
  }

  async willReady() {
    console.log("enable willReady", this.app.config.coreMiddleware);
    const dir = join(this.app.config.baseDir, "app/model");
    this.app.loader.loadToApp(dir, "model", { caseStyle: "upper" });
  }

  async didReady() {
    const ctx = this.app.createAnonymousContext();
    const res = await ctx.service.dog.show();
    console.log("did ready res", res);
    console.log("enable didReady", this.app.middleware);
  }
}
