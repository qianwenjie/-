# 考试系统原型 - 组件库文档

> **版本**: v1.0
> **更新时间**: 2026-01-16
> **组件总数**: 23个

---

## 📖 文档说明

本文档提供考试系统原型的完整组件库,包含23个可复用组件。所有组件基于 TailwindCSS 实现,遵循统一的设计规范。

**使用方式**:
1. 复制组件 HTML 代码
2. 根据需要调整内容和样式
3. 确保已引入 TailwindCSS 和 FontAwesome CDN

**设计规范参考**: `design-guide.md`

---

## 目录

### 1. 布局组件 (3个)
- 1.1 页面布局框架 (AdminLayout)
- 1.2 面包屑导航 (Breadcrumb)
- 1.3 页面标题栏 (PageHeader)

### 2. 表单组件 (7个)
- 2.1 输入框 (Input)
- 2.2 下拉选择 (Select)
- 2.3 单选框与多选框 (Radio & Checkbox)
- 2.4 开关 (Switch)
- 2.5 日期时间选择器 (DateTimePicker)
- 2.6 富文本编辑器 (RichEditor)
- 2.7 文件上传 (FileUpload)

### 3. 展示组件 (5个)
- 3.1 表格 (Table)
- 3.2 卡片 (Card)
- 3.3 标签 (Tag)
- 3.4 徽章 (Badge)
- 3.5 进度条 (Progress)

### 4. 交互组件 (5个)
- 4.1 按钮 (Button)
- 4.2 分页器 (Pagination)
- 4.3 模态框 (Modal)
- 4.4 抽屉 (Drawer)
- 4.5 消息提示 (Toast)

### 5. 数据组件 (3个)
- 5.1 树形控件 (Tree)
- 5.2 空状态 (Empty)
- 5.3 骨架屏 (Skeleton)

---

# 1. 布局组件

## 1.1 页面布局框架 (AdminLayout)

**组件说明**: 管理端通用页面布局,包含顶部导航栏、侧边栏和主内容区。

**特性**:
- 固定顶栏(高度64px)
- 可折叠侧边栏(宽度256px)
- 自适应主内容区
- 响应式设计

**HTML结构**:

```html
<div class="min-h-screen bg-gray-50">
  <!-- 顶部导航栏 -->
  <header class="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
    <div class="flex items-center justify-between h-full px-6">
      <!-- 左侧:Logo + 面包屑 -->
      <div class="flex items-center space-x-4">
        <div class="text-xl font-semibold text-gray-900">考试系统</div>
        <nav class="flex items-center space-x-2 text-sm text-gray-600">
          <a href="#" class="hover:text-primary-500">首页</a>
          <i class="fas fa-chevron-right text-xs text-gray-400"></i>
          <span class="text-gray-900 font-medium">题库管理</span>
        </nav>
      </div>

      <!-- 右侧:通知 + 用户菜单 -->
      <div class="flex items-center space-x-4">
        <button class="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
          <i class="fas fa-bell"></i>
        </button>
        <div class="flex items-center space-x-2 cursor-pointer">
          <img src="https://via.placeholder.com/32" alt="用户头像" class="w-8 h-8 rounded-full">
          <span class="text-sm text-gray-700">管理员</span>
          <i class="fas fa-chevron-down text-xs text-gray-400"></i>
        </div>
      </div>
    </div>
  </header>

  <!-- 侧边栏 -->
  <aside class="w-64 bg-white border-r border-gray-200 fixed top-16 left-0 bottom-0 overflow-y-auto">
    <nav class="p-4">
      <!-- 导航菜单项 -->
      <a href="#" class="flex items-center space-x-3 px-3 py-2 rounded text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600">
        <i class="fas fa-home w-5"></i>
        <span>首页</span>
      </a>

      <!-- 激活状态的菜单项 -->
      <a href="#" class="flex items-center space-x-3 px-3 py-2 rounded text-sm font-medium bg-primary-50 text-primary-600">
        <i class="fas fa-book w-5"></i>
        <span>题库管理</span>
      </a>

      <!-- 带子菜单的菜单项 -->
      <div class="mt-1">
        <button class="w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
          <div class="flex items-center space-x-3">
            <i class="fas fa-file-alt w-5"></i>
            <span>试卷管理</span>
          </div>
          <i class="fas fa-chevron-down text-xs"></i>
        </button>
        <div class="ml-8 mt-1 space-y-1">
          <a href="#" class="block px-3 py-1.5 rounded text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50">试卷列表</a>
          <a href="#" class="block px-3 py-1.5 rounded text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50">创建试卷</a>
        </div>
      </div>
    </nav>
  </aside>

  <!-- 主内容区 -->
  <main class="ml-64 pt-16 min-h-screen">
    <div class="p-6">
      <!-- 页面内容 -->
      <h1 class="text-2xl font-semibold text-gray-900">页面标题</h1>
      <p class="text-sm text-gray-500 mt-1">页面描述信息</p>
    </div>
  </main>
</div>
```

**JavaScript 交互** (侧边栏折叠):

```javascript
// 切换侧边栏折叠状态
function toggleSidebar() {
  const sidebar = document.querySelector('aside');
  const main = document.querySelector('main');

  sidebar.classList.toggle('w-64');
  sidebar.classList.toggle('w-20');
  main.classList.toggle('ml-64');
  main.classList.toggle('ml-20');
}
```

---

## 1.2 面包屑导航 (Breadcrumb)

**组件说明**: 显示当前页面在系统中的位置层级。

**HTML结构**:

```html
<nav class="flex items-center space-x-2 text-sm text-gray-600">
  <a href="#" class="hover:text-primary-500 transition-colors">首页</a>
  <i class="fas fa-chevron-right text-xs text-gray-400"></i>
  <a href="#" class="hover:text-primary-500 transition-colors">题库管理</a>
  <i class="fas fa-chevron-right text-xs text-gray-400"></i>
  <span class="text-gray-900 font-medium">题目列表</span>
</nav>
```

**使用示例**:

```html
<!-- 两级面包屑 -->
<nav class="flex items-center space-x-2 text-sm text-gray-600">
  <a href="#" class="hover:text-primary-500">首页</a>
  <i class="fas fa-chevron-right text-xs text-gray-400"></i>
  <span class="text-gray-900 font-medium">题目列表</span>
</nav>

<!-- 三级面包屑 -->
<nav class="flex items-center space-x-2 text-sm text-gray-600">
  <a href="/" class="hover:text-primary-500">首页</a>
  <i class="fas fa-chevron-right text-xs text-gray-400"></i>
  <a href="/question-bank" class="hover:text-primary-500">题库管理</a>
  <i class="fas fa-chevron-right text-xs text-gray-400"></i>
  <span class="text-gray-900 font-medium">题目详情</span>
</nav>
```

---

## 1.3 页面标题栏 (PageHeader)

**组件说明**: 页面顶部标题区域,包含标题、描述和操作按钮。

**HTML结构**:

```html
<div class="flex items-center justify-between mb-6">
  <!-- 左侧:标题和描述 -->
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">题目列表</h1>
    <p class="mt-1 text-sm text-gray-500">管理和查看所有题目信息</p>
  </div>

  <!-- 右侧:操作按钮 -->
  <div class="flex items-center space-x-3">
    <button class="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded font-medium text-sm transition-colors">
      <i class="fas fa-download mr-2"></i>
      导出
    </button>
    <button class="bg-primary-500 text-white hover:bg-primary-600 px-4 py-2 rounded font-medium text-sm transition-colors">
      <i class="fas fa-plus mr-2"></i>
      新增题目
    </button>
  </div>
</div>
```

**变体 - 只有标题**:

```html
<div class="mb-6">
  <h1 class="text-2xl font-semibold text-gray-900">题目详情</h1>
</div>
```

**变体 - 带返回按钮**:

```html
<div class="flex items-center justify-between mb-6">
  <div class="flex items-center space-x-4">
    <button onclick="history.back()" class="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
      <i class="fas fa-arrow-left"></i>
    </button>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">题目详情</h1>
      <p class="mt-1 text-sm text-gray-500">查看题目完整信息</p>
    </div>
  </div>
</div>
```

---

# 2. 表单组件

## 2.1 输入框 (Input)

**组件说明**: 文本输入框,支持各种类型和状态。

**基础输入框**:

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">
    题目名称
  </label>
  <input type="text"
         class="w-full px-3 py-2 border border-gray-300 rounded
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                transition-colors"
         placeholder="请输入题目名称">
  <p class="mt-1 text-xs text-gray-500">最多50个字符</p>
</div>
```

**必填输入框**:

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">
    题目名称 <span class="text-error-500">*</span>
  </label>
  <input type="text"
         class="w-full px-3 py-2 border border-gray-300 rounded
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
         placeholder="请输入题目名称" required>
</div>
```

**错误状态**:

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">
    题目名称 <span class="text-error-500">*</span>
  </label>
  <input type="text"
         class="w-full px-3 py-2 border border-error-500 rounded
                focus:outline-none focus:ring-2 focus:ring-error-500 focus:border-error-500"
         placeholder="请输入题目名称"
         value="">
  <p class="mt-1 text-xs text-error-500">
    <i class="fas fa-exclamation-circle"></i> 该字段为必填项
  </p>
</div>
```

**禁用状态**:

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">题目ID</label>
  <input type="text"
         class="w-full px-3 py-2 border border-gray-300 rounded
                bg-gray-100 cursor-not-allowed"
         value="Q001" disabled>
</div>
```

**带前缀图标**:

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">搜索</label>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <i class="fas fa-search text-gray-400"></i>
    </div>
    <input type="text"
           class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
           placeholder="搜索题目...">
  </div>
</div>
```

---

## 2.2 下拉选择 (Select)

**组件说明**: 下拉选择器,支持单选和多选。

**单选下拉**:

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">题型</label>
  <select class="w-full px-3 py-2 border border-gray-300 rounded
                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                 bg-white">
    <option value="">请选择题型</option>
    <option value="single">单选题</option>
    <option value="multiple">多选题</option>
    <option value="judge">判断题</option>
    <option value="fill">填空题</option>
    <option value="essay">简答题</option>
  </select>
</div>
```

**可搜索下拉** (需要JavaScript):

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">知识点</label>
  <div class="relative">
    <input type="text"
           class="w-full px-3 py-2 border border-gray-300 rounded
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
           placeholder="搜索知识点..."
           id="categorySearch">

    <!-- 下拉菜单 -->
    <div class="dropdown-menu absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md hidden z-10">
      <ul class="max-h-60 overflow-y-auto py-1">
        <li class="px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 cursor-pointer">
          数学基础
        </li>
        <li class="px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 cursor-pointer">
          代数运算
        </li>
        <li class="px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 cursor-pointer">
          几何图形
        </li>
      </ul>
    </div>
  </div>
</div>
```

---

## 2.3 单选框与多选框 (Radio & Checkbox)

**单选框组**:

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">难度</label>
  <div class="flex items-center space-x-6">
    <label class="inline-flex items-center cursor-pointer">
      <input type="radio" name="difficulty" value="1"
             class="w-4 h-4 text-primary-500 focus:ring-primary-500 border-gray-300">
      <span class="ml-2 text-sm text-gray-700">一级</span>
    </label>
    <label class="inline-flex items-center cursor-pointer">
      <input type="radio" name="difficulty" value="2"
             class="w-4 h-4 text-primary-500 focus:ring-primary-500 border-gray-300">
      <span class="ml-2 text-sm text-gray-700">二级</span>
    </label>
    <label class="inline-flex items-center cursor-pointer">
      <input type="radio" name="difficulty" value="3"
             class="w-4 h-4 text-primary-500 focus:ring-primary-500 border-gray-300">
      <span class="ml-2 text-sm text-gray-700">三级</span>
    </label>
  </div>
</div>
```

**多选框**:

```html
<div class="mb-4">
  <label class="inline-flex items-center cursor-pointer">
    <input type="checkbox"
           class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500 border-gray-300">
    <span class="ml-2 text-sm text-gray-700">记住密码</span>
  </label>
</div>

<!-- 多选框组 -->
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">题型筛选</label>
  <div class="space-y-2">
    <label class="inline-flex items-center cursor-pointer">
      <input type="checkbox" value="single"
             class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500 border-gray-300">
      <span class="ml-2 text-sm text-gray-700">单选题</span>
    </label>
    <br>
    <label class="inline-flex items-center cursor-pointer">
      <input type="checkbox" value="multiple"
             class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500 border-gray-300">
      <span class="ml-2 text-sm text-gray-700">多选题</span>
    </label>
  </div>
</div>
```

---

## 2.4 开关 (Switch)

**组件说明**: 开关组件,用于开启/关闭某个功能。

**HTML结构**:

```html
<label class="inline-flex items-center cursor-pointer">
  <input type="checkbox" class="sr-only peer">
  <div class="relative w-11 h-6 bg-gray-300 rounded-full peer
              peer-checked:bg-primary-500 transition-colors
              after:content-[''] after:absolute after:top-0.5 after:left-0.5
              after:bg-white after:rounded-full after:h-5 after:w-5
              after:transition-transform peer-checked:after:translate-x-5">
  </div>
  <span class="ml-3 text-sm text-gray-700">启用</span>
</label>
```

**使用示例**:

```html
<!-- 表单中的开关 -->
<div class="mb-4">
  <div class="flex items-center justify-between">
    <div>
      <p class="text-sm font-medium text-gray-700">公开题目</p>
      <p class="text-xs text-gray-500 mt-1">开启后其他教师可以使用该题目</p>
    </div>
    <label class="inline-flex items-center cursor-pointer">
      <input type="checkbox" class="sr-only peer" checked>
      <div class="relative w-11 h-6 bg-gray-300 rounded-full peer
                  peer-checked:bg-primary-500 transition-colors
                  after:content-[''] after:absolute after:top-0.5 after:left-0.5
                  after:bg-white after:rounded-full after:h-5 after:w-5
                  after:transition-transform peer-checked:after:translate-x-5">
      </div>
    </label>
  </div>
</div>
```

---

## 2.5 日期时间选择器 (DateTimePicker)

**组件说明**: 日期和时间选择器,使用原生HTML5控件。

**日期选择**:

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">考试日期</label>
  <input type="date"
         class="w-full px-3 py-2 border border-gray-300 rounded
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
</div>
```

**时间选择**:

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
  <input type="time"
         class="w-full px-3 py-2 border border-gray-300 rounded
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
</div>
```

**日期时间选择**:

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
  <input type="datetime-local"
         class="w-full px-3 py-2 border border-gray-300 rounded
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
</div>
```

**日期范围选择**:

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">考试时间段</label>
  <div class="grid grid-cols-2 gap-3">
    <input type="datetime-local"
           class="w-full px-3 py-2 border border-gray-300 rounded
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
           placeholder="开始时间">
    <input type="datetime-local"
           class="w-full px-3 py-2 border border-gray-300 rounded
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
           placeholder="结束时间">
  </div>
</div>
```

---

## 2.6 富文本编辑器 (RichEditor)

**组件说明**: 简化版富文本编辑器,支持基本格式化和插入媒体。

**HTML结构**:

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">题干</label>
  <div class="rich-editor border border-gray-300 rounded overflow-hidden">
    <!-- 工具栏 -->
    <div class="editor-toolbar bg-gray-50 border-b border-gray-200 p-2 flex items-center space-x-1">
      <button class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded"
              title="加粗">
        <i class="fas fa-bold"></i>
      </button>
      <button class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded"
              title="斜体">
        <i class="fas fa-italic"></i>
      </button>
      <button class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded"
              title="下划线">
        <i class="fas fa-underline"></i>
      </button>

      <div class="w-px h-5 bg-gray-300 mx-1"></div>

      <button class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded"
              title="有序列表">
        <i class="fas fa-list-ol"></i>
      </button>
      <button class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded"
              title="无序列表">
        <i class="fas fa-list-ul"></i>
      </button>

      <div class="w-px h-5 bg-gray-300 mx-1"></div>

      <button class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded"
              title="插入图片">
        <i class="fas fa-image"></i>
      </button>
      <button class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded"
              title="插入公式">
        <i class="fas fa-function"></i>
      </button>
      <button class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded"
              title="插入链接">
        <i class="fas fa-link"></i>
      </button>
    </div>

    <!-- 编辑区 -->
    <div class="editor-content min-h-[200px] max-h-[400px] p-4 overflow-y-auto
                focus:outline-none focus:ring-2 focus:ring-primary-500"
         contenteditable="true"
         data-placeholder="请输入题干内容...">
    </div>
  </div>
  <p class="mt-1 text-xs text-gray-500">支持插入图片、公式和链接</p>
</div>
```

**CSS样式** (需要添加):

```css
.editor-content:empty:before {
  content: attr(data-placeholder);
  color: #9CA3AF;
}
```

---

## 2.7 文件上传 (FileUpload)

**组件说明**: 文件上传组件,支持拖拽和点击上传。

**HTML结构**:

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">上传文档</label>

  <!-- 上传区域 -->
  <div class="upload-area border-2 border-dashed border-gray-300 rounded-lg p-8 text-center
              hover:border-primary-500 hover:bg-primary-50 cursor-pointer transition-colors"
       onclick="document.getElementById('fileInput').click()">
    <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
    <p class="text-sm text-gray-600 font-medium">点击或拖拽文件到此处上传</p>
    <p class="text-xs text-gray-400 mt-2">支持 PDF、Word 格式，最大 50MB</p>
    <input type="file" id="fileInput" class="hidden" accept=".pdf,.doc,.docx" multiple>
  </div>

  <!-- 已上传文件列表 -->
  <div class="mt-3 space-y-2">
    <div class="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
      <div class="flex items-center space-x-3">
        <i class="fas fa-file-pdf text-error-500 text-xl"></i>
        <div>
          <p class="text-sm text-gray-700 font-medium">试卷文档.pdf</p>
          <p class="text-xs text-gray-400">2.5 MB</p>
        </div>
      </div>
      <button class="text-gray-400 hover:text-error-500 transition-colors">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
      <div class="flex items-center space-x-3">
        <i class="fas fa-file-word text-info-500 text-xl"></i>
        <div>
          <p class="text-sm text-gray-700 font-medium">答题卡.docx</p>
          <p class="text-xs text-gray-400">1.2 MB</p>
        </div>
      </div>
      <button class="text-gray-400 hover:text-error-500 transition-colors">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</div>
```

**上传进度条**:

```html
<div class="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
  <div class="flex-1">
    <div class="flex items-center justify-between mb-2">
      <p class="text-sm text-gray-700 font-medium">文件名.pdf</p>
      <span class="text-xs text-gray-500">65%</span>
    </div>
    <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div class="h-full bg-primary-500 rounded-full transition-all" style="width: 65%"></div>
    </div>
  </div>
</div>
```

---

# 3. 展示组件

## 3.1 表格 (Table)

**组件说明**: 数据表格,支持选择、排序和操作。

**HTML结构**:

```html
<div class="table-container overflow-x-auto bg-white rounded-lg border border-gray-200">
  <table class="data-table w-full">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-6 py-3 text-left">
          <input type="checkbox" class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500 border-gray-300">
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          题目ID
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          题干
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          题型
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          知识点
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          难度
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          创建时间
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          操作
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-t border-gray-200 hover:bg-gray-50">
        <td class="px-6 py-4">
          <input type="checkbox" class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500 border-gray-300">
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="text-primary-500 font-mono font-medium">Q001</span>
        </td>
        <td class="px-6 py-4">
          <p class="text-sm text-gray-700 max-w-md truncate">下列关于计算机系统的描述，正确的是？</p>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="bg-info-50 text-info-600 px-2.5 py-0.5 rounded-full text-xs font-medium">单选题</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
          计算机基础
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="bg-warning-50 text-warning-600 px-2.5 py-0.5 rounded-full text-xs font-medium">二级</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          2026-01-15
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center space-x-2">
            <button class="text-primary-500 hover:text-primary-600" title="查看">
              <i class="fas fa-eye"></i>
            </button>
            <button class="text-gray-500 hover:text-gray-700" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button class="text-error-500 hover:text-error-600" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>

      <!-- 更多行... -->
    </tbody>
  </table>
</div>
```

**空表格状态**:

```html
<div class="table-container overflow-x-auto bg-white rounded-lg border border-gray-200">
  <table class="data-table w-full">
    <thead class="bg-gray-50">
      <!-- 表头... -->
    </thead>
    <tbody>
      <tr>
        <td colspan="8" class="px-6 py-16 text-center">
          <i class="fas fa-inbox text-5xl text-gray-300 mb-3"></i>
          <p class="text-gray-500">暂无数据</p>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 3.2 卡片 (Card)

**基础卡片**:

```html
<div class="bg-white border border-gray-200 rounded-lg shadow-sm">
  <div class="px-6 py-4 border-b border-gray-200">
    <h3 class="text-base font-semibold text-gray-900">卡片标题</h3>
  </div>
  <div class="px-6 py-4">
    <p class="text-sm text-gray-600">卡片内容...</p>
  </div>
</div>
```

**统计卡片**:

```html
<div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
  <div class="flex items-center justify-between">
    <div>
      <p class="text-sm text-gray-500">总题目数</p>
      <p class="text-3xl font-semibold text-gray-900 mt-2">1,234</p>
      <p class="text-sm text-success-500 mt-1">
        <i class="fas fa-arrow-up"></i> 12% 较上周
      </p>
    </div>
    <div class="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center">
      <i class="fas fa-book text-2xl text-primary-500"></i>
    </div>
  </div>
</div>
```

**信息卡片**:

```html
<div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
  <div class="h-32 bg-gradient-to-r from-primary-400 to-primary-600"></div>
  <div class="p-6">
    <div class="flex items-center space-x-3 mb-4">
      <img src="https://via.placeholder.com/48" alt="头像" class="w-12 h-12 rounded-full border-2 border-white -mt-10">
      <div>
        <h3 class="text-base font-semibold text-gray-900">张三</h3>
        <p class="text-sm text-gray-500">高级教师</p>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-4 text-center">
      <div>
        <p class="text-2xl font-semibold text-gray-900">328</p>
        <p class="text-xs text-gray-500 mt-1">出题数</p>
      </div>
      <div>
        <p class="text-2xl font-semibold text-gray-900">156</p>
        <p class="text-xs text-gray-500 mt-1">批阅数</p>
      </div>
      <div>
        <p class="text-2xl font-semibold text-gray-900">98%</p>
        <p class="text-xs text-gray-500 mt-1">好评率</p>
      </div>
    </div>
  </div>
</div>
```

---

## 3.3 标签 (Tag)

**组件说明**: 用于标记和分类的标签组件。

**HTML结构**:

```html
<!-- 主题标签 -->
<span class="bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
  P0
</span>

<!-- 成功标签 -->
<span class="bg-success-50 text-success-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
  已完成
</span>

<!-- 警告标签 -->
<span class="bg-warning-50 text-warning-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
  进行中
</span>

<!-- 错误标签 -->
<span class="bg-error-50 text-error-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
  已取消
</span>

<!-- 中性标签 -->
<span class="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
  草稿
</span>

<!-- 信息标签 -->
<span class="bg-info-50 text-info-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
  单选题
</span>
```

**可关闭标签**:

```html
<span class="inline-flex items-center bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
  JavaScript
  <button class="ml-1.5 text-primary-500 hover:text-primary-700">
    <i class="fas fa-times text-xs"></i>
  </button>
</span>
```

---

## 3.4 徽章 (Badge)

**组件说明**: 数字徽章,用于显示通知数量。

**HTML结构**:

```html
<!-- 带徽章的按钮 -->
<button class="relative w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
  <i class="fas fa-bell"></i>
  <span class="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 bg-error-500 text-white text-xs font-medium rounded-full">
    5
  </span>
</button>

<!-- 99+ 徽章 -->
<button class="relative w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
  <i class="fas fa-envelope"></i>
  <span class="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 bg-error-500 text-white text-xs font-medium rounded-full">
    99+
  </span>
</button>

<!-- 小红点 -->
<button class="relative w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
  <i class="fas fa-comment"></i>
  <span class="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
</button>
```

---

## 3.5 进度条 (Progress)

**组件说明**: 进度条组件,显示任务完成进度。

**线性进度条**:

```html
<div class="mb-2">
  <div class="flex items-center justify-between text-sm mb-1">
    <span class="text-gray-700">完成进度</span>
    <span class="text-gray-900 font-medium">65%</span>
  </div>
  <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <div class="h-full bg-primary-500 rounded-full transition-all duration-300" style="width: 65%"></div>
  </div>
</div>
```

**不同颜色的进度条**:

```html
<!-- 成功（绿色） -->
<div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
  <div class="h-full bg-success-500 rounded-full" style="width: 100%"></div>
</div>

<!-- 警告（橙色） -->
<div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
  <div class="h-full bg-warning-500 rounded-full" style="width: 50%"></div>
</div>

<!-- 危险（红色） -->
<div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
  <div class="h-full bg-error-500 rounded-full" style="width: 20%"></div>
</div>
```

**带标签的进度条**:

```html
<div class="space-y-3">
  <div>
    <div class="flex items-center justify-between text-xs mb-1">
      <span class="text-gray-600">单选题</span>
      <span class="text-gray-900">450/500</span>
    </div>
    <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div class="h-full bg-primary-500 rounded-full" style="width: 90%"></div>
    </div>
  </div>

  <div>
    <div class="flex items-center justify-between text-xs mb-1">
      <span class="text-gray-600">多选题</span>
      <span class="text-gray-900">120/200</span>
    </div>
    <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div class="h-full bg-info-500 rounded-full" style="width: 60%"></div>
    </div>
  </div>
</div>
```

---

# 4. 交互组件

## 4.1 按钮 (Button)

**主按钮**:

```html
<button class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded
               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
               transition-colors">
  保存
</button>
```

**次要按钮**:

```html
<button class="bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded
               border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500
               transition-colors">
  取消
</button>
```

**危险按钮**:

```html
<button class="bg-error-500 hover:bg-error-600 text-white font-medium px-4 py-2 rounded
               focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2
               transition-colors">
  删除
</button>
```

**文字按钮**:

```html
<button class="text-primary-500 hover:text-primary-600 hover:bg-primary-50 font-medium px-2 py-1 rounded
               transition-colors">
  查看详情
</button>
```

**图标按钮**:

```html
<button class="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600
               hover:bg-gray-200 rounded transition-colors">
  <i class="fas fa-plus"></i>
</button>
```

**带图标的按钮**:

```html
<button class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded
               inline-flex items-center transition-colors">
  <i class="fas fa-download mr-2"></i>
  导出
</button>
```

**加载状态**:

```html
<button class="bg-primary-500 text-white font-medium px-4 py-2 rounded inline-flex items-center
               opacity-50 cursor-not-allowed" disabled>
  <i class="fas fa-spinner fa-spin mr-2"></i>
  加载中...
</button>
```

**按钮尺寸变体**:

```html
<!-- 小按钮 -->
<button class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-3 py-1.5 rounded text-xs">
  小按钮
</button>

<!-- 标准按钮 -->
<button class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded text-sm">
  标准按钮
</button>

<!-- 大按钮 -->
<button class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded text-base">
  大按钮
</button>
```

**按钮组**:

```html
<div class="inline-flex rounded border border-gray-300 overflow-hidden">
  <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border-r border-gray-300">
    列表
  </button>
  <button class="px-4 py-2 text-sm font-medium text-white bg-primary-500 border-r border-gray-300">
    卡片
  </button>
  <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
    表格
  </button>
</div>
```

---

## 4.2 分页器 (Pagination)

**组件说明**: 分页组件,用于分页浏览数据。

**HTML结构**:

```html
<div class="flex items-center justify-between mt-6">
  <!-- 左侧:数据统计 -->
  <div class="text-sm text-gray-600">
    显示 <span class="font-medium text-gray-900">1</span> 到 <span class="font-medium text-gray-900">10</span> 条，
    共 <span class="font-medium text-gray-900">100</span> 条
  </div>

  <!-- 右侧:分页按钮 -->
  <div class="flex items-center space-x-1">
    <button class="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-sm text-gray-700
                   hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled>
      <i class="fas fa-chevron-left"></i>
    </button>

    <button class="w-8 h-8 flex items-center justify-center rounded border border-primary-500 bg-primary-500 text-white text-sm font-medium">
      1
    </button>
    <button class="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
      2
    </button>
    <button class="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
      3
    </button>
    <span class="px-2 text-gray-400">...</span>
    <button class="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
      10
    </button>

    <button class="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
      <i class="fas fa-chevron-right"></i>
    </button>

    <div class="ml-4 flex items-center space-x-2">
      <select class="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
        <option>10</option>
        <option>20</option>
        <option>50</option>
        <option>100</option>
      </select>
      <span class="text-sm text-gray-600">条/页</span>
    </div>
  </div>
</div>
```

**简洁版分页**:

```html
<div class="flex items-center justify-center space-x-2 mt-6">
  <button class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm">
    上一页
  </button>
  <button class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded text-sm">
    下一页
  </button>
</div>
```

---

## 4.3 模态框 (Modal)

**组件说明**: 模态对话框,用于重要操作的二次确认或表单提交。

**HTML结构**:

```html
<!-- 遮罩层 -->
<div class="modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center hidden">
  <!-- 模态框容器 -->
  <div class="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden">
    <!-- 头部 -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">删除确认</h3>
      <button class="text-gray-400 hover:text-gray-600 text-xl" onclick="closeModal()">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- 内容 -->
    <div class="px-6 py-4 overflow-y-auto">
      <p class="text-sm text-gray-600">确定要删除这道题目吗？此操作不可恢复。</p>
    </div>

    <!-- 底部 -->
    <div class="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
      <button class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded font-medium text-sm"
              onclick="closeModal()">
        取消
      </button>
      <button class="bg-error-500 hover:bg-error-600 text-white px-4 py-2 rounded font-medium text-sm">
        确定删除
      </button>
    </div>
  </div>
</div>
```

**JavaScript控制**:

```javascript
function openModal() {
  document.querySelector('.modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.querySelector('.modal-overlay').classList.add('hidden');
}
```

**表单模态框**:

```html
<div class="modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center hidden">
  <div class="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">新增知识点</h3>
      <button class="text-gray-400 hover:text-gray-600 text-xl">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="px-6 py-4 overflow-y-auto">
      <form>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">知识点名称</label>
          <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="请输入知识点名称">
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">父级知识点</label>
          <select class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>根节点</option>
            <option>数学</option>
            <option>语文</option>
          </select>
        </div>
      </form>
    </div>

    <div class="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
      <button class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded font-medium text-sm">
        取消
      </button>
      <button class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded font-medium text-sm">
        确定
      </button>
    </div>
  </div>
</div>
```

---

## 4.4 抽屉 (Drawer)

**组件说明**: 侧边抽屉,用于筛选、详情展示等场景。

**HTML结构**:

```html
<!-- 遮罩层 -->
<div class="drawer-overlay fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
  <!-- 抽屉容器 -->
  <div class="drawer-container fixed top-0 right-0 bottom-0 w-96 bg-white shadow-xl transform translate-x-full transition-transform duration-300 flex flex-col">
    <!-- 头部 -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">筛选条件</h3>
      <button class="text-gray-400 hover:text-gray-600 text-xl" onclick="closeDrawer()">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- 内容 -->
    <div class="flex-1 px-6 py-4 overflow-y-auto">
      <!-- 筛选表单 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">题型</label>
        <div class="space-y-2">
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" class="w-4 h-4 text-primary-500 rounded">
            <span class="ml-2 text-sm text-gray-700">单选题</span>
          </label>
          <br>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" class="w-4 h-4 text-primary-500 rounded">
            <span class="ml-2 text-sm text-gray-700">多选题</span>
          </label>
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">难度</label>
        <div class="flex items-center space-x-2">
          <button class="px-3 py-1.5 bg-primary-50 text-primary-600 border border-primary-200 rounded text-sm font-medium">
            一级
          </button>
          <button class="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded text-sm hover:bg-gray-50">
            二级
          </button>
          <button class="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded text-sm hover:bg-gray-50">
            三级
          </button>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <button class="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded font-medium text-sm mb-2">
        重置
      </button>
      <button class="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded font-medium text-sm">
        确定
      </button>
    </div>
  </div>
</div>
```

**JavaScript控制**:

```javascript
function openDrawer() {
  const overlay = document.querySelector('.drawer-overlay');
  const container = document.querySelector('.drawer-container');
  overlay.classList.remove('hidden');
  setTimeout(() => {
    container.classList.remove('translate-x-full');
  }, 10);
}

function closeDrawer() {
  const overlay = document.querySelector('.drawer-overlay');
  const container = document.querySelector('.drawer-container');
  container.classList.add('translate-x-full');
  setTimeout(() => {
    overlay.classList.add('hidden');
  }, 300);
}
```

---

## 4.5 消息提示 (Toast)

**组件说明**: 轻量级消息提示,用于操作反馈。

**成功提示**:

```html
<div class="toast fixed top-20 right-6 flex items-center space-x-3 bg-success-50 text-success-700 border border-success-200 px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right">
  <i class="fas fa-check-circle text-lg"></i>
  <span class="font-medium">保存成功！</span>
  <button class="text-success-600 hover:text-success-800 ml-2">
    <i class="fas fa-times"></i>
  </button>
</div>
```

**错误提示**:

```html
<div class="toast fixed top-20 right-6 flex items-center space-x-3 bg-error-50 text-error-700 border border-error-200 px-4 py-3 rounded-lg shadow-lg z-50">
  <i class="fas fa-times-circle text-lg"></i>
  <span class="font-medium">提交失败，请重试</span>
  <button class="text-error-600 hover:text-error-800 ml-2">
    <i class="fas fa-times"></i>
  </button>
</div>
```

**警告提示**:

```html
<div class="toast fixed top-20 right-6 flex items-center space-x-3 bg-warning-50 text-warning-700 border border-warning-200 px-4 py-3 rounded-lg shadow-lg z-50">
  <i class="fas fa-exclamation-triangle text-lg"></i>
  <span class="font-medium">请注意检查输入内容</span>
  <button class="text-warning-600 hover:text-warning-800 ml-2">
    <i class="fas fa-times"></i>
  </button>
</div>
```

**信息提示**:

```html
<div class="toast fixed top-20 right-6 flex items-center space-x-3 bg-info-50 text-info-700 border border-info-200 px-4 py-3 rounded-lg shadow-lg z-50">
  <i class="fas fa-info-circle text-lg"></i>
  <span class="font-medium">系统将在5分钟后维护</span>
  <button class="text-info-600 hover:text-info-800 ml-2">
    <i class="fas fa-times"></i>
  </button>
</div>
```

**JavaScript控制**:

```javascript
function showToast(message, type = 'success') {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };

  const colors = {
    success: 'bg-success-50 text-success-700 border-success-200',
    error: 'bg-error-50 text-error-700 border-error-200',
    warning: 'bg-warning-50 text-warning-700 border-warning-200',
    info: 'bg-info-50 text-info-700 border-info-200'
  };

  const toast = document.createElement('div');
  toast.className = `toast fixed top-20 right-6 flex items-center space-x-3 ${colors[type]} px-4 py-3 rounded-lg shadow-lg z-50`;
  toast.innerHTML = `
    <i class="fas ${icons[type]} text-lg"></i>
    <span class="font-medium">${message}</span>
    <button class="ml-2" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
```

---

# 5. 数据组件

## 5.1 树形控件 (Tree)

**组件说明**: 树形结构展示,用于知识点管理等场景。

**HTML结构**:

```html
<div class="tree-container bg-white rounded-lg border border-gray-200 p-4">
  <!-- 树节点 -->
  <div class="tree-node">
    <div class="tree-node-header flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-gray-50 group">
      <button class="tree-toggle w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600">
        <i class="fas fa-chevron-down"></i>
      </button>
      <i class="fas fa-folder text-warning-500"></i>
      <span class="tree-node-label text-sm text-gray-700 flex-1">根知识点</span>
      <div class="tree-node-actions flex items-center space-x-1 opacity-0 group-hover:opacity-100">
        <button class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="添加">
          <i class="fas fa-plus text-xs"></i>
        </button>
        <button class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="编辑">
          <i class="fas fa-edit text-xs"></i>
        </button>
        <button class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-error-500 hover:bg-gray-100 rounded" title="删除">
          <i class="fas fa-trash text-xs"></i>
        </button>
      </div>
    </div>

    <!-- 子节点 -->
    <div class="tree-node-children ml-6 mt-1">
      <div class="tree-node">
        <div class="tree-node-header flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-gray-50 group">
          <button class="tree-toggle w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600">
            <i class="fas fa-chevron-right"></i>
          </button>
          <i class="fas fa-folder-open text-warning-500"></i>
          <span class="tree-node-label text-sm text-gray-700 flex-1">子知识点1</span>
          <div class="tree-node-actions flex items-center space-x-1 opacity-0 group-hover:opacity-100">
            <button class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
              <i class="fas fa-plus text-xs"></i>
            </button>
            <button class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
              <i class="fas fa-edit text-xs"></i>
            </button>
            <button class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-error-500 hover:bg-gray-100 rounded">
              <i class="fas fa-trash text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="tree-node">
        <div class="tree-node-header flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-gray-50 group">
          <span class="w-4"></span>
          <i class="fas fa-file text-gray-400"></i>
          <span class="tree-node-label text-sm text-gray-700 flex-1">叶子节点</span>
          <div class="tree-node-actions flex items-center space-x-1 opacity-0 group-hover:opacity-100">
            <button class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
              <i class="fas fa-edit text-xs"></i>
            </button>
            <button class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-error-500 hover:bg-gray-100 rounded">
              <i class="fas fa-trash text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**JavaScript交互**:

```javascript
// 切换树节点展开/折叠
document.querySelectorAll('.tree-toggle').forEach(btn => {
  btn.addEventListener('click', function() {
    const node = this.closest('.tree-node');
    const children = node.querySelector('.tree-node-children');
    const icon = this.querySelector('i');

    if (children) {
      children.classList.toggle('hidden');
      icon.classList.toggle('fa-chevron-down');
      icon.classList.toggle('fa-chevron-right');
    }
  });
});
```

---

## 5.2 空状态 (Empty)

**组件说明**: 当列表或内容为空时显示的占位组件。

**HTML结构**:

```html
<div class="empty-state flex flex-col items-center justify-center py-16 text-center">
  <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
  <p class="text-gray-500 mb-4">暂无数据</p>
  <button class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded font-medium text-sm">
    创建第一个题目
  </button>
</div>
```

**不同场景的空状态**:

```html
<!-- 搜索无结果 -->
<div class="empty-state flex flex-col items-center justify-center py-16 text-center">
  <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
  <p class="text-gray-500 mb-2">未找到相关内容</p>
  <p class="text-sm text-gray-400">试试其他关键词</p>
</div>

<!-- 网络错误 -->
<div class="empty-state flex flex-col items-center justify-center py-16 text-center">
  <i class="fas fa-wifi text-6xl text-gray-300 mb-4"></i>
  <p class="text-gray-500 mb-4">网络连接失败</p>
  <button class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded font-medium text-sm">
    重新加载
  </button>
</div>

<!-- 权限不足 -->
<div class="empty-state flex flex-col items-center justify-center py-16 text-center">
  <i class="fas fa-lock text-6xl text-gray-300 mb-4"></i>
  <p class="text-gray-500 mb-2">无权限访问</p>
  <p class="text-sm text-gray-400">请联系管理员申请权限</p>
</div>
```

---

## 5.3 骨架屏 (Skeleton)

**组件说明**: 加载占位符,在数据加载时显示。

**HTML结构**:

```html
<div class="skeleton-container space-y-4">
  <!-- 文本骨架 -->
  <div class="bg-gray-200 animate-pulse rounded h-4"></div>
  <div class="bg-gray-200 animate-pulse rounded h-4 w-3/4"></div>
  <div class="bg-gray-200 animate-pulse rounded h-4 w-1/2"></div>

  <!-- 头像骨架 -->
  <div class="bg-gray-200 animate-pulse rounded-full w-12 h-12"></div>

  <!-- 图片骨架 -->
  <div class="bg-gray-200 animate-pulse rounded-lg h-48 w-full"></div>
</div>
```

**卡片骨架**:

```html
<div class="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
  <div class="flex items-center space-x-3">
    <div class="bg-gray-200 animate-pulse rounded-full w-12 h-12"></div>
    <div class="flex-1 space-y-2">
      <div class="bg-gray-200 animate-pulse rounded h-4 w-1/3"></div>
      <div class="bg-gray-200 animate-pulse rounded h-3 w-1/2"></div>
    </div>
  </div>
  <div class="bg-gray-200 animate-pulse rounded-lg h-32 w-full"></div>
  <div class="space-y-2">
    <div class="bg-gray-200 animate-pulse rounded h-3 w-full"></div>
    <div class="bg-gray-200 animate-pulse rounded h-3 w-5/6"></div>
  </div>
</div>
```

**表格骨架**:

```html
<div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
  <table class="w-full">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-6 py-3"><div class="bg-gray-200 animate-pulse rounded h-3 w-16"></div></th>
        <th class="px-6 py-3"><div class="bg-gray-200 animate-pulse rounded h-3 w-20"></div></th>
        <th class="px-6 py-3"><div class="bg-gray-200 animate-pulse rounded h-3 w-24"></div></th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-t border-gray-200">
        <td class="px-6 py-4"><div class="bg-gray-200 animate-pulse rounded h-3 w-full"></div></td>
        <td class="px-6 py-4"><div class="bg-gray-200 animate-pulse rounded h-3 w-full"></div></td>
        <td class="px-6 py-4"><div class="bg-gray-200 animate-pulse rounded h-3 w-full"></div></td>
      </tr>
      <tr class="border-t border-gray-200">
        <td class="px-6 py-4"><div class="bg-gray-200 animate-pulse rounded h-3 w-full"></div></td>
        <td class="px-6 py-4"><div class="bg-gray-200 animate-pulse rounded h-3 w-full"></div></td>
        <td class="px-6 py-4"><div class="bg-gray-200 animate-pulse rounded h-3 w-full"></div></td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 📚 参考资源

- **设计规范**: `design-guide.md`
- **设计文档**: `.spec-workflow/specs/exam-system-prototype/design.md`
- **TailwindCSS 文档**: https://tailwindcss.com/docs
- **FontAwesome 图标**: https://fontawesome.com/icons

---

## ✅ 组件使用检查清单

使用组件前请确认:
- [ ] 已引入 TailwindCSS CDN
- [ ] 已引入 FontAwesome CDN
- [ ] 已配置 TailwindCSS 自定义颜色
- [ ] 理解组件的HTML结构
- [ ] 知道如何调整组件样式
- [ ] 了解组件的交互逻辑(如需JavaScript)

---

## 📝 版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-01-16 | 初始版本,包含23个组件 |

---

**维护者**: Claude Code
**联系方式**: 如有疑问,请参考 `design.md` 或询问项目负责人
