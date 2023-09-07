import { Model } from "mongoose";
import { ClientOptions } from "oss-client";

declare module "egg" {
  interface MongooseModels extends IModel {
    [key: string]: Model<any>;
  }

  interface Context {
    genHash(plainText: stirng): Promise<string>;
    compare(plainText: string, hash: string): Promise<boolean>;
  }

  interface EggAppConfig {
    bcrypt: {
      saltRounds: number;
    };
    oss: {
      client: ClientOptions;
    };
  }

  interface Application {
    sessionMap: Record<string, any>;
    sessionStore: any;
  }
}
