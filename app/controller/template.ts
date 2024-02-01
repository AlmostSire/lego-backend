import { Controller } from "egg";
import { TemplateProps } from "../model/template";

export default class ProjectController extends Controller {
  // async createProject () {
  //   const { ctx, app } = this;
  //   const { name, pkgName, version } = ctx.request.body;
  //   const project = await ctx.model
  // }
  async getProjectTemplates() {
    const { ctx } = this;
    const projectTemplates: TemplateProps[] = [
      {
        name: "vue2标准模版",
        pkgName: "almost-cli-template-vue2",
        version: "1.0.2",
        tag: "project",
        type: "normal",
        installCmd: "npm install",
        startCmd: "npm run dev",
      },
      {
        name: "vue3标准模版",
        pkgName: "almost-cli-template-vue3",
        version: "1.0.3",
        tag: "project",
        type: "normal",
        installCmd: "npm install",
        startCmd: "npm run dev",
      },
      {
        name: "lego组件库模版",
        pkgName: "almost-cli-lego-components",
        version: "1.0.2",
        tag: "component",
        type: "normal",
        installCmd: "npm install",
        startCmd: "npm run serve",
        ignore: ["**/public/**", "**.png"],
      },
      {
        name: "自定义vue2模版",
        pkgName: "almost-cli-template-custom-vue2",
        version: "1.0.4",
        tag: "project",
        type: "custom",
        installCmd: "npm install",
        startCmd: "npm run serve",
        ignore: ["**/public/**", "**.png"],
      },
    ];
    ctx.helper.success({
      ctx,
      res: projectTemplates,
    });
  }

  async getSectionTemplates() {
    const { ctx } = this;
    const sectionTemplates: TemplateProps[] = [
      {
        name: "Vue2代码片段1",
        pkgName: "imooc-cli-dev-template-section-vue2",
        version: "1.0.0",
        targetPath: "./",
      },
      {
        name: "Vue2代码片段2",
        pkgName: "almost-cli-template-section-vue2",
        version: "1.0.0",
        targetPath: "src/",
      },
    ];
    ctx.helper.success({
      ctx,
      res: sectionTemplates,
    });
  }

  async getPageTemplates() {
    const { ctx } = this;
    const pageTemplates: TemplateProps[] = [
      {
        name: "Vue2页面模版",
        pkgName: "almost-cli-template-page-vue2",
        version: "1.0.0",
        targetPath: "src/views/Home",
        ignore: ["assets/**"],
        type: "normal",
      },
      {
        name: "Vue2页面模版(自定义)",
        pkgName: "almost-cli-template-page-custom-vue2",
        version: "1.0.0",
        targetPath: "src/views/Home",
        ignore: ["assets/**"],
        type: "custom",
      },
    ];
    ctx.helper.success({
      ctx,
      res: pageTemplates,
    });
  }
}
