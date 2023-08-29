import { Application, IBoot } from "egg";
//import assert from "assert";
// import { join } from "path";

export default class AppBoot implements IBoot {
  private readonly app: Application;
  constructor(app: Application) {
    this.app = app;
  }
  configWillLoad() {
    // 此时 config 文件已被读取合并，但并未生效
    // 这是应用层修改配置的最后时机
    console.log("config", this.app.config.baseUrl);
    console.log("enable middleware", this.app.config.coreMiddleware);
    this.app.config.coreMiddleware.unshift("myLogger");
  }

  async willReady() {
    console.log("enable willReady", this.app.config.coreMiddleware);
  }

  async didReady() {
    const ctx = this.app.createAnonymousContext();
    const res = await ctx.service.dog.show();
    console.log("did ready res", res);
    console.log("final middleware", this.app.middleware);
  }
}
