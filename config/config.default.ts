import { EggAppConfig, EggAppInfo, PowerPartial } from "egg";

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_1686654480493_3280";

  // add your middleware config here
  config.middleware = ["customError"];

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

  // 设置 bcrypt 配置
  config.bcrypt = {
    saltRounds: 10,
  };

  // 设置 jwt 配置
  config.jwt = {
    secret: "1234567890",
  };

  // 设置mongodb地址等
  config.mongoose = {
    url: "mongodb://localhost:27017/lego",
  };

  // 业务逻辑配置信息
  const bizConfig = {
    baseUrl: "default.url",
    myLogger: {
      allowedMethod: ["POST"],
    },
  };

  // 临时关闭 session 加密
  config.session = {
    encrypt: false,
  };

  return {
    ...(config as {}),
    ...bizConfig,
  };
};
