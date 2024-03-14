import { find, insert, del, clear } from '../dataBase/operator_data_base.js'

export async function readTips(tableName, tableStr, findStr) {
    const table = 'messages_' + tableName
    const data = await find(table, tableStr, findStr)
    // console.log('触发了')
    if (data) {
        const responseData = {
            receivedType: 'tips',
            data
        }
        wsClients[tableName]?.send(JSON.stringify(responseData))
        return data
    } else {
        return null
    }
}

export async function writeTips(tableName, insertData) {
    const table = 'messages_' + tableName
    const data = await insert(table, insertData)
    if (data) {
        return data
    } else {
        return null
    }
}

export async function deleteTips(tableName, tableStr, findStr) {
    const table = 'messages_' + tableName
    const data = await del(table, tableStr, findStr)
    if (data) {
        return data
    } else {
        return null
    }
}

export async function clearAllTips(tableName) {
    const table = 'messages_' + tableName
    const data = await clear(table, 'user_id', 'yanchat')
    if (data) {
        return data
    } else {
        return null
    }
}
