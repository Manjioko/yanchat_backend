import { insert, find, update, hasTable, createTable } from '../dataBase/database_handler.js'
import { v4 as uuidv4 } from 'uuid'
import { writeTips, readTips, clearAllTips, handleWithdrawTips } from './tips_manager.js'

function err(ws, id, err) {
    console.log('报错 ', err)
    delete globalThis.wsClients[id]
    console.log('报错 已经删除 用户 ', id)
}

function close(ws,params,data) {
    // console.log('用户断开连接 ', data)
    // delete globalThis.wsClients[]
    wsClients[params.get('user_id')] = null
    wsClients[params.get('user_id')]?.terminate()
    console.log('用户断开连接并已删除 ', params.get('user_id'))
}

async function message(ws, params, data) {
    // console.log('data -> ', data.toString('utf-8'))
    const chat = JSON.parse(data.toString('utf-8'))

    // 存在一种情况，假性在线客户端发来的信息，需要做处理
    // 假性客户端就是那些客户端还在线，但是服务器已经经过
    // 各种原因判断其断开，不在wsClients的维护中了，这种
    // 客户端发送过来的信息，不要接收
    if (!wsClients[chat.user_id]) {
        console.log('无效客户端发送的消息 -> ', chat)
        ws.terminate() // 强制其下线
        return
    }
    
    if (chat.pingpong === 'pong') {
        // console.log('响应包 -> ', chat)
        chat.receivedType = 'pong'
        wsClients[chat.to_id]?.send(JSON.stringify(chat))
        return
    }

    if (chat.event && chat.event.startsWith('videoCall')) {
        chat.receivedType = chat.event
        wsClients[chat.to_id]?.send(JSON.stringify(chat))
        return
    }

    if (chat.event && chat.event === 'progress') {
        // 进度是一种低保证的消息，不需要客户端确认收到操作
        console.log('进度消息 -> ', chat)
        chat.receivedType = chat.event
        wsClients[chat.to_id]?.send(JSON.stringify(chat))
        return
    }

    if (chat.messages_type) {
        // 处理提示消息
        _handleTips(chat)
        return
    }

    // 如果对方在线则需要把消息实时传递到对方的账号
    if (wsClients[chat.to_id]) {
        console.log('发送一些消息 -> ', chat.to_table, chat.text)
        // 插入数据
        const insertData = {
            user_id: chat.user_id || 'yanchat',
            chat: data.toString('utf-8'),
            unread: false,
        }
        insert(chat.to_table, insertData)
        .then(res => {
            chat.id = res[0]
            // console.log('data.id ', chat)
            wsClients[chat.to_id].send(JSON.stringify(chat), err => {
                if (err) {
                    console.log('发送消息失败 -> ', err)
                    // 如果发送消息失败,服务器应该判定该客户端已经离线了
                    ws.terminate()
                    delete wsClients[chat.to_id]
                    // 更新数据库
                    update(chat.to_table, 'chat', data.toString('utf-8'), { unread: true })
                    // 数据由服务器接管,发送 pong 给客户端
                    const pongData = {
                        to_table: chat.to_table,
                        chat_id: chat.chat_id,
                        to_id: chat.user_id,
                        receivedType: 'pong',
                        id: res?.[0] || null
                    }
                    wsClients[chat.user_id]?.send(JSON.stringify(pongData))
                }
            })

            // 现在的做法是，不用等客户端进行确认，服务端直接响应
            // const pongData = {
            //     to_table: chat.to_table,
            //     chat_id: chat.chat_id,
            //     to_id: chat.user_id,
            //     receivedType: 'pong',
            //     id: res?.[0] || null
            // }
            // wsClients[chat.user_id]?.send(JSON.stringify(pongData))
        })
        // console.log('发送一些消息 -> ', chat.to_table)
        return
    }
    // 插入数据 在数据库中写入未读标记
    const insertData = {
        user_id: chat.user_id || 'test',
        chat: data.toString('utf-8'),
        unread: true,
    }

    insert(chat.to_table, insertData)
    .then(res => {
        console.log('插入数据库返回值 -> ', res, chat.to_table)
        //  客户不在线的情况下,由服务端进行响应
        const pongData = {
            to_table: chat.to_table,
            chat_id: chat.chat_id,
            to_id: chat.user_id,
            receivedType: 'pong',
            id: res?.[0] || null
        }
        wsClients[chat.user_id]?.send(JSON.stringify(pongData))
    })
}

function _handleTips(chat) {
    console.log('有消息进入 > ', chat)
    const { messages_type, to_id, messages_box } = chat
    // console.log('chat -> ', chat)
    if (!messages_type || !to_id) return
    const tips_messages_id = uuidv4()
    switch (messages_type) {
        case 'withdraw':
            {
                // 撤回消息 从数据库将数据删掉
                handleWithdrawTips(messages_box)
                writeTips(to_id, {
                    messages_id: tips_messages_id,
                    messages_box: messages_box,
                    messages_type: messages_type
                }).then(res => {
                    if (res) {
                        // 消息系统不同于聊天信息发送接收, 消息系统有高确认性, 必须需要客户端确认
                        // 如果对方在线则需要把消息实时传递到对方的账号
                        if (wsClients[to_id]) {
                            readTips(to_id)
                        }
                    }
                })
            }
            break
        case 'clear':
            clearAllTips(to_id)
            break
        case 'uploadSuccess':
            handleFileUploadSuccess(messages_box, to_id)
            writeTips(to_id, {
                messages_id: tips_messages_id,
                messages_box: messages_box,
                messages_type: messages_type
            })
            .then(res => {
                if (res) {
                    // 消息系统不同于聊天信息发送接收, 消息系统有高确认性, 必须需要客户端确认
                    // 如果对方在线则需要把消息实时传递到对方的账号
                    if (wsClients[to_id]) {
                        readTips(to_id)
                    }
                }
            })
            break
        case 'uploadFailed':
            handleFileUploadFailed(messages_box, to_id)
            writeTips(to_id, {
                messages_id: tips_messages_id,
                messages_box: messages_box,
                messages_type: messages_type
            }).then(res => {
                if (res) {
                    // 消息系统不同于聊天信息发送接收, 消息系统有高确认性, 必须需要客户端确认
                    // 如果对方在线则需要把消息实时传递到对方的账号
                    if (wsClients[to_id]) {
                        readTips(to_id)
                    }
                }
            })
            break
        default:
            {
                writeTips(to_id, {
                    messages_id: tips_messages_id,
                    messages_box: messages_box,
                    messages_type: messages_type
                }).then(res => {
                    if (res) {
                        // 消息系统不同于聊天信息发送接收, 消息系统有高确认性, 必须需要客户端确认
                        // 如果对方在线则需要把消息实时传递到对方的账号
                        if (wsClients[to_id]) {
                            readTips(to_id)
                        }
                    }
                })
            }
            break
    }
    // if (messages_type === 'clear') {
    //     clearAllTips(to_id)
    // } else if (messages_type === 'withdraw') {
    //     // 撤回消息 从数据库将数据删掉
    //     handleWithdrawTips(messages_box)
    //     writeTips(to_id, {
    //         messages_id: tips_messages_id,
    //         messages_box: messages_box,
    //         messages_type: messages_type
    //     }).then(res => {
    //         if (res) {
    //             // 消息系统不同于聊天信息发送接收, 消息系统有高确认性, 必须需要客户端确认
    //             // 如果对方在线则需要把消息实时传递到对方的账号
    //             if (wsClients[to_id]) {
    //                 readTips(to_id)
    //             }
    //         }
    //     })
    // } else {
    //     writeTips(to_id, {
    //         messages_id: tips_messages_id,
    //         messages_box: messages_box,
    //         messages_type: messages_type
    //     }).then(res => {
    //         if (res) {
    //             // 消息系统不同于聊天信息发送接收, 消息系统有高确认性, 必须需要客户端确认
    //             // 如果对方在线则需要把消息实时传递到对方的账号
    //             if (wsClients[to_id]) {
    //                 readTips(to_id)
    //             }
    //         }
    //     })
    // }
}

function handleFileUploadSuccess(messages_box, to_id) {
    const { to_table, response, chat_id } = messages_box
    if (!to_table || !response) return console.log('缺少必要参数')
    knex(to_table)
    .where('chat','like', `%${chat_id}%`)
    .then(res => {
        if (res.length === 0) return
        const chat = JSON.parse(res[0].chat)
        chat.progress = 100
        chat.response = messages_box.response
        knex(to_table)
        .where('id', res[0].id)
        .update({
            chat: JSON.stringify(chat)
        })
        .then(() => {
            console.log('文件上传成功***')
        })
    })
}

function handleFileUploadFailed(messages_box, to_id) {
    const { to_table, response, chat_id } = messages_box
    if (!to_table || !response) return console.log('缺少必要参数')
    knex(to_table)
    .where('chat','like', `%${chat_id}%`)
    .then(res => {
        if (res.length === 0) return
        const chat = JSON.parse(res[0].chat)
        chat.progress = 0
        chat.response = messages_box.response
        chat.destory = true
        knex(to_table)
        .where('id', res[0].id)
        .update({
            chat: JSON.stringify(chat)
        })
        .then(() => {
            console.log('文件上传失败***')
        })
    })
}

function handleSendFailed(messages_box, to_id) {

}

export { message, err, close}