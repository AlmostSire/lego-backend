import { EggAppConfig, EggAppInfo, PowerPartial } from "egg";
import { config } from "dotenv";

config();

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

  // 设置 redis 配置
  config.redis = {
    client: {
      port: 6379,
      host: "127.0.0.1",
      password: "",
      db: 0,
    },
  };

  // 临时关闭 session 加密
  config.session = {
    encrypt: false,
  };

  const aliCloudConfig = {
    accessKeyId: process.env.ALC_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALC_ACCESS_KEY_SECRET,
    endpoint: "dysmsapi.aliyuncs.com",
  };

  // 业务逻辑配置信息
  const bizConfig = {
    baseUrl: "default.url",
    myLogger: {
      allowedMethod: ["POST"],
    },
    aliCloudConfig,
  };

  return {
    ...(config as {}),
    ...bizConfig,
  };
};
