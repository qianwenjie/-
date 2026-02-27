<template>
  <div class="score-stats-page">
    <van-nav-bar title="成绩统计" left-arrow @click-left="$router.back()" fixed placeholder />

    <div class="main-layout">
      <!-- 左侧：考试列表 -->
      <div class="exam-list">
        <div
          v-for="exam in examHistory"
          :key="exam.id"
          class="exam-item"
          :class="{ active: selectedExam?.id === exam.id }"
          @click="selectedExam = exam"
        >
          <div class="exam-item-name">{{ exam.name }}</div>
          <div class="exam-item-bottom">
            <span class="exam-item-score" :class="isPassed(exam) ? 'pass' : 'fail'">{{ exam.score }}分</span>
          </div>
        </div>
      </div>

      <!-- 右侧：分析面板 -->
      <div class="analysis-panel">
        <template v-if="selectedExam">

          <!-- ① Hero Card：成绩概览 -->
          <div class="hero-card">
            <!-- 考试名 + 及格状态 -->
            <div class="hero-header">
              <span class="hero-name">{{ selectedExam.name }}</span>
              <van-tag :type="isPassed(selectedExam) ? 'success' : 'danger'" size="medium">
                {{ isPassed(selectedExam) ? '及格' : '不及格' }}
              </van-tag>
            </div>

            <!-- 环形图 -->
            <div class="ring-wrap">
              <svg viewBox="0 0 100 100" class="ring-svg">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F2F3F5" stroke-width="9" />
                <circle
                  cx="50" cy="50" r="38" fill="none"
                  :stroke="isPassed(selectedExam) ? '#00B96B' : '#FF4D4F'"
                  stroke-width="9" stroke-linecap="round"
                  :stroke-dasharray="`${scoreRate * 2.388} 238.8`"
                  stroke-dashoffset="59.7" transform="rotate(-90 50 50)"
                />
                <circle
                  cx="50" cy="50" r="28" fill="none"
                  stroke="#C9CDD4" stroke-width="4" stroke-linecap="round"
                  :stroke-dasharray="`${avgRate * 1.759} 175.9`"
                  stroke-dashoffset="44" transform="rotate(-90 50 50)"
                />
              </svg>
              <div class="ring-center">
                <div class="ring-score" :class="isPassed(selectedExam) ? 'pass' : 'fail'">{{ selectedExam.score }}</div>
                <div class="ring-total">/{{ selectedExam.totalScore }}</div>
              </div>
            </div>

            <!-- 得分对比 -->
            <div class="score-compare">
              <div class="compare-item">
                <div class="compare-val my">{{ selectedExam.score }}</div>
                <div class="compare-label">
                  <span class="compare-dot my"></span>我的得分
                </div>
              </div>
              <div class="compare-divider"></div>
              <div class="compare-item">
                <div class="compare-val avg">{{ selectedExam.classAvg }}</div>
                <div class="compare-label">
                  <span class="compare-dot avg"></span>班级均分
                </div>
              </div>
              <div class="compare-divider"></div>
              <div class="compare-item">
                <div class="compare-val" :class="diffScore > 0 ? 'up' : diffScore < 0 ? 'down' : 'neutral'">
                  {{ diffScore > 0 ? '+' : '' }}{{ diffScore }}
                </div>
                <div class="compare-label">高于均分</div>
              </div>
            </div>

            <!-- 超越同学进度条 -->
            <div class="rank-bar">
              <van-progress
                :percentage="selectedExam.percentile"
                stroke-width="6"
                color="#165DFF"
                track-color="#EEF0F3"
                :show-pivot="false"
              />
              <div class="rank-text">超越了班级 <strong>{{ selectedExam.percentile }}%</strong> 的同学</div>
            </div>
          </div>

          <!-- ② 核心指标 2×2 -->
          <div class="metrics-grid">
            <div class="metric-item">
              <div class="metric-icon blue">≡</div>
              <div class="metric-val blue">{{ selectedExam.statistics.totalQuestions }}</div>
              <div class="metric-label">总题数</div>
            </div>
            <div class="metric-item">
              <div class="metric-icon red">✗</div>
              <div class="metric-val red">{{ selectedExam.statistics.wrongCount }}</div>
              <div class="metric-label">答错题数</div>
            </div>
            <div class="metric-item">
              <div class="metric-icon blue">⏱</div>
              <div class="metric-val blue">{{ selectedExam.answeredDuration }}<span class="metric-unit">分</span></div>
              <div class="metric-label">答题用时</div>
            </div>
            <div class="metric-item">
              <div class="metric-icon orange">⚠</div>
              <div class="metric-val orange">{{ selectedExam.leaveCount }}</div>
              <div class="metric-label">中途离开</div>
            </div>
          </div>

          <!-- ③ 题型得分率 -->
          <div class="type-section">
            <div class="panel-title">题型得分率</div>
            <div class="type-list">
              <div v-for="item in selectedExam.typeStats" :key="item.type" class="type-block">
                <div class="type-row">
                  <span class="type-name">{{ item.typeName }}</span>
                  <div class="bar-track">
                    <div
                      class="bar-fill"
                      :class="getRateClass(item.rate)"
                      :style="{ width: item.rate + '%' }"
                    ></div>
                  </div>
                  <span class="type-rate">{{ item.rate }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ④ 考试详情 -->
          <div class="info-section">
            <div class="panel-title">考试详情</div>
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">考试时间</span>
                <span class="info-val">{{ formatDateTime(selectedExam.startTime, selectedExam.endTime) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">所用试卷</span>
                <span class="info-val">{{ selectedExam.paper.name }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">出题方式</span>
                <span class="info-val">{{ selectedExam.paper.mode === 'random' ? '随机抽题' : '固定试卷' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">总时长</span>
                <span class="info-val">{{ selectedExam.totalDuration }} 分钟</span>
              </div>
              <div class="info-row">
                <span class="info-label">总分 / 题数</span>
                <span class="info-val">{{ selectedExam.totalScore }} 分 / {{ selectedExam.statistics.totalQuestions }} 题</span>
              </div>
              <div class="info-row">
                <span class="info-label">及格线</span>
                <span class="info-val">{{ selectedExam.passScore }} 分</span>
              </div>
            </div>
          </div>

        </template>

        <!-- 未选中状态 -->
        <div v-else class="empty-panel">
          <van-icon name="bar-chart-o" size="36" color="#C9CDD4" />
          <div class="empty-text">选择考试查看分析</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const examHistory = ref([
  {
    id: 'exam008',
    name: '数据结构与算法测试',
    startTime: '2026-02-10 22:00:00',
    endTime: '2026-02-11 01:00:00',
    paper: { name: '数据结构2024秋季卷A', mode: 'random' },
    totalDuration: 120,
    answeredDuration: 98,
    leaveCount: 2,
    score: 56,
    totalScore: 100,
    passScore: 60,
    classAvg: 68,
    percentile: 28,
    statistics: { totalQuestions: 40, correctCount: 20, wrongCount: 15, partialCount: 5 },
    typeStats: [
      { type: 'single',   typeName: '单选', rate: 65 },
      { type: 'multiple', typeName: '多选', rate: 40 },
      { type: 'judge',    typeName: '判断', rate: 72 },
      { type: 'blank',    typeName: '填空', rate: 45 },
      { type: 'cloze',    typeName: '完形填空', rate: 58 },
    ],
  },
  {
    id: 'exam007',
    name: '操作系统原理考试',
    startTime: '2026-01-28 09:00:00',
    endTime: '2026-01-28 12:00:00',
    paper: { name: '操作系统2024秋季卷B', mode: 'fixed' },
    totalDuration: 120,
    answeredDuration: 115,
    leaveCount: 0,
    score: 85,
    totalScore: 100,
    passScore: 60,
    classAvg: 74,
    percentile: 82,
    statistics: { totalQuestions: 45, correctCount: 32, wrongCount: 8, partialCount: 5 },
    typeStats: [
      { type: 'single',   typeName: '单选', rate: 90 },
      { type: 'multiple', typeName: '多选', rate: 70 },
      { type: 'judge',    typeName: '判断', rate: 88 },
      { type: 'composite', typeName: '复合题', rate: 68 },
      { type: 'essay',    typeName: '简答', rate: 75 },
    ],
  },
  {
    id: 'exam006',
    name: '英语四级模拟测试',
    startTime: '2026-01-25 08:30:00',
    endTime: '2026-01-25 11:00:00',
    paper: { name: '英语四级模拟卷2024', mode: 'fixed' },
    totalDuration: 150,
    answeredDuration: 142,
    leaveCount: 1,
    score: 78,
    totalScore: 100,
    passScore: 60,
    classAvg: 71,
    percentile: 68,
    statistics: { totalQuestions: 60, correctCount: 45, wrongCount: 10, partialCount: 5 },
    typeStats: [
      { type: 'single',   typeName: '单选', rate: 82 },
      { type: 'multiple', typeName: '多选', rate: 60 },
      { type: 'judge',    typeName: '判断', rate: 85 },
      { type: 'blank',    typeName: '填空', rate: 75 },
      { type: 'cloze',    typeName: '完形填空', rate: 65 },
      { type: 'essay',    typeName: '简答', rate: 70 },
    ],
  },
])

const selectedExam = ref(examHistory.value[0])

const scoreRate = computed(() =>
  selectedExam.value ? (selectedExam.value.score / selectedExam.value.totalScore) * 100 : 0
)
const avgRate = computed(() =>
  selectedExam.value ? (selectedExam.value.classAvg / selectedExam.value.totalScore) * 100 : 0
)
const diffScore = computed(() =>
  selectedExam.value ? selectedExam.value.score - selectedExam.value.classAvg : 0
)

const isPassed = (exam) => exam.score >= exam.passScore

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

const formatDateTime = (startTime, endTime) => {
  const startDate = new Date(startTime)
  const endDate = new Date(endTime)
  const fmt = (d) => {
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    return `${month}月${day}日 ${hour}:${minute}`
  }
  const isSameDay = startDate.getFullYear() === endDate.getFullYear() &&
                    startDate.getMonth() === endDate.getMonth() &&
                    startDate.getDate() === endDate.getDate()
  const endStr = isSameDay
    ? `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`
    : fmt(endDate)
  return `${fmt(startDate)} ~ ${endStr}`
}

const getRateClass = (rate) => {
  if (rate >= 80) return 'rate-good'
  if (rate >= 60) return 'rate-mid'
  return 'rate-bad'
}
</script>

<style scoped>
.score-stats-page {
  min-height: 100vh;
  background: #F5F6F7;
}

/* 左右分栏 */
.main-layout {
  display: flex;
  height: calc(100vh - 46px);
}

/* 左侧列表 */
.exam-list {
  width: 110px;
  flex-shrink: 0;
  background: #fff;
  overflow-y: auto;
  border-right: 1px solid #F2F3F5;
}

.exam-item {
  padding: 10px 10px;
  border-bottom: 1px solid #F7F8FA;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.exam-item.active {
  background: #F0FFF8;
  border-right: 3px solid #00B96B;
}

.exam-item-name {
  font-size: 11px;
  color: #1D2129;
  font-weight: 500;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.exam-item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.exam-item-score {
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.exam-item-score.pass { color: #00B96B; }
.exam-item-score.fail { color: #FF4D4F; }

.exam-item-date {
  font-size: 10px;
  color: #C9CDD4;
}

/* 右侧面板 */
.analysis-panel {
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 考试信息 */
.info-section {
  background: white;
  border-radius: 12px;
  padding: 12px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11px;
  line-height: 1.5;
}

.info-label {
  color: #86909C;
  flex-shrink: 0;
  width: 56px;
}

.info-val {
  color: #1D2129;
  font-weight: 500;
  flex: 1;
  word-break: break-all;
}

/* Hero Card */
.hero-card {
  background: white;
  border-radius: 12px;
  padding: 14px 12px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.hero-header {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
}

.hero-name {
  font-size: 13px;
  font-weight: 600;
  color: #1D2129;
  line-height: 1.4;
  flex: 1;
}

/* 环形图 */
.ring-wrap {
  position: relative;
  width: 110px;
  height: 110px;
}

.ring-svg {
  width: 100%;
  height: 100%;
}

.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ring-score {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.ring-score.pass { color: #00B96B; }
.ring-score.fail { color: #FF4D4F; }

.ring-total {
  font-size: 11px;
  color: #86909C;
  margin-top: 2px;
}

/* 得分对比 */
.score-compare {
  width: 100%;
  display: flex;
  align-items: center;
  background: #F7F8FA;
  border-radius: 10px;
  padding: 10px 0;
}

.compare-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.compare-divider {
  width: 1px;
  height: 28px;
  background: #E5E6EB;
}

.compare-val {
  font-size: 20px;
  font-weight: 700;
  color: #1D2129;
  line-height: 1;
}

.compare-val.my      { color: #00B96B; }
.compare-val.avg     { color: #86909C; }
.compare-val.up      { color: #00B96B; }
.compare-val.down    { color: #FF4D4F; }
.compare-val.neutral { color: #1D2129; }

.compare-label {
  font-size: 10px;
  color: #86909C;
  display: flex;
  align-items: center;
  gap: 3px;
}

.compare-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.compare-dot.my  { background: #00B96B; }
.compare-dot.avg { background: #C9CDD4; }

/* 超越进度条 */
.rank-bar {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.rank-text {
  font-size: 11px;
  color: #86909C;
  text-align: center;
}

.rank-text strong {
  color: #165DFF;
  font-weight: 600;
}

/* 指标格 2×2 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.metric-item {
  background: white;
  border-radius: 10px;
  padding: 10px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.metric-icon {
  font-size: 13px;
  line-height: 1;
  margin-bottom: 2px;
}

.metric-icon.green  { color: #00B96B; }
.metric-icon.red    { color: #FF4D4F; }
.metric-icon.blue   { color: #165DFF; }
.metric-icon.orange { color: #FA8C16; }

.metric-val {
  font-size: 22px;
  font-weight: 700;
  color: #1D2129;
  line-height: 1.1;
}

.metric-val.green  { color: #00B96B; }
.metric-val.red    { color: #FF4D4F; }
.metric-val.blue   { color: #165DFF; }
.metric-val.orange { color: #FA8C16; }

.metric-unit {
  font-size: 11px;
  font-weight: 400;
  color: #86909C;
  margin-left: 1px;
}

.metric-label {
  font-size: 10px;
  color: #86909C;
  margin-top: 1px;
}

/* 题型得分率 */
.type-section {
  background: white;
  border-radius: 12px;
  padding: 12px;
}

.panel-title {
  font-size: 12px;
  font-weight: 600;
  color: #4E5969;
  margin-bottom: 10px;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.type-block {
  display: flex;
  flex-direction: column;
}

.type-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.type-name {
  font-size: 11px;
  font-weight: 500;
  color: #4E5969;
  width: 32px;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 6px;
  background: #F2F3F5;
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.rate-good { background: #00B96B; }
.rate-mid  { background: #FF7D00; }
.rate-bad  { background: #FF4D4F; }

.type-rate {
  font-size: 11px;
  font-weight: 600;
  color: #4E5969;
  width: 32px;
  text-align: right;
  flex-shrink: 0;
}

/* 空状态 */
.empty-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.empty-text {
  font-size: 13px;
  color: #C9CDD4;
}
</style>
