import { EggAppConfig, EggAppInfo, PowerPartial } from "egg";

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_1686654480493_3280";

  // add your middleware config here
  //config.middleware = ['myLogger'];
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

  const bizConfig = {
    myLogger: {
      allowedMethod: ["GET"],
    },
    baseUrl: "default.url",
  };

  return {
    ...(config as {}),
    ...bizConfig,
  };
};
