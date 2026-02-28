<template>
  <div class="practice-answer-page">
    <van-nav-bar fixed placeholder>
      <template #left>
        <div class="nav-back" @click="handleBack">
          <van-icon name="arrow-left" size="18" />
        </div>
      </template>
      <template #title>
        <span class="nav-title">重做本题</span>
      </template>
    </van-nav-bar>

    <!-- 题目信息栏（fixed） -->
    <div v-if="!loading && currentQuestion" class="question-bar">
      <div class="bar-left">
        <span class="question-index">1</span>
        <span class="question-total">/1</span>
        <span class="type-label" :style="{ color: typeColor(currentQuestion.type) }">{{ currentQuestion.typeName }}</span>
      </div>
      <span class="wrong-badge">错误{{ wrongCount }}次</span>
    </div>

    <van-loading v-if="loading" class="loading-wrapper" vertical>加载中...</van-loading>

    <!-- 主内容区 -->
    <div v-else-if="currentQuestion" class="content">
      <!-- 题目内容 -->
      <div class="question-content">
        <div v-if="currentQuestion.type === 'composite'" class="question-text" v-html="currentQuestion.material"></div>
        <div v-else class="question-text" v-html="currentQuestion.content"></div>
      </div>

      <!-- 已答：回显（只显示用户选择，不显示正确答案） -->
      <div v-if="!isClozeOrComposite && isAnswered" class="answer-area answered-review">
        <!-- 单选/多选：不显示正确答案 -->
        <div v-if="currentQuestion.type === 'single' || currentQuestion.type === 'multiple'" class="review-options">
          <div
            v-for="opt in currentQuestion.options"
            :key="opt.label"
            class="review-option-item"
            :class="getReviewOptionClass(opt.label)"
          >
            <span class="review-opt-label">{{ opt.label }}</span>
            <span class="review-opt-text">{{ opt.text }}</span>
            <span v-if="isUserSelected(opt.label)" class="review-opt-mark" :class="isCorrectOption(opt.label) ? 'correct' : 'wrong'">
              {{ isCorrectOption(opt.label) ? '✓' : '✗' }}
            </span>
          </div>
        </div>
        <!-- 判断题：不显示正确答案 -->
        <div v-else-if="currentQuestion.type === 'judge'" class="review-judge">
          <div class="review-judge-row">
            <span class="review-judge-label">你的答案：</span>
            <span :class="currentResult?.isCorrect ? 'text-correct' : 'text-wrong'">{{ formatJudgeAnswer(currentAnswer) }}</span>
          </div>
        </div>
        <!-- 填空题：不显示正确答案 -->
        <div v-else-if="currentQuestion.type === 'blank'" class="review-blank">
          <div v-for="(item, idx) in getBlankReviewDetails()" :key="idx" class="review-blank-row">
            <span class="review-blank-index">第{{ idx + 1 }}空：</span>
            <span :class="item.isCorrect ? 'text-correct' : 'text-wrong'">{{ item.student || '未作答' }}</span>
            <span v-if="item.isCorrect" class="review-blank-mark correct">✓</span>
            <span v-else class="review-blank-mark wrong">✗</span>
          </div>
        </div>
        <!-- 简答题：不显示参考答案 -->
        <div v-else-if="currentQuestion.type === 'essay'" class="review-essay">
          <div class="review-essay-block">
            <div class="review-essay-label label-student">我的作答</div>
            <div class="review-essay-content student">{{ getEssayUserText() || '未作答' }}</div>
          </div>
        </div>
      </div>

      <!-- 未答：答题组件 -->
      <div v-else-if="!isClozeOrComposite" class="answer-area">
        <SingleChoice
          v-if="currentQuestion.type === 'single'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
        />
        <MultipleChoice
          v-else-if="currentQuestion.type === 'multiple'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
        />
        <JudgeQuestion
          v-else-if="currentQuestion.type === 'judge'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
        />
        <BlankQuestion
          v-else-if="currentQuestion.type === 'blank'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
        />
        <EssayQuestion
          v-else-if="currentQuestion.type === 'essay'"
          :question="currentQuestion"
          :value="currentAnswer"
          @update:value="handleAnswerChange"
        />
      </div>

      <!-- 完形填空 -->
      <ClozeQuestion
        v-if="currentQuestion.type === 'cloze'"
        ref="clozeQuestionRef"
        :question="currentQuestion"
        :value="currentAnswer"
        @update:value="handleAnswerChange"
      />
      <!-- 复合题 -->
      <CompositeQuestion
        v-if="currentQuestion.type === 'composite'"
        ref="compositeQuestionRef"
        :question="currentQuestion"
        :value="currentAnswer"
        @update:value="handleAnswerChange"
      />

      <!-- 多选/填空/简答确认按钮 -->
      <div v-if="needConfirmBtn" class="confirm-btn-wrapper">
        <van-button type="primary" block round @click="confirmAnswer">确认提交</van-button>
      </div>

      <!-- 完形填空/复合题提交按钮 -->
      <div v-if="isClozeOrComposite && !isAnswered" class="floating-btn-group">
        <div class="floating-answer-btn" @click="openAnswerPanel">
          <van-icon name="edit" />
          <span>点击作答</span>
        </div>
        <div v-if="isClozeCompositeComplete" class="floating-submit-btn" @click="submitClozeOrComposite">
          <van-icon name="success" />
          <span>提交答案</span>
        </div>
      </div>

      <!-- 完形填空反馈 -->
      <ClozeFeedback
        v-if="isAnswered && currentQuestion.type === 'cloze'"
        :visible="true"
        :question="currentQuestion"
        :user-answer="currentAnswer"
        :correct-answer="currentQuestion.correctAnswer"
        :explanation="currentQuestion.explanation"
        :hide-wrong-tip="true"
      />

      <!-- 复合题反馈 -->
      <CompositeFeedback
        v-if="isAnswered && currentQuestion.type === 'composite'"
        :visible="true"
        :question="currentQuestion"
        :user-answer="currentAnswer"
        :correct-answer="currentQuestion.correctAnswer"
        :essay-accuracies="currentResult?.essayAccuracies || {}"
        :hide-wrong-tip="true"
      />

      <!-- 其他题型反馈 -->
      <AnswerFeedback
        v-if="isAnswered && !isClozeOrComposite"
        :visible="true"
        :is-correct="currentResult?.isCorrect"
        :correct-answer="currentQuestion.correctAnswer"
        :user-answer="currentAnswer"
        :explanation="currentQuestion.explanation"
        :question-type="currentQuestion.type"
        :question="currentQuestion"
        :accuracy="currentResult?.accuracy || 0"
        :hide-wrong-tip="true"
      />
    </div>

    <van-empty v-else description="题目不存在" image="error" />

    <!-- 底部操作栏 -->
    <div v-if="!loading && currentQuestion" class="bottom-nav safe-area-bottom">
      <template v-if="!isAnswered">
        <van-button type="default" size="large" @click="handleBack">返回</van-button>
      </template>
      <template v-else>
        <van-button type="default" size="large" @click="retryQuestion">
          <van-icon name="replay" />
          再做一次
        </van-button>
        <van-button
          v-if="currentResult?.isCorrect"
          type="primary"
          size="large"
          @click="markMasteredAndBack"
        >
          标记已掌握
        </van-button>
        <van-button v-else type="default" size="large" @click="handleBack">返回</van-button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores'
import { showToast, showConfirmDialog } from 'vant'
import SingleChoice from '@/views/exam/components/SingleChoice.vue'
import MultipleChoice from '@/views/exam/components/MultipleChoice.vue'
import JudgeQuestion from '@/views/exam/components/JudgeQuestion.vue'
import BlankQuestion from '@/views/exam/components/BlankQuestion.vue'
import EssayQuestion from '@/views/exam/components/EssayQuestion.vue'
import ClozeQuestion from '@/views/exam/components/ClozeQuestion.vue'
import CompositeQuestion from '@/views/exam/components/CompositeQuestion.vue'
import AnswerFeedback from './components/AnswerFeedback.vue'
import ClozeFeedback from './components/ClozeFeedback.vue'
import CompositeFeedback from './components/CompositeFeedback.vue'

const route = useRoute()
const router = useRouter()
const store = usePracticeStore()
const loading = ref(true)
const qId = route.params.qId
const clozeQuestionRef = ref(null)
const compositeQuestionRef = ref(null)

const wrongCount = computed(() => store.wrongBook[qId]?.wrongCount || 0)
const currentQuestion = computed(() => store.currentQuestion)
const currentAnswer = computed(() => {
  if (!currentQuestion.value) return null
  const ans = store.answers[currentQuestion.value.id]
  if (ans !== undefined && ans !== null) return ans
  const type = currentQuestion.value.type
  if (type === 'multiple') return []
  if (type === 'blank' || type === 'cloze' || type === 'composite') return {}
  return ''
})
const currentResult = computed(() => {
  if (!currentQuestion.value) return null
  return store.results[currentQuestion.value.id] || null
})
const isAnswered = computed(() => !!currentResult.value)

const isClozeOrComposite = computed(() => {
  const t = currentQuestion.value?.type
  return t === 'cloze' || t === 'composite'
})

const isClozeCompositeComplete = computed(() => {
  if (!currentQuestion.value || !isClozeOrComposite.value) return false
  const ans = currentAnswer.value
  if (!ans || typeof ans !== 'object') return false
  const q = currentQuestion.value
  if (q.type === 'cloze') {
    // 每个 blank 都需要有答案
    return q.blanks?.every(b => ans[b.id] !== undefined && ans[b.id] !== '')
  }
  if (q.type === 'composite') {
    // 每个子题都需要有答案（根据子题类型判断）
    return q.subQuestions?.every(sub => {
      const subAns = ans[sub.id]
      if (subAns === undefined || subAns === null) return false
      if (sub.type === 'multiple') return Array.isArray(subAns) && subAns.length > 0
      if (sub.type === 'blank') {
        // 填空题：对象格式 { blankId: value }，每个空都需要有值
        if (typeof subAns === 'object' && !Array.isArray(subAns)) {
          return sub.blanks?.every(b => subAns[b.id] && String(subAns[b.id]).trim())
        }
        return Array.isArray(subAns) && subAns.length > 0 && subAns.every(v => v && String(v).trim())
      }
      if (sub.type === 'essay') {
        // 简答题：文本或 { text, attachments } 格式
        if (typeof subAns === 'string') return subAns.trim().length > 0
        if (typeof subAns === 'object') return (subAns.text && subAns.text.trim().length > 0) || (subAns.attachments && subAns.attachments.length > 0)
        return false
      }
      return subAns !== ''
    })
  }
  return false
})

const needConfirmBtn = computed(() => {
  if (!currentQuestion.value || isAnswered.value) return false
  const type = currentQuestion.value.type
  if (type !== 'multiple' && type !== 'blank' && type !== 'essay') return false
  const ans = currentAnswer.value
  if (type === 'multiple') return Array.isArray(ans) && ans.length > 0
  if (type === 'blank') {
    if (ans && typeof ans === 'object' && !Array.isArray(ans)) return Object.values(ans).some(v => v && String(v).trim())
    return Array.isArray(ans) && ans.length > 0
  }
  if (type === 'essay') {
    if (typeof ans === 'string') return ans.trim().length > 0
    if (ans && typeof ans === 'object') return ans.text && ans.text.trim().length > 0
    return false
  }
  return false
})

const typeColor = (type) => {
  const map = { single: '#14C9C9', multiple: '#722ED1', judge: '#3491FA', blank: '#FF7D00', essay: '#722ED1', cloze: '#165DFF', composite: '#F77234' }
  return map[type] || '#4e5969'
}

const isUserSelected = (label) => {
  const ans = currentAnswer.value
  return Array.isArray(ans) ? ans.includes(label) : ans === label
}

const isCorrectOption = (label) => {
  const correct = currentQuestion.value?.correctAnswer
  return Array.isArray(correct) ? correct.includes(label) : correct === label
}

// 选项回显样式：只标记用户选择的选项，整体判断对错
const getReviewOptionClass = (label) => {
  const selected = isUserSelected(label)
  const isRight = currentResult.value?.isCorrect  // 整体是否答对

  if (selected && isRight) return 'review-opt-correct'   // 整体答对，选项显示绿色
  if (selected && !isRight) return 'review-opt-wrong'    // 整体答错，选项显示红色
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
  const user = currentAnswer.value
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
    return correct.map((c, i) => ({ student: user[i] || '', correct: c, isCorrect: (user[i] || '').trim().toLowerCase() === (c || '').trim().toLowerCase() }))
  }
  return correct.map(c => ({ student: '', correct: c, isCorrect: false }))
}

const formatArrayAnswer = (answer) => Array.isArray(answer) ? answer.join('、') : String(answer || '')

const getEssayUserText = () => {
  const ans = currentAnswer.value
  if (typeof ans === 'string') return ans
  if (ans && typeof ans === 'object' && ans.text) return ans.text
  return ''
}

const calcEssayAccuracy = (userAns, correctAns) => {
  const userText = typeof userAns === 'string' ? userAns : (userAns?.text || '')
  const correctText = typeof correctAns === 'string' ? correctAns : ''
  if (!userText || !correctText) return 0
  const userWords = userText.toLowerCase().split(/\s+|[，。！？、；：""''（）【】\s]/).filter(Boolean)
  const correctWords = correctText.toLowerCase().split(/\s+|[，。！？、；：""''（）【】\s]/).filter(Boolean)
  if (correctWords.length === 0) return 0
  const matchCount = userWords.filter(w => correctWords.includes(w)).length
  return Math.min(100, Math.round((matchCount / correctWords.length) * 100))
}

const checkAnswer = (val, q) => {
  const correct = q.correctAnswer
  if (q.type === 'single') return val === correct
  if (q.type === 'judge') return String(val) === String(correct)
  if (q.type === 'multiple') {
    if (!Array.isArray(val) || !Array.isArray(correct)) return false
    return val.length === correct.length && val.every(a => correct.includes(a))
  }
  if (q.type === 'blank') {
    if (!Array.isArray(correct)) return false
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const blanks = q.blanks || []
      return blanks.every((b, i) => (val[b.id] || '').trim().toLowerCase() === (correct[i] || '').trim().toLowerCase())
    }
    if (Array.isArray(val)) return val.every((a, i) => (a || '').trim().toLowerCase() === (correct[i] || '').trim().toLowerCase())
    return false
  }
  return false
}

const handleAnswerChange = (val) => {
  if (isAnswered.value) return
  if (isClozeOrComposite.value || currentQuestion.value.type === 'multiple' || currentQuestion.value.type === 'blank' || currentQuestion.value.type === 'essay') {
    store.answers[currentQuestion.value.id] = val
    return
  }
  const isCorrect = checkAnswer(val, currentQuestion.value)
  store.answers[currentQuestion.value.id] = val
  store.submitAnswer(currentQuestion.value.id, val, isCorrect)
}

const confirmAnswer = () => {
  const val = currentAnswer.value
  const q = currentQuestion.value
  if (q.type === 'essay') {
    const accuracy = calcEssayAccuracy(val, q.correctAnswer)
    store.submitAnswer(q.id, val, accuracy >= 80, { type: 'essay', accuracy })
  } else {
    store.submitAnswer(q.id, val, checkAnswer(val, q))
  }
}

const submitClozeOrComposite = () => {
  const q = currentQuestion.value
  const val = currentAnswer.value
  const correct = q.correctAnswer
  let isCorrect = false
  if (q.type === 'cloze') {
    isCorrect = Object.keys(correct).every(k => val[k] === correct[k])
  } else if (q.type === 'composite') {
    const essayAccuracies = {}
    isCorrect = q.subQuestions?.every(sq => {
      const userAns = val[sq.id]
      if (sq.type === 'essay') {
        const acc = calcEssayAccuracy(userAns, sq.correctAnswer)
        essayAccuracies[sq.id] = acc
        return acc >= 80
      }
      return checkAnswer(userAns, sq)
    })
    if (Object.keys(essayAccuracies).length > 0) {
      store.submitAnswer(q.id, val, isCorrect, { essayAccuracies })
      return
    }
  }
  store.submitAnswer(q.id, val, isCorrect)
}

const openAnswerPanel = () => {
  if (currentQuestion.value?.type === 'cloze' && clozeQuestionRef.value) {
    clozeQuestionRef.value.showPanel()
  } else if (currentQuestion.value?.type === 'composite' && compositeQuestionRef.value) {
    compositeQuestionRef.value.showPanel()
  }
}

const retryQuestion = () => {
  store.clearRedoCorrect(qId)
  store.answers = {}
  store.results = {}
}

const markMasteredAndBack = async () => {
  try {
    await showConfirmDialog({ title: '标记已掌握', message: '确认已掌握此题？将移入已掌握题集' })
    store.markMastered(qId)
    showToast('已标记为掌握')
    router.back()
  } catch { /* 取消 */ }
}

const handleBack = () => router.back()

// 答对时记录，供 WrongBookReview 解锁"已掌握"按钮
watch(currentResult, (result) => {
  if (result?.isCorrect) store.setRedoCorrect(qId)
})

onMounted(() => {
  store.loadWrongBook()
  store.initSingleRedo(qId)
  loading.value = false
})
</script>

<style scoped>
.practice-answer-page {
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
}

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

.content {
  padding-top: 48px;
  padding-bottom: 80px;
}

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

.answer-area {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 0 12px 12px 12px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

/* 选项回显 */
.review-options { display: flex; flex-direction: column; gap: 8px; }

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

.review-opt-label { font-weight: 600; margin-right: 10px; min-width: 20px; }
.review-opt-text { flex: 1; }
.review-opt-mark { margin-left: 8px; font-weight: 700; font-size: 16px; }
.review-opt-mark.correct { color: #00B96B; }
.review-opt-mark.wrong   { color: #F53F3F; }
.review-opt-correct { background: #e6f9f0; border-color: #00B96B; color: #1d2129; }
.review-opt-wrong   { background: #fff1f0; border-color: #F53F3F; color: #1d2129; }

/* 判断题 */
.review-judge-row { font-size: 14px; line-height: 2.2; }
.review-judge-label { color: #86909c; }
.text-correct { color: #00B96B; font-weight: 500; }
.text-wrong   { color: #F53F3F; font-weight: 500; }

/* 填空题 */
.review-blank-row { font-size: 14px; line-height: 2.2; }
.review-blank-index { color: #86909c; }
.review-blank-mark { font-weight: 700; margin-left: 6px; }
.review-blank-mark.correct { color: #00B96B; }
.review-blank-mark.wrong   { color: #F53F3F; }
.review-correct-hint { font-size: 13px; color: #00B96B; font-weight: 500; padding: 4px 0; margin-top: 2px; }

/* 简答题 */
.review-essay-block { margin-bottom: 10px; }
.review-essay-block:last-child { margin-bottom: 0; }
.review-essay-label { font-size: 13px; font-weight: 500; color: #4e5969; margin-bottom: 6px; }
.review-essay-label.label-student   { color: #1989fa; }
.review-essay-label.label-reference { color: #00B96B; }
.review-essay-content { font-size: 14px; line-height: 1.7; padding: 12px; border-radius: 8px; white-space: pre-line; }
.review-essay-content.student   { background: #f7f8fa; color: #4e5969; border: 1px solid #e5e6eb; }
.review-essay-content.reference { background: #f0fff4; color: #1d2129; border: 1px solid #AFF0B5; }

/* 确认按钮 */
.confirm-btn-wrapper {
  padding: 0 12px 12px;
}

.confirm-btn-wrapper :deep(.van-button--primary) {
  background: #00B96B;
  border-color: #00B96B;
}

/* 完形填空/复合题悬浮按钮 */
.floating-btn-group {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 99;
  white-space: nowrap;
}

.floating-answer-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #00B96B 0%, #00A15D 100%);
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 600;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(0, 185, 107, 0.35);
  cursor: pointer;
  transition: all 0.2s ease;
}

.floating-answer-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(0, 185, 107, 0.3);
}

.floating-submit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #3491FA 0%, #165DFF 100%);
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 600;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(52, 145, 250, 0.35);
  cursor: pointer;
  transition: all 0.2s ease;
}

.floating-submit-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(52, 145, 250, 0.3);
}

.floating-answer-btn .van-icon,
.floating-submit-btn .van-icon {
  font-size: 16px;
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
</style>
