# 使用官方的Node.js镜像作为基础镜像
FROM node:16-alpine

RUN npm config set sharp_binary_host "https://npmmirror.com/mirrors/sharp"
RUN npm config set sharp_libvips_binary_host "https://npmmirror.com/mirrors/sharp-libvips"
# 安装Python和相关依赖
RUN apk update && apk add -f python3 python3-pip

# 安装 pm2 用于启动应用程序
RUN npm install pm2 -g

# 设置工作目录
WORKDIR /app

# 将项目文件复制到容器中的工作目录
COPY . .

# 安装项目依赖
RUN npm install --omit=dev

# 暴露应用程序的端口
EXPOSE 9999

# 启动应用程序
CMD ["pm2", "start", "index.js", "-i", "1","--no-daemon", "--name", "yanchat"]
