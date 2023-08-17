import knex from "knex"

const k = knex({
    client: 'sqlite3',
    connection: {
        filename: './dev.sqlite'
    },
    useNullAsDefault: true
})

// k.schema.createTable('test_chat_records', table => {
//     table.increments('id').primary()
//     table.string('user', 50).notNullable()
//     table.text('message').notNullable()
//     table.timestamps(true, true)
// })
// .then(() => {
//     console.log('Chat records table created')
// })
// .catch(error => {
//     console.error('Error creating chat records table:', error)
// })
