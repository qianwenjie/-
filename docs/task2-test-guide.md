# Task 2 - 题型同义词识别测试指南

## 测试目的
验证SmartParamExtractor类的题型同义词识别功能是否正常工作。

## 测试环境
- 文件: `prototypes/admin/ai-assistant.html`
- 浏览器: Chrome/Firefox/Safari (推荐Chrome)

## 测试步骤

### 1. 打开页面
在浏览器中打开 `prototypes/admin/ai-assistant.html`

### 2. 打开浏览器控制台
- Windows/Linux: 按 `F12` 或 `Ctrl+Shift+I`
- Mac: 按 `Cmd+Option+I`

### 3. 运行测试代码

在控制台中依次执行以下测试:

#### 测试1: 单选题识别
```javascript
const extractor = new SmartParamExtractor();
console.log('测试1 - 单选题:', extractor.extract('我要生成单选题'));
// 预期输出: { params: { type: 'single', typeName: '单选题' }, confidence: { type: 1.0 }, ambiguous: [] }
```

#### 测试2: 多选题识别
```javascript
console.log('测试2 - 多选题:', extractor.extract('生成10道多选'));
// 预期输出: { params: { type: 'multiple', typeName: '多选题' }, confidence: { type: 1.0 }, ambiguous: [] }
```

#### 测试3: 判断题识别
```javascript
console.log('测试3 - 判断题:', extractor.extract('来点判断题'));
// 预期输出: { params: { type: 'judge', typeName: '判断题' }, confidence: { type: 1.0 }, ambiguous: [] }
```

#### 测试4: 填空题识别
```javascript
console.log('测试4 - 填空题:', extractor.extract('需要填空题'));
// 预期输出: { params: { type: 'fill', typeName: '填空题' }, confidence: { type: 1.0 }, ambiguous: [] }
```

#### 测试5: 简答题识别
```javascript
console.log('测试5 - 简答题:', extractor.extract('生成简答题'));
// 预期输出: { params: { type: 'essay', typeName: '简答题' }, confidence: { type: 1.0 }, ambiguous: [] }
```

#### 测试6: 所有题型识别
```javascript
console.log('测试6 - 所有题型:', extractor.extract('来点所有题型'));
// 预期输出: { params: { type: 'all', typeName: '所有题型' }, confidence: { type: 1.0 }, ambiguous: [] }
```

#### 测试7: 同义词识别 - 单项选择
```javascript
console.log('测试7 - 同义词(单项选择):', extractor.extract('生成单项选择'));
// 预期输出: { params: { type: 'single', typeName: '单选题' }, confidence: { type: 1.0 }, ambiguous: [] }
```

#### 测试8: 同义词识别 - 对错题
```javascript
console.log('测试8 - 同义词(对错题):', extractor.extract('需要对错题'));
// 预期输出: { params: { type: 'judge', typeName: '判断题' }, confidence: { type: 1.0 }, ambiguous: [] }
```

#### 测试9: 同义词识别 - 问答题
```javascript
console.log('测试9 - 同义词(问答题):', extractor.extract('生成问答题'));
// 预期输出: { params: { type: 'essay', typeName: '简答题' }, confidence: { type: 1.0 }, ambiguous: [] }
```

#### 测试10: 无题型识别
```javascript
console.log('测试10 - 无题型:', extractor.extract('生成题目'));
// 预期输出: { params: {}, confidence: {}, ambiguous: [] }
```

## 预期结果

### 成功标准
- ✅ 所有基础题型(单选、多选、判断、填空、简答)都能正确识别
- ✅ "所有题型"能正确识别为 type='all'
- ✅ 同义词能正确映射到对应题型
- ✅ 置信度为1.0(精确匹配)
- ✅ 无题型时返回空params

### 输出格式
```javascript
{
  params: {
    type: 'single',      // 题型key
    typeName: '单选题'   // 题型中文名
  },
  confidence: {
    type: 1.0           // 置信度
  },
  ambiguous: []         // 歧义项(当前为空)
}
```

## 支持的同义词列表

| 题型 | 同义词 |
|------|--------|
| 单选题 | 单选、单选题、选择题、单项选择、单选题目 |
| 多选题 | 多选、多选题、多项选择、多选题目 |
| 判断题 | 判断、判断题、对错题、是非题 |
| 填空题 | 填空、填空题、填写题 |
| 简答题 | 简答、简答题、问答题、主观题 |
| 所有题型 | 所有、全部、所有题型、全部题型、混合、随机题型、各种题型、任意题型 |

## 故障排查

### 问题1: 控制台报错 "SmartParamExtractor is not defined"
**原因**: 页面未完全加载或类定义有误
**解决**: 刷新页面,等待完全加载后再测试

### 问题2: 返回结果为空对象
**原因**: 输入文本中不包含任何题型关键词
**解决**: 检查输入文本是否包含题型同义词

### 问题3: 识别错误的题型
**原因**: 可能存在多个题型关键词,优先匹配第一个
**解决**: 这是预期行为,后续会在Task 6中处理歧义

## 下一步
完成测试后,继续进行 **Task 3 - 实现数量提取**
