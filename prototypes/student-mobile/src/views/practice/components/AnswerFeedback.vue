<template>
  <Transition name="slide-up">
    <div v-if="visible" class="answer-feedback" :class="feedbackClass">
      <!-- 简答题：准确率模式 -->
      <template v-if="questionType === 'essay'">
        <div class="result-header">
          <span class="accuracy-badge" :class="accuracyLevel">{{ accuracy }}%</span>
          <span class="result-text" :class="accuracyLevel">准确率</span>
        </div>

        <!-- 我的作答 -->
        <div class="essay-feedback-section">
          <div class="essay-block">
            <div class="essay-label label-student">我的作答</div>
            <div class="essay-content student">{{ essayUserText || '未作答' }}</div>
          </div>
          <div class="essay-block">
            <div class="essay-label label-reference">参考答案</div>
            <div class="essay-content reference">{{ correctAnswer || '--' }}</div>
          </div>
        </div>

        <!-- 解析 -->
        <div v-if="explanation" class="explanation-section">
          <div class="explanation-title">解析</div>
          <div class="explanation-content">{{ explanation }}</div>
        </div>

        <!-- 错题本提示（准确率<80%） -->
        <div v-if="accuracy < 80 && !props.hideWrongTip" class="wrong-book-tip">
          已加入错题本
        </div>
      </template>

      <!-- 其他题型 -->
      <template v-else>
        <!-- 对错标识 -->
        <div class="result-header">
          <span class="result-icon">{{ isCorrect ? '\u2705' : '\u274C' }}</span>
          <span class="result-text">{{ isCorrect ? '回答正确' : '回答错误' }}</span>
        </div>

        <!-- 填空题：逐空展示对比 -->
        <div v-if="questionType === 'blank' && !isCorrect && blankDetails.length > 0" class="blank-feedback-section">
          <div v-for="(item, idx) in blankDetails" :key="idx" class="blank-feedback-row">
            <span class="blank-feedback-index">第{{ idx + 1 }}空：</span>
            <span :class="item.isCorrect ? 'text-correct' : 'text-wrong'">{{ item.student || '未作答' }}</span>
            <span v-if="item.isCorrect" class="blank-feedback-mark">✓</span>
            <span v-else class="blank-feedback-mark wrong">✗</span>
          </div>
          <div class="correct-answer-hint">
            正确答案：{{ formattedCorrectAnswer }}
          </div>
        </div>

        <!-- 其他题型：正确答案（仅错误时显示） -->
        <div v-else-if="!isCorrect" class="correct-answer-section">
          <div class="answer-row">
            <span class="answer-label">你的答案：</span>
            <span class="answer-value user-answer">{{ formattedUserAnswer }}</span>
          </div>
          <div class="answer-row">
            <span class="answer-label">正确答案：</span>
            <span class="answer-value correct-answer">{{ formattedCorrectAnswer }}</span>
          </div>
        </div>

        <!-- 解析 -->
        <div v-if="explanation" class="explanation-section">
          <div class="explanation-title">解析</div>
          <div class="explanation-content">{{ explanation }}</div>
        </div>

        <!-- 错题本提示（仅错误时） -->
        <div v-if="!isCorrect && !props.hideWrongTip" class="wrong-book-tip">
          已加入错题本
        </div>
      </template>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  correctAnswer: {
    type: [String, Array, Boolean, Object],
    default: '',
  },
  userAnswer: {
    type: [String, Array, Boolean, Object],
    default: '',
  },
  explanation: {
    type: String,
    default: '',
  },
  questionType: {
    type: String,
    default: 'single',
    validator: (val) => ['single', 'multiple', 'judge', 'blank', 'essay', 'cloze', 'composite'].includes(val),
  },
  question: {
    type: Object,
    default: null,
  },
  accuracy: {
    type: Number,
    default: 0,
  },
  hideWrongTip: {
    type: Boolean,
    default: false,
  },
})

// 简答题准确率等级
const accuracyLevel = computed(() => {
  if (props.accuracy >= 80) return 'level-high'
  if (props.accuracy >= 50) return 'level-mid'
  return 'level-low'
})

// 简答题用户文本
const essayUserText = computed(() => {
  const ans = props.userAnswer
  if (typeof ans === 'string') return ans
  if (ans && typeof ans === 'object' && ans.text) return ans.text
  return ''
})

// 反馈卡片样式
const feedbackClass = computed(() => {
  if (props.questionType === 'essay') {
    return props.accuracy >= 80 ? 'correct' : (props.accuracy >= 50 ? 'warning' : 'wrong')
  }
  return props.isCorrect ? 'correct' : 'wrong'
})

// 填空题逐空对比详情
const blankDetails = computed(() => {
  if (props.questionType !== 'blank') return []
  const correct = props.correctAnswer
  const user = props.userAnswer
  if (!Array.isArray(correct)) return []

  if (user && typeof user === 'object' && !Array.isArray(user)) {
    const blanks = props.question?.blanks || []
    return correct.map((c, i) => {
      const blank = blanks[i]
      const student = blank ? (user[blank.id] || '') : ''
      return {
        student,
        correct: c,
        isCorrect: student.trim().toLowerCase() === (c || '').trim().toLowerCase(),
      }
    })
  }

  if (Array.isArray(user)) {
    return correct.map((c, i) => ({
      student: user[i] || '',
      correct: c,
      isCorrect: (user[i] || '').trim().toLowerCase() === (c || '').trim().toLowerCase(),
    }))
  }

  return correct.map(c => ({ student: '', correct: c, isCorrect: false }))
})

const formatAnswer = (answer) => {
  if (answer === true || answer === 'true') return '正确'
  if (answer === false || answer === 'false') return '错误'
  if (Array.isArray(answer)) return answer.join('、')
  if (answer && typeof answer === 'object') {
    return Object.values(answer).map(v => String(v)).join('、')
  }
  return String(answer || '--')
}

const formattedUserAnswer = computed(() => formatAnswer(props.userAnswer))
const formattedCorrectAnswer = computed(() => formatAnswer(props.correctAnswer))
</script>

<style scoped>
.answer-feedback {
  --success-color: #00B42A;
  --error-color: #F53F3F;

  border-radius: 12px;
  padding: 16px;
  margin: 12px 12px 0;
}

.answer-feedback.correct {
  background: #f0fff4;
  border: 1px solid var(--success-color);
}

.answer-feedback.warning {
  background: #fffbf0;
  border: 1px solid #FF7D00;
}

.answer-feedback.wrong {
  background: #fff2f0;
  border: 1px solid var(--error-color);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.result-icon {
  font-size: 22px;
  line-height: 1;
}

.result-text {
  font-size: 17px;
  font-weight: 600;
}

.correct .result-text {
  color: var(--success-color);
}

.wrong .result-text {
  color: var(--error-color);
}

.correct-answer-section {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 填空题逐空反馈 */
.blank-feedback-section {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
}

.blank-feedback-row {
  font-size: 14px;
  line-height: 2.2;
}

.blank-feedback-index {
  color: #86909c;
}

.text-correct {
  color: #00B96B;
  font-weight: 500;
}

.text-wrong {
  color: #F53F3F;
  font-weight: 500;
}

.blank-feedback-mark {
  color: #00B96B;
  font-weight: 700;
  margin-left: 6px;
}

.blank-feedback-mark.wrong {
  color: #F53F3F;
}

.correct-answer-hint {
  font-size: 13px;
  color: #00B96B;
  font-weight: 500;
  padding: 4px 0;
  margin-top: 2px;
}

.answer-row {
  display: flex;
  align-items: baseline;
  font-size: 14px;
  line-height: 1.6;
}

.answer-label {
  flex-shrink: 0;
  color: #86909c;
}

.answer-value {
  font-weight: 500;
  word-break: break-all;
}

.user-answer {
  color: var(--error-color);
  text-decoration: line-through;
}

.correct-answer {
  color: var(--success-color);
}

.explanation-section {
  margin-bottom: 12px;
}

.explanation-title {
  font-size: 13px;
  font-weight: 600;
  color: #4e5969;
  margin-bottom: 4px;
}

.explanation-content {
  font-size: 14px;
  line-height: 1.6;
  color: #1d2129;
}

/* 简答题准确率 */
.accuracy-badge {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.accuracy-badge.level-high { color: #00B42A; }
.accuracy-badge.level-mid { color: #FF7D00; }
.accuracy-badge.level-low { color: #F53F3F; }

.result-text.level-high { color: #00B42A; }
.result-text.level-mid { color: #FF7D00; }
.result-text.level-low { color: #F53F3F; }

/* 简答题反馈 */
.essay-feedback-section {
  margin-bottom: 12px;
}

.essay-block {
  margin-bottom: 10px;
}

.essay-block:last-child {
  margin-bottom: 0;
}

.essay-label {
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
  margin-bottom: 6px;
}

.label-student { color: #1989fa; }
.label-reference { color: #00B96B; }

.essay-content {
  font-size: 14px;
  line-height: 1.7;
  padding: 12px;
  border-radius: 8px;
  white-space: pre-line;
}

.essay-content.student {
  background: rgba(255, 255, 255, 0.6);
  color: #4e5969;
  border: 1px solid #e5e6eb;
}

.essay-content.reference {
  background: rgba(240, 255, 244, 0.6);
  color: #1d2129;
  border: 1px solid #AFF0B5;
}

.wrong-book-tip {
  font-size: 13px;
  color: #86909c;
  text-align: center;
  margin-bottom: 12px;
}

/* 从底部滑入动画 */
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
