import { find, insert, del, clear } from '../dataBase/operator_data_base.js'
import fs from 'fs'
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

export async function handleWithdrawTips(chat) {
    const { to_table, chat_id } = chat
    knex(to_table)
    .where('chat','like', `%${chat_id}%`)
    .del()
    .then(() => {
        if (chat.type !== 'text') {
            try {
                fs.unlink(fp('../../public/' + chat.response), (unlinkError) => {
                    if (unlinkError) {
                        console.error('清除被删除的文件失败:', unlinkError)
                    } else {
                        console.log('清除成功')
                    }
                })
            } catch (err) {
                console.log('Catch err 清除被删除的文件失败:', err)
            }
        }
    }).catch((err) => {
        console.log('删除聊天记录 err -> ', err)
    })
}
