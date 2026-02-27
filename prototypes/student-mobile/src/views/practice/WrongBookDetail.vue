<template>
  <div class="wrong-book-detail-page">
    <van-nav-bar title="错题回顾" left-arrow @click-left="$router.back()" fixed placeholder />

    <van-loading v-if="loading" class="loading-wrapper" vertical>加载中...</van-loading>

    <template v-else-if="wrongItems.length > 0">
      <!-- 题目信息栏 -->
      <div class="question-bar">
        <span class="question-index">{{ currentIndex + 1 }}</span>
        <span class="question-total">/{{ wrongItems.length }}</span>
        <span class="wrong-count">错误{{ currentItem?.wrongCount || 0 }}次</span>
        <span v-if="currentItem?.correctCount" class="correct-count">连对{{ currentItem.correctCount }}次</span>
      </div>

      <!-- 题目内容 -->
      <div class="content">
        <div class="question-card">
          <div class="type-tag">{{ currentQuestion?.typeName }}</div>
          <div class="question-text" v-html="currentQuestion?.content"></div>
        </div>

        <!-- 选择题选项（带精致对错标记） -->
        <div v-if="currentQuestion?.options" class="options-review">
          <div
            v-for="opt in currentQuestion.options"
            :key="opt.label"
            class="option-item"
            :class="getOptionClass(opt.label)"
          >
            <div class="option-indicator" :class="getIndicatorClass(opt.label)">
              <span v-if="isCorrectAnswer(opt.label)" class="indicator-icon">✓</span>
              <span v-else-if="isUserWrongAnswer(opt.label)" class="indicator-icon">✗</span>
              <span v-else class="indicator-text">{{ opt.label }}</span>
            </div>
            <span class="option-text">{{ opt.text }}</span>
            <div class="option-tags">
              <span v-if="isCorrectAnswer(opt.label)" class="tag-correct">正确答案</span>
              <span v-if="isUserWrongAnswer(opt.label)" class="tag-wrong">你的选择</span>
            </div>
          </div>
        </div>

        <!-- 填空题答案 -->
        <div v-if="currentQuestion?.type === 'blank'" class="blank-review">
          <div class="review-section-title">正确答案</div>
          <div v-for="(ans, i) in currentQuestion.correctAnswer" :key="i" class="blank-item">
            <span class="blank-label">第{{ i + 1 }}空</span>
            <span class="blank-value">{{ ans }}</span>
          </div>
        </div>

        <!-- 判断题答案 -->
        <div v-if="currentQuestion?.type === 'judge'" class="judge-review">
          <div class="judge-item correct">
            <van-icon name="checked" size="18" />
            <span>正确答案：{{ currentQuestion.correctAnswer ? '正确' : '错误' }}</span>
          </div>
        </div>

        <!-- 简答题 -->
        <div v-if="currentQuestion?.type === 'essay'" class="essay-review">
          <div class="review-section-title">参考答案</div>
          <div class="essay-answer">{{ currentQuestion.correctAnswer }}</div>
        </div>

        <!-- 解析 -->
        <div v-if="currentQuestion?.explanation" class="explanation-card">
          <div class="explanation-title">
            <van-icon name="info-o" />
            <span>解析</span>
          </div>
          <div class="explanation-text">{{ currentQuestion.explanation }}</div>
        </div>

        <!-- 错误记录 -->
        <div class="wrong-info">
          <span>错误次数：{{ currentItem?.wrongCount }}</span>
          <span>最近错误：{{ formatTime(currentItem?.lastWrongTime) }}</span>
        </div>
      </div>

      <!-- 底部导航 -->
      <div class="bottom-nav safe-area-bottom">
        <van-button type="default" size="large" :disabled="currentIndex === 0" @click="currentIndex--">
          上一题
        </van-button>
        <van-button type="warning" size="large" @click="markMastered">
          标记已掌握
        </van-button>
        <van-button type="primary" size="large" :disabled="currentIndex >= wrongItems.length - 1" @click="currentIndex++">
          下一题
        </van-button>
      </div>
    </template>

    <van-empty v-else description="该任务暂无错题" image="search" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePracticeStore } from '@/stores'
import { showToast } from 'vant'

const route = useRoute()
const store = usePracticeStore()
const taskId = route.params.taskId
const loading = ref(true)
const currentIndex = ref(0)

// 当前任务的错题
const wrongItems = computed(() => {
  return Object.entries(store.wrongBook)
    .filter(([, info]) => info.sourceTaskId === taskId && !info.mastered)
    .map(([qId, info]) => ({ qId, ...info }))
})

const currentItem = computed(() => wrongItems.value[currentIndex.value])
const currentQuestion = computed(() => currentItem.value?.question)

// 用户答案
const userAnswer = computed(() => currentItem.value?.userAnswer)

const isCorrectAnswer = (label) => {
  const correct = currentQuestion.value?.correctAnswer
  if (Array.isArray(correct)) return correct.includes(label)
  return correct === label
}

const isUserWrongAnswer = (label) => {
  const ua = userAnswer.value
  if (!ua) return false
  const correct = currentQuestion.value?.correctAnswer
  if (Array.isArray(ua)) return ua.includes(label) && !isCorrectAnswer(label)
  return ua === label && !isCorrectAnswer(label)
}

const getOptionClass = (label) => {
  if (isCorrectAnswer(label)) return 'opt-correct'
  if (isUserWrongAnswer(label)) return 'opt-wrong'
  return ''
}

const getIndicatorClass = (label) => {
  if (isCorrectAnswer(label)) return 'ind-correct'
  if (isUserWrongAnswer(label)) return 'ind-wrong'
  return 'ind-default'
}

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  return timeStr.slice(0, 16).replace('T', ' ')
}

const markMastered = () => {
  if (currentItem.value) {
    store.markMastered(currentItem.value.qId)
    showToast('已标记为掌握')
    if (currentIndex.value >= wrongItems.value.length) {
      currentIndex.value = Math.max(0, wrongItems.value.length - 1)
    }
  }
}

onMounted(() => {
  store.loadWrongBook()
  loading.value = false
})
</script>

<style scoped>
.wrong-book-detail-page {
  min-height: 100vh;
  background: var(--bg-color, #f7f8fa);
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.question-bar {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 10px 16px;
  background: white;
  border-bottom: 1px solid #f2f3f5;
}

.question-index {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #1d2129);
}

.question-total {
  font-size: 14px;
  color: #86909c;
}

.wrong-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--error-color, #F53F3F);
  background: #fff2f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.correct-count {
  font-size: 12px;
  color: var(--success-color, #00B42A);
  background: #e8ffea;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 6px;
}

.content {
  padding: 16px;
  padding-bottom: 100px;
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
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

/* 选项区域 */
.options-review {
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 8px;
  background: #f7f8fa;
  border: 1.5px solid transparent;
  transition: all 0.2s;
}

.option-item:last-child {
  margin-bottom: 0;
}

.option-item.opt-correct {
  background: #f0fff4;
  border-color: #95de64;
}

.option-item.opt-wrong {
  background: #fff2f0;
  border-color: #ffa39e;
}

/* 选项指示器（圆形标签） */
.option-indicator {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
}

.ind-default {
  background: #e5e6eb;
  color: var(--text-secondary, #4e5969);
}

.ind-correct {
  background: var(--success-color, #00B42A);
  color: white;
}

.ind-wrong {
  background: var(--error-color, #F53F3F);
  color: white;
}

.indicator-icon {
  font-size: 14px;
  line-height: 1;
}

.indicator-text {
  font-size: 13px;
}

.option-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary, #1d2129);
  line-height: 1.5;
}

.option-tags {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.tag-correct {
  font-size: 11px;
  color: var(--success-color, #00B42A);
  background: #e8ffea;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.tag-wrong {
  font-size: 11px;
  color: var(--error-color, #F53F3F);
  background: #fff2f0;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

/* 填空题 */
.blank-review {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.review-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #1d2129);
  margin-bottom: 10px;
}

.blank-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px dashed #f2f3f5;
}

.blank-item:last-child {
  border-bottom: none;
}

.blank-label {
  font-size: 13px;
  color: var(--text-secondary, #4e5969);
  flex-shrink: 0;
}

.blank-value {
  font-size: 14px;
  color: var(--success-color, #00B42A);
  font-weight: 500;
}

/* 判断题 */
.judge-review {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.judge-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.judge-item.correct {
  color: var(--success-color, #00B42A);
}

/* 简答题 */
.essay-review {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.essay-answer {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary, #4e5969);
  white-space: pre-wrap;
}

/* 解析 */
.explanation-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
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

.wrong-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #86909c;
  padding: 0 4px;
}

/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #f2f3f5;
  z-index: 100;
}

.bottom-nav .van-button {
  flex: 1;
}

.bottom-nav :deep(.van-button--primary) {
  background: var(--primary-color, #00B96B);
  border-color: var(--primary-color, #00B96B);
}

.bottom-nav :deep(.van-button--warning) {
  background: #FF7D00;
  border-color: #FF7D00;
}
</style>
