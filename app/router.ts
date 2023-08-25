import { Application } from "egg";

export default (app: Application) => {
  const { router, controller } = app;
  router.get("/test/:id", controller.test.index);
  router.post("/test/:id", controller.test.index);
  router.get("/dog", controller.test.show);
};
