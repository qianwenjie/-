# 考试系统原型设计规范

> **版本**: v1.0
> **更新时间**: 2026-01-16
> **设计主题**: 教育绿 - 清新、活力、亲和的教育氛围

---

## 📖 文档说明

本文档定义了考试系统原型的完整设计规范体系,包括色彩、字体、间距、圆角、阴影等设计Token。所有页面必须严格遵循本规范,确保视觉和交互的一致性。

**适用范围**:
- 管理端(24个页面)
- 学生端(8个页面)
- 教师端(6个页面)

**技术栈**:
- TailwindCSS(CDN引入)
- FontAwesome图标库
- 原生JavaScript

---

## 🎨 色彩系统

### 1. 主色调(Primary - 教育绿)

**设计理念**: 使用教育绿作为主色调,传达清新、活力、亲和的教育氛围,符合教育产品的调性。

| 色阶 | 色值 | 用途 | TailwindCSS类 |
|------|------|------|---------------|
| primary-50 | `#E6F9F0` | 极浅绿 - 背景高亮 | `bg-primary-50` |
| primary-100 | `#B3EDCE` | 浅绿 - 悬停背景 | `bg-primary-100` |
| primary-200 | `#80E0AD` | 中浅绿 | `bg-primary-200` |
| primary-300 | `#4DD48B` | 中绿 | `bg-primary-300` |
| primary-400 | `#1AC76A` | 中深绿 | `bg-primary-400` |
| primary-500 | `#00B96B` | **主色** - 按钮、链接 | `bg-primary-500` `text-primary-500` |
| primary-600 | `#00A35C` | 深绿 - 按钮悬停 | `bg-primary-600` `hover:bg-primary-600` |
| primary-700 | `#008A4D` | 更深绿 | `bg-primary-700` |
| primary-800 | `#00703E` | 极深绿 | `bg-primary-800` |
| primary-900 | `#00572F` | 最深绿 | `bg-primary-900` |

**使用示例**:

```html
<!-- 主按钮 -->
<button class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded">
  保存
</button>

<!-- 文字链接 -->
<a href="#" class="text-primary-500 hover:text-primary-600">
  查看详情
</a>

<!-- 背景高亮区域 -->
<div class="bg-primary-50 border border-primary-200 rounded-lg p-4">
  提示信息
</div>
```

---

### 2. 语义色(Semantic Colors)

语义色用于传达不同类型的信息状态,帮助用户快速理解信息含义。

#### 2.1 成功色(Success)

| 色阶 | 色值 | 用途 | TailwindCSS类 |
|------|------|------|---------------|
| success-50 | `#E8FFEA` | 成功背景 | `bg-success-50` |
| success-500 | `#00B42A` | 成功主色 | `bg-success-500` `text-success-500` |
| success-600 | `#009A24` | 成功深色 | `bg-success-600` |

**使用场景**: 操作成功提示、成功状态标签、完成进度

```html
<!-- 成功提示 -->
<div class="bg-success-50 text-success-600 border border-success-200 rounded p-3">
  <i class="fas fa-check-circle"></i> 保存成功!
</div>

<!-- 成功状态标签 -->
<span class="bg-success-50 text-success-600 px-2.5 py-0.5 rounded-full text-xs">
  已完成
</span>
```

#### 2.2 警告色(Warning)

| 色阶 | 色值 | 用途 | TailwindCSS类 |
|------|------|------|---------------|
| warning-50 | `#FFF7E8` | 警告背景 | `bg-warning-50` |
| warning-500 | `#FF7D00` | 警告主色 | `bg-warning-500` `text-warning-500` |
| warning-600 | `#D66A00` | 警告深色 | `bg-warning-600` |

**使用场景**: 警告提示、待处理状态、中等难度标签

```html
<!-- 警告提示 -->
<div class="bg-warning-50 text-warning-600 border border-warning-200 rounded p-3">
  <i class="fas fa-exclamation-triangle"></i> 请注意检查输入内容
</div>
```

#### 2.3 错误色(Error)

| 色阶 | 色值 | 用途 | TailwindCSS类 |
|------|------|------|---------------|
| error-50 | `#FFECE8` | 错误背景 | `bg-error-50` |
| error-500 | `#F53F3F` | 错误主色 | `bg-error-500` `text-error-500` |
| error-600 | `#CB2634` | 错误深色 | `bg-error-600` |

**使用场景**: 错误提示、表单验证错误、删除按钮

```html
<!-- 错误提示 -->
<div class="bg-error-50 text-error-600 border border-error-200 rounded p-3">
  <i class="fas fa-times-circle"></i> 提交失败,请重试
</div>

<!-- 危险按钮 -->
<button class="bg-error-500 hover:bg-error-600 text-white px-4 py-2 rounded">
  删除
</button>

<!-- 表单错误 -->
<input type="text" class="border-error-500 focus:ring-error-500">
<p class="text-error-500 text-xs mt-1">该字段为必填项</p>
```

#### 2.4 信息色(Info)

| 色阶 | 色值 | 用途 | TailwindCSS类 |
|------|------|------|---------------|
| info-50 | `#E8F7FF` | 信息背景 | `bg-info-50` |
| info-500 | `#14C9C9` | 信息主色 | `bg-info-500` `text-info-500` |
| info-600 | `#0EAAAA` | 信息深色 | `bg-info-600` |

**使用场景**: 信息提示、帮助说明、题型标签

```html
<!-- 信息提示 -->
<div class="bg-info-50 text-info-600 border border-info-200 rounded p-3">
  <i class="fas fa-info-circle"></i> 提示: 最多可上传5张图片
</div>
```

---

### 3. 中性色(Neutral Colors)

中性色用于文字、背景、边框等基础元素,构建页面的层次结构。

| 色阶 | 色值 | 用途 | TailwindCSS类 |
|------|------|------|---------------|
| gray-50 | `#F7F8FA` | 页面背景 | `bg-gray-50` |
| gray-100 | `#F2F3F5` | 卡片背景 | `bg-gray-100` |
| gray-200 | `#E5E6EB` | 边框 | `border-gray-200` |
| gray-300 | `#C9CDD4` | 分割线 | `border-gray-300` |
| gray-400 | `#A9AEB8` | 禁用文字 | `text-gray-400` |
| gray-500 | `#86909C` | 次要文字 | `text-gray-500` |
| gray-600 | `#6B7785` | 辅助文字 | `text-gray-600` |
| gray-700 | `#4E5969` | 正文 | `text-gray-700` |
| gray-800 | `#272E3B` | 标题 | `text-gray-800` |
| gray-900 | `#1D2129` | 主标题 | `text-gray-900` |

**使用规范**:
- **页面背景**: 使用 `gray-50`
- **卡片背景**: 使用 `white` 或 `gray-100`
- **边框**: 使用 `gray-200` 或 `gray-300`
- **主标题**: 使用 `gray-900` + `font-semibold`
- **正文**: 使用 `gray-700`
- **辅助文字**: 使用 `gray-500` 或 `gray-600`
- **禁用状态**: 使用 `gray-400`

```html
<!-- 页面结构示例 -->
<body class="bg-gray-50">
  <!-- 白色卡片 -->
  <div class="bg-white border border-gray-200 rounded-lg p-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-2">卡片标题</h2>
    <p class="text-sm text-gray-700 mb-4">这是正文内容...</p>
    <p class="text-xs text-gray-500">辅助说明文字</p>
  </div>
</body>
```

---

## 📝 字体系统

### 1. 字体族(Font Family)

**主字体栈**:
```css
font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont,
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

**TailwindCSS**: 默认字体栈已包含,无需额外配置

**设计考量**:
- 优先使用 PingFang SC(苹果系统中文字体)
- 微软雅黑作为 Windows 系统备用字体
- 系统字体确保最佳渲染性能

---

### 2. 字号规范(Font Size)

| 级别 | 字号 | 行高 | 用途 | TailwindCSS类 |
|------|------|------|------|---------------|
| 大标题 | 24px | 32px | 页面主标题 | `text-2xl leading-8` |
| 页面标题 | 20px | 28px | 区域大标题 | `text-xl leading-7` |
| 区块标题 | 16px | 24px | 卡片标题、表单标题 | `text-base leading-6` |
| 正文 | 14px | 22px | 正文、表单、按钮 | `text-sm leading-[22px]` |
| 辅助文字 | 13px | 20px | 表格辅助信息 | `text-[13px] leading-5` |
| 说明文字 | 12px | 18px | 帮助文字、表单提示 | `text-xs leading-[18px]` |

**使用示例**:

```html
<!-- 页面标题区 -->
<div class="mb-6">
  <h1 class="text-2xl leading-8 font-semibold text-gray-900">题目列表</h1>
  <p class="text-sm leading-[22px] text-gray-500 mt-1">管理和查看所有题目信息</p>
</div>

<!-- 卡片 -->
<div class="card">
  <h3 class="text-base leading-6 font-semibold text-gray-900 mb-2">统计概览</h3>
  <p class="text-sm leading-[22px] text-gray-700">这是正文内容...</p>
  <p class="text-xs leading-[18px] text-gray-500 mt-2">最后更新: 2026-01-16</p>
</div>
```

---

### 3. 字重规范(Font Weight)

| 字重 | 数值 | 用途 | TailwindCSS类 |
|------|------|------|---------------|
| SemiBold | 600 | 标题、导航、按钮 | `font-semibold` |
| Medium | 500 | 强调文字、标签 | `font-medium` |
| Regular | 400 | 正文、次要文字 | `font-normal` |

**使用规范**:
- **所有标题**: 使用 `font-semibold`
- **按钮文字**: 使用 `font-medium`
- **正文**: 使用 `font-normal`
- **导航菜单**: 使用 `font-medium`

```html
<!-- 标题 -->
<h2 class="text-xl font-semibold text-gray-900">题目详情</h2>

<!-- 按钮 -->
<button class="bg-primary-500 text-white font-medium px-4 py-2 rounded">
  保存
</button>

<!-- 正文 -->
<p class="text-sm font-normal text-gray-700">这是正文内容...</p>
```

---

## 📐 间距系统

### 8px 倍数原则

所有间距使用 8px 的倍数,确保整齐的视觉节奏。

| 像素值 | TailwindCSS | 用途 |
|--------|-------------|------|
| 4px | `0.5` | 极小间距(图标与文字) |
| 8px | `2` | 小间距(按钮内边距垂直) |
| 12px | `3` | 常规间距(表单元素间距) |
| 16px | `4` | 标准间距(卡片元素间距) |
| 20px | `5` | 中等间距 |
| 24px | `6` | 大间距(卡片内边距) |
| 32px | `8` | 较大间距(区块间距) |
| 40px | `10` | 很大间距 |
| 48px | `12` | 超大间距(页面顶部间距) |

**使用场景**:

```html
<!-- 卡片内边距: 24px -->
<div class="bg-white border border-gray-200 rounded-lg p-6">
  ...
</div>

<!-- 按钮内边距: 水平16px, 垂直8px -->
<button class="bg-primary-500 text-white px-4 py-2 rounded">
  保存
</button>

<!-- 元素垂直间距: 16px -->
<div class="space-y-4">
  <div class="form-group">...</div>
  <div class="form-group">...</div>
</div>

<!-- 栅格列间距: 16px -->
<div class="grid grid-cols-3 gap-4">
  <div>...</div>
  <div>...</div>
  <div>...</div>
</div>

<!-- 区块间距: 32px -->
<div class="mb-8">
  <h2>区块标题</h2>
  ...
</div>
```

**常用间距组合**:

| 场景 | TailwindCSS类 |
|------|---------------|
| 按钮组水平间距 | `space-x-3` (12px) |
| 表单元素垂直间距 | `space-y-4` (16px) |
| 卡片内边距 | `p-6` (24px) |
| 卡片之间间距 | `gap-4` (16px) |
| 页面内容区边距 | `p-6` (24px) |
| 区块垂直间距 | `mb-6` (24px) 或 `mb-8` (32px) |

---

## 🔘 圆角规范

### 圆角尺寸

| 名称 | 像素值 | 用途 | TailwindCSS类 |
|------|--------|------|---------------|
| Small | 2px | 小标签、徽章 | `rounded-sm` |
| Medium | 4px | 按钮、输入框、下拉框 | `rounded` |
| Large | 8px | 卡片、模态框、图片 | `rounded-lg` |
| Full | 9999px | 全圆角徽章、开关 | `rounded-full` |

**使用示例**:

```html
<!-- 按钮: 4px 圆角 -->
<button class="bg-primary-500 text-white px-4 py-2 rounded">
  保存
</button>

<!-- 卡片: 8px 圆角 -->
<div class="bg-white border border-gray-200 rounded-lg p-6">
  卡片内容
</div>

<!-- 徽章: 全圆角 -->
<span class="bg-primary-500 text-white px-2.5 py-0.5 rounded-full text-xs">
  5
</span>

<!-- 输入框: 4px 圆角 -->
<input type="text" class="border border-gray-300 rounded px-3 py-2">
```

---

## 🌓 阴影规范

### 阴影层级

阴影用于表现层次关系和浮动效果,增强界面的立体感。

| 级别 | CSS值 | 用途 | TailwindCSS类 |
|------|-------|------|---------------|
| Small | `0 2px 8px rgba(0,0,0,0.08)` | 卡片、表格 | `shadow-sm` |
| Medium | `0 4px 16px rgba(0,0,0,0.12)` | 下拉菜单、弹出层 | `shadow-md` |
| Large | `0 8px 32px rgba(0,0,0,0.16)` | 模态框、抽屉 | `shadow-lg` |

**使用示例**:

```html
<!-- 卡片: 小阴影 -->
<div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
  卡片内容
</div>

<!-- 下拉菜单: 中阴影 -->
<div class="bg-white border border-gray-200 rounded-lg shadow-md">
  <ul>
    <li>选项1</li>
    <li>选项2</li>
  </ul>
</div>

<!-- 模态框: 大阴影 -->
<div class="bg-white rounded-lg shadow-lg max-w-md">
  <div class="p-6">模态框内容</div>
</div>

<!-- 悬停效果 -->
<div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
  可悬停的卡片
</div>
```

**阴影使用原则**:
- 默认状态使用 `shadow-sm`
- 悬停状态可提升到 `shadow-md`
- 浮层组件(下拉、弹框)使用 `shadow-md` 或 `shadow-lg`
- 避免过度使用阴影,保持页面轻量感

---

## 🎯 综合应用示例

### 示例1: 标准按钮组

```html
<div class="flex items-center space-x-3">
  <!-- 主按钮 -->
  <button class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded
                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                 transition-colors">
    保存
  </button>

  <!-- 次要按钮 -->
  <button class="bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded
                 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500
                 transition-colors">
    取消
  </button>

  <!-- 危险按钮 -->
  <button class="bg-error-500 hover:bg-error-600 text-white font-medium px-4 py-2 rounded
                 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2
                 transition-colors">
    删除
  </button>
</div>
```

---

### 示例2: 表单输入框

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">
    题目名称
  </label>
  <input type="text"
         class="w-full px-3 py-2 border border-gray-300 rounded
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                disabled:bg-gray-100 disabled:cursor-not-allowed"
         placeholder="请输入题目名称">
  <p class="mt-1 text-xs text-gray-500">最多50个字符</p>
</div>

<!-- 错误状态 -->
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">
    题目名称 <span class="text-error-500">*</span>
  </label>
  <input type="text"
         class="w-full px-3 py-2 border border-error-500 rounded
                focus:outline-none focus:ring-2 focus:ring-error-500 focus:border-error-500"
         placeholder="请输入题目名称">
  <p class="mt-1 text-xs text-error-500">
    <i class="fas fa-exclamation-circle"></i> 该字段为必填项
  </p>
</div>
```

---

### 示例3: 信息卡片

```html
<div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
  <!-- 卡片头部 -->
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-base font-semibold text-gray-900">题库统计</h3>
    <span class="bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
      实时
    </span>
  </div>

  <!-- 卡片内容 -->
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-600">总题目数</span>
      <span class="text-2xl font-semibold text-gray-900">1,234</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-600">今日新增</span>
      <span class="text-sm font-medium text-success-500">
        <i class="fas fa-arrow-up"></i> 23
      </span>
    </div>
  </div>
</div>
```

---

### 示例4: 状态标签

```html
<!-- 状态标签组 -->
<div class="flex items-center space-x-2">
  <span class="bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
    P0
  </span>
  <span class="bg-success-50 text-success-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
    已完成
  </span>
  <span class="bg-warning-50 text-warning-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
    进行中
  </span>
  <span class="bg-error-50 text-error-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
    已取消
  </span>
  <span class="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
    草稿
  </span>
</div>
```

---

### 示例5: 提示消息

```html
<!-- 成功提示 -->
<div class="bg-success-50 text-success-700 border border-success-200 rounded-lg p-4 flex items-start space-x-3">
  <i class="fas fa-check-circle text-lg"></i>
  <div class="flex-1">
    <p class="font-medium text-sm">操作成功</p>
    <p class="text-xs mt-1">题目已成功保存到题库中</p>
  </div>
  <button class="text-success-600 hover:text-success-800">
    <i class="fas fa-times"></i>
  </button>
</div>

<!-- 警告提示 -->
<div class="bg-warning-50 text-warning-700 border border-warning-200 rounded-lg p-4 flex items-start space-x-3">
  <i class="fas fa-exclamation-triangle text-lg"></i>
  <div class="flex-1">
    <p class="font-medium text-sm">请注意</p>
    <p class="text-xs mt-1">检测到3道题目可能存在重复,建议查重后再提交</p>
  </div>
</div>

<!-- 错误提示 -->
<div class="bg-error-50 text-error-700 border border-error-200 rounded-lg p-4 flex items-start space-x-3">
  <i class="fas fa-times-circle text-lg"></i>
  <div class="flex-1">
    <p class="font-medium text-sm">提交失败</p>
    <p class="text-xs mt-1">网络连接失败,请检查网络后重试</p>
  </div>
</div>

<!-- 信息提示 -->
<div class="bg-info-50 text-info-700 border border-info-200 rounded-lg p-4 flex items-start space-x-3">
  <i class="fas fa-info-circle text-lg"></i>
  <div class="flex-1">
    <p class="font-medium text-sm">温馨提示</p>
    <p class="text-xs mt-1">题干最多支持1000个字符,支持插入图片和公式</p>
  </div>
</div>
```

---

## 🔧 TailwindCSS 配置

在每个 HTML 文件中引入以下配置:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>考试系统原型</title>

  <!-- TailwindCSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- FontAwesome CDN -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

  <!-- TailwindCSS 自定义配置 -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#E6F9F0',
              100: '#B3EDCE',
              200: '#80E0AD',
              300: '#4DD48B',
              400: '#1AC76A',
              500: '#00B96B',
              600: '#00A35C',
              700: '#008A4D',
              800: '#00703E',
              900: '#00572F',
            },
            success: {
              50: '#E8FFEA',
              500: '#00B42A',
              600: '#009A24',
            },
            warning: {
              50: '#FFF7E8',
              500: '#FF7D00',
              600: '#D66A00',
            },
            error: {
              50: '#FFECE8',
              500: '#F53F3F',
              600: '#CB2634',
            },
            info: {
              50: '#E8F7FF',
              500: '#14C9C9',
              600: '#0EAAAA',
            },
          }
        }
      }
    }
  </script>
</head>
<body class="bg-gray-50">
  <!-- 页面内容 -->
</body>
</html>
```

---

## ✅ 设计检查清单

在完成每个页面后,请使用此清单进行自查:

**色彩使用**:
- [ ] 主色使用 `primary-500` (#00B96B)
- [ ] 按钮悬停使用 `primary-600`
- [ ] 语义色使用正确(成功/警告/错误/信息)
- [ ] 文字颜色层级分明(gray-900/700/500)

**字体规范**:
- [ ] 标题使用 `font-semibold`
- [ ] 按钮文字使用 `font-medium`
- [ ] 正文使用 `font-normal`
- [ ] 字号符合规范(大标题24px,正文14px)

**间距系统**:
- [ ] 所有间距为 8px 倍数
- [ ] 卡片内边距使用 `p-6` (24px)
- [ ] 按钮内边距使用 `px-4 py-2` (16px/8px)
- [ ] 元素间距使用 `space-y-4` 或 `gap-4`

**圆角与阴影**:
- [ ] 按钮使用 `rounded` (4px)
- [ ] 卡片使用 `rounded-lg` (8px)
- [ ] 卡片使用 `shadow-sm`
- [ ] 下拉菜单使用 `shadow-md`

**交互反馈**:
- [ ] 按钮有悬停状态 `hover:`
- [ ] 输入框有聚焦状态 `focus:ring-2 focus:ring-primary-500`
- [ ] 可点击元素有 `cursor-pointer`
- [ ] 禁用状态有 `disabled:opacity-50 disabled:cursor-not-allowed`

---

## 📚 参考资源

- **TailwindCSS 官方文档**: https://tailwindcss.com/docs
- **FontAwesome 图标库**: https://fontawesome.com/icons
- **色彩对比度检查**: https://webaim.org/resources/contrastchecker/
- **设计规范源文件**: `.spec-workflow/specs/exam-system-prototype/design.md`

---

## 📝 版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-01-16 | 初始版本,定义完整设计规范体系 |

---

**维护者**: Claude Code
**联系方式**: 如有疑问,请参考 `design.md` 或询问项目负责人
