import { WebSocketServer } from 'ws'
import { readLine, readFile, writeFile } from './save_to_file.js'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
const dataBase = '../dataBase/'
globalThis.fp = p => {
    let resPath = new URL(p, import.meta.url).pathname
    if (resPath.startsWith('/')) {
        return resPath.slice(1)
    }
    return resPath
}
const wss = new WebSocketServer({ port: 8000 })
if (!globalThis.wsClients) {
    globalThis.wsClients = {}
}
if (!globalThis.wsDataMap) {
    // console.log('path ', new URL('../dataBase/table.json', import.meta.url), import.meta.url)
    readFile(fp('../dataBase/table.json'))
    .then(res => {
        // console.log('wsDataMap --- ', JSON.parse(res))
        globalThis.wsDataMap = JSON.parse(res)
    })
    .catch(err => {
        console.log('err 1 ', err)
    })
    
}

// websocket server 入口函数
function run(mf, ef, cf) {
    wss.on('connection', async function connection(ws, req) {
        // 参数
        const params = new URLSearchParams(req.url.slice(2))

        // 将客户端挂到全局
        wsClients[params.get('id')] = ws

        // 读配置文件
        await readTable()
        // 逐行读取内容并发送到客户端
        await handleReadLine(ws, params)

        ws.on('message', mf.bind(null, ws, params))
        ws.on('error', ef.bind(null,ws))
        ws.on('close', cf.bind(null,ws, params.get('id')))
    });
}

// 读取本地表
function readTable () {
    return readFile(fp('../dataBase/table.json'))
    .then(res => {
        globalThis.wsDataMap = JSON.parse(res)
    })
    .catch(err => {
        console.log('err 1 ', err)
    })
}

// 逐行读取并发送到客户端
async function handleReadLine (ws, params) {
    let filePath = ''
    if (!wsDataMap[params.get('id')]) {
        const uuid = uuidv4()
        wsDataMap[params.get('id')] = uuid
        wsDataMap[params.get('to')] = uuid
        filePath = `../dataBase/${uuid}`
    } else {
        filePath = `../dataBase/${wsDataMap[params.get('id')]}`
    }
    await readLine(fp(filePath), ws)
    writeFile(fp('../dataBase/table.json'), JSON.stringify(wsDataMap))
    .catch(err => console.log('err ', err))
}


export default run