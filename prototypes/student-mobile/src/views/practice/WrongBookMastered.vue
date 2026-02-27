<template>
  <div class="mastered-list-page">
    <van-nav-bar :title="pageTitle" left-arrow @click-left="$router.back()" fixed placeholder />

    <van-loading v-if="loading" class="loading-wrapper" vertical>加载中...</van-loading>

    <template v-else-if="masteredItems.length > 0">
      <!-- 题目列表 -->
      <div class="question-list">
        <div v-for="(item, index) in masteredItems" :key="item.qId" class="question-item" @click="viewDetail(item)">
          <div class="question-header">
            <span class="question-number">{{ index + 1 }}.</span>
            <span class="question-type">{{ item.question?.typeName }}</span>
            <span class="mastered-time">{{ formatTime(item.masteredTime) }}</span>
          </div>
          <div class="question-content" v-html="item.question?.type === 'composite' ? item.question?.material : item.question?.content"></div>
          <div class="question-actions">
            <van-button size="small" plain type="warning" icon="replay" @click.stop="unmarkMastered(item)">
              取消掌握
            </van-button>
          </div>
        </div>
      </div>
    </template>

    <van-empty v-else description="暂无已掌握题目" image="search" />

    <!-- 详情弹窗 -->
    <van-popup
      v-model:show="showDetailPopup"
      position="bottom"
      :style="{ height: '85%' }"
      round
      closeable
    >
      <div v-if="selectedItem" class="detail-popup">
        <div class="detail-header">
          <div class="header-info">
            <span class="type-badge" :style="{ color: typeColor(selectedItem.question?.type) }">
              {{ selectedItem.question?.typeName }}
            </span>
            <span class="mastered-badge">已掌握</span>
          </div>
        </div>
        <div class="detail-content">
          <!-- 题目内容 -->
          <div class="question-section">
            <div class="question-text" v-html="getQuestionContent()"></div>
          </div>

          <!-- 答案区域 -->
          <div class="answer-section">
            <!-- 单选/多选题 -->
            <div v-if="selectedItem.question?.type === 'single' || selectedItem.question?.type === 'multiple'" class="options-area">
              <div
                v-for="opt in selectedItem.question.options"
                :key="opt.label"
                class="option-item"
                :class="{ 'is-correct': isCorrectOption(opt.label) }"
              >
                <span class="opt-label">{{ opt.label }}</span>
                <span class="opt-text">{{ opt.text }}</span>
                <span v-if="isCorrectOption(opt.label)" class="correct-mark">✓</span>
              </div>
            </div>

            <!-- 判断题 -->
            <div v-else-if="selectedItem.question?.type === 'judge'" class="judge-answer">
              <div class="answer-row">
                <span class="answer-label">正确答案：</span>
                <span class="answer-value correct">{{ formatJudgeAnswer(selectedItem.question.correctAnswer) }}</span>
              </div>
            </div>

            <!-- 填空题 -->
            <div v-else-if="selectedItem.question?.type === 'blank'" class="blank-answer">
              <div class="answer-row">
                <span class="answer-label">正确答案：</span>
                <span class="answer-value correct">{{ formatBlankAnswer(selectedItem.question.correctAnswer) }}</span>
              </div>
            </div>

            <!-- 简答题 -->
            <div v-else-if="selectedItem.question?.type === 'essay'" class="essay-answer">
              <div class="answer-block">
                <div class="answer-block-title">参考答案</div>
                <div class="answer-block-content">{{ selectedItem.question.correctAnswer }}</div>
              </div>
            </div>

            <!-- 完形填空 -->
            <div v-else-if="selectedItem.question?.type === 'cloze'" class="cloze-answer">
              <div v-for="(blank, idx) in selectedItem.question?.blanks" :key="blank.id" class="blank-item">
                <div class="blank-label">第{{ idx + 1 }}空：</div>
                <div class="blank-options">
                  <div
                    v-for="opt in blank.options"
                    :key="opt.label"
                    class="blank-option"
                    :class="{ 'is-correct': selectedItem.question.correctAnswer[blank.id] === opt.label }"
                  >
                    <span class="opt-label">{{ opt.label }}</span>
                    <span class="opt-text">{{ opt.text }}</span>
                    <span v-if="selectedItem.question.correctAnswer[blank.id] === opt.label" class="correct-mark">✓</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 复合题 -->
            <div v-else-if="selectedItem.question?.type === 'composite'" class="composite-answer">
              <div v-for="(sub, idx) in selectedItem.question?.subQuestions" :key="sub.id" class="sub-question">
                <div class="sub-question-header">
                  <span class="sub-question-num">{{ idx + 1 }}.</span>
                  <span class="sub-question-type">{{ sub.typeName }}</span>
                </div>
                <div class="sub-question-title">{{ sub.content }}</div>

                <!-- 子题选项 -->
                <div v-if="sub.type === 'single' || sub.type === 'multiple'" class="sub-options">
                  <div
                    v-for="opt in sub.options"
                    :key="opt.label"
                    class="sub-option"
                    :class="{ 'is-correct': isSubQuestionCorrect(sub, opt.label) }"
                  >
                    <span class="opt-label">{{ opt.label }}</span>
                    <span class="opt-text">{{ opt.text }}</span>
                    <span v-if="isSubQuestionCorrect(sub, opt.label)" class="correct-mark">✓</span>
                  </div>
                </div>

                <!-- 子题判断 -->
                <div v-else-if="sub.type === 'judge'" class="sub-judge">
                  <span class="answer-label">正确答案：</span>
                  <span class="answer-value correct">{{ formatJudgeAnswer(getSubCorrectAnswer(sub)) }}</span>
                </div>

                <!-- 子题填空 -->
                <div v-else-if="sub.type === 'blank'" class="sub-blank">
                  <span class="answer-label">正确答案：</span>
                  <span class="answer-value correct">{{ formatBlankAnswer(getSubCorrectAnswer(sub)) }}</span>
                </div>

                <!-- 子题简答 -->
                <div v-else-if="sub.type === 'essay'" class="sub-essay">
                  <div class="answer-block-title">参考答案</div>
                  <div class="answer-block-content">{{ getSubCorrectAnswer(sub) }}</div>
                </div>

                <!-- 子题解析 -->
                <div v-if="sub.explanation" class="explanation-section" style="margin-top: 10px; margin-bottom: 0;">
                  <div class="explanation-title">解析</div>
                  <div class="explanation-text">{{ sub.explanation }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 解析（复合题无整体解析，子题各自有解析） -->
          <div v-if="selectedItem.question?.explanation && selectedItem.question?.type !== 'composite'" class="explanation-section">
            <div class="explanation-title">解析</div>
            <div class="explanation-text">{{ selectedItem.question.explanation }}</div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const store = usePracticeStore()
const loading = ref(true)
const showDetailPopup = ref(false)
const selectedItem = ref(null)

const mode = route.path.includes('mastered-type') ? 'type' : 'task'
const id = route.params.id

const pageTitle = computed(() => {
  if (mode === 'task') {
    const group = store.wrongBookByTask.find(g => g.taskId === id)
    return `已掌握题集 - ${group?.taskName || ''}`
  } else {
    const group = store.wrongBookByType.find(g => g.type === id)
    return `已掌握题集 - ${group?.typeName || ''}`
  }
})

const masteredItems = computed(() => {
  if (mode === 'task') {
    const group = store.wrongBookByTask.find(g => g.taskId === id)
    return group?.masteredItems || []
  } else {
    const group = store.wrongBookByType.find(g => g.type === id)
    return group?.masteredItems || []
  }
})

const formatTime = (timeStr) => {
  if (!timeStr) return '未知时间'
  const date = new Date(timeStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const typeColor = (type) => {
  const map = {
    single: '#14C9C9', multiple: '#722ED1', judge: '#3491FA',
    blank: '#FF7D00', essay: '#722ED1', cloze: '#165DFF', composite: '#F77234',
  }
  return map[type] || '#4e5969'
}

const getQuestionContent = () => {
  if (!selectedItem.value?.question) return ''
  if (selectedItem.value.question.type === 'composite') {
    return selectedItem.value.question.material || ''
  }
  return selectedItem.value.question.content || ''
}

const formatJudgeAnswer = (val) => {
  if (val === true || val === 'true') return '正确 ✓'
  if (val === false || val === 'false') return '错误 ✗'
  return '未知'
}

const formatBlankAnswer = (answer) => {
  if (Array.isArray(answer)) {
    return answer.join('、')
  }
  return String(answer || '')
}

const isCorrectOption = (label) => {
  if (!selectedItem.value?.question) return false
  const correct = selectedItem.value.question.correctAnswer
  if (Array.isArray(correct)) {
    return correct.includes(label)
  }
  return correct === label
}

const isSubQuestionCorrect = (subQuestion, label) => {
  // 复合题子题的正确答案存在父题 correctAnswer[sub.id] 中
  const parentCorrect = selectedItem.value?.question?.correctAnswer
  const correct = parentCorrect?.[subQuestion.id] ?? subQuestion.correctAnswer
  if (Array.isArray(correct)) {
    return correct.includes(label)
  }
  return correct === label
}

const getSubCorrectAnswer = (subQuestion) => {
  const parentCorrect = selectedItem.value?.question?.correctAnswer
  return parentCorrect?.[subQuestion.id] ?? subQuestion.correctAnswer
}

const viewDetail = (item) => {
  selectedItem.value = item
  showDetailPopup.value = true
}

const unmarkMastered = async (item) => {
  try {
    await showConfirmDialog({
      title: '取消掌握',
      message: '确认将此题移回错题集吗？',
    })
    store.unmarkMastered(item.qId)
    showToast('已移回错题集')
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  store.loadWrongBook()
  loading.value = false
})
</script>

<style scoped>
.mastered-list-page {
  min-height: 100vh;
  background: var(--bg-color, #f7f8fa);
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.question-list {
  padding: 16px;
}

.question-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.question-item:active {
  transform: scale(0.98);
  background: #f7f8fa;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.question-number {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #1d2129);
}

.question-type {
  font-size: 12px;
  padding: 2px 8px;
  background: #f2f3f5;
  color: var(--text-secondary, #4e5969);
  border-radius: 4px;
}

.mastered-time {
  margin-left: auto;
  font-size: 12px;
  color: var(--success-color, #00B42A);
}

.question-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary, #1d2129);
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.question-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 详情弹窗 */
.detail-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
}

.detail-header {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #f2f3f5;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-badge {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 12px;
  background: #f7f8fa;
  border-radius: 6px;
}

.mastered-badge {
  font-size: 12px;
  padding: 2px 8px;
  background: #e6f9f0;
  color: #00B96B;
  border-radius: 4px;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.question-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.question-text {
  font-size: 16px;
  line-height: 1.8;
  color: #1d2129;
}

/* 答案区域 */
.answer-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

/* 单选/多选选项 */
.options-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-radius: 8px;
  background: #f7f8fa;
  border: 1px solid transparent;
}

.option-item.is-correct {
  background: #e6f9f0;
  border-color: #00B96B;
}

.opt-label {
  font-size: 14px;
  font-weight: 600;
  margin-right: 10px;
  min-width: 20px;
  flex-shrink: 0;
  color: #1d2129;
  padding-top: 1px;
}

.opt-text {
  flex: 1;
  font-size: 14px;
  color: #1d2129;
}

.correct-mark {
  margin-left: 8px;
  font-weight: 700;
  font-size: 14px;
  color: #00B96B;
  flex-shrink: 0;
  padding-top: 1px;
}

/* 判断题答案 */
.judge-answer,
.blank-answer {
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.answer-row {
  font-size: 14px;
  line-height: 2;
}

.answer-label {
  color: #86909c;
}

.answer-value {
  font-weight: 500;
}

.answer-value.correct {
  color: #00B96B;
}

/* 简答题答案 */
.essay-answer {
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.answer-block {
  margin-bottom: 12px;
}

.answer-block:last-child {
  margin-bottom: 0;
}

.answer-block-title {
  font-size: 13px;
  font-weight: 500;
  color: #00B96B;
  margin-bottom: 6px;
}

.answer-block-content {
  font-size: 14px;
  line-height: 1.7;
  padding: 12px;
  background: #f0fff4;
  color: #1d2129;
  border-radius: 8px;
  border: 1px solid #AFF0B5;
  white-space: pre-line;
}

/* 完形填空答案 */
.cloze-answer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.blank-item {
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.blank-label {
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
  margin-bottom: 8px;
}

.blank-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.blank-option {
  display: flex;
  align-items: flex-start;
  padding: 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid transparent;
}

.blank-option.is-correct {
  background: #e6f9f0;
  border-color: #00B96B;
}

/* 复合题答案 */
.composite-answer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sub-question {
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.sub-question-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.sub-question-num {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.sub-question-type {
  font-size: 11px;
  padding: 1px 6px;
  background: #e8f7f0;
  color: #00B96B;
  border-radius: 4px;
}

.sub-question-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 10px;
  line-height: 1.6;
}

.sub-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sub-option {
  display: flex;
  align-items: flex-start;
  padding: 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid transparent;
}

.sub-option.is-correct {
  background: #e6f9f0;
  border-color: #00B96B;
}

.sub-judge,
.sub-blank {
  padding: 10px;
  background: white;
  border-radius: 6px;
  font-size: 14px;
}

.sub-essay {
  padding: 10px;
  background: white;
  border-radius: 6px;
  font-size: 14px;
}

/* 解析 */
.explanation-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.explanation-title {
  font-size: 14px;
  font-weight: 600;
  color: #00B96B;
  margin-bottom: 8px;
}

.explanation-text {
  font-size: 14px;
  line-height: 1.7;
  color: #4e5969;
}
</style>
