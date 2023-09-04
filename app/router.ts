import { Application } from "egg";

export default (app: Application) => {
  const { router, controller } = app;

  router.post("/api/users/create", controller.user.createByEmail);
  router.get("/api/users/:id", app.jwt as any, controller.user.getUserInfo);
  router.post("/api/users/loginByEmail", controller.user.loginByEmail);
};
