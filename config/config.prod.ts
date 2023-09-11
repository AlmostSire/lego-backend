import { EggAppConfig, PowerPartial } from "egg";

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  config.baseUrl = "prod.url";
  // 给 mongoDB 和 redis 添加密码

  config.redis = {
    client: {
      port: 6379,
      host: "lego-redis",
      password: process.env.REDIS_PASSWORD,
    },
  };

  config.mongoose = {
    url: "mongodb://lego-mongo:27017/lego",
    options: {
      user: process.env.MONGO_DB_USERNAME,
      pass: process.env.MONGO_DB_PASSWORD,
      useUnifiedTopology: true,
    },
  };

  // 2 配置 cors 允许的域名
  config.security = {
    domainWhiteList: ["https://imooc-lego.com", "https://www.imooc-lego.com"],
  };

  // 3 配置对应的 jwt 过期时间
  config.jwtExpires = "2 days";

  // 4 本地的 URL 替换
  config.giteeOauthConfig = {
    redirectURL: "http://api.imooc-lego.com/api/users/passport/gitee/callback",
  };
  config.H5BaseURL = "https://h5.imooc-lego.com";
  return config;
};
