<template>
  <div class="flex flex-col">
    <!-- 上传区域 -->
    <div
      @click="triggerFileInput"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      :class="[
        'mx-3 mb-3 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all',
        isDragging
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50',
      ]"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />
      <div class="flex flex-col items-center justify-center text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          :class="isDragging ? 'text-indigo-600' : 'text-slate-400'"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
        <p class="mt-2 text-xs font-medium text-slate-700">
          {{ isDragging ? "松开以上传" : "点击或拖拽上传图片" }}
        </p>
        <p class="mt-1 text-xs text-slate-500">支持 JPG、PNG、WebP 等格式</p>
      </div>
    </div>

    <!-- 素材列表 -->
    <div class="px-3 pb-4">
      <div v-if="assets.length === 0" class="text-center py-8">
        <p class="text-xs text-slate-400">暂无素材</p>
      </div>
      <div v-else class="grid grid-cols-3 gap-2">
        <div
          v-for="asset in assets"
          :key="asset.id"
          class="group relative rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-300 transition-all"
        >
          <div class="aspect-square bg-slate-100 flex items-center justify-center">
            <img :src="asset.url" :alt="asset.name" class="w-full h-full object-cover" />
          </div>
          <!-- 悬停时显示操作按钮 -->
          <div
            class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
          >
            <button
              @click.stop="handleViewAsset(asset)"
              class="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
              title="查看"
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
                class="text-slate-700"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            <button
              @click.stop="handleDeleteAsset(asset)"
              class="p-2 bg-red-500/90 hover:bg-red-500 rounded-lg transition-colors"
              title="删除"
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
                class="text-white"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
          <!-- 底部文件名 -->
          <div
            class="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-2 py-1 truncate"
          >
            {{ asset.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- 预览对话框 -->
    <div
      v-if="previewAsset"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      @click.self="previewAsset = null"
    >
      <div class="relative max-w-4xl max-h-[90vh] mx-4">
        <button
          @click="previewAsset = null"
          class="absolute -top-10 right-0 text-white hover:text-slate-300 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
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
        <img
          :src="previewAsset.url"
          :alt="previewAsset.name"
          class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
        <div
          class="absolute bottom-0 left-0 right-0 bg-black/70 text-white px-4 py-2 rounded-b-lg"
        >
          <p class="text-sm font-medium">{{ previewAsset.name }}</p>
          <p class="text-xs text-slate-300 mt-1">
            {{ formatFileSize(previewAsset.size) }} ·
            {{ formatDate(previewAsset.timestamp) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import type { Asset } from "../types";
import { compressImage } from "../utils/imageCompression";

interface Props {
  assets: Asset[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "add-assets": [assets: Asset[]];
  "delete-asset": [assetId: string];
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const previewAsset = ref<Asset | null>(null);

function triggerFileInput() {
  fileInputRef.value?.click();
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  await processFiles(files);
  // 清空输入，以便可以选择相同文件
  if (target) {
    target.value = "";
  }
}

async function handleDrop(event: DragEvent) {
  isDragging.value = false;
  const files = Array.from(event.dataTransfer?.files || []);
  await processFiles(files);
}

async function processFiles(files: File[]) {
  const imageFiles = files.filter((file) => file.type.startsWith("image/"));
  if (imageFiles.length === 0) return;

  const newAssets: Asset[] = [];

  for (const file of imageFiles) {
    try {
      const url = URL.createObjectURL(file);
      // 压缩图片以减少存储空间
      const base64 = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        format: "image/jpeg", // 统一使用 JPEG 格式以减小体积
      });

      const asset: Asset = {
        id: generateId(),
        name: file.name,
        url,
        base64,
        timestamp: Date.now(),
        size: file.size, // 保留原始文件大小用于显示
        type: "image/jpeg", // 压缩后统一为 JPEG
      };

      newAssets.push(asset);
    } catch (error) {
      console.error("处理文件失败:", file.name, error);
    }
  }

  if (newAssets.length > 0) {
    emit("add-assets", newAssets);
  }
}

// fileToBase64 函数已移除，改用 compressImage

function generateId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function handleViewAsset(asset: Asset) {
  previewAsset.value = asset;
}

function handleDeleteAsset(asset: Asset) {
  if (confirm(`确定要删除 "${asset.name}" 吗？`)) {
    // 释放 URL
    if (asset.url.startsWith("blob:")) {
      URL.revokeObjectURL(asset.url);
    }
    emit("delete-asset", asset.id);
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// 清理 URL
onUnmounted(() => {
  props.assets.forEach((asset) => {
    if (asset.url.startsWith("blob:")) {
      URL.revokeObjectURL(asset.url);
    }
  });
});
</script>
