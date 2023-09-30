import knex from "knex"
import { find } from "./operator_data_base.js"
const tableName = 'user_info'
globalThis.fp = p => {
    let resPath = new URL(p, import.meta.url).pathname
    return resPath
}
const k = knex({
    client: 'sqlite3',
    connection: {
        filename: './dev.sqlite'
    },
    useNullAsDefault: true
})


k.schema.hasTable(tableName)
.then(ex => {
    if (ex) return
    return k.schema.createTable(tableName, t => {
        t.increments('id').primary()
        t.text('user').notNullable()
        t.text('password').notNullable()
        t.text('user_id').notNullable()
        t.text('phone_number').notNullable()
        t.text('friends')
        t.text('group')
        t.text('avatar_url')
        t.string('is_use_md')
        t.timestamps(true, true)
    })
})
.then(() => {
    console.log(`表 ${ tableName } 已经准备好了`)
    globalThis.knex = k
    // readUserInfo()
})
.catch(err => {
    console.log('表创建错误 -> ', err)
})


// // 读用户配置文件
// function readUserInfo() {
//     find('user_info').then(res => {
//         // console.log('user_info', res)
//         res.forEach(el => {
//             if (!globalThis.wsClients) globalThis.wsClients = {}
//             globalThis.wsClients[el.user_id] = null
//         })
//         // console.log('globalThis.wsClients -> ', globalThis.wsClients)
//     }).catch(err => {
//         console.log('err -> ', err)
//     })
// }