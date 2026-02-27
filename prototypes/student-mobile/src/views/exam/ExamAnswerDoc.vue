<template>
  <div class="exam-answer-doc-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar fixed placeholder>
      <template #left>
        <div v-if="!loading" class="nav-countdown" :class="{ 'countdown-warning': remainingTime < 600, 'countdown-danger': remainingTime < 60 }">
          <van-icon name="clock-o" />
          <span>{{ formattedTime }}</span>
        </div>
      </template>
      <template #title>
        <span class="nav-title">{{ exam?.name }}</span>
      </template>
      <template #right>
      </template>
    </van-nav-bar>

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading-wrapper" vertical>加载中...</van-loading>

    <!-- 上下分屏主体 -->
    <div v-else class="split-container" :style="{ '--split-ratio': splitRatio + '%' }">
      <!-- 上半区：文档预览 -->
      <div class="doc-area">
        <div class="doc-scroll-wrapper">
          <div v-for="(page, idx) in docPages" :key="idx" class="doc-page-html" v-html="page"></div>
        </div>
      </div>

      <!-- 可拖拽分隔条 -->
      <div class="split-divider" @touchstart.prevent="onDividerTouchStart" @touchmove.prevent="onDividerTouchMove" @touchend="onDividerTouchEnd" @mousedown.prevent="onDividerMouseDown">
        <div class="divider-handle"></div>
      </div>

      <!-- 下半区：答题面板 -->
      <div class="answer-area">
        <div class="answer-scroll-wrapper">
          <!-- 按题型分组 -->
          <div v-for="group in groupedQuestions" :key="group.type" class="type-group">
            <div class="type-group-header">
              <span class="type-group-dot" :style="{ background: getTypeColor(group.type) }"></span>
              <span class="type-group-name">{{ group.typeName }}</span>
              <span class="type-group-count">{{ group.items.length }}题</span>
            </div>
            <div v-for="item in group.items" :key="item.id" class="compact-row">
              <!-- 单选题 -->
              <template v-if="item.type === 'single'">
                <div class="row-label">
                  <span class="row-idx">{{ item.originalIndex + 1 }}</span>
                  <span class="row-score">{{ item.score }}分</span>
                </div>
                <div class="row-opts">
                  <span v-for="opt in item.options" :key="opt.label" class="opt-btn" :class="{ selected: answers[item.id] === opt.label }" @click="handleAnswerChange(item.id, answers[item.id] === opt.label ? '' : opt.label)">{{ opt.label }}</span>
                </div>
              </template>
              <!-- 多选题 -->
              <template v-else-if="item.type === 'multiple'">
                <div class="row-label">
                  <span class="row-idx">{{ item.originalIndex + 1 }}</span>
                  <span class="row-score">{{ item.score }}分</span>
                </div>
                <div class="row-opts">
                  <span v-for="opt in item.options" :key="opt.label" class="opt-btn" :class="{ selected: (answers[item.id] || []).includes(opt.label) }" @click="toggleMultiple(item.id, opt.label)">{{ opt.label }}</span>
                </div>
              </template>
              <!-- 判断题 -->
              <template v-else-if="item.type === 'judge'">
                <div class="row-label">
                  <span class="row-idx">{{ item.originalIndex + 1 }}</span>
                  <span class="row-score">{{ item.score }}分</span>
                </div>
                <div class="row-opts">
                  <span class="opt-btn judge-btn" :class="{ selected: answers[item.id] === true }" @click="handleAnswerChange(item.id, answers[item.id] === true ? '' : true)">✓</span>
                  <span class="opt-btn judge-btn" :class="{ selected: answers[item.id] === false }" @click="handleAnswerChange(item.id, answers[item.id] === false ? '' : false)">✗</span>
                </div>
              </template>
              <!-- 填空题 -->
              <template v-else-if="item.type === 'blank'">
                <div class="row-label">
                  <span class="row-idx">{{ item.originalIndex + 1 }}</span>
                  <span class="row-score">{{ item.score }}分</span>
                </div>
                <div class="row-blanks-vertical">
                  <div v-for="(blank, bi) in (item.blanks || [])" :key="blank.id" class="blank-line">
                    <span class="blank-line-label">第{{ bi + 1 }}空</span>
                    <input class="blank-input" :placeholder="'请输入...'" :value="(answers[item.id] || {})[blank.id] || ''" @input="e => handleBlankInput(item.id, blank.id, e.target.value)" />
                  </div>
                </div>
              </template>
              <!-- 简答题 -->
              <template v-else-if="item.type === 'essay'">
                <div class="row-label full-width">
                  <span class="row-idx">{{ item.originalIndex + 1 }}</span>
                  <span class="row-score">{{ item.score }}分</span>
                </div>
                <div class="row-essay-full">
                  <EssayQuestion
                    :question="item"
                    :value="answers[item.id] || { text: '', attachments: [] }"
                    @update:value="v => handleAnswerChange(item.id, v)"
                  />
                </div>
              </template>
              <!-- 完形填空 -->
              <template v-else-if="item.type === 'cloze'">
                <div class="row-label full-width">
                  <span class="row-idx">{{ item.originalIndex + 1 }}</span>
                  <span class="row-score">{{ item.score }}分</span>
                </div>
                <div class="cloze-compact">
                  <div v-for="(blank, bi) in (item.blanks || [])" :key="blank.id" class="cloze-row">
                    <span class="cloze-num">{{ bi + 1 }}</span>
                    <div class="row-opts">
                      <span v-for="opt in (blank.options || [])" :key="opt.label" class="opt-btn" :class="{ selected: (answers[item.id] || {})[blank.id] === opt.label }" @click="handleClozeSelect(item.id, blank.id, opt.label)">{{ opt.label }}</span>
                    </div>
                  </div>
                </div>
              </template>
              <!-- 复合题 -->
              <template v-else-if="item.type === 'composite'">
                <div class="row-label full-width">
                  <span class="row-idx">{{ item.originalIndex + 1 }}</span>
                  <span class="row-score">{{ item.score }}分</span>
                </div>
                <div class="composite-compact">
                  <div v-for="(sub, si) in (item.subQuestions || [])" :key="sub.id" class="sub-row">
                    <template v-if="sub.type === 'single'">
                      <div class="sub-label"><span class="sub-idx">{{ item.originalIndex + 1 }}-{{ si + 1 }}</span><span class="sub-type-tag">单选</span><span class="row-score">{{ sub.score }}分</span></div>
                      <div class="row-opts">
                        <span v-for="opt in sub.options" :key="opt.label" class="opt-btn" :class="{ selected: (answers[item.id] || {})[sub.id] === opt.label }" @click="handleCompositeAnswer(item.id, sub.id, (answers[item.id] || {})[sub.id] === opt.label ? '' : opt.label)">{{ opt.label }}</span>
                      </div>
                    </template>
                    <template v-else-if="sub.type === 'multiple'">
                      <div class="sub-label"><span class="sub-idx">{{ item.originalIndex + 1 }}-{{ si + 1 }}</span><span class="sub-type-tag">多选</span><span class="row-score">{{ sub.score }}分</span></div>
                      <div class="row-opts">
                        <span v-for="opt in sub.options" :key="opt.label" class="opt-btn" :class="{ selected: ((answers[item.id] || {})[sub.id] || []).includes(opt.label) }" @click="toggleCompositeMultiple(item.id, sub.id, opt.label)">{{ opt.label }}</span>
                      </div>
                    </template>
                    <template v-else-if="sub.type === 'judge'">
                      <div class="sub-label"><span class="sub-idx">{{ item.originalIndex + 1 }}-{{ si + 1 }}</span><span class="sub-type-tag">判断</span><span class="row-score">{{ sub.score }}分</span></div>
                      <div class="row-opts">
                        <span class="opt-btn judge-btn" :class="{ selected: (answers[item.id] || {})[sub.id] === true }" @click="handleCompositeAnswer(item.id, sub.id, (answers[item.id] || {})[sub.id] === true ? '' : true)">✓</span>
                        <span class="opt-btn judge-btn" :class="{ selected: (answers[item.id] || {})[sub.id] === false }" @click="handleCompositeAnswer(item.id, sub.id, (answers[item.id] || {})[sub.id] === false ? '' : false)">✗</span>
                      </div>
                    </template>
                    <template v-else-if="sub.type === 'blank'">
                      <div class="sub-label"><span class="sub-idx">{{ item.originalIndex + 1 }}-{{ si + 1 }}</span><span class="sub-type-tag">填空</span><span class="row-score">{{ sub.score }}分</span></div>
                      <div class="row-blanks-vertical">
                        <div v-for="(blank, sbi) in (sub.blanks || [])" :key="blank.id" class="blank-line">
                          <span class="blank-line-label">第{{ sbi + 1 }}空</span>
                          <input class="blank-input" placeholder="请输入..." :value="getCompositeBlankValue(item.id, sub.id, blank.id)" @input="e => handleCompositeBlankInput(item.id, sub.id, blank.id, e.target.value)" />
                        </div>
                      </div>
                    </template>
                    <template v-else-if="sub.type === 'essay'">
                      <div class="sub-label full-width"><span class="sub-idx">{{ item.originalIndex + 1 }}-{{ si + 1 }}</span><span class="sub-type-tag">简答</span><span class="row-score">{{ sub.score }}分</span></div>
                      <div class="row-essay-full">
                        <EssayQuestion
                          :question="sub"
                          :value="(answers[item.id] || {})[sub.id] || { text: '', attachments: [] }"
                          @update:value="v => handleCompositeAnswer(item.id, sub.id, v)"
                        />
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部统计+提交 -->
    <div v-if="!loading" class="bottom-submit">
      <div class="bottom-stats">
        <span class="stat-dot answered"></span>
        <span class="stat-text">已答 <b>{{ answeredCount }}</b></span>
        <span class="stat-dot unanswered"></span>
        <span class="stat-text">未答 <b>{{ unansweredCount }}</b></span>
        <span class="stat-dot total"></span>
        <span class="stat-text">共 <b>{{ questions.length }}</b></span>
      </div>
      <van-button type="success" size="large" block round @click="handleSubmit">
        提交试卷
      </van-button>
    </div>

    <!-- 随机抓拍遮罩 -->
    <CaptureOverlay ref="captureOverlayRef" :total-captures="captureConfig.count" @captured="onCaptured" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onActivated, onDeactivated, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExamStore, useAnswerStore } from '@/stores'
import { enterExam } from '@/api/exam'
import { showToast, showConfirmDialog } from 'vant'
import CaptureOverlay from './components/CaptureOverlay.vue'
import EssayQuestion from './components/EssayQuestion.vue'

const route = useRoute()
const router = useRouter()
const examStore = useExamStore()
const answerStore = useAnswerStore()

const loading = ref(true)
const docPages = ref([])
const splitRatio = ref(55)
const isDragging = ref(false)
const dragStartY = ref(0)
const dragStartRatio = ref(55)

// 抓拍
const captureOverlayRef = ref(null)
const captureConfig = ref({ enabled: false, count: 3 })
const captureTimers = ref([])
const captureResults = ref([])
const examStartedAt = ref(0)
const minAnswerTime = ref(0)

// 计算属性
const exam = computed(() => examStore.currentExam)
const questions = computed(() => answerStore.questions)
const answers = computed(() => answerStore.answers)
const remainingTime = computed(() => answerStore.remainingTime)
const formattedTime = computed(() => answerStore.formattedTime)
const answeredCount = computed(() => answerStore.answeredCount)
const unansweredCount = computed(() => answerStore.unansweredCount)

// 按题型分组（答题卡用）
const groupedQuestions = computed(() => {
  const groups = []
  const groupMap = new Map()
  questions.value.forEach((q, index) => {
    if (!groupMap.has(q.type)) {
      const group = { type: q.type, typeName: q.typeName, items: [] }
      groupMap.set(q.type, group)
      groups.push(group)
    }
    groupMap.get(q.type).items.push({ ...q, originalIndex: index })
  })
  return groups
})

// 题型颜色
const getTypeColor = (type) => {
  const map = { single: '#165DFF', multiple: '#00B96B', judge: '#F77234', blank: '#E93B77', essay: '#722ED1', cloze: '#3491FA', composite: '#F5319D' }
  return map[type] || '#86909C'
}

// 答案操作
const handleAnswerChange = (qid, value) => answerStore.saveAnswer(qid, value)

const toggleMultiple = (qid, label) => {
  const current = answers.value[qid] || []
  const idx = current.indexOf(label)
  const updated = idx >= 0 ? current.filter(l => l !== label) : [...current, label]
  answerStore.saveAnswer(qid, updated)
}

const handleBlankInput = (qid, blankId, value) => {
  const current = answers.value[qid] || {}
  answerStore.saveAnswer(qid, { ...current, [blankId]: value })
}

const handleClozeSelect = (qid, blankId, label) => {
  const current = answers.value[qid] || {}
  answerStore.saveAnswer(qid, { ...current, [blankId]: current[blankId] === label ? '' : label })
}

const handleCompositeAnswer = (qid, subId, value) => {
  const current = answers.value[qid] || {}
  answerStore.saveAnswer(qid, { ...current, [subId]: value })
}

const toggleCompositeMultiple = (qid, subId, label) => {
  const current = (answers.value[qid] || {})[subId] || []
  const idx = current.indexOf(label)
  const updated = idx >= 0 ? current.filter(l => l !== label) : [...current, label]
  handleCompositeAnswer(qid, subId, updated)
}

const getCompositeBlankValue = (qid, subId, blankId) => {
  const subAns = (answers.value[qid] || {})[subId]
  return (subAns || {})[blankId] || ''
}

const handleCompositeBlankInput = (qid, subId, blankId, value) => {
  const subAns = (answers.value[qid] || {})[subId] || {}
  handleCompositeAnswer(qid, subId, { ...subAns, [blankId]: value })
}

const getCompositeEssayText = (qid, subId) => {
  const subAns = (answers.value[qid] || {})[subId]
  return (subAns || {}).text || ''
}

// 拖拽分隔条
const containerHeight = () => window.innerHeight - 46 - 50 // 减去导航栏和底部按钮

const onDividerTouchStart = (e) => {
  isDragging.value = true
  dragStartY.value = e.touches[0].clientY
  dragStartRatio.value = splitRatio.value
}

const onDividerTouchMove = (e) => {
  if (!isDragging.value) return
  const deltaY = e.touches[0].clientY - dragStartY.value
  const deltaRatio = (deltaY / containerHeight()) * 100
  splitRatio.value = Math.min(80, Math.max(20, dragStartRatio.value + deltaRatio))
}

const onDividerTouchEnd = () => { isDragging.value = false }

const onDividerMouseDown = (e) => {
  isDragging.value = true
  dragStartY.value = e.clientY
  dragStartRatio.value = splitRatio.value
  const onMouseMove = (ev) => {
    const deltaY = ev.clientY - dragStartY.value
    const deltaRatio = (deltaY / containerHeight()) * 100
    splitRatio.value = Math.min(80, Math.max(20, dragStartRatio.value + deltaRatio))
  }
  const onMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// 答题卡跳转（已移除答题卡）

// 加载考试数据
const loadExamData = async () => {
  loading.value = true
  try {
    const examId = route.params.id
    const data = await enterExam(examId)
    examStore.currentExam = data
    examStore.currentPaper = data.paper
    answerStore.initAnswer(examId, data.paper.id, data.duration)
    docPages.value = data.paper.documentPages || []
    examStartedAt.value = Date.now()
    minAnswerTime.value = data.config?.minAnswerTime || 0
    if (data.config?.enableRandomCapture) {
      captureConfig.value = { enabled: true, count: data.config.captureCount || 3 }
      scheduleCaptureTimers(data.duration)
    }
  } catch (error) {
    showToast('加载失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 调度随机抓拍
const scheduleCaptureTimers = (durationMinutes, count = null, startIndex = 0) => {
  clearCaptureTimers()
  const totalSeconds = durationMinutes * 60
  const captureCount = count ?? captureConfig.value.count
  if (captureCount <= 0 || totalSeconds <= 0) return
  const minStart = Math.min(60, totalSeconds * 0.1)
  const maxEnd = Math.max(totalSeconds - 120, minStart + captureCount * 30)
  const usableRange = maxEnd - minStart
  const segmentSize = Math.floor(usableRange / captureCount)
  for (let i = 0; i < captureCount; i++) {
    const segStart = minStart + i * segmentSize
    const segEnd = segStart + segmentSize
    const randomDelay = segStart + Math.floor(Math.random() * (segEnd - segStart))
    const captureIndex = startIndex + i + 1
    const timer = setTimeout(() => { captureOverlayRef.value?.startCapture(captureIndex) }, randomDelay * 1000)
    captureTimers.value.push(timer)
  }
}

const onCaptured = (index) => { captureResults.value.push({ index, time: new Date().toISOString(), status: 'success' }) }
const clearCaptureTimers = () => { captureTimers.value.forEach(t => clearTimeout(t)); captureTimers.value = [] }

// 提交试卷
const handleSubmit = async () => {
  if (minAnswerTime.value > 0) {
    const elapsed = Date.now() - examStartedAt.value
    const minMs = minAnswerTime.value * 60 * 1000
    if (elapsed < minMs) {
      const remainMin = Math.ceil((minMs - elapsed) / (60 * 1000))
      showConfirmDialog({ title: '无法提交', message: `最短答题时间为 ${minAnswerTime.value} 分钟，还需 ${remainMin} 分钟后才能提交。`, showCancelButton: false, confirmButtonText: '继续答题', confirmButtonColor: '#00B96B' })
      return
    }
  }
  if (unansweredCount.value > 0) {
    try { await showConfirmDialog({ title: '提示', message: `还有 ${unansweredCount.value} 题未作答，确定要提交吗？` }) } catch { return }
  }
  try {
    await showConfirmDialog({ title: '确认提交', message: '提交后将无法修改答案，确定要提交吗？' })
    router.push(`/exam/success/${exam.value.id}`)
  } catch { /* 取消 */ }
}

// 监听倒计时
watch(remainingTime, (t) => {
  if (t === 0) { showToast('考试时间已到，自动提交'); setTimeout(() => router.push(`/exam/success/${exam.value.id}`), 1500) }
  else if (t === 300) showToast('剩余时间5分钟')
  else if (t === 60) showToast('剩余时间1分钟')
})

const handleBeforeUnload = (e) => { e.preventDefault(); e.returnValue = '' }

// keepAlive 激活时重新调度剩余抓拍
onActivated(() => {
  if (captureConfig.value.enabled && captureResults.value.length < captureConfig.value.count) {
    const remaining = answerStore.remainingTime
    if (remaining > 0) {
      const done = captureResults.value.length
      const left = captureConfig.value.count - done
      scheduleCaptureTimers(remaining / 60, left, done)
    }
  }
})

// keepAlive 停用时清理定时器，防止在其他页面触发抓拍
onDeactivated(() => {
  clearCaptureTimers()
})

onMounted(() => { loadExamData(); window.addEventListener('beforeunload', handleBeforeUnload) })
onUnmounted(() => { window.removeEventListener('beforeunload', handleBeforeUnload); clearCaptureTimers() })
</script>

<style scoped>
.exam-answer-doc-page { height: 100vh; background: #f7f8fa; display: flex; flex-direction: column; max-width: 500px; margin: 0 auto; position: relative; box-shadow: 0 0 20px rgba(0,0,0,0.08); overflow: hidden; }

/* 导航栏 */
.nav-title { font-size: 16px; font-weight: 600; color: #1d2129; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nav-countdown { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: #E8F8F0; color: #00B96B; font-size: 14px; font-weight: 700; border-radius: 16px; font-variant-numeric: tabular-nums; }
.nav-countdown .van-icon { font-size: 15px; color: inherit !important; }
.nav-countdown.countdown-warning { background: #FFF3E0; color: #F77234; animation: countdown-pulse 1.5s ease-in-out infinite; }
.nav-countdown.countdown-danger { background: #FFEBEE; color: #F53F3F; animation: countdown-pulse 0.8s ease-in-out infinite; }
@keyframes countdown-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
.nav-sheet-btn { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: #00B96B; padding: 4px 10px; background: #E6F7F0; border-radius: 16px; cursor: pointer; }
.nav-sheet-btn:active { opacity: 0.7; }
.nav-sheet-btn .van-icon { font-size: 15px; }
.loading-wrapper { display: flex; justify-content: center; align-items: center; height: 60vh; }

/* 上下分屏 */
.split-container { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.doc-area { height: var(--split-ratio); overflow: hidden; }
.doc-scroll-wrapper { height: 100%; overflow-y: auto; -webkit-overflow-scrolling: touch; background: #fff; }
.answer-area { flex: 1; overflow: hidden; display: flex; flex-direction: column; background: #f0f9f4; position: relative; }
.answer-area::before { content: ''; position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E"); pointer-events: none; z-index: 0; }
.answer-area::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 2%, transparent 98%, rgba(0,0,0,0.03) 100%), linear-gradient(90deg, rgba(0,0,0,0.02) 0%, transparent 1.5%, transparent 98.5%, rgba(0,0,0,0.02) 100%); box-shadow: inset 0 0 30px rgba(0,0,0,0.03); pointer-events: none; z-index: 0; }
.answer-scroll-wrapper { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 0 12px; position: relative; z-index: 1; }

/* 分隔条 */
.split-divider { height: 20px; display: flex; align-items: center; justify-content: center; background: #F0F1F2; cursor: row-resize; flex-shrink: 0; user-select: none; touch-action: none; }
.divider-handle { width: 36px; height: 4px; background: #C9CDD4; border-radius: 2px; }

/* 底部统计+提交 */
.bottom-submit { padding: 8px 16px; padding-bottom: max(8px, env(safe-area-inset-bottom)); background: #fff; border-top: 1px solid #F0F1F2; flex-shrink: 0; }
.bottom-stats { display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 8px; font-size: 12px; color: #86909c; }
.bottom-stats .stat-dot { width: 8px; height: 8px; border-radius: 50%; margin-left: 6px; }
.bottom-stats .stat-dot:first-child { margin-left: 0; }
.bottom-stats .stat-dot.answered { background: #00B96B; }
.bottom-stats .stat-dot.unanswered { background: #E5E6EB; }
.bottom-stats .stat-dot.total { background: #165DFF; }
.bottom-stats .stat-text b { font-weight: 600; color: #4e5969; }
.bottom-submit :deep(.van-button--success) { background: #00B96B; border-color: #00B96B; }

/* 紧凑答题行 */
.compact-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid rgba(0,185,107,0.1); }
.compact-row:last-child { border-bottom: none; }
.row-label { display: flex; align-items: center; gap: 6px; min-width: 36px; flex-shrink: 0; }
.row-label.full-width { width: 100%; margin-bottom: 4px; }
.row-idx { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; background: #F5F6F7; border-radius: 5px; font-size: 12px; font-weight: 600; color: #4E5969; }
.row-score { font-size: 11px; color: #86909C; white-space: nowrap; }
.row-type { font-size: 12px; font-weight: 500; }
.row-opts { display: flex; gap: 6px; flex-wrap: wrap; }
.opt-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1.5px solid #E5E6EB; font-size: 14px; color: #4E5969; cursor: pointer; transition: all 0.15s; font-weight: 500; background: #fff; }
.opt-btn.selected { background: #00B96B; color: #fff; border-color: #00B96B; }
.opt-btn.judge-btn { width: 36px; font-size: 16px; }

/* 题型分组 */
.type-group { margin-bottom: 0; }
.type-group-header { display: flex; align-items: center; gap: 6px; padding: 4px 8px 2px; position: sticky; top: 0; background-color: #f0f9f4; background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E"); z-index: 1; }
.type-group-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.type-group-name { font-size: 13px; font-weight: 600; color: #1D2129; }
.type-group-count { font-size: 11px; color: #86909C; }

/* 填空 - 纵向一行一空 */
.row-blanks-vertical { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.blank-line { display: flex; align-items: center; gap: 8px; }
.blank-line-label { font-size: 12px; color: #86909C; white-space: nowrap; min-width: 40px; }
.blank-input { flex: 1; height: 32px; border: 1.5px solid #E5E6EB; border-radius: 6px; padding: 0 8px; font-size: 13px; color: #1D2129; outline: none; transition: border-color 0.2s; }
.blank-input:focus { border-color: #00B96B; }

/* 简答 - 全宽 EssayQuestion */
.row-essay-full { width: 100%; }

/* 完形填空 - 一行一空，标准大小选项 */
.cloze-compact { width: 100%; display: flex; flex-direction: column; gap: 6px; }
.cloze-row { display: flex; align-items: center; gap: 6px; }
.cloze-num { font-size: 13px; color: #4E5969; font-weight: 600; min-width: 22px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; background: #F5F6F7; border-radius: 5px; flex-shrink: 0; }

/* 复合题紧凑 */
.composite-compact { width: 100%; }
.sub-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 4px 0; }
.sub-label { display: flex; align-items: center; gap: 4px; min-width: 70px; }
.sub-label.full-width { width: 100%; margin-bottom: 4px; }
.sub-idx { font-size: 12px; font-weight: 600; color: #4E5969; }
.sub-type-tag { font-size: 11px; color: #86909C; }

/* 试卷 HTML 渲染样式 */
.doc-page-html { padding: 20px 16px; }
.doc-page-html :deep(.exam-paper-page) { font-family: 'SimSun', 'Songti SC', serif; color: #000; line-height: 1.8; font-size: 14px; }
.doc-page-html :deep(.paper-header) { text-align: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #000; }
.doc-page-html :deep(.paper-header h1) { font-size: 18px; font-weight: bold; margin: 0 0 4px; }
.doc-page-html :deep(.paper-header h2) { font-size: 16px; font-weight: bold; margin: 0 0 10px; }
.doc-page-html :deep(.paper-info) { font-size: 13px; text-align: left; }
.doc-page-html :deep(.info-row) { display: flex; justify-content: space-between; margin: 4px 0; }
.doc-page-html :deep(.student-info) { margin-top: 8px; flex-wrap: wrap; gap: 8px; }
.doc-page-html :deep(.paper-notice) { font-size: 12px; text-align: left; margin-top: 8px; color: #333; }
.doc-page-html :deep(.paper-section) { margin-bottom: 16px; }
.doc-page-html :deep(.section-title) { font-size: 15px; font-weight: bold; margin: 16px 0 10px; }
.doc-page-html :deep(.question-item) { display: flex; gap: 4px; margin-bottom: 12px; }
.doc-page-html :deep(.q-num) { font-weight: bold; min-width: 24px; flex-shrink: 0; }
.doc-page-html :deep(.q-text) { flex: 1; }
.doc-page-html :deep(.q-options) { margin-top: 6px; }
.doc-page-html :deep(.q-opt) { margin: 2px 0; padding-left: 16px; }
.doc-page-html :deep(.answer-lines) { margin-top: 8px; }
.doc-page-html :deep(.answer-line) { border-bottom: 1px solid #999; height: 28px; }
.doc-page-html :deep(.material-text) { background: #f9f9f9; padding: 10px; border-left: 3px solid #666; margin-bottom: 12px; font-size: 13px; }
.doc-page-html :deep(.sub-questions) { margin-top: 10px; }
.doc-page-html :deep(.sub-q) { display: flex; gap: 4px; margin-bottom: 10px; }
.doc-page-html :deep(.sub-num) { font-weight: bold; min-width: 28px; flex-shrink: 0; }
.doc-page-html :deep(.sub-text) { flex: 1; }
.doc-page-html :deep(.cloze-options-table table) { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
.doc-page-html :deep(.cloze-options-table td) { padding: 4px 8px; border: 1px solid #ccc; }
.doc-page-html :deep(.blank-num) { font-weight: bold; width: 36px; text-align: center; background: #f5f5f5; }
.doc-page-html :deep(.paper-footer) { text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px solid #999; color: #666; font-size: 13px; }

</style>