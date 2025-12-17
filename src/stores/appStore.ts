import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import type { GeminiConfig, GenerationSettings, GeneratedImage, Asset } from "../types";
import finalPromptTemplate from "../prompts/final-prompt.md?raw";
import imageAnalysisPrompt from "../prompts/image-analysis.md?raw";
import singleStoryboardPrompt from "../prompts/single-storyboard.md?raw";
import batchStoryboardPrompt from "../prompts/batch-storyboard.md?raw";

export type MainTab = "storyboard" | "images";
export type ViewMode = "grid" | "list";
export type AnalysisTab = "analyze" | "result";

export type StoryboardLayout = "2x2" | "3x3";

export type StoryboardMode =
  | "高角度 / 略俯"
  | "过肩镜头"
  | "七分身 (Knees up)"
  | "特写 (Eyes / Details)"
  | "荷兰角 (倾斜)"
  | "剪影"
  | "中景"
  | "大全景"
  | "随机";

export interface StoryboardItem {
  id: string;
  index: number;
  mode: StoryboardMode;
  prompt: string;
  imageBase64?: string;
  isLoading?: boolean;
}

export interface PromptTemplates {
  finalPrompt: string;
  imageAnalysis: string;
  singleStoryboard: string;
  batchStoryboard: string;
}

export interface ProjectData {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  settings: GenerationSettings;
  referenceImages: Asset[];
  analysisResult: string;
  storyboardItems: StoryboardItem[];
  generatedImages: GeneratedImage[];
  showStoryboardImages: boolean;
  selectedImageId: string | null;
}

// 全局元信息（轻量），只在 key `gemini-image-generator-app` 中存储
export interface AppMetaState {
  config: GeminiConfig;
  currentProjectId: string | null;
  prompts: PromptTemplates;
  mainTab: MainTab;
  viewMode: ViewMode;
  canvasMode: boolean;
  isGenerating: boolean;
  isAnalyzing: boolean;
  error: string | null;
  showSettings: boolean;
  analysisTab: AnalysisTab;
}

const META_STORAGE_KEY = "gemini-image-generator-app";
const PROJECT_KEY_PREFIX = "gemini-image-project-";

function createDefaultConfig(): GeminiConfig {
  return {
    baseUrl: "https://yunwu.apifox.cn",
    apiKey: "",
    model: "gemini-3-pro-image-preview",
    storyboardModel: "gemini-3-pro-image-preview",
    aspectRatio: "16:9",
    imageSize: "1K",
    storyboardLayout: "3x3",
  };
}

function createDefaultSettings(): GenerationSettings {
  const config = createDefaultConfig();
  return {
    prompt: "",
    aspectRatio: config.aspectRatio || "16:9",
    resolution: "1024x1024",
    storyboardLayout: (config.storyboardLayout as StoryboardLayout) || "3x3",
    directorInstructions: [],
  };
}

function createDefaultStoryboardItems(layout: StoryboardLayout): StoryboardItem[] {
  const storyboardModes: StoryboardMode[] = [
    "高角度 / 略俯",
    "过肩镜头",
    "七分身 (Knees up)",
    "特写 (Eyes / Details)",
    "荷兰角 (倾斜)",
    "剪影",
    "中景",
    "大全景",
    "随机",
  ];

  const count = layout === "2x2" ? 4 : 9;
  return Array.from({ length: count }).map((_, index) => ({
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `panel-${index + 1}-${Math.random().toString(36).substr(2, 5)}`,
    index: index + 1,
    mode: storyboardModes[index] || "随机",
    prompt: "",
    isLoading: false,
  }));
}

function createDefaultProject(): ProjectData {
  const config = createDefaultConfig();
  const settings = createDefaultSettings();
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `project-${Date.now().toString(36)}`,
    name: "默认项目",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings,
    referenceImages: [],
    analysisResult: "",
    storyboardItems: createDefaultStoryboardItems(
      (config.storyboardLayout as StoryboardLayout) || "3x3"
    ),
    generatedImages: [],
    showStoryboardImages: false,
    selectedImageId: null,
  };
}

function createDefaultMetaState(): AppMetaState {
  const defaultConfig = createDefaultConfig();
  const defaultProject = createDefaultProject();

  return {
    config: defaultConfig,
    currentProjectId: defaultProject.id,
    prompts: {
      finalPrompt: finalPromptTemplate,
      imageAnalysis: imageAnalysisPrompt,
      singleStoryboard: singleStoryboardPrompt,
      batchStoryboard: batchStoryboardPrompt,
    },
    mainTab: "storyboard",
    viewMode: "grid",
    canvasMode: false,
    isGenerating: false,
    isAnalyzing: false,
    error: null,
    showSettings: false,
    analysisTab: "analyze",
  };
}

function getProjectStorageKey(id: string): string {
  return `${PROJECT_KEY_PREFIX}${id}`;
}

function saveProjectToStorage(project: ProjectData) {
  try {
    if (typeof localStorage === "undefined") return;
    const MAX_BYTES = 4_500_000; // 约 4.5MB，兼容多数浏览器 localStorage 配额

    // 深拷贝并做体积裁剪，优先保留元数据与参考图，必要时移除大字段
    const sanitized: ProjectData = JSON.parse(JSON.stringify(project));

    // 内部方法：计算 JSON 占用字节
    const calcSize = (obj: any) => new TextEncoder().encode(JSON.stringify(obj)).length;
    let size = calcSize(sanitized);

    // 先移除 storyboards 中的 base64，避免面板图撑爆
    if (sanitized.storyboardItems?.length) {
      sanitized.storyboardItems = sanitized.storyboardItems.map((item) => {
        const { imageBase64: _imageBase64, ...rest } = item;
        return rest as StoryboardItem;
      });
      size = calcSize(sanitized);
    }

    // 如果超限，先移除生成图片的 base64，仅保留必要元数据
    if (size > MAX_BYTES && sanitized.generatedImages?.length) {
      sanitized.generatedImages = sanitized.generatedImages.map((img) => ({
        id: img.id,
        timestamp: img.timestamp,
        prompt: img.prompt,
        aspectRatio: img.aspectRatio,
        panelIndex: img.panelIndex,
        // 去掉 imageBase64 降低体积
      })) as any;
      size = calcSize(sanitized);
    }

    // 若仍超限，再只保留参考图的必要元数据（丢弃 base64/url）
    if (size > MAX_BYTES && sanitized.referenceImages?.length) {
      sanitized.referenceImages = sanitized.referenceImages.map((ref) => ({
        id: ref.id,
        name: ref.name,
        size: ref.size,
        type: ref.type,
      })) as any;
      size = calcSize(sanitized);
    }

    // 仍然超限时，丢弃生成图片列表，仅保留核心元信息，避免持续抛错
    if (size > MAX_BYTES) {
      sanitized.generatedImages = [];
      size = calcSize(sanitized);
    }

    // 最终仍超限则放弃写入，防止循环报错
    if (size > MAX_BYTES) {
      console.warn(
        "保存项目被跳过，数据仍超出 localStorage 配额，已保留内存数据但未持久化。项目 ID:",
        project.id
      );
      return;
    }

    localStorage.setItem(getProjectStorageKey(project.id), JSON.stringify(sanitized));
  } catch (error) {
    console.error("保存项目失败:", error);
  }
}

function deleteProjectFromStorage(id: string) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(getProjectStorageKey(id));
  } catch (error) {
    console.error("删除项目失败:", error);
  }
}

function loadAllProjectsFromStorage(): ProjectData[] {
  const result: ProjectData[] = [];
  try {
    if (typeof localStorage === "undefined") return result;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(PROJECT_KEY_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as ProjectData;
        if (parsed && parsed.id) {
          result.push(parsed);
        }
      } catch (e) {
        console.error("解析项目数据失败:", key, e);
      }
    }
  } catch (error) {
    console.error("加载项目列表失败:", error);
  }
  return result;
}

export const useAppStore = defineStore("appStore", () => {
  // 1) 轻量元信息：使用 vueuse 持久化
  const meta = useStorage<AppMetaState>(
    META_STORAGE_KEY,
    createDefaultMetaState(),
    undefined,
    {
      mergeDefaults: true,
    }
  );

  // 2) 项目列表：每个项目独立 localStorage key，内存中维护一个数组
  const projects = ref<ProjectData[]>([]);

  // 3) 当前选中图片（只保存在内存中）
  const selectedImage = ref<GeneratedImage | null>(null);

  // 初始化项目列表（包含旧数据迁移）
  function initProjects() {
    // 兼容旧版本：如果 meta 里还残留 projects 字段，则迁移到独立 key
    const legacy = (meta.value as any) as {
      projects?: ProjectData[];
    };
    if (legacy.projects && Array.isArray(legacy.projects) && legacy.projects.length > 0) {
      projects.value = legacy.projects;
      for (const p of projects.value) {
        saveProjectToStorage(p);
      }
      // 删除元信息中的 projects 字段
      delete (meta.value as any).projects;
    } else {
      // 从独立 key 加载
      const loaded = loadAllProjectsFromStorage();
      if (loaded.length > 0) {
        // 按创建时间排序，保证顺序稳定
        loaded.sort((a, b) => a.createdAt - b.createdAt);
        projects.value = loaded;
      }
    }

    // 如果没有任何项目，则创建一个默认项目
    if (projects.value.length === 0) {
      const defaultProject = createDefaultProject();
      projects.value = [defaultProject];
      saveProjectToStorage(defaultProject);
      meta.value.currentProjectId = defaultProject.id;
    }

    // 校正 currentProjectId
    if (
      !meta.value.currentProjectId ||
      !projects.value.some((p) => p.id === meta.value.currentProjectId)
    ) {
      meta.value.currentProjectId = projects.value[0].id;
    }
  }

  initProjects();

  // 任意项目内容变化时，同步到对应的 localStorage key
  watch(
    projects,
    (val) => {
      val.forEach((p) => {
        saveProjectToStorage(p);
      });
    },
    { deep: true }
  );

  const config = computed({
    get: () => meta.value.config,
    set: (val: GeminiConfig) => {
      meta.value.config = { ...meta.value.config, ...val };
    },
  });

  const currentProjectId = computed({
    get: () => meta.value.currentProjectId,
    set: (val: string | null) => {
      meta.value.currentProjectId = val;
    },
  });

  const mainTab = computed<MainTab>({
    get: () => meta.value.mainTab,
    set: (val) => {
      meta.value.mainTab = val;
    },
  });

  const viewMode = computed<ViewMode>({
    get: () => meta.value.viewMode,
    set: (val) => {
      meta.value.viewMode = val;
    },
  });

  const canvasMode = computed<boolean>({
    get: () => meta.value.canvasMode,
    set: (val) => {
      meta.value.canvasMode = val;
    },
  });

  const isGenerating = computed<boolean>({
    get: () => meta.value.isGenerating,
    set: (val) => {
      meta.value.isGenerating = val;
    },
  });

  const isAnalyzing = computed<boolean>({
    get: () => meta.value.isAnalyzing,
    set: (val) => {
      meta.value.isAnalyzing = val;
    },
  });

  const error = computed<string | null>({
    get: () => meta.value.error,
    set: (val) => {
      meta.value.error = val;
    },
  });

  const showSettings = computed<boolean>({
    get: () => meta.value.showSettings,
    set: (val) => {
      meta.value.showSettings = val;
    },
  });

  const analysisTab = computed<AnalysisTab>({
    get: () => meta.value.analysisTab,
    set: (val) => {
      meta.value.analysisTab = val;
    },
  });

  const prompts = computed<PromptTemplates>({
    get: () => meta.value.prompts,
    set: (val) => {
      meta.value.prompts = { ...meta.value.prompts, ...val };
    },
  });

  const currentProject = computed<ProjectData | null>(() => {
    if (!meta.value.currentProjectId) return null;
    return projects.value.find((p) => p.id === meta.value.currentProjectId) || null;
  });

  const projectSettings = computed<GenerationSettings>(() => {
    return currentProject.value?.settings || createDefaultSettings();
  });

  const projectReferenceImages = computed<Asset[]>(() => {
    return currentProject.value?.referenceImages || [];
  });

  const projectAnalysisResult = computed<string>({
    get: () => currentProject.value?.analysisResult || "",
    set: (val: string) => {
      const project = currentProject.value;
      if (!project) return;
      project.analysisResult = val;
      project.updatedAt = Date.now();
    },
  });

  const projectStoryboardItems = computed<StoryboardItem[]>({
    get: () => currentProject.value?.storyboardItems || [],
    set: (val: StoryboardItem[]) => {
      const project = currentProject.value;
      if (!project) return;
      project.storyboardItems = val;
      project.updatedAt = Date.now();
    },
  });

  const projectGeneratedImages = computed<GeneratedImage[]>({
    get: () => currentProject.value?.generatedImages || [],
    set: (val: GeneratedImage[]) => {
      const project = currentProject.value;
      if (!project) return;
      project.generatedImages = val;
      project.updatedAt = Date.now();
    },
  });

  const projectShowStoryboardImages = computed<boolean>({
    get: () => currentProject.value?.showStoryboardImages || false,
    set: (val: boolean) => {
      const project = currentProject.value;
      if (!project) return;
      project.showStoryboardImages = val;
      project.updatedAt = Date.now();
    },
  });

  const projectSelectedImageId = computed<string | null>({
    get: () => currentProject.value?.selectedImageId || null,
    set: (val: string | null) => {
      const project = currentProject.value;
      if (!project) return;
      project.selectedImageId = val;
      project.updatedAt = Date.now();
    },
  });

  function updateConfig(newConfig: Partial<GeminiConfig>) {
    meta.value.config = {
      ...meta.value.config,
      ...newConfig,
    };
  }

  function createProject(name: string) {
    const baseConfig = meta.value.config;
    const settings: GenerationSettings = {
      prompt: "",
      aspectRatio: baseConfig.aspectRatio || "16:9",
      resolution: "1024x1024",
      storyboardLayout: (baseConfig.storyboardLayout as StoryboardLayout) || "3x3",
      directorInstructions: [],
    };

    const project: ProjectData = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `project-${Date.now().toString(36)}`,
      name: name || `项目 ${projects.value.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings,
      referenceImages: [],
      analysisResult: "",
      storyboardItems: createDefaultStoryboardItems(
        settings.storyboardLayout as StoryboardLayout
      ),
      generatedImages: [],
      showStoryboardImages: false,
      selectedImageId: null,
    };

    projects.value.push(project);
    saveProjectToStorage(project);
    meta.value.currentProjectId = project.id;
    selectedImage.value = null;
    meta.value.canvasMode = false;
  }

  function updateProjectName(id: string, name: string) {
    const project = projects.value.find((p) => p.id === id);
    if (!project) return;
    project.name = name;
    project.updatedAt = Date.now();
    saveProjectToStorage(project);
  }

  function deleteProject(id: string) {
    if (projects.value.length <= 1) {
      // 至少保留一个项目
      return;
    }
    const index = projects.value.findIndex((p) => p.id === id);
    if (index === -1) return;

    const isCurrent = meta.value.currentProjectId === id;
    const removed = projects.value[index];
    projects.value.splice(index, 1);
    deleteProjectFromStorage(removed.id);

    if (isCurrent) {
      const next = projects.value[0];
      meta.value.currentProjectId = next ? next.id : null;
      selectedImage.value = null;
      meta.value.canvasMode = false;
    }
  }

  function setCurrentProject(id: string) {
    const project = projects.value.find((p) => p.id === id);
    if (!project) return;
    meta.value.currentProjectId = id;
    // 按项目记录的选中图片优先恢复
    if (project.selectedImageId) {
      const found = project.generatedImages.find((img) => img.id === project.selectedImageId);
      selectedImage.value = found || (project.generatedImages.length > 0 ? project.generatedImages[0] : null);
    } else {
      selectedImage.value =
        project.generatedImages.length > 0 ? project.generatedImages[0] : null;
    }
    meta.value.canvasMode = false;
  }

  function resetPromptsToDefault() {
    meta.value.prompts = {
      finalPrompt: finalPromptTemplate,
      imageAnalysis: imageAnalysisPrompt,
      singleStoryboard: singleStoryboardPrompt,
      batchStoryboard: batchStoryboardPrompt,
    };
  }

  function updatePrompt(partial: Partial<PromptTemplates>) {
    meta.value.prompts = {
      ...meta.value.prompts,
      ...partial,
    };
  }

  return {
    // 元信息 & 项目
    meta,
    config,
    projects,
    currentProjectId,
    currentProject,
    projectSettings,
    projectReferenceImages,
    projectAnalysisResult,
    projectStoryboardItems,
    projectGeneratedImages,
    projectShowStoryboardImages,
    projectSelectedImageId,
    prompts,
    mainTab,
    viewMode,
    canvasMode,
    isGenerating,
    isAnalyzing,
    error,
    showSettings,
    analysisTab,
    selectedImage,
    updateConfig,
    createProject,
    updateProjectName,
    deleteProject,
    setCurrentProject,
    resetPromptsToDefault,
    updatePrompt,
    createDefaultStoryboardItems,
  };
});
