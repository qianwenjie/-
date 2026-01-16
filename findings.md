# 原型设计记录

> 更新时间：2026-01-16
> 用途：记录设计决策、组件规范、页面说明

---

## 1. 设计决策

### 1.1 用户确认结果

| 决策项 | 选择 |
|--------|------|
| 起始模块 | 题库模块 |
| 设计范围 | 管理端优先 |
| 设计风格 | 现代 B 端风格 |

### 1.2 技术方案

- **CSS框架**：TailwindCSS (CDN)
- **图标库**：FontAwesome (CDN)
- **文件限制**：每个文件 ≤ 100 行

---

## 2. 色彩变量（Tailwind 自定义）

```css
/* 主色 */
--primary: #165DFF;
--primary-light: #E8F3FF;
--primary-dark: #0E42D2;

/* 语义色 */
--success: #00B42A;
--warning: #FF7D00;
--error: #F53F3F;

/* 中性色 */
--bg-page: #F5F7FA;
--bg-card: #FFFFFF;
--border: #E5E6EB;
--text-primary: #1D2129;
--text-secondary: #86909C;
```

---

## 3. 组件规范

### 3.1 按钮状态
- 默认：bg-[#165DFF] text-white
- 悬停：bg-[#0E42D2]
- 禁用：bg-[#E5E6EB] text-[#86909C] cursor-not-allowed

### 3.2 表单输入
- 默认：border-[#E5E6EB]
- 焦点：border-[#165DFF] ring-2 ring-[#E8F3FF]
- 错误：border-[#F53F3F]

### 3.3 表格
- 斑马纹：odd:bg-white even:bg-[#F5F7FA]
- 悬停：hover:bg-[#E8F3FF]

---

## 4. 页面设计进度

| 页面 | 状态 | 备注 |
|------|------|------|
| 所有页面 | ⏳ 待开始 | 尚未开始设计 |

