import 'dotenv/config'
import './src/dataBase/knex_handler.js'
import './src/code/http_server_manager.js'
import ws from './src/code/ws_manager.js'
import { message, err, close } from './src/code/message_manager.js'
import fs from 'fs'
// import './src/code/ollama.js'

// 检查 public sliceFile 和 avatar 是否存在
if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public')
}
if (!fs.existsSync('./sliceFile')) {
    fs.mkdirSync('./sliceFile')
}
if (!fs.existsSync('./avatar')) {
    fs.mkdirSync('./avatar')
}


ws(message, err, close)