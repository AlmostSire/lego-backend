import { EggAppConfig, PowerPartial, EggAppInfo } from 'egg';
import { join } from 'path';

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {};

  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: ['http://localhost:8080'],
  };

  config.mongoose = {
    url: 'mongodb://localhost:27017/lego',
  };

  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0,
    },
  };

  config.bcrypt = {
    saltRounds: 10,
  };

  // config.session = {
  //   encrypt: false,
  // };

  config.logger = {
    consoleLevel: 'DEBUG',
  };

  // config.multipart = {
  //   mode: 'file',
  //   tmpdir: join(appInfo.baseDir, 'uploads'),
  // };

  config.static = {
    dir: [
      { prefix: '/public', dir: join(appInfo.baseDir, 'app/public') },
      { prefix: '/uploads', dir: join(appInfo.baseDir, 'uploads') },
    ],
  };
  config.jwtExpires = '2h';

  return config;
};
