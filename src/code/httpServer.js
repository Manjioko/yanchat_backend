// const express = require('express');
// const path = require("path");
// const app = express();
// const fs = require('fs')
import express from 'express'
import  path from 'path'
import fs from 'fs'
import http from 'http'
const __dirname = path.resolve();
const app = express()
const server = http.createServer(app);


app.use('/', express.static(path.join(__dirname)));
//设置允许跨域访问该服务.
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'text/html;charset=utf-8');
  res.header('Cache-Control','max-age=1000, no-store')
  next();
});

// 返回主页面，主页面需要挂载在此处
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/some', (req, res) => {
  res.sendFile(__dirname + '/test.js');
})
// http
server.listen(9999, () => {
    console.log('http server is listening on *:9000');
});