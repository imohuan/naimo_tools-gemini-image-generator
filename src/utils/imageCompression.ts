/**
 * 图片压缩工具
 * 使用 Canvas API 压缩图片，减少存储空间占用
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * 压缩图片文件
 * @param file 原始图片文件
 * @param options 压缩选项
 * @returns 压缩后的 base64 字符串（不包含 data URL 前缀）
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    format = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 计算目标尺寸
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // 创建 canvas 并绘制
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('无法创建 Canvas 上下文'));
          return;
        }

        // 如果是 JPEG 格式，填充白色背景（避免透明区域变黑）
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 转换为 base64
        const dataUrl = canvas.toDataURL(format, quality);
        // 移除 data URL 前缀，只返回 base64 数据
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 估算 base64 字符串的大小（字节）
 */
export function estimateBase64Size(base64: string): number {
  // base64 编码后大小约为原文件的 4/3
  // 但这里我们直接计算 base64 字符串的字节大小
  return Math.ceil((base64.length * 3) / 4);
}

