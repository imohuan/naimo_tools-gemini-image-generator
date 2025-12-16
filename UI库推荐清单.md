# Vue + Tailwind CSS UI 功能库推荐清单

## 一、定位与弹出层（类似 Floating UI）

### 1. **@floating-ui/vue** ⭐ 推荐

- **用途**：Dropdown、Tooltip、Popover 等所有需要位置计算的组件
- **特点**：无样式、纯逻辑，完全自定义样式
- **安装**：`pnpm add @floating-ui/vue`
- **优势**：被 Radix UI、Headless UI 等知名库底层使用
- **文档**：https://floating-ui.com/docs/vue

### 2. **@floating-ui/dom**

- **用途**：如果只需要 DOM 层面的位置计算（非 Vue 专用）
- **特点**：更轻量，适合手动控制场景

---

## 二、Headless UI 库（功能完整 + 可自定义样式）

### 1. **Radix Vue** ⭐⭐⭐ 强烈推荐

- **特点**：完全无样式，提供完整的可访问性和交互逻辑
- **组件**：Dialog、Dropdown、Popover、Select、Tabs、Tooltip、Accordion 等
- **安装**：`pnpm add radix-vue`
- **优势**：
  - 底层使用 @floating-ui
  - 完整的键盘导航、焦点管理、ARIA 属性
  - 完全自定义样式（用 Tailwind 即可）
- **文档**：https://www.radix-vue.com/
- **示例**：

```vue
<script setup>
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "radix-vue";
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger class="px-4 py-2 bg-indigo-600 text-white rounded">
      打开菜单
    </DropdownMenuTrigger>
    <DropdownMenuContent class="bg-white shadow-lg rounded p-2">
      <!-- 完全自定义样式 -->
    </DropdownMenuContent>
  </DropdownMenuRoot>
</template>
```

### 2. **Headless UI Vue**

- **特点**：Tailwind 官方团队开发，与 Tailwind 完美集成
- **组件**：Dialog、Disclosure、Listbox、Menu、Popover、Switch、Tabs 等
- **安装**：`pnpm add @headlessui/vue`
- **文档**：https://headlessui.com/vue/menu
- **优势**：与 Tailwind CSS 设计理念一致

### 3. **VueUse**

- **特点**：Vue 组合式函数集合，包含很多 UI 相关的 hooks
- **安装**：`pnpm add @vueuse/core`
- **相关功能**：
  - `useFocusTrap` - 焦点陷阱
  - `useClickOutside` - 点击外部检测
  - `useIntersectionObserver` - 交叉观察器
  - `useElementVisibility` - 元素可见性
  - `useWindowScroll` - 窗口滚动
  - `useDraggable` - 拖拽功能
- **文档**：https://vueuse.org/

---

## 三、特定功能库

### 画布/缩放相关

#### 1. **@vueuse/gesture** / **@vueuse/motion**

- **用途**：手势识别、动画、拖拽
- **安装**：`pnpm add @vueuse/gesture @vueuse/motion`

#### 2. **panzoom** / **@panzoom/panzoom**

- **用途**：画布平移和缩放
- **安装**：`pnpm add panzoom`
- **特点**：轻量、高性能，支持触摸和鼠标
- **文档**：https://github.com/timmywil/panzoom

#### 3. **fabric.js** / **konva.js**

- **用途**：完整的画布库（如果需求复杂）
- **特点**：功能强大但体积较大

#### 4. **vue-draggable-plus**

- **用途**：拖拽排序、拖拽布局
- **安装**：`pnpm add vue-draggable-plus`
- **文档**：https://alfred-skyblue.github.io/vue-draggable-plus/

### 分割面板（Split Panel）

#### 1. **split-pane-vue** ⭐ 推荐

- **安装**：`pnpm add split-pane-vue`
- **特点**：Vue 3 专用，支持水平和垂直分割
- **文档**：https://github.com/tomdyqin/split-pane-vue

#### 2. **vue-split-panel**

- **安装**：`pnpm add vue-split-panel`
- **特点**：简单易用

#### 3. **allotment**（Vue 版本）

- **安装**：`pnpm add allotment`
- **特点**：功能强大，支持嵌套分割
- **文档**：https://github.com/johnwalley/allotment

### Tooltip

#### 1. **@floating-ui/vue** + 自定义

- **推荐**：使用 Floating UI 自己实现，完全可控

#### 2. **Radix Vue Tooltip**

- **安装**：`pnpm add radix-vue`
- **特点**：完整的可访问性支持

### 日期选择器

#### 1. **@vuepic/vue-datepicker**

- **安装**：`pnpm add @vuepic/vue-datepicker`
- **特点**：Vue 3，可自定义样式

#### 2. **vue-date-picker**

- **安装**：`pnpm add vue-date-picker`
- **特点**：轻量、无依赖

### 虚拟滚动

#### 1. **vue-virtual-scroller**

- **安装**：`pnpm add vue-virtual-scroller`
- **用途**：大列表性能优化

#### 2. **vue-virtual-scroll-list**

- **安装**：`pnpm add vue-virtual-scroll-list`

### 拖拽排序

#### 1. **vue-draggable-plus** ⭐ 推荐

- **安装**：`pnpm add vue-draggable-plus`
- **特点**：Vue 3 专用，性能好

#### 2. **vuedraggable**

- **安装**：`pnpm add vuedraggable`
- **特点**：老牌库，功能稳定

### 表格

#### 1. **@tanstack/vue-table**

- **安装**：`pnpm add @tanstack/vue-table`
- **特点**：Headless 表格库，完全自定义样式
- **文档**：https://tanstack.com/table/latest/docs/framework/vue/overview

### 表单验证

#### 1. **vee-validate**

- **安装**：`pnpm add vee-validate yup`（或 zod）
- **特点**：Vue 专用，支持复杂验证规则

### 模态框/对话框

#### 1. **Radix Vue Dialog**

- **安装**：`pnpm add radix-vue`
- **特点**：完全无样式，可自定义

#### 2. **@headlessui/vue Dialog**

- **安装**：`pnpm add @headlessui/vue`

### 选择器（Select/Combobox）

#### 1. **Radix Vue Select**

- **安装**：`pnpm add radix-vue`
- **特点**：完全可自定义样式

#### 2. **@headlessui/vue Listbox**

- **安装**：`pnpm add @headlessui/vue`

### 文件上传

#### 1. **vue-dropzone** / **vue3-dropzone**

- **安装**：`pnpm add vue3-dropzone`
- **特点**：拖拽上传

### 代码编辑器

#### 1. **@codemirror/view** + **@codemirror/state**

- **安装**：`pnpm add @codemirror/view @codemirror/state`
- **特点**：现代代码编辑器核心

#### 2. **monaco-editor**

- **安装**：`pnpm add monaco-editor`
- **特点**：VS Code 编辑器（体积较大）

### 颜色选择器

#### 1. **@vueuse/color**

- **安装**：`pnpm add @vueuse/color`
- **特点**：颜色工具函数

#### 2. **vue-colorful**

- **安装**：`pnpm add vue-colorful`
- **特点**：轻量颜色选择器组件

### 树形组件

#### 1. **vue3-tree**

- **安装**：`pnpm add vue3-tree`
- **特点**：可自定义样式

### 分页

#### 1. **vue-paginate**

- **安装**：`pnpm add vue-paginate`
- **特点**：简单分页组件

---

## 四、推荐的技术栈组合

### 方案 A：最小化依赖（推荐）

```
@floating-ui/vue          # 所有定位相关
@vueuse/core              # 常用 hooks
panzoom                   # 画布缩放
split-pane-vue            # 分割面板
vue-draggable-plus        # 拖拽排序
```

### 方案 B：Headless UI 方案（功能完整）

```
radix-vue                 # 大部分 UI 组件（Dialog、Dropdown、Select、Tooltip 等）
@vueuse/core              # 补充 hooks
panzoom                   # 画布缩放
split-pane-vue            # 分割面板
@tanstack/vue-table       # 表格
```

### 方案 C：混合方案（平衡）

```
@floating-ui/vue          # 定位（自己实现简单组件）
radix-vue                 # 复杂组件（Dialog、Select）
@vueuse/core              # hooks
panzoom                   # 画布缩放
split-pane-vue            # 分割面板
```

---

## 五、实际使用建议

### 1. 定位相关（Dropdown、Tooltip、Popover）

- **首选**：`@floating-ui/vue`（你已经了解）
- **备选**：`radix-vue`（如果需要完整的可访问性支持）

### 2. 画布缩放

- **首选**：`panzoom`（轻量、高性能）
- **备选**：`@vueuse/gesture`（如果只需要简单手势）

### 3. 分割面板

- **首选**：`split-pane-vue`（Vue 3 专用）
- **备选**：`allotment`（如果需要嵌套分割）

### 4. Tooltip

- **首选**：`@floating-ui/vue` + 自定义（完全可控）
- **备选**：`radix-vue Tooltip`（如果需要完整功能）

### 5. 复杂组件（Dialog、Select、Tabs 等）

- **首选**：`radix-vue`（无样式、功能完整）
- **备选**：`@headlessui/vue`（Tailwind 官方）

---

## 六、快速开始示例

### 安装核心库

```bash
pnpm add @floating-ui/vue @vueuse/core radix-vue panzoom split-pane-vue
```

### 使用 Floating UI 实现 Tooltip

```vue
<script setup>
import { useFloating, autoUpdate, offset, shift, flip } from "@floating-ui/vue";
import { ref } from "vue";

const buttonRef = ref();
const tooltipRef = ref();
const isOpen = ref(false);

const { floatingStyles } = useFloating(buttonRef, tooltipRef, {
  whileElementsMounted: autoUpdate,
  placement: "top",
  middleware: [offset(8), shift(), flip()],
});
</script>

<template>
  <button
    ref="buttonRef"
    @mouseenter="isOpen = true"
    @mouseleave="isOpen = false"
  >
    悬停我
  </button>
  <div
    v-if="isOpen"
    ref="tooltipRef"
    :style="floatingStyles"
    class="bg-slate-900 text-white px-2 py-1 rounded text-sm"
  >
    这是提示信息
  </div>
</template>
```

### 使用 Radix Vue 实现 Dropdown

```vue
<script setup>
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "radix-vue";
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
    >
      打开菜单
    </DropdownMenuTrigger>
    <DropdownMenuContent
      class="bg-white shadow-lg rounded-md p-1 min-w-[200px] border border-slate-200"
    >
      <DropdownMenuItem
        class="px-3 py-2 rounded hover:bg-slate-100 cursor-pointer"
      >
        选项 1
      </DropdownMenuItem>
      <DropdownMenuItem
        class="px-3 py-2 rounded hover:bg-slate-100 cursor-pointer"
      >
        选项 2
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenuRoot>
</template>
```

---

## 七、总结

1. **定位相关**：`@floating-ui/vue` 是最佳选择（你已经在用）
2. **复杂组件**：`radix-vue` 提供完整功能但无样式
3. **画布缩放**：`panzoom` 轻量且强大
4. **分割面板**：`split-pane-vue` 简单易用
5. **工具函数**：`@vueuse/core` 补充各种 hooks

**推荐组合**：`@floating-ui/vue` + `radix-vue` + `@vueuse/core` + `panzoom` + `split-pane-vue`

这样既能保持样式完全可控（Tailwind CSS），又能获得完整的功能实现。
