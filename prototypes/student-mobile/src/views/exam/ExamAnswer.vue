<template>
  <div class="exam-answer-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar fixed placeholder>
      <template #left>
        <div v-if="!loading && currentQuestion" class="nav-countdown" :class="{ 'countdown-warning': remainingTime < 600, 'countdown-danger': remainingTime < 60 }">
          <van-icon name="clock-o" />
          <span>{{ formattedTime }}</span>
        </div>
      </template>
      <template #title>
        <span class="nav-title">{{ exam?.name }}</span>
      </template>
      <template #right>
        <div class="nav-sheet-btn" @click="showAnswerSheet = true">
          <van-icon name="apps-o" />
          <span>答题卡</span>
        </div>
      </template>
    </van-nav-bar>

    <!-- 题目信息栏 -->
    <div v-if="!loading && currentQuestion" class="question-bar">
      <div class="bar-left">
        <span class="question-index">{{ currentQuestionIndex + 1 }}</span>
        <span class="question-total">/{{ questions.length }}</span>
        <span class="type-label" :style="{ color: getQuestionTypeTextColor(currentQuestion.type) }">{{ currentQuestion.typeName }}</span>
      </div>
      <div class="bar-right">
        <span class="score">{{ currentQuestion.score }}分</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading-wrapper" vertical>加载中...</van-loading>

    <!-- 主内容区 -->
    <div
      v-else
      class="content"
      @touchstart="onContentTouchStart"
      @touchmove="onContentTouchMove"
      @touchend="onContentTouchEnd"
    >
      <!-- 题目内容 -->
      <div class="question-content">
        <!-- 完形填空：空位渲染为可点击标记 -->
        <div v-if="currentQuestion.type === 'cloze'" class="question-text">
          <template v-for="(segment, idx) in clozeSegments" :key="idx">
            <span v-if="segment.type === 'text'" v-html="segment.text"></span>
            <span
              v-else
              class="cloze-blank"
              :class="{
                'blank-answered': currentAnswer[segment.blankId],
                'blank-empty': !currentAnswer[segment.blankId]
              }"
              @click="openClozeAtBlank(segment.index)"
            >{{ currentAnswer[segment.blankId] ? currentAnswer[segment.blankId] : '第' + (segment.index + 1) + '空' }}</span>
          </template>
        </div>
        <!-- 复合题：显示材料 -->
        <div v-else-if="currentQuestion.type === 'composite'" class="question-text" v-html="formatQuestionContent(currentQuestion.material)"></div>
        <!-- 其他题型 -->
        <div v-else class="question-text" v-html="formatQuestionContent(currentQuestion.content)"></div>
      </div>

      <!-- 答题区域（普通题型直接显示） -->
      <div v-if="!isClozeOrComposite" class="answer-area">
        <SingleChoice
          v-if="currentQuestion.type === 'single'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
        />
        <MultipleChoice
          v-else-if="currentQuestion.type === 'multiple'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
        />
        <JudgeQuestion
          v-else-if="currentQuestion.type === 'judge'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
        />
        <BlankQuestion
          v-else-if="currentQuestion.type === 'blank'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
        />
        <EssayQuestion
          v-else-if="currentQuestion.type === 'essay'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
        />
      </div>

      <!-- 完形填空/复合题：全屏弹出面板 -->
      <ClozeQuestion
        v-if="currentQuestion.type === 'cloze'"
        ref="clozeRef"
        :question="currentQuestion"
        :value="currentAnswer"
        @update:value="handleAnswerChange"
      />
      <CompositeQuestion
        v-if="currentQuestion.type === 'composite'"
        ref="compositeRef"
        :question="currentQuestion"
        :value="currentAnswer"
        @update:value="handleAnswerChange"
      />
    </div>

    <!-- 完形填空/复合题：悬浮"开始作答"按钮 -->
    <div v-if="!loading && currentQuestion && isClozeOrComposite" class="floating-answer-btn" @click="openAnswerPanel">
      <van-icon name="edit" />
      <span>侧滑/点击作答</span>
      <span class="answer-progress">{{ clozeOrCompositeProgress }}</span>
    </div>

    <!-- 底部导航（所有题型统一） -->
    <div v-if="!loading && currentQuestion" class="bottom-nav safe-area-bottom">
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

    <!-- 答题卡弹窗 -->
    <van-popup
      v-model:show="showAnswerSheet"
      position="bottom"
      round
      :style="{ height: '75vh' }"
      :lock-scroll="true"
      :close-on-click-overlay="true"
    >
      <div class="answer-sheet">
        <!-- 头部：标题 + 统计 + 关闭 -->
        <div class="sheet-header">
          <div class="sheet-header-left">
            <div class="sheet-title">答题卡</div>
            <div class="sheet-stats-inline">
              <span class="stat-dot answered"></span>
              <span class="stat-text">已答 <b>{{ answeredCount }}</b></span>
              <span class="stat-dot unanswered"></span>
              <span class="stat-text">未答 <b>{{ unansweredCount }}</b></span>
              <span class="stat-dot total"></span>
              <span class="stat-text">共 <b>{{ questions.length }}</b></span>
            </div>
          </div>
          <van-icon name="cross" class="close-icon" @click="showAnswerSheet = false" />
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
                class="sheet-item"
                :class="{
                  active: item.originalIndex === currentQuestionIndex,
                  answered: answers[item.id],
                }"
                @click="handleJumpToQuestion(item.originalIndex)"
              >
                {{ item.originalIndex + 1 }}
              </div>
            </div>
          </div>
        </div>

        <!-- 底部提交 -->
        <div class="sheet-footer">
          <van-button type="success" size="large" block round @click="handleSubmit">
            提交试卷
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 随机抓拍遮罩 -->
    <CaptureOverlay
      ref="captureOverlayRef"
      :total-captures="captureConfig.count"
      @captured="onCaptured"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onActivated, onDeactivated, watch } from 'vue'
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
import CaptureOverlay from './components/CaptureOverlay.vue'

const route = useRoute()
const router = useRouter()
const examStore = useExamStore()
const answerStore = useAnswerStore()

const loading = ref(true)
const showAnswerSheet = ref(false)

// 组件引用
const clozeRef = ref(null)
const compositeRef = ref(null)
const captureOverlayRef = ref(null)

// 随机抓拍配置
const captureConfig = ref({ enabled: false, count: 3 })
const captureTimers = ref([])
const captureResults = ref([]) // 记录抓拍结果

// 最短答题时间
const examStartedAt = ref(0) // 进入答题的时间戳
const minAnswerTime = ref(0) // 最短答题时间（分钟）

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

// 按题型分组的题目列表（保留原始索引）
const groupedQuestions = computed(() => {
  const groups = []
  const groupMap = new Map()

  questions.value.forEach((q, index) => {
    const key = q.type
    if (!groupMap.has(key)) {
      const group = { type: key, typeName: q.typeName, items: [] }
      groupMap.set(key, group)
      groups.push(group)
    }
    groupMap.get(key).items.push({ ...q, originalIndex: index })
  })

  return groups
})

// 当前题目的答案
const currentAnswer = computed(() => {
  return answers.value[currentQuestion.value?.id] || getDefaultAnswer(currentQuestion.value?.type)
})

// 是否为完形填空或复合题
const isClozeOrComposite = computed(() => {
  return currentQuestion.value?.type === 'cloze' || currentQuestion.value?.type === 'composite'
})

// 完形填空题干分段（文本 + 空位标记交替）
const clozeSegments = computed(() => {
  if (currentQuestion.value?.type !== 'cloze') return []

  const content = currentQuestion.value.content || ''
  const blanks = currentQuestion.value.blanks || []
  const segments = []

  // 按 ____（下划线）或 [空X] 标记拆分题干
  // 简单实现：按连续下划线拆分
  const parts = content.split(/(_{2,}|\[空\d+\])/)
  let blankIdx = 0

  parts.forEach(part => {
    if (/^_{2,}$/.test(part) || /^\[空\d+\]$/.test(part)) {
      if (blankIdx < blanks.length) {
        segments.push({
          type: 'blank',
          index: blankIdx,
          blankId: blanks[blankIdx].id,
        })
        blankIdx++
      }
    } else if (part) {
      segments.push({
        type: 'text',
        text: part.replace(/\n/g, '<br>'),
      })
    }
  })

  // 如果没有匹配到下划线，说明题干格式不同，为每个空位追加标记
  if (blankIdx === 0 && blanks.length > 0) {
    segments.length = 0
    segments.push({
      type: 'text',
      text: content.replace(/\n/g, '<br>'),
    })
    blanks.forEach((blank, idx) => {
      segments.push({
        type: 'blank',
        index: idx,
        blankId: blank.id,
      })
    })
  }

  return segments
})

// 完形填空/复合题的作答进度
const clozeOrCompositeProgress = computed(() => {
  if (!currentQuestion.value) return ''
  const answer = currentAnswer.value || {}

  if (currentQuestion.value.type === 'cloze') {
    const blanks = currentQuestion.value.blanks || []
    const answered = blanks.filter(b => answer[b.id]).length
    return `${answered}/${blanks.length}`
  }

  if (currentQuestion.value.type === 'composite') {
    const subs = currentQuestion.value.subQuestions || []
    const answered = subs.filter(s => {
      const a = answer[s.id]
      if (!a) return false
      if (s.type === 'essay') return (a.text && a.text.trim()) || (a.attachments && a.attachments.length > 0)
      if (s.type === 'blank') {
        if (typeof a === 'object' && !Array.isArray(a)) {
          return Object.values(a).some(v => v && String(v).trim())
        }
        return false
      }
      if (Array.isArray(a)) return a.length > 0
      return !!a
    }).length
    return `${answered}/${subs.length}`
  }

  return ''
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

// 获取题型文字颜色
const getQuestionTypeTextColor = (type) => {
  const colorMap = {
    single: '#165DFF',
    multiple: '#00B96B',
    judge: '#F77234',
    blank: '#E93B77',
    essay: '#722ED1',
    cloze: '#3491FA',
    composite: '#F5319D',
  }
  return colorMap[type] || '#86909C'
}

// 格式化题目内容
const formatQuestionContent = (content) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>')
}

// 打开答题面板
const openAnswerPanel = () => {
  if (currentQuestion.value?.type === 'cloze') {
    clozeRef.value?.showPanel()
  } else if (currentQuestion.value?.type === 'composite') {
    compositeRef.value?.showPanel()
  }
}

// 点击完形填空空位，打开面板并定位
const openClozeAtBlank = (blankIndex) => {
  clozeRef.value?.openAtBlank(blankIndex)
}

// 内容区左滑展开答题面板
const contentTouchStartX = ref(0)
const contentTouchStartY = ref(0)
const contentSwiping = ref(false)

const onContentTouchStart = (e) => {
  contentTouchStartX.value = e.touches[0].clientX
  contentTouchStartY.value = e.touches[0].clientY
  contentSwiping.value = false
}

const onContentTouchMove = (e) => {
  if (!isClozeOrComposite.value) return
  const deltaX = contentTouchStartX.value - e.touches[0].clientX
  const deltaY = Math.abs(e.touches[0].clientY - contentTouchStartY.value)
  // 左滑（deltaX > 0）且水平距离大于垂直距离
  if (deltaX > 20 && deltaX > deltaY) {
    contentSwiping.value = true
  }
}

const onContentTouchEnd = (e) => {
  if (!contentSwiping.value || !isClozeOrComposite.value) return
  const deltaX = contentTouchStartX.value - e.changedTouches[0].clientX
  // 左滑超过 80px 展开面板
  if (deltaX > 80) {
    openAnswerPanel()
  }
  contentSwiping.value = false
}

// 加载考试数据
const loadExamData = async () => {
  loading.value = true
  try {
    const examId = route.params.id
    const data = await enterExam(examId)
    examStore.currentExam = data
    examStore.currentPaper = data.paper
    answerStore.initAnswer(examId, data.paper.id, data.duration)

    // 记录答题开始时间和最短答题时间
    examStartedAt.value = Date.now()
    minAnswerTime.value = data.config?.minAnswerTime || 0

    // 初始化随机抓拍
    if (data.config?.enableRandomCapture) {
      captureConfig.value = {
        enabled: true,
        count: data.config.captureCount || 3,
      }
      scheduleCaptureTimers(data.duration)
    }
  } catch (error) {
    showToast('加载失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 调度随机抓拍定时器
const scheduleCaptureTimers = (durationMinutes, count = null, startIndex = 0) => {
  clearCaptureTimers()
  const totalSeconds = durationMinutes * 60
  const captureCount = count ?? captureConfig.value.count

  if (captureCount <= 0 || totalSeconds <= 0) return

  // 首次抓拍不早于开考后 60 秒，末次不晚于结束前 120 秒
  const minStart = Math.min(60, totalSeconds * 0.1)
  const maxEnd = Math.max(totalSeconds - 120, minStart + captureCount * 30)
  const usableRange = maxEnd - minStart
  const segmentSize = Math.floor(usableRange / captureCount)

  for (let i = 0; i < captureCount; i++) {
    const segStart = minStart + i * segmentSize
    const segEnd = segStart + segmentSize
    // 在区间内随机取一个时间点（秒）
    const randomDelay = segStart + Math.floor(Math.random() * (segEnd - segStart))

    const captureIndex = startIndex + i + 1
    const timer = setTimeout(() => {
      triggerCapture(captureIndex)
    }, randomDelay * 1000)

    captureTimers.value.push(timer)
  }
}

// 触发一次抓拍
const triggerCapture = (index) => {
  captureOverlayRef.value?.startCapture(index)
}

// 抓拍完成回调
const onCaptured = (index) => {
  captureResults.value.push({
    index,
    time: new Date().toISOString(),
    status: 'success',
  })
}

// 清理抓拍定时器
const clearCaptureTimers = () => {
  captureTimers.value.forEach(timer => clearTimeout(timer))
  captureTimers.value = []
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

// 提交试卷
const handleSubmit = async () => {
  // 最短答题时间检查
  if (minAnswerTime.value > 0) {
    const elapsed = Date.now() - examStartedAt.value
    const minMs = minAnswerTime.value * 60 * 1000
    if (elapsed < minMs) {
      const remainMin = Math.ceil((minMs - elapsed) / (60 * 1000))
      showConfirmDialog({
        title: '无法提交',
        message: `最短答题时间为 ${minAnswerTime.value} 分钟，还需 ${remainMin} 分钟后才能提交，请继续作答。`,
        showCancelButton: false,
        confirmButtonText: '继续答题',
        confirmButtonColor: '#00B96B',
      })
      return
    }
  }

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
    router.push(`/exam/success/${exam.value.id}`)
  } catch {
    // 取消提交
  }
}

// 监听剩余时间
watch(remainingTime, (newTime) => {
  if (newTime === 0) {
    showToast('考试时间已到，自动提交')
    setTimeout(() => {
      router.push(`/exam/success/${exam.value.id}`)
    }, 1500)
  } else if (newTime === 300) {
    showToast('剩余时间5分钟')
  } else if (newTime === 60) {
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
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// keepAlive 激活时重新调度剩余抓拍
onActivated(() => {
  if (captureConfig.value.enabled && captureResults.value.length < captureConfig.value.count) {
    const remaining = answerStore.remainingTime
    if (remaining > 0) {
      const done = captureResults.value.length
      const left = captureConfig.value.count - done
      const remainMin = remaining / 60
      scheduleCaptureTimers(remainMin, left, done)
    }
  }
})

// keepAlive 停用时清理定时器，防止在其他页面触发抓拍
onDeactivated(() => {
  clearCaptureTimers()
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  clearCaptureTimers()
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
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 导航栏答题卡按钮 */
.nav-sheet-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #E6F7F0;
  color: #00B96B;
  font-size: 13px;
  font-weight: 600;
  border-radius: 16px;
  cursor: pointer;
}

.nav-sheet-btn:active {
  opacity: 0.7;
}

.nav-sheet-btn .van-icon {
  font-size: 15px;
}

/* 导航栏倒计时 */
.nav-countdown {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #E8F8F0;
  color: #00B96B;
  font-size: 14px;
  font-weight: 700;
  border-radius: 16px;
  font-variant-numeric: tabular-nums;
}

.nav-countdown .van-icon {
  font-size: 15px;
  color: inherit !important;
}

.nav-countdown.countdown-warning {
  background: #FFF3E0;
  color: #F77234;
  animation: countdown-pulse 1.5s ease-in-out infinite;
}

.nav-countdown.countdown-danger {
  background: #FFEBEE;
  color: #F53F3F;
  animation: countdown-pulse 0.8s ease-in-out infinite;
}

@keyframes countdown-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* 题目信息栏 */
.question-bar {
  position: fixed;
  top: 46px;
  left: 0;
  right: 0;
  height: 40px;
  background: #ffffff;
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

.type-label {
  margin-left: 4px;
  font-size: 13px;
  font-weight: 600;
}

.bar-right {
  display: flex;
  align-items: center;
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
  padding-top: 48px;
  padding-bottom: 80px;
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

.question-text {
  font-size: 16px;
  line-height: 1.8;
  color: #1d2129;
}

/* 完形填空空位标记 */
.cloze-blank {
  display: inline-block;
  padding: 2px 12px;
  margin: 2px 4px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  vertical-align: baseline;
}

.blank-empty {
  background: #F2F3F5;
  color: #86909C;
  border: 1px dashed #C9CDD4;
}

.blank-empty:active {
  background: #E8F5EE;
  border-color: #00B96B;
}

.blank-answered {
  background: #E8F5EE;
  color: #00B96B;
  border: 1px solid #00B96B;
}

.blank-answered:active {
  background: #D1FAE5;
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

/* 悬浮"开始作答"按钮 */
.floating-answer-btn {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #00B96B 0%, #00A15D 100%);
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 600;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(0, 185, 107, 0.35);
  cursor: pointer;
  z-index: 99;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.floating-answer-btn:active {
  transform: translateX(-50%) scale(0.95);
  box-shadow: 0 2px 8px rgba(0, 185, 107, 0.3);
}

.floating-answer-btn .van-icon {
  font-size: 16px;
}

.floating-answer-btn .answer-progress {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.25);
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 2px;
}

/* 答题卡 */
.answer-sheet {
  height: 75vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  overflow: hidden;
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: white;
  border-bottom: 1px solid #f0f1f2;
  flex-shrink: 0;
}

.sheet-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sheet-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.sheet-stats-inline {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #86909c;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 6px;
}

.stat-dot:first-child {
  margin-left: 0;
}

.stat-dot.answered {
  background: #00B96B;
}

.stat-dot.unanswered {
  background: #E5E6EB;
}

.stat-dot.total {
  background: #165DFF;
}

.stat-text b {
  font-weight: 600;
  color: #4e5969;
}

.close-icon {
  font-size: 20px;
  color: #86909c;
  cursor: pointer;
  padding: 4px;
}

.close-icon:active {
  transform: scale(0.9);
}

/* 分组内容 */
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

.sheet-item {
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
  border: 1.5px solid #e5e6eb;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sheet-item:active {
  transform: scale(0.92);
}

.sheet-item.active {
  border-color: #00B96B;
  color: #00B96B;
  background: #f0faf5;
  font-weight: 600;
}

.sheet-item.answered {
  background: #00B96B;
  border-color: #00B96B;
  color: white;
  font-weight: 600;
}

.sheet-item.answered.active {
  background: #009456;
  border-color: #009456;
  box-shadow: 0 0 0 2px rgba(0, 185, 107, 0.2);
}

.sheet-footer {
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #f0f1f2;
  flex-shrink: 0;
}

.sheet-footer :deep(.van-button--success) {
  background: #00B96B;
  border-color: #00B96B;
}
</style>
