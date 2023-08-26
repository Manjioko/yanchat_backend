import { append } from './save_to_file.js'

import { insert, find, update, hasTable, createTable } from '../dataBase/operator_data_base.js'

function err(ws, id, err) {
    console.log('报错 ', err)
    delete globalThis.wsClients[id]
    console.log('报错 已经删除 用户 ', id)
}

function close(ws,id,data) {
    console.log('用户断开连接 ', data)
    delete globalThis.wsClients[id]
    console.log('已经删除 用户 ', id)
}

async function message(ws, params, data) {
    console.log('data -> ', data.toString('utf-8'))
    const chat = JSON.parse(data.toString('utf-8'))
    const isTable = await hasTable(chat)
    console.log('isTable -> ', chat.to_table)
    if (!isTable) {
        await createTable(chat.to_table, [
            { data:'chat', notNull: true }
        ])
    }
    // wsClients[chat.to_id]
}


export { message, err, close}