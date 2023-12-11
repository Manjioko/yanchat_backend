# yanchat_backend

### sqlit3 Windows 10 安装错误的问题
需要在终端输入 `set  NODE_TLS_REJECT_UNAUTHORIZED=0` 后再安装即可

### window 10 安装 sharp 错误的问题
```bash
npm config set sharp_binary_host "https://npmmirror.com/mirrors/sharp"
npm config set sharp_libvips_binary_host "https://npmmirror.com/mirrors/sharp-libvips"
npm install sharp
```

### docker 启动参数如下,其中 DOMAIN WS 是必须要设置的
```bash
docker run -d -e DOMAIN="http://your-domain" -e WS="ws://your-domain" --name=yanchat -p your-port:your-port yanchat
```