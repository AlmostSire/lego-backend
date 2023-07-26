"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import assert from "assert";
//import { join } from "path";
class AppBoot {
    constructor(app) {
        this.app = app;
        // session 使用外部存储
        // app.sessionMap = {};
        // app.sessionStore = {
        //   async get(key) {
        //     app.logger.info('key', key);
        //     return app.sessionMap[key];
        //   },
        //   async set(key, value) {
        //     app.logger.info('key', key);
        //     app.logger.info('value', value);
        //     app.sessionMap[key] = value;
        //   },
        //   async destroy(key) {
        //     delete app.sessionMap[key];
        //   },
        // };
    }
    configWillLoad() {
        // console.log("config", this.app.config.baseUrl);
        // console.log("enable middleware", this.app.config.coreMiddleware);
        // 添加 customError 中间件，确保在 jwt 中间件前面，捕获错误
        this.app.config.coreMiddleware.push('customError');
    }
    async willReady() {
        console.log('enable willReady', this.app.config.coreMiddleware);
        // const dir = join(this.app.config.baseDir, "app/model");
        // this.app.loader.loadToApp(dir, "model", { caseStyle: "upper" });
    }
    async didReady() {
        // const ctx = this.app.createAnonymousContext();
        // const res = await ctx.service.dog.show();
        // console.log("did ready res", res);
        console.log('enable didReady', this.app.middleware);
    }
}
exports.default = AppBoot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsOEJBQThCO0FBQzlCLDhCQUE4QjtBQUU5QixNQUFxQixPQUFPO0lBRTFCLFlBQVksR0FBZ0I7UUFDMUIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixpQkFBaUI7UUFDakIsdUJBQXVCO1FBQ3ZCLHVCQUF1QjtRQUN2QixxQkFBcUI7UUFDckIsbUNBQW1DO1FBQ25DLGtDQUFrQztRQUNsQyxPQUFPO1FBQ1AsNEJBQTRCO1FBQzVCLG1DQUFtQztRQUNuQyx1Q0FBdUM7UUFDdkMsbUNBQW1DO1FBQ25DLE9BQU87UUFDUCx5QkFBeUI7UUFDekIsa0NBQWtDO1FBQ2xDLE9BQU87UUFDUCxLQUFLO0lBQ1AsQ0FBQztJQUNELGNBQWM7UUFDWixrREFBa0Q7UUFDbEQsb0VBQW9FO1FBQ3BFLHdDQUF3QztRQUN4QyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUztRQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDaEUsMERBQTBEO1FBQzFELG1FQUFtRTtJQUNyRSxDQUFDO0lBRUQsS0FBSyxDQUFDLFFBQVE7UUFDWixpREFBaUQ7UUFDakQsNENBQTRDO1FBQzVDLHFDQUFxQztRQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdEQsQ0FBQztDQUNGO0FBeENELDBCQXdDQyJ9