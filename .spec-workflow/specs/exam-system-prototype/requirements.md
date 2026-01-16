# 考试系统原型设计 - 需求文档

## 项目概述

### 简介
构建考试系统的完整原型设计，覆盖题库、试卷、考试、刷题四大核心模块。原型将包含设计规范文档、可复用组件库，以及基于 TailwindCSS + FontAwesome 的高保真 HTML 原型页面，用于需求验证和开发指导。

### 产品价值
- **需求验证**：通过可视化原型验证功能清单的完整性和合理性
- **开发指导**：为开发团队提供清晰的视觉规范和交互标准
- **用户体验**：确保管理端、学生端、教师端的一致性和易用性
- **降低风险**：在编码前发现设计问题，降低返工成本

### 设计风格
- **主题色**：教育绿（#00B96B）- 清新、活力、亲和的教育氛围
- **设计理念**：现代扁平化设计，简洁明快，降低学习成本

### 设计范围
| 端 | 子模块 | 页面数量 | 优先级 |
|------|------|----------|--------|
| **管理端** | 题库子模块 | 9个页面 | P0 |
|  | 试卷子模块 | 6个页面 | P0 |
|  | 考试子模块 | 5个页面 | P0 |
|  | 刷题子模块 | 4个页面 | P1 |
|  | **管理端小计** | **24个页面** | - |
| **学生端** | 考试与刷题 | 8个页面 | P0 |
| **教师端** | 批阅与统计 | 6个页面 | P1 |

**总计：38个原型页面（管理端24页 + 学生端8页 + 教师端6页）**

---

## 功能需求

### REQ-1: 设计规范体系

**用户故事**: 作为前端开发人员，我希望有一套完整的设计规范体系，以便统一实现所有页面的视觉风格和交互行为。

#### 验收标准

1. WHEN 查看设计规范文档 THEN 系统 SHALL 提供色彩、字体、间距、组件的完整定义
2. WHEN 开发页面 THEN 系统 SHALL 提供 TailwindCSS 配置和 CSS 变量定义
3. WHEN 实现组件 THEN 系统 SHALL 提供组件状态变化的完整规范（默认、悬停、激活、禁用）
4. WHEN 布局页面 THEN 系统 SHALL 提供12列栅格系统和间距规范
5. WHEN 设计交互 THEN 系统 SHALL 提供表单校验、加载、空状态、错误处理的标准模式

**设计规范包含：**
- 色彩系统（主色、辅助色、语义色、中性色）
- 字体规范（字体族、字号、行高、字重）
- 间距系统（8px 倍数原则）
- 圆角与阴影
- 组件状态规范
- 布局规范（栅格、卡片、侧边栏）
- 响应式断点
- 动画与过渡
- 图标使用规范

---

### REQ-2: 公共组件库

**用户故事**: 作为前端开发人员，我希望有一套可复用的组件库，以便快速搭建页面而不必重复编写相同的代码。

#### 验收标准

1. WHEN 构建页面 THEN 系统 SHALL 提供导航栏、侧边栏、面包屑等布局组件
2. WHEN 展示数据 THEN 系统 SHALL 提供表格、卡片、标签、徽章等展示组件
3. WHEN 收集输入 THEN 系统 SHALL 提供输入框、下拉选择、日期选择、富文本编辑器等表单组件
4. WHEN 用户操作 THEN 系统 SHALL 提供按钮、分页、模态框、消息提示等交互组件
5. WHEN 展示层级关系 THEN 系统 SHALL 提供树形控件组件
6. IF 组件被复用 THEN 组件 SHALL 保持一致的外观和行为

**组件清单：**

**布局组件：**
- 页面布局框架（顶栏+侧边栏+内容区）
- 面包屑导航
- 页面标题栏

**表单组件：**
- 输入框（文本、数字、密码）
- 下拉选择（单选、多选、可搜索）
- 日期时间选择器
- 单选框、多选框、开关
- 富文本编辑器（支持图片、公式）
- 文件上传组件

**展示组件：**
- 表格（分页、排序、筛选）
- 卡片容器
- 标签 Tag
- 徽章 Badge
- 进度条
- 统计数字卡片

**交互组件：**
- 按钮（主按钮、次要按钮、危险按钮）
- 分页器
- 模态框
- 抽屉 Drawer
- 消息提示 Toast
- 确认对话框

**数据组件：**
- 树形控件（知识点树）
- 空状态提示
- 骨架屏

---

### REQ-3: 管理端原型

**用户故事**: 作为系统管理员/题库管理员/组卷人员/考试管理员，我希望看到管理端的完整页面原型，涵盖题库、试卷、考试、刷题四个子模块，以便验证后台管理功能的完整性和易用性。

#### 验收标准

**题库子模块（9个页面）：**
1. WHEN 访问题目列表页 THEN 系统 SHALL 展示分页表格、筛选条件、搜索框、批量操作按钮
2. WHEN 使用标准录入 THEN 系统 SHALL 展示结构化表单，支持题型选择、富文本编辑、选项管理、答案设置
3. WHEN 使用简便录入 THEN 系统 SHALL 展示文本输入区、格式校验、预览区、错误提示
4. WHEN 使用AI出题 THEN 系统 SHALL 展示参数配置表单、生成预览列表、逐题编辑功能
5. WHEN 查看题目详情 THEN 系统 SHALL 展示完整题目信息、在线编辑入口、使用统计
6. WHEN 管理知识点 THEN 系统 SHALL 展示树形结构、增删改操作、拖拽排序
7. WHEN 执行查重 THEN 系统 SHALL 展示查重任务配置、结果列表、对比预览
8. WHEN 查看统计 THEN 系统 SHALL 展示图表（题型分布、知识点分布、难度分布）
9. WHEN 导出题目 THEN 系统 SHALL 展示导出配置表单、进度显示、下载链接

**试卷子模块（6个页面）：**
1. WHEN 访问试卷列表 THEN 系统 SHALL 展示试卷卡片、筛选条件、状态标签
2. WHEN 创建试卷 THEN 系统 SHALL 展示试卷信息表单、模式选择
3. WHEN 使用文档模式组卷 THEN 系统 SHALL 展示文档上传区、题型配置、分数设置、总分校验
4. WHEN 使用抽题模式组卷 THEN 系统 SHALL 展示题目选择器、抽题规则配置、分数设置
5. WHEN 预览试卷 THEN 系统 SHALL 展示试卷完整内容、排版效果
6. WHEN 发布试卷 THEN 系统 SHALL 展示确认对话框、发布成功提示

**考试子模块（5个页面）：**
1. WHEN 访问考试列表 THEN 系统 SHALL 展示考试卡片、状态筛选、搜索功能
2. WHEN 创建考试 THEN 系统 SHALL 展示基础配置表单、时间设置、防作弊配置
3. WHEN 选择试卷 THEN 系统 SHALL 展示试卷选择器、试卷预览
4. WHEN 配置防作弊 THEN 系统 SHALL 展示题目随机、选项随机、人脸识别、抓拍等开关
5. WHEN 发布考试 THEN 系统 SHALL 展示配置摘要、确认对话框
6. WHEN 监控考试 THEN 系统 SHALL 展示实时统计、考生状态列表

**刷题子模块（4个页面）：**
1. WHEN 访问刷题列表 THEN 系统 SHALL 展示任务卡片、状态筛选、参与人数
2. WHEN 创建刷题任务 THEN 系统 SHALL 展示知识点选择、题型配置、通过标准设置
3. WHEN 查看统计总览 THEN 系统 SHALL 展示关键指标卡片、参与率、通过率
4. WHEN 查看学生详情 THEN 系统 SHALL 展示学生列表、进度、掌握比例、筛选导出

**管理端页面清单（24个）：**

**题库子模块：**
1. admin/question-bank/list.html - 题目列表
2. admin/question-bank/add-standard.html - 标准录入
3. admin/question-bank/add-simple.html - 简便录入
4. admin/question-bank/add-ai.html - AI出题
5. admin/question-bank/detail.html - 题目详情
6. admin/question-bank/category.html - 知识点管理
7. admin/question-bank/duplicate.html - 题目查重
8. admin/question-bank/stats.html - 题库统计
9. admin/question-bank/export.html - 题目导出

**试卷子模块：**
10. admin/paper/list.html - 试卷列表
11. admin/paper/create.html - 创建试卷
12. admin/paper/compose-document.html - 文档模式组卷
13. admin/paper/compose-extraction.html - 抽题模式组卷
14. admin/paper/preview.html - 试卷预览
15. admin/paper/publish.html - 发布确认

**考试子模块：**
16. admin/exam/list.html - 考试列表
17. admin/exam/create.html - 创建考试
18. admin/exam/config.html - 考试配置
19. admin/exam/publish.html - 发布确认
20. admin/exam/monitor.html - 考试监控

**刷题子模块：**
21. admin/practice/list.html - 刷题列表
22. admin/practice/create.html - 创建刷题
23. admin/practice/stats-overview.html - 统计总览
24. admin/practice/stats-detail.html - 学生详情

---

### REQ-4: 学生端原型

**用户故事**: 作为学生，我希望看到学生端的完整页面原型，以便验证考试作答、刷题练习、成绩查看等功能的用户体验。

#### 验收标准

1. WHEN 查看考试列表 THEN 系统 SHALL 展示可参加的考试、状态标签、倒计时
2. WHEN 进入考试 THEN 系统 SHALL 展示人脸识别界面
3. WHEN 在线作答 THEN 系统 SHALL 展示题目内容、答题卡、倒计时、提交按钮
4. WHEN 查看成绩 THEN 系统 SHALL 展示总分、详细得分、排名
5. WHEN 访问刷题列表 THEN 系统 SHALL 展示任务卡片、进度条、掌握比例
6. WHEN 刷题答题 THEN 系统 SHALL 展示沉浸式答题界面、即时反馈
7. WHEN 查看错题本 THEN 系统 SHALL 展示错题列表、答案解析、重做按钮
8. WHEN 使用收藏夹 THEN 系统 SHALL 展示收藏题目列表、解析查看

**页面清单（8个）：**
1. student-exam-list.html - 考试列表
2. student-exam-verify.html - 人脸识别
3. student-exam-answer.html - 在线作答
4. student-score.html - 成绩查看
5. student-practice-list.html - 刷题列表
6. student-practice-answer.html - 刷题答题
7. student-wrong-book.html - 错题本
8. student-favorites.html - 收藏夹

---

### REQ-5: 教师端原型

**用户故事**: 作为教师，我希望看到教师端的完整页面原型，以便验证试卷批阅、成绩统计、数据分析等功能。

#### 验收标准

1. WHEN 查看待批阅列表 THEN 系统 SHALL 展示需要批阅的试卷、考试信息
2. WHEN 批阅试卷 THEN 系统 SHALL 展示学生答案、标准答案、评分输入、批注功能
3. WHEN 查看成绩统计 THEN 系统 SHALL 展示成绩分布图表、平均分、及格率
4. WHEN 导出成绩 THEN 系统 SHALL 展示导出配置、格式选择
5. WHEN 分析题目 THEN 系统 SHALL 展示每题正确率、区分度、答案分布
6. WHEN 分析知识点 THEN 系统 SHALL 展示知识点掌握情况、薄弱环节

**页面清单（6个）：**
1. teacher-grading-list.html - 待批阅列表
2. teacher-grading-review.html - 批阅试卷
3. teacher-score-stats.html - 成绩统计
4. teacher-score-export.html - 导出成绩
5. teacher-question-analysis.html - 题目分析
6. teacher-knowledge-analysis.html - 知识点分析

---

## 非功能性需求

### 代码架构与模块化

**文件组织：**
- **单一职责**：每个 HTML 文件独立完整，不超过 300 行
- **组件复用**：公共组件通过 `<template>` 标签或独立文件提供
- **样式一致**：所有页面使用统一的 TailwindCSS 配置
- **命名规范**：文件名使用 kebab-case，如 `question-list.html`

**目录结构：**
```
prototypes/
├── design-guide.md          # 设计规范文档
├── components.md            # 组件库文档
├── index.html              # 原型导航页
├── shared/                 # 公共资源
│   ├── layout-template.html  # 布局模板
│   └── components/          # 可复用组件
├── admin/                  # 管理端
│   ├── question-bank/      # 题库子模块（9个页面）
│   ├── paper/              # 试卷子模块（6个页面）
│   ├── exam/               # 考试子模块（5个页面）
│   └── practice/           # 刷题子模块（4个页面）
├── student/                # 学生端（8个页面）
└── teacher/                # 教师端（6个页面）
```

### 性能要求

1. **加载速度**：单页面 HTML 文件大小 ≤ 150KB
2. **图片优化**：使用 SVG 图标，避免大尺寸图片
3. **CDN 依赖**：TailwindCSS 和 FontAwesome 使用 CDN 加载

### 可用性

1. **一致性**：所有页面使用统一的视觉语言和交互模式
2. **响应式**：支持 1920x1080、1366x768 两种主流分辨率
3. **可访问性**：表单元素包含 label，按钮有明确文字说明
4. **反馈清晰**：操作后提供明确的成功/失败反馈

### 可维护性

1. **注释清晰**：关键交互逻辑添加中文注释
2. **版本管理**：每个页面顶部标注版本号和更新日期
3. **变更记录**：在设计规范文档中记录重大变更

### 兼容性

1. **浏览器**：支持 Chrome 90+、Edge 90+、Firefox 88+
2. **框架无关**：原型使用原生 HTML，不依赖特定前端框架
3. **易迁移**：设计规范可导出为 Figma Token 或 CSS 变量

---

## 交付物清单

| 类型 | 文件 | 说明 |
|------|------|------|
| 文档 | design-guide.md | 完整的设计规范文档 |
| 文档 | components.md | 组件库使用说明 |
| 文档 | prototype-navigation.md | 原型导航和说明文档 |
| 原型 | index.html | 原型导航页（链接到所有页面） |
| 原型 | 38个 HTML 页面 | 覆盖所有模块的高保真原型 |
| 模板 | layout-template.html | 可复用的页面布局模板 |
| 资源 | TailwindCSS 配置 | 自定义主题配置 |

---

## 验收标准总结

**设计规范：**
- ✅ 色彩、字体、间距、组件状态定义完整
- ✅ 提供 TailwindCSS 配置和 CSS 变量
- ✅ 包含交互模式和边界情况处理规范

**组件库：**
- ✅ 至少包含 20 个可复用组件
- ✅ 每个组件有清晰的使用说明和代码示例
- ✅ 组件在不同页面中保持一致性

**原型页面：**
- ✅ 38 个页面全部完成，可独立访问
- ✅ 每个页面符合设计规范
- ✅ 交互逻辑清晰，用户流程完整
- ✅ 关键操作有反馈提示

**文档完整性：**
- ✅ 设计规范文档清晰易懂
- ✅ 组件库文档包含使用示例
- ✅ 原型导航页方便浏览所有页面

---

## 风险与依赖

**潜在风险：**
1. 功能清单可能在设计过程中发现不足，需要补充
2. 部分复杂交互（如富文本编辑器、人脸识别）在 HTML 原型中只能模拟

**依赖条件：**
1. 功能清单 v1.8 作为需求基准
2. 用户在关键设计决策点提供及时反馈
3. 设计过程中遇到不清楚的细节，需要用户确认

**缓解措施：**
1. 分阶段交付，每完成一个模块即请求审核
2. 对于复杂交互，提供文字说明和交互流程图
3. 主动询问不明确的需求细节
