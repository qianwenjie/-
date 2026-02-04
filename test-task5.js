// Task 5 测试脚本 - 智能推荐引擎
// 独立测试 getMostCommonParams() 和 getRecommendedParams()

// 模拟 UserPreferenceManager 的相关方法
class MockUserPreferenceManager {
  constructor() {
    this.preferences = {
      basicPreferences: {
        type: {
          distribution: {
            'single': { count: 30, percentage: 60 },
            'multiple': { count: 20, percentage: 40 }
          }
        },
        difficulty: {
          distribution: {
            '1': { count: 10, percentage: 20 },
            '2': { count: 25, percentage: 50 },
            '3': { count: 15, percentage: 30 }
          }
        },
        quantity: {
          average: 12
        }
      },
      behaviorPatterns: {
        knowledgePointFocus: {
          recent: [
            { knowledgePoint: '数据结构', timestamp: '2026-02-01T10:00:00' },
            { knowledgePoint: '算法', timestamp: '2026-02-01T11:00:00' }
          ]
        }
      },
      history: {
        lastUsed: {
          type: 'multiple',
          difficulty: 3,
          count: 20,
          knowledgePoint: '操作系统',
          timestamp: '2026-02-01T10:00:00'
        }
      }
    };
  }

  getMostCommonType() {
    const distribution = this.preferences.basicPreferences.type.distribution;
    if (!distribution || Object.keys(distribution).length === 0) {
      return null;
    }
    let maxCount = 0;
    let mostCommonType = null;
    for (const [type, data] of Object.entries(distribution)) {
      if (data.count > maxCount) {
        maxCount = data.count;
        mostCommonType = type;
      }
    }
    return mostCommonType;
  }

  getMostCommonDifficulty() {
    const distribution = this.preferences.basicPreferences.difficulty.distribution;
    if (!distribution || Object.keys(distribution).length === 0) {
      return null;
    }
    let maxCount = 0;
    let mostCommonDifficulty = null;
    for (const [difficulty, data] of Object.entries(distribution)) {
      if (data.count > maxCount) {
        maxCount = data.count;
        mostCommonDifficulty = parseInt(difficulty);
      }
    }
    return mostCommonDifficulty;
  }

  getAverageQuantity() {
    const average = this.preferences.basicPreferences.quantity.average;
    return average || 10;
  }

  getRecentKnowledgePoints() {
    const recent = this.preferences.behaviorPatterns.knowledgePointFocus.recent;
    if (!recent || recent.length === 0) {
      return [];
    }
    return recent.map(item => item.knowledgePoint);
  }

  getLastUsedParams() {
    return this.preferences.history.lastUsed || {};
  }

  // Task 5 新增方法
  getMostCommonParams() {
    return {
      type: this.getMostCommonType(),
      difficulty: this.getMostCommonDifficulty(),
      count: this.getAverageQuantity(),
      knowledgePoint: this.getRecentKnowledgePoints()[0] || null
    };
  }

  getRecommendedParams(partial = {}) {
    // 1. 处理特殊标志：使用上次参数
    if (partial._useHistory === true) {
      const lastParams = this.getLastUsedParams();
      // 移除特殊标志
      const { _useHistory, _usePreference, ...cleanParams } = lastParams;
      return cleanParams;
    }

    // 2. 处理特殊标志：使用偏好参数
    if (partial._usePreference === true) {
      const preferredParams = this.getMostCommonParams();
      // 移除特殊标志
      const { _useHistory, _usePreference, ...cleanParams } = preferredParams;
      return cleanParams;
    }

    // 3. 智能填充缺失参数
    const recommended = { ...partial };

    // 移除特殊标志（如果存在）
    delete recommended._useHistory;
    delete recommended._usePreference;

    // 如果 type 缺失，使用最常用题型
    if (!recommended.type) {
      recommended.type = this.getMostCommonType();
    }

    // 如果 difficulty 缺失，使用最常用难度
    if (!recommended.difficulty) {
      recommended.difficulty = this.getMostCommonDifficulty();
    }

    // 如果 count 缺失，使用平均数量
    if (!recommended.count) {
      recommended.count = this.getAverageQuantity();
    }

    // 如果 knowledgePoint 缺失，使用最近的知识点
    if (!recommended.knowledgePoint) {
      const recentKps = this.getRecentKnowledgePoints();
      if (recentKps.length > 0) {
        recommended.knowledgePoint = recentKps[0];
      }
    }

    return recommended;
  }
}

// 测试函数
function runTests() {
  console.log('=== Task 5 智能推荐引擎测试 ===\n');
  const manager = new MockUserPreferenceManager();
  let passed = 0;
  let failed = 0;

  // 测试1: getMostCommonParams()
  console.log('--- 测试 getMostCommonParams() ---');
  const mostCommonParams = manager.getMostCommonParams();
  if (mostCommonParams.type === 'single' &&
      mostCommonParams.difficulty === 2 &&
      mostCommonParams.count === 12 &&
      mostCommonParams.knowledgePoint === '数据结构') {
    console.log('✓ 正确返回最常用参数组合');
    passed++;
  } else {
    console.error('✗ 参数组合不正确:', mostCommonParams);
    failed++;
  }

  // 测试2: getRecommendedParams() - _useHistory
  console.log('\n--- 测试 getRecommendedParams(_useHistory) ---');
  let recommended = manager.getRecommendedParams({ _useHistory: true });
  if (recommended.type === 'multiple' &&
      recommended.difficulty === 3 &&
      recommended.count === 20 &&
      recommended.knowledgePoint === '操作系统' &&
      !recommended._useHistory &&
      !recommended._usePreference) {
    console.log('✓ _useHistory 标志正确返回上次参数（无特殊标志）');
    passed++;
  } else {
    console.error('✗ _useHistory 返回错误:', recommended);
    failed++;
  }

  // 测试3: getRecommendedParams() - _usePreference
  console.log('\n--- 测试 getRecommendedParams(_usePreference) ---');
  recommended = manager.getRecommendedParams({ _usePreference: true });
  if (recommended.type === 'single' &&
      recommended.difficulty === 2 &&
      recommended.count === 12 &&
      recommended.knowledgePoint === '数据结构' &&
      !recommended._useHistory &&
      !recommended._usePreference) {
    console.log('✓ _usePreference 标志正确返回偏好参数（无特殊标志）');
    passed++;
  } else {
    console.error('✗ _usePreference 返回错误:', recommended);
    failed++;
  }

  // 测试4: 智能填充 - 仅提供 type
  console.log('\n--- 测试智能填充（仅提供 type）---');
  recommended = manager.getRecommendedParams({ type: 'multiple' });
  if (recommended.type === 'multiple' &&
      recommended.difficulty === 2 &&
      recommended.count === 12 &&
      recommended.knowledgePoint === '数据结构') {
    console.log('✓ 智能填充缺失参数（保留用户提供的 type）');
    passed++;
  } else {
    console.error('✗ 智能填充错误:', recommended);
    failed++;
  }

  // 测试5: 智能填充 - 空对象
  console.log('\n--- 测试智能填充（空对象）---');
  recommended = manager.getRecommendedParams({});
  if (recommended.type === 'single' &&
      recommended.difficulty === 2 &&
      recommended.count === 12 &&
      recommended.knowledgePoint === '数据结构') {
    console.log('✓ 空对象时完全使用偏好参数');
    passed++;
  } else {
    console.error('✗ 空对象处理错误:', recommended);
    failed++;
  }

  // 测试6: 智能填充 - 完整参数不覆盖
  console.log('\n--- 测试完整参数不覆盖 ---');
  recommended = manager.getRecommendedParams({
    type: 'fill',
    difficulty: 5,
    count: 30,
    knowledgePoint: '网络'
  });
  if (recommended.type === 'fill' &&
      recommended.difficulty === 5 &&
      recommended.count === 30 &&
      recommended.knowledgePoint === '网络') {
    console.log('✓ 完整参数不被覆盖');
    passed++;
  } else {
    console.error('✗ 参数被错误覆盖:', recommended);
    failed++;
  }

  // 测试7: 特殊标志移除
  console.log('\n--- 测试特殊标志移除 ---');
  recommended = manager.getRecommendedParams({
    type: 'single',
    _useHistory: false,
    _usePreference: false
  });
  if (recommended.type === 'single' &&
      !recommended._useHistory &&
      !recommended._usePreference) {
    console.log('✓ 正确移除特殊标志');
    passed++;
  } else {
    console.error('✗ 特殊标志未移除:', recommended);
    failed++;
  }

  // 测试8: 无知识点数据
  console.log('\n--- 测试无知识点数据 ---');
  manager.preferences.behaviorPatterns.knowledgePointFocus.recent = [];
  recommended = manager.getRecommendedParams({ type: 'single' });
  if (recommended.type === 'single' &&
      recommended.difficulty === 2 &&
      recommended.count === 12 &&
      !recommended.knowledgePoint) {
    console.log('✓ 无知识点数据时不填充 knowledgePoint');
    passed++;
  } else {
    console.error('✗ 无知识点处理错误:', recommended);
    failed++;
  }

  console.log(`\n=== 测试完成: ${passed} 通过, ${failed} 失败 ===`);
  return { passed, failed };
}

// 运行测试
const result = runTests();
process.exit(result.failed > 0 ? 1 : 0);
