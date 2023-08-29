import { Application } from "egg";

export default (app: Application) => {
  const { router, controller, middleware } = app;
  // 在特定路由使用中间件
  const myLogger = middleware.myLogger(
    {
      allowedMethod: ["GET"],
    },
    app
  );
  router.get("/test/:id", controller.test.index);
  router.post("/test/:id", controller.test.index);
  router.get("/dog", myLogger, controller.test.show);
};
