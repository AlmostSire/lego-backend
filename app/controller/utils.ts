import { Controller, FileStream } from 'egg';
// import sharp from 'sharp';
import { join, extname } from 'path';
import { nanoid } from 'nanoid';
import { createWriteStream } from 'fs';
// import { pipeline } from 'stream/promises';
import sendToWormhole from 'stream-wormhole';
import busboy from 'busboy';

export default class UtilsController extends Controller {
  // async fileLocalUpload() {
  //   const { ctx, app } = this;
  //   const { filepath } = ctx.request.files[0];
  //   // 生成 sharp 实例
  //   const imageSource = sharp(filepath);
  //   // 获取文件信息
  //   const metaData = await imageSource.metadata();
  //   app.logger.debug(metaData);

  //   let thumbnailUrl = '';
  //   // // 检查图片宽度是否大于 300
  //   if (metaData.width && metaData.width > 300) {
  //     // generate a new file path
  //     // /uploads/**/abc.png -> /uploads/**/abc-thumbnail.png
  //     const { name, ext, dir } = parse(filepath);
  //     app.logger.debug(name, ext, dir);
  //     const thumbnaiFilePath = join(dir, `${name}-thumbnail${ext}`);
  //     await imageSource.resize({ width: 300 }).toFile(thumbnaiFilePath);
  //     thumbnailUrl = this.pathToUrl(thumbnaiFilePath);
  //   }
  //   const url = this.pathToUrl(filepath);
  //   ctx.helper.success({
  //     ctx,
  //     res: { url, thumbnailUrl: thumbnailUrl || url },
  //   });
  // }

  pathToUrl(path: string) {
    const { app } = this;
    return path.replace(app.config.baseDir, app.config.baseUrl);
  }
  // async fileUploadByStream() {
  //   const { ctx, app } = this;
  //   // 获取文件可读流
  //   const stream = await ctx.getFileStream();
  //   // 生成文件保存路径
  //   // uploads/***.ext
  //   // uploads/***-thumbnail.ext
  //   const uuid = nanoid(6);
  //   const savedFilePath = join(
  //     app.config.baseDir,
  //     'uploads',
  //     uuid + extname(stream.filename)
  //   );
  //   const savedThumbnailFilePath = join(
  //     app.config.baseDir,
  //     'uploads',
  //     uuid + '_thumbnail' + extname(stream.filename)
  //   );
  //   // 创建可写流
  //   const target = createWriteStream(savedFilePath);
  //   const target2 = createWriteStream(savedThumbnailFilePath);

  //   const savedPromise = pipeline(stream, target);
  //   // 创建转化流
  //   const transformer = sharp().resize({ width: 300 });
  //   const thumbnailPromise = pipeline(stream, transformer, target2);

  //   try {
  //     await Promise.all([savedPromise, thumbnailPromise]);
  //   } catch (error) {
  //     return ctx.helper.error({ ctx, errorType: 'imageUploadFail' });
  //   }

  //   ctx.helper.success({
  //     ctx,
  //     res: {
  //       url: this.pathToUrl(savedFilePath),
  //       thumbnailUrl: this.pathToUrl(savedThumbnailFilePath),
  //     },
  //   });
  // }
  async uploadToOSS() {
    const { ctx, app } = this;
    const stream = await ctx.getFileStream();
    const savedOSSPath = join(
      'almost-test',
      nanoid(6) + extname(stream.filename)
    );
    try {
      const result = await ctx.oss.put(savedOSSPath, stream);
      app.logger.info(result);
      const { name, url } = result;
      ctx.helper.success({ ctx, res: { name, url } });
    } catch (e) {
      await sendToWormhole(stream);
      ctx.helper.error({ ctx, errorType: 'imageUploadFail' });
    }
  }

  async uploadMutipleFiles() {
    const { ctx, app } = this;
    const { fileSize } = app.config.multipart;
    const parts = ctx.multipart({ limits: { fileSize: fileSize as number } });
    const urls: string[] = [];
    let part: FileStream | string[];
    while ((part = await parts())) {
      if (Array.isArray(part)) {
        app.logger.info(part);
      } else {
        try {
          const savedOSSPath = join(
            'almost-test',
            nanoid(6) + extname(part.filename)
          );
          const { url } = await ctx.oss.put(savedOSSPath, part);
          urls.push(url);
          //
          if (part.truncated) {
            await ctx.oss.delete(savedOSSPath);
            return ctx.helper.error({
              ctx,
              errorType: 'imageUploadFileSizeError',
              error: `Reach fileSize limit ${fileSize} bytes`,
            });
          }
        } catch (e) {
          await sendToWormhole(part);
          return ctx.helper.error({ ctx, errorType: 'imageUploadFail' });
        }
      }
    }
    ctx.helper.success({ ctx, res: urls });
  }
  uploadFileUseBusboy() {
    const { ctx, app } = this;
    return new Promise<string[]>((resolve, reject) => {
      const bb = busboy({ headers: ctx.req.headers });
      const results: string[] = [];
      bb.on('file', (fieldname, file, info) => {
        app.logger.info(fieldname, file, info);
        const { filename } = info;
        const uid = nanoid(6);
        const savedFilePath = join(
          app.config.baseDir,
          'uploads',
          uid + extname(filename)
        );
        file.pipe(createWriteStream(savedFilePath));
        file.on('end', () => {
          results.push(savedFilePath);
        });
      });
      bb.on('field', (name, value) => {
        app.logger.info(name, value);
      });
      bb.on('finish', () => {
        app.logger.info('finish');
        resolve(results);
      });
      bb.on('error', (e) => {
        reject(e);
      });
      ctx.req.pipe(bb);
    });
  }
  async testBusboy() {
    const { ctx } = this;
    const results = await this.uploadFileUseBusboy();
    ctx.helper.success({ ctx, res: results });
  }

  splitIdAndUuid(str = '') {
    const result: { id: number; uuid: string } = { id: -1, uuid: '' };
    if (!str) return result;
    const firstDashIndex = str.indexOf('-');
    if (firstDashIndex < 0) return result;
    result.id = parseInt(str.slice(0, firstDashIndex));
    result.uuid = str.slice(firstDashIndex + 1);
    return result;
  }

  async renderH5Page() {
    const { ctx, service } = this;
    const { idAndUuid } = ctx.params;
    const query = this.splitIdAndUuid(idAndUuid);
    try {
      const pageData = await service.utils.renderToPageData(query);
      await ctx.render('page.nj', pageData);
    } catch (e) {
      ctx.helper.error({ ctx, errorType: 'h5WorkNotExistError' });
    }

    // const vueApp = createSSRApp({
    //   data: () => ({
    //     msg: "hello world",
    //   }),
    //   template: `<h1>{{ msg }}</h1>`,
    // });
    // 生成html字符串
    // const appContent = await renderToString(vueApp);
    // ctx.type = "text/html";
    // ctx.body = appContent;
    // 生成可读流
    // const stream = renderToNodeStream(vueApp);
    // ctx.status = 200;
    // await pipeline(stream, ctx.res);
  }
}
