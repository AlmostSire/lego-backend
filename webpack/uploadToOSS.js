const { Client } = require("oss-client");
const { config } = require("dotenv");
const path = require("path");
const fs = require("fs");

const publicPath = path.resolve(__dirname, "../app/public");
// 设置环境变量
config();
// 新建一个实例
const client = new Client({
  accessKeyId: process.env.ALC_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALC_ACCESS_KEY_SECRET,
  bucket: "almost-backend",
  endpoint: "oss-cn-shanghai.aliyuncs.com",
});

async function run() {
  // 从文件夹获取对应的文件列表;
  const publicFiles = fs.readdirSync(publicPath);
  const files = publicFiles.filter((f) => f !== "page.nj");
  const res = await Promise.all(
    files.map(async (filename) => {
      const savedOSSPath = path.join("h5-assets", filename);
      const filePath = path.join(publicPath, filename);
      const result = await client.put(savedOSSPath, filePath);
      return result.url;
    })
  );
  console.log("上传成功", res);
}

run();
