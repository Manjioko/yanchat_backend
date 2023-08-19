import { to } from 'await-to-js'
// 插入数据
export async function insert(tableName, insertData) {
    const [err, res] = await to(knex(tableName).insert(insertData))
    if (err) {
        console.log('err', err)
        return 
    }
    return res
}

// 查询数据
export async function find(tableName, tableStr, findStr) {
    const [err, res] = await to(knex(tableName).select("*").where(tableStr, findStr))
    if (err) {
        console.log('find err -> ', err)
        return
    }
    return res
}

export async function add(tableName, tableStr, isNotNull) {
    const [err, res] = await to(knex.schema.table(tableName, t => {
        isNotNull ? t.string(tableStr).notNullable() : t.string(tableStr)
    }))
    if (err) {
        console.log('add err -> ', err)
        return
    }
    return res
}