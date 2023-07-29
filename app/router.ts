import { Application } from 'egg';

export default (app: Application) => {
  const { router, controller } = app;

  router.prefix('/api');

  router.get('/ping', controller.home.index);

  router.post('/users/create', controller.user.createByEmail);
  router.get('/users/getUserInfo', controller.user.getUserInfo);
  router.post('/users/loginByEmail', controller.user.loginByEmail);

  router.post('/users/genVeriCode', controller.user.sendVeriCode);
  router.post('/users/loginByPhoneNumber', controller.user.loginByCellphone);

  router.get('/users/passport/gitee', controller.user.oauth);
  router.get('/users/passport/gitee/callback', controller.user.oauthByGitee);

  router.post('/works', controller.work.createWork);
  router.get('/works', controller.work.myList);
  router.get('/works/:id', controller.work.myWork);
  router.get('/templates', controller.work.templateList);
  router.patch('/works/:id', controller.work.update);
  router.delete('/works/:id', controller.work.delete);
  router.post('/works/publishWork/:id', controller.work.publishWork);
  router.post('/works/publishTemplate/:id', controller.work.publishTemplate);

  router.post('/utils/upload-img', controller.utils.uploadMutipleFiles);
  router.get('/pages/:idAndUuid', controller.utils.renderH5Page);

  router.post('/channels', controller.work.createChannel);
  router.get('/channels/:id', controller.work.getWorkChannel);
  router.patch('/channels/:id', controller.work.updateChannelName);
  router.delete('/channels/:id', controller.work.deleteChannel);
};
