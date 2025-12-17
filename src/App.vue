<template>
  <div class="w-full h-screen bg-slate-50 flex flex-col">
    <!-- 顶部导航栏 -->
    <header
      class="h-14 bg-white border-b border-slate-200 flex items-center px-6 shadow-sm"
    >
      <!-- 左侧：标题 + Tab -->
      <div class="flex items-center gap-4">
        <!-- 左侧图标 + 标题 -->
        <div class="flex items-center gap-3">
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
            class="text-slate-700"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <h1 class="text-base font-bold text-slate-900">Gemini 图片生成</h1>
        </div>
        <!-- 导航标签容器 -->
        <nav class="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            @click="mainTab = 'storyboard'"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5',
              mainTab === 'storyboard'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 ',
            ]"
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
            分镜编辑
          </button>
          <button
            @click="mainTab = 'images'"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5',
              mainTab === 'images'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 ',
            ]"
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            图片结果
          </button>
        </nav>
      </div>

      <!-- 中间：项目选择器（居中对齐） -->
      <div class="flex-1 flex justify-center">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-50 border border-slate-200 shadow-sm"
        >
          <span class="text-xs font-medium text-slate-500 tracking-wide"> 项目 </span>
          <select
            class="px-3 py-1.5 text-xs rounded-md focus:outline-none focus:border-transparent text-slate-700 max-w-[260px]"
            :value="currentProject?.id || ''"
            @change="handleSwitchProject(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
          <button
            class="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
            title="新建项目"
            @click="openCreateProjectModal"
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
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
          <button
            class="p-1.5 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="重命名当前项目"
            :disabled="!currentProject"
            @click="currentProject && openEditProjectModal(currentProject.id)"
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
              <path d="M11 4H4a2 2 0 0 0-2 2v14h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            class="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="删除当前项目"
            :disabled="!currentProject || projects.length <= 1"
            @click="currentProject && handleDeleteProject(currentProject.id)"
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
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 右侧：操作按钮 -->
      <div class="flex items-center gap-3">
        <button
          v-if="mainTab === 'storyboard'"
          @click="handleGenerateStoryboardPrompts"
          :disabled="isAnalyzing"
          class="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="isAnalyzing" class="flex items-center gap-1.5">
            <svg
              class="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            生成中...
          </span>
          <span v-else class="flex items-center gap-1.5">
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
              <path
                d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
              />
            </svg>
            一键生成全部分镜提示词
          </span>
        </button>
        <button
          v-else
          @click="handleGenerate"
          :disabled="isGenerating"
          class="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="isGenerating" class="flex items-center gap-1.5">
            <svg
              class="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            生成中...
          </span>
          <span v-else class="flex items-center gap-1.5">
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
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
            生成图片
          </span>
        </button>
        <div class="h-6 w-px bg-slate-200"></div>
        <button
          @click="showSettings = true"
          class="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
          title="设置"
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
            <path
              d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
    </header>

    <!-- 主内容区域 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧控制面板 -->
      <aside
        class="w-80 flex flex-col border-r border-slate-200 bg-white overflow-hidden"
      >
        <!-- 01. 参考图分析 -->
        <div class="flex flex-col border-b border-slate-200">
          <div class="pl-5 py-2 border-b border-slate-200 bg-slate-50/50">
            <div class="flex items-center justify-between">
              <h2 class="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                01. 参考图分析
              </h2>
              <div
                class="flex items-center gap-1 bg-white rounded-lg p-1 mr-2 border border-slate-200"
              >
                <button
                  @click="analysisTab = 'analyze'"
                  :class="[
                    'px-2.5 py-1 text-xs font-medium rounded transition-all',
                    analysisTab === 'analyze'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:text-slate-900',
                  ]"
                >
                  分析
                </button>
                <button
                  @click="analysisTab = 'result'"
                  :class="[
                    'px-2.5 py-1 text-xs font-medium rounded transition-all',
                    analysisTab === 'result'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:text-slate-900',
                  ]"
                >
                  结果
                </button>
              </div>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto">
            <!-- 分析 Tab -->
            <div v-if="analysisTab === 'analyze'" class="px-5 py-2 space-y-4">
              <AssetLibrary
                :assets="referenceImages"
                @add-assets="handleAddAssets"
                @delete-asset="handleDeleteAsset"
              />
              <button
                @click="handleAnalyzeReference"
                :disabled="isAnalyzing || referenceImages.length === 0"
                class="w-full py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                :class="
                  isAnalyzing || referenceImages.length === 0
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
                "
              >
                <span v-if="isAnalyzing" class="flex items-center gap-2">
                  <svg
                    class="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  分析中...
                </span>
                <span v-else class="flex items-center gap-2">
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
                    <path
                      d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
                    />
                  </svg>
                  开始分析
                </span>
              </button>
            </div>
            <!-- 结果 Tab -->
            <div v-else class="px-5 py-2 flex flex-col" style="min-height: 0">
              <textarea
                v-model="analysisResult"
                placeholder="分析结果将显示在这里..."
                class="w-full min-h-64 flex-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs bg-white resize-none leading-relaxed text-slate-800"
              />
            </div>
          </div>
        </div>

        <!-- 02. 最终提示词预览 -->
        <div class="flex-1 flex flex-col min-h-0">
          <div class="px-5 py-2 border-b border-slate-200 bg-slate-50/50 flex-shrink-0">
            <h2
              class="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              02. 最终提示词预览
            </h2>
            <p class="text-xs text-slate-500 mt-1">
              汇总系统提示词与右侧所有分镜提示词，仅用于预览与复制。
            </p>
          </div>
          <div class="flex-1 px-5 py-2 min-h-0">
            <textarea
              :value="finalPromptPreview"
              readonly
              class="w-full h-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs bg-slate-50 resize-none leading-relaxed text-slate-800"
            />
          </div>
        </div>
      </aside>

      <!-- 中间 & 右侧区域 -->
      <div class="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <!-- 内容区域 -->
        <div class="h-full flex-1 overflow-auto">
          <!-- 分镜编辑视图 -->
          <div v-if="mainTab === 'storyboard'" class="p-6">
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h2 class="text-sm font-semibold text-slate-900 mb-1">
                  分镜网格编辑 ({{ settings.storyboardLayout === "2x2" ? "2x2" : "3x3" }})
                </h2>
                <p class="text-xs text-slate-500">
                  为每个分镜编写或调整提示词，可单独刷新，也可以在顶部一键生成。
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="handleRandomizeStoryboardModes"
                  class="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-2"
                  title="随机为所有分镜选择镜头模式，并清空自定义提示词"
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
                    <polyline points="4 4 10 4 10 10" />
                    <polyline points="20 20 14 20 14 14" />
                    <line x1="10" y1="4" x2="4" y2="10" />
                    <line x1="20" y1="14" x2="14" y2="20" />
                  </svg>
                  随机分镜模式
                </button>
                <button
                  @click="handleToggleStoryboardImages"
                  :class="[
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2',
                    showStoryboardImages
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  ]"
                  title="显示/隐藏分镜图片"
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
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  {{ showStoryboardImages ? "隐藏图片" : "显示图片" }}
                </button>
              </div>
            </div>

            <!-- 自适应分镜网格，自动换行并为每个卡片设置最小宽度；在大屏时最多 3 列 -->
            <div
              class="grid gap-4 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] xl:grid-cols-3"
            >
              <div
                v-for="item in storyboardItems"
                :key="item.id"
                class="bg-white rounded-lg border border-slate-200 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow min-w-[260px]"
              >
                <!-- 卡片头部：序号 + 分镜模式选择 + 刷新按钮 -->
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold flex items-center justify-center flex-shrink-0 border border-indigo-100"
                  >
                    {{ item.index }}
                  </div>
                  <select
                    v-model="item.mode"
                    class="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:border-slate-300 transition-colors"
                  >
                    <option v-for="mode in storyboardModes" :key="mode" :value="mode">
                      {{ mode }}
                    </option>
                  </select>
                  <button
                    @click="handleRefreshStoryboardItem(item)"
                    :disabled="item.isLoading"
                    class="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="重新生成该分镜提示词"
                  >
                    <svg
                      v-if="item.isLoading"
                      class="animate-spin h-3.5 w-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <svg
                      v-else
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
                      <path
                        d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
                      />
                    </svg>
                  </button>
                </div>
                <!-- 提示词输入框 -->
                <textarea
                  v-model="item.prompt"
                  placeholder="描述该分镜要展示的画面、人物动作与镜头语言..."
                  class="w-full px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs min-h-[140px] resize-none bg-slate-50 hover:bg-white transition-colors"
                />
                <!-- 分割后的图片显示 -->
                <div
                  v-if="showStoryboardImages && item.imageBase64"
                  class="mt-2 rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                >
                  <img
                    :src="`data:image/png;base64,${item.imageBase64}`"
                    :alt="`分镜 ${item.index}`"
                    class="w-full h-auto object-contain"
                  />
                </div>
                <div
                  v-else-if="showStoryboardImages && !item.imageBase64"
                  class="mt-2 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center aspect-square"
                >
                  <span class="text-xs text-slate-400">暂无图片</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 图片结果视图 -->
          <template v-else>
            <div class="h-full flex-1 flex overflow-hidden">
              <!-- 中间画布区域 -->
              <ImageGrid
                :images="generatedImages"
                :selected-image="selectedImage"
                :view-mode="viewMode"
                :layout="settings.storyboardLayout"
                :canvas-mode="canvasMode"
                @select-image="handleSelectImage"
                @view-mode-change="viewMode = $event"
                @batch-download="handleBatchDownload"
                @delete-image="handleDeleteImage"
                @add-image="handleAddImage"
                @enter-canvas="canvasMode = true"
                @exit-canvas="canvasMode = false"
              />

              <!-- 右侧检查器面板 -->
              <InspectorPanel
                v-if="false && selectedImage"
                :image="selectedImage"
                @download="handleDownloadImage"
              />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div
      v-if="error"
      class="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 max-w-md z-50"
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
        class="mt-0.5 flex-shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
      <div class="flex-1 text-sm">{{ error }}</div>
      <button
        @click="error = null"
        class="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
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
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>

    <!-- 项目对话框 -->
    <ProjectModal
      :show="showProjectModal"
      :initial-name="projectNameInput"
      :editing-id="editingProjectId"
      @close="showProjectModal = false"
      @save="(name: string) => { projectNameInput = name; handleSaveProject(); }"
    />

    <!-- 设置对话框 -->
    <SettingsModal
      :show="showSettings"
      :config="config"
      @close="showSettings = false"
      @save="handleSaveConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import SettingsModal from "./components/SettingsModal.vue";
import ImageGrid from "./components/ImageGrid.vue";
import InspectorPanel from "./components/InspectorPanel.vue";
import AssetLibrary from "./components/AssetLibrary.vue";
import ProjectModal from "./components/ProjectModal.vue";
import type { GeminiConfig, GeneratedImage, Asset } from "./types";
import {
  generateImage,
  analyzeImage,
  generateSingleStoryboardPrompt,
  generateBatchStoryboardPrompts,
  type BatchStoryboardPromptResult,
} from "./services/geminiService";
import { splitImage } from "./utils/imageSplitter";
import {
  useAppStore,
  type StoryboardItem,
  type StoryboardMode,
} from "./stores/appStore";

// Pinia 应用状态
const appStore = useAppStore();
const {
  config,
  projects,
  currentProject,
  mainTab,
  viewMode,
  canvasMode,
  isGenerating,
  isAnalyzing,
  error,
  showSettings,
  analysisTab,
  selectedImage,
  projectSettings,
  projectReferenceImages,
  projectAnalysisResult,
  projectStoryboardItems,
  projectGeneratedImages,
  projectShowStoryboardImages,
  projectSelectedImageId,
  prompts,
} = storeToRefs(appStore);

// 将 Pinia 中的项目级数据映射为本地引用，方便在模板和逻辑中使用
const settings = projectSettings;
const referenceImages = projectReferenceImages;
const analysisResult = projectAnalysisResult;
const storyboardItems = projectStoryboardItems;
const generatedImages = projectGeneratedImages;
const showStoryboardImages = projectShowStoryboardImages;

// 分镜模式列表（与 store 中保持一致）
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

// 项目管理相关状态
const showProjectModal = ref(false);
const projectNameInput = ref("");
const editingProjectId = ref<string | null>(null);

const finalPromptPreview = computed(() => {
  // 获取有效的分镜项
  const validItems = storyboardItems.value.filter(
    (item: StoryboardItem) => item.prompt.trim()
  );

  if (validItems.length === 0) {
    return "";
  }

  // 提取分析结果摘要（取前200字符，或使用简化描述）
  let analysisSummary = "";
  if (analysisResult.value) {
    // 如果分析结果包含分隔符，提取纯分析部分
    let pureAnalysis = analysisResult.value;
    if (pureAnalysis.includes("=== 图片分析结果 ===")) {
      const match = pureAnalysis.match(/=== 图片分析结果 ===\s*([\s\S]*?)(?=\n\n===|$)/);
      if (match) {
        pureAnalysis = match[1].trim();
      }
    }
    // 取前200字符作为摘要
    analysisSummary = pureAnalysis.length > 200
      ? pureAnalysis.substring(0, 200) + "..."
      : pureAnalysis;
  } else {
    analysisSummary = "参考图片内容";
  }

  // 获取布局信息
  const layout = settings.value.storyboardLayout;
  const panelCount = validItems.length;

  // 转换分辨率格式 (1K -> 1K, 2K -> 2K, 4K -> 4K, 8K -> 8K)
  const resolutionMap: Record<string, string> = {
    "1K": "1K",
    "2K": "2K",
    "4K": "4K",
    "8K": "8K",
  };
  const resolution = resolutionMap[config.value.imageSize || "1K"] || "1K";

  // 获取画幅
  const aspectRatio = settings.value.aspectRatio || "16:9";

  // 格式化镜头描述：镜头 01: 镜头 02: ...
  const panelDescriptions = validItems
    .map((item: StoryboardItem) => {
      const indexStr = item.index.toString().padStart(2, "0");
      return `镜头 ${indexStr}: ${item.prompt.trim()}`;
    })
    .join("\n\n");

  // 使用模板格式化最终提示词（从 Pinia 中读取当前模板）
  return prompts.value.finalPrompt
    .replace("{{analysisSummary}}", analysisSummary)
    .replace("{{layout}}", layout)
    .replace("{{panelCount}}", panelCount.toString())
    .replace("{{resolution}}", resolution)
    .replace("{{aspectRatio}}", aspectRatio)
    .replace("{{panelDescriptions}}", panelDescriptions)
    .trim();
});

// 随机为所有分镜选择镜头模式：将下拉框统一设置为“随机”并清空提示词
function handleRandomizeStoryboardModes() {
  storyboardItems.value.forEach((item: StoryboardItem) => {
    item.mode = "随机";
    // 清空之前的自定义提示词内容
    item.prompt = "";
  });
}

// 处理配置保存
function handleSaveConfig(newConfig: GeminiConfig) {
  appStore.updateConfig(newConfig);

  // 更新设置以反映新的配置
  if (newConfig.aspectRatio) {
    settings.value.aspectRatio = newConfig.aspectRatio;
  }
  if (newConfig.storyboardLayout) {
    const oldLayout = settings.value.storyboardLayout;
    settings.value.storyboardLayout = newConfig.storyboardLayout;

    // 如果布局改变，重新初始化分镜项（会清除旧的图片数据）
    if (oldLayout !== newConfig.storyboardLayout) {
      storyboardItems.value = appStore.createDefaultStoryboardItems(
        newConfig.storyboardLayout
      );
      // 布局改变后，清除生成的图片（因为分割方式已改变）
      generatedImages.value = [];
      selectedImage.value = null;
      canvasMode.value = false;
    }
  }

  console.log("配置已保存", newConfig);
}

// 参考图整体分析
async function handleAnalyzeReference() {
  if (referenceImages.value.length === 0 || isAnalyzing.value) return;

  const startTime = performance.now();
  isAnalyzing.value = true;
  error.value = null;

  console.group("📊 参考图分析");
  console.log("输入参数:", {
    参考图数量: referenceImages.value.length,
    参考图信息: referenceImages.value.map((img: Asset) => ({
      id: img.id,
      name: img.name,
      size: img.size,
      type: img.type,
    })),
    配置: {
      apiKey: config.value.apiKey ? `${config.value.apiKey.substring(0, 8)}...` : "未设置",
      model: config.value.model,
      imageSize: config.value.imageSize,
      aspectRatio: config.value.aspectRatio,
    },
  });

  try {
    // 调用 Gemini API 分析图片
    const result = await analyzeImage(referenceImages.value, config.value);
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // 将分析结果保存
    analysisResult.value = result;

    console.log("✅ 分析成功");
    console.log("输出结果:", {
      分析结果长度: result.length,
      分析结果预览: result.substring(0, 200) + (result.length > 200 ? "..." : ""),
      完整结果: result,
    });
    console.log(`⏱️ 耗时: ${duration} 秒`);

    // 分析完成后自动切换到结果 tab
    analysisTab.value = "result";
  } catch (err: any) {
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.error("❌ 分析失败:", err);
    console.log(`⏱️ 耗时: ${duration} 秒`);
    error.value = err.message || "分析失败，请检查配置和网络连接";
  } finally {
    console.groupEnd();
    isAnalyzing.value = false;
  }
}

// 一键生成全部分镜提示词
async function handleGenerateStoryboardPrompts() {
  if (referenceImages.value.length === 0) {
    error.value = "请先添加参考图片";
    return;
  }

  if (isAnalyzing.value) return;

  const startTime = performance.now();
  isAnalyzing.value = true;
  error.value = null;

  console.group("🎬 批量生成分镜提示词");
  console.log("输入参数:", {
    分镜项数量: storyboardItems.value.length,
    布局: settings.value.storyboardLayout,
    分镜项列表: storyboardItems.value.map((item: StoryboardItem) => ({
      index: item.index,
      mode: item.mode,
      currentPrompt: item.prompt ? `${item.prompt.substring(0, 50)}...` : "空",
    })),
    已有分析结果: analysisResult.value ? "是" : "否",
    分析结果长度: analysisResult.value?.length || 0,
  });

  try {
    // 设置所有分镜项为加载状态
    storyboardItems.value.forEach((item: StoryboardItem) => {
      item.isLoading = true;
    });

    // 获取图片分析结果（如果已有则使用，否则重新分析）
    let imageAnalysis = analysisResult.value;
    let usedCachedAnalysis = false;

    // 如果分析结果包含分隔符，提取纯分析部分
    if (imageAnalysis && imageAnalysis.includes("=== 图片分析结果 ===")) {
      const match = imageAnalysis.match(/=== 图片分析结果 ===\s*([\s\S]*?)(?=\n\n===|$)/);
      if (match) {
        imageAnalysis = match[1].trim();
        usedCachedAnalysis = true;
      }
    }

    // 如果没有有效的分析结果，才重新分析
    if (!imageAnalysis || imageAnalysis.length < 50) {
      console.log("📝 开始分析参考图...");
      const analysisStartTime = performance.now();
      imageAnalysis = await analyzeImage(referenceImages.value, config.value);
      const analysisEndTime = performance.now();
      const analysisDuration = ((analysisEndTime - analysisStartTime) / 1000).toFixed(2);
      console.log(`✅ 参考图分析完成，耗时: ${analysisDuration} 秒`);
      // 如果当前分析结果为空或很短，更新它
      if (!analysisResult.value || analysisResult.value.length < 50) {
        analysisResult.value = imageAnalysis;
      }
    } else {
      console.log("✅ 使用已缓存的分析结果");
      usedCachedAnalysis = true;
    }

    console.log("使用的分析结果:", {
      是否使用缓存: usedCachedAnalysis,
      分析结果长度: imageAnalysis.length,
      分析结果预览: imageAnalysis.substring(0, 200) + (imageAnalysis.length > 200 ? "..." : ""),
    });

    // 批量生成分镜提示词
    console.log("🚀 开始批量生成分镜提示词...");
    const generateStartTime = performance.now();
    const result: BatchStoryboardPromptResult = await generateBatchStoryboardPrompts(
      {
        imageAnalysis,
        storyboardItems: storyboardItems.value.map((item: StoryboardItem) => ({
          index: item.index,
          mode: item.mode,
        })),
      },
      [],
      config.value
    );
    const generateEndTime = performance.now();
    const generateDuration = ((generateEndTime - generateStartTime) / 1000).toFixed(2);

    // 更新分镜项
    for (const promptItem of result.prompts) {
      const storyboardItem = storyboardItems.value.find((item: StoryboardItem) => {
        return item.index === promptItem.index;
      });
      if (storyboardItem) {
        storyboardItem.prompt = promptItem.prompt;
        storyboardItem.isLoading = false;
      }
    }

    const endTime = performance.now();
    const totalDuration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("✅ 批量生成成功");
    console.log("输出结果:", {
      生成的分镜数量: result.prompts.length,
      分镜详情: result.prompts.map((item) => ({
        分镜序号: item.index,
        镜头模式: item.mode,
        提示词长度: item.prompt.length,
        提示词预览: item.prompt.substring(0, 100) + (item.prompt.length > 100 ? "..." : ""),
        完整提示词: item.prompt,
      })),
    });
    console.log(`⏱️ 总耗时: ${totalDuration} 秒 (生成耗时: ${generateDuration} 秒)`);

    // 不修改 analysisResult.value，保持参考图分析结果不变
  } catch (err: any) {
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.error("❌ 生成分镜提示词失败:", err);
    console.log("错误详情:", {
      错误消息: err.message,
      错误堆栈: err.stack,
    });
    console.log(`⏱️ 耗时: ${duration} 秒`);
    error.value = err.message || "生成分镜提示词失败，请检查配置和网络连接";
    // 发生错误时，清除所有项的加载状态
    storyboardItems.value.forEach((item: StoryboardItem) => {
      item.isLoading = false;
    });
  } finally {
    console.groupEnd();
    isAnalyzing.value = false;
  }
}

// 单个分镜刷新
async function handleRefreshStoryboardItem(item: StoryboardItem) {
  if (referenceImages.value.length === 0) {
    error.value = "请先添加参考图片";
    return;
  }

  if (isAnalyzing.value) return;

  const startTime = performance.now();
  isAnalyzing.value = true;
  error.value = null;

  console.group(`🎯 生成单个分镜提示词 - 分镜 ${item.index}`);
  console.log("输入参数:", {
    分镜序号: item.index,
    镜头模式: item.mode,
    当前提示词: item.prompt || "空",
    当前提示词长度: item.prompt?.length || 0,
    已有分析结果: analysisResult.value ? "是" : "否",
    分析结果长度: analysisResult.value?.length || 0,
  });

  try {
    // 设置当前分镜项为加载状态
    item.isLoading = true;

    // 获取图片分析结果（如果已有则使用，否则重新分析）
    let imageAnalysis = analysisResult.value;
    let usedCachedAnalysis = false;

    // 如果分析结果包含分隔符，提取纯分析部分
    if (imageAnalysis && imageAnalysis.includes("=== 图片分析结果 ===")) {
      const match = imageAnalysis.match(/=== 图片分析结果 ===\s*([\s\S]*?)(?=\n\n===|$)/);
      if (match) {
        imageAnalysis = match[1].trim();
        usedCachedAnalysis = true;
      }
    }

    // 如果没有有效的分析结果，重新分析
    if (!imageAnalysis || imageAnalysis.length < 50) {
      console.log("📝 开始分析参考图...");
      const analysisStartTime = performance.now();
      imageAnalysis = await analyzeImage(referenceImages.value, config.value);
      const analysisEndTime = performance.now();
      const analysisDuration = ((analysisEndTime - analysisStartTime) / 1000).toFixed(2);
      console.log(`✅ 参考图分析完成，耗时: ${analysisDuration} 秒`);
      // 如果当前分析结果为空或很短，更新它
      if (!analysisResult.value || analysisResult.value.length < 50) {
        analysisResult.value = imageAnalysis;
      }
    } else {
      console.log("✅ 使用已缓存的分析结果");
      usedCachedAnalysis = true;
    }

    console.log("使用的分析结果:", {
      是否使用缓存: usedCachedAnalysis,
      分析结果长度: imageAnalysis.length,
    });

    // 生成单个分镜提示词
    console.log("🚀 开始生成分镜提示词...");
    const generateStartTime = performance.now();
    const prompt = await generateSingleStoryboardPrompt(
      {
        imageAnalysis,
        storyboardMode: item.mode,
        index: item.index,
      },
      [],
      config.value
    );
    const generateEndTime = performance.now();
    const generateDuration = ((generateEndTime - generateStartTime) / 1000).toFixed(2);

    // 更新分镜项
    item.prompt = prompt;
    item.isLoading = false;

    const endTime = performance.now();
    const totalDuration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("✅ 生成成功");
    console.log("输出结果:", {
      分镜序号: item.index,
      镜头模式: item.mode,
      提示词长度: prompt.length,
      提示词预览: prompt.substring(0, 200) + (prompt.length > 200 ? "..." : ""),
      完整提示词: prompt,
    });
    console.log(`⏱️ 总耗时: ${totalDuration} 秒 (生成耗时: ${generateDuration} 秒)`);
  } catch (err: any) {
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.error("❌ 生成单个分镜提示词失败:", err);
    console.log("错误详情:", {
      错误消息: err.message,
      错误堆栈: err.stack,
    });
    console.log(`⏱️ 耗时: ${duration} 秒`);
    error.value = err.message || "生成分镜提示词失败，请检查配置和网络连接";
    // 发生错误时，清除当前项的加载状态
    item.isLoading = false;
  } finally {
    console.groupEnd();
    isAnalyzing.value = false;
  }
}

// 处理生成（在图片结果 Tab 中使用最终提示词生成单张图片）
async function handleGenerate() {
  const promptText = finalPromptPreview.value;

  if (!promptText.trim()) {
    error.value = "提示词为空，无法生成图片";
    return;
  }

  const startTime = performance.now();
  error.value = null;
  isGenerating.value = true;

  console.group("🖼️ 生成图片");
  console.log("输入参数:", {
    提示词长度: promptText.length,
    提示词预览: promptText.substring(0, 300) + (promptText.length > 300 ? "..." : ""),
    完整提示词: promptText,
    画幅比例: settings.value.aspectRatio,
    布局: settings.value.storyboardLayout,
    分辨率: config.value.imageSize,
    参考图数量: referenceImages.value.length,
    配置: {
      apiKey: config.value.apiKey ? `${config.value.apiKey.substring(0, 8)}...` : "未设置",
      model: config.value.model,
    },
  });

  try {
    // 这里只生成一张图片，使用汇总后的最终提示词
    console.log("🚀 开始生成图片...");
    const generateStartTime = performance.now();
    const imageBase64 = await generateImage(
      {
        ...settings.value,
        prompt: promptText,
        referenceImages: referenceImages.value,
      },
      config.value
    );
    const generateEndTime = performance.now();
    const generateDuration = ((generateEndTime - generateStartTime) / 1000).toFixed(2);
    console.log(`✅ 图片生成完成，耗时: ${generateDuration} 秒`);

    const imageId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const image: GeneratedImage = {
      id: imageId,
      imageBase64,
      timestamp: Date.now(),
      prompt: promptText,
      aspectRatio: settings.value.aspectRatio,
    };

    generatedImages.value = [image];
    selectedImage.value = image;
    projectSelectedImageId.value = image.id;
    // 生成图片后自动进入画布模式（只有一张图片时）
    canvasMode.value = true;

    console.log("图片信息:", {
      图片ID: imageId,
      图片大小: `${(imageBase64.length * 3) / 4 / 1024} KB (base64)`,
      时间戳: new Date(image.timestamp).toLocaleString(),
    });

    // 分割图片并分配到对应的分镜项
    await applyStoryboardImageSlices(image);

    const endTime = performance.now();
    const totalDuration = ((endTime - startTime) / 1000).toFixed(2);
    console.log("✅ 图片生成流程完成");
    console.log(`⏱️ 总耗时: ${totalDuration} 秒`);
  } catch (err: any) {
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.error("❌ 生成失败:", err);
    console.log("错误详情:", {
      错误消息: err.message,
      错误堆栈: err.stack,
    });
    console.log(`⏱️ 耗时: ${duration} 秒`);
    error.value = err.message || "生成失败，请检查配置和网络连接";
  } finally {
    console.groupEnd();
    isGenerating.value = false;
  }
}

// 根据给定图片分割并同步到分镜项
async function applyStoryboardImageSlices(image: GeneratedImage) {
  if (!image || !image.imageBase64) return;

    try {
      console.log("✂️ 开始分割图片...");
      const splitStartTime = performance.now();
    const slices = await splitImage(image.imageBase64, settings.value.storyboardLayout);
      const splitEndTime = performance.now();
      const splitDuration = ((splitEndTime - splitStartTime) / 1000).toFixed(2);
      console.log(`✅ 图片分割完成，耗时: ${splitDuration} 秒`);

    // 先清空所有分镜项的图片
    storyboardItems.value.forEach((item: StoryboardItem) => {
      item.imageBase64 = undefined;
    });

      // 按照分镜项的 index 顺序分配图片
      slices.forEach((sliceBase64, sliceIndex) => {
        const itemIndex = sliceIndex + 1; // sliceIndex 从 0 开始，item.index 从 1 开始
    const storyboardItem = storyboardItems.value.find(
          (item: StoryboardItem) => item.index === itemIndex
        );
        if (storyboardItem) {
          storyboardItem.imageBase64 = sliceBase64;
        }
      });

      console.log("分割结果:", {
        分割数量: slices.length,
        每个分片大小: slices.map(
          (slice) => `${(slice.length * 3) / 4 / 1024} KB (base64)`
        ),
        已分配到分镜项: slices.length,
      });
    } catch (err: any) {
      console.error("❌ 图片分割失败:", err);
      console.log("错误详情:", {
        错误消息: err.message,
        错误堆栈: err.stack,
      });
      error.value = "图片分割失败: " + (err.message || "未知错误");
  }
}

// 获取优先选中的图片：当前选中 > 记录的 ID > 第一张
function getPreferredImage(): GeneratedImage | null {
  if (selectedImage.value) return selectedImage.value;
  if (projectSelectedImageId.value) {
    const found = generatedImages.value.find(
      (img: GeneratedImage) => img.id === projectSelectedImageId.value
    );
    if (found) return found;
  }
  return generatedImages.value.length > 0 ? generatedImages.value[0] : null;
}

// 下载单张图片
function handleDownloadImage(image: GeneratedImage) {
  const link = document.createElement("a");
  link.href = `data:image/png;base64,${image.imageBase64}`;
  link.download = `gemini_image_${image.id}.png`;
  link.click();
}

// 批量下载为ZIP
async function handleBatchDownload() {
  if (generatedImages.value.length === 0) {
    error.value = "没有可下载的图片";
    return;
  }

  // 如果只有一张，直接用单张下载
  if (generatedImages.value.length === 1) {
    handleDownloadImage(generatedImages.value[0]);
    return;
  }

  try {
    let JSZip: any;
    try {
      const jszipModule = await import("jszip" as any);
      JSZip = jszipModule.default;
    } catch (e) {
      // 降级方案：未安装 jszip 时逐张下载，避免无感失败
      console.warn("JSZip 未安装，改为逐张下载:", e);
      generatedImages.value.forEach((image: GeneratedImage, index: number) => {
        const link = document.createElement("a");
        link.href = `data:image/png;base64,${image.imageBase64}`;
        link.download = `image_${image.panelIndex || index + 1}_${image.id.slice(0, 8)}.png`;
        link.click();
      });
      return;
    }
    const zip = new JSZip();

    generatedImages.value.forEach((image: GeneratedImage, index: number) => {
      const base64Data = image.imageBase64;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      zip.file(
        `image_${image.panelIndex || index + 1}_${image.id.slice(0, 8)}.png`,
        bytes
      );
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `gemini_images_${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);

    console.log("批量下载成功", { count: generatedImages.value.length });
  } catch (err: any) {
    console.error("批量下载失败:", err);
    error.value = "批量下载失败，请确保已安装 jszip 库";
  }
}

// 切换分镜图片显示状态
async function handleToggleStoryboardImages() {
  const nextValue = !showStoryboardImages.value;
  showStoryboardImages.value = nextValue;

  // 当从“隐藏图片”切换到“显示图片”时，使用当前选中/记录的图片进行分割
  if (nextValue) {
    const image = getPreferredImage();
    if (!image) return;
    selectedImage.value = image;
    projectSelectedImageId.value = image.id;
    await applyStoryboardImageSlices(image);
  }
}

// 删除图片
function handleDeleteImage(imageId: string) {
  const index = generatedImages.value.findIndex(
    (img: GeneratedImage) => img.id === imageId
  );
  if (index > -1) {
    generatedImages.value.splice(index, 1);
    // 触发持久化
    projectGeneratedImages.value = [...generatedImages.value];
    // 如果删除的是当前选中的图片，则选中第一张或清空
    if (selectedImage.value?.id === imageId) {
      selectedImage.value =
        generatedImages.value.length > 0 ? generatedImages.value[0] : null;
      projectSelectedImageId.value = selectedImage.value?.id || null;
      // 如果删除后没有图片了，退出画布模式
      if (generatedImages.value.length === 0) {
        canvasMode.value = false;
      }
    }
  }
}

// 添加图片（从拖拽或粘贴）
function handleAddImage(image: GeneratedImage) {
  generatedImages.value.push(image);
  // 如果当前没有选中的图片，自动选中新添加的图片
  if (!selectedImage.value) {
    selectedImage.value = image;
    projectSelectedImageId.value = image.id;
  }
  // 触发持久化（替换引用确保写入存储）
  projectGeneratedImages.value = [...generatedImages.value];
}

// 选择图片
async function handleSelectImage(image: GeneratedImage) {
  selectedImage.value = image;
  projectSelectedImageId.value = image.id;
  // 选择图片时退出画布模式
  canvasMode.value = false;

  // 如果当前处于“显示图片”状态，则同步更新分镜图片
  if (showStoryboardImages.value) {
    await applyStoryboardImageSlices(image);
  }
}

// 素材库相关函数
function handleAddAssets(newAssets: Asset[]) {
  // 限制总数量，避免超出存储配额
  const MAX_TOTAL_ASSETS = 15;
  const currentCount = referenceImages.value.length;
  const newCount = newAssets.length;

  if (currentCount + newCount > MAX_TOTAL_ASSETS) {
    // 如果超出限制，删除最旧的图片
    const toRemove = currentCount + newCount - MAX_TOTAL_ASSETS;
    for (let i = 0; i < toRemove; i++) {
      const oldestAsset = referenceImages.value[i];
      if (oldestAsset.url.startsWith("blob:")) {
        URL.revokeObjectURL(oldestAsset.url);
      }
    }
    referenceImages.value.splice(0, toRemove);
    error.value = `参考图数量已达上限（${MAX_TOTAL_ASSETS} 张），已自动删除最旧的图片`;
    setTimeout(() => {
      error.value = null;
    }, 3000);
  }

  referenceImages.value.push(...newAssets);
}

function handleDeleteAsset(assetId: string) {
  const index = referenceImages.value.findIndex((a: Asset) => a.id === assetId);
  if (index > -1) {
    const asset = referenceImages.value[index];
    // 释放 URL
    if (asset.url.startsWith("blob:")) {
      URL.revokeObjectURL(asset.url);
    }
    referenceImages.value.splice(index, 1);
  }
}

watch(
  generatedImages,
  (newImages: GeneratedImage[]) => {
    // 如果图片列表不为空且当前没有选中的图片，优先记录的 ID，否则第一张
    if (newImages.length > 0 && !selectedImage.value) {
      const byId = projectSelectedImageId.value
        ? newImages.find((img) => img.id === projectSelectedImageId.value)
        : null;
      const target = byId || newImages[0];
      selectedImage.value = target;
      projectSelectedImageId.value = target.id;
    }
    // 如果选中的图片不在列表中，重新选择第一张
    if (
      selectedImage.value &&
      !newImages.find((img: GeneratedImage) => img.id === selectedImage.value?.id)
    ) {
      const byId = projectSelectedImageId.value
        ? newImages.find((img) => img.id === projectSelectedImageId.value)
        : null;
      const fallback = byId || (newImages.length > 0 ? newImages[0] : null);
      selectedImage.value = fallback;
      projectSelectedImageId.value = fallback?.id || null;
    }
  },
  { deep: true }
);

// 初始化或切换项目后，如已有图片但未选中，优先恢复记录的 ID，否则第一张
watch(
  () => generatedImages.value,
  (imgs: GeneratedImage[]) => {
    if (!selectedImage.value && imgs.length > 0) {
      const byId = projectSelectedImageId.value
        ? imgs.find((img) => img.id === projectSelectedImageId.value)
        : null;
      const target = byId || imgs[0];
      selectedImage.value = target;
      projectSelectedImageId.value = target.id;
    }
    if (imgs.length === 0) {
      selectedImage.value = null;
      projectSelectedImageId.value = null;
    }
  },
  { immediate: true, deep: true }
);

// 当选中图片变更且当前显示分镜图片时，自动同步切割结果
watch(
  selectedImage,
  async (img: GeneratedImage | null) => {
    if (showStoryboardImages.value && img) {
      await applyStoryboardImageSlices(img);
    }
  }
);

// 项目管理方法
function openCreateProjectModal() {
  editingProjectId.value = null;
  projectNameInput.value = "";
  showProjectModal.value = true;
}

function openEditProjectModal(projectId: string) {
  const project = projects.value.find((p: { id: string; name: string }) => p.id === projectId);
  if (!project) return;
  editingProjectId.value = projectId;
  projectNameInput.value = project.name;
  showProjectModal.value = true;
}

function handleSaveProject() {
  const name = projectNameInput.value.trim();
  if (!name) {
    error.value = "项目名称不能为空";
    return;
  }
  if (editingProjectId.value) {
    appStore.updateProjectName(editingProjectId.value, name);
  } else {
    appStore.createProject(name);
  }
  showProjectModal.value = false;
  projectNameInput.value = "";
  editingProjectId.value = null;
}

function handleDeleteProject(projectId: string) {
  if (!confirm("确定要删除该项目吗？")) return;
  appStore.deleteProject(projectId);
}

function handleSwitchProject(projectId: string) {
  if (projectId === currentProject.value?.id) return;
  appStore.setCurrentProject(projectId);
}
</script>
