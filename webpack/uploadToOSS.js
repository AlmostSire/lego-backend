const { Client } = require('oss-client');
const dotenv = require('dotenv');
const path = require('path');
const { readdirSync } = require('fs');
// 设置环境变量
dotenv.config();
const publicPath = path.resolve(__dirname, '../app/public');
// 新建一个实例
const client = new Client({
  accessKeyId: process.env.ALC_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.ALC_ACCESS_KEY_SECRET || '',
  bucket: 'almost-backend',
  endpoint: 'oss-cn-shanghai.aliyuncs.com',
});

async function run() {
  // 从文件夹获取对应的文件列表
  const publicFiles = readdirSync(publicPath);
  const files = publicFiles.filter((filename) => filename !== 'page.nj');
  const res = await Promise.all(
    files.map(async (filename) => {
      const savedOSSPath = path.join('h5-assets', filename);
      const filePath = path.join(publicPath, filename);
      return client.put(savedOSSPath, filePath);
    })
  );
  console.log('上传成功', res);
}

run();
