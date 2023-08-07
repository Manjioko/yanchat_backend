import fs from 'fs'
import readline from 'readline'
import path from 'path'

function append (fileName, ctx) {
    const filePath = new URL(`../dataBase/${fileName}`, import.meta.url).pathname
    // console.log('filePath ', filePath)
    return fs.promises.appendFile(filePath, ctx + '\n', 'utf-8')
}

function readLine (filePath, ws) {
    const fp =  new URL(filePath, import.meta.url).pathname
    if (!fs.existsSync(fp)) {
        console.error('File not found:', fp);
        return;
    }
    const rl = readline.createInterface({
        input: fs.createReadStream(fp),
    })
    rl.on('line', line => {
        ws.send(line)
    })
    rl.on('close', () => {
        console.log('读取文件结束。')
    })
}

function readFile (filePath) {
    return fs.promises.readFile(filePath)
}

function writeFile (filePath, ctx) {
    return fs.promises.writeFile(filePath, ctx, 'utf-8')
}

export { append, readLine, readFile, writeFile }