<template>
  <div class="exam-list-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="我的考试" fixed placeholder />

    <!-- 筛选标签 -->
    <van-tabs v-model:active="activeTab" @change="handleTabChange" sticky>
      <van-tab title="全部" name="all" />
      <van-tab title="未开始" name="not_started" />
      <van-tab title="进行中" name="in_progress" />
      <van-tab title="已结束" name="ended" />
    </van-tabs>

    <!-- 考试列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-for="exam in examList" :key="exam.id" class="exam-card" @click="goToDetail(exam.id)">
          <div class="exam-header">
            <div class="exam-title">{{ exam.name }}</div>
            <van-tag :type="getStatusType(exam.status)">{{ getStatusText(exam.status) }}</van-tag>
          </div>

          <div class="exam-info">
            <div class="info-item">
              <van-icon name="clock-o" />
              <span>{{ formatTime(exam.startTime) }} - {{ formatTime(exam.endTime) }}</span>
            </div>
            <div class="info-item">
              <van-icon name="notes-o" />
              <span>{{ exam.paper.name }}</span>
            </div>
            <div class="info-item">
              <van-icon name="clock" />
              <span>时长 {{ exam.duration }} 分钟</span>
            </div>
            <div v-if="exam.config.maxAttempts > 1" class="info-item">
              <van-icon name="replay" />
              <span>作答 {{ exam.config.currentAttempt }}/{{ exam.config.maxAttempts }} 次</span>
            </div>
          </div>

          <div class="exam-footer">
            <div class="score-info">
              <span v-if="exam.myStatus === 'submitted' && exam.score !== null">
                得分：<span class="score">{{ exam.score }}</span> / {{ exam.totalScore }}
              </span>
              <span v-else>
                总分：{{ exam.totalScore }}
              </span>
            </div>
            <van-button
              v-if="canEnter(exam)"
              type="primary"
              size="small"
              @click.stop="enterExam(exam.id)"
            >
              {{ exam.myStatus === 'in_progress' ? '继续答题' : '进入考试' }}
            </van-button>
            <van-button
              v-else-if="exam.myStatus === 'submitted'"
              type="default"
              size="small"
              @click.stop="viewResult(exam.id)"
            >
              查看成绩
            </van-button>
          </div>
        </div>

        <!-- 空状态 -->
        <van-empty v-if="!loading && examList.length === 0" description="暂无考试" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '@/stores'
import { showToast } from 'vant'

const router = useRouter()
const examStore = useExamStore()

// 状态
const activeTab = ref('all')
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 20

// 考试列表
const examList = computed(() => examStore.examList)

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
const handleTabChange = () => {
  onRefresh()
}

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

// 格式化时间
const formatTime = (time) => {
  const date = new Date(time)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

// 是否可以进入考试
const canEnter = (exam) => {
  return exam.status === 'in_progress' && exam.myStatus !== 'submitted'
}

// 进入考试详情
const goToDetail = (examId) => {
  router.push(`/exam/detail/${examId}`)
}

// 进入考试
const enterExam = (examId) => {
  router.push(`/exam/face-verify/${examId}`)
}

// 查看成绩
const viewResult = (examId) => {
  router.push(`/exam/result/${examId}`)
}

onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.exam-list-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 50px;
}

.exam-card {
  margin: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.exam-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  flex: 1;
  margin-right: 8px;
}

.exam-info {
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4e5969;
}

.info-item .van-icon {
  margin-right: 6px;
  color: #86909c;
}

.exam-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e5e6eb;
}

.score-info {
  font-size: 14px;
  color: #4e5969;
}

.score {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
}
</style>
