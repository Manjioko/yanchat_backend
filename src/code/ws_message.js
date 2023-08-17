import { append } from './save_to_file.js'


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

function message(ws, params, data) {
    const suffix = `${params.get('id')}-${new Date().getTime()}:${data.toString('utf-8')}`
    if (globalThis.wsClients[params.get('to')]) {
        globalThis.wsClients[params.get('to')].send(suffix)
    }
    const fileName = globalThis.wsDataMap[params.get('id')]
    append(fp(`../dataBase/${fileName}`), suffix)
}


export { message, err, close}