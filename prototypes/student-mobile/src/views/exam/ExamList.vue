<template>
  <div class="exam-list-page">
    <!-- 顶部搜索区域 -->
    <div class="header-section">
      <div class="page-title">我的考试</div>
      <van-search
        v-model="searchText"
        placeholder="搜索考试名称"
        shape="round"
        background="transparent"
        @search="onSearch"
      />
    </div>

    <!-- 筛选排序栏 -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: activeTab === tab.value }"
          @click="handleTabChange(tab.value)"
        >
          {{ tab.label }}
        </div>
      </div>
      <div class="sort-btn" @click="toggleSort">
        <van-icon :name="sortDesc ? 'descending' : 'ascending'" size="14" />
        <span>{{ sortDesc ? '最新' : '最早' }}</span>
      </div>
    </div>

    <!-- 考试列表 -->
    <div class="list-section">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text=""
          @load="onLoad"
        >
          <div
            v-for="exam in filteredExamList"
            :key="exam.id"
            class="exam-card"
            @click="goToDetail(exam.id)"
          >
            <!-- 卡片主体 -->
            <div class="card-body">
              <!-- 头部：标题和状态 -->
              <div class="card-header">
                <h3 class="exam-name">{{ exam.name }}</h3>
                <van-tag :type="getStatusType(exam.status)" size="medium">
                  {{ getStatusText(exam.status) }}
                </van-tag>
              </div>

              <!-- 考试信息 -->
              <div class="exam-info">
                <div class="info-row">
                  <van-icon name="clock-o" />
                  <span>{{ formatDateTime(exam.startTime) }} ~ {{ formatEndTime(exam.startTime, exam.endTime) }}</span>
                </div>
                <div class="info-row">
                  <van-icon name="description" />
                  <span>{{ exam.paper.name }}</span>
                  <span class="paper-mode-divider">|</span>
                  <!-- 文档模式图标 -->
                  <svg v-if="exam.paper.mode === 'document'" class="mode-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
                    <line x1="5" y1="4.5" x2="11" y2="4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                    <line x1="5" y1="7.5" x2="11" y2="7.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                    <line x1="5" y1="10.5" x2="9" y2="10.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                  </svg>
                  <!-- 抽题模式图标 -->
                  <svg v-else class="mode-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1.5" y="2" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
                    <rect x="4.5" y="2" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.2" fill="white"/>
                    <line x1="7" y1="5.5" x2="12" y2="5.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                    <line x1="7" y1="8" x2="12" y2="8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                    <line x1="7" y1="10.5" x2="10.5" y2="10.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                  </svg>
                  <span>{{ exam.paper.mode === 'document' ? '文档' : '抽题' }}</span>
                </div>
                <div class="info-tags">
                  <span class="tag">{{ exam.duration }}分钟</span>
                  <span class="tag">{{ exam.paper.questionCount }}题</span>
                  <span class="tag">{{ exam.totalScore }}分</span>
                  <span v-if="exam.config.maxAttempts > 1" class="tag attempt">
                    {{ exam.config.currentAttempt }}/{{ exam.config.maxAttempts }}次
                  </span>
                </div>
              </div>

              <!-- 底部：成绩或操作 -->
              <div class="card-footer">
                <!-- 左侧：成绩 or 倒计时 -->
                <div v-if="exam.myStatus === 'submitted' && exam.score !== null" class="score-section">
                  <div class="score-badge" :class="getScoreLevel(exam.score, exam.totalScore)">
                    <span class="score-num">{{ exam.score }}</span>
                    <span class="score-unit">分</span>
                  </div>
                  <span class="score-text">已完成</span>
                </div>
                <div v-else-if="exam.status === 'not_started'" class="countdown-text" v-html="getCountdown(exam)"></div>
                <div v-else class="score-section empty"></div>

                <!-- 右侧：操作按钮 -->
                <div class="action-section">
                  <!-- 进行中的考试 -->
                  <van-button
                    v-if="exam.status === 'in_progress' && exam.myStatus !== 'submitted'"
                    type="primary"
                    size="small"
                    round
                    @click.stop="enterExam(exam)"
                  >
                    {{ exam.myStatus === 'in_progress' ? '继续答题' : '进入考试' }}
                  </van-button>
                  <!-- 已提交 -->
                  <van-button
                    v-else-if="exam.myStatus === 'submitted'"
                    plain
                    type="primary"
                    size="small"
                    round
                    @click.stop="goToDetail(exam.id)"
                  >
                    查看详情
                  </van-button>
                  <!-- 未开始且允许提前进入 -->
                  <div v-else-if="exam.status === 'not_started' && exam.config.allowEarlyEntry" class="early-entry-right">
                    <div class="early-hint">提前{{ exam.config.earlyMinutes }}分钟</div>
                    <van-button
                      type="success"
                      size="small"
                      round
                      :disabled="!canEnter(exam)"
                      @click.stop="enterExam(exam)"
                    >
                      提前进入
                    </van-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <van-empty
            v-if="!loading && filteredExamList.length === 0"
            image="search"
            :description="emptyText"
          />
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore, useUserStore } from '@/stores'
import { showToast } from 'vant'

const router = useRouter()
const examStore = useExamStore()
const userStore = useUserStore()

// 状态
const activeTab = ref('all')
const searchText = ref('')
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 20
const sortDesc = ref(true)
const countdownTimer = ref(null)
const currentTime = ref(Date.now())

// 标签配置
const tabs = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'in_progress' },
  { label: '未开始', value: 'not_started' },
  { label: '已结束', value: 'ended' },
]

// 考试列表
const examList = computed(() => examStore.examList)

// 筛选后的列表
const filteredExamList = computed(() => {
  let list = [...examList.value]

  // 状态筛选
  if (activeTab.value !== 'all') {
    list = list.filter(e => e.status === activeTab.value)
  }

  // 搜索筛选
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    list = list.filter(e => e.name.toLowerCase().includes(keyword))
  }

  // 排序
  list.sort((a, b) => {
    const timeA = new Date(a.startTime).getTime()
    const timeB = new Date(b.startTime).getTime()
    return sortDesc.value ? timeB - timeA : timeA - timeB
  })

  return list
})

// 空状态文本
const emptyText = computed(() => {
  if (searchText.value) {
    return '未找到相关考试'
  }
  const tabText = tabs.find(t => t.value === activeTab.value)?.label || ''
  return `暂无${tabText === '全部' ? '' : tabText}考试`
})

// 加载数据
const onLoad = async () => {
  try {
    const params = {
      page: page.value,
      pageSize,
      status: activeTab.value === 'all' ? undefined : activeTab.value,
    }
    const data = await examStore.fetchExamList(params)

    if (data.list.length < pageSize) {
      finished.value = true
    }
    page.value++
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  page.value = 1
  finished.value = false
  examStore.examList = []
  onLoad()
}

// 切换标签
const handleTabChange = (value) => {
  activeTab.value = value
}

// 切换排序
const toggleSort = () => {
  sortDesc.value = !sortDesc.value
}

// 搜索
const onSearch = () => {
  // 搜索由 computed 自动处理
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    not_started: 'primary',
    in_progress: 'warning',
    ended: 'default',
  }
  return typeMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    not_started: '未开始',
    in_progress: '进行中',
    ended: '已结束',
  }
  return textMap[status] || '未知'
}

// 格式化日期时间
const formatDateTime = (time) => {
  const date = new Date(time)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hour}:${minute}`
}

// 格式化考试时间范围（处理跨天情况）
const formatExamTimeRange = (startTime, endTime) => {
  const startDate = new Date(startTime)
  const endDate = new Date(endTime)
  const endHour = String(endDate.getHours()).padStart(2, '0')
  const endMinute = String(endDate.getMinutes()).padStart(2, '0')

  const isSameDay = startDate.getFullYear() === endDate.getFullYear() &&
                    startDate.getMonth() === endDate.getMonth() &&
                    startDate.getDate() === endDate.getDate()

  const endStr = isSameDay
    ? `${endHour}:${endMinute}`
    : `${endDate.getMonth() + 1}月${endDate.getDate()}日 ${endHour}:${endMinute}`

  return `${formatDateTime(startTime)} ~ ${endStr}`
}

// 保留旧函数名兼容模板
const formatEndTime = (startTime, endTime) => {
  const startDate = new Date(startTime)
  const endDate = new Date(endTime)
  const endHour = String(endDate.getHours()).padStart(2, '0')
  const endMinute = String(endDate.getMinutes()).padStart(2, '0')

  const isSameDay = startDate.getFullYear() === endDate.getFullYear() &&
                    startDate.getMonth() === endDate.getMonth() &&
                    startDate.getDate() === endDate.getDate()

  if (isSameDay) {
    return `${endHour}:${endMinute}`
  } else {
    const endMonth = endDate.getMonth() + 1
    const endDay = endDate.getDate()
    return `${endMonth}月${endDay}日 ${endHour}:${endMinute}`
  }
}

// 获取倒计时文本（实时更新）
const getCountdown = (exam) => {
  const start = new Date(exam.startTime).getTime()
  const diff = start - currentTime.value

  if (diff <= 0) return '<span class="countdown-num">即将开始</span>'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  // 统一使用数字字体包裹
  if (days > 0) {
    return `<span class="countdown-num">${days}</span>天<span class="countdown-num">${hours}</span>小时后`
  }
  // 小于24小时按时:分:秒显示
  const h = String(hours).padStart(2, '0')
  const m = String(minutes).padStart(2, '0')
  const s = String(seconds).padStart(2, '0')
  return `<span class="countdown-num">${h}</span>:<span class="countdown-num">${m}</span>:<span class="countdown-num">${s}</span>`
}

// 启动倒计时定时器
const startCountdownTimer = () => {
  countdownTimer.value = setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)
}

// 停止倒计时定时器
const stopCountdownTimer = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

// 获取成绩等级
const getScoreLevel = (score, total) => {
  const percent = (score / total) * 100
  if (percent >= 90) return 'excellent'
  if (percent >= 80) return 'good'
  if (percent >= 60) return 'pass'
  return 'fail'
}

// 是否可以进入考试（包括提前进入）
const canEnter = (exam) => {
  // 已提交的不能再进入
  if (exam.myStatus === 'submitted') return false

  // 进行中的考试可以进入
  if (exam.status === 'in_progress') return true

  // 未开始的考试，检查是否允许提前进入
  if (exam.status === 'not_started' && exam.config.allowEarlyEntry) {
    const startTime = new Date(exam.startTime).getTime()
    const earlyTime = startTime - exam.config.earlyMinutes * 60 * 1000
    return currentTime.value >= earlyTime
  }

  return false
}

// 进入考试详情
const goToDetail = (examId) => {
  router.push(`/exam/detail/${examId}`)
}

// 进入考试（统一跳转到详情页，由详情页处理后续流程）
const enterExam = (exam) => {
  router.push(`/exam/detail/${exam.id}`)
}

onMounted(() => {
  // 检查登录状态
  userStore.loadFromLocal()
  if (!userStore.isLoggedIn) {
    router.replace('/login')
    return
  }
  onLoad()
  // 启动倒计时
  startCountdownTimer()
})

onUnmounted(() => {
  // 清理倒计时
  stopCountdownTimer()
})
</script>

<style scoped>
.exam-list-page {
  min-height: 100vh;
  background-color: #F5F6F7;
  padding-bottom: 60px;
}

/* 顶部区域 */
.header-section {
  background: #FFFFFF;
  padding: 12px 16px 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1D2129;
  margin-bottom: 12px;
}

.header-section :deep(.van-search) {
  padding: 0;
}

.header-section :deep(.van-search__content) {
  background: #F5F6F7;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #FFFFFF;
  margin-top: 8px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.tab-item {
  padding: 6px 12px;
  font-size: 13px;
  color: #4E5969;
  background: #F5F6F7;
  border-radius: 14px;
  transition: all 0.2s ease;
}

.tab-item.active {
  background: #00B96B;
  color: white;
  font-weight: 500;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #86909C;
  padding: 6px 10px;
  background: #F5F6F7;
  border-radius: 14px;
}

/* 列表区域 */
.list-section {
  padding: 12px 16px;
}

/* 考试卡片 */
.exam-card {
  display: flex;
  background: #FFFFFF;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

/* 卡片主体 */
.card-body {
  flex: 1;
  padding: 14px 14px 14px 12px;
  min-width: 0;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.exam-name {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 考试信息 */
.exam-info {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #86909C;
  margin-bottom: 6px;
}

.info-row .van-icon {
  font-size: 14px;
  color: #C9CDD4;
}

/* 试卷模式自定义图标 */
.mode-icon {
  width: 14px;
  height: 14px;
  color: #C9CDD4;
  flex-shrink: 0;
}

/* 试卷模式分隔符 */
.paper-mode-divider {
  color: #E5E6EB;
  margin: 0 2px;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.info-tags .tag {
  font-size: 12px;
  color: #4E5969;
  background: #F5F6F7;
  padding: 2px 8px;
  border-radius: 4px;
}

.info-tags .tag.attempt {
  color: #FA8C16;
  background: #FFF7E6;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #F0F1F2;
}

/* 成绩区域 */
.score-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-section.empty {
  min-height: 28px;
}

.score-badge {
  display: flex;
  align-items: baseline;
  padding: 2px 10px;
  border-radius: 14px;
  background: #F5F6F7;
}

.score-badge.excellent {
  background: #F6FFED;
  color: #52C41A;
}

.score-badge.good {
  background: #E6F7FF;
  color: #1890FF;
}

.score-badge.pass {
  background: #FFF7E6;
  color: #FA8C16;
}

.score-badge.fail {
  background: #FFF1F0;
  color: #FF4D4F;
}

.score-num {
  font-size: 16px;
  font-weight: 700;
}

.score-unit {
  font-size: 11px;
  margin-left: 2px;
}

.score-text {
  font-size: 12px;
  color: #86909C;
}

/* 操作区域 */
.action-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
}

.action-section :deep(.van-button--primary) {
  background: #00B96B;
  border-color: #00B96B;
}

.action-section :deep(.van-button--primary.van-button--plain) {
  color: #00B96B;
  background: transparent;
}

.action-section :deep(.van-button--success) {
  background: #52C41A;
  border-color: #52C41A;
}

.action-section :deep(.van-button--success.van-button--disabled) {
  background: #C9CDD4;
  border-color: #C9CDD4;
  color: #fff;
  opacity: 1;
}

/* 提前进入（右侧：提示+按钮） */
.early-entry-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.early-hint {
  font-size: 11px;
  color: #52C41A;
}

.countdown-text {
  font-size: 13px;
  color: #1890FF;
  padding: 4px 12px;
  background: #E6F7FF;
  border-radius: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.early-hint {
  font-size: 11px;
  color: #52C41A;
  white-space: nowrap;
}

/* 倒计时中的数字样式 - 统一字体 */
.countdown-text :deep(.countdown-num) {
  font-family: 'DIN Alternate', 'SF Mono', 'Menlo', monospace;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.5px;
}
</style>
