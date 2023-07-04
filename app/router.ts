import { Application } from "egg";

export default (app: Application) => {
  const logger = app.middleware.myLogger(
    {
      allowedMethod: ["GET"],
    },
    app
  );
  const { router, controller } = app;
  router.get("/test/:id", controller.home.index);
  router.get("/dog", logger, controller.home.getDog);
  router.post("/api/users/create", controller.user.createByEmail);
  router.get("/api/users/current", controller.user.show);
  router.post("/api/users/login", controller.user.loginByEmail);
};
