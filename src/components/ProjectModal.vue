<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col border border-slate-200"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-t-xl"
      >
        <h2 class="text-sm font-semibold text-slate-900">
          {{ editingId ? "编辑项目" : "新建项目" }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-600 transition-all rounded-lg p-1 hover:bg-slate-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
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

      <!-- 内容 -->
      <div class="px-5 py-4 space-y-4 overflow-y-auto">
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1.5">
            项目名称
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="请输入项目名称"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm shadow-sm"
          />
        </div>
      </div>

      <!-- 底部按钮 -->
      <div
        class="px-5 py-3 border-t border-slate-200 flex justify-end gap-2 bg-white rounded-b-xl"
      >
        <button
          @click="$emit('close')"
          class="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
        >
          取消
        </button>
        <button
          @click="$emit('save', name)"
          class="px-5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1.5"
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
            <polyline points="20 6 9 17 4 12" />
          </svg>
          确认
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  show: boolean;
  initialName?: string;
  editingId?: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  save: [name: string];
}>();

const name = ref(props.initialName || "");
const editingId = ref<string | null>(props.editingId || null);

watch(
  () => props.show,
  (val) => {
    if (val) {
      name.value = props.initialName || "";
      editingId.value = props.editingId || null;
    }
  }
);
</script>
