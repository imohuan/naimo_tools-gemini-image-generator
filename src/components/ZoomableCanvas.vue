<template>
  <div
    ref="containerRef"
    class="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <div ref="contentRef" class="absolute" :style="transformStyle">
      <slot />
    </div>
    <!-- 重置按钮 -->
    <button
      @click="handleReset"
      class="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center text-slate-600 hover:text-slate-900"
      title="重置画布位置和缩放"
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
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
    </button>
    <!-- 删除按钮（在刷新按钮下面） -->
    <button
      v-if="showDelete"
      @click="handleDelete"
      class="absolute top-16 right-4 z-10 p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center text-red-600 hover:text-red-700"
      title="删除图片"
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
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

interface Props {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  showDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  minScale: 0.1,
  maxScale: 5,
  initialScale: 1,
  showDelete: false,
});

const emit = defineEmits<{
  delete: [];
}>();

const containerRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);

const scale = ref(props.initialScale);
const translateX = ref(0);
const translateY = ref(0);

const isDragging = ref(false);
const lastMouseX = ref(0);
const lastMouseY = ref(0);

const transformStyle = computed(() => {
  return {
    transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
    transformOrigin: "0 0",
  };
});

function handleWheel(event: WheelEvent) {
  event.preventDefault();

  if (!containerRef.value || !contentRef.value) return;

  // 获取容器在视口中的位置
  const containerRect = containerRef.value.getBoundingClientRect();

  // 鼠标在容器中的位置（相对于容器左上角）
  const mouseX = event.clientX - containerRect.left;
  const mouseY = event.clientY - containerRect.top;

  // 计算缩放增量
  const delta = event.deltaY > 0 ? 0.9 : 1.1;
  const newScale = Math.max(
    props.minScale,
    Math.min(props.maxScale, scale.value * delta)
  );

  // 计算鼠标指向的内容在内容坐标系中的位置
  // 鼠标在容器中的位置减去当前的平移，再除以当前缩放，得到内容坐标系中的位置
  const contentX = (mouseX - translateX.value) / scale.value;
  const contentY = (mouseY - translateY.value) / scale.value;

  // 调整平移量，使得缩放后鼠标指向的内容位置保持不变
  // 新的平移 = 鼠标位置 - 内容位置 * 新缩放
  translateX.value = mouseX - contentX * newScale;
  translateY.value = mouseY - contentY * newScale;

  scale.value = newScale;
}

function handleMouseDown(event: MouseEvent) {
  if (event.button !== 0) return;
  isDragging.value = true;
  lastMouseX.value = event.clientX;
  lastMouseY.value = event.clientY;
  event.preventDefault();
}

function handleMouseMove(event: MouseEvent) {
  if (!isDragging.value) return;

  const deltaX = event.clientX - lastMouseX.value;
  const deltaY = event.clientY - lastMouseY.value;

  translateX.value += deltaX;
  translateY.value += deltaY;

  lastMouseX.value = event.clientX;
  lastMouseY.value = event.clientY;
}

function handleMouseUp() {
  isDragging.value = false;
}

function resetTransform() {
  scale.value = props.initialScale;
  // 使用 nextTick 确保缩放更新后再居中
  setTimeout(() => {
    centerContent();
  }, 0);
}

function centerContent() {
  if (!containerRef.value || !contentRef.value) return;

  const containerRect = containerRef.value.getBoundingClientRect();
  const contentRect = contentRef.value.getBoundingClientRect();

  // 获取内容的实际尺寸（考虑当前缩放）
  const contentWidth = contentRect.width / scale.value;
  const contentHeight = contentRect.height / scale.value;

  // 计算居中位置
  translateX.value = (containerRect.width - contentWidth * scale.value) / 2;
  translateY.value = (containerRect.height - contentHeight * scale.value) / 2;
}

function handleReset(event: MouseEvent) {
  event.stopPropagation();
  resetTransform();
}

function handleDelete(event: MouseEvent) {
  event.stopPropagation();
  emit("delete");
}

defineExpose({
  resetTransform,
  centerContent,
  scale,
  translateX,
  translateY,
});

onMounted(() => {
  centerContent();
});
</script>
