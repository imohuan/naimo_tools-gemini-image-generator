import type { GeminiConfig } from '../types';

const STORAGE_KEY = 'gemini-config';

const DEFAULT_CONFIG: GeminiConfig = {
  baseUrl: 'https://yunwu.apifox.cn',
  apiKey: '',
  model: 'gemini-3-pro-image-preview',
  storyboardModel: 'gemini-3-pro-image-preview',
  aspectRatio: '16:9',
  imageSize: '1K',
  storyboardLayout: '3x3',
};

export function loadConfig(): GeminiConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('加载配置失败:', error);
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config: GeminiConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('保存配置失败:', error);
  }
}

