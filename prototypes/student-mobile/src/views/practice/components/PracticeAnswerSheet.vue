<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :style="{ height: '70vh' }"
    :lock-scroll="true"
    :close-on-click-overlay="true"
    @update:show="$emit('update:show', $event)"
  >
    <div class="practice-answer-sheet">
      <!-- 标题栏 -->
      <div class="sheet-header">
        <span class="sheet-title">答题卡</span>
        <van-icon name="cross" class="close-icon" @click="$emit('update:show', false)" />
      </div>

      <!-- 统计行 -->
      <div class="sheet-stats">
        <div class="stat-item">
          <span class="stat-value">{{ answeredCount }}</span>
          <span class="stat-label">已答</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item correct">
          <span class="stat-value">{{ correctCount }}</span>
          <span class="stat-label">答对</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item wrong">
          <span class="stat-value">{{ wrongCount }}</span>
          <span class="stat-label">答错</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item unanswered">
          <span class="stat-value">{{ unansweredCount }}</span>
          <span class="stat-label">未答</span>
        </div>
      </div>

      <!-- 按题型分组的题号网格 -->
      <div class="sheet-content">
        <div v-for="group in groupedQuestions" :key="group.type" class="sheet-group">
          <div class="group-header">
            <span class="group-name">{{ group.typeName }}</span>
            <span class="group-count">{{ group.items.length }}题</span>
          </div>
          <div class="group-grid">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="grid-item"
              :class="{
                correct: item.status === 'correct',
                wrong: item.status === 'wrong',
                unanswered: item.status === 'unanswered',
                current: item.originalIndex === currentIndex,
              }"
              @click="$emit('select', item.originalIndex)"
            >
              {{ item.originalIndex + 1 }}
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="sheet-footer">
        <van-button
          block
          round
          size="large"
          class="finish-btn"
          @click="$emit('finish')"
        >
          结束刷题
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  questions: {
    type: Array,
    default: () => [],
  },
  answerSheetData: {
    type: Array,
    default: () => [],
  },
  currentIndex: {
    type: Number,
    default: 0,
  },
})

defineEmits(['update:show', 'select', 'finish'])

// 按题型分组
const groupedQuestions = computed(() => {
  const groups = []
  const groupMap = new Map()

  props.answerSheetData.forEach((item) => {
    const q = props.questions[item.index]
    if (!q) return
    const key = q.type
    if (!groupMap.has(key)) {
      const group = { type: key, typeName: q.typeName, items: [] }
      groupMap.set(key, group)
      groups.push(group)
    }
    groupMap.get(key).items.push({ ...item, originalIndex: item.index })
  })

  return groups
})

const correctCount = computed(() =>
  props.answerSheetData.filter(item => item.status === 'correct').length
)

const wrongCount = computed(() =>
  props.answerSheetData.filter(item => item.status === 'wrong').length
)

const unansweredCount = computed(() =>
  props.answerSheetData.filter(item => item.status === 'unanswered').length
)

const answeredCount = computed(() => correctCount.value + wrongCount.value)
</script>

<style scoped>
.practice-answer-sheet {
  height: 70vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  overflow: hidden;
}

/* 标题栏 */
.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #f0f1f2;
  flex-shrink: 0;
}

.sheet-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.close-icon {
  font-size: 20px;
  color: #86909c;
  cursor: pointer;
  padding: 4px;
}

.close-icon:active {
  opacity: 0.6;
}

/* 统计行 */
.sheet-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 14px 16px;
  background: white;
  margin-bottom: 1px;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1d2129;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
}

.stat-item.correct .stat-value {
  color: var(--success-color, #00B42A);
}

.stat-item.wrong .stat-value {
  color: var(--error-color, #F53F3F);
}

.stat-item.unanswered .stat-value {
  color: #c9cdd4;
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: #e5e6eb;
}

/* 按题型分组 */
.sheet-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.sheet-group {
  margin-bottom: 16px;
}

.sheet-group:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.group-name {
  font-size: 13px;
  font-weight: 600;
  color: #1d2129;
}

.group-count {
  font-size: 11px;
  color: #86909c;
  background: #f2f3f5;
  padding: 1px 6px;
  border-radius: 8px;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.grid-item {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  box-sizing: border-box;
  /* 默认未答样式 */
  background: #e5e6eb;
  color: #86909c;
}

.grid-item:active {
  transform: scale(0.9);
}

/* 答对 - 绿色 */
.grid-item.correct {
  background: var(--success-color, #00B42A);
  color: white;
}

/* 答错 - 红色 */
.grid-item.wrong {
  background: var(--error-color, #F53F3F);
  color: white;
}

/* 未答 - 灰色 */
.grid-item.unanswered {
  background: #e5e6eb;
  color: #86909c;
}

/* 当前题号高亮边框 */
.grid-item.current {
  border: 2.5px solid var(--primary-color, #00B96B);
  box-shadow: 0 0 0 2px rgba(0, 185, 107, 0.2);
}

/* 底部按钮 */
.sheet-footer {
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #f0f1f2;
  flex-shrink: 0;
}

.finish-btn {
  background: var(--primary-color, #00B96B);
  border-color: var(--primary-color, #00B96B);
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.finish-btn:active {
  opacity: 0.85;
}
</style>
