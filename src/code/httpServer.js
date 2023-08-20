import express from 'express'
import path, { basename } from 'path'
import fs from 'fs'
import http from 'http'
import multer from 'multer'
import bodyParser from 'body-parser'
import { v4 as uuidv4 } from 'uuid'
import { find, insert, update } from '../dataBase/operator_data_base.js'

const __dirname = path.resolve()
const app = express()
const server = http.createServer(app)

// 处理 post 请求
app.use(bodyParser.urlencoded({ extended: false }))
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

// 获取好友列表
app.post('/getFriends', async (req, res) => {
    const { user_id } = req.body

    if (!user_id) {
        return res.send('err')
    }

    const list = await find('user_info', 'user_id', user_id)
    if (list && list.length) {
        return res.send(list[0].friends)
    }

    res.send('err')
})

app.post('/uploadFile', upload.single('file'), (req, res) => {
    console.log(req.file.filename, ' 已经上传。')
    res.send(req.file.filename)
})

app.post('/register', async (req, res) => {
    // console.log('req body - ', req.body)
    const findResult = await find('user_info', 'phone_number', req.body.phone_number)
    // console.log('find -- ', findResult)
    if (findResult.length) {
        return res.send('exist')
    }
    const data = {
        user: req.body.phone_number,
        password: req.body.password,
        user_id: uuidv4(),
        phone_number: req.body.phone_number,
        friends: null,
        group: null,
        avatar_url: null,
    }
    const insertResult = insert('user_info', data)
    if (insertResult) {
        return res.send('ok')
    }
    res.send('err')
})

app.post('/login', async (req, res) => {
    console.log('req body - ', req.body)
    const { password, phone_number } = req.body
    const list = await find('user_info', 'phone_number', phone_number)
    if (list.length && list[0].password === password) {
        const data = {
            ...list[0],
            password: null,
        }
        return res.send(data)
    }
    res.send('err')
})

app.post('/addFriend', async (req, res) => {
    const { phone_number, friend_phone_number } = req.body
    // 检查参数
    if (!phone_number || !friend_phone_number) {
        console.log('参数不正确。')
        return res.send('err')
    }

    // 第一步，查是否存在好友
    const fList = await find('user_info', 'phone_number', phone_number)
    // console.log('-> ', fList)
    const fStrList = JSON.parse(fList[0].friends || '[]')
    const fri = fStrList.find(f => f.phone_number === friend_phone_number)
    if (fri) {
        console.log('你们已经是好友，重复添加')
        return res.send('exist')
    }

    // 第二步，不存在好友，查询该电话(用户)是否在数据库中存在
    const hasUser = await find('user_info', 'phone_number', friend_phone_number)
    if(!hasUser || !hasUser.length) {
        console.log('该用户不存在 ', friend_phone_number)
        return  res.send('miss')
    }

    // 第三部， 存在用户，开始添加好友
    hasUser[0].friends = {
        ...hasUser[0].friends,
        group: null,
        friends: null,
        password: null
    }
    fStrList.push(hasUser[0])
    update('user_info', 'phone_number', phone_number, {
        friends: JSON.stringify(fStrList)
    })
    res.send({friends: fStrList})
})

// http
server.listen(9999, () => {
    console.log('http server is listening on *:9999')
})