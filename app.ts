import { Application, IBoot } from "egg";

export default class AppBoot implements IBoot {
  private readonly app: Application;
  constructor(app: Application) {
    this.app = app;
    app.sessionMap = {};
    app.sessionStore = {
      async get(key: string) {
        app.logger.info("key", key);
        return app.sessionMap[key];
      },
      async set(key: string, value: any) {
        app.logger.info("key", key);
        app.logger.info("value", value);
        app.sessionMap[key] = value;
      },
      async destroy(key) {
        delete app.sessionStore[key];
      },
    };
  }
  configWillLoad() {
    // 此时 config 文件已被读取合并，但并未生效
    // 这是应用层修改配置的最后时机
    console.log("config", this.app.config.baseUrl);
    console.log("enable middleware", this.app.config.coreMiddleware);
    this.app.config.coreMiddleware.push("customError");
  }

  async willReady() {
    console.log("enable willReady", this.app.config.coreMiddleware);
  }

  async didReady() {
    console.log("final middleware", this.app.middleware);
  }
}
