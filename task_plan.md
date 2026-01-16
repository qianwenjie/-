# 原型设计任务规划

> 创建时间：2026-01-16
> 任务目标：基于功能清单 v1.8 设计考试系统原型

---

## 阶段概览

| 阶段 | 名称 | 里程碑 | 状态 |
|------|------|--------|------|
| 1 | 规划页面清单 | 确定页面结构和设计方案 | ⏳ 待开始 |
| 2 | 公共组件设计 | 完成布局模板和公共样式 | ⏳ 待开始 |
| 3 | 题库模块原型 | 完成题库相关页面 | ⏳ 待开始 |
| 4 | 试卷模块原型 | 完成试卷相关页面 | ⏳ 待开始 |
| 5 | 考试模块原型 | 完成考试相关页面 | ⏳ 待开始 |
| 6 | 刷题模块原型 | 完成刷题相关页面 | ⏳ 待开始 |

---

## 设计规范

### 色彩系统
- **主色**：#00B96B（教育绿）
- **成功**：#00B42A
- **警告**：#FF7D00
- **错误**：#F53F3F
- **背景层级**：#F5F7FA、#E5E6EB

### 字体规范
- **字体**：Microsoft YaHei, Arial
- **字号**：12px（辅助）、14px（正文）、16px（标题）
- **行高**：字号 + 6px

### 布局规范
- **栅格**：12列系统
- **间距**：8px 倍数原则
- **设计**：卡片式模块化

### 技术栈
- TailwindCSS (CDN)
- FontAwesome (CDN)

---

## 页面清单（题库模块）

### 管理端 - 题库模块

| 序号 | 页面名称 | 文件名 | 功能点 | 优先级 |
|------|----------|--------|--------|--------|
| 1 | 题目列表 | question-list.html | 分页展示、筛选、搜索、批量操作 | P0 |
| 2 | 标准录入 | question-add-standard.html | 结构化表单录入题目 | P0 |
| 3 | 简便录入 | question-add-simple.html | 文本格式快速录入 | P0 |
| 4 | AI出题 | question-add-ai.html | 多模态输入、生成配置 | P1 |
| 5 | 题目详情 | question-detail.html | 完整展示、在线编辑 | P0 |
| 6 | 知识点管理 | category-tree.html | 树形结构管理 | P0 |
| 7 | 题目查重 | question-duplicate.html | 查重任务、对比预览 | P0 |
| 8 | 题库统计 | question-stats.html | 统计报表、图表 | P1 |
| 9 | 题目导出 | question-export.html | 导出配置、下载 | P1 |

---

## 文件结构

```
考试系统设计/
└── prototypes/
    ├── index.html              # 入口页/导航
    ├── layout.html             # 布局模板
    ├── question-bank/          # 题库模块
    │   ├── list.html           # 题目列表
    │   ├── add-standard.html   # 标准录入
    │   ├── add-simple.html     # 简便录入
    │   ├── add-ai.html         # AI出题
    │   ├── detail.html         # 题目详情
    │   ├── category.html       # 知识点管理
    │   ├── duplicate.html      # 题目查重
    │   ├── stats.html          # 题库统计
    │   └── export.html         # 题目导出
    ├── paper/                  # 试卷模块（后续）
    ├── exam/                   # 考试模块（后续）
    └── practice/               # 刷题模块（后续）
```

