import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import { config } from 'dotenv';

config();

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1686654480493_3280';

  // add your middleware config here
  // config.middleware = ['customError'];

  config.view = {
    defaultViewEngine: 'nunjucks',
  };

  config.jwt = {
    enable: true,
    secret: process.env.JWT_SECRET || '',
    match: [
      '/api/users/getUserInfo',
      '/api/works',
      '/api/utils/upload-img',
      '/api/channels',
    ],
  };

  // config.cors = {
  //   origin: 'http://localhost:8080',
  //   allowMethods: 'GET,HEAD,PUT,OPTIONS,POST,DELETE,PATCH',
  // };

  config.oss = {
    client: {
      accessKeyId: process.env.ALC_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.ALC_ACCESS_KEY_SECRET || '',
      bucket: 'almost-backend',
      endpoint: 'oss-cn-shanghai.aliyuncs.com',
    },
  };

  config.multipart = {
    whitelist: ['.png', '.jpg', '.git', '.webp'],
    fileSize: '100kb',
  };

  const aliCloudConfig = {
    accessKeyId: process.env.ALC_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALC_ACCESS_KEY_SECRET,
    endpoint: 'dysmsapi.aliyuncs.com',
  };

  const giteeOauthConfig = {
    cid: process.env.GITEE_CID,
    secret: process.env.GITEE_SECRET,
    redirecURL: 'http://localhost:7001/api/users/passport/gitee/callback',
    authURL: 'https://gitee.com/oauth/token?grant_type=authorization_code',
    giteeUserAPI: 'https://gitee.com/api/v5/user',
  };

  const bizConfig = {
    baseUrl: 'http://localhost:7001',
    aliCloudConfig,
    giteeOauthConfig,
    H5BaseURL: 'http://localhost:7001/api/pages',
  };

  return {
    ...(config as {}),
    ...bizConfig,
  };
};
