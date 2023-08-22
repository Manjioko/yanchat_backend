import './src/dataBase/knexfile.js'
import ws from './src/code/ws.js'
import { message, err, close } from './src/code/ws_message.js'
import './src/code/httpServer.js'

ws(message, err, close)