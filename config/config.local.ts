import { EggAppConfig, PowerPartial, EggAppInfo } from 'egg';
import { join } from 'path';

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {};

  config.security = {
    csrf: {
      enable: false,
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

  config.baseUrl = 'http://localhost:7001';
  return config;
};
