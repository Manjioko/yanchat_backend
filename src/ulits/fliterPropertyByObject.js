export default function filterPropertyByObject(object, filterAry, assign) {
    if (Object.prototype.toString.call(object).slice(8,-1) !== 'Object') return {}
    if (!filterAry || !Array.isArray(filterAry)) return object
    const result = JSON.parse(JSON.stringify(object))
    filterAry.forEach(el => {
        delete result[el]
    })
    if (assign && Object.prototype.toString.call(object).slice(8,-1) === 'Object') {
        Object.assign(result, { ...assign })
    }
    return result
}