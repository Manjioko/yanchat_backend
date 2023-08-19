import express from 'express'
import path, { basename } from 'path'
import fs from 'fs'
import http from 'http'
import multer from 'multer'
import bodyParser from 'body-parser'
import { v4 as uuidv4 } from 'uuid'
import { find, insert } from '../dataBase/operator_data_base.js'

const __dirname = path.resolve()
const app = express()
const server = http.createServer(app)

// 处理 post 请求
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
const storage = multer.diskStorage({
    // 用来配置文件上传的位置
    destination: (req, file, cb) => {
        // 调用 cb 即可实现上传位置的配置
        cb(null, fp('../../public/'))
    },
    
    // 用来配置上传文件的名称（包含后缀）
    filename: (req, file, cb) => {
        //filename 用于确定文件夹中的文件名的确定。 如果没有设置 filename，每个文件将设置为一个随机文件名，并且是没有扩展名的。
        // 获取文件的后缀
        let ext = path.extname(file.originalname)
        let basename = path.basename(file.originalname, ext)
        // 拼凑文件名
        cb(null, basename + '-' + Date.now() + ext)
    }
})
const upload = multer({ storage })

app.use('/', express.static(path.join(fp('../../public/'))))

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
    res.sendFile(fp('../../public/index.html'))
});


app.post('/uploadFile', upload.single('file'), (req, res) => {
    console.log(req.file.filename,' 已经上传。')
    res.send(req.file.filename)
})

app.post('/register', async (req, res) => {
    // console.log('req body - ', req.body)
    const findResult =  await find('user_info', 'phone_number', req.body.phone_number)
    console.log('find -- ', findResult)
    if (findResult.length) {
        res.send('exist')
        return
    }
    const data = {
        user: req.body.phone_number,
        password: req.body.password,
        user_id: uuidv4(),
        phone_number: req.body.phone_number,
        friends: '',
        group: '',
        avatar_url: '',
    }
    const insertResult = insert('user_info', data)
    if (insertResult) {
        res.send('ok')
        return
    }
    res.send('err')
})

app.post('/login', async (req, res) => {
    console.log('req body - ', req.body)
    const {password, phone_number} = req.body
    const list = await find('user_info', 'phone_number', phone_number)
    if (list.length && list[0].password === password ) {
        return res.send('ok')
    }
    res.send('')
})

app.post('/add', async (req, res) => {
    console.log('req body - ', req.body)
})

// http
server.listen(9999, () => {
    console.log('http server is listening on *:9999')
})