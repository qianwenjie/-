# 题目图片资源说明

## 📁 目录结构

```
prototypes/
└── assets/
    └── images/
        └── questions/
            ├── binary-tree.svg       # 二叉树结构图
            ├── graph-structure.svg   # 带权图结构
            ├── sorting-process.svg   # 排序过程示意图
            ├── hash-table.svg        # 哈希表结构
            └── social-network.svg    # 社交网络图
```

## 🖼️ 图片列表

| 文件名 | 说明 | 使用题目 |
|--------|------|----------|
| `binary-tree.svg` | 二叉树结构及遍历示意图 | Q039 单选题 |
| `graph-structure.svg` | 带权图结构（节点+边+权重） | Q040 多选题 |
| `sorting-process.svg` | 冒泡排序过程演示 | Q041 填空题 |
| `hash-table.svg` | 哈希表结构及冲突处理 | Q042 简答题 |
| `social-network.svg` | 用户关系网络图 | Q043 材料分析 |

## 🔗 引用方式

在题目数据中使用相对路径引用：

```javascript
// 示例
content: '观察下图：<br><br><img src="../assets/images/questions/binary-tree.svg" alt="二叉树">'
```

## ✅ 测试

打开 `test-images.html` 可以查看所有图片的显示效果。

## 📝 注意事项

1. **路径说明**：图片路径相对于 HTML 文件所在位置
2. **格式选择**：使用 SVG 格式，矢量图形，无损缩放
3. **文件大小**：所有图片总计约 11KB，加载快速
4. **浏览器兼容**：所有现代浏览器均支持 SVG 格式

## 🎨 自定义图片

如需添加新图片：

1. 将图片文件放入 `assets/images/questions/` 目录
2. 推荐使用 SVG 格式（矢量图）
3. 在题目数据中使用相对路径引用
4. 图片命名使用小写字母和连字符（如 `my-image.svg`）
