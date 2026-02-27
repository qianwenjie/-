<template>
  <div class="practice-result-page">
    <van-nav-bar title="刷题结果" fixed placeholder />

    <div class="result-content">
      <!-- 环形进度图 -->
      <div class="ring-section">
        <svg viewBox="0 0 120 120" class="ring-chart">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#f2f3f5" stroke-width="10" />
          <circle cx="60" cy="60" r="52" fill="none"
            stroke="var(--primary-color, #00B96B)"
            stroke-width="10" stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div class="ring-center">
          <span class="ring-value">{{ masteredRate }}</span>
          <span class="ring-unit">%</span>
        </div>
        <div class="ring-label">掌握比例</div>
      </div>

      <!-- 抽题模式 -->
      <div class="mode-section">
        <span class="mode-tag" :class="isRandom ? 'random' : 'fixed'">
          {{ isRandom ? '随机抽题' : '固定抽题' }}
        </span>
        <span class="mode-desc">
          {{ isRandom ? '每次刷题从题库随机抽取，题目可能不同' : '每次刷题题目相同，适合反复巩固' }}
        </span>
      </div>

      <!-- 统计 -->
      <div class="stats-grid">
        <div class="stat-item correct">
          <span class="stat-num">{{ store.correctCount }}</span>
          <span class="stat-label">答对</span>
        </div>
        <div class="stat-item wrong">
          <span class="stat-num">{{ store.wrongCount }}</span>
          <span class="stat-label">答错</span>
        </div>
        <div class="stat-item unanswered">
          <span class="stat-num">{{ unansweredCount }}</span>
          <span class="stat-label">未答</span>
        </div>
      </div>

      <!-- 入口卡片 -->
      <div class="entry-cards">
        <div class="entry-card" @click="goWrongBook">
          <div class="entry-left">
            <van-icon name="notes-o" color="#F53F3F" size="24" />
            <span>查看错题</span>
            <van-tag type="danger" size="small">{{ store.wrongCount }}题</van-tag>
          </div>
          <van-icon name="arrow" color="#c9cdd4" size="14" />
        </div>
        <div class="entry-card" @click="goFavorites">
          <div class="entry-left">
            <van-icon name="star-o" color="#FFD700" size="24" />
            <span>查看收藏</span>
            <van-tag type="warning" size="small">{{ store.favorites.length }}题</van-tag>
          </div>
          <van-icon name="arrow" color="#c9cdd4" size="14" />
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-actions safe-area-bottom">
      <van-button type="default" size="large" @click="resetAndRestart">再刷一次</van-button>
      <van-button type="primary" size="large" @click="$router.push('/practice/list')">返回列表</van-button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores'
import { showDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const store = usePracticeStore()
const taskId = route.params.id
const task = ref(null)

const circumference = 2 * Math.PI * 52
const masteredRate = computed(() => store.masteredRate)
const dashOffset = computed(() => circumference - (circumference * masteredRate.value) / 100)
const unansweredCount = computed(() => store.questions.length - store.answeredCount)

onMounted(async () => {
  if (!store.currentTask || store.currentTask.id !== taskId) {
    await store.fetchTaskDetail(taskId)
  }
  task.value = store.currentTask
  if (!store.questions.length) {
    await store.initPractice(taskId)
  }
})

const goWrongBook = () => router.push('/practice/wrong-book')
const goFavorites = () => router.push('/practice/favorites')

const isRandom = computed(() => task.value?.questionMode === 'random')

const resetAndRestart = async () => {
  const mode = isRandom.value ? '随机' : '固定'
  const hint = isRandom.value
    ? '随机模式下将重新从题库抽取题目，当前答题记录将被清除。'
    : '固定模式下题目不变，当前答题记录将被清除。'
  try {
    await showDialog({
      title: '再刷一次',
      message: `当前为${mode}抽题模式，${hint}\n确定要重新开始吗？`,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      confirmButtonColor: '#00B96B',
    })
    store.resetPractice(taskId)
    router.replace({
      path: `/practice/answer/${taskId}`,
      query: isRandom.value ? { drawCount: String(task.value.drawCount || 0) } : {},
    })
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.practice-result-page {
  min-height: 100vh;
  background: var(--bg-color, #f7f8fa);
}

.result-content {
  padding: 24px 16px 100px;
}

.ring-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-bottom: 24px;
}

.ring-chart {
  width: 140px;
  height: 140px;
}

.ring-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -60%);
  display: flex;
  align-items: baseline;
}

.ring-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary, #1d2129);
}

.ring-unit {
  font-size: 16px;
  color: var(--text-secondary, #4e5969);
  margin-left: 2px;
}

.ring-label {
  font-size: 14px;
  color: var(--text-secondary, #4e5969);
  margin-top: -10px;
}

.mode-section {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.mode-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 10px;
  flex-shrink: 0;
}

.mode-tag.fixed {
  color: #165DFF;
  background: #E8F3FF;
}

.mode-tag.random {
  color: #FF7D00;
  background: #FFF7E8;
}

.mode-desc {
  font-size: 12px;
  color: #86909c;
  line-height: 1.4;
}

.stats-grid {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 28px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary, #4e5969);
  margin-top: 4px;
}

.stat-item.correct .stat-num { color: var(--success-color, #00B42A); }
.stat-item.wrong .stat-num { color: var(--error-color, #F53F3F); }
.stat-item.unanswered .stat-num { color: #86909c; }

.entry-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.entry-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
}

.entry-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary, #1d2129);
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #f2f3f5;
}

.bottom-actions .van-button {
  flex: 1;
}
</style>
