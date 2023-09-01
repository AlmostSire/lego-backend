import { EggAppConfig, EggAppInfo, PowerPartial } from "egg";

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_1686654480493_3280";

  // add your middleware config here
  // config.middleware = ["myLogger"];

  // 本地开发关闭 csrf 限制
  config.security = {
    csrf: {
      enable: false,
    },
  };

  // 设置模版引擎
  config.view = {
    defaultViewEngine: "nunjucks",
  };

  // 设置日志配置
  config.logger = {
    consoleLevel: "DEBUG",
  };

  config.mongoose = {
    url: "mongodb://localhost:27017/hello",
  };

  // 业务逻辑配置信息
  const bizConfig = {
    baseUrl: "default.url",
    myLogger: {
      allowedMethod: ["POST"],
    },
    // mongoose: {
    //   url: "mongodb://localhost:27017/hello",
    // },
  };

  return {
    ...(config as {}),
    ...bizConfig,
  };
};
