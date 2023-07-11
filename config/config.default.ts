import { EggAppConfig, EggAppInfo, PowerPartial } from "egg";
import { config } from "dotenv";

config();

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_1686654480493_3280";

  // add your middleware config here
  config.middleware = ["customError"];

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.mongoose = {
    url: "mongodb://localhost:27017/lego",
  };

  config.session = {
    encrypt: false,
  };

  config.bcrypt = {
    saltRounds: 10,
  };

  config.view = {
    defaultViewEngine: "nunjucks",
  };

  config.jwt = {
    secret: "1234567890",
  };

  config.redis = {
    client: {
      port: 6379,
      host: "127.0.0.1",
      password: "",
      db: 0,
    },
  };

  config.cors = {
    origin: "http://localhost:8080",
    allowMethods: "GET,HEAD,PUT,OPTIONS,POST,DELETE,PATCH",
  };

  const aliCloudConfig = {
    accessKeyId: process.env.accessKeyId,
    accessKeySecret: process.env.accessKeySecret,
    endpoint: "dysmsapi.aliyuncs.com",
  };

  // gitee oauth config
  const giteeOauthConfig = {
    cid: process.env.GITEE_CID,
    secret: process.env.GITEE_SECRET,
    redirecURL: "http://localhost:7001/api/users/passport/gitee/callback",
    authURL: "https://gitee.com/oauth/token?grant_type=authorization_code",
    giteeUserAPI: "https://gitee.com/api/v5/user",
  };

  const bizConfig = {
    aliCloudConfig,
    giteeOauthConfig,
    H5BaseURL: "http://localhost:7001/api/pages",
  };

  return {
    ...(config as {}),
    ...bizConfig,
  };
};
