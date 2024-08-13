import ollama from 'ollama'

const modelfile = `
FROM 'qwen2:1.5b'
SYSTEM "你是一个人工智能助手"
`
// console.log('ai -> ', )
ollama.list()
.then((res) => {
    console.log('res -> ', res)
    if (!res.models.some(model => model.name === 'qwen2:1.5b')) {
        console.log('model not found -> ', 'qwen2:1.5b')
        ollama.create({ model: 'qwen2:1.5b', modelfile: modelfile })
    }
})
// ollama.create({ model: 'example', modelfile: modelfile })
// .then((ollama) => {
//     console.log('ollama -> ', ollama)
// })

