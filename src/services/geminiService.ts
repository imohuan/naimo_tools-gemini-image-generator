import type { GeminiConfig, GenerationSettings } from "../types";
import { loadConfig } from "../utils/config";
import imageAnalysisPrompt from "../prompts/image-analysis.md?raw";
import singleStoryboardPrompt from "../prompts/single-storyboard.md?raw";
import batchStoryboardPrompt from "../prompts/batch-storyboard.md?raw";

export interface ModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  object: string;
  data: ModelInfo[];
}

export async function generateImage(
  settings: GenerationSettings,
  config?: GeminiConfig
): Promise<string> {
  const apiConfig = config || loadConfig();

  if (!apiConfig.apiKey) {
    throw new Error("请先在设置中配置 API Key");
  }

  if (!apiConfig.baseUrl) {
    throw new Error("请先在设置中配置 Base URL");
  }

  const url = `${apiConfig.baseUrl}/v1beta/models/${apiConfig.model}:generateContent?key=${apiConfig.apiKey}`;

  // 构建 parts 数组
  const parts: any[] = [
    {
      text: settings.prompt,
    },
  ];

  // 将所有参考图添加到 parts 中
  if (settings.referenceImages && settings.referenceImages.length > 0) {
    console.log(`准备添加 ${settings.referenceImages.length} 张参考图到请求`);

    for (const asset of settings.referenceImages) {
      // 确保有 base64 数据
      let base64Data = asset.base64;

      // 如果没有 base64，尝试从 url 获取（如果是 data URL）
      if (!base64Data && asset.url) {
        if (asset.url.startsWith("data:")) {
          // 从 data URL 中提取 base64
          const matches = asset.url.match(/data:.*?;base64,(.+)/);
          if (matches && matches[1]) {
            base64Data = matches[1];
          }
        }
      }

      if (base64Data) {
        // 根据图片类型确定 mime_type
        const mimeType = asset.type || "image/png";

        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data,
          },
        });

        console.log("✅ 已添加参考图到请求:", {
          name: asset.name,
          mimeType,
          dataLength: base64Data.length,
        });
      } else {
        console.warn("⚠️ 参考图没有 base64 数据:", asset.name);
      }
    }
  } else {
    console.log("ℹ️ 没有参考图");
  }

  // 从配置或设置中获取宽高比和图片质量
  const aspectRatio = apiConfig.aspectRatio || settings.aspectRatio || "16:9";

  // 转换图片质量：1K -> 1024, 2K -> 2048, 4K -> 4096
  // 如果配置中有 imageSize，优先使用；否则从 settings.resolution 转换
  let imageSize = "1024"; // 默认值
  if (apiConfig.imageSize) {
    const sizeMap: Record<string, string> = {
      "1K": "1024",
      "2K": "2048",
      "4K": "4096",
    };
    imageSize = sizeMap[apiConfig.imageSize] || "1024";
  } else if (settings.resolution) {
    // 兼容旧的 resolution 格式
    if (settings.resolution === "1024x1024") {
      imageSize = "1024";
    } else if (settings.resolution === "1536x1536") {
      imageSize = "1536";
    } else if (settings.resolution === "2048x2048") {
      imageSize = "2048";
    }
  }

  const requestBody = {
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio,
        imageSize,
      },
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    // 从响应中提取图片数据
    if (
      data.candidates &&
      data.candidates[0]?.content?.parts &&
      data.candidates[0].content.parts[0]?.inlineData?.data
    ) {
      return data.candidates[0].content.parts[0].inlineData.data;
    }

    throw new Error("响应中未找到图片数据");
  } catch (error: any) {
    console.error("生成图片失败:", error);
    throw new Error(error.message || "生成图片失败，请检查配置和网络连接");
  }
}

// 获取可用模型列表（类似 OpenAI 的方式）
export async function fetchModels(config?: GeminiConfig): Promise<ModelInfo[]> {
  const apiConfig = config || loadConfig();

  if (!apiConfig.apiKey) {
    throw new Error("请先在设置中配置 API Key");
  }

  if (!apiConfig.baseUrl) {
    throw new Error("请先在设置中配置 Base URL");
  }

  // 使用类似 OpenAI 的接口格式：GET /v1/models
  const url = `${apiConfig.baseUrl}/v1/models`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiConfig.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`获取模型列表失败: ${response.status} ${errorText}`);
    }

    const data: ModelsResponse = await response.json();

    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }

    // 如果返回格式不同，尝试直接返回数组
    if (Array.isArray(data)) {
      return data as any;
    }

    throw new Error("模型列表格式不正确");
  } catch (error: any) {
    console.error("获取模型列表失败:", error);
    throw new Error(error.message || "获取模型列表失败，请检查配置和网络连接");
  }
}

// 图片数据接口
export interface ImageData {
  base64?: string;
  url?: string;
  type?: string;
  name?: string;
}

// 通用 Gemini API 调用函数
async function callGeminiAPI(
  model: string,
  parts: any[],
  generationConfig: any,
  config: GeminiConfig
): Promise<any> {
  const apiConfig = config || loadConfig();

  if (!apiConfig.apiKey) {
    throw new Error("请先在设置中配置 API Key");
  }

  if (!apiConfig.baseUrl) {
    throw new Error("请先在设置中配置 Base URL");
  }

  const url = `${apiConfig.baseUrl}/v1beta/models/${model}:generateContent?key=${apiConfig.apiKey}`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    generationConfig,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败: ${response.status} ${errorText}`);
  }

  return await response.json();
}

// 从图片数据中提取 base64
function extractBase64FromImage(image: ImageData): string | null {
  let base64Data = image.base64;

  if (!base64Data && image.url) {
    if (image.url.startsWith("data:")) {
      const matches = image.url.match(/data:.*?;base64,(.+)/);
      if (matches && matches[1]) {
        base64Data = matches[1];
      }
    }
  }

  return base64Data || null;
}

// 构建包含图片的 parts 数组
function buildImageParts(images: ImageData[]): any[] {
  const parts: any[] = [];

  for (const image of images) {
    const base64Data = extractBase64FromImage(image);

    if (base64Data) {
      const mimeType = image.type || "image/png";
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data,
        },
      });
      console.log("✅ 已添加图片到请求:", { name: image.name, mimeType });
    } else {
      console.warn("⚠️ 图片没有 base64 数据:", image.name);
    }
  }

  return parts;
}

// 从 API 响应中提取文本内容
function extractTextFromResponse(data: any): string {
  if (
    data.candidates &&
    data.candidates[0]?.content?.parts &&
    data.candidates[0].content.parts.length > 0
  ) {
    const textPart = data.candidates[0].content.parts.find((part: any) => part.text);
    if (textPart && textPart.text) {
      return textPart.text;
    }
  }
  throw new Error("响应中未找到文本内容");
}

// 变量替换函数
function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, value || "");
  }
  return result;
}

// 分析图片：识别图片中的人物、场景、物体
export async function analyzeImage(
  images: ImageData[],
  config?: GeminiConfig
): Promise<string> {
  const apiConfig = config || loadConfig();

  if (!apiConfig.storyboardModel) {
    throw new Error("请先在设置中配置分镜模型");
  }

  if (!images || images.length === 0) {
    throw new Error("请至少提供一张图片");
  }

  const model = apiConfig.storyboardModel || "gemini-2.5-flash-lite";
  const imageParts = buildImageParts(images);

  if (imageParts.length === 0) {
    throw new Error("没有有效的图片数据");
  }

  // 使用模板替换变量
  const analysisPrompt = replaceVariables(imageAnalysisPrompt, {});

  const parts = [...imageParts, { text: analysisPrompt }];

  try {
    const data = await callGeminiAPI(
      model,
      parts,
      {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 8192,
      },
      apiConfig
    );

    return extractTextFromResponse(data);
  } catch (error: any) {
    console.error("分析图片失败:", error);
    throw new Error(error.message || "分析图片失败，请检查配置和网络连接");
  }
}

// 单个分镜提示词生成
export interface SingleStoryboardPromptParams {
  imageAnalysis: string; // 图片分析结果
  storyboardMode: string; // 分镜角度/模式
  index?: number; // 分镜序号（可选）
}

// 批量分镜提示词生成
export interface BatchStoryboardPromptParams {
  imageAnalysis: string; // 图片分析结果
  storyboardItems: Array<{
    index: number;
    mode: string;
  }>; // 分镜项列表
}

// 批量分镜提示词返回格式
export interface BatchStoryboardPromptResult {
  prompts: Array<{
    index: number;
    mode: string;
    prompt: string;
  }>;
}

// 生成单个分镜提示词
export async function generateSingleStoryboardPrompt(
  params: SingleStoryboardPromptParams,
  images: ImageData[],
  config?: GeminiConfig
): Promise<string> {
  const apiConfig = config || loadConfig();

  if (!apiConfig.storyboardModel) {
    throw new Error("请先在设置中配置分镜模型");
  }

  const model = apiConfig.storyboardModel || "gemini-2.5-flash-lite";
  // 构建图片 parts（如果提供了图片）
  const imageParts = images && images.length > 0 ? buildImageParts(images) : [];

  const indexText = params.index ? `（分镜 ${params.index}）` : "";
  // 使用模板替换变量
  const prompt = replaceVariables(singleStoryboardPrompt, {
    imageAnalysis: params.imageAnalysis,
    storyboardMode: params.storyboardMode,
    indexText: indexText,
  });

  // 如果有图片，先添加图片，再添加文本提示词；否则只添加文本提示词
  const parts = imageParts.length > 0 ? [...imageParts, { text: prompt }] : [{ text: prompt }];

  try {
    const data = await callGeminiAPI(
      model,
      parts,
      {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      apiConfig
    );

    return extractTextFromResponse(data).trim();
  } catch (error: any) {
    console.error("生成单个分镜提示词失败:", error);
    throw new Error(error.message || "生成分镜提示词失败，请检查配置和网络连接");
  }
}

// 批量生成分镜提示词
export async function generateBatchStoryboardPrompts(
  params: BatchStoryboardPromptParams,
  images: ImageData[],
  config?: GeminiConfig
): Promise<BatchStoryboardPromptResult> {
  const apiConfig = config || loadConfig();

  if (!apiConfig.storyboardModel) {
    throw new Error("请先在设置中配置分镜模型");
  }

  if (!params.storyboardItems || params.storyboardItems.length === 0) {
    throw new Error("请至少提供一个分镜项");
  }

  const model = apiConfig.storyboardModel || "gemini-2.5-flash-lite";
  // 构建图片 parts（如果提供了图片）
  const imageParts = images && images.length > 0 ? buildImageParts(images) : [];

  const storyboardItemsText = params.storyboardItems
    .map((item) => `  - 分镜 ${item.index}: ${item.mode}`)
    .join("\n");

  // 使用模板替换变量
  const prompt = replaceVariables(batchStoryboardPrompt, {
    imageAnalysis: params.imageAnalysis,
    storyboardItemsText: storyboardItemsText,
  });

  // 如果有图片，先添加图片，再添加文本提示词；否则只添加文本提示词
  const parts = imageParts.length > 0 ? [...imageParts, { text: prompt }] : [{ text: prompt }];

  try {
    const data = await callGeminiAPI(
      model,
      parts,
      {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      apiConfig
    );

    const responseText = extractTextFromResponse(data).trim();

    // 尝试提取 JSON（可能被 markdown 代码块包裹）
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    // 解析 JSON
    const result: BatchStoryboardPromptResult = JSON.parse(jsonText);

    // 验证结果格式
    if (!result.prompts || !Array.isArray(result.prompts)) {
      throw new Error("返回格式不正确：缺少 prompts 数组");
    }

    // 验证每个 prompt 的格式
    for (const item of result.prompts) {
      if (
        typeof item.index !== "number" ||
        typeof item.mode !== "string" ||
        typeof item.prompt !== "string"
      ) {
        throw new Error("返回格式不正确：prompt 项缺少必要字段");
      }
    }

    return result;
  } catch (error: any) {
    console.error("批量生成分镜提示词失败:", error);
    if (error instanceof SyntaxError) {
      throw new Error("解析返回的 JSON 失败，请重试");
    }
    throw new Error(error.message || "批量生成分镜提示词失败，请检查配置和网络连接");
  }
}
