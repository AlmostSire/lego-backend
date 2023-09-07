import { Application } from "egg";

export default (app: Application) => {
  const { router, controller } = app;

  router.prefix("/api");

  router.post("/users/create", controller.user.createByEmail);
  router.get("/users/info", controller.user.getUserInfo);
  router.post("/users/loginByEmail", controller.user.loginByEmail);
  router.post("/users/genVeriCode", controller.user.sendVericode);
  router.post("/users/loginByCellphone", controller.user.loginByCellphone);
  router.get("/users/passport/gitee", controller.user.oauth);
  router.get("/users/passport/gitee/callback", controller.user.oauthByGitee);

  router.post("/works", app.jwt as any, controller.work.createWork);
  router.get("/works", app.jwt as any, controller.work.myList);
  router.patch("/works/:id", app.jwt as any, controller.work.update);
  router.delete("/works/:id", app.jwt as any, controller.work.delete);
  router.post(
    "/works/publish/:id",
    app.jwt as any,
    controller.work.publishWork
  );

  router.get("/templates", controller.work.templateList);
  router.post(
    "/templates/publish/:id",
    app.jwt as any,
    controller.work.publishTemplate
  );

  router.post("/utils/upload", controller.utils.uploadMutipleFiles);
};
