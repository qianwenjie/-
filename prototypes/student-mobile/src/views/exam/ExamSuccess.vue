<template>
  <div class="page">
    <van-nav-bar title="提交成功" left-arrow @click-left="goBack" fixed placeholder />

    <!-- 原型配置工具条 -->
    <div class="proto-toolbar" :class="{ collapsed: toolbarCollapsed }">
      <div v-if="!toolbarCollapsed" class="proto-toolbar-content">
        <div class="proto-toolbar-header">
          <span class="proto-label">🔧 原型演示配置</span>
          <span class="proto-collapse-btn" @click="toolbarCollapsed = true">收起 ∧</span>
        </div>
        <div class="proto-group">
          <span class="proto-group-label">公布时机</span>
          <div class="proto-btns">
            <span v-for="m in publishModes" :key="m.value"
              class="proto-btn" :class="{ active: publishMode === m.value }"
              @click="publishMode = m.value">{{ m.label }}</span>
          </div>
        </div>
        <div class="proto-group">
          <span class="proto-group-label">公布内容</span>
          <div class="proto-btns">
            <span v-for="c in publishContents" :key="c.value"
              class="proto-btn" :class="{ active: publishContent === c.value }"
              @click="publishContent = c.value">{{ c.label }}</span>
          </div>
        </div>
      </div>
      <div v-else class="proto-toolbar-icon" @click="toolbarCollapsed = false">
        <van-icon name="setting-o" size="20" />
      </div>
    </div>

    <div class="content" :style="{ paddingTop: toolbarCollapsed ? '50px' : '170px' }">
      <!-- 提交成功区域 -->
      <div class="success-card">
        <van-icon name="checked" class="success-icon" />
        <div class="success-title">提交成功！</div>
        <div class="success-info">
          <div>考试名称：{{ result.examName }}</div>
          <div>提交时间：{{ result.submitTime }}</div>
          <div>答题用时：{{ formatDuration(result.duration) }}</div>
        </div>
      </div>

      <!-- 成绩区域：未公布 -->
      <div v-if="!isPublished" class="unpublished-card">
        <van-icon name="clock-o" class="unpublished-icon" />
        <div class="unpublished-title">成绩暂未公布</div>
        <div class="unpublished-desc">
          成绩将于 <span class="highlight">{{ publishDate }}</span> 公布
        </div>
        <div class="unpublished-hint">请届时在考试列表中查看</div>
      </div>

      <!-- 成绩区域：已公布 -->
      <template v-if="isPublished">
        <!-- 得分展示 -->
        <div class="score-card">
          <div class="score-ring-wrap">
            <svg class="score-ring" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e8e8e8" stroke-width="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#00B96B" stroke-width="8"
                stroke-linecap="round" :stroke-dasharray="ringDash" stroke-dashoffset="0"
                transform="rotate(-90 60 60)" />
            </svg>
            <div class="score-number">
              <span class="score-value">{{ result.score }}</span>
              <span class="score-total">/ {{ result.totalScore }}</span>
            </div>
          </div>
          <div class="score-stats">
            <template v-if="publishContent === 'scoreOnly'">
              <span>答对 -- 题</span>
              <span class="dot">·</span>
              <span>答错 -- 题</span>
            </template>
            <template v-else>
              <span class="stat-correct">答对 {{ result.statistics.correctCount }} 题</span>
              <span class="dot">·</span>
              <span class="stat-wrong">答错 {{ result.statistics.wrongCount }} 题</span>
              <span v-if="result.statistics.partialCount > 0" class="dot">·</span>
              <span v-if="result.statistics.partialCount > 0" class="stat-partial">
                部分得分 {{ result.statistics.partialCount }} 题
              </span>
            </template>
          </div>
        </div>

        <!-- 查看答案详情按钮（仅分数模式不显示） -->
        <div v-if="publishContent !== 'scoreOnly'" class="review-entry" @click="goReview">
          <div class="review-entry-left">
            <van-icon name="description" size="20" color="#00B96B" />
            <span class="review-entry-text">查看答案详情</span>
          </div>
          <van-icon name="arrow" size="16" color="#c0c4cc" />
        </div>
      </template>

      <!-- 底部占位 -->
      <div style="height: 80px;"></div>
    </div>

    <!-- 底部固定按钮 -->
    <div class="bottom-bar">
      <van-button type="primary" block round @click="goBack">返回考试列表</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { mockExamResult, mockDocExamResult } from '@/mock/exam'

const router = useRouter()

// 根据路由参数决定使用哪个 mock 数据
// 实际项目中应从后端获取
const route = useRoute()
const examId = route.params.id
const isDocMode = examId === 'exam004' || examId === 'exam003' || examId === 'exam006'
const result = ref(isDocMode ? mockDocExamResult : mockExamResult)

// 原型工具条状态
const toolbarCollapsed = ref(false)
const publishMode = ref('immediate')
const publishContent = ref('full')

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

// 是否已公布成绩
const isPublished = computed(() => publishMode.value === 'immediate')

// 成绩公布日期
const publishDate = computed(() => {
  const submitDate = new Date(result.value.submitTime)
  const examEndDate = new Date(result.value.examEndTime)
  const delay = result.value.scorePublishDelay || 3
  let target
  if (publishMode.value === 'delayAfterSubmit') {
    target = new Date(submitDate.getTime() + delay * 24 * 60 * 60 * 1000)
  } else if (publishMode.value === 'afterExamEnd') {
    target = examEndDate
  } else if (publishMode.value === 'delayAfterExamEnd') {
    target = new Date(examEndDate.getTime() + delay * 24 * 60 * 60 * 1000)
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

// 环形进度
const ringDash = computed(() => {
  const circumference = 2 * Math.PI * 52
  const percent = result.value.score / result.value.totalScore
  return `${circumference * percent} ${circumference * (1 - percent)}`
})

// 格式化用时
const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`
}

// 查看答案详情
const goReview = () => {
  const id = result.value.examId
  const isDoc = result.value.paperMode === 'document'
  if (isDoc) {
    router.push(`/exam/review-doc/${id}?mode=${publishContent.value}`)
  } else {
    router.push(`/exam/review/${id}?mode=${publishContent.value}`)
  }
}

const goBack = () => {
  router.push('/exam/list')
}
</script>

<style scoped>
.page { min-height: 100vh; background-color: #f7f8fa; padding-bottom: env(safe-area-inset-bottom); }
.content { padding: 12px 16px; }

/* 原型工具条 */
.proto-toolbar {
  position: fixed; top: 46px; left: 0; right: 0; z-index: 99;
  background: #fffbe6; border-bottom: 1px dashed #faad14;
}
.proto-toolbar.collapsed { background: transparent; border: none; }
.proto-toolbar-content { padding: 8px 12px; }
.proto-toolbar-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;
}
.proto-label { font-size: 12px; font-weight: 600; color: #d48806; }
.proto-collapse-btn { font-size: 12px; color: #8c8c8c; cursor: pointer; }
.proto-group { margin-bottom: 6px; }
.proto-group-label { font-size: 11px; color: #8c8c8c; display: block; margin-bottom: 4px; }
.proto-btns { display: flex; flex-wrap: wrap; gap: 6px; }
.proto-btn {
  font-size: 11px; padding: 3px 10px; border-radius: 20px;
  background: #fff; border: 1px solid #d9d9d9; color: #595959; cursor: pointer;
}
.proto-btn.active { background: #00B96B; border-color: #00B96B; color: #fff; }
.proto-toolbar-icon {
  position: absolute; top: 6px; right: 12px;
  width: 32px; height: 32px; border-radius: 50%;
  background: #fffbe6; border: 1px dashed #faad14;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}

/* 提交成功卡片 */
.success-card {
  background: #fff; border-radius: 12px; padding: 28px 20px 20px;
  text-align: center; margin-bottom: 12px;
}
.success-icon { font-size: 64px; color: #00B96B; }
.success-title { font-size: 20px; font-weight: 600; color: #1d2129; margin: 12px 0 16px; }
.success-info { font-size: 13px; color: #86909c; line-height: 2; }

/* 未公布卡片 */
.unpublished-card {
  background: #fff; border-radius: 12px; padding: 32px 20px; text-align: center; margin-bottom: 12px;
}
.unpublished-icon { font-size: 48px; color: #c0c4cc; }
.unpublished-title { font-size: 16px; font-weight: 600; color: #4e5969; margin: 12px 0 8px; }
.unpublished-desc { font-size: 14px; color: #86909c; }
.unpublished-desc .highlight { color: #00B96B; font-weight: 500; }
.unpublished-hint { font-size: 12px; color: #c0c4cc; margin-top: 8px; }

/* 得分卡片 */
.score-card {
  background: #fff; border-radius: 12px; padding: 24px 20px; text-align: center; margin-bottom: 12px;
}
.score-ring-wrap { position: relative; width: 120px; height: 120px; margin: 0 auto 16px; }
.score-ring { width: 100%; height: 100%; }
.score-number {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;
}
.score-value { font-size: 36px; font-weight: 700; color: #00B96B; }
.score-total { font-size: 14px; color: #86909c; display: block; margin-top: -4px; }
.score-stats { font-size: 13px; color: #86909c; }
.score-stats .dot { margin: 0 6px; }
.stat-correct { color: #00B96B; }
.stat-wrong { color: #F53F3F; }
.stat-partial { color: #FF7D00; }

/* 查看答案详情入口 */
.review-entry {
  display: flex; align-items: center; justify-content: space-between;
  background: #fff; border-radius: 12px; padding: 14px 16px; margin-bottom: 12px;
}
.review-entry-left { display: flex; align-items: center; gap: 8px; }
.review-entry-text { font-size: 15px; font-weight: 500; color: #1d2129; }

/* 底部按钮 */
.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding: 10px 16px; padding-bottom: calc(10px + env(safe-area-inset-bottom));
  background: #fff; border-top: 1px solid #f2f3f5;
}
</style>
