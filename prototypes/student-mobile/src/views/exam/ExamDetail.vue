<template>
  <div class="exam-detail-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="考试详情" left-arrow @click-left="$router.back()" fixed placeholder />

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading-wrapper" vertical>加载中...</van-loading>

    <!-- 未开始状态 - 特殊布局 -->
    <div v-else-if="exam.status === 'not_started'" class="not-started-content">
      <!-- 倒计时卡片 -->
      <div class="countdown-hero">
        <div class="countdown-icon">
          <van-icon name="clock-o" size="40" />
        </div>
        <div class="countdown-label">距离考试开始还有</div>
        <div class="countdown-timer">
          <div class="time-block">
            <span class="time-value">{{ countdownParts.days }}</span>
            <span class="time-unit">天</span>
          </div>
          <span class="time-separator">:</span>
          <div class="time-block">
            <span class="time-value">{{ countdownParts.hours }}</span>
            <span class="time-unit">时</span>
          </div>
          <span class="time-separator">:</span>
          <div class="time-block">
            <span class="time-value">{{ countdownParts.minutes }}</span>
            <span class="time-unit">分</span>
          </div>
          <span class="time-separator">:</span>
          <div class="time-block">
            <span class="time-value">{{ countdownParts.seconds }}</span>
            <span class="time-unit">秒</span>
          </div>
        </div>
        <div class="exam-time-hint">
          <van-icon name="underway-o" />
          <span>{{ formatFullDateTime(exam.startTime) }} 开始</span>
        </div>
      </div>

      <!-- 考试信息卡片 -->
      <div class="exam-info-section">
        <div class="exam-name">{{ exam.name }}</div>
        <div class="exam-meta">
          <div class="meta-item">
            <van-icon name="notes-o" />
            <span>{{ exam.paper.name }}</span>
          </div>
          <div class="meta-row">
            <div class="meta-tag">
              <van-icon name="clock-o" />
              <span>{{ exam.duration }}分钟</span>
            </div>
            <div class="meta-tag">
              <van-icon name="orders-o" />
              <span>{{ exam.paper.questionCount }}题</span>
            </div>
            <div class="meta-tag">
              <van-icon name="medal-o" />
              <span>{{ exam.totalScore }}分</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 考试说明 -->
      <div v-if="exam.description" class="info-card">
        <div class="card-title">
          <van-icon name="info-o" />
          <span>考试说明</span>
        </div>
        <div class="card-content">{{ exam.description }}</div>
      </div>

      <!-- 考试须知 -->
      <div class="info-card">
        <div class="card-title">
          <van-icon name="warning-o" />
          <span>考试须知</span>
        </div>
        <div class="notice-list">
          <div class="notice-item">
            <div class="notice-icon" :class="exam.config.enableFaceRecognition ? 'warning' : 'success'">
              <van-icon :name="exam.config.enableFaceRecognition ? 'scan' : 'passed'" />
            </div>
            <div class="notice-text">
              {{ exam.config.enableFaceRecognition ? '需要人脸识别验证身份' : '无需人脸识别验证' }}
            </div>
          </div>
          <div class="notice-item">
            <div class="notice-icon" :class="exam.config.allowLateEntry ? 'success' : 'warning'">
              <van-icon name="clock-o" />
            </div>
            <div class="notice-text">
              {{ exam.config.allowLateEntry
                ? `允许迟到${exam.config.lateMinutes}分钟内进入`
                : '不允许迟到，请准时参加' }}
            </div>
          </div>
          <div class="notice-item">
            <div class="notice-icon info">
              <van-icon name="photo-o" />
            </div>
            <div class="notice-text">
              {{ exam.config.enableRandomCapture
                ? `考试中将随机抓拍${exam.config.captureCount || 3}次`
                : '考试过程中不进行抓拍' }}
            </div>
          </div>
          <div class="notice-item">
            <div class="notice-icon warning">
              <van-icon name="underway-o" />
            </div>
            <div class="notice-text">
              最短答题时间 {{ exam.config.minAnswerTime }} 分钟
            </div>
          </div>
          <div class="notice-item">
            <div class="notice-icon success">
              <van-icon name="shield-o" />
            </div>
            <div class="notice-text">
              答案自动保存，请放心作答
            </div>
          </div>
        </div>
      </div>

      <!-- 温馨提示 -->
      <div class="tips-card">
        <div class="tips-title">温馨提示</div>
        <div class="tips-list">
          <div class="tip-item">
            <span class="tip-dot"></span>
            <span>请提前准备好考试环境，确保网络稳定</span>
          </div>
          <div class="tip-item">
            <span class="tip-dot"></span>
            <span>如遇问题请及时联系老师</span>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="bottom-actions safe-area-bottom">
        <!-- 允许提前进入时显示 -->
        <template v-if="exam.config.allowEarlyEntry">
          <div class="early-notice-bar">
            <van-icon name="clock-o" />
            <span>允许提前 {{ exam.config.earlyMinutes }} 分钟进入</span>
          </div>
          <!-- 需要人脸识别：提前验证身份 -->
          <van-button
            v-if="exam.config.enableFaceRecognition"
            type="primary"
            size="large"
            block
            :disabled="!canEarlyEnter"
            @click="handleEnterExam"
          >
            <van-icon name="scan" style="margin-right: 6px;" />
            提前验证身份
          </van-button>
          <!-- 不需要人脸识别：等待开始 -->
          <van-button v-else type="default" size="large" block disabled>
            <van-icon name="clock-o" style="margin-right: 6px;" />
            等待考试开始
          </van-button>
        </template>
        <!-- 不允许提前进入时显示 -->
        <van-button v-else type="default" size="large" block disabled>
          <van-icon name="clock-o" style="margin-right: 6px;" />
          等待考试开始
        </van-button>
      </div>
    </div>

    <!-- 进行中状态 - 新设计 -->
    <div v-else-if="exam.status === 'in_progress'" class="in-progress-content">
      <!-- 倒计时区域 -->
      <div class="countdown-hero in-progress">
        <div class="countdown-icon">
          <van-icon name="underway-o" size="40" />
        </div>
        <div class="countdown-label">考试剩余时间</div>
        <div class="countdown-timer">
          <div class="time-block">
            <span class="time-value">{{ countdownParts.hours }}</span>
            <span class="time-unit">时</span>
          </div>
          <span class="time-separator">:</span>
          <div class="time-block">
            <span class="time-value">{{ countdownParts.minutes }}</span>
            <span class="time-unit">分</span>
          </div>
          <span class="time-separator">:</span>
          <div class="time-block">
            <span class="time-value">{{ countdownParts.seconds }}</span>
            <span class="time-unit">秒</span>
          </div>
        </div>
        <div class="exam-time-hint">
          <van-icon name="clock-o" />
          <span>{{ formatFullDateTime(exam.endTime) }} 截止</span>
        </div>
      </div>

      <!-- 考试信息卡片 -->
      <div class="exam-info-section">
        <div class="exam-name">{{ exam.name }}</div>
        <div class="exam-meta">
          <div class="meta-item">
            <van-icon name="notes-o" />
            <span>{{ exam.paper.name }}</span>
          </div>
          <div class="meta-row">
            <div class="meta-tag">
              <van-icon name="clock-o" />
              <span>{{ exam.duration }}分钟</span>
            </div>
            <div class="meta-tag">
              <van-icon name="orders-o" />
              <span>{{ exam.paper.questionCount }}题</span>
            </div>
            <div class="meta-tag">
              <van-icon name="medal-o" />
              <span>{{ exam.totalScore }}分</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 答题状态（如果已开始答题） -->
      <div v-if="exam.myStatus === 'in_progress'" class="progress-card">
        <div class="progress-header">
          <van-icon name="edit" />
          <span>答题进度</span>
        </div>
        <div class="progress-content">
          <div class="progress-info">
            <span class="progress-text">您有未完成的答题记录</span>
            <span class="progress-hint">系统已自动保存您的答案</span>
          </div>
          <van-icon name="arrow" class="progress-arrow" />
        </div>
      </div>

      <!-- 考试须知 -->
      <div class="info-card">
        <div class="card-title">
          <van-icon name="warning-o" />
          <span>考试须知</span>
        </div>
        <div class="notice-list">
          <div class="notice-item">
            <div class="notice-icon" :class="exam.config.enableFaceRecognition ? 'warning' : 'success'">
              <van-icon :name="exam.config.enableFaceRecognition ? 'scan' : 'passed'" />
            </div>
            <div class="notice-text">
              {{ exam.config.enableFaceRecognition ? '需要人脸识别验证身份' : '无需人脸识别验证' }}
            </div>
          </div>
          <div class="notice-item">
            <div class="notice-icon" :class="exam.config.allowLateEntry ? 'success' : 'warning'">
              <van-icon name="clock-o" />
            </div>
            <div class="notice-text">
              {{ exam.config.allowLateEntry
                ? `允许迟到${exam.config.lateMinutes}分钟内进入`
                : '不允许迟到，请准时参加' }}
            </div>
          </div>
          <div class="notice-item">
            <div class="notice-icon info">
              <van-icon name="photo-o" />
            </div>
            <div class="notice-text">
              {{ exam.config.enableRandomCapture
                ? `考试中将随机抓拍${exam.config.captureCount || 3}次`
                : '考试过程中不进行抓拍' }}
            </div>
          </div>
          <div class="notice-item">
            <div class="notice-icon warning">
              <van-icon name="underway-o" />
            </div>
            <div class="notice-text">
              最短答题时间 {{ exam.config.minAnswerTime }} 分钟
            </div>
          </div>
          <div class="notice-item">
            <div class="notice-icon success">
              <van-icon name="shield-o" />
            </div>
            <div class="notice-text">
              答案自动保存，请放心作答
            </div>
          </div>
        </div>
      </div>

      <!-- 温馨提示 -->
      <div class="tips-card">
        <div class="tips-title">温馨提示</div>
        <div class="tips-list">
          <div class="tip-item">
            <span class="tip-dot"></span>
            <span>请提前准备好考试环境，确保网络稳定</span>
          </div>
          <div class="tip-item">
            <span class="tip-dot"></span>
            <span>如遇问题请及时联系老师</span>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="bottom-actions safe-area-bottom">
        <van-button
          v-if="exam.myStatus === 'submitted'"
          type="success"
          size="large"
          block
          @click="handleViewResult"
        >
          <van-icon name="chart-trending-o" style="margin-right: 6px;" />
          查看成绩
        </van-button>
        <van-button
          v-else
          type="warning"
          size="large"
          block
          @click="handleEnterExam"
        >
          <van-icon :name="exam.myStatus === 'in_progress' ? 'edit' : 'play-circle-o'" style="margin-right: 6px;" />
          {{ exam.myStatus === 'in_progress' ? '继续答题' : '立即开始' }}
        </van-button>
      </div>
    </div>

    <!-- 已结束状态 -->
    <div v-else class="ended-content">
      <!-- 原型配置工具条 -->
      <div class="proto-toolbar" :class="{ collapsed: protoCollapsed }">
        <div v-if="!protoCollapsed" class="proto-toolbar-content">
          <div class="proto-toolbar-header">
            <span class="proto-label">🔧 原型演示配置</span>
            <span class="proto-collapse-btn" @click="protoCollapsed = true">收起 ∧</span>
          </div>
          <div class="proto-group">
            <span class="proto-group-label">公布时机</span>
            <div class="proto-btns">
              <span v-for="m in publishModes" :key="m.value"
                class="proto-btn" :class="{ active: protoPublishMode === m.value }"
                @click="protoPublishMode = m.value">{{ m.label }}</span>
            </div>
          </div>
          <div class="proto-group">
            <span class="proto-group-label">公布内容</span>
            <div class="proto-btns">
              <span v-for="c in publishContents" :key="c.value"
                class="proto-btn" :class="{ active: protoPublishContent === c.value }"
                @click="protoPublishContent = c.value">{{ c.label }}</span>
            </div>
          </div>
        </div>
        <div v-else class="proto-toolbar-icon" @click="protoCollapsed = false">
          <van-icon name="setting-o" size="20" />
        </div>
      </div>

      <!-- 状态提示 -->
      <div class="status-hero ended" :style="{ marginTop: protoCollapsed ? '40px' : '150px' }">
        <div class="status-icon">
          <van-icon name="passed" size="48" />
        </div>
        <div class="status-text">考试已结束</div>
        <div class="status-time">
          <van-icon name="clock-o" />
          <span>结束于 {{ formatFullDateTime(exam.endTime) }}</span>
        </div>
      </div>

      <!-- 考试信息卡片 -->
      <div class="exam-info-section">
        <div class="exam-name">{{ exam.name }}</div>
        <div class="exam-meta">
          <div class="meta-item">
            <van-icon name="notes-o" />
            <span>{{ exam.paper.name }}</span>
          </div>
          <div class="meta-row">
            <div class="meta-tag">
              <van-icon name="clock-o" />
              <span>{{ exam.duration }}分钟</span>
            </div>
            <div class="meta-tag">
              <van-icon name="orders-o" />
              <span>{{ exam.paper.questionCount }}题</span>
            </div>
            <div class="meta-tag">
              <van-icon name="medal-o" />
              <span>{{ exam.totalScore }}分</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 成绩未公布提示 -->
      <div v-if="exam.myStatus === 'submitted' && !isScorePublished" class="unpublished-card">
        <van-icon name="clock-o" class="unpublished-icon" />
        <div class="unpublished-title">成绩暂未公布</div>
        <div class="unpublished-desc">
          成绩将于 <span class="highlight">{{ scorePublishDate }}</span> 公布
        </div>
        <div class="unpublished-hint">届时可在此查看成绩</div>
      </div>

      <!-- 成绩卡片（已提交且成绩已公布） -->
      <template v-if="exam.myStatus === 'submitted' && isScorePublished">
        <div class="score-card-ring">
          <div class="score-ring-wrap">
            <svg class="score-ring" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e8e8e8" stroke-width="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#00B96B" stroke-width="8"
                stroke-linecap="round" :stroke-dasharray="ringDash" stroke-dashoffset="0"
                transform="rotate(-90 60 60)" />
            </svg>
            <div class="score-number">
              <span class="ring-score-value">{{ exam.score }}</span>
              <span class="ring-score-total">/ {{ exam.totalScore }}</span>
            </div>
          </div>
          <div class="score-stats">
            <template v-if="protoPublishContent === 'scoreOnly'">
              <span>答对 -- 题</span>
              <span class="dot">·</span>
              <span>答错 -- 题</span>
            </template>
            <template v-else>
              <span class="stat-correct">答对 {{ exam.statistics?.correctCount ?? '--' }} 题</span>
              <span class="dot">·</span>
              <span class="stat-wrong">答错 {{ exam.statistics?.wrongCount ?? '--' }} 题</span>
              <span v-if="exam.statistics?.partialCount > 0" class="dot">·</span>
              <span v-if="exam.statistics?.partialCount > 0" class="stat-partial">
                部分得分 {{ exam.statistics.partialCount }} 题
              </span>
            </template>
          </div>
        </div>

        <!-- 查看答案详情入口（仅分数模式不显示） -->
        <div v-if="protoPublishContent !== 'scoreOnly'" class="review-entry" @click="handleViewResult">
          <div class="review-entry-left">
            <van-icon name="description" size="20" color="#00B96B" />
            <span class="review-entry-text">查看答案详情</span>
          </div>
          <van-icon name="arrow" size="16" color="#c0c4cc" />
        </div>
      </template>

      <!-- 未参加提示 -->
      <div v-else-if="exam.myStatus === 'not_started'" class="missed-card">
        <van-icon name="warning-o" size="32" />
        <div class="missed-text">您未参加此次考试</div>
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
const currentTime = ref(Date.now())
const countdownParts = ref({
  days: '00',
  hours: '00',
  minutes: '00',
  seconds: '00',
})

// 是否可以提前进入
const canEarlyEnter = computed(() => {
  if (!exam.value || exam.value.status !== 'not_started') return false
  if (!exam.value.config.allowEarlyEntry) return false

  const startTime = new Date(exam.value.startTime).getTime()
  const earlyTime = startTime - exam.value.config.earlyMinutes * 60 * 1000
  return currentTime.value >= earlyTime
})

// 获取提前进入倒计时
const getEarlyCountdown = () => {
  if (!exam.value) return ''

  const startTime = new Date(exam.value.startTime).getTime()
  const earlyTime = startTime - exam.value.config.earlyMinutes * 60 * 1000
  const diff = earlyTime - currentTime.value

  // 已经可以提前进入
  if (diff <= 0) {
    const remainingToStart = startTime - currentTime.value
    if (remainingToStart <= 0) return '即将开始'
    const mins = Math.floor(remainingToStart / (1000 * 60))
    const secs = Math.floor((remainingToStart % (1000 * 60)) / 1000)
    return `<span class="countdown-num">${String(mins).padStart(2, '0')}</span>:<span class="countdown-num">${String(secs).padStart(2, '0')}</span>`
  }

  // 还不能提前进入，显示距离可提前进入的时间
  const mins = Math.floor(diff / (1000 * 60))
  const secs = Math.floor((diff % (1000 * 60)) / 1000)
  return `<span class="countdown-num">${String(mins).padStart(2, '0')}</span>:<span class="countdown-num">${String(secs).padStart(2, '0')}</span>`
}

// 格式化完整日期时间
const formatFullDateTime = (time) => {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}年${month}月${day}日 ${hour}:${minute}`
}

// 计算倒计时
const calculateCountdown = () => {
  if (!exam.value) return

  // 更新当前时间（用于提前进入判断）
  currentTime.value = Date.now()

  const now = currentTime.value
  const targetTime = exam.value.status === 'not_started'
    ? new Date(exam.value.startTime).getTime()
    : new Date(exam.value.endTime).getTime()

  const diff = targetTime - now

  if (diff <= 0) {
    countdownParts.value = { days: '00', hours: '00', minutes: '00', seconds: '00' }
    stopCountdown()
    // 刷新考试状态
    loadExamDetail()
    return
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  countdownParts.value = {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  }
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

  // 提前进入阶段（考试尚未开始）：只能去做人脸识别
  if (exam.value.status === 'not_started') {
    if (exam.value.config.enableFaceRecognition) {
      // 无论是否已验证，都跳转到人脸验证页（已验证的会自动进入等待状态）
      router.push(`/exam/face-verify/${exam.value.id}`)
    } else {
      // 不需要人脸识别，提示等待考试开始
      showToast('考试尚未开始，请耐心等待')
    }
    return
  }

  // 考试已开始：正常流程
  if (exam.value.config.enableFaceRecognition && !examStore.isFaceVerified(exam.value.id)) {
    // 需要人脸识别且未验证过
    router.push(`/exam/face-verify/${exam.value.id}`)
  } else {
    // 不需要人脸识别 或 已通过验证，根据试卷模式跳转
    const answerPath = exam.value.paper.mode === 'document'
      ? `/exam/answer-doc/${exam.value.id}`
      : `/exam/answer/${exam.value.id}`
    router.push(answerPath)
  }
}

// 查看答题详情 — 跳转到答案详情页，传递公布内容模式
const handleViewResult = () => {
  const content = protoPublishContent.value
  const modeMap = { scoreOnly: 'score', scoreAndCorrect: 'score', full: 'full' }
  const mode = modeMap[content] || 'full'
  const isDocMode = exam.value.paper?.mode === 'document'
  if (isDocMode) {
    router.push(`/exam/review-doc/${exam.value.id}?mode=${mode}`)
  } else {
    router.push(`/exam/review/${exam.value.id}?mode=${mode}`)
  }
}

// 原型配置工具条
const protoCollapsed = ref(false)
const protoPublishMode = ref('immediate')
const protoPublishContent = ref('full')

const publishModes = [
  { value: 'immediate', label: '立即公布' },
  { value: 'delayAfterSubmit', label: '交卷后延迟' },
  { value: 'afterExamEnd', label: '考试结束后' },
  { value: 'delayAfterExamEnd', label: '结束后延迟' },
]
const publishContents = [
  { value: 'scoreOnly', label: '仅分数' },
  { value: 'scoreAndCorrect', label: '分数及对错' },
  { value: 'full', label: '分数对错答案解析' },
]

// 环形进度条
const ringDash = computed(() => {
  if (!exam.value || !exam.value.score) return '0 327'
  const circumference = 2 * Math.PI * 52
  const percent = exam.value.score / exam.value.totalScore
  return `${circumference * percent} ${circumference * (1 - percent)}`
})

// 公布时机文本
const publishModeText = computed(() => {
  const mode = protoPublishMode.value
  const delay = exam.value?.config?.scorePublishDelay || 3
  const map = {
    immediate: '交卷后立即公布',
    delayAfterSubmit: `交卷后${delay}天公布`,
    afterExamEnd: '考试结束后公布',
    delayAfterExamEnd: `考试结束${delay}天后公布`,
  }
  return map[mode] || '未设置'
})

// 公布内容文本
const publishContentText = computed(() => {
  const content = protoPublishContent.value
  const map = {
    scoreOnly: '仅公布分数',
    scoreAndCorrect: '公布分数及对错',
    full: '公布分数、对错、答案及解析',
  }
  return map[content] || '未设置'
})

// 是否已公布成绩（基于原型配置）
const isScorePublished = computed(() => {
  const mode = protoPublishMode.value
  if (mode === 'immediate') return true
  if (mode === 'afterExamEnd' || mode === 'after_exam') {
    return exam.value?.status === 'ended'
  }
  if (mode === 'delayAfterSubmit') {
    const delay = (exam.value?.config?.scorePublishDelay || 3) * 24 * 60 * 60 * 1000
    const submitTime = new Date(exam.value?.submitTime || exam.value?.endTime).getTime()
    return Date.now() >= submitTime + delay
  }
  if (mode === 'delayAfterExamEnd') {
    const delay = (exam.value?.config?.scorePublishDelay || 3) * 24 * 60 * 60 * 1000
    const endTime = new Date(exam.value?.endTime).getTime()
    return Date.now() >= endTime + delay
  }
  return true
})

// 成绩公布日期（未公布时显示）
const scorePublishDate = computed(() => {
  const mode = protoPublishMode.value
  const delay = (exam.value?.config?.scorePublishDelay || 3) * 24 * 60 * 60 * 1000
  let target
  if (mode === 'delayAfterSubmit') {
    const submitTime = new Date(exam.value?.submitTime || exam.value?.endTime).getTime()
    target = new Date(submitTime + delay)
  } else if (mode === 'delayAfterExamEnd') {
    const endTime = new Date(exam.value?.endTime).getTime()
    target = new Date(endTime + delay)
  } else {
    return ''
  }
  const y = target.getFullYear()
  const m = String(target.getMonth() + 1).padStart(2, '0')
  const d = String(target.getDate()).padStart(2, '0')
  const h = String(target.getHours()).padStart(2, '0')
  const min = String(target.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
})

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

/* ========== 未开始状态样式 ========== */
.not-started-content {
  padding: 12px;
}

/* 倒计时主区域 */
.countdown-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 28px 20px;
  text-align: center;
  color: white;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.35);
}

.countdown-icon {
  margin-bottom: 12px;
  opacity: 0.9;
}

.countdown-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 16px;
}

.countdown-timer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 48px;
}

.time-value {
  font-size: 32px;
  font-weight: 700;
  font-family: 'DIN Alternate', 'SF Mono', 'Menlo', monospace;
  line-height: 1.2;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 6px 10px;
  letter-spacing: 1px;
}

.time-unit {
  font-size: 11px;
  opacity: 0.8;
  margin-top: 4px;
}

.time-separator {
  font-size: 28px;
  font-weight: 600;
  opacity: 0.7;
  margin: 0 2px;
  align-self: flex-start;
  padding-top: 8px;
}

.exam-time-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 8px 16px;
  display: inline-flex;
}

/* ========== 进行中状态样式 ========== */
.in-progress-content {
  padding: 12px;
}

.countdown-hero.in-progress {
  background: linear-gradient(135deg, #FA8C16 0%, #F5A623 100%);
  box-shadow: 0 8px 24px rgba(250, 140, 22, 0.35);
}

/* 答题进度卡片 */
.progress-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid #FA8C16;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #FA8C16;
  margin-bottom: 12px;
}

.progress-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-text {
  font-size: 14px;
  color: #1D2129;
}

.progress-hint {
  font-size: 12px;
  color: #86909C;
}

.progress-arrow {
  color: #C9CDD4;
  font-size: 16px;
}

/* ========== 已结束状态样式 ========== */
.ended-content {
  padding: 12px;
}

/* 状态提示区域 */
.status-hero {
  border-radius: 16px;
  padding: 32px 20px;
  text-align: center;
  color: white;
  margin-bottom: 16px;
}

.status-hero.ended {
  background: linear-gradient(135deg, #8C8C8C 0%, #BFBFBF 100%);
  box-shadow: 0 8px 24px rgba(140, 140, 140, 0.25);
}

.status-icon {
  margin-bottom: 12px;
  opacity: 0.9;
}

.status-text {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

.status-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 8px 16px;
}

/* 环形进度条成绩卡片 */
.score-card-ring {
  background: #fff;
  border-radius: 12px;
  padding: 24px 20px;
  text-align: center;
  margin-bottom: 12px;
}

.score-ring-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
}

.score-ring {
  width: 100%;
  height: 100%;
}

.score-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.ring-score-value {
  font-size: 36px;
  font-weight: 700;
  color: #00B96B;
  display: block;
}

.ring-score-total {
  font-size: 14px;
  color: #86909c;
  display: block;
  margin-top: -4px;
}

.score-stats {
  font-size: 13px;
  color: #86909c;
}

.score-stats .dot {
  margin: 0 6px;
}

.stat-correct { color: #00B96B; }
.stat-wrong { color: #F53F3F; }
.stat-partial { color: #FF7D00; }

/* 查看答案详情入口 */
.review-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
}

.review-entry-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-entry-text {
  font-size: 15px;
  font-weight: 500;
  color: #1d2129;
}

/* 原型配置工具条 */
.proto-toolbar {
  position: fixed;
  top: 46px;
  left: 0;
  right: 0;
  z-index: 99;
  background: #fffbe6;
  border-bottom: 1px dashed #faad14;
}

.proto-toolbar.collapsed {
  background: transparent;
  border: none;
}

.proto-toolbar-content {
  padding: 8px 12px;
}

.proto-toolbar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.proto-label {
  font-size: 12px;
  font-weight: 600;
  color: #d48806;
}

.proto-collapse-btn {
  font-size: 12px;
  color: #8c8c8c;
  cursor: pointer;
}

.proto-group {
  margin-bottom: 6px;
}

.proto-group-label {
  font-size: 11px;
  color: #8c8c8c;
  display: block;
  margin-bottom: 4px;
}

.proto-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.proto-btn {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #595959;
  cursor: pointer;
}

.proto-btn.active {
  background: #00B96B;
  border-color: #00B96B;
  color: #fff;
}

.proto-toolbar-icon {
  position: absolute;
  top: 6px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fffbe6;
  border: 1px dashed #faad14;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* 未参加提示 */
.missed-card {
  background: #FFF1F0;
  border: 1px solid #FFCCC7;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 12px;
  text-align: center;
  color: #FF4D4F;
}

/* 成绩未公布提示 */
.unpublished-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
  margin-bottom: 12px;
}

.unpublished-icon {
  font-size: 48px;
  color: #c0c4cc;
}

.unpublished-title {
  font-size: 16px;
  font-weight: 600;
  color: #4e5969;
  margin: 12px 0 8px;
}

.unpublished-desc {
  font-size: 14px;
  color: #86909c;
}

.unpublished-desc .highlight {
  color: #00B96B;
  font-weight: 500;
}

.unpublished-hint {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 8px;
}

.missed-text {
  font-size: 14px;
  margin-top: 12px;
}

/* 提前进入提示条 */
.early-notice-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  margin-bottom: 12px;
  background: #E6F7FF;
  border-radius: 8px;
  font-size: 14px;
  color: #1890FF;
}

.early-notice-bar .van-icon {
  font-size: 16px;
}

/* 考试信息区域 */
.exam-info-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
}

.exam-name {
  font-size: 18px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 16px;
  line-height: 1.4;
}

.exam-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4E5969;
}

.meta-item .van-icon {
  color: #86909C;
  font-size: 16px;
}

.meta-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #4E5969;
  background: #F5F6F7;
  padding: 6px 12px;
  border-radius: 6px;
}

.meta-tag .van-icon {
  color: #86909C;
  font-size: 14px;
}

/* 信息卡片 */
.info-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 12px;
}

.card-title .van-icon {
  color: #00B96B;
  font-size: 18px;
}

.card-content {
  font-size: 14px;
  color: #4E5969;
  line-height: 1.7;
}

/* 考试须知列表 */
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notice-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notice-icon .van-icon {
  font-size: 16px;
}

.notice-icon.success {
  background: #F0FDF4;
  color: #00B96B;
}

.notice-icon.warning {
  background: #FFF7E6;
  color: #FA8C16;
}

.notice-icon.info {
  background: #E6F7FF;
  color: #1890FF;
}

.notice-text {
  font-size: 14px;
  color: #4E5969;
  line-height: 1.5;
}

/* 温馨提示 */
.tips-card {
  background: #FFFBE6;
  border: 1px solid #FFE58F;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.tips-title {
  font-size: 14px;
  font-weight: 600;
  color: #D48806;
  margin-bottom: 10px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #8C6E00;
  line-height: 1.5;
}

.tip-dot {
  width: 5px;
  height: 5px;
  background: #D48806;
  border-radius: 50%;
  margin-top: 7px;
  flex-shrink: 0;
}

/* 底部按钮 */
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

.bottom-actions :deep(.van-button--primary) {
  background: #00B96B;
  border-color: #00B96B;
}

.bottom-actions :deep(.van-button--primary.van-button--disabled) {
  background: #C9CDD4;
  border-color: #C9CDD4;
  color: #fff;
  opacity: 1;
}
</style>
