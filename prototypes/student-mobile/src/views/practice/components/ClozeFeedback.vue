<template>
  <Transition name="slide-up">
    <div v-if="visible" class="cloze-feedback">
      <!-- 每空平铺展示 -->
      <div class="cloze-result">
        <div v-for="(blank, index) in question.blanks" :key="blank.id" class="cloze-item">
          <!-- 空位头部 -->
          <div class="cloze-header">
            <span class="cloze-order">第{{ index + 1 }}空</span>
            <span :class="blankResults[blank.id] ? 'text-correct' : 'text-wrong'">
              {{ blankResults[blank.id] ? '✓ 正确' : '✗ 错误' }}
            </span>
          </div>
          <!-- 选项列表 -->
          <div class="cloze-options">
            <div
              v-for="opt in blank.options"
              :key="opt.label"
              class="option-item"
              :class="getOptClass(blank, opt.label)"
            >
              <span class="opt-label">{{ opt.label }}</span>
              <span class="opt-text">{{ opt.text }}</span>
              <!-- 选对：✓ -->
              <span v-if="opt.label === userAnswer[blank.id] && blankResults[blank.id]" class="opt-mark correct">✓</span>
              <!-- 选错：✗ -->
              <span v-if="opt.label === userAnswer[blank.id] && !blankResults[blank.id]" class="opt-mark wrong">✗</span>
              <!-- 未选但是正确答案：标记 -->
              <span v-if="opt.label !== userAnswer[blank.id] && opt.label === correctAnswer[blank.id] && !blankResults[blank.id]" class="opt-mark correct">✓</span>
            </div>
            <!-- 错误时显示正确答案提示 -->
            <div v-if="!blankResults[blank.id]" class="correct-answer-hint">
              正确答案：{{ correctAnswer[blank.id] }}
            </div>
          </div>
        </div>
      </div>

      <!-- 解析 -->
      <div v-if="explanation" class="explanation-card">
        <div class="explanation-title">解析</div>
        <div class="explanation-text">{{ explanation }}</div>
      </div>

      <!-- 错题本提示 -->
      <div v-if="!allCorrect && !props.hideWrongTip" class="wrong-book-tip">
        已加入错题本
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  question: { type: Object, required: true },
  userAnswer: { type: Object, default: () => ({}) },
  correctAnswer: { type: Object, default: () => ({}) },
  explanation: { type: String, default: '' },
  hideWrongTip: { type: Boolean, default: false },
})

// 每空是否正确
const blankResults = computed(() => {
  const results = {}
  if (!props.question?.blanks) return results
  props.question.blanks.forEach(blank => {
    results[blank.id] = props.userAnswer[blank.id] === props.correctAnswer[blank.id]
  })
  return results
})

// 是否全部正确
const allCorrect = computed(() => {
  return Object.values(blankResults.value).every(v => v)
})

// 选项样式：选中且正确→绿色，选中且错误→红色，未选中的正确答案→绿色
const getOptClass = (blank, label) => {
  const isSelected = label === props.userAnswer[blank.id]
  const isCorrectAnswer = label === props.correctAnswer[blank.id]
  const isBlankCorrect = blankResults.value[blank.id]

  if (isSelected && isBlankCorrect) return 'opt-correct-selected'
  if (isSelected && !isBlankCorrect) return 'opt-wrong-selected'
  if (!isSelected && isCorrectAnswer && !isBlankCorrect) return 'opt-correct-selected'
  return ''
}
</script>

<style scoped>
.cloze-feedback {
  margin: 12px 12px 0;
}

/* 每空卡片 */
.cloze-result {
  margin-bottom: 12px;
}

.cloze-item {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 8px;
}

.cloze-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.cloze-order {
  color: #1d2129;
  font-weight: 600;
}

.text-correct {
  color: #00B96B;
  font-weight: 500;
}

.text-wrong {
  color: #F53F3F;
  font-weight: 500;
}

/* 选项列表 */
.cloze-options {
  display: flex;
  flex-direction: column;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 6px;
  border-radius: 8px;
  font-size: 14px;
  color: #4e5969;
  background: #fff;
  border: 1px solid transparent;
}

.opt-label {
  font-weight: 600;
  margin-right: 10px;
  min-width: 20px;
}

.opt-text {
  flex: 1;
}

.opt-mark {
  margin-left: 8px;
  font-weight: 700;
  font-size: 16px;
}

.opt-mark.correct {
  color: #00B96B;
}

.opt-mark.wrong {
  color: #F53F3F;
}

.opt-correct-selected {
  background: #e6f9f0;
  border-color: #00B96B;
}

.opt-wrong-selected {
  background: #fff1f0;
  border-color: #F53F3F;
}

.correct-answer-hint {
  font-size: 13px;
  color: #00B96B;
  font-weight: 500;
  padding: 8px 12px;
  margin-top: 2px;
}

/* 解析 */
.explanation-card {
  background: #f7f8fa;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
}

.explanation-title {
  font-size: 14px;
  font-weight: 600;
  color: #86909c;
  margin-bottom: 6px;
}

.explanation-text {
  font-size: 13px;
  color: #86909c;
  line-height: 1.7;
}

/* 错题本提示 */
.wrong-book-tip {
  font-size: 13px;
  color: #86909c;
  text-align: center;
  margin-bottom: 4px;
}

/* 动画 */
.slide-up-enter-active {
  transition: all 0.3s ease-out;
}

.slide-up-leave-active {
  transition: all 0.2s ease-in;
}

.slide-up-enter-from {
  transform: translateY(30px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(30px);
  opacity: 0;
}
</style>
