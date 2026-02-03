<template>
  <div class="exam-answer-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar fixed placeholder>
      <template #title>
        <div class="nav-title">
          <div class="exam-name">{{ exam?.name }}</div>
          <div class="countdown" :class="{ warning: remainingTime < 600 }">
            <van-icon name="clock-o" />
            <span>{{ formattedTime }}</span>
          </div>
        </div>
      </template>
      <template #right>
        <van-button type="primary" size="small" @click="showAnswerSheet = true">
          答题卡
        </van-button>
      </template>
    </van-nav-bar>

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading-wrapper" vertical>加载中...</van-loading>

    <!-- 主内容区 -->
    <div v-else class="content">
      <!-- 题目信息栏 -->
      <div class="question-info">
        <div class="question-number">
          <span class="current">{{ currentQuestionIndex + 1 }}</span>
          <span class="separator">/</span>
          <span class="total">{{ questions.length }}</span>
        </div>
        <div class="question-type">
          <van-tag :type="getQuestionTypeColor(currentQuestion.type)">
            {{ currentQuestion.typeName }}
          </van-tag>
          <span class="score">{{ currentQuestion.score }}分</span>
        </div>
      </div>

      <!-- 题目内容 -->
      <div class="question-content">
        <div class="question-text" v-html="formatQuestionContent(currentQuestion.content)"></div>
      </div>

      <!-- 答题区域（根据题型动态渲染） -->
      <div class="answer-area">
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
      </div>

      <!-- 标记按钮 -->
      <div class="mark-section">
        <van-button
          :type="isMarked ? 'warning' : 'default'"
          :icon="isMarked ? 'star' : 'star-o'"
          block
          @click="handleToggleMark"
        >
          {{ isMarked ? '已标记' : '标记本题' }}
        </van-button>
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
      :style="{ width: '85%', height: '100%' }"
    >
      <div class="answer-sheet">
        <div class="sheet-header">
          <div class="sheet-title">答题卡</div>
          <van-icon name="cross" @click="showAnswerSheet = false" />
        </div>

        <div class="sheet-stats">
          <div class="stat-item">
            <div class="stat-value">{{ answeredCount }}</div>
            <div class="stat-label">已答</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ unansweredCount }}</div>
            <div class="stat-label">未答</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ markedCount }}</div>
            <div class="stat-label">标记</div>
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
              marked: marked.includes(question.id),
            }"
            @click="handleJumpToQuestion(index)"
          >
            <div class="item-number">{{ index + 1 }}</div>
            <van-icon v-if="marked.includes(question.id)" name="star" class="mark-icon" />
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
const marked = computed(() => answerStore.marked)
const remainingTime = computed(() => answerStore.remainingTime)
const formattedTime = computed(() => answerStore.formattedTime)
const answeredCount = computed(() => answerStore.answeredCount)
const unansweredCount = computed(() => answerStore.unansweredCount)
const markedCount = computed(() => marked.value.length)

// 当前题目的答案
const currentAnswer = computed(() => {
  return answers.value[currentQuestion.value?.id] || getDefaultAnswer(currentQuestion.value?.type)
})

// 当前题目是否被标记
const isMarked = computed(() => {
  return marked.value.includes(currentQuestion.value?.id)
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
      return {}
    case 'essay':
      return ''
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
  }
  return colorMap[type] || 'default'
}

// 格式化题目内容（处理换行等）
const formatQuestionContent = (content) => {
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

// 标记/取消标记
const handleToggleMark = () => {
  answerStore.toggleMark(currentQuestion.value.id)
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.exam-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #00B96B;
  font-weight: 600;
}

.countdown.warning {
  color: #F53F3F;
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

/* 主内容 */
.content {
  padding: 12px;
}

/* 题目信息栏 */
.question-info {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-number {
  font-size: 24px;
  font-weight: 600;
}

.question-number .current {
  color: #00B96B;
}

.question-number .separator {
  color: #C9CDD4;
  margin: 0 4px;
}

.question-number .total {
  color: #86909c;
  font-size: 18px;
}

.question-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score {
  font-size: 14px;
  color: #F77234;
  font-weight: 600;
}

/* 题目内容 */
.question-content {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
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
  padding: 20px;
  margin-bottom: 12px;
  min-height: 200px;
}

/* 标记区域 */
.mark-section {
  margin-bottom: 12px;
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
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e5e6eb;
}

.sheet-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.sheet-header .van-icon {
  font-size: 20px;
  color: #86909c;
}

.sheet-stats {
  display: flex;
  padding: 16px;
  background: white;
  margin-bottom: 12px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #00B96B;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
}

.sheet-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
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
  border: 2px solid transparent;
  cursor: pointer;
}

.sheet-item.active {
  border-color: #00B96B;
  background: #E8F9F0;
}

.sheet-item.answered {
  background: #00B96B;
  color: white;
}

.sheet-item.marked::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 20px 20px 0;
  border-color: transparent #FF7D00 transparent transparent;
}

.item-number {
  font-size: 16px;
  font-weight: 600;
}

.mark-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 12px;
  color: #FF7D00;
}

.sheet-footer {
  padding: 12px;
  background: white;
  border-top: 1px solid #e5e6eb;
}
</style>
