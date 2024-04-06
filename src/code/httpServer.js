import express from 'express'
import path, { basename } from 'path'
import fs from 'fs'
import http from 'http'
// import https from 'https'
import bodyParser from 'body-parser'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { to } from 'await-to-js'
// import imgHandler from '../ulits/imgHandler.js'
import { find, insert, update, createTable, findColumnName, add } from '../dataBase/operator_data_base.js'
import fliterProperty from '../ulits/fliterPropertyByObject.js'
import cors from 'cors'
// import cookieParser from 'cookie-parser'
import { setToken, auth, sourceAuth, fontendAuth } from '../ulits/auth.js'

const __dirname = path.resolve()
// https 在没有 nginx 的测试环境上使用
//https证书
// const options = {
//     cert: fs.readFileSync(path.join(__dirname, './cert.pem')),
//     key: fs.readFileSync(path.join(__dirname, './cert-key.pem')),
// }

const app = express()
const server = http.createServer(app)
// const server = https.createServer(options,app)
globalThis.$httpServer = server
// 处理 post 请求
app.use(cors())
// app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', fontendAuth, express.static(path.join(fp('../../fontend/'))))
app.use('/avatar', express.static(path.join(fp('../../avatar/'))))
// app.use('/source', auth, express.static(path.join(fp('../../public/'))))
app.use('/source', express.static(path.join(fp('../../public/'))))

//设置允许跨域访问该服务.
// app.all('*', function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*')
//     // res.header("Access-Control-Allow-Headers", "X-Requested-With")
//     res.header('Access-Control-Allow-Headers', 'Content-Type')
//     res.header('Access-Control-Allow-Methods', '*')
//     // res.header('Content-Type', 'text/html;charset=utf-8')
//     // res.header('Cache-Control', 'max-age=1000, no-store')
//     if (req.method === 'OPTIONS') {
//         res.header('Access-Control-Allow-Methods', '*'); // 或者添加其他允许的HTTP方法
//         res.status(204).end(); // 返回204 No Content状态码
//         return;
//     }
//     next();
// });

// 返回主页面，主页面需要挂载在此处
app.get('/', (req, res) => {
    // res.header('Access-Control-Expose-Headers', '*')
    // res.header('x-new-domain', '192.168.106.110:9999')
    // res.cookie('domain', '192.168.106.110')
    // res.cookie('port', '9999')
    // res.sendFile(fp('../../fontend/index.html'))
    // res.send('ok')
})

// 获取好友列表
app.post('/getFriends', auth, async (req, res) => {
    const { user_id, get_user_info } = req.body

    if (!user_id) {
        return res.send('err')
    }

    const list = await find('user_info', 'user_id', user_id)
    if (list && list.length) {
        return get_user_info ? res.send(fliterProperty(list[0], ['password', 'group'])) : res.send(list[0].friends)
    }

    res.send('err')
})
// 上传文件
app.post('/uploadFile', auth, (req, res) => {
    // console.log(req.file.filename, ' 已经上传。')
    const storage = multer.diskStorage({
        // 用来配置文件上传的位置
        destination: (req, file, cb) => {
            // console.log('req -> ', req.body.user_id)
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
    const upload = multer({ storage }).single('file')
    upload(req, res, (err) => {
        if (err) {
            console.log('false err -> ', err)
            return res.send('err')
        }
        console.log(req.file.filename, ' 已经上传。')
        res.send(req.file.filename)
    })
})

// 更换头像
app.post('/uploadAvatar', auth, (req, res) => {
    // 使用 fs.existsSync 检查文件夹是否存在
    if (!fs.existsSync(fp('../../avatar/'))) {
        // 如果不存在，使用 fs.mkdirSync 创建文件夹
        fs.mkdirSync(fp('../../avatar/'))
    }
    // console.log('req res -> ', req.body)
    const storage = multer.diskStorage({
        // 用来配置文件上传的位置
        destination: (req, file, cb) => {
            // console.log('req -> ', req.body)
            // 调用 cb 即可实现上传位置的配置
            cb(null, fp('../../avatar/'))
        },
    
        // 用来配置上传文件的名称（包含后缀）
        filename: (req, file, cb) => {
            //filename 用于确定文件夹中的文件名的确定。 如果没有设置 filename，每个文件将设置为一个随机文件名，并且是没有扩展名的。
            const user_id = req.body.user_id
            // 获取文件的后缀
            let ext = path.extname(file.originalname)
            let basename = path.basename(file.originalname, ext)
            // 拼凑文件名
            // cb(null, 'avatar_' + user_id + new Date().getTime() + ext)
            cb(null, 'avatar_' + user_id + ext)
        }
    })
    const upload = multer({ storage }).single('avatar')
    upload(req, res, async (err) => {
        if (err) {
            console.log('avatar err -> ', err)
            return
        }
        console.log(req.file.filename,req.body.user_id, ' avatar 已经上传。')
        update('user_info', 'user_id', req.body.user_id, {
            avatar_url: req.file.filename
        })
        console.log('req -> ', req.file.filename, req.body.user_id)
        // const inputPath = fp(`../../avatar/${req.file.filename}`)
        // const outputPath = fp(`../../avatar/avatar_${req.body.user_id}.jpg`)
        // const [imgErr, result] = await to(imgHandler(inputPath, outputPath))
        // if (imgErr) {
        //     return res.send('err')
        // }
        res.send(req.file.filename)
    })

})

// 文件分段上传服务
app.post('/uploadSliceFile', async (req, res) => {
    const { uid, index } = req.query
    console.log('请求序号 -> ', index)
    // console.log('params -> ', req.params, req.body, req.query)
    if (!fs.existsSync(fp('../../sliceFile/' + uid))) {
        fs.mkdirSync(fp('../../sliceFile/' + uid))
        console.log(`文件夹 ${uid} 创建成功!`)
    }

    const storage = multer.diskStorage({
        // 用来配置文件上传的位置
        destination: (req, file, cb) => {
            cb(null, fp('../../sliceFile/' + uid))
        },
    
        // 用来配置上传文件的名称（包含后缀）
        filename: (req, file, cb) => {
            let basename = `${index}_data`
            // 拼凑文件名
            cb(null, basename)
        }
    })
    const upload = multer({ storage }).single('file')
    upload(req, res, (err) => {
        if (err) {
            // console.log('false err -> ', err)
            return res.sendStatus(500)
        }
        // if (index === '1') {
        //     return res.sendStatus(500)
        // }
        console.log(index, ' 已经上传。')
        res.sendStatus(200)
    })
})

// 文件全部上传完成后,通知在此拼接
app.post('/joinFile', async (req, res) => {
    const { fileName, uid } = req.body
    // 获取文件的后缀
    const ext = path.extname(fileName)
    const basename = path.basename(fileName, ext)
    const responseName = basename + '-' + Date.now() + ext
    try {
        // 读取目录中的所有文件
        const files = fs.readdirSync(fp('../../sliceFile/' + uid))

        // console.log('matchingFiles -> ', matchingFiles)
                       
        const uploadFolderPath = fp('../../sliceFile/' + uid)
        const outputFile = fp('../../public/' + responseName)
        // console.log('uploadFolderPath -> ', uploadFolderPath)

        // 获取上传文件夹中的所有分段文件
        const chunkFiles = fs.readdirSync(uploadFolderPath).sort((a, b) => {
            return Number(a.split('_')[0]) - Number(b.split('_')[0])
        })

        // console.log('chunkFIles -> ', chunkFiles)

        // 创建一个可写流，用于拼接分段文件
        const outputStream = fs.createWriteStream(outputFile)

        const pipeData = function(chunkFile) {
            return new Promise((resolve, reject) => {
                // 提示垃圾回收系统回收垃圾
                {
                    const chunkFilePath = path.join(uploadFolderPath, chunkFile)
                    const readStream = fs.createReadStream(chunkFilePath)
                    readStream.pipe(outputStream, { end: false })
                    readStream.on('error', (err) => {
                        reject(err)
                    })
                    readStream.on('end', () => {
                        resolve('OK')
                    })
                }
            })
          }
          for (const chunkFile of chunkFiles) {
            try {
              await pipeData(chunkFile)
            } catch (error) {
              console.log(error)
            }
          }
    
          outputStream.end()
          fs.rm(uploadFolderPath, { recursive: true }, (err) => {
              if (err) {
                  console.error(err)
              } else {
                  console.log('文件夹删除成功')
              }
          })

    } catch (error) {
        console.error('Error reading directory:', error)
    }
    res.send(responseName)
})

// 清空文件夹
app.post('/clearDir', (req, res) => {
    console.log('clearDir')
    const { dirName } = req.body
    const dir = fp('../../sliceFile/' + dirName)
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach((file, index) => {
            const curPath = dir + '/' + file
            fs.unlinkSync(curPath)
        })

        // 删除空文件夹
        fs.rmdirSync(dir)
        console.log(`Deleted folder: ${dir}`)
        res.sendStatus(200)
    }
})

// 客户端获取文件
app.post('/getFile', auth, async (req, res) => {
    const { filename } = req.body
    if (!filename || typeof filename !== 'string') return res.send('res')
    res.sendFile(fp('../../public/' + filename))
})

// 注册
app.post('/register', async (req, res) => {
    const findResult = await find('user_info', 'phone_number', req.body.phone_number)
    if (findResult.length) {
        return res.send({
            user_data: 'exist',
            auth: null
        })
    }
    const user_id = uuidv4()
    const data = {
        user: req.body.phone_number,
        password: req.body.password,
        user_id,
        phone_number: req.body.phone_number,
        friends: null,
        group: null,
        avatar_url: null,
    }
    // 构建一个表,用于做消息通知
    const chat_table = 'messages_' + user_id
    createTable(chat_table, [
        { data: 'messages_type', notNull: false, type: 'text' },
        { data: 'messages_box', notNull: false, type: 'text' },
        { data: 'messages_id', notNull: false, type: 'text' },
        { data: 'time', notNull: false, type: 'text' },
    ])
    const insertResult = await insert('user_info', data)
    console.log('insertResult -> ', insertResult)
    const token = setToken({ phone_number: req.body.phone_number }, '600s')
    const refreshToken = setToken({ phone_number: req.body.phone_number }, '72h')
    // 设置默认头像
    const readStream = fs.createReadStream(fp(`../../avatar/avatar_default.png`))
    const writeStream = fs.createWriteStream(fp(`../../avatar/avatar_${user_id}.jpg`))
    readStream.pipe(writeStream)
    if (insertResult) {
        return res.send({
            user_data: data,
            auth: {
                token,
                refreshToken
            }
        })
    }
    res.send({
        user_data: 'err',
        auth: null
    })
})

// 更新 refreshToken
app.post('/refreshToken', auth, async (req, res) => {
    const { user_id, phone_number} = req.body
    const list = await find('user_info', 'user_id', user_id)
    if (!list.length) return res.send('err')
    const refreshToken = setToken({ phone_number }, '72h')
    return res.send({
        refreshToken
    })
})

// 登录
app.post('/login', async (req, res) => {
    const { password, phone_number } = req.body
    const list = await find('user_info', 'phone_number', phone_number)
    if (!list.length) return res.send({
        user_data: 'err',
        auth: null
    })
    if (wsClients[list[0].user_id]) {
        console.log('repeat: ', list[0].user_id)
        return res.send({ user_data: 'repeat', auth: null })
    }
    if (list.length && list[0].password === password) {
        const data = {
            ...list[0],
            password: null,
        }

        const token = setToken({ phone_number }, '600s')
        const refreshToken = setToken({ phone_number }, '72h')
        const result = {
            user_data: data,
            auth: {
                token,
                refreshToken
            }
        }
        
        return res.send(result)
    }
    // console.log('list', list)
    if (list.length && list[0].password !== password) {
        return res.send({ user_data: 'pw_err', auth: null})
    }
    res.send({
        user_data: 'err',
        auth: null
    })
})

// 添加好友
app.post('/addFriend', auth, async (req, res) => {
    const { phone_number, friend_phone_number } = req.body
    // 检查参数
    if (!phone_number || !friend_phone_number) {
        console.log('参数不正确。')
        return res.send('err')
    }

    // 第一步，查是否存在好友
    const selfUser = await find('user_info', 'phone_number', phone_number)
    const selfFriendList = JSON.parse(selfUser[0]?.friends || '[]')
    const fri = selfFriendList.find(f => f.phone_number === friend_phone_number)
    if (fri) {
        console.log('你们已经是好友，重复添加')
        return res.send('exist')
    }

    // 第二步，不存在好友，查询该电话(用户)是否在数据库中存在
    const otherUser = await find('user_info', 'phone_number', friend_phone_number)
    console.log('otherUser -> ', otherUser)
    const otherFriendList =  JSON.parse(otherUser[0]?.friends || '[]') ?? []
    if(!otherUser || !otherUser.length) {
        console.log('该用户不存在 ', friend_phone_number)
        return  res.send('miss')
    }

    // 设置好友聊天数据库名称
    const chat_table = 'chat_dataBase_' + uuidv4()

    // 创建聊天信息数据库
    createTable(chat_table, [
        { data: 'user_id', notNull: true, type: 'text' },
        { data: 'chat', notNull: false, type: 'text' },
        { data: 'unread', notNull: true, type: 'boolean' },
        { data: 'del_flag', notNull: false, type: 'text' },
    ])
    
    // 第三部， 存在用户，开始添加好友
    const otherFilterUser = fliterProperty(otherUser[0], ['password', 'group', 'friends'], { chat_table })
    // console.log('otherFilterUser -> ', otherFilterUser)
    selfFriendList.push(otherFilterUser)
    update('user_info', 'phone_number', phone_number, {
        friends: JSON.stringify(selfFriendList)
    })


    // 对方数据库中也应该将好友数据添加进去
    const selfFilterUser = fliterProperty(selfUser[0], ['password', 'group', 'friends'], { chat_table })
    
    // console.log('selfFilterUser -> ', selfFilterUser)
    console.log('otherFriendList -> ', otherFriendList)
    otherFriendList.push(selfFilterUser)
    update('user_info', 'phone_number', friend_phone_number, {
        friends: JSON.stringify(otherFriendList)
    })


    res.send({friends: selfFriendList})
})

// 添加好友
app.post('/addFriendTest', auth, async (req, res) => {
    const { phone_number, friend_phone_number } = req.body
    // 检查参数
    if (!phone_number || !friend_phone_number) {
        console.log('参数不正确。')
        return res.send('err')
    }

    // 第一步，查是否存在好友
    const selfUser = await find('user_info', 'phone_number', phone_number)
    const selfFriendList = JSON.parse(selfUser[0]?.friends || '[]')
    const fri = selfFriendList.find(f => f.phone_number === friend_phone_number)
    if (fri) {
        console.log('你们已经是好友，重复添加')
        return res.send('exist')
    }

    // 第二步，不存在好友，查询该电话(用户)是否在数据库中存在
    const otherUser = await find('user_info', 'phone_number', friend_phone_number)
    const otherFriendList =  JSON.parse(otherUser[0]?.friends || '[]')
    if(!otherUser || !otherUser.length) {
        console.log('该用户不存在 ', friend_phone_number)
        return  res.send('miss')
    }

    // 构建消息体
    const friend_message = {
        from_user_id: selfUser[0].user_id,
        from_user_name: selfUser[0].user,
        message_type: 'addFriend',
        time: new Date().getTime(),
        content: '添加好友'
    }
    // 发送信息到对方的 user_info 中
    const isExist = JSON.parse(otherUser[0].messages || '[]').find(item => item.from_user_id === selfUser[0].user_id)
    console.log('重复了 -> ', isExist)
    if (isExist) return res.send('wait')
    update('user_info', 'user_id', otherUser[0].user_id, {
        messages: JSON.stringify([...JSON.parse(otherUser[0].messages || '[]'), friend_message])
    })

    return res.send('wait')
})

// 读取聊天记录
app.post('/chatData', auth, async (req, res) => {
    const { chat_table, offset, limit, user_id } = req.body
    // console.log('cahtdata -> ', chat_table, offset)
    if (!chat_table || !user_id) return res.send({})
    let res_offset = offset
    if (!offset) {
        const [oerr, odata] = await to(knex(chat_table).select("*").orderBy('id', 'desc').limit(1))
        if (oerr || !odata.length) {
            console.log('offset err -> ', oerr)
            return res.send({})
        }
        res_offset = odata[0].id + 1
        // console.log('res_offset -> ', res_offset)
    }
    // console.log('res_offset -> ', res_offset)
    const [err, data] = await to(
        knex(chat_table)
        .select("*")
        .where('id', '<', res_offset) // 选择 id 小于 45 的记录
        .where(function() {
            // 排除已删除的记录
            this.whereNull('del_flag').orWhere('del_flag', '!=', user_id)
        })
        .orderBy('id', 'desc')
        .limit(limit || 8)
    )
    if (err) {
        console.log('get chat data err -> ', err)
        return res.send({})
    }
    // console.log('data -> ', data)
    if (!data) return res.send({offset: 0, chat: []})
    const resData = data.reverse()
    const resOb = {
        // 如果第一个 id 都不存在,证明没有数据了, 直接返回之前 offset 
        offset: resData[0]?.id || offset,
        data: resData || [],
    }
    return res.send(resOb)
})

// 读未读信息
app.post('/unread', auth, async (req, res) => {
    const { friends, user_id } = req.body
    // console.log('friends -> ', friends)
    if (!friends || !Array.isArray(friends)) return res.send('err')
    if (!user_id || typeof user_id !== 'string') return res.send('err')
    const resultOb = {}
    for (const table_id of friends) {
        const [ferr, fdata] = await to(
            knex(table_id)
            .select('*')
            .where(function() {
                this.where('unread', true)
                .whereNot('user_id', user_id)
            })
        )
        if (ferr) {
            console.log('ferr -> ', ferr)
            continue
        }   
        
        if (!fdata || !fdata?.length) {
            const [zerr, zdata] = await to(
                knex(table_id)
                .select("*")
                .where(function() {
                    this.whereNull('del_flag')
                    .orWhere('del_flag', '!=', user_id)
                })
                .orderBy('id', 'desc')
                .limit(1)
            )
            if (zerr || !zdata.length) continue
            let resData = zdata?.pop()
            if (!resData) continue
            // 将最后一条的聊天记录的未读信息删除
            // 因为获取最后一条信息的场景不是因为未读
            // 而是为了提示用户的上次最后一次聊天内容
            delete resData.unread
            // resultOb[table_id] = [resData]
            resultOb[table_id] = {
                unread: 0,
                chat: [{...JSON.parse(resData.chat), id: resData.id}]
            }
            continue
        }

        resultOb[table_id] = {
            unread: fdata.length,
            chat: fdata.map(d => ({...JSON.parse(d.chat), id: d.id}))
        }
        await to(knex(table_id).where(function() {
            this.where('unread', true).whereNot('user_id', user_id)
        }).update({ unread: false}))
    }
    res.send(resultOb)
})

// 修改昵称
app.post('/changeNickName', auth, async(req, res) => {
    const {phone_number, nick_name} = req.body
    console.log('phone_number -> ', phone_number, nick_name)
    if (!phone_number) return res.send('err')
    const [ferr, data] = await to(find('user_info', 'phone_number', phone_number))
    if (ferr) {
        console.log('changeNickName error -> ', ferr)
        return res.send('err')
    }
    if (!nick_name) return res.send('err')
    if (!data.length) return res.send('err')

    const [uerr, result] = await to(update('user_info', 'phone_number', phone_number, {
        user: nick_name
    }))
    const friends = JSON.parse(data[0].friends) || []
    // if (!friends) return res.send('err')
    for (const item of friends) {
        const [getFriDataErr, friDataList] =  await to(find('user_info', 'user_id', item.user_id))
        if (getFriDataErr) {
            console.log('fri err -> ', getFriDataErr)
            return res.send('err')
        }
        if (!friDataList.length) continue
        const friDataFriends = JSON.parse(friDataList[0].friends)
        for (const f of friDataFriends) {
            if (f.phone_number === phone_number) {
                f.user = nick_name
                break
            }
        }
        await update('user_info', 'user_id', item.user_id, {
            friends: JSON.stringify(friDataFriends)
        })
    }
    console.log('改名结果 -> ', result)

    if (uerr) return res.send('err')
    
    res.send('ok')
})

// 用户 Markdown 使用权限
app.post('/isUseMd', auth, async(req, res) => {
    const { is_use_md, user_id } = req.body
    // console.log('req -> ', is_use_md, user_id)
    if (!user_id) return res.send('err')
    // const hasIsUseMd = await findColumnName('user_info', 'is_use_md')
    update('user_info', 'user_id', user_id, {
        is_use_md: is_use_md
    })
    return res.send(true)
})

// 删除聊天记录
app.post('/deleteChat', auth, async(req, res) => {
    const { chat, del_flag } = req.body
    // if (typeof chat === 'string') chat = JSON.parse(chat)
    const { to_table, chat_id, to_id } = chat
    if (!to_table || !chat_id || !to_id) return res.send('err')

    if (del_flag) {
        const [del_err, del_data] = await to(
            knex(to_table)
            .where('chat','like', `%${chat_id}%`)
            .where(function() {
                this.whereNull('del_flag').orWhere('del_flag', '=', del_flag)
            })
        )
        if (del_err) {
            console.log('del err -> ', del_err)
            return res.send('err')
        }

        if (del_data.length) {
            // console.log('update -> ', del_data)
            if (!del_data[0].del_flag) {
                await update(to_table, 'id', del_data[0].id, {
                    del_flag,
                })
            }

            return res.send('ok')
        }
    }
    knex(to_table)
    .where('chat','like', `%${chat_id}%`)
    .del()
    .then(() => {
        // console.log('删除成功')
        // chat.receivedType = 'deleted'
        // wsClients[chat.to_id]?.send(JSON.stringify(chat))
        if (chat.type !== 'text') {
            try {
                fs.unlink(fp('../../public/' + chat.response), (unlinkError) => {
                    if (unlinkError) {
                        console.error('清除被删除的文件失败:', unlinkError)
                    } else {
                        console.log('清除成功')
                    }
                })
            } catch (err) {
                console.log('Catch err 清除被删除的文件失败:', err)
            }
        }
    }).catch((err) => {
        console.log('删除聊天记录 err -> ', err)
    })
    res.send('ok')
})

// 更新聊天记录
app.post('/updateChat', auth, async(req, res) => {
    const { chat } = req.body
    const { to_table, chat_id } = chat
    if (!to_table || !chat_id) return res.send('err')
    knex(to_table)
    .where('chat','like', `%${chat_id}%`)
    .update({chat: JSON.stringify(chat)})
    .then(async () => {
        console.log('更新成功')
    }).catch((err) => {
        console.log('更新聊天记录 err -> ', err)
        res.send('err')
    })
    res.send('ok')
})

// 引用功能接口
app.post('/quote', auth, async(req, res) => {
    const { chat, user_id, to_id } = req.body
    const { to_table, chat_id } = chat
    if (!to_table || !chat_id) return res.send('err')
    knex(to_table)
    .where('chat','like', `%${chat_id}%`)
    .update({chat: JSON.stringify(chat)})
    .then(async () => {
        chat.receivedType = 'quote'
        wsClients[to_id]?.send(JSON.stringify(chat))
    }).catch((err) => {
        res.send('err')
    })

    res.sendStatus(200)
})

// 引用功能接口
app.get('/verifyAuth', auth, async(req, res) => {
    res.sendStatus(200)
})

// 通过手机号获取到对应的用户信息
app.post('/getUserInfoByPhone', auth, async(req, res) => {
    const { phone_number, get_friends } = req.body
    if (!phone_number) return res.send([])
    const data = await find('user_info', 'phone_number', phone_number)

    if (data && data.length) {
        if (!get_friends) {
            delete data[0].friends
        }
        delete data[0].password
    }

    res.send(data)
})

// 踢 xx 用户出去
app.post('/kickOut', async(req, res) => {
    console.log('踢出用户请求 -> ', req.body)
    const { user_id, out } = req.body
    if (out === 'true') {
        if (!deleteList.includes[user_id]) {
            deleteList.push(user_id)
            wsClients[user_id]?.close()
            delete wsClients[user_id]
            console.log('踢出用户 ', user_id)
            res.send('已经把用户踢出')
        }
    } else {
        deleteList.splice(deleteList.indexOf(user_id), 1)
        res.send('已经把用户踢出')
    }
})

// 更新客户端数据库版本号
app.post('/updateVersion', async(req, res) => {
    const { version, user_id } = req.body
    if (!version || !user_id) return res.send('err')
    const [userInfoErr, userInfo] = await to(find('user_info', 'user_id', user_id))
    if (userInfoErr) return res.send('err')
    if (userInfo?.db_version < version) {
        update('user_info', 'user_id', user_id, {
            db_version: version
        })
    }
    res.send('ok')
})

// 更新用户信息
app.post('/updateUserInfo', auth, async(req, res) => {
    const { data, user_id } = req.body
    if (!data || !user_id) return res.sendStatus(403)
    if (data) {
        delete data.password
    }
    const [err, status] = await to(update('user_info', 'user_id', user_id, data))
    const [err2, userInfo] = await to(find('user_info', 'user_id', user_id))

    if (err) return res.sendStatus(403)
    if (err2) return res.sendStatus(403)

    if (userInfo && userInfo.length) {
        delete userInfo[0].password
        res.send(userInfo[0])
    } else {
        res.sendStatus(403)
    }
    // res.send(userInfo)
})

// http
server.listen(9999, () => {
    console.log('http server is listening on *:9999')
})