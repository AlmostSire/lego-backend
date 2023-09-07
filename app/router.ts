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

  router.post("/works", controller.work.createWork);
  router.get("/works", controller.work.myList);
  router.patch("/works/:id", controller.work.update);
  router.delete("/works/:id", controller.work.delete);
  router.post("/works/publish/:id", controller.work.publishWork);

  router.get("/templates", controller.work.templateList);
  router.post("/templates/publish/:id", controller.work.publishTemplate);

  router.post("/utils/upload", controller.utils.uploadMutipleFiles);

  router.get("/pages/:idAndUuid", controller.utils.renderH5Page);
};
