declare module "egg" {
  interface MongooseModels extends IModel {}

  interface Context {
    genHash(plainText: stirng): Promise<string>;
    compare(plainText: string, hash: string): Promise<boolean>;
  }

  interface EggAppConfig {
    bcrypt: {
      saltRounds: number;
    };
  }

  interface Application {
    sessionMap: Record<string, any>;
    sessionStore: any;
  }
}
