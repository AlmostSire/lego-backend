import { Application } from "egg";

export default (app: Application) => {
  const { router, controller } = app;

  router.post("/api/users/create", controller.user.createByEmail);
  router.get("/api/users/:id", app.jwt as any, controller.user.getUserInfo);
  router.post("/api/users/loginByEmail", controller.user.loginByEmail);
  router.post("/api/users/genVeriCode", controller.user.sendVericode);
  router.post("/api/users/loginByCellphone", controller.user.loginByCellphone);
  router.get("/api/users/passport/gitee", controller.user.oauth);
  router.get(
    "/api/users/passport/gitee/callback",
    controller.user.oauthByGitee
  );

  router.post("/api/works", app.jwt as any, controller.work.createWork);
  router.get("/api/works", app.jwt as any, controller.work.myList);
  router.patch("/api/works/:id", app.jwt as any, controller.work.update);
  router.delete("/api/works/:id", app.jwt as any, controller.work.delete);
  router.post(
    "/api/works/publish/:id",
    app.jwt as any,
    controller.work.publishWork
  );

  router.get("/api/templates", controller.work.templateList);
  router.post(
    "/api/templates/publish/:id",
    app.jwt as any,
    controller.work.publishTemplate
  );

  router.post("/api/utils/upload", controller.utils.fileLocalUpload);
};
