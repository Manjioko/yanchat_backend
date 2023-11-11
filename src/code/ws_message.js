import { insert, find, update, hasTable, createTable } from '../dataBase/operator_data_base.js'

function err(ws, id, err) {
    console.log('报错 ', err)
    delete globalThis.wsClients[id]
    console.log('报错 已经删除 用户 ', id)
}

function close(ws,params,data) {
    // console.log('用户断开连接 ', data)
    // delete globalThis.wsClients[]
    wsClients[params.get('user_id')] = null
    console.log('用户断开连接并已删除 ', params.get('user_id'))
}

async function message(ws, params, data) {
    // console.log('data -> ', data.toString('utf-8'))
    const chat = JSON.parse(data.toString('utf-8'))
    
    if (chat.pingpong === 'pong') {
        console.log('响应包 -> ', chat)
        chat.receivedType = 'pong'
        wsClients[chat.to_id]?.send(JSON.stringify(chat))
        return
    }
    
    // 如果对方在线则需要把消息实时传递到对方的账号
    if (wsClients[chat.to_id]) {
        // 插入数据
        const insertData = {
            user_id: chat.user_id || 'test',
            chat: data.toString('utf-8'),
            unread: false,
        }
        insert(chat.to_table, insertData)
        // console.log('发送一些消息 -> ', chat.to_table)
        wsClients[chat.to_id].send(data.toString('utf-8'))
        return
    }
    // 插入数据 在数据库中写入未读标记
    const insertData = {
        user_id: chat.user_id || 'test',
        chat: data.toString('utf-8'),
        unread: true,
    }
    insert(chat.to_table, insertData)
}


export { message, err, close}