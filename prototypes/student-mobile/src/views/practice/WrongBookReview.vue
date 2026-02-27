<template>
  <div class="wrong-book-review-page">
    <van-nav-bar fixed placeholder>
      <template #left>
        <div class="nav-back" @click="$router.back()">
          <van-icon name="arrow-left" size="18" />
        </div>
      </template>
      <template #title>
        <span class="nav-title">{{ pageTitle }}</span>
      </template>
      <template #right>
        <div style="display: flex; align-items: center; gap: 4px;">
          <div
            v-if="currentItem?.lastRedoCorrect"
            class="nav-mastered-btn"
            @click="markMastered"
          >
            <van-icon name="passed" size="15" />
            <span>已掌握</span>
          </div>
          <van-icon
            :name="isFavorited ? 'star' : 'star-o'"
            size="20"
            :color="isFavorited ? '#FFD700' : '#86909c'"
            @click="toggleFavorite"
            style="padding: 4px 8px;"
          />
          <van-icon name="delete-o" size="20" color="#86909c" @click="removeQuestion" style="padding: 4px 8px;" />
        </div>
      </template>
    </van-nav-bar>

    <van-loading v-if="loading" class="loading-wrapper" vertical>加载中...</van-loading>

    <template v-else-if="wrongItems.length > 0">
      <!-- 题目信息栏（fixed） -->
      <div class="question-bar">
        <div class="bar-left">
          <span class="question-index">{{ currentIndex + 1 }}</span>
          <span class="question-total">/{{ wrongItems.length }}</span>
          <span class="type-label" :style="{ color: typeColor(currentQuestion?.type) }">{{ currentQuestion?.typeName }}</span>
        </div>
        <span class="wrong-badge">错误{{ currentItem?.wrongCount || 0 }}次</span>
      </div>

      <!-- 主内容区 -->
      <div class="content">
        <!-- 题目内容 -->
        <div class="question-content">
          <div v-if="currentQuestion?.type === 'composite'" class="question-text" v-html="currentQuestion.material"></div>
          <div v-else class="question-text" v-html="currentQuestion?.content"></div>
        </div>

        <!-- 已答回显区域（cloze/composite 由各自 Feedback 组件处理，不渲染此区域） -->
        <div v-if="!isClozeOrComposite" class="answer-area answered-review">
          <!-- 单选/多选 -->
          <div v-if="currentQuestion?.type === 'single' || currentQuestion?.type === 'multiple'" class="review-options">
            <div
              v-for="opt in currentQuestion.options"
              :key="opt.label"
              class="review-option-item"
              :class="getReviewOptionClass(opt.label)"
            >
              <span class="review-opt-label">{{ opt.label }}</span>
              <span class="review-opt-text">{{ opt.text }}</span>
              <span v-if="isUserSelected(opt.label) && isCorrectOption(opt.label)" class="review-opt-mark correct">✓</span>
              <span v-if="isUserSelected(opt.label) && !isCorrectOption(opt.label)" class="review-opt-mark wrong">✗</span>
              <span v-if="!isUserSelected(opt.label) && isCorrectOption(opt.label)" class="review-opt-mark correct">✓</span>
            </div>
          </div>

          <!-- 判断题 -->
          <div v-else-if="currentQuestion?.type === 'judge'" class="review-judge">
            <div class="review-judge-row">
              <span class="review-judge-label">你的答案：</span>
              <span class="text-wrong">{{ formatJudgeAnswer(userAnswer) }}</span>
            </div>
            <div class="review-judge-row">
              <span class="review-judge-label">正确答案：</span>
              <span class="text-correct">{{ formatJudgeAnswer(currentQuestion.correctAnswer) }}</span>
            </div>
          </div>

          <!-- 填空题 -->
          <div v-else-if="currentQuestion?.type === 'blank'" class="review-blank">
            <div v-for="(item, idx) in getBlankReviewDetails()" :key="idx" class="review-blank-row">
              <span class="review-blank-index">第{{ idx + 1 }}空：</span>
              <span :class="item.isCorrect ? 'text-correct' : 'text-wrong'">{{ item.student || '未作答' }}</span>
              <span v-if="item.isCorrect" class="review-blank-mark correct">✓</span>
              <span v-else class="review-blank-mark wrong">✗</span>
            </div>
            <div class="review-correct-hint">
              正确答案：{{ formatArrayAnswer(currentQuestion.correctAnswer) }}
            </div>
          </div>

          <!-- 简答题 -->
          <div v-else-if="currentQuestion?.type === 'essay'" class="review-essay">
            <div class="review-essay-block">
              <div class="review-essay-label label-student">我的作答</div>
              <div class="review-essay-content student">{{ getEssayUserText() || '未作答' }}</div>
            </div>
            <div class="review-essay-block">
              <div class="review-essay-label label-reference">参考答案</div>
              <div class="review-essay-content reference">{{ currentQuestion.correctAnswer || '--' }}</div>
            </div>
            <div v-if="currentQuestion.explanation" class="review-essay-explanation">
              <div class="review-essay-explanation-title">解析</div>
              <div class="review-essay-explanation-content">{{ currentQuestion.explanation }}</div>
            </div>
          </div>
        </div>

        <!-- 完形填空反馈 -->
        <ClozeFeedback
          v-if="currentQuestion?.type === 'cloze'"
          :visible="true"
          :question="currentQuestion"
          :user-answer="userAnswer || {}"
          :correct-answer="currentQuestion.correctAnswer || {}"
          :explanation="currentQuestion.explanation"
          :hide-wrong-tip="true"
        />

        <!-- 复合题反馈 -->
        <CompositeFeedback
          v-if="currentQuestion?.type === 'composite'"
          :visible="true"
          :question="currentQuestion"
          :user-answer="userAnswer || {}"
          :correct-answer="currentQuestion.correctAnswer || {}"
          :essay-accuracies="{}"
          :hide-wrong-tip="true"
        />

        <!-- 解析（非完形填空/复合题/简答题，这三种已在各自区域内处理解析） -->
        <div
          v-if="currentQuestion && !isClozeOrComposite && currentQuestion.type !== 'essay' && currentQuestion.explanation"
          class="explanation-card"
        >
          <div class="explanation-title">解析</div>
          <div class="explanation-content">{{ currentQuestion.explanation }}</div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-nav safe-area-bottom">
        <van-button
          type="default"
          size="large"
          :disabled="currentIndex === 0"
          @click="prevQuestion"
        >
          上一题
        </van-button>
        <div class="nav-action-btn nav-action-btn--redo" @click="redoQuestion">
          <van-icon name="replay" size="18" />
          <span>重做</span>
        </div>
        <van-button
          type="primary"
          size="large"
          :disabled="currentIndex >= wrongItems.length - 1"
          @click="nextQuestion"
        >
          下一题
        </van-button>
      </div>
    </template>

    <van-empty v-else description="暂无错题" image="search" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores'
import { showToast, showConfirmDialog } from 'vant'
import ClozeFeedback from './components/ClozeFeedback.vue'
import CompositeFeedback from './components/CompositeFeedback.vue'

const route = useRoute()
const router = useRouter()
const store = usePracticeStore()
const loading = ref(true)
const currentIndex = ref(0)

const mode = route.path.includes('review-type') ? 'type' : 'task'
const id = route.params.id

const pageTitle = computed(() => {
  if (mode === 'task') {
    return store.wrongBookByTask.find(g => g.taskId === id)?.taskName || '错题回顾'
  } else {
    return store.wrongBookByType.find(g => g.type === id)?.typeName || '错题回顾'
  }
})

const wrongItems = computed(() => {
  if (mode === 'task') {
    return store.wrongBookByTask.find(g => g.taskId === id)?.wrongItems || []
  } else {
    return store.wrongBookByType.find(g => g.type === id)?.wrongItems || []
  }
})

const currentItem = computed(() => wrongItems.value[currentIndex.value])
const currentQuestion = computed(() => currentItem.value?.question)

// 取最后一次作答
const userAnswer = computed(() => {
  const answers = currentItem.value?.userAnswers
  if (!answers || answers.length === 0) return null
  return answers[answers.length - 1].answer
})

const isClozeOrComposite = computed(() => {
  const t = currentQuestion.value?.type
  return t === 'cloze' || t === 'composite'
})

const isFavorited = computed(() => {
  const qId = currentQuestion.value?.id
  return qId ? store.favorites.includes(qId) : false
})

const typeColor = (type) => {
  const map = {
    single: '#14C9C9', multiple: '#722ED1', judge: '#3491FA',
    blank: '#FF7D00', essay: '#722ED1', cloze: '#165DFF', composite: '#F77234',
  }
  return map[type] || '#4e5969'
}

// 用户是否选了该选项
const isUserSelected = (label) => {
  const ans = userAnswer.value
  return Array.isArray(ans) ? ans.includes(label) : ans === label
}

// 是否为正确答案选项
const isCorrectOption = (label) => {
  const correct = currentQuestion.value?.correctAnswer
  return Array.isArray(correct) ? correct.includes(label) : correct === label
}

// 选项回显样式（完全复用 PracticeAnswer 逻辑）
const getReviewOptionClass = (label) => {
  const selected = isUserSelected(label)
  const correct = isCorrectOption(label)
  // 错题回顾：答案一定是错的
  if (selected && correct) return 'review-opt-correct'   // 选对了（多选部分正确）
  if (selected && !correct) return 'review-opt-wrong'    // 选错了
  if (!selected && correct) return 'review-opt-correct'  // 未选但是正确答案
  return ''
}

const formatJudgeAnswer = (val) => {
  if (val === true || val === 'true') return '正确 ✓'
  if (val === false || val === 'false') return '错误 ✗'
  return '未作答'
}

const getBlankReviewDetails = () => {
  const q = currentQuestion.value
  if (!q || q.type !== 'blank') return []
  const correct = q.correctAnswer
  const user = userAnswer.value
  if (!Array.isArray(correct)) return []

  if (user && typeof user === 'object' && !Array.isArray(user)) {
    const blanks = q.blanks || []
    return correct.map((c, i) => {
      const blank = blanks[i]
      const student = blank ? (user[blank.id] || '') : ''
      return { student, correct: c, isCorrect: student.trim().toLowerCase() === (c || '').trim().toLowerCase() }
    })
  }
  if (Array.isArray(user)) {
    return correct.map((c, i) => ({
      student: user[i] || '', correct: c,
      isCorrect: (user[i] || '').trim().toLowerCase() === (c || '').trim().toLowerCase(),
    }))
  }
  return correct.map(c => ({ student: '', correct: c, isCorrect: false }))
}

const formatArrayAnswer = (answer) => {
  return Array.isArray(answer) ? answer.join('、') : String(answer || '')
}

const getEssayUserText = () => {
  const ans = userAnswer.value
  if (typeof ans === 'string') return ans
  if (ans && typeof ans === 'object' && ans.text) return ans.text
  return ''
}

const prevQuestion = () => { if (currentIndex.value > 0) currentIndex.value-- }
const nextQuestion = () => { if (currentIndex.value < wrongItems.value.length - 1) currentIndex.value++ }

const redoQuestion = () => {
  router.push(`/practice/wrong-book/redo/${currentItem.value.qId}`)
}

const markMastered = async () => {
  try {
    await showConfirmDialog({ title: '标记已掌握', message: '确认已掌握此题？将移入已掌握题集' })
    store.markMastered(currentItem.value.qId)
    showToast('已标记为掌握')
    if (currentIndex.value >= wrongItems.value.length) {
      currentIndex.value = Math.max(0, wrongItems.value.length - 1)
    }
    if (wrongItems.value.length === 0) router.back()
  } catch { /* 取消 */ }
}

const removeQuestion = async () => {
  try {
    await showConfirmDialog({ title: '移除错题', message: '确认从错题集中移除此题？' })
    store.removeFromWrongBook(currentItem.value.qId)
    showToast('已移除')
    if (currentIndex.value >= wrongItems.value.length) {
      currentIndex.value = Math.max(0, wrongItems.value.length - 1)
    }
    if (wrongItems.value.length === 0) router.back()
  } catch { /* 取消 */ }
}

const toggleFavorite = () => {
  const qId = currentQuestion.value?.id
  if (!qId) return
  store.toggleFavorite(qId)
  showToast(isFavorited.value ? '已收藏' : '已取消收藏')
}

onMounted(() => {
  store.loadWrongBook()
  loading.value = false
})
</script>

<style scoped>
.wrong-book-review-page {
  min-height: 100vh;
  background: var(--bg-color, #f7f8fa);
  display: flex;
  flex-direction: column;
}

.nav-back {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 题目信息栏（fixed） */
.question-bar {
  position: fixed;
  top: 46px;
  left: 0;
  right: 0;
  height: 40px;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  z-index: 99;
  border-bottom: 1px solid #e5e6eb;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.question-index {
  font-size: 20px;
  font-weight: 700;
  color: #00B96B;
}

.question-total {
  font-size: 14px;
  color: #86909c;
  margin-right: 8px;
}

.type-label {
  margin-left: 4px;
  font-size: 13px;
  font-weight: 600;
}

.wrong-badge {
  font-size: 12px;
  color: #F53F3F;
  background: #fff2f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.loading-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

/* 主内容 */
.content {
  padding-top: 48px;
  padding-bottom: 80px;
}

/* 题目内容（上圆角） */
.question-content {
  background: white;
  border-radius: 12px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  padding: 12px 16px;
  margin: 8px 12px 0 12px;
}

.question-text {
  font-size: 16px;
  line-height: 1.8;
  color: #1d2129;
}

/* 答题区域（下圆角） */
.answer-area {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 0 12px 12px 12px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

/* 选项回显 */
.review-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-option-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #4e5969;
  background: #f7f8fa;
  border: 1px solid transparent;
}

.review-opt-label {
  font-weight: 600;
  margin-right: 10px;
  min-width: 20px;
}

.review-opt-text { flex: 1; }

.review-opt-mark {
  margin-left: 8px;
  font-weight: 700;
  font-size: 16px;
}

.review-opt-mark.correct { color: #00B96B; }
.review-opt-mark.wrong   { color: #F53F3F; }

.review-opt-correct {
  background: #e6f9f0;
  border-color: #00B96B;
  color: #1d2129;
}

.review-opt-wrong {
  background: #fff1f0;
  border-color: #F53F3F;
  color: #1d2129;
}

/* 判断题回显 */
.review-judge-row {
  font-size: 14px;
  line-height: 2.2;
}

.review-judge-label { color: #86909c; }
.text-correct { color: #00B96B; font-weight: 500; }
.text-wrong   { color: #F53F3F; font-weight: 500; }

/* 填空题回显 */
.review-blank-row {
  font-size: 14px;
  line-height: 2.2;
}

.review-blank-index { color: #86909c; }

.review-blank-mark {
  font-weight: 700;
  margin-left: 6px;
}

.review-blank-mark.correct { color: #00B96B; }
.review-blank-mark.wrong   { color: #F53F3F; }

.review-correct-hint {
  font-size: 13px;
  color: #00B96B;
  font-weight: 500;
  padding: 4px 0;
  margin-top: 2px;
}

/* 简答题回显 */
.review-essay-block { margin-bottom: 10px; }
.review-essay-block:last-child { margin-bottom: 0; }

.review-essay-label {
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
  margin-bottom: 6px;
}

.review-essay-label.label-student   { color: #1989fa; }
.review-essay-label.label-reference { color: #00B96B; }

.review-essay-content {
  font-size: 14px;
  line-height: 1.7;
  padding: 12px;
  border-radius: 8px;
  white-space: pre-line;
}

.review-essay-content.student {
  background: #f7f8fa;
  color: #4e5969;
  border: 1px solid #e5e6eb;
}

.review-essay-content.reference {
  background: #f0fff4;
  color: #1d2129;
  border: 1px solid #AFF0B5;
}

.review-essay-explanation {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e5e6eb;
}

.review-essay-explanation-title {
  font-size: 13px;
  font-weight: 600;
  color: #4e5969;
  margin-bottom: 4px;
}

.review-essay-explanation-content {
  font-size: 14px;
  line-height: 1.6;
  color: #1d2129;
}

/* 解析卡片（单选/多选/判断/填空） */
.explanation-card {
  background: #f7f8fa;
  border-radius: 10px;
  padding: 14px 16px;
  margin: 0 12px 12px;
}

.explanation-title {
  font-size: 13px;
  font-weight: 600;
  color: #86909c;
  margin-bottom: 6px;
}

.explanation-content {
  font-size: 14px;
  line-height: 1.6;
  color: #1d2129;
}

/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: white;
  border-top: 1px solid #e5e6eb;
  display: flex;
  gap: 12px;
  align-items: center;
  z-index: 100;
}

.bottom-nav .van-button { flex: 1; }

.bottom-nav :deep(.van-button--primary) {
  background: #00B96B;
  border-color: #00B96B;
}

.nav-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 48px;
  cursor: pointer;
  flex-shrink: 0;
  color: #86909c;
}

.nav-action-btn span {
  font-size: 10px;
  white-space: nowrap;
}

.nav-action-btn:active { opacity: 0.6; }

.nav-action-btn--redo {
  color: #00B96B;
}

/* 导航栏已掌握按钮 */
.nav-mastered-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  font-size: 12px;
  color: #00B96B;
  background: #e8f8f0;
  border-radius: 12px;
  cursor: pointer;
  white-space: nowrap;
}
</style>
