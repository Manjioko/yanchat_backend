import express from 'express'
import path from 'path'
import fs from 'fs'
import http from 'http'
import multer from 'multer'

const __dirname = path.resolve()
const app = express()
const server = http.createServer(app)

const storage = multer.diskStorage({
    // 用来配置文件上传的位置
    destination: (req, file, cb) => {
        // 调用 cb 即可实现上传位置的配置
        cb(null, __dirname + '/public/')
    },
    
    // 用来配置上传文件的名称（包含后缀）
    filename: (req, file, cb) => {
        //filename 用于确定文件夹中的文件名的确定。 如果没有设置 filename，每个文件将设置为一个随机文件名，并且是没有扩展名的。
        // 获取文件的后缀
        let ext = path.extname(file.originalname)
        // 拼凑文件名
        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
})

const upload = multer({storage: storage})

app.use('/', express.static(path.join(__dirname + '/public')))

//设置允许跨域访问该服务.
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Methods', '*')
    res.header('Content-Type', 'text/html;charset=utf-8')
    res.header('Cache-Control', 'max-age=1000, no-store')
    next();
});

// 返回主页面，主页面需要挂载在此处
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});


app.post('/uploadFile', upload.single('file'), (req, res) => {
    console.log(req.file.filename,' 已经上传。')
    res.send('OK')
})

// http
server.listen(9999, () => {
    console.log('http server is listening on *:9999')
});