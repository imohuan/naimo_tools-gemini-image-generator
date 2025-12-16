<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col border border-slate-200"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-xl"
      >
        <div>
          <h2 class="text-lg font-semibold text-slate-900">设置</h2>
        </div>
        <button
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-600 transition-all rounded-lg p-1 hover:bg-slate-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- Base URL -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">
            Base URL
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="localConfig.baseUrl"
            type="text"
            placeholder="https://yunwu.apifox.cn"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm transition-all"
          />
          <p class="text-xs text-slate-500 mt-1">API 服务的基础 URL</p>
        </div>

        <!-- API Key -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">
            API Key
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="localConfig.apiKey"
            type="password"
            placeholder="请输入您的 API Key"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm transition-all"
          />
          <p class="text-xs text-slate-500 mt-1">您的 Gemini API Key</p>
        </div>

        <!-- 图片生成模型 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">
            图片生成模型
          </label>
          <div class="flex gap-2">
            <select
              v-model="localConfig.model"
              class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm transition-all bg-white"
              :disabled="loadingModels"
            >
              <option v-if="loadingModels" value="">加载中...</option>
              <option v-else-if="imageModels.length === 0" value="">暂无可用模型</option>
              <option v-for="model in imageModels" :key="model.id" :value="model.id">
                {{ model.id }}
              </option>
            </select>
            <button
              @click="loadModels"
              :disabled="loadingModels || !localConfig.baseUrl || !localConfig.apiKey"
              class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="刷新模型列表"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                :class="{ 'animate-spin': loadingModels }"
              >
                <path
                  d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
                />
              </svg>
            </button>
          </div>
          <p class="text-xs text-slate-500 mt-1">用于生成图片的 Gemini 模型</p>
        </div>

        <!-- 分镜模型 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">
            分镜模型
          </label>
          <div class="flex gap-2">
            <select
              v-model="localConfig.storyboardModel"
              class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm transition-all bg-white"
              :disabled="loadingModels"
            >
              <option v-if="loadingModels" value="">加载中...</option>
              <option v-else-if="storyboardModels.length === 0" value="">
                暂无可用模型
              </option>
              <option v-for="model in storyboardModels" :key="model.id" :value="model.id">
                {{ model.id }}
              </option>
            </select>
            <button
              @click="loadModels"
              :disabled="loadingModels || !localConfig.baseUrl || !localConfig.apiKey"
              class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="刷新模型列表"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                :class="{ 'animate-spin': loadingModels }"
              >
                <path
                  d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
                />
              </svg>
            </button>
          </div>
          <p class="text-xs text-slate-500 mt-1">用于生成分镜的 Gemini 模型</p>
        </div>

        <!-- 分隔线 -->
        <div class="border-t border-slate-200 my-4"></div>

        <!-- 图片生成设置标题 -->
        <div class="mb-2">
          <h3 class="text-sm font-semibold text-slate-900">图片生成设置</h3>
        </div>

        <!-- 图片构图 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">
            图片构图
          </label>
          <div class="flex gap-2">
            <button
              v-for="layout in ['2x2', '3x3']"
              :key="layout"
              @click="localConfig.storyboardLayout = layout as '2x2' | '3x3'"
              :class="[
                'flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-all shadow-sm',
                localConfig.storyboardLayout === layout
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50',
              ]"
            >
              {{ layout }}
            </button>
          </div>
          <p class="text-xs text-slate-500 mt-1">选择分镜的布局方式</p>
        </div>

        <!-- 图片宽高比 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">
            图片宽高比
          </label>
          <select
            v-model="localConfig.aspectRatio"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm transition-all bg-white"
          >
            <option value="1:1">1:1 (正方形)</option>
            <option value="2:3">2:3 (竖屏)</option>
            <option value="3:2">3:2 (横屏)</option>
            <option value="3:4">3:4 (竖屏)</option>
            <option value="4:3">4:3 (横屏)</option>
            <option value="4:5">4:5 (竖屏)</option>
            <option value="5:4">5:4 (横屏)</option>
            <option value="9:16">9:16 (手机竖屏)</option>
            <option value="16:9">16:9 (宽屏)</option>
            <option value="21:9">21:9 (超宽屏)</option>
          </select>
          <p class="text-xs text-slate-500 mt-1">选择生成图片的宽高比</p>
        </div>

        <!-- 图片质量/分辨率 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">
            图片质量
          </label>
          <select
            v-model="localConfig.imageSize"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm transition-all bg-white"
          >
            <option value="1K">1K (1024px) - 标准质量</option>
            <option value="2K">2K (2048px) - 高质量</option>
            <option value="4K">4K (4096px) - 超高质量</option>
          </select>
          <p class="text-xs text-slate-500 mt-1">选择生成图片的分辨率，分辨率越高质量越好但消耗更多 token</p>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div
        class="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-white rounded-b-xl"
      >
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all shadow-sm hover:shadow"
        >
          关闭
        </button>
        <div class="flex gap-3">
          <button
            @click="handleSave"
            class="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { GeminiConfig } from "../types";
import { fetchModels, type ModelInfo } from "../services/geminiService";

interface Props {
  show: boolean;
  config: GeminiConfig;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  save: [config: GeminiConfig];
}>();

const localConfig = ref<GeminiConfig>({
  ...props.config,
  aspectRatio: props.config.aspectRatio || '16:9',
  imageSize: props.config.imageSize || '1K',
  storyboardLayout: props.config.storyboardLayout || '3x3',
});
const loadingModels = ref(false);
const allModels = ref<ModelInfo[]>([]);
const imageModels = ref<ModelInfo[]>([]);
const storyboardModels = ref<ModelInfo[]>([]);

watch(
  () => props.config,
  (newConfig) => {
    localConfig.value = {
      ...newConfig,
      aspectRatio: newConfig.aspectRatio || '16:9',
      imageSize: newConfig.imageSize || '1K',
      storyboardLayout: newConfig.storyboardLayout || '3x3',
    };
  },
  { deep: true }
);

watch(
  () => props.show,
  (show) => {
    if (show) {
      localConfig.value = {
        ...props.config,
        aspectRatio: props.config.aspectRatio || '16:9',
        imageSize: props.config.imageSize || '1K',
        storyboardLayout: props.config.storyboardLayout || '3x3',
      };
      // 打开时自动加载模型列表
      if (localConfig.value.baseUrl && localConfig.value.apiKey) {
        loadModels();
      }
    }
  }
);

async function loadModels() {
  if (!localConfig.value.baseUrl || !localConfig.value.apiKey) {
    return;
  }

  loadingModels.value = true;
  try {
    const models = await fetchModels(localConfig.value);
    allModels.value = models;
    // 过滤出图片生成相关的模型（可以根据实际 API 返回的模型名称进行过滤）
    imageModels.value = models.filter((model) =>
      model.id.toLowerCase().includes('image') ||
      model.id.toLowerCase().includes('gemini')
    );
    // 分镜模型可以使用相同的模型列表，或者根据实际需求过滤
    storyboardModels.value = models.filter((model) =>
      model.id.toLowerCase().includes('image') ||
      model.id.toLowerCase().includes('gemini')
    );

    // 如果没有过滤到模型，使用全部模型
    if (imageModels.value.length === 0) {
      imageModels.value = models;
    }
    if (storyboardModels.value.length === 0) {
      storyboardModels.value = models;
    }
  } catch (error: any) {
    console.error("加载模型列表失败:", error);
    // 如果获取失败，使用默认模型
    imageModels.value = [];
    storyboardModels.value = [];
  } finally {
    loadingModels.value = false;
  }
}

function handleSave() {
  emit("save", { ...localConfig.value });
  emit("close");
}
</script>
