import { Controller } from "egg";
import sharp from "sharp";
import { parse, join, extname } from "path";
import { nanoid } from "nanoid";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import sendToWormhole from "stream-wormhole";
import busboy from "busboy";
import { MultipartFileStream } from "egg-multipart";
export default class UtilsController extends Controller {
  splitIdAndUuid(str = "") {
    const result = { id: "", uuid: "" };
    if (!str) return result;
    const firstDashIndex = str.indexOf("-");
    if (firstDashIndex < 0) return result;
    result.id = str.slice(0, firstDashIndex);
    result.uuid = str.slice(firstDashIndex + 1);
    return result;
  }
  async renderH5Page() {
    const { ctx } = this;
    const { idAndUuid } = ctx.params;
    const query = this.splitIdAndUuid(idAndUuid);
    try {
      const pageData = await this.service.utils.renderToPageData(query);
      await ctx.render("page.nj", pageData);
    } catch (e) {
      ctx.helper.error({ ctx, type: "h5WorkNotExistError" });
    }
  }
  async fileLocalUpload() {
    const { ctx, app } = this;
    const { filepath } = ctx.request.files[0];
    // 生成 sharp 实例
    const imageSource = sharp(filepath);
    const metaData = await imageSource.metadata();
    app.logger.debug(metaData);
    let thumbnailUrl = "";
    // 检查图片宽度是否大于300
    if (metaData.width && metaData.width > 300) {
      // generate a new file path
      const { name, ext, dir } = parse(filepath);
      app.logger.debug(name, ext, dir);
      const thumbnailFilePath = join(dir, `${name}-thumbnail${ext}`);
      await imageSource.resize({ width: 300 }).toFile(thumbnailFilePath);
      thumbnailUrl = thumbnailFilePath.replace(
        app.config.baseDir,
        app.config.baseUrl
      );
    }
    const url = filepath.replace(app.config.baseDir, app.config.baseUrl);
    ctx.helper.success({
      ctx,
      res: { url, thumbnailUrl: thumbnailUrl || url },
    });
  }

  pathToURL(path: string) {
    const { baseDir, baseUrl } = this.app.config;
    return path.replace(baseDir, baseUrl);
  }

  async fileUploadByStream() {
    const { ctx, app } = this;
    const stream = await this.ctx.getFileStream();
    // uploads/***.ext
    // uploads/xxx_thumbnail.ext
    const uid = nanoid(6);
    const savedFilePath = join(
      app.config.baseDir,
      "uploads",
      uid + extname(stream.filename)
    );
    const savedThumbnailPath = join(
      app.config.baseDir,
      "uploads",
      uid + "_thumbnail" + extname(stream.filename)
    );
    const target = createWriteStream(savedFilePath);
    const target2 = createWriteStream(savedThumbnailPath);
    const savePromise = pipeline(stream, target);
    const transformer = sharp().resize({ width: 300 });
    const thumbnailPromise = pipeline(stream, transformer, target2);
    try {
      await Promise.all([savePromise, thumbnailPromise]);
    } catch (e) {
      return ctx.helper.error({ ctx, type: "imageUploadFail" });
    }
    ctx.helper.success({
      ctx,
      res: {
        url: this.pathToURL(savedFilePath),
        thumbnailUrl: this.pathToURL(savedThumbnailPath),
      },
    });
  }

  async uploadToOSS() {
    const { ctx, app } = this;
    const stream = await ctx.getFileStream();
    // logo-backend /imooc-test/**.ext
    const savedOSSPath = join(
      "almost-test",
      nanoid(6) + extname(stream.filename)
    );
    try {
      const result = await ctx.oss.put(savedOSSPath, stream);
      app.logger.info(result);
      const { name, url } = result;
      ctx.helper.success({ ctx, res: { name, url } });
    } catch (e) {
      await sendToWormhole(stream);
      ctx.helper.error({ ctx, type: "imageUploadFail" });
    }
    // get stream saved to local file
    // file upload to OSS
    // delete local file

    // get stream upload to OSS
  }

  async uploadMutipleFiles() {
    const { ctx, logger, app } = this;
    const parts = ctx.multipart();
    const urls: string[] = [];
    let part: MultipartFileStream | string[];
    while ((part = await parts())) {
      if (Array.isArray(part)) {
        logger.info(part);
      } else {
        try {
          const savedOSSPath = join(
            "almost-test",
            nanoid(6) + extname(part.filename)
          );
          const result = await ctx.oss.put(savedOSSPath, part);
          logger.info(result);
          const { url } = result;
          urls.push(url);
          if (part.truncated) {
            await ctx.oss.delete(savedOSSPath);
            return ctx.helper.error({
              ctx,
              type: "imageUploadFileSizeError",
              error: `Reach fileSize limit ${app.config.multipart.fieldSize}`,
            });
          }
        } catch (e) {
          await sendToWormhole(part);
          ctx.helper.error({ ctx, type: "imageUploadFail" });
        }
      }
    }
    ctx.helper.success({ ctx, res: { urls } });
  }

  async uploadFileUseBusboy() {
    const { ctx, logger, app } = this;
    return new Promise<string[]>((resolve) => {
      const bb = busboy({ headers: ctx.req.headers });
      const results: string[] = [];
      bb.on("file", (name, file, info) => {
        logger.info(name);
        logger.info(file);
        logger.info(info);
        const uid = nanoid(6);
        const savedFilePath = join(
          app.config.baseDir,
          "uploads",
          uid + extname(info.filename)
        );
        file.on("end", () => {
          results.push(savedFilePath);
        });
        file.pipe(createWriteStream(savedFilePath));
      });
      bb.on("field", (name, val) => {
        logger.info(name, val);
      });
      bb.on("finish", () => {
        logger.info("finished");
        resolve(results);
      });
      ctx.req.pipe(bb);
    });
  }

  async testBusboy() {
    const { ctx } = this;
    const res = await this.uploadFileUseBusboy();
    ctx.helper.success({ ctx, res });
  }
}
