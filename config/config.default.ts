import { EggAppConfig, EggAppInfo, PowerPartial } from "egg";
import { config } from "dotenv";
import { join } from "path";

config();

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_1686654480493_3280";

  // add your middleware config here
  // config.middleware = ["customError"];

  // 本地开发关闭 csrf 限制
  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: ["http://localhost:8080"],
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
    secret: process.env.JWT_SECRET,
    enable: true,
    match: [
      "/api/users/info",
      "/api/works",
      "/api/utils/upload",
      "/api/channels",
    ],
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

  // 设置文件上传配置
  config.multipart = {
    // mode: "file",
    // tmpdir: join(appInfo.baseDir, "uploads"),
    whitelist: [".png", ".jpg", "gif", ".webp"],
    fileSize: "100kb",
  };

  config.static = {
    dir: [
      { prefix: "/public", dir: join(appInfo.baseDir, "app/public") },
      { prefix: "/uploads", dir: join(appInfo.baseDir, "uploads") },
    ],
  };

  config.oss = {
    client: {
      accessKeyId: process.env.ALC_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALC_ACCESS_KEY_SECRET,
      bucket: "almost-backend",
      endpoint: "oss-cn-shanghai.aliyuncs.com",
    },
  };

  const aliCloudConfig = {
    accessKeyId: process.env.ALC_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALC_ACCESS_KEY_SECRET,
    endpoint: "dysmsapi.aliyuncs.com",
  };

  const giteeOauthConfig = {
    cid: process.env.GITEE_CID,
    secret: process.env.GITEE_SECRET,
    redirectURL: "http://localhost:7001/api/users/passport/gitee/callback",
    authURL: "https://gitee.com/oauth/token?grant_type=authorization_code",
    giteeUserAPI: "https://gitee.com/api/v5/user",
  };

  // 业务逻辑配置信息
  const bizConfig = {
    baseUrl: "default.url",
    myLogger: {
      allowedMethod: ["POST"],
    },
    aliCloudConfig,
    giteeOauthConfig,
    H5BaseURL: "http://localhost:7001/api/pages",
    jwtExpires: "1h",
  };

  return {
    ...(config as {}),
    ...bizConfig,
  };
};
