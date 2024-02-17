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

    // 如果对方在线则需要把消息实时传递到对方的账号
    if (wsClients[chat.to_id]) {
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
            wsClients[chat.to_id].send(JSON.stringify(chat))
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
        console.log('插入数据库返回值 -> ', res)
        //  客户不在线的情况下,也应该响应发送方的信息
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


export { message, err, close}