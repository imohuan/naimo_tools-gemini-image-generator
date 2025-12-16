/// <reference types="vite/client" />

// Vite 环境变量类型定义
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 支持 ?raw 导入
declare module "*.md?raw" {
  const content: string;
  export default content;
}

