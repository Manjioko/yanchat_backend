import sharp from "sharp"
import fs from 'fs'

export default function imgHandler (inputImagePath, outputImagePath) {
    
    // 设置压缩和格式转换选项
    const options = {
        quality: 20, // 图片质量 (0-100，可选，默认为80)
        chromaSubsampling: '4:2:0', // 色度子采样 (可选，默认为'4:2:0')
        force: false, // 强制处理即使输入和输出格式相同 (可选，默认为false)
    }

    // 使用sharp进行图片处理
    sharp(inputImagePath)
    .resize(350, 350, {
        fit: 'cover',
        background: { r: 255, g: 255, b: 255, alpha: 0.5 }
    }) // 调整图片大小（可选）
    .jpeg(options) // 转换为JPEG格式，可以根据需要选择PNG等其他格式
    .toFile(outputImagePath, (err, info) => {
        if (err) {
            console.error('图片处理出错:', err)
        } else {
            console.log('图片处理完成:', info)
            // 删除原图片
            fs.unlink(inputImagePath, (unlinkError) => {
                if (unlinkError) {
                    console.error('删除原图片出错:', unlinkError)
                } else {
                    console.log('原图片已成功删除')
                }
            })
        }
    })
}