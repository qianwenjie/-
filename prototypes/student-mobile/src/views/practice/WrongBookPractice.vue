<template>
  <div class="wrong-book-practice-page">
    <van-nav-bar :title="pageTitle" left-arrow @click-left="handleBack" fixed placeholder />

    <van-loading v-if="loading" class="loading-wrapper" vertical>加载中...</van-loading>

    <template v-else-if="questions.length > 0">
      <!-- 进度条 -->
      <div class="progress-bar">
        <div class="progress-info">
          <span class="current">{{ currentIndex + 1 }}</span>
          <span class="total">/{{ questions.length }}</span>
        </div>
        <van-progress
          :percentage="progressPercent"
          :show-pivot="false"
          stroke-width="4"
          color="var(--primary-color, #00B96B)"
        />
      </div>

      <!-- 题目内容 -->
      <div class="content">
        <div class="question-card">
          <div class="type-tag">{{ currentQuestion.typeName }}</div>
          <div class="question-text" v-html="currentQuestion.content"></div>
        </div>

        <!-- 答题前：显示选项 -->
        <template v-if="!hasAnswered">
          <!-- 单选题 -->
          <van-radio-group v-if="currentQuestion.type === 'single'" v-model="userAnswer" class="answer-options">
            <van-radio
              v-for="opt in currentQuestion.options"
              :key="opt.label"
              :name="opt.label"
              class="answer-option"
            >
              {{ opt.label }}. {{ opt.text }}
            </van-radio>
          </van-radio-group>

          <!-- 多选题 -->
          <van-checkbox-group v-if="currentQuestion.type === 'multiple'" v-model="userAnswer" class="answer-options">
            <van-checkbox
              v-for="opt in currentQuestion.options"
              :key="opt.label"
              :name="opt.label"
              class="answer-option"
            >
              {{ opt.label }}. {{ opt.text }}
            </van-checkbox>
          </van-checkbox-group>

          <!-- 判断题 -->
          <van-radio-group v-if="currentQuestion.type === 'judge'" v-model="userAnswer" class="answer-options">
            <van-radio :name="true" class="answer-option">正确</van-radio>
            <van-radio :name="false" class="answer-option">错误</van-radio>
          </van-radio-group>

          <!-- 填空题 -->
          <div v-if="currentQuestion.type === 'blank'" class="blank-inputs">
            <div v-for="(blank, idx) in currentQuestion.correctAnswer" :key="idx" class="blank-item">
              <span class="blank-label">第{{ idx + 1 }}空：</span>
              <van-field v-model="userAnswer[idx]" placeholder="请输入答案" />
            </div>
          </div>

          <!-- 简答题 -->
          <van-field
            v-if="currentQuestion.type === 'essay'"
            v-model="userAnswer"
            type="textarea"
            rows="6"
            placeholder="请输入答案"
            class="essay-input"
          />

          <van-button type="primary" size="large" block @click="submitAnswer" :disabled="!canSubmit">
            提交答案
          </van-button>
        </template>

        <!-- 答题后：显示结果和解析 -->
        <template v-else>
          <!-- 答题结果 -->
          <div class="result-card" :class="isCorrect ? 'result-correct' : 'result-wrong'">
            <van-icon :name="isCorrect ? 'checked' : 'close'" size="32" />
            <span class="result-text">{{ isCorrect ? '回答正确！' : '回答错误' }}</span>
          </div>

          <!-- 正确答案 -->
          <div class="answer-card">
            <div class="answer-title">正确答案</div>
            <div class="answer-content">{{ formatCorrectAnswer }}</div>
          </div>

          <!-- 解析 -->
          <div v-if="currentQuestion.explanation" class="explanation-card">
            <div class="explanation-title">
              <van-icon name="info-o" />
              <span>解析</span>
            </div>
            <div class="explanation-text">{{ currentQuestion.explanation }}</div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <van-button
              v-if="isCorrect"
              type="success"
              size="large"
              icon="checked"
              @click="markMasteredAndNext"
            >
              标记已掌握
            </van-button>
            <van-button
              type="primary"
              size="large"
              icon="arrow"
              @click="nextQuestion"
            >
              {{ currentIndex < questions.length - 1 ? '下一题' : '完成复习' }}
            </van-button>
          </div>
        </template>
      </div>
    </template>

    <van-empty v-else description="暂无错题需要复习" image="search" />

    <!-- 完成弹窗 -->
    <van-dialog
      v-model:show="showResultDialog"
      title="复习完成"
      :show-cancel-button="false"
      confirm-button-text="返回错题本"
      @confirm="goBack"
    >
      <div class="result-summary">
        <div class="summary-item">
          <span class="summary-label">总题数</span>
          <span class="summary-value">{{ questions.length }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">答对</span>
          <span class="summary-value correct">{{ correctCount }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">答错</span>
          <span class="summary-value wrong">{{ wrongCount }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">正确率</span>
          <span class="summary-value">{{ accuracyRate }}%</span>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const store = usePracticeStore()
const loading = ref(true)
const currentIndex = ref(0)
const userAnswer = ref(null)
const hasAnswered = ref(false)
const isCorrect = ref(false)
const results = ref([]) // 记录每题的答题结果
const showResultDialog = ref(false)

const mode = route.path.includes('practice-type') ? 'type' : 'task'
const id = route.params.id

const pageTitle = computed(() => {
  if (mode === 'task') {
    const group = store.wrongBookByTask.find(g => g.taskId === id)
    return `错题复习 - ${group?.taskName || ''}`
  } else {
    const group = store.wrongBookByType.find(g => g.type === id)
    return `错题复习 - ${group?.typeName || ''}`
  }
})

const questions = computed(() => {
  if (mode === 'task') {
    return store.questions
  } else {
    return store.questions
  }
})

const currentQuestion = computed(() => questions.value[currentIndex.value] || {})

const progressPercent = computed(() => {
  if (!questions.value.length) return 0
  return Math.round(((currentIndex.value + 1) / questions.value.length) * 100)
})

const canSubmit = computed(() => {
  if (!userAnswer.value) return false
  if (currentQuestion.value.type === 'multiple') {
    return userAnswer.value.length > 0
  }
  if (currentQuestion.value.type === 'blank') {
    return userAnswer.value.every(a => a && a.trim())
  }
  return true
})

const formatCorrectAnswer = computed(() => {
  const answer = currentQuestion.value.correctAnswer
  if (Array.isArray(answer)) {
    return answer.join(', ')
  }
  if (typeof answer === 'boolean') {
    return answer ? '正确' : '错误'
  }
  return answer
})

const correctCount = computed(() => results.value.filter(r => r.isCorrect).length)
const wrongCount = computed(() => results.value.filter(r => !r.isCorrect).length)
const accuracyRate = computed(() => {
  if (!results.value.length) return 0
  return Math.round((correctCount.value / results.value.length) * 100)
})

const submitAnswer = () => {
  // 判断答案是否正确
  const correct = checkAnswer()
  isCorrect.value = correct
  hasAnswered.value = true

  // 记录结果
  results.value.push({
    qId: currentQuestion.value.id,
    isCorrect: correct,
    userAnswer: userAnswer.value
  })

  // 提交到 store（会自动更新错题本）
  store.submitAnswer(currentQuestion.value.id, userAnswer.value, correct)
}

const checkAnswer = () => {
  const correctAnswer = currentQuestion.value.correctAnswer
  const type = currentQuestion.value.type

  if (type === 'single' || type === 'judge') {
    return userAnswer.value === correctAnswer
  }

  if (type === 'multiple') {
    if (!Array.isArray(userAnswer.value) || !Array.isArray(correctAnswer)) return false
    if (userAnswer.value.length !== correctAnswer.length) return false
    const sorted1 = [...userAnswer.value].sort()
    const sorted2 = [...correctAnswer].sort()
    return sorted1.every((v, i) => v === sorted2[i])
  }

  if (type === 'blank') {
    if (!Array.isArray(userAnswer.value) || !Array.isArray(correctAnswer)) return false
    return userAnswer.value.every((ans, idx) => {
      const correct = correctAnswer[idx]
      return ans.trim() === correct.trim()
    })
  }

  // 简答题暂时不判断
  return false
}

const nextQuestion = () => {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    resetAnswer()
  } else {
    // 完成所有题目
    showResultDialog.value = true
  }
}

const markMasteredAndNext = () => {
  store.markMastered(currentQuestion.value.id)
  showToast('已标记为掌握')
  nextQuestion()
}

const resetAnswer = () => {
  if (currentQuestion.value.type === 'blank') {
    userAnswer.value = new Array(currentQuestion.value.correctAnswer.length).fill('')
  } else if (currentQuestion.value.type === 'multiple') {
    userAnswer.value = []
  } else {
    userAnswer.value = null
  }
  hasAnswered.value = false
  isCorrect.value = false
}

const handleBack = async () => {
  if (results.value.length > 0) {
    try {
      await showConfirmDialog({
        title: '确认退出',
        message: '退出后将不保存复习进度，确认退出吗？',
      })
      goBack()
    } catch {
      // 用户取消
    }
  } else {
    goBack()
  }
}

const goBack = () => {
  router.push('/practice/wrong-book')
}

onMounted(() => {
  // 加载错题
  if (mode === 'task') {
    store.initWrongRedo(id)
  } else {
    store.initWrongRedoByType(id)
  }
  resetAnswer()
  loading.value = false
})
</script>

<style scoped>
.wrong-book-practice-page {
  min-height: 100vh;
  background: var(--bg-color, #f7f8fa);
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.progress-bar {
  background: white;
  padding: 12px 16px;
  border-bottom: 1px solid #f2f3f5;
}

.progress-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.progress-info .current {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #1d2129);
}

.progress-info .total {
  font-size: 14px;
  color: #86909c;
}

.content {
  padding: 16px;
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.type-tag {
  display: inline-block;
  font-size: 12px;
  padding: 2px 8px;
  background: #f2f3f5;
  color: var(--text-secondary, #4e5969);
  border-radius: 4px;
  margin-bottom: 10px;
}

.question-text {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary, #1d2129);
}

/* 答题选项 */
.answer-options {
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}

.answer-option {
  padding: 12px;
  margin-bottom: 8px;
  background: #f7f8fa;
  border-radius: 8px;
}

.answer-option:last-child {
  margin-bottom: 0;
}

/* 填空题 */
.blank-inputs {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.blank-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.blank-item:last-child {
  margin-bottom: 0;
}

.blank-label {
  font-size: 14px;
  color: var(--text-secondary, #4e5969);
  flex-shrink: 0;
}

/* 简答题 */
.essay-input {
  margin-bottom: 16px;
}

/* 答题结果 */
.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
}

.result-card.result-correct {
  background: #f0fff4;
  color: var(--success-color, #00B42A);
}

.result-card.result-wrong {
  background: #fff2f0;
  color: var(--error-color, #F53F3F);
}

.result-text {
  font-size: 18px;
  font-weight: 600;
  margin-top: 8px;
}

/* 正确答案 */
.answer-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.answer-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #1d2129);
  margin-bottom: 8px;
}

.answer-content {
  font-size: 14px;
  color: var(--success-color, #00B42A);
  font-weight: 500;
}

/* 解析 */
.explanation-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.explanation-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color, #00B96B);
  margin-bottom: 8px;
}

.explanation-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary, #4e5969);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .van-button {
  flex: 1;
}

/* 完成弹窗 */
.result-summary {
  padding: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #f2f3f5;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  font-size: 14px;
  color: var(--text-secondary, #4e5969);
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #1d2129);
}

.summary-value.correct {
  color: var(--success-color, #00B42A);
}

.summary-value.wrong {
  color: var(--error-color, #F53F3F);
}
</style>
