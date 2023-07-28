# 指定基础镜像 从 node16 构建
FROM node:16
# 创建对应的文件夹，作为项目运行的位置
RUN mkdir -p /usr/src/app
# 指定工作区，后面的运行任何命令都在这个工作区中完成
WORKDIR /usr/src/app
# 从本地拷贝对应的文件到工作区
COPY . /usr/src/app/
RUN npm install --registry=https://registry.npmmirror.com
RUN npm run tsc
# 告知当前 Docker image 暴露的是 7001 端口
EXPOSE 7001
# 执行启动命令，一个 Dockerfile 只能有一个
CMD npx egg-scripts start --title=lego-backend