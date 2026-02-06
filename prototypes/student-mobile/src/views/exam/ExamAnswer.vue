<template>
  <div class="exam-answer-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar fixed placeholder>
      <template #title>
        <span class="nav-title">{{ exam?.name }}</span>
      </template>
      <template #right>
        <van-button type="primary" size="small" @click="showAnswerSheet = true">
          答题卡
        </van-button>
      </template>
    </van-nav-bar>

    <!-- 题目信息栏（与导航栏融合） -->
    <div v-if="!loading && currentQuestion" class="question-bar">
      <div class="bar-left">
        <span class="question-index">{{ currentQuestionIndex + 1 }}</span>
        <span class="question-total">/{{ questions.length }}</span>
        <van-tag :type="getQuestionTypeColor(currentQuestion.type)" size="medium" class="type-tag">
          {{ currentQuestion.typeName }}
        </van-tag>
      </div>
      <div class="bar-right">
        <div class="countdown" :class="{ warning: remainingTime < 600 }">
          <van-icon name="clock-o" />
          <span>{{ formattedTime }}</span>
        </div>
        <span class="score">{{ currentQuestion.score }}分</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading-wrapper" vertical>加载中...</van-loading>

    <!-- 主内容区 -->
    <div v-else class="content" :class="{ 'content-fixed': currentQuestion.type === 'cloze' || currentQuestion.type === 'composite' }">
      <!-- 题目内容（完形填空和复合题也显示题目内容） -->
      <div class="question-content" :class="{ 'fixed-content': currentQuestion.type === 'cloze' || currentQuestion.type === 'composite' }">
        <div class="question-text" v-html="formatQuestionContent(currentQuestion.type === 'composite' ? currentQuestion.material : currentQuestion.content)"></div>
      </div>

      <!-- 答题区域（根据题型动态渲染） -->
      <div class="answer-area" :class="{ 'floating-answer': currentQuestion.type === 'cloze' || currentQuestion.type === 'composite' }">
        <!-- 单选题 -->
        <SingleChoice
          v-if="currentQuestion.type === 'single'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
        />

        <!-- 多选题 -->
        <MultipleChoice
          v-else-if="currentQuestion.type === 'multiple'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
        />

        <!-- 判断题 -->
        <JudgeQuestion
          v-else-if="currentQuestion.type === 'judge'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
        />

        <!-- 填空题 -->
        <BlankQuestion
          v-else-if="currentQuestion.type === 'blank'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
        />

        <!-- 简答题 -->
        <EssayQuestion
          v-else-if="currentQuestion.type === 'essay'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
        />

        <!-- 完形填空 -->
        <ClozeQuestion
          v-else-if="currentQuestion.type === 'cloze'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
          @complete="handleQuestionComplete"
        />

        <!-- 复合题 -->
        <CompositeQuestion
          v-else-if="currentQuestion.type === 'composite'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
          @complete="handleQuestionComplete"
        />
      </div>

      <!-- 底部导航按钮 -->
      <div class="bottom-nav safe-area-bottom">
        <van-button
          type="default"
          size="large"
          :disabled="currentQuestionIndex === 0"
          @click="handlePrevQuestion"
        >
          上一题
        </van-button>
        <van-button
          v-if="currentQuestionIndex < questions.length - 1"
          type="primary"
          size="large"
          @click="handleNextQuestion"
        >
          下一题
        </van-button>
        <van-button
          v-else
          type="success"
          size="large"
          @click="handleSubmit"
        >
          提交试卷
        </van-button>
      </div>
    </div>

    <!-- 答题卡弹窗 -->
    <van-popup
      v-model:show="showAnswerSheet"
      position="right"
      :style="{ width: '80%', height: '100vh' }"
      :lock-scroll="true"
      :close-on-click-overlay="true"
    >
      <div class="answer-sheet">
        <div class="sheet-header">
          <div class="sheet-title">答题卡</div>
          <van-icon name="cross" class="close-icon" @click="showAnswerSheet = false" />
        </div>

        <div class="sheet-stats">
          <div class="stat-item">
            <div class="stat-value answered">{{ answeredCount }}</div>
            <div class="stat-label">已答</div>
          </div>
          <div class="stat-item">
            <div class="stat-value unanswered">{{ unansweredCount }}</div>
            <div class="stat-label">未答</div>
          </div>
          <div class="stat-item">
            <div class="stat-value total">{{ questions.length }}</div>
            <div class="stat-label">总题数</div>
          </div>
        </div>

        <div class="sheet-content">
          <div
            v-for="(question, index) in questions"
            :key="question.id"
            class="sheet-item"
            :class="{
              active: index === currentQuestionIndex,
              answered: answers[question.id],
            }"
            @click="handleJumpToQuestion(index)"
          >
            <div class="item-number">{{ index + 1 }}</div>
          </div>
        </div>

        <div class="sheet-footer">
          <van-button type="success" size="large" block @click="handleSubmit">
            提交试卷
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExamStore, useAnswerStore } from '@/stores'
import { enterExam } from '@/api/exam'
import { showToast, showConfirmDialog } from 'vant'

// 导入题型组件
import SingleChoice from './components/SingleChoice.vue'
import MultipleChoice from './components/MultipleChoice.vue'
import JudgeQuestion from './components/JudgeQuestion.vue'
import BlankQuestion from './components/BlankQuestion.vue'
import EssayQuestion from './components/EssayQuestion.vue'
import ClozeQuestion from './components/ClozeQuestion.vue'
import CompositeQuestion from './components/CompositeQuestion.vue'

const route = useRoute()
const router = useRouter()
const examStore = useExamStore()
const answerStore = useAnswerStore()

const loading = ref(true)
const showAnswerSheet = ref(false)

// 计算属性
const exam = computed(() => examStore.currentExam)
const questions = computed(() => answerStore.questions)
const currentQuestionIndex = computed(() => answerStore.currentQuestionIndex)
const currentQuestion = computed(() => answerStore.currentQuestion)
const answers = computed(() => answerStore.answers)
const remainingTime = computed(() => answerStore.remainingTime)
const formattedTime = computed(() => answerStore.formattedTime)
const answeredCount = computed(() => answerStore.answeredCount)
const unansweredCount = computed(() => answerStore.unansweredCount)

// 当前题目的答案
const currentAnswer = computed(() => {
  return answers.value[currentQuestion.value?.id] || getDefaultAnswer(currentQuestion.value?.type)
})

// 获取默认答案
const getDefaultAnswer = (type) => {
  switch (type) {
    case 'single':
    case 'judge':
      return ''
    case 'multiple':
      return []
    case 'blank':
    case 'cloze':
    case 'composite':
      return {}
    case 'essay':
      return { text: '', attachments: [] }
    default:
      return null
  }
}

// 获取题型颜色
const getQuestionTypeColor = (type) => {
  const colorMap = {
    single: 'primary',
    multiple: 'success',
    judge: 'warning',
    blank: 'danger',
    essay: 'default',
    cloze: 'primary',
    composite: 'success',
  }
  return colorMap[type] || 'default'
}

// 格式化题目内容（处理换行等）
const formatQuestionContent = (content) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>')
}

// 加载考试数据
const loadExamData = async () => {
  loading.value = true
  try {
    const examId = route.params.id

    // 获取试卷数据
    const data = await enterExam(examId)

    // 设置考试信息
    examStore.currentExam = data
    examStore.currentPaper = data.paper

    // 初始化答题状态
    answerStore.initAnswer(examId, data.paper.id, data.duration)
  } catch (error) {
    showToast('加载失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 答案变化处理
const handleAnswerChange = (value) => {
  answerStore.saveAnswer(currentQuestion.value.id, value)
}

// 上一题
const handlePrevQuestion = () => {
  answerStore.prevQuestion()
}

// 下一题
const handleNextQuestion = () => {
  answerStore.nextQuestion()
}

// 跳转到指定题目
const handleJumpToQuestion = (index) => {
  answerStore.setCurrentQuestion(index)
  showAnswerSheet.value = false
}

// 完形填空/复合题完成处理
const handleQuestionComplete = () => {
  // 如果还有下一题，跳转到下一题
  if (currentQuestionIndex.value < questions.value.length - 1) {
    answerStore.nextQuestion()
  } else {
    // 如果是最后一题，提交试卷
    handleSubmit()
  }
}

// 提交试卷
const handleSubmit = async () => {
  // 检查未答题数
  if (unansweredCount.value > 0) {
    try {
      await showConfirmDialog({
        title: '提示',
        message: `还有 ${unansweredCount.value} 题未作答，确定要提交吗？`,
      })
    } catch {
      return
    }
  }

  try {
    await showConfirmDialog({
      title: '确认提交',
      message: '提交后将无法修改答案，确定要提交吗？',
    })

    // 跳转到提交确认页面
    router.push(`/exam/submit/${exam.value.id}`)
  } catch {
    // 取消提交
  }
}

// 监听剩余时间，时间到自动提交
watch(remainingTime, (newTime) => {
  if (newTime === 0) {
    showToast('考试时间已到，自动提交')
    setTimeout(() => {
      router.push(`/exam/submit/${exam.value.id}`)
    }, 1500)
  } else if (newTime === 300) {
    // 剩余5分钟提醒
    showToast('剩余时间5分钟')
  } else if (newTime === 60) {
    // 剩余1分钟提醒
    showToast('剩余时间1分钟')
  }
})

// 页面离开确认
const handleBeforeUnload = (e) => {
  e.preventDefault()
  e.returnValue = ''
}

onMounted(() => {
  loadExamData()
  // 添加页面离开提示
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.exam-answer-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}

/* 导航栏 */
.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

/* 题目信息栏（与导航栏融合） */
.question-bar {
  position: fixed;
  top: 46px;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(180deg, #ffffff 0%, #f7f8fa 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  z-index: 99;
  border-bottom: 1px solid #e5e6eb;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.question-index {
  font-size: 20px;
  font-weight: 700;
  color: #00B96B;
}

.question-total {
  font-size: 14px;
  color: #86909c;
  margin-right: 8px;
}

.type-tag {
  margin-left: 4px;
}

.bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #00B96B;
  font-weight: 600;
}

.countdown.warning {
  color: #F53F3F;
}

.score {
  font-size: 14px;
  color: #F77234;
  font-weight: 600;
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

/* 主内容 */
.content {
  padding-top: 40px;
  min-height: 100vh;
  padding-bottom: 80px; /* 为底部导航留出空间 */
}

/* 完形填空和复合题时，固定布局 */
.content.content-fixed {
  overflow: hidden;
  height: 100vh;
}

/* 题目内容 */
.question-content {
  background: white;
  border-radius: 12px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  padding: 12px 16px;
  margin: 8px 12px 0 12px;
}

/* 完形填空和复合题的题目内容固定定位 */
.question-content.fixed-content {
  position: fixed;
  top: 94px; /* 导航栏46px + 题目信息栏40px + 间距8px */
  left: 12px;
  right: 12px;
  bottom: calc(35vh + 64px); /* 答题面板最小高度35vh + 底部导航64px，与面板间距为0 */
  margin: 0;
  border-radius: 12px;
  overflow-y: auto; /* 内容在卡片内滚动 */
  z-index: 1;
}

.question-text {
  font-size: 16px;
  line-height: 1.8;
  color: #1d2129;
}

/* 答题区域 */
.answer-area {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 0 12px 12px 12px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

/* 完形填空和复合题的答题区域不显示背景 */
.answer-area.floating-answer {
  background: transparent;
  padding: 0;
  margin: 0;
  min-height: 0;
}

/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: white;
  border-top: 1px solid #e5e6eb;
  display: flex;
  gap: 12px;
  z-index: 100;
}

.bottom-nav .van-button {
  flex: 1;
}

/* 答题卡 */
.answer-sheet {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  overflow: hidden;
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e5e6eb;
  flex-shrink: 0;
}

.sheet-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.close-icon {
  font-size: 22px;
  color: #86909c;
  cursor: pointer;
  padding: 4px;
}

.close-icon:active {
  transform: scale(0.9);
}

.sheet-stats {
  display: flex;
  padding: 20px 16px;
  background: white;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1;
}

.stat-value.answered {
  color: #00B96B;
}

.stat-value.unanswered {
  color: #F77234;
}

.stat-value.total {
  color: #165DFF;
}

.stat-label {
  font-size: 13px;
  color: #86909c;
}

.sheet-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  align-content: start;
}

.sheet-item {
  aspect-ratio: 1;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 2px solid #e5e6eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sheet-item:active {
  transform: scale(0.95);
}

.sheet-item.active {
  border-color: #00B96B;
  background: #E6F7F0;
  box-shadow: 0 0 0 3px rgba(0, 185, 107, 0.1);
}

.sheet-item.answered {
  background: #00B96B;
  border-color: #00B96B;
  color: white;
}

.sheet-item.answered.active {
  background: #00B96B;
  border-color: #009456;
  box-shadow: 0 0 0 3px rgba(0, 185, 107, 0.2);
}

.item-number {
  font-size: 16px;
  font-weight: 600;
}

.sheet-footer {
  padding: 16px;
  background: white;
  border-top: 1px solid #e5e6eb;
  flex-shrink: 0;
}
</style>
