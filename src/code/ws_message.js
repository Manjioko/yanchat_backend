import { append } from './save_to_file.js'

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
    // 插入数据
    const insertData = {
        user_id: chat.user_id || 'test',
        chat: data.toString('utf-8')
    }
    insert(chat.to_table, insertData)
    
    // 如果对方在线则需要把消息实时传递到对方的账号
    if (wsClients[chat.to_id]) {
        // console.log('发送一些消息 -> ', ws)
        wsClients[chat.to_id].send(data.toString('utf-8'))
    }
}


export { message, err, close}