import './src/dataBase/knexfile.js'
import './src/code/httpServer.js'
import ws from './src/code/ws.js'
import { message, err, close } from './src/code/ws_message.js'

ws(message, err, close)