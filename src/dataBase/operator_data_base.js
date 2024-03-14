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
            if (el.type === 'text') {
                if (el.notNull) {
                    t.text(el.data).notNullable()
                    return
                }
                t.text(el.data)
                return
            }

            if (el.type === 'boolean') {
                if (el.notNull) {
                    t.boolean(el.data).notNullable()
                    return
                }
                t.boolean(el.data)
                return
            }

            if (el.type === 'integer') {
                if (el.notNull) {
                    t.integer(el.data).notNullable()
                    return
                }
                t.integer(el.data)
                return
            }

            t.string(el.data)

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
    if (!knex) return
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

// 查询表中是否存在某个列字段
export async function findColumnName(tableName, columnName) {
    // 查询表的元数据信息来检查是否存在列
    const [err, res] = await to(new Promise((resolve, reject) => {
        knex('sqlite_master')
        .select('sql')
        .where('type', 'table')
        .where('name', tableName)
        .then(rows => {
            if (rows.length > 0) {
                // 解析表的 CREATE TABLE 语句
                const createTableSQL = rows[0].sql;
                // 使用正则表达式来检查是否存在列
                const columnExists = new RegExp(`\\b${columnName}\\b`, 'i').test(createTableSQL)

                if (columnExists) {
                    console.log(`Column '${columnName}' exists in table '${tableName}'.`)
                    resolve(true)
                } else {
                    console.log(`Column '${columnName}' does not exist in table '${tableName}'.`)
                    reject(`Column '${columnName}' does not exist in table '${tableName}'.`)
                }
            } else {
                console.log(`Table '${tableName}' does not exist.`)
                reject(`Table '${tableName}' does not exist.`)
            }
        }).catch(err => {
            console.log(`findColumnName 发生错误 -> ${err}`)
            reject(`findColumnName 发生错误 -> ${err}`)
        })
    }))

    if (err) return false
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

export async function del(tableName, tableStr, findStr) {
    const [err, res] = await to(knex(tableName).where(tableStr, findStr).del())
    if (err) {
        console.log('delete err -> ', err)
        return
    }
    return res
}
export async function clear(tableName) {
    const [err, res] = await to(knex(tableName).truncate())
    if (err) {
        console.log('clear err -> ', err)
        return
    }
    return res
}