<template>
  <div class="flex-1 flex flex-col overflow-hidden bg-slate-50">
    <div class="px-6 py-4 flex-shrink-0">
      <!-- 顶部工具栏 -->
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <!-- 退出画布按钮 -->
          <button
            v-if="canvasMode"
            @click="$emit('exit-canvas')"
            class="p-2 rounded-lg transition-all text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            title="退出画布"
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
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 class="text-sm font-semibold text-slate-700">画布 CANVAS</h2>
          <span class="text-xs text-slate-500">/ {{ images.length }} 张图片</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="!canvasMode && images.length > 1"
            @click="$emit('view-mode-change', 'grid')"
            :class="[
              'p-2 rounded-lg transition-all',
              viewMode === 'grid'
                ? 'bg-indigo-100 text-indigo-600 shadow-sm'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600',
            ]"
            title="网格视图"
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
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
          </button>
          <button
            v-if="!canvasMode && images.length > 1"
            @click="$emit('view-mode-change', 'list')"
            :class="[
              'p-2 rounded-lg transition-all',
              viewMode === 'list'
                ? 'bg-indigo-100 text-indigo-600 shadow-sm'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600',
            ]"
            title="列表视图"
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
              <line x1="8" x2="21" y1="6" y2="6" />
              <line x1="8" x2="21" y1="12" y2="12" />
              <line x1="8" x2="21" y1="18" y2="18" />
              <line x1="3" x2="3.01" y1="6" y2="6" />
              <line x1="3" x2="3.01" y1="12" y2="12" />
              <line x1="3" x2="3.01" y1="18" y2="18" />
            </svg>
          </button>
          <button
            v-if="images.length > 0"
            @click="$emit('batch-download')"
            class="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-indigo-300 transition-all shadow-sm"
          >
            {{ images.length > 1 ? "批量下载 ZIP" : "下载图片" }}
          </button>
          <!-- 进入画布按钮 -->
          <button
            v-if="!canvasMode && selectedImage"
            @click="$emit('enter-canvas')"
            class="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1.5"
            title="进入画布"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            进入画布
          </button>
        </div>
      </div>
    </div>

    <!-- 画布内容区域 -->
    <div
      ref="containerRef"
      class="flex-1 min-h-0 flex flex-col image-grid-container relative"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragenter.prevent="handleDragEnter"
      @dragleave.prevent="handleDragLeave"
      :class="isDragging ? 'bg-indigo-50' : ''"
      tabindex="0"
    >
      <!-- 单张图片大图展示（画布模式） -->
      <div v-if="canvasMode && selectedImage" class="flex-1 min-h-0 p-6 pt-0">
        <ZoomableCanvas
          class="w-full h-full"
          :show-delete="true"
          @delete="handleDeleteImage(selectedImage.id)"
        >
          <div
            class="relative rounded-xl overflow-visible shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-indigo-500 ring-2 ring-indigo-200"
          >
            <div
              class="absolute inset-0 bg-slate-200 animate-pulse rounded-xl"
              v-if="selectedImage && !selectedImage.imageBase64"
            />
            <img
              v-if="selectedImage && selectedImage.imageBase64"
              ref="imageRef"
              :src="`data:image/png;base64,${selectedImage.imageBase64}`"
              alt="生成的图片"
              class="block max-w-none pointer-events-none rounded-xl"
              draggable="false"
              @load="handleImageLoad"
            />

            <!-- 分割线和可点击区域 -->
            <div
              v-if="selectedImage && selectedImage.imageBase64 && imageLoaded"
              class="absolute inset-0"
            >
              <!-- SVG 分割线 -->
              <svg
                class="absolute inset-0 w-full h-full pointer-events-none"
                :style="{ width: imageWidth + 'px', height: imageHeight + 'px' }"
              >
                <!-- 垂直分割线 -->
                <line
                  v-for="(x, i) in verticalLines"
                  :key="`v-${i}`"
                  :x1="x"
                  :y1="0"
                  :x2="x"
                  :y2="imageHeight"
                  stroke="#3b82f6"
                  stroke-width="2"
                  stroke-dasharray="4 4"
                  opacity="0.8"
                />
                <!-- 水平分割线 -->
                <line
                  v-for="(y, i) in horizontalLines"
                  :key="`h-${i}`"
                  :x1="0"
                  :y1="y"
                  :x2="imageWidth"
                  :y2="y"
                  stroke="#3b82f6"
                  stroke-width="2"
                  stroke-dasharray="4 4"
                  opacity="0.8"
                />
              </svg>

              <!-- 可点击区域 -->
              <div
                v-for="(region, index) in regions"
                :key="index"
                class="absolute cursor-pointer transition-all duration-200 pointer-events-auto region-item"
                :class="[
                  selectedRegionIndex === index
                    ? 'bg-indigo-500/20 ring-2 ring-indigo-500'
                    : hoveredRegionIndex === index
                    ? 'bg-indigo-500/10'
                    : '',
                ]"
                :style="{
                  left: region.x + 'px',
                  top: region.y + 'px',
                  width: region.width + 'px',
                  height: region.height + 'px',
                }"
                @click.stop="handleRegionClick(index)"
                @mouseenter="handleRegionHover(index, true)"
                @mouseleave="handleRegionHover(index, false)"
              >
                <!-- 区域标签 -->
                <div
                  class="absolute top-1 left-1 px-1.5 py-0.5 bg-indigo-500/80 text-white text-xs font-medium rounded pointer-events-none"
                  v-if="selectedRegionIndex === index"
                >
                  {{ index + 1 }}
                </div>

                <!-- 下载按钮（只在 hover 当前区域时显示） -->
                <button
                  v-if="
                    selectedImage &&
                    selectedImage.imageBase64 &&
                    hoveredRegionIndex === index
                  "
                  @click.stop="handleDownloadRegion(index)"
                  class="absolute top-1 right-1 z-10 px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-1 pointer-events-auto"
                  title="下载此区域"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
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
                </button>
              </div>
            </div>
          </div>
        </ZoomableCanvas>
      </div>

      <!-- 多张图片网格视图 -->
      <div
        v-else-if="!canvasMode && viewMode === 'grid' && images.length > 0"
        class="flex-1 min-h-0 overflow-auto p-6 pt-0"
      >
        <div :class="gridClass">
          <div
            v-for="(image, index) in images"
            :key="image.id"
            @click.stop="$emit('select-image', image)"
            :class="[
              'relative group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 aspect-video',
              selectedImage?.id === image.id
                ? 'border-indigo-500 ring-2 ring-indigo-200'
                : 'border-transparent hover:border-indigo-200',
            ]"
          >
            <div
              class="absolute inset-0 bg-slate-200 animate-pulse"
              v-if="!image.imageBase64"
            />
            <img
              v-else
              :src="`data:image/png;base64,${image.imageBase64}`"
              :alt="`生成的图片 ${index + 1}`"
              class="w-full h-full object-cover"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
            >
              <span class="text-white text-xs font-medium">
                图片 {{ index + 1 }}/{{ images.length }}
              </span>
            </div>
            <!-- 删除按钮 -->
            <button
              @click.stop="handleDeleteImage(image.id)"
              class="absolute top-2 right-2 z-10 p-1.5 bg-red-500/90 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
              title="删除图片"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div
        v-else-if="!canvasMode && viewMode === 'list' && images.length > 0"
        class="flex-1 min-h-0 overflow-auto p-6 pt-0"
      >
        <div class="space-y-3">
          <div
            v-for="(image, index) in images"
            :key="image.id"
            @click.stop="$emit('select-image', image)"
            :class="[
              'flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 group',
              selectedImage?.id === image.id
                ? 'bg-indigo-50 border-indigo-500 shadow-md'
                : 'bg-white border-transparent hover:border-indigo-200 hover:shadow-sm',
            ]"
          >
            <div class="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                v-if="image.imageBase64"
                :src="`data:image/png;base64,${image.imageBase64}`"
                alt="预览"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full bg-slate-200 animate-pulse" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-slate-900 truncate">
                图片 {{ index + 1 }}/{{ images.length }}
              </div>
              <div class="text-xs text-slate-500 mt-1 line-clamp-2">
                {{ image.prompt }}
              </div>
            </div>
            <div class="text-xs text-slate-400 flex-shrink-0">
              {{ formatTime(image.timestamp) }}
            </div>
            <!-- 删除按钮 -->
            <button
              @click.stop="handleDeleteImage(image.id)"
              class="p-1.5 bg-red-500/90 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
              title="删除图片"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="images.length === 0"
        class="flex-1 min-h-0 flex items-center justify-center p-6 pt-0"
      >
        <div class="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="mx-auto mb-4 text-slate-300"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <p class="text-sm text-slate-500">暂无生成的图片</p>
          <p class="text-xs text-slate-400 mt-1">
            拖拽图片到此处，或粘贴图片（Ctrl+V），或在分镜编辑中生成提示词后切换到图片结果标签页生成图片
          </p>
        </div>
      </div>

      <!-- 拖拽提示 -->
      <div
        v-if="isDragging"
        class="absolute inset-0 z-50 flex items-center justify-center bg-indigo-500/10 backdrop-blur-sm pointer-events-none"
      >
        <div
          class="bg-white rounded-xl shadow-xl p-8 border-2 border-dashed border-indigo-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="mx-auto mb-4 text-indigo-500"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
          <p class="text-lg font-medium text-indigo-600">松开鼠标以上传图片</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import ZoomableCanvas from "./ZoomableCanvas.vue";
import type { GeneratedImage } from "../types";

interface Props {
  images: GeneratedImage[];
  selectedImage: GeneratedImage | null;
  viewMode: "grid" | "list";
  layout: "2x2" | "3x3";
  canvasMode?: boolean;
}

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
  col: number;
  row: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "select-image": [image: GeneratedImage];
  "view-mode-change": [mode: "grid" | "list"];
  "batch-download": [];
  "delete-image": [imageId: string];
  "add-image": [image: GeneratedImage];
  "enter-canvas": [];
  "exit-canvas": [];
}>();

const imageRef = ref<HTMLImageElement | null>(null);
const imageLoaded = ref(false);
const imageWidth = ref(0);
const imageHeight = ref(0);
const selectedRegionIndex = ref<number | null>(null);
const hoveredRegionIndex = ref<number | null>(null);
const isDragging = ref(false);
const dragCounter = ref(0);
const containerRef = ref<HTMLElement | null>(null);

const gridClass = computed(() => {
  return props.layout === "2x2" ? "grid grid-cols-2 gap-4" : "grid grid-cols-3 gap-4";
});

// 计算分割线位置
const verticalLines = computed(() => {
  if (!imageLoaded.value || imageWidth.value === 0) return [];
  const cols = props.layout === "2x2" ? 2 : 3;
  const lines: number[] = [];
  for (let i = 1; i < cols; i++) {
    lines.push((imageWidth.value / cols) * i);
  }
  return lines;
});

const horizontalLines = computed(() => {
  if (!imageLoaded.value || imageHeight.value === 0) return [];
  const rows = props.layout === "2x2" ? 2 : 3;
  const lines: number[] = [];
  for (let i = 1; i < rows; i++) {
    lines.push((imageHeight.value / rows) * i);
  }
  return lines;
});

// 计算区域
const regions = computed<Region[]>(() => {
  if (!imageLoaded.value || imageWidth.value === 0 || imageHeight.value === 0) {
    return [];
  }

  const cols = props.layout === "2x2" ? 2 : 3;
  const rows = props.layout === "2x2" ? 2 : 3;
  const regionWidth = imageWidth.value / cols;
  const regionHeight = imageHeight.value / rows;

  const result: Region[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      result.push({
        x: col * regionWidth,
        y: row * regionHeight,
        width: regionWidth,
        height: regionHeight,
        col: col + 1,
        row: row + 1,
      });
    }
  }
  return result;
});

// 处理图片加载
function handleImageLoad() {
  if (!imageRef.value) return;

  nextTick(() => {
    imageWidth.value = imageRef.value!.naturalWidth || imageRef.value!.offsetWidth;
    imageHeight.value = imageRef.value!.naturalHeight || imageRef.value!.offsetHeight;
    imageLoaded.value = true;
  });
}

// 处理区域点击
function handleRegionClick(index: number) {
  if (selectedRegionIndex.value === index) {
    selectedRegionIndex.value = null;
  } else {
    selectedRegionIndex.value = index;
  }
}

// 处理区域 hover
function handleRegionHover(index: number, isEntering: boolean) {
  if (isEntering) {
    hoveredRegionIndex.value = index;
  } else {
    hoveredRegionIndex.value = null;
  }
}

// 下载选中的区域
async function handleDownloadRegion(regionIndex: number) {
  if (!props.selectedImage?.imageBase64) return;

  const region = regions.value[regionIndex];
  if (!region || !props.selectedImage) return;

  try {
    // 创建图片对象
    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = `data:image/png;base64,${props.selectedImage!.imageBase64}`;
    });

    // 创建 canvas 用于裁剪
    const canvas = document.createElement("canvas");
    canvas.width = region.width;
    canvas.height = region.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("无法创建 canvas 上下文");
    }

    // 绘制裁剪后的图片
    ctx.drawImage(
      img,
      region.x,
      region.y,
      region.width,
      region.height,
      0,
      0,
      region.width,
      region.height
    );

    // 转换为 blob 并下载
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error("图片转换失败");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `image_region_${regionIndex + 1}_${props.selectedImage!.id.slice(
        0,
        8
      )}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, "image/png");
  } catch (error) {
    console.error("下载区域失败:", error);
  }
}

// 监听选中图片变化，重置状态
watch(
  () => props.selectedImage?.id,
  () => {
    imageLoaded.value = false;
    selectedRegionIndex.value = null;
    hoveredRegionIndex.value = null;
    if (imageRef.value && imageRef.value.complete && props.canvasMode) {
      handleImageLoad();
    }
  }
);

// 监听布局变化，重置选中状态
watch(
  () => props.layout,
  () => {
    selectedRegionIndex.value = null;
  }
);

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 处理拖拽事件
function handleDragEnter(e: DragEvent) {
  e.preventDefault();
  dragCounter.value++;
  if (e.dataTransfer?.types.includes("Files")) {
    isDragging.value = true;
  }
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault();
  dragCounter.value--;
  if (dragCounter.value === 0) {
    isDragging.value = false;
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "copy";
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;
  dragCounter.value = 0;

  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFiles(Array.from(files));
  }
}

// 处理粘贴事件
function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  if (!items) return;

  const files: File[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf("image") !== -1) {
      const file = item.getAsFile();
      if (file) {
        files.push(file);
      }
    }
  }

  if (files.length > 0) {
    handleFiles(files);
  }
}

// 处理文件（拖拽或粘贴）
async function handleFiles(files: File[]) {
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      console.warn("跳过非图片文件:", file.name);
      continue;
    }

    try {
      const base64 = await fileToBase64(file);
      const imageId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const image: GeneratedImage = {
        id: imageId,
        imageBase64: base64,
        timestamp: Date.now(),
        prompt: `上传的图片: ${file.name}`,
        aspectRatio: "16:9",
      };

      emit("add-image", image);
    } catch (error) {
      console.error("处理图片文件失败:", error);
    }
  }
}

// 将文件转换为 base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 移除 data:image/xxx;base64, 前缀
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 删除图片
function handleDeleteImage(imageId: string) {
  if (confirm("确定要删除这张图片吗？")) {
    emit("delete-image", imageId);
  }
}

// 监听全局粘贴事件
function handleGlobalPaste(e: ClipboardEvent) {
  // 检查粘贴事件是否发生在当前组件内
  const target = e.target as HTMLElement;
  if (containerRef.value && containerRef.value.contains(target)) {
    handlePaste(e);
  }
}

onMounted(() => {
  window.addEventListener("paste", handleGlobalPaste);
});

onUnmounted(() => {
  window.removeEventListener("paste", handleGlobalPaste);
});
</script>
