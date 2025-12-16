export interface GeminiConfig {
  baseUrl: string;
  apiKey: string;
  model: string; // 图片生成模型
  storyboardModel: string; // 分镜模型
  // 图片生成设置
  aspectRatio?: string; // 宽高比
  imageSize?: string; // 图片质量/分辨率 (1K, 2K, 4K)
  storyboardLayout?: '2x2' | '3x3'; // 构图布局
}

export interface GenerationSettings {
  prompt: string;
  aspectRatio: string;
  resolution: string;
  storyboardLayout: '2x2' | '3x3';
  directorInstructions: string[];
  referenceImages?: Asset[];
}

export interface GeneratedImage {
  id: string;
  imageBase64: string;
  timestamp: number;
  prompt: string;
  aspectRatio: string;
  panelIndex?: number;
}

export type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '21:9';

export type DirectorInstruction =
  | '特写'
  | '中景'
  | '广角'
  | '顶视'
  | '低部'
  | '赛博光'
  | '自然光'
  | '电影感';

export interface Asset {
  id: string;
  name: string;
  url: string;
  base64?: string;
  timestamp: number;
  size: number;
  type: string;
}

