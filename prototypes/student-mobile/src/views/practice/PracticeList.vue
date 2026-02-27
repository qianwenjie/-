<template>
  <div class="practice-list-page">
    <!-- 顶部区域 -->
    <div class="header-section">
      <div class="page-title">
        <span>刷题练习</span>
        <div class="header-actions">
          <div class="action-icon" @click="$router.push('/practice/wrong-book')">
            <van-icon name="notes-o" size="20" />
            <span>错题本</span>
          </div>
          <div class="action-icon" @click="$router.push('/practice/favorites')">
            <van-icon name="star-o" size="20" />
            <span>收藏</span>
          </div>
        </div>
      </div>
      <van-search
        v-model="searchText"
        placeholder="搜索任务名称"
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
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </div>
      </div>
      <div class="sort-btn" @click="toggleSort">
        <van-icon :name="sortDesc ? 'descending' : 'ascending'" size="14" />
        <span>{{ sortDesc ? '最新' : '最早' }}</span>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="list-section">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text=""
          @load="onLoad"
        >
          <div
            v-for="task in filteredList"
            :key="task.id"
            class="task-card"
            @click="goToDetail(task.id)"
          >
            <div class="card-body">
              <!-- 头部 -->
              <div class="card-header">
                <h3 class="task-name">{{ task.name }}</h3>
                <van-tag :type="getStatusType(task.status)" size="medium">
                  {{ getStatusText(task.status) }}
                </van-tag>
              </div>

              <!-- 信息行 -->
              <div class="task-info">
                <div class="info-row">
                  <van-icon name="clock-o" />
                  <span>{{ formatDate(task.startTime) }} ~ {{ formatDate(task.endTime) }}</span>
                </div>
                <div class="info-tags">
                  <span class="tag" :class="task.questionMode === 'fixed' ? 'mode-fixed' : 'mode-random'">
                    {{ task.questionMode === 'fixed' ? '固定' : '随机' }}
                  </span>
                </div>
              </div>

              <!-- 进度条 -->
              <div class="progress-section">
                <div class="progress-bar-wrapper">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: getAnsweredPercent(task) + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ task.answeredCount }}/{{ task.totalQuestions }}</span>
                </div>
                <div class="progress-stats">
                  <span>正确率 {{ getCorrectRate(task) }}%</span>
                  <span>掌握度 {{ getMasteredPercent(task) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <van-empty
            v-if="!loading && filteredList.length === 0"
            image="search"
            :description="emptyText"
          />
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores'
import { showToast } from 'vant'

const router = useRouter()
const store = usePracticeStore()

const activeTab = ref('all')
const searchText = ref('')
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const sortDesc = ref(true)

const tabs = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'in_progress' },
  { label: '未开始', value: 'not_started' },
  { label: '已结束', value: 'ended' },
]

const toggleSort = () => {
  sortDesc.value = !sortDesc.value
}

const filteredList = computed(() => {
  let list = [...store.taskList]
  if (activeTab.value !== 'all') {
    list = list.filter(t => t.status === activeTab.value)
  }
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    list = list.filter(t => t.name.toLowerCase().includes(kw))
  }
  list.sort((a, b) => {
    const ta = new Date(a.startTime).getTime()
    const tb = new Date(b.startTime).getTime()
    return sortDesc.value ? tb - ta : ta - tb
  })
  return list
})

const emptyText = computed(() => {
  if (searchText.value) return '未找到相关任务'
  const tabText = tabs.find(t => t.value === activeTab.value)?.label || ''
  return `暂无${tabText === '全部' ? '' : tabText}任务`
})

const onLoad = async () => {
  try {
    await store.fetchTaskList()
    finished.value = true
  } catch {
    showToast('加载失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = () => {
  finished.value = false
  store.taskList = []
  onLoad()
}

const onSearch = () => {}

const goToDetail = (id) => {
  router.push(`/practice/detail/${id}`)
}

const getStatusType = (status) => {
  const map = { not_started: 'primary', in_progress: 'warning', ended: 'default' }
  return map[status] || 'default'
}

const getStatusText = (status) => {
  const map = { not_started: '未开始', in_progress: '进行中', ended: '已结束' }
  return map[status] || '未知'
}

const getMasteredPercent = (task) => {
  if (!task.totalQuestions) return 0
  return Math.round((task.masteredCount / task.totalQuestions) * 100)
}

const getCorrectRate = (task) => {
  if (!task.answeredCount) return 0
  return Math.round((task.correctCount / task.answeredCount) * 100)
}

const getAnsweredPercent = (task) => {
  if (!task.totalQuestions) return 0
  return Math.round((task.answeredCount / task.totalQuestions) * 100)
}

const getMasteryLevel = (task) => {
  const p = getMasteredPercent(task)
  if (p >= 70) return 'good'
  if (p >= 40) return 'medium'
  return 'weak'
}

const getMasteryText = (task) => {
  const map = { good: '掌握', medium: '一般', weak: '薄弱' }
  return map[getMasteryLevel(task)]
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.slice(5, 16).replace('-', '/') // MM/DD HH:mm
}
</script>

<style scoped>
.practice-list-page {
  min-height: 100vh;
  background-color: var(--bg-color, #f7f8fa);
  padding-bottom: 60px;
}

.header-section {
  background: linear-gradient(135deg, var(--primary-color, #00B96B) 0%, #00a65e 100%);
  padding: 16px 16px 12px;
  color: white;
}

.page-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.action-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  opacity: 0.9;
  cursor: pointer;
}

.action-icon span {
  margin-top: 2px;
}

.header-section :deep(.van-search) {
  padding: 0;
}

.header-section :deep(.van-search__content) {
  background: rgba(255, 255, 255, 0.2);
}

.header-section :deep(.van-search__content input::placeholder) {
  color: rgba(255, 255, 255, 0.7);
}

.header-section :deep(.van-field__left-icon .van-icon) {
  color: rgba(255, 255, 255, 0.8);
}

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

.sort-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #86909C;
  padding: 6px 10px;
  background: #F5F6F7;
  border-radius: 14px;
  cursor: pointer;
}

.tab-item {
  padding: 6px 12px;
  font-size: 13px;
  color: #4E5969;
  background: #F5F6F7;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-item.active {
  background: #00B96B;
  color: white;
  font-weight: 500;
}

.list-section {
  padding: 12px 16px;
}

.task-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.card-body {
  flex: 1;
  padding: 14px;
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #1d2129);
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-info {
  margin-bottom: 10px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary, #4e5969);
  margin-bottom: 6px;
}

.info-row .van-icon {
  font-size: 14px;
}

.info-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  background: #f2f3f5;
  color: var(--text-secondary, #4e5969);
  border-radius: 4px;
}

.tag.mode-fixed {
  background: #e8f7f0;
  color: var(--primary-color, #00B96B);
}

.tag.mode-random {
  background: #e8f0fe;
  color: #3491FA;
}

.tag.mastery-good {
  background: #f0fff4;
  color: var(--success-color, #00B42A);
}

.tag.mastery-medium {
  background: #fff7e6;
  color: var(--warning-color, #FF7D00);
}

.tag.mastery-weak {
  background: #fff2f0;
  color: var(--error-color, #F53F3F);
}

.progress-section {
  margin-top: 4px;
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
  background: var(--primary-color, #00B96B);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-color, #00B96B);
  min-width: 36px;
  text-align: right;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #86909c;
  margin-top: 4px;
}
</style>
