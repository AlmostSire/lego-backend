import 'egg';
import { Model } from 'mongoose';
import { ClientOptions } from 'oss-client';

declare module 'egg' {
  // 完成对 Model 的重载，获取对应 Model 的类型
  interface MongooseModels extends IModel {
    [key: string]: Model<any>;
  }
  // 完成 bcrypt 对 context 的扩展
  interface Context {
    genHash(plainText: string): Promise<string>;
    compare(plainText: string, hash: string): Promise<boolean>;
  }

  interface EggAppConfig {
    // 完成 bcrypt 对 config 的扩展
    bcrypt: {
      saltRounds: number;
    };
    oss: {
      client?: ClientOptions;
    };
  }

  // session 外部储存扩展
  interface Application {
    sessionMap: {
      [key: string]: any;
    };
    sessionStore: any;
  }
}
