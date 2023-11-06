import { WebSocketServer } from 'ws'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { find } from '../dataBase/operator_data_base.js'
import { verify } from '../ulits/auth.js'
import { to } from 'await-to-js'
const dataBase = '../dataBase/'
const wss = new WebSocketServer({ server: $httpServer })
if (!globalThis.wsClients) {
    globalThis.wsClients = {}
}

// websocket server 入口函数
function run(mf, ef, cf) {
    wss.on('connection', async function connection(ws, req) {
        // 参数
        const params = new URLSearchParams(req.url.slice(2))
        // console.log('ws headers -> ', params.get('token'))
        const token = params.get('token')
        const user = params.get('user_id')

        // token 验证
        const [tokenErr] = await to(verify(token))
        if (tokenErr) return ws.close(4001, '验证失败')

        if (!user || user === 'undefined') {
            ws.close(4001, '参数不合法')
            return
        }
        console.log(params.get('user_id'), ' -> 已经上线')
        // 将客户端挂到全局
        wsClients[params.get('user_id')] = ws

        ws.on('message', mf.bind(null, ws, params))
        ws.on('error', ef.bind(null,ws))
        ws.on('close', cf.bind(null,ws, params))
    });
}


export default run