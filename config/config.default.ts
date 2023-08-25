import { EggAppConfig, EggAppInfo, PowerPartial } from "egg";

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_1686654480493_3280";

  // add your middleware config here

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

  const bizConfig = {
    //baseUrl: "default.url",
  };

  return {
    ...(config as {}),
    ...bizConfig,
  };
};
