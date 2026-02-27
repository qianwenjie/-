<template>
  <Transition name="slide-up">
    <div v-if="visible" class="composite-feedback">
      <!-- 每个子题平铺展示 -->
      <div class="composite-result">
        <div v-for="(sq, si) in question.subQuestions" :key="sq.id" class="composite-sub">
          <!-- 子题头部 -->
          <div class="composite-sub-header">
            <span class="composite-sub-index">第{{ si + 1 }}小题</span>
            <span class="composite-sub-type">{{ sq.typeName }}</span>
            <!-- 简答题：显示准确率 -->
            <span v-if="sq.type === 'essay'" class="composite-sub-status" :class="essayAccuracyLevel(sq)">
              准确率 {{ getEssayAccuracy(sq) }}%
            </span>
            <!-- 其他题型：显示对错 -->
            <span v-else class="composite-sub-status" :class="subResults[sq.id] ? 'text-correct' : 'text-wrong'">
              {{ subResults[sq.id] ? '✓ 正确' : '✗ 错误' }}
            </span>
          </div>
          <!-- 子题题干 -->
          <div class="composite-sub-stem">{{ sq.content }}</div>

          <!-- 子题：选择题（单选/多选） -->
          <div v-if="['single', 'multiple'].includes(sq.type)" class="options-list">
            <div
              v-for="opt in sq.options"
              :key="opt.label"
              class="option-item"
              :class="getSubOptionClass(sq, opt.label)"
            >
              <span class="opt-label">{{ opt.label }}</span>
              <span class="opt-text">{{ opt.text }}</span>
              <span v-if="isSubSelected(sq, opt.label) && subResults[sq.id]" class="opt-mark correct">✓</span>
              <span v-if="isSubSelected(sq, opt.label) && !subResults[sq.id]" class="opt-mark wrong">✗</span>
              <span v-if="!isSubSelected(sq, opt.label) && isCorrectOption(sq, opt.label) && !subResults[sq.id]" class="opt-mark correct">✓</span>
            </div>
            <div v-if="!subResults[sq.id]" class="correct-answer-hint">
              正确答案：{{ formatCorrectAnswer(sq.correctAnswer) }}
            </div>
          </div>

          <!-- 子题：判断题 -->
          <div v-if="sq.type === 'judge'" class="judge-result">
            <div class="judge-row">
              <span class="judge-label">你的答案：</span>
              <span :class="subResults[sq.id] ? 'text-correct' : 'text-wrong'">
                {{ formatJudge(userAnswer[sq.id]) }}
              </span>
            </div>
            <div v-if="!subResults[sq.id]" class="judge-row">
              <span class="judge-label">正确答案：</span>
              <span class="text-correct">{{ formatJudge(sq.correctAnswer) }}</span>
            </div>
          </div>

          <!-- 子题：填空题 -->
          <div v-if="sq.type === 'blank'" class="blank-result">
            <div v-for="(ans, ai) in getBlankAnswers(sq)" :key="ai" class="blank-row">
              <span class="blank-index">第{{ ai + 1 }}空：</span>
              <span :class="ans.isCorrect ? 'text-correct' : 'text-wrong'">{{ ans.student || '未作答' }}</span>
              <span v-if="ans.isCorrect" class="blank-mark">✓</span>
              <span v-else class="blank-mark wrong">✗</span>
            </div>
            <div v-if="!subResults[sq.id]" class="correct-answer-hint">
              正确答案：{{ formatBlankCorrectAnswer(sq.correctAnswer) }}
            </div>
          </div>

          <!-- 子题：简答题 -->
          <div v-if="sq.type === 'essay'" class="essay-result">
            <div class="essay-block">
              <div class="essay-label label-student">我的作答</div>
              <div class="essay-content student">{{ getEssayText(userAnswer[sq.id]) || '未作答' }}</div>
            </div>
            <div class="essay-block">
              <div class="essay-label label-reference">参考答案</div>
              <div class="essay-content reference">{{ sq.correctAnswer || '--' }}</div>
            </div>
          </div>

          <!-- 子题解析 -->
          <div v-if="sq.explanation" class="sub-explanation">
            <span>解析：{{ sq.explanation }}</span>
          </div>
        </div>
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
  essayAccuracies: { type: Object, default: () => ({}) },
  hideWrongTip: { type: Boolean, default: false },
})

// 每个子题是否正确
const subResults = computed(() => {
  const results = {}
  if (!props.question?.subQuestions) return results
  props.question.subQuestions.forEach(sq => {
    const userAns = props.userAnswer[sq.id]
    const correctAns = sq.correctAnswer
    if (sq.type === 'single') {
      results[sq.id] = userAns === correctAns
    } else if (sq.type === 'multiple') {
      results[sq.id] = Array.isArray(userAns) && Array.isArray(correctAns)
        && userAns.length === correctAns.length
        && userAns.every(a => correctAns.includes(a))
    } else if (sq.type === 'judge') {
      results[sq.id] = String(userAns) === String(correctAns)
    } else if (sq.type === 'blank') {
      // 填空题：userAns 可能是 { blankId: value } 或 [value1, value2]
      if (Array.isArray(userAns) && Array.isArray(correctAns)) {
        results[sq.id] = userAns.length === correctAns.length
          && userAns.every((a, i) => a?.trim().toLowerCase() === correctAns[i]?.trim().toLowerCase())
      } else if (typeof userAns === 'object' && userAns !== null && !Array.isArray(userAns)) {
        // { blankId: value } 格式
        const blanks = sq.blanks || []
        if (Array.isArray(correctAns)) {
          results[sq.id] = blanks.every((b, i) => userAns[b.id]?.trim().toLowerCase() === correctAns[i]?.trim().toLowerCase())
        } else {
          results[sq.id] = false
        }
      } else {
        results[sq.id] = false
      }
    } else if (sq.type === 'essay') {
      // 简答题：准确率>=80%视为正确
      const accuracy = props.essayAccuracies[sq.id] ?? 0
      results[sq.id] = accuracy >= 80
    } else {
      results[sq.id] = String(userAns) === String(correctAns)
    }
  })
  return results
})

// 是否全部正确
const allCorrect = computed(() => {
  return Object.values(subResults.value).every(v => v)
})

// 简答题准确率
const getEssayAccuracy = (sq) => {
  return props.essayAccuracies[sq.id] ?? 0
}

// 简答题准确率等级样式
const essayAccuracyLevel = (sq) => {
  const accuracy = getEssayAccuracy(sq)
  if (accuracy >= 80) return 'text-correct'
  if (accuracy >= 50) return 'text-warning'
  return 'text-wrong'
}

// 用户是否选了该选项
const isSubSelected = (sq, label) => {
  const a = props.userAnswer[sq.id]
  return Array.isArray(a) ? a.includes(label) : a === label
}

// 是否为正确答案选项
const isCorrectOption = (sq, label) => {
  const c = sq.correctAnswer
  return Array.isArray(c) ? c.includes(label) : c === label
}

// 选项样式
const getSubOptionClass = (sq, label) => {
  const selected = isSubSelected(sq, label)
  const isCorrect = isCorrectOption(sq, label)
  const subCorrect = subResults.value[sq.id]

  if (selected && subCorrect) return 'opt-correct-selected'
  if (selected && !subCorrect) return 'opt-wrong-selected'
  if (!selected && isCorrect && !subCorrect) return 'opt-correct-selected'
  return ''
}

// 格式化正确答案
const formatCorrectAnswer = (answer) => {
  return Array.isArray(answer) ? answer.join('、') : answer
}

// 格式化判断题答案
const formatJudge = (val) => {
  if (val === true || val === 'true') return '正确 ✓'
  if (val === false || val === 'false') return '错误 ✗'
  return '未作答'
}

// 填空题答案对比
const getBlankAnswers = (sq) => {
  const userAns = props.userAnswer[sq.id]
  const correctAns = sq.correctAnswer || []

  // 数组格式
  if (Array.isArray(userAns)) {
    return (Array.isArray(correctAns) ? correctAns : []).map((c, i) => ({
      student: userAns[i] || '',
      correct: c,
      isCorrect: userAns[i]?.trim().toLowerCase() === c?.trim().toLowerCase(),
    }))
  }

  // 对象格式 { blankId: value }
  if (typeof userAns === 'object' && userAns !== null) {
    const blanks = sq.blanks || []
    if (Array.isArray(correctAns)) {
      return correctAns.map((c, i) => {
        const blank = blanks[i]
        const student = blank ? (userAns[blank.id] || '') : ''
        return {
          student,
          correct: c,
          isCorrect: student?.trim().toLowerCase() === c?.trim().toLowerCase(),
        }
      })
    }
  }

  // fallback
  return Array.isArray(correctAns) ? correctAns.map(c => ({ student: '', correct: c, isCorrect: false })) : []
}

// 格式化填空题正确答案
const formatBlankCorrectAnswer = (answer) => {
  return Array.isArray(answer) ? answer.join('、') : String(answer || '')
}

// 获取简答题文本
const getEssayText = (answer) => {
  if (!answer) return ''
  if (typeof answer === 'string') return answer
  if (typeof answer === 'object' && answer.text) return answer.text
  return ''
}
</script>

<style scoped>
.composite-feedback {
  margin: 12px 12px 0;
}

.composite-result {
  margin-bottom: 12px;
}

.composite-sub {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
}

.composite-sub-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f2f3f5;
}

.composite-sub-index {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.composite-sub-type {
  font-size: 11px;
  color: #00B96B;
  background: #e6f9f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.composite-sub-status {
  font-size: 13px;
  font-weight: 500;
  margin-left: auto;
}

.composite-sub-stem {
  font-size: 14px;
  color: #4e5969;
  line-height: 1.7;
  margin-bottom: 10px;
}

/* 文字颜色 */
.text-correct { color: #00B96B; font-weight: 500; }
.text-wrong { color: #F53F3F; font-weight: 500; }
.text-warning { color: #FF7D00; font-weight: 500; }

/* 选择题选项 */
.options-list { margin-bottom: 0; }

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

.opt-text { flex: 1; }

.opt-mark {
  margin-left: 8px;
  font-weight: 700;
  font-size: 16px;
}

.opt-mark.correct { color: #00B96B; }
.opt-mark.wrong { color: #F53F3F; }

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

/* 判断题 */
.judge-result {
  margin-bottom: 0;
}

.judge-row {
  font-size: 14px;
  line-height: 2.2;
}

.judge-label {
  color: #86909c;
}

/* 填空题 */
.blank-result {
  margin-bottom: 0;
}

.blank-row {
  font-size: 14px;
  line-height: 2.2;
}

.blank-index {
  color: #86909c;
}

.blank-mark {
  color: #00B96B;
  font-weight: 700;
  margin-left: 6px;
}

.blank-mark.wrong {
  color: #F53F3F;
}

/* 简答题 */
.essay-result {
  margin-bottom: 0;
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

.label-student {
  color: #1989fa;
}

.label-reference {
  color: #00B96B;
}

.essay-content {
  font-size: 14px;
  line-height: 1.7;
  padding: 12px;
  border-radius: 8px;
  white-space: pre-line;
}

.essay-content.student {
  background: #fff;
  color: #4e5969;
  border: 1px solid #e5e6eb;
}

.essay-content.reference {
  background: #f0fff4;
  color: #1d2129;
  border: 1px solid #AFF0B5;
}

/* 子题解析 */
.sub-explanation {
  font-size: 12px;
  color: #86909c;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e5e6eb;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 错题本提示 */
.wrong-book-tip {
  font-size: 13px;
  color: #86909c;
  text-align: center;
  margin-bottom: 4px;
}

/* 动画 */
.slide-up-enter-active { transition: all 0.3s ease-out; }
.slide-up-leave-active { transition: all 0.2s ease-in; }
.slide-up-enter-from { transform: translateY(30px); opacity: 0; }
.slide-up-leave-to { transform: translateY(30px); opacity: 0; }
</style>
