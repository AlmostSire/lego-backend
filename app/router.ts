import { Application } from "egg";

export default (app: Application) => {
  const { router, controller } = app;

  router.post("/api/users/create", controller.user.createByEmail);
  router.get("/api/users/:id", controller.user.getUserInfo);
};
