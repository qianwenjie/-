# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个**考试系统的产品设计与原型开发项目**，包含需求分析、功能设计和前端原型实现。

### 项目目标
构建一个高效、易用的考试系统，包含题库管理、试卷组卷、考试管理等核心模块。

### 当前状态
- **阶段**: 原型开发中
- **版本**: v0.1.6
- **进度**: 题库模块 90% 完成
- **核心文档**: `考试系统功能清单.md`、`prototypes/IMPLEMENTATION_STATUS.md`

## 项目结构

```
考试系统设计/
├── 考试系统功能清单.md         # 主功能清单文档（完整需求）
├── progress.md                  # 进度跟踪文档
├── CLAUDE.md                    # 项目上下文（本文件）
├── prototypes/                  # 原型文件目录
│   ├── IMPLEMENTATION_STATUS.md # 实施状态文档（详细功能完成情况）
│   ├── design-guide.md          # 设计规范
│   ├── components.md            # 组件文档
│   ├── assets/                  # 静态资源
│   │   └── images/              # 图片资源
│   └── admin/                   # 管理端原型
│       ├── dashboard.html       # 首页 ✅
│       └── question-bank/       # 题库模块
│           ├── list.html        # 题目列表 ✅
│           ├── add.html         # 添加/编辑题目 ✅
│           ├── detail.html      # 题目详情 ✅
│           ├── categories.html  # 知识点管理 ✅
│           ├── statistics.html  # 题库统计 ✅
│           └── import.html      # 题目导入 🚧
└── 参考资料/                    # 原始需求和参考文档
    ├── 功能清单.xlsx             # Excel 格式功能清单
    ├── 简便录入规则.docx         # 简便录入格式规范
    └── *.png                     # UI 参考截图
```

## 核心模块与完成状态

### 题库模块 ✅ 85%

#### 已完成功能
- ✅ **知识点目录管理**: 树形结构、增删改查、搜索
- ✅ **题目列表**: 筛选（题型/难度/知识点）、搜索、分页
- ✅ **题目录入（标准）**: 支持10种题型（单选、多选、判断、填空、简答、完形填空、复合题等）
- ✅ **题目编辑**: 复用录入页面，支持所有字段修改
- ✅ **题目删除**: 带确认提示，引用检查
- ✅ **题目预览**: 详情页完整展示
- ✅ **题型设置**: 内置题型重命名、自定义题型创建
- ✅ **题库统计**: 题型分布、难度分布（基础版）

#### 进行中功能
- 🚧 **题目导入**: 页面框架已完成（20%）

#### 待开发功能
- ⏳ **简便录入**: 文本解析录入（P0）
- ⏳ **题目查重**: 相似度检测（P0）
- ⏳ **题目导出**: 导出为 Word（P1）
- ⏳ **AI出题**: AI生成题目（P1）

### 试卷模块 🟡 10%
- 仅列表页框架，核心功能未开发

### 考试模块 🟡 10%
- 仅列表页框架，核心功能未开发

### 刷题模块 🟡 10%
- 仅列表页框架，核心功能未开发

## 题型支持

### 基础题型（5种）
1. **单选题**: 多个选项选一个
2. **多选题**: 多个选项选多个
3. **判断题**: 对/错二选一
4. **填空题**: 空位填写答案
5. **简答题**: 文字作答

### 特殊题型
6. **完形填空**: 题干中标记空位，每个空位对应ABCDE选项
7. **复合题**: 材料 + 多个子题目（阅读理解、材料分析、综合应用）

## 技术栈

### 前端
- **HTML5**: 页面结构
- **Tailwind CSS 3.x**: 样式框架
- **Font Awesome 6.5.1**: 图标库
- **Vanilla JavaScript**: 交互逻辑
- **ECharts 5.x**: 图表库（统计页面）

### 数据存储（原型阶段）
- **LocalStorage**: 题目数据、题型配置、知识点结构
- **Mock Data**: JavaScript 对象模拟后端数据

### 设计规范
- **主色调**: #00B96B（绿色）
- **题型颜色**: info(青)、purple(紫)、indigo(靛)、warning(橙)、amber(琥珀)
- **响应式**: 移动端 < 768px，平板 768-1024px，桌面 > 1024px

## 优先级标记

| 标记 | 含义 |
|------|------|
| P0 | 核心功能，MVP 必须实现 |
| P1 | 重要功能，第二迭代 |
| P2 | 增强功能，后续迭代 |

## 工作流程

### Git 提交规范
- 使用语义化提交信息
- 格式: `feat: v版本号 - 简要描述`
- 示例: `feat: v0.1.5 - 补全题目列表功能`

### 版本管理
- **v0.0.x**: 基础版本
- **v0.1.x**: 题库模块开发
- **v0.2.x**: 题库模块完善
- **v0.3.x**: 试卷模块开发
- **v0.4.x+**: 其他模块开发

### 文档更新
更新功能时需同步更新：
1. `prototypes/IMPLEMENTATION_STATUS.md` - 实施状态
2. `progress.md` - 进度记录
3. Git 提交信息

## 数据结构示例

### 题目数据结构
```javascript
{
  id: 'Q001',
  type: 'single',              // 题型
  typeName: '单选题',
  content: '题干内容...',       // 题干
  options: [                   // 选项（选择题）
    {label: 'A', text: '选项A'},
    {label: 'B', text: '选项B'}
  ],
  correctAnswers: ['A'],       // 正确答案
  explanation: '解析内容...',   // 解析
  difficulty: 2,               // 难度（1-5）
  difficultyName: '二级',
  score: '2',                  // 分值
  knowledgeIds: ['kp001'],     // 知识点ID列表
  knowledgePath: '计算机基础 / 数据结构',
  tags: ['链表', '数组'],      // 标签
  createTime: '2026-01-20 10:00',
  author: '张老师',
  useCount: 5                  // 使用次数
}
```

### 知识点数据结构
```javascript
{
  id: 'kp001',
  name: '计算机基础',
  parentId: null,              // 父节点ID
  level: 1,                    // 层级
  children: [...],             // 子节点
  questionCount: 156           // 题目数量
}
```

### 题型配置数据结构
```javascript
{
  modifiedDefaultTypes: {      // 内置题型修改记录
    'single': {
      customName: '单项选择',
      description: '描述...'
    }
  },
  customQuestionTypes: [       // 自定义题型
    {
      id: 'custom_001',
      name: '情境选择题',
      baseType: 'single',
      description: '...',
      icon: 'fa-lightbulb',
      color: 'amber'
    }
  ]
}
```

## 注意事项

### 开发规范
- 所有文档使用中文
- 功能清单遵循现有的表格格式和章节结构
- 数据模型使用树形结构表示实体关系
- 业务流程使用 Mermaid flowchart 语法

### 数据持久化限制
- 原型阶段使用 LocalStorage
- 数据仅在同一浏览器有效
- 跨浏览器/设备数据不同步
- 清除浏览器数据会丢失所有数据

### 已知问题
1. **图片上传**: 仅为模拟功能，未实现真实上传
2. **权限控制**: 无权限验证，所有功能均可访问
3. **富文本编辑器**: 使用基础 contenteditable，功能有限
4. **性能优化**: 大数据量时可能有性能问题

## 常用命令

### 查看文件列表
```bash
find prototypes/admin -type f -name "*.html" | sort
```

### 查看 Git 状态
```bash
git status
git log --oneline -5
```

### 查看代码行数
```bash
wc -l prototypes/admin/question-bank/*.html
```

## 相关文档

- **[功能清单](./考试系统功能清单.md)** - 完整的功能需求文档
- **[实施状态](./prototypes/IMPLEMENTATION_STATUS.md)** - 详细的功能完成状态
- **[进度跟踪](./progress.md)** - 开发进度和操作日志
- **[设计规范](./prototypes/design-guide.md)** - UI/UX 设计指南
- **[组件文档](./prototypes/components.md)** - 组件使用说明

## 快速定位

### 题目列表相关
- 主页面: `prototypes/admin/question-bank/list.html`
- 题型设置: list.html 中的 Modal（行 ~500-700）
- 筛选功能: list.html 中的 Filter（行 ~200-400）
- 分页控件: list.html 底部（行 ~370-400）

### 题目录入相关
- 录入页面: `prototypes/admin/question-bank/add.html`
- 题型列表: add.html 左侧 aside（行 ~216-247）
- 表单区域: add.html 主内容区（行 ~268+）
- 复合题处理: add.html 中的 compositeQuestionContainer

### 知识点管理
- 管理页面: `prototypes/admin/question-bank/categories.html`
- 树形结构渲染: categories.html 中的 renderKnowledgeTree 函数

## 最近更新（v0.1.6）

**更新日期**: 2026-01-22

1. ✅ 修复复合题预览错误（增强子题类型处理）
2. ✅ 修复完形填空预览错误（排除 cloze 类型的复合题路由）
3. ✅ 完善完形填空预览功能（显示选项和正确答案）
4. ✅ 修复简答题无法编辑的问题（统一 essay → shortAnswer 类型）
5. ✅ 移除简便录入页面的"检查刷新"按钮和返回箭头

**Git 提交**: `a3b5c2c`

---

IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.
