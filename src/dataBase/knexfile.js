import knex from "knex"
const tableName = 'user_info'

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
        t.timestamps(true, true)
    })
})
.then(() => {
    console.log(`表 ${ tableName } 已经准备好了`)
    globalThis.knex = k
})
.catch(err => {
    console.log('表创建错误 -> ', err)
})