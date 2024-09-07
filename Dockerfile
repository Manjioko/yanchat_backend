# 使用官方的Node.js镜像作为基础镜像
# FROM node:16-alpine
FROM oven/bun:latest

# 安装 pm2 用于启动应用程序
# RUN npm install bun -g
# RUN npm install pm2 -g

# 设置工作目录
WORKDIR /app

# 将项目文件复制到容器中的工作目录
COPY . .

# 安装项目依赖
RUN bun install

# 暴露应用程序的端口
EXPOSE 9999

# 启动应用程序 这样会占用终端
# CMD ["pm2", "start", "index.js", "-i", "1","--no-daemon", "--name", "yanchat"]

# 启动应用程序 这样不会占用终端
# CMD ["pm2-runtime", "start", "index.js", "-i", "1", "--name", "yanchat"]
ENTRYPOINT [ "bun", "run", "--watch", "index.js" ]
