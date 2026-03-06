<template>
  <div class="practice-detail-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="任务详情" left-arrow @click-left="$router.back()" fixed placeholder />

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading-wrapper" vertical>加载中...</van-loading>

    <template v-else-if="task">
      <!-- 任务名称 + 状态 -->
      <div class="task-header">
        <div class="header-top">
          <h2 class="task-name">{{ task.name }}</h2>
          <van-tag :type="statusType" size="medium">{{ statusText }}</van-tag>
        </div>
        <div class="time-row">
          <van-icon name="clock-o" size="14" />
          <span>{{ formatDate(task.startTime) }} ~ {{ formatDate(task.endTime) }}</span>
        </div>
        <div v-if="task.description" class="task-desc">{{ task.description }}</div>
      </div>

      <!-- 抽题模式 -->
      <div class="mode-card">
        <div class="mode-tag" :class="task.questionMode === 'fixed' ? 'fixed' : 'random'">
          {{ task.questionMode === 'fixed' ? '固定抽题' : '随机抽题' }}
        </div>
        <div class="mode-desc">
          {{ task.questionMode === 'fixed' ? '每次刷题题目相同，适合反复巩固薄弱知识点' : '每次刷题从题库范围内随机生成，适合全面检测掌握情况' }}
        </div>
      </div>

      <!-- 数据指标 -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value primary">{{ correctRate }}%</div>
          <div class="metric-label">正确率</div>
        </div>
        <div class="metric-card">
          <div class="metric-value success">{{ masteredPercent }}%</div>
          <div class="metric-label">掌握比例</div>
        </div>
        <div class="metric-card">
          <div class="metric-value error">{{ wrongCount }}</div>
          <div class="metric-label">错题数</div>
        </div>
        <div class="metric-card">
          <div class="metric-value warning">{{ task.practiceDays || 0 }}</div>
          <div class="metric-label">已刷次数</div>
        </div>
      </div>

      <!-- 任务信息 -->
      <div class="info-card">
        <div class="card-title">任务信息</div>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">题型范围</span>
            <span class="info-value">{{ questionTypesText }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">完成进度</span>
            <span class="info-value">{{ task.answeredCount || 0 }} / {{ task.totalQuestions }} 题</span>
          </div>
        </div>
        <div class="progress-bar-wrapper">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: answeredPercent + '%' }"></div>
          </div>
          <span class="progress-text">{{ answeredPercent }}%</span>
        </div>
      </div>

      <!-- 刷题记录列表（已结束任务） -->
      <div v-if="task.status === 'ended'" class="sessions-card">
        <div class="card-title">刷题记录</div>
        <van-loading v-if="sessionsLoading" size="20" class="sessions-loading">加载中...</van-loading>
        <template v-else>
          <div
            v-for="session in sessions"
            :key="session.sessionIndex"
            class="session-item"
            @click="viewSession(session.sessionIndex)"
          >
            <div class="session-left">
              <span class="session-index">第 {{ session.sessionIndex }} 次</span>
              <span class="session-date">{{ formatDate(session.date) }}</span>
            </div>
            <div class="session-right">
              <span class="session-rate" :class="getRateClass(session.correctCount, session.totalCount)">
                {{ session.correctCount }}/{{ session.totalCount }}
                （{{ Math.round(session.correctCount / session.totalCount * 100) }}%）
              </span>
              <van-icon name="arrow" color="#c8c9cc" size="14" />
            </div>
          </div>
          <van-empty v-if="sessions.length === 0" description="暂无刷题记录" image="search" />
        </template>
      </div>

      <!-- 底部按钮（进行中/未开始） -->
      <div v-if="task.status !== 'ended'" class="bottom-actions safe-area-bottom">
        <van-button
          v-if="task.status === 'not_started'"
          type="default"
          size="large"
          block
          disabled
        >
          任务未开始
        </van-button>
        <van-button
          v-else
          type="primary"
          size="large"
          block
          @click="handleStart"
        >
          {{ hasProgress ? '继续刷题' : '开始刷题' }}
        </van-button>
      </div>
    </template>

    <!-- 空状态 -->
    <van-empty v-else description="任务不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores'
import { getPracticeSessions } from '@/api/practice'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const store = usePracticeStore()

const loading = ref(true)
const taskId = route.params.id
const sessions = ref([])
const sessionsLoading = ref(false)

const task = computed(() => store.currentTask)

// 状态
const statusType = computed(() => {
  const map = { not_started: 'primary', in_progress: 'warning', ended: 'default' }
  return map[task.value?.status] || 'default'
})
const statusText = computed(() => {
  const map = { not_started: '未开始', in_progress: '进行中', ended: '已结束' }
  return map[task.value?.status] || '未知'
})

// 指标
const masteredPercent = computed(() => {
  if (!task.value?.totalQuestions) return 0
  return Math.round((task.value.masteredCount / task.value.totalQuestions) * 100)
})
const correctRate = computed(() => {
  if (!task.value?.answeredCount) return 0
  return Math.round((task.value.correctCount / task.value.answeredCount) * 100)
})
const wrongCount = computed(() => {
  if (!task.value) return 0
  return (task.value.answeredCount || 0) - (task.value.correctCount || 0)
})
const answeredPercent = computed(() => {
  if (!task.value?.totalQuestions) return 0
  return Math.round((task.value.answeredCount / task.value.totalQuestions) * 100)
})
const hasProgress = computed(() => task.value && task.value.answeredCount > 0)

// 题型文本
const questionTypesText = computed(() => {
  if (!task.value?.questionTypes?.length) return '全部题型'
  const typeMap = {
    single: '单选', multiple: '多选', judge: '判断',
    blank: '填空', essay: '简答', cloze: '完形填空', composite: '复合题'
  }
  return task.value.questionTypes.map(t => typeMap[t] || t).join('、')
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hour}:${minute}`
}

const loadDetail = async () => {
  loading.value = true
  try {
    await store.fetchTaskDetail(taskId)
    if (task.value?.status === 'ended') {
      sessionsLoading.value = true
      sessions.value = await getPracticeSessions(taskId)
      sessionsLoading.value = false
    }
  } catch {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

const handleStart = () => {
  const query = task.value?.questionMode === 'random' && task.value.drawCount
    ? { drawCount: String(task.value.drawCount) }
    : {}
  router.push({ path: `/practice/answer/${taskId}`, query })
}

const viewSession = (sessionIndex) => {
  const query = { mode: 'review', session: String(sessionIndex) }
  if (task.value?.questionMode === 'random' && task.value.drawCount) {
    query.drawCount = String(task.value.drawCount)
  }
  router.push({ path: `/practice/answer/${taskId}`, query })
}

const getRateClass = (correct, total) => {
  const rate = correct / total
  if (rate >= 0.8) return 'rate-good'
  if (rate >= 0.6) return 'rate-mid'
  return 'rate-bad'
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.practice-detail-page {
  --primary-color: #00B96B;
  --text-primary: #1d2129;
  --text-secondary: #4e5969;
  --bg-color: #f7f8fa;
  min-height: 100vh;
  background-color: var(--bg-color);
  padding-bottom: 80px;
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.task-header {
  background: white;
  padding: 16px;
  margin-bottom: 12px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.task-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  margin-right: 8px;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
}

.task-desc {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.mode-card {
  background: white;
  border-radius: 12px;
  margin: 0 12px 12px;
  padding: 16px;
  line-height: 0;
}

.mode-tag {
  display: inline-block;
  line-height: normal;
  font-size: 13px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 6px;
  margin-bottom: 6px;
}

.mode-tag.fixed {
  background: #e8f7f0;
  color: var(--primary-color);
}

.mode-tag.random {
  background: #e8f0fe;
  color: #3491FA;
}

.mode-desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 12px;
  margin-bottom: 12px;
}

.metric-card {
  background: white;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  font-family: 'DIN Alternate', 'SF Mono', monospace;
  line-height: 1.2;
  margin-bottom: 4px;
}

.metric-value.error { color: #F53F3F; }
.metric-value.primary { color: #3491FA; }
.metric-value.warning { color: #FF7D00; }
.metric-value.success { color: var(--primary-color); }

.metric-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.info-card {
  background: white;
  border-radius: 12px;
  margin: 0 12px 12px;
  padding: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 14px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 14px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 14px;
}

.info-label {
  color: var(--text-secondary);
  flex-shrink: 0;
  margin-right: 12px;
}

.info-value {
  color: var(--text-primary);
  text-align: right;
}

.progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #f2f3f5;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-color);
  min-width: 36px;
  text-align: right;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #e5e6eb;
  z-index: 100;
}

.bottom-actions :deep(.van-button--primary) {
  background: var(--primary-color);
  border-color: var(--primary-color);
  border-radius: 8px;
}

.sessions-card {
  background: white;
  border-radius: 12px;
  margin: 0 12px 24px;
  padding: 16px;
}

.sessions-loading {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
  cursor: pointer;
}

.session-item:last-child {
  border-bottom: none;
}

.session-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.session-index {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.session-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.session-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.session-rate {
  font-size: 13px;
  font-weight: 500;
}

.rate-good { color: #00B96B; }
.rate-mid  { color: #FF7D00; }
.rate-bad  { color: #F53F3F; }
</style>
