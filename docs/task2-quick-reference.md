# Task 2 快速参考

## 核心功能
题型同义词识别 - 将用户输入的各种题型表达统一映射到标准题型

## 使用方法

```javascript
const extractor = new SmartParamExtractor();
const result = extractor.extract('我要生成单选题');

// 返回结果
{
  params: {
    type: 'single',      // 题型key
    typeName: '单选题'   // 题型中文名
  },
  confidence: {
    type: 1.0           // 置信度
  },
  ambiguous: []         // 歧义项
}
```

## 支持的同义词

| 题型 | 同义词 |
|------|--------|
| 单选题 | 单选、单选题、选择题、单项选择、单选题目 |
| 多选题 | 多选、多选题、多项选择、多选题目 |
| 判断题 | 判断、判断题、对错题、是非题 |
| 填空题 | 填空、填空题、填写题 |
| 简答题 | 简答、简答题、问答题、主观题 |
| 所有题型 | 所有、全部、所有题型、全部题型、混合、随机题型、各种题型、任意题型 |

## 测试

### 自动化测试
打开 `docs/task2-test.html` 自动运行14个测试用例

### 控制台测试
```javascript
// 在 prototypes/admin/ai-assistant.html 的控制台中执行
const extractor = new SmartParamExtractor();

// 测试单选题
console.log(extractor.extract('我要生成单选题'));

// 测试多选题
console.log(extractor.extract('生成10道多选'));

// 测试所有题型
console.log(extractor.extract('来点所有题型'));
```

## 文件位置

- **实现代码**: `prototypes/admin/ai-assistant.html` (行550-610)
- **测试指南**: `docs/task2-test-guide.md`
- **测试页面**: `docs/task2-test.html`
- **完成总结**: `docs/task2-summary.md`

## Git提交

```bash
# 功能实现
2eae154 feat(phase1): 实现题型同义词识别

# 测试文档
3e0f1e7 docs: 添加Task 2测试文档和测试页面

# 完成总结
afb5eb8 docs: 添加Task 2完成总结
```

## 下一步

继续 **Task 3 - 实现数量提取**
- 识别"10道"、"5个"、"20题"等数量表达
- 支持中文数字和阿拉伯数字
- 处理"一些"、"几道"等模糊数量
