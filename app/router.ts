import { Application } from "egg";

export default (app: Application) => {
  const { router, controller } = app;

  router.prefix("/api");
  router.get("/", controller.test.index);
  router.post("/users/create", controller.user.createByEmail);
  router.get("/users/info", controller.user.getUserInfo);
  router.post("/users/loginByEmail", controller.user.loginByEmail);
  router.post("/users/genVeriCode", controller.user.sendVericode);
  router.post("/users/loginByCellphone", controller.user.loginByCellphone);
  router.get("/users/passport/gitee", controller.user.oauth);
  router.get("/users/passport/gitee/callback", controller.user.oauthByGitee);

  router.post("/works", controller.work.createWork);
  router.get("/works", controller.work.myList);
  router.get("/works/:id", controller.work.getMyWork);

  router.patch("/works/:id", controller.work.update);
  router.delete("/works/:id", controller.work.delete);
  router.post("/works/publish/:id", controller.work.publishWork);
  router.post("/works/publish-template/:id", controller.work.publishTemplate);

  router.post("/channels", controller.work.createChannel);
  router.get("/channels/getWorkChannels/:id", controller.work.getWorkChannels);
  router.patch("/channels/updateName/:id", controller.work.updateChannelName);
  router.delete("/channels/:id", controller.work.deleteChannel);

  router.get("/templates", controller.work.templateList);

  router.post("/utils/upload", controller.utils.uploadMutipleFiles);

  router.get("/pages/:idAndUuid", controller.utils.renderH5Page);
};
