import { WebSocketServer } from 'ws'
// import { v4 as uuidv4 } from 'uuid'
// import path from 'path'
// import { find } from '../dataBase/database_handler.js'
import { verify } from '../ulits/auth.js'
import { to } from 'await-to-js'
// import { readTips } from './tips_manager.js'
const dataBase = '../dataBase/'
const wss = new WebSocketServer({ server: $httpServer })
if (!globalThis.wsClients) {
    globalThis.wsClients = {}
}
globalThis.deleteList = []

// websocket server 入口函数
function run(mf, ef, cf) {
    wss.on('connection', async function connection(ws, req) {
        // 参数
        const params = new URLSearchParams(req.url.slice(2))
        console.log('client connected', params.get('user_id'))
        // console.log('ws headers -> ', params.get('token'))
        const token = params.get('token')
        const user = params.get('user_id')

        // token 验证
        const [tokenErr] = await to(verify(token))
        if (tokenErr) {
            console.log('token 验证失败 -> ', tokenErr)
            ws.close(4001, '验证失败')

            return ws.terminate()
        }

        // 系统踢出
        if (deleteList.includes(user)) {
            ws.close(4002, '您已经被踢出')
            console.log('用户被踢出 -> ', user)
            ws.terminate()
            return
        }

        if (!user || user === 'undefined') {
            console.log('参数不合法 -> ', user)
            ws.close(4001, '参数不合法')
            ws.terminate()
            return
        }
        console.log(params.get('user_id'), ' -> 已经上线')
        // console.log(wss.clients.)
        // 将客户端挂到全局
        if (!wsClients[params.get('user_id')]) {
            wsClients[params.get('user_id')] = ws
        } else {
            try {
                wsClients[params.get('user_id')]?.terminate()
            } catch (e) {
                console.log('关闭连接出现问题 => ', e)
            }
            delete wsClients[params.get('user_id')]
            wsClients[params.get('user_id')] = ws
        }
        

        // 将消息发送到客户端
        // readTips(params.get('user_id')).then(res => {
        //     // console.log('消息是 -> ', res)
        // })

        ws.on('message', mf.bind(null, ws, params))
        ws.on('error', ef.bind(null,ws))
        ws.on('close', cf.bind(null,ws, params))
        ws.on('pong', () => {
            // ws.isAlive = true
            // console.log('pong -> ', params.get('user_id'))
        })
        ws.on('ping', () => {
            // ws.isAlive = true
            if (wsClients[params.get('user_id')]) {
                ws.pong()
                // console.log('ping -> ', params.get('user_id'))
                return
            }
            ws.terminate()
            console.log('无效ping -> ', params.get('user_id'))
            // ws.pong()
        })
    });

    // const interval = setInterval(function ping() {
    //     wss.clients.forEach(function each(ws) {
    //       if (ws.isAlive === false) return ws.terminate();
    //       ws.isAlive = false;
    //       ws.ping();
    //     });
    //   }, 15000);
}


export default run