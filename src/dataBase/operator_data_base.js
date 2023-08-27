import { to } from 'await-to-js'

// 查看表是否存在
export async function hasTable(tableName) {
    const [err, res] = await to(knex.schema.hasTable(tableName))
    
    if (err || !res) {
        return false
    }

    return true
}

// 创建表
export async function createTable(tableName, dataAry) {
    const [err, res] = await to(knex.schema.createTable(tableName, t => {
        t.increments('id').primary()
        t.timestamps(true, true)
        // t.text('user_id').notNullable()
        dataAry.forEach(el => {
          if (el.notNull) {
            t.text(el.data).notNullable()
            return
          }
          t.text(el.data)
        })
    }))
    if (err) {
        console.log('create err -> ', err)
        return
    }
    return res
}

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
    let result
    if (!tableStr || !findStr) {
        const [err, res] = await to(knex(tableName).select("*"))
        if (err) {
            console.log('find err -> ', err)
            return
        }
        result = res
    } else {
        const [err, res] = await to(knex(tableName).select("*").where(tableStr, findStr))
        if (err) {
            console.log('find err -> ', err)
            return
        }
        result = res
    }
    return result
}

// 新增表字段
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

// 数据更新
export async function update(tableName, tableStr, findStr, updateObject) {
    const [err, res] = await to(knex(tableName).where(tableStr, findStr).update(updateObject))
    if (err) {
        console.log('update err -> ', err)
        return
    }
    return res
}