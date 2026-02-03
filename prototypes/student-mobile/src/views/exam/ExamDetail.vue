<template>
  <div class="exam-detail-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="考试详情" left-arrow @click-left="$router.back()" fixed placeholder />

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading-wrapper" vertical>加载中...</van-loading>

    <!-- 考试信息 -->
    <div v-else class="content">
      <!-- 考试基本信息 -->
      <div class="exam-info-card">
        <div class="exam-title">{{ exam.name }}</div>
        <van-tag :type="getStatusType(exam.status)" size="large">
          {{ getStatusText(exam.status) }}
        </van-tag>
      </div>

      <!-- 考试时间信息 -->
      <van-cell-group :border="false" class="info-group">
        <van-cell title="考试时间" :border="false">
          <template #value>
            <div class="time-info">
              <div>{{ formatDateTime(exam.startTime) }}</div>
              <div class="text-secondary">至</div>
              <div>{{ formatDateTime(exam.endTime) }}</div>
            </div>
          </template>
        </van-cell>
        <van-cell title="考试时长" :value="`${exam.duration} 分钟`" :border="false" />
        <van-cell title="试卷名称" :value="exam.paper.name" :border="false" />
        <van-cell title="题目数量" :value="`${exam.paper.questionCount} 题`" :border="false" />
        <van-cell title="总分" :value="`${exam.totalScore} 分`" :border="false" />
      </van-cell-group>

      <!-- 倒计时（未开始） -->
      <div v-if="exam.status === 'not_started'" class="countdown-card">
        <div class="countdown-title">距离考试开始</div>
        <div class="countdown-time">{{ countdownText }}</div>
      </div>

      <!-- 倒计时（进行中） -->
      <div v-if="exam.status === 'in_progress'" class="countdown-card in-progress">
        <div class="countdown-title">距离考试结束</div>
        <div class="countdown-time">{{ countdownText }}</div>
      </div>

      <!-- 考试说明 -->
      <div class="section-title">考试说明</div>
      <div class="description-card">
        <div v-if="exam.description" class="description-text">
          {{ exam.description }}
        </div>
        <div v-else class="description-text text-secondary">
          暂无考试说明
        </div>
      </div>

      <!-- 考试规则 -->
      <div class="section-title">考试规则</div>
      <van-cell-group :border="false" class="rules-group">
        <van-cell :border="false">
          <template #icon>
            <van-icon name="passed" color="#00B96B" size="18" />
          </template>
          <template #title>
            <span class="rule-text">
              {{ exam.config.enableFaceRecognition ? '需要进行人脸识别验证' : '无需人脸识别' }}
            </span>
          </template>
        </van-cell>
        <van-cell :border="false">
          <template #icon>
            <van-icon name="clock-o" color="#00B96B" size="18" />
          </template>
          <template #title>
            <span class="rule-text">
              {{ exam.config.allowLateEntry
                ? `允许迟到 ${exam.config.lateMinutes} 分钟内进入`
                : '不允许迟到进入' }}
            </span>
          </template>
        </van-cell>
        <van-cell :border="false">
          <template #icon>
            <van-icon name="photo-o" color="#00B96B" size="18" />
          </template>
          <template #title>
            <span class="rule-text">
              {{ exam.config.enableRandomCapture
                ? `考试过程中将随机抓拍 ${exam.config.captureCount || 3} 次`
                : '考试过程中不进行抓拍' }}
            </span>
          </template>
        </van-cell>
        <van-cell :border="false">
          <template #icon>
            <van-icon name="warning-o" color="#FF7D00" size="18" />
          </template>
          <template #title>
            <span class="rule-text">
              最短答题时间 {{ exam.config.minAnswerTime }} 分钟
            </span>
          </template>
        </van-cell>
        <van-cell :border="false">
          <template #icon>
            <van-icon name="info-o" color="#14C9C9" size="18" />
          </template>
          <template #title>
            <span class="rule-text">
              答案将自动保存，请放心作答
            </span>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 底部操作按钮 -->
      <div class="bottom-actions safe-area-bottom">
        <van-button
          v-if="canEnter"
          type="primary"
          size="large"
          block
          @click="handleEnterExam"
        >
          {{ exam.myStatus === 'in_progress' ? '继续答题' : '进入考试' }}
        </van-button>
        <van-button
          v-else-if="exam.status === 'not_started'"
          type="default"
          size="large"
          block
          disabled
        >
          考试未开始
        </van-button>
        <van-button
          v-else-if="exam.status === 'ended'"
          type="default"
          size="large"
          block
          disabled
        >
          考试已结束
        </van-button>
        <van-button
          v-else-if="exam.myStatus === 'submitted'"
          type="success"
          size="large"
          block
          @click="handleViewResult"
        >
          查看成绩
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExamStore } from '@/stores'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const examStore = useExamStore()

const loading = ref(true)
const exam = ref(null)
const countdownTimer = ref(null)
const countdownText = ref('')

// 是否可以进入考试
const canEnter = computed(() => {
  if (!exam.value) return false
  return exam.value.status === 'in_progress' && exam.value.myStatus !== 'submitted'
})

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    not_started: 'default',
    in_progress: 'success',
    ended: 'danger',
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
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hour}:${minute}`
}

// 计算倒计时
const calculateCountdown = () => {
  if (!exam.value) return

  const now = Date.now()
  const targetTime = exam.value.status === 'not_started'
    ? new Date(exam.value.startTime).getTime()
    : new Date(exam.value.endTime).getTime()

  const diff = targetTime - now

  if (diff <= 0) {
    countdownText.value = '00:00:00'
    stopCountdown()
    // 刷新考试状态
    loadExamDetail()
    return
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  countdownText.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// 启动倒计时
const startCountdown = () => {
  calculateCountdown()
  countdownTimer.value = setInterval(calculateCountdown, 1000)
}

// 停止倒计时
const stopCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

// 加载考试详情
const loadExamDetail = async () => {
  loading.value = true
  try {
    const examId = route.params.id
    const data = await examStore.fetchExamDetail(examId)
    exam.value = data

    // 启动倒计时
    if (data.status === 'not_started' || data.status === 'in_progress') {
      startCountdown()
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

// 进入考试
const handleEnterExam = () => {
  if (!exam.value) return

  // 如果需要人脸识别，跳转到人脸识别页面
  if (exam.value.config.enableFaceRecognition) {
    router.push(`/exam/face-verify/${exam.value.id}`)
  } else {
    // 直接进入答题页面
    router.push(`/exam/answer/${exam.value.id}`)
  }
}

// 查看成绩
const handleViewResult = () => {
  router.push(`/exam/result/${exam.value.id}`)
}

onMounted(() => {
  loadExamDetail()
})

onUnmounted(() => {
  stopCountdown()
})
</script>

<style scoped>
.exam-detail-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.content {
  padding: 12px;
}

.exam-info-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.exam-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  flex: 1;
  margin-right: 12px;
}

.info-group {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.time-info {
  text-align: right;
  font-size: 14px;
  color: #1d2129;
}

.text-secondary {
  color: #86909c;
  font-size: 12px;
  margin: 4px 0;
}

.countdown-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 12px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.countdown-card.in-progress {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.countdown-title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 12px;
}

.countdown-time {
  font-size: 36px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 20px 0 12px;
  padding-left: 8px;
  border-left: 3px solid var(--primary-color);
}

.description-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
}

.description-text {
  font-size: 14px;
  color: #4e5969;
  line-height: 1.6;
}

.rules-group {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.rule-text {
  font-size: 14px;
  color: #4e5969;
  margin-left: 8px;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: white;
  border-top: 1px solid #e5e6eb;
  z-index: 100;
}
</style>
