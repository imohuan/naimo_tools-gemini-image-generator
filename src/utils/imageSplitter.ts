/**
 * 将图片按照指定布局分割成多个部分
 * @param imageBase64 原始图片的 base64 字符串
 * @param layout 布局类型 '2x2' 或 '3x3'
 * @returns Promise<string[]> 返回分割后的图片 base64 数组，按从左到右、从上到下的顺序
 */
export async function splitImage(
  imageBase64: string,
  layout: "2x2" | "3x3"
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const rows = layout === "2x2" ? 2 : 3;
        const cols = layout === "2x2" ? 2 : 3;
        const slices: string[] = [];

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("无法创建 canvas 上下文"));
          return;
        }

        const sliceWidth = img.width / cols;
        const sliceHeight = img.height / rows;

        canvas.width = sliceWidth;
        canvas.height = sliceHeight;

        // 按行优先顺序（从上到下，从左到右）分割
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            ctx.clearRect(0, 0, sliceWidth, sliceHeight);
            ctx.drawImage(
              img,
              col * sliceWidth,
              row * sliceHeight,
              sliceWidth,
              sliceHeight,
              0,
              0,
              sliceWidth,
              sliceHeight
            );

            // 转换为 base64（去掉 data:image/png;base64, 前缀）
            const dataUrl = canvas.toDataURL("image/png");
            const base64 = dataUrl.split(",")[1];
            slices.push(base64);
          }
        }

        resolve(slices);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("图片加载失败"));
    };

    img.src = `data:image/png;base64,${imageBase64}`;
  });
}

