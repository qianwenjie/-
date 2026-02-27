<template>
  <div class="stats-page">
    <van-nav-bar fixed placeholder title="刷题统计" left-arrow @click-left="router.back()" />

    <!-- 总览卡片 -->
    <div class="overview-card">
      <div class="overview-top">
        <div class="overview-item">
          <div class="ov-value">{{ totalAnswered }}</div>
          <div class="ov-label">累计答题</div>
        </div>
        <div class="overview-divider"></div>
        <div class="overview-item">
          <div class="ov-value">{{ totalCorrect }}</div>
          <div class="ov-label">答对题数</div>
        </div>
        <div class="overview-divider"></div>
        <div class="overview-item">
          <div class="ov-value ov-wrong">{{ totalWrong }}</div>
          <div class="ov-label">错题数</div>
        </div>
        <div class="overview-divider"></div>
        <div class="overview-item">
          <div class="ov-value ov-mastered">{{ totalMastered }}</div>
          <div class="ov-label">已掌握</div>
        </div>
      </div>
      <div class="overview-bottom">
        <div class="accuracy-row">
          <span class="accuracy-label">综合正确率</span>
          <span class="accuracy-value">{{ overallAccuracy }}%</span>
        </div>
        <van-progress :percentage="overallAccuracy" :pivot-text="overallAccuracy + '%'"
          color="#00B96B" track-color="#e8f8f0" stroke-width="8" />
      </div>
    </div>

    <!-- 刷题天数 & 任务数 -->
    <div class="stat-row">
      <div class="stat-card">
        <van-icon name="calendar-o" class="stat-icon blue" />
        <div class="stat-num">{{ totalDays }}</div>
        <div class="stat-desc">累计刷题天数</div>
      </div>
      <div class="stat-card">
        <van-icon name="todo-list-o" class="stat-icon green" />
        <div class="stat-num">{{ tasks.length }}</div>
        <div class="stat-desc">参与任务数</div>
      </div>
      <div class="stat-card">
        <van-icon name="fire-o" class="stat-icon orange" />
        <div class="stat-num">{{ todayTotal }}</div>
        <div class="stat-desc">今日答题数</div>
      </div>
    </div>

    <!-- 薄弱题型分析 -->
    <div class="section">
      <div class="section-title">薄弱题型分析</div>
      <div v-if="weakTypeStats.length === 0" class="empty-tip">暂无错题数据</div>
      <div v-else class="weak-panel">
        <!-- 最薄弱提示行 -->
        <div class="wp-header">
          <span class="wtc-badge">最薄弱</span>
          <span class="wp-top-type">{{ weakTypeStats[0].label }}</span>
          <span class="wp-top-rate">错题率 {{ weakTypeStats[0].wrongRate }}%</span>
        </div>
        <div class="wp-divider"></div>
        <!-- 各题型数据列表 -->
        <div class="type-list">
          <div v-for="t in weakTypeStats" :key="t.type" class="type-list-row">
            <span class="tl-name">{{ t.label }}</span>
            <span class="tl-stat">共 <b>{{ t.total }}</b> 道</span>
            <span class="tl-stat">错 <b>{{ t.count }}</b> 道</span>
            <span class="tl-rate">错题率 <b>{{ t.wrongRate }}%</b></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 待重做错题（按任务） -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">待重做错题</div>
        <span class="section-link" @click="router.push('/practice/wrong-book')">
          错题本 <van-icon name="arrow" />
        </span>
      </div>
      <div v-if="pendingByTask.length === 0" class="empty-tip">太棒了，暂无待复习错题！</div>
      <div v-else class="task-wrong-list">
        <div v-for="t in pendingByTask" :key="t.taskId" class="task-wrong-row"
          @click="router.push(`/practice/wrong-book/review/${t.taskId}`)">
          <div class="twr-left">
            <div class="twr-name">{{ t.taskName }}</div>
            <div class="twr-sub">{{ t.wrongCount }} 道未重做</div>
          </div>
          <div class="twr-right">
            <span class="twr-badge">{{ t.wrongCount }}</span>
            <van-icon name="arrow" class="twr-arrow" />
          </div>
        </div>
      </div>
    </div>

    <!-- 已掌握 & 收藏 -->
    <div class="section">
      <div class="bottom-stat-row">
        <div class="bottom-stat-card" @click="router.push('/practice/wrong-book')">
          <van-icon name="passed" class="bsc-icon green" />
          <div class="bsc-num text-green">{{ wrongStore.totalMasteredWrongCount }}</div>
          <div class="bsc-label">已掌握错题</div>
          <van-icon name="arrow" class="bsc-arrow" />
        </div>
        <div class="bottom-stat-card" @click="router.push('/practice/favorites')">
          <van-icon name="star" class="bsc-icon orange" />
          <div class="bsc-num text-orange">{{ wrongStore.favorites.length }}</div>
          <div class="bsc-label">收藏题目</div>
          <van-icon name="arrow" class="bsc-arrow" />
        </div>
      </div>
    </div>

    <div style="height: 24px;"></div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores/practice'

const router = useRouter()
const wrongStore = usePracticeStore()

onMounted(async () => {
  await wrongStore.fetchTaskList()
  wrongStore.loadWrongBook()
  wrongStore.loadFavorites()
})

const tasks = computed(() => wrongStore.taskList || [])

// 总览数据
const totalAnswered = computed(() => tasks.value.reduce((s, t) => s + (t.answeredCount || 0), 0))
const totalCorrect = computed(() => tasks.value.reduce((s, t) => s + (t.correctCount || 0), 0))
const totalWrong = computed(() => totalAnswered.value - totalCorrect.value)
const totalMastered = computed(() => tasks.value.reduce((s, t) => s + (t.masteredCount || 0), 0))
const overallAccuracy = computed(() =>
  totalAnswered.value > 0 ? Math.round(totalCorrect.value / totalAnswered.value * 100) : 0
)
const totalDays = computed(() => tasks.value.reduce((s, t) => s + (t.practiceDays || 0), 0))
const todayTotal = computed(() => tasks.value.reduce((s, t) => s + (t.todayCount || 0), 0))

// 题型配置
const typeMap = {
  single:    { label: '单选题' },
  multiple:  { label: '多选题' },
  judge:     { label: '判断题' },
  blank:     { label: '填空题' },
  essay:     { label: '简答题' },
  cloze:     { label: '完形填空' },
  composite: { label: '复合题' },
}

// 各题型模拟总题数（原型数据）
const mockTotalByType = {
  single: 30, multiple: 15, judge: 20, blank: 10, essay: 8, cloze: 5, composite: 4
}

// 薄弱题型分析：按题型统计未掌握错题数，计算错题率，按错题率降序
const weakTypeStats = computed(() => {
  const wb = wrongStore.wrongBook || {}
  const typeCount = {}
  Object.values(wb).forEach(item => {
    if (item.mastered) return
    const type = item.question?.type
    if (!type) return
    typeCount[type] = (typeCount[type] || 0) + 1
  })
  if (Object.keys(typeCount).length === 0) return []
  return Object.entries(typeCount)
    .map(([type, count]) => {
      const total = mockTotalByType[type] || count * 3
      return {
        type,
        label: typeMap[type]?.label || type,
        count,
        total,
        wrongRate: Math.round(count / total * 100),
      }
    })
    .sort((a, b) => b.wrongRate - a.wrongRate)
})

// 待重做错题：按任务分组，统计每个任务未掌握数量
const pendingByTask = computed(() => {
  const wb = wrongStore.wrongBook || {}
  const taskMap = {}
  Object.values(wb).forEach(item => {
    if (item.mastered) return
    const tid = item.sourceTaskId
    if (!taskMap[tid]) taskMap[tid] = { taskId: tid, taskName: item.sourceTaskName || tid, wrongCount: 0 }
    taskMap[tid].wrongCount++
  })
  return Object.values(taskMap).sort((a, b) => b.wrongCount - a.wrongCount)
})
</script>

<style scoped>
.stats-page { min-height: 100vh; background: #f5f6f7; padding-bottom: 24px; }

/* 总览卡片 */
.overview-card {
  margin: 12px;
  background: linear-gradient(135deg, #00B96B 0%, #00D68F 100%);
  border-radius: 14px; padding: 20px 16px 16px;
  color: white; box-shadow: 0 4px 16px rgba(0,185,107,0.25);
}
.overview-top { display: flex; align-items: center; margin-bottom: 18px; }
.overview-item { flex: 1; text-align: center; }
.ov-value { font-size: 24px; font-weight: 700; line-height: 1.2; }
.ov-wrong { color: #FFD666; }
.ov-mastered { color: #B5F5EC; }
.ov-label { font-size: 11px; opacity: 0.85; margin-top: 4px; }
.overview-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.3); }
.accuracy-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; opacity: 0.9; }
.accuracy-value { font-weight: 700; font-size: 15px; }

/* 三格统计 */
.stat-row { display: flex; gap: 10px; margin: 0 12px 12px; }
.stat-card { flex: 1; background: #fff; border-radius: 12px; padding: 14px 8px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.stat-icon { font-size: 22px; margin-bottom: 6px; display: block; }
.stat-icon.blue { color: #3491FA; }
.stat-icon.green { color: #00B96B; }
.stat-icon.orange { color: #FF7D00; }
.stat-num { font-size: 20px; font-weight: 700; color: #1D2129; }
.stat-desc { font-size: 11px; color: #86909C; margin-top: 2px; }

/* 通用 section */
.section { margin: 0 12px 12px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.section-title { font-size: 15px; font-weight: 600; color: #1D2129; margin-bottom: 10px; }
.section-link { font-size: 13px; color: #00B96B; display: flex; align-items: center; gap: 2px; cursor: pointer; }
.section-header .section-title { margin-bottom: 0; }

/* 薄弱题型面板 */
.weak-panel {
  background: #fff; border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden;
}
.wp-header {
  display: flex; align-items: center; gap: 8px; padding: 12px 16px;
}
.wtc-badge { font-size: 11px; color: #F53F3F; background: #fff1f0; border: 1px solid #ffccc7; padding: 2px 8px; border-radius: 10px; flex-shrink: 0; }
.wp-top-type { font-size: 14px; font-weight: 600; color: #1D2129; }
.wp-top-rate { font-size: 13px; color: #86909C; margin-left: auto; }
.wp-divider { height: 1px; background: #f5f6f7; }

.type-list { padding: 4px 0; }
.type-list-row {
  display: flex; align-items: center; padding: 10px 16px; gap: 0;
  border-bottom: 1px solid #f5f6f7;
}
.type-list-row:last-child { border-bottom: none; }
.tl-name { font-size: 13px; color: #1D2129; width: 60px; flex-shrink: 0; }
.tl-stat { font-size: 12px; color: #86909C; flex: 1; }
.tl-stat b { color: #1D2129; font-weight: 600; }
.tl-rate { font-size: 12px; color: #86909C; flex-shrink: 0; }
.tl-rate b { color: #F53F3F; font-weight: 600; }

/* 待重做错题（按任务） */
.task-wrong-list { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.task-wrong-row {
  display: flex; align-items: center; padding: 14px 16px;
  border-bottom: 1px solid #f5f6f7; cursor: pointer;
}
.task-wrong-row:last-child { border-bottom: none; }
.twr-left { flex: 1; }
.twr-name { font-size: 14px; font-weight: 500; color: #1D2129; margin-bottom: 3px; }
.twr-sub { font-size: 12px; color: #86909C; }
.twr-right { display: flex; align-items: center; gap: 8px; }
.twr-badge { background: #F53F3F; color: #fff; font-size: 12px; font-weight: 600; min-width: 22px; height: 22px; border-radius: 11px; display: flex; align-items: center; justify-content: center; padding: 0 6px; }
.twr-arrow { color: #C9CDD4; font-size: 14px; }

/* 已掌握 & 收藏 */
.bottom-stat-row { display: flex; gap: 10px; }
.bottom-stat-card {
  flex: 1; background: #fff; border-radius: 12px; padding: 16px 12px;
  display: flex; flex-direction: column; align-items: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); cursor: pointer; position: relative;
}
.bsc-icon { font-size: 26px; margin-bottom: 6px; }
.bsc-icon.green { color: #00B96B; }
.bsc-icon.orange { color: #FF7D00; }
.bsc-num { font-size: 22px; font-weight: 700; line-height: 1.2; }
.bsc-label { font-size: 12px; color: #86909C; margin-top: 4px; }
.bsc-arrow { position: absolute; right: 10px; top: 10px; color: #C9CDD4; font-size: 13px; }

/* 空状态 */
.empty-tip { text-align: center; font-size: 13px; color: #86909C; padding: 20px 0; background: #fff; border-radius: 12px; }
</style>
