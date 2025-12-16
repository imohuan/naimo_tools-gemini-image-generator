<template>
  <aside
    class="w-96 flex flex-col border-l border-slate-200 bg-white shadow-sm"
  >
    <!-- 标题栏 -->
    <div class="px-5 py-4 border-b border-slate-200">
      <h2 class="text-sm font-semibold text-slate-700">03. 监视器 (INSPECTOR)</h2>
      <p class="text-xs text-slate-500 mt-0.5">图片详情</p>
    </div>

    <!-- 内容区域 -->
    <div v-if="image" class="flex-1 overflow-y-auto">
      <!-- 图片预览 -->
      <div class="p-5 border-b border-slate-200">
        <div class="relative rounded-xl overflow-hidden shadow-lg bg-slate-50">
          <img
            :src="`data:image/png;base64,${image.imageBase64}`"
            alt="预览"
            class="w-full h-auto"
          />
        </div>
      </div>

      <!-- 标签页 -->
      <div class="border-b border-slate-200">
        <div class="flex">
          <button
            @click="activeTab = 'details'"
            :class="[
              'px-5 py-3 text-sm font-medium transition-colors border-b-2',
              activeTab === 'details'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-slate-500 border-transparent hover:text-slate-700',
            ]"
          >
            详情
          </button>
          <button
            @click="activeTab = 'analysis'"
            :class="[
              'px-5 py-3 text-sm font-medium transition-colors border-b-2',
              activeTab === 'analysis'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-slate-500 border-transparent hover:text-slate-700',
            ]"
          >
            AI 智能分析
          </button>
        </div>
      </div>

      <!-- 详情标签页 -->
      <div v-if="activeTab === 'details'" class="p-5 space-y-5">
        <!-- 元数据 -->
        <div>
          <h3 class="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
            元数据
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-500">类型</span>
              <span class="text-sm font-medium text-slate-900">渲染图</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-500">格式</span>
              <span class="text-sm font-medium text-slate-900">{{ image.aspectRatio }}</span>
            </div>
            <div class="flex items-start justify-between">
              <span class="text-sm text-slate-500">ID</span>
              <span
                class="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded break-all"
              >
                {{ image.id }}
              </span>
            </div>
          </div>
        </div>

        <!-- 提示词 -->
        <div>
          <h3 class="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
            提示词
          </h3>
          <div
            class="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-200 max-h-32 overflow-y-auto"
          >
            {{ image.prompt }}
          </div>
        </div>

        <!-- 下载按钮 -->
        <button
          @click="handleDownload"
          class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          下载文件
        </button>
      </div>

      <!-- AI 智能分析标签页 -->
      <div v-if="activeTab === 'analysis'" class="p-5">
        <div class="text-sm text-slate-500 text-center py-8">
          AI 智能分析功能开发中...
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-else
      class="flex-1 flex items-center justify-center text-slate-400 p-5"
    >
      <div class="text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="mx-auto mb-3 opacity-50"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <p class="text-sm">选择一张图片查看详情</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { GeneratedImage } from '../types';

interface Props {
  image: GeneratedImage | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  download: [image: GeneratedImage];
}>();

const activeTab = ref<'details' | 'analysis'>('details');

watch(
  () => props.image,
  () => {
    activeTab.value = 'details';
  }
);

function handleDownload() {
  if (props.image) {
    emit('download', props.image);
  }
}
</script>

