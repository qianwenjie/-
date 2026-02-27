<template>
  <div class="page">
    <!-- 顶部导航栏 -->
    <van-nav-bar fixed placeholder>
      <template #left>
        <div class="nav-back" @click="goBack">
          <van-icon name="arrow-left" />
        </div>
      </template>
      <template #title>
        <span class="nav-title">答案详情</span>
      </template>
      <template #right>
        <div class="nav-sheet-btn" @click="showSheet = true">
          <van-icon name="apps-o" />
          <span>答题卡</span>
        </div>
      </template>
    </van-nav-bar>

    <!-- 题目信息栏 -->
    <div class="question-bar">
      <div class="bar-left">
        <span class="q-index">{{ currentIndex + 1 }}</span>
        <span class="q-total">/{{ allQuestions.length }}</span>
        <span class="type-tag">{{ currentQuestion.typeName || currentQuestion.type }}</span>
      </div>
      <div class="bar-right">
        <span class="q-score" :class="statusClass">
          {{ currentQuestion.studentScore }}/{{ currentQuestion.score }}分
        </span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content">
      <!-- 题干 -->
      <div class="question-stem">
        <div v-if="currentQuestion._parentMaterial" class="material-text">
          {{ currentQuestion._parentMaterial }}
        </div>
        <div v-if="currentQuestion.type === 'composite' && currentQuestion.material" class="material-text">
          {{ currentQuestion.material }}
        </div>
        <div class="stem-text">{{ currentQuestion.content }}</div>
      </div>

      <!-- 选择题选项 -->
      <div v-if="isChoiceType" class="options-list">
        <div v-for="opt in currentQuestion.options" :key="opt.label"
          class="option-item" :class="getOptionClass(opt.label)">
          <span class="opt-label">{{ opt.label }}</span>
          <span class="opt-text">{{ opt.text }}</span>
          <span v-if="isStudentSelected(opt.label) && currentQuestion.status === 'correct'" class="opt-mark correct">✓</span>
          <span v-if="isStudentSelected(opt.label) && currentQuestion.status !== 'correct'" class="opt-mark wrong">✗</span>
        </div>
        <div v-if="mode === 'full'" class="correct-answer-hint">
          正确答案：{{ formatCorrectAnswer(currentQuestion.correctAnswer) }}
        </div>
      </div>

      <!-- 判断题 -->
      <div v-if="currentQuestion.type === 'judge'" class="judge-result">
        <div class="judge-row">
          <span class="judge-label">你的答案：</span>
          <span :class="currentQuestion.status === 'correct' ? 'text-correct' : 'text-wrong'">
            {{ currentQuestion.studentAnswer ? '正确 ✓' : '错误 ✗' }}
          </span>
        </div>
        <div v-if="mode === 'full'" class="judge-row">
          <span class="judge-label">正确答案：</span>
          <span class="text-correct">{{ currentQuestion.correctAnswer ? '正确 ✓' : '错误 ✗' }}</span>
        </div>
      </div>

      <!-- 填空题 -->
      <div v-if="currentQuestion.type === 'blank'" class="blank-result">
        <div v-for="(ans, i) in blankAnswers" :key="i" class="blank-row">
          <span class="blank-index">第{{ i + 1 }}空：</span>
          <span :class="ans.isCorrect ? 'text-correct' : 'text-wrong'">{{ ans.student }}</span>
          <span v-if="ans.isCorrect" class="blank-mark">✓</span>
          <span v-else class="blank-mark wrong">✗</span>
        </div>
        <div v-if="mode === 'full'" class="correct-answer-hint">
          正确答案：{{ currentQuestion.correctAnswer.join('、') }}
        </div>
      </div>

      <!-- 简答题 -->
      <div v-if="currentQuestion.type === 'essay'" class="essay-result">
        <div class="essay-block">
          <div class="essay-label label-student"><van-icon name="edit" color="#1989fa" /> 我的作答</div>
          <div class="essay-content student">
            <div class="essay-text">{{ getEssayText(currentQuestion.studentAnswer) }}</div>
            <!-- 附件列表（同一卡片内） -->
            <div v-if="getEssayAttachments(currentQuestion.studentAnswer).length > 0" class="essay-attachments">
              <div class="attachments-title"><van-icon name="paperclip" /> 附件（{{ getEssayAttachments(currentQuestion.studentAnswer).length }}）</div>
              <div v-for="(file, fi) in getEssayAttachments(currentQuestion.studentAnswer)"
                :key="'file-' + fi" class="attachment-file">
                <van-icon :name="getFileIcon(file.type).name" size="20" :color="getFileIcon(file.type).color" />
                <div class="file-info">
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                </div>
                <div class="file-actions">
                  <span class="file-action" @click="previewFile(file, getEssayAttachments(currentQuestion.studentAnswer))">预览</span>
                  <span class="file-action" @click="downloadFile(file)">下载</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="mode === 'full'" class="essay-block">
          <div class="essay-label label-reference"><van-icon name="bookmark" color="#00B96B" /> 参考答案</div>
          <div class="essay-content reference">{{ currentQuestion.correctAnswer }}</div>
        </div>
        <div v-if="currentQuestion.teacherComment && mode === 'full'" class="teacher-comment">
          <van-icon name="comment" /> {{ currentQuestion.teacherComment }}
        </div>
      </div>

      <!-- 完形填空 -->
      <div v-if="currentQuestion.type === 'cloze'" class="cloze-result">
        <div v-for="b in currentQuestion.blanks" :key="b.order" class="cloze-item">
          <div class="cloze-header">
            <span class="cloze-order">第{{ b.order }}空</span>
            <span :class="b.isCorrect ? 'text-correct' : 'text-wrong'">
              {{ b.isCorrect ? '✓ 正确' : '✗ 错误' }}
            </span>
          </div>
          <div class="cloze-options">
            <div v-for="opt in b.options" :key="opt.label"
              class="option-item" :class="getClozeOptClass(b, opt.label)">
              <span class="opt-label">{{ opt.label }}</span>
              <span class="opt-text">{{ opt.text }}</span>
              <span v-if="opt.label === b.studentAnswer && opt.label === b.correctAnswer" class="opt-mark correct">✓</span>
              <span v-if="opt.label === b.studentAnswer && opt.label !== b.correctAnswer" class="opt-mark wrong">✗</span>
            </div>
            <div v-if="!b.isCorrect && mode === 'full'" class="correct-answer-hint">
              正确答案：{{ b.correctAnswer }}
            </div>
          </div>
        </div>
      </div>

      <!-- 复合题（材料 + 子题铺开） -->
      <div v-if="currentQuestion.type === 'composite'" class="composite-result">
        <div v-for="(sq, si) in currentQuestion.subQuestions" :key="sq.id" class="composite-sub">
          <div class="composite-sub-header">
            <span class="composite-sub-index">第{{ si + 1 }}小题</span>
            <span class="composite-sub-type">{{ subTypeName(sq.type) }}</span>
            <span class="composite-sub-score" :class="sq.status === 'correct' ? 'status-correct' : 'status-wrong'">
              {{ sq.studentScore }}/{{ sq.score }}分
            </span>
          </div>
          <div class="composite-sub-stem">{{ sq.content }}</div>

          <!-- 子题：选择题 -->
          <div v-if="['single', 'multiple'].includes(sq.type)" class="options-list">
            <div v-for="opt in sq.options" :key="opt.label"
              class="option-item" :class="getSubOptionClass(sq, opt.label)">
              <span class="opt-label">{{ opt.label }}</span>
              <span class="opt-text">{{ opt.text }}</span>
              <span v-if="isSubSelected(sq, opt.label) && sq.status === 'correct'" class="opt-mark correct">✓</span>
              <span v-if="isSubSelected(sq, opt.label) && sq.status !== 'correct'" class="opt-mark wrong">✗</span>
            </div>
            <div v-if="mode === 'full'" class="correct-answer-hint">
              正确答案：{{ formatCorrectAnswer(sq.correctAnswer) }}
            </div>
          </div>

          <!-- 子题：判断题 -->
          <div v-if="sq.type === 'judge'" class="judge-result">
            <div class="judge-row">
              <span class="judge-label">你的答案：</span>
              <span :class="sq.status === 'correct' ? 'text-correct' : 'text-wrong'">
                {{ sq.studentAnswer ? '正确 ✓' : '错误 ✗' }}
              </span>
            </div>
            <div v-if="mode === 'full'" class="judge-row">
              <span class="judge-label">正确答案：</span>
              <span class="text-correct">{{ sq.correctAnswer ? '正确 ✓' : '错误 ✗' }}</span>
            </div>
          </div>

          <!-- 子题：填空题 -->
          <div v-if="sq.type === 'blank'" class="blank-result">
            <div v-for="(ans, ai) in getSubBlankAnswers(sq)" :key="ai" class="blank-row">
              <span class="blank-index">第{{ ai + 1 }}空：</span>
              <span :class="ans.isCorrect ? 'text-correct' : 'text-wrong'">{{ ans.student }}</span>
              <span v-if="ans.isCorrect" class="blank-mark">✓</span>
              <span v-else class="blank-mark wrong">✗</span>
            </div>
            <div v-if="mode === 'full'" class="correct-answer-hint">
              正确答案：{{ sq.correctAnswer.join('、') }}
            </div>
          </div>

          <!-- 子题：简答题 -->
          <div v-if="sq.type === 'essay'" class="essay-result">
            <div class="essay-block">
              <div class="essay-label label-student"><van-icon name="edit" color="#1989fa" /> 我的作答</div>
              <div class="essay-content student">
                <div class="essay-text">{{ getEssayText(sq.studentAnswer) }}</div>
                <!-- 附件列表（同一卡片内） -->
                <div v-if="getEssayAttachments(sq.studentAnswer).length > 0" class="essay-attachments">
                  <div class="attachments-title"><van-icon name="paperclip" /> 附件（{{ getEssayAttachments(sq.studentAnswer).length }}）</div>
                  <div v-for="(file, fi) in getEssayAttachments(sq.studentAnswer)"
                    :key="'sub-file-' + fi" class="attachment-file">
                    <van-icon :name="getFileIcon(file.type).name" size="20" :color="getFileIcon(file.type).color" />
                    <div class="file-info">
                      <span class="file-name">{{ file.name }}</span>
                      <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    </div>
                    <div class="file-actions">
                      <span class="file-action" @click="previewFile(file, getEssayAttachments(sq.studentAnswer))">预览</span>
                      <span class="file-action" @click="downloadFile(file)">下载</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="mode === 'full'" class="essay-block">
              <div class="essay-label label-reference"><van-icon name="bookmark" color="#00B96B" /> 参考答案</div>
              <div class="essay-content reference">{{ sq.correctAnswer }}</div>
            </div>
            <div v-if="sq.teacherComment && mode === 'full'" class="teacher-comment">
              <van-icon name="comment" /> {{ sq.teacherComment }}
            </div>
          </div>

          <!-- 子题解析 -->
          <div v-if="mode === 'full' && sq.explanation" class="sub-explanation">
            <van-icon name="info" /> {{ sq.explanation }}
          </div>
        </div>
      </div>

      <!-- 解析（仅 full 模式） -->
      <div v-if="mode === 'full' && currentQuestion.explanation" class="explanation-card">
        <div class="explanation-title"><van-icon name="info" /> 解析</div>
        <div class="explanation-text">{{ currentQuestion.explanation }}</div>
      </div>

      <div style="height: 80px;"></div>
    </div>

    <!-- 底部导航 -->
    <div class="bottom-nav">
      <van-button :disabled="currentIndex === 0" @click="prev">上一题</van-button>
      <van-button type="primary" :disabled="currentIndex === allQuestions.length - 1" @click="next">下一题</van-button>
    </div>

    <!-- 答题卡弹窗 -->
    <van-popup v-model:show="showSheet" position="bottom" round :style="{ height: '75vh' }" :lock-scroll="true">
      <div class="answer-sheet">
        <!-- 头部 -->
        <div class="sheet-header">
          <div class="sheet-header-left">
            <div class="sheet-title">答题卡</div>
            <div class="sheet-stats-inline">
              <span class="stat-dot correct-dot"></span>
              <span class="stat-text">正确 <b>{{ sheetStats.correctCount }}</b></span>
              <span class="stat-dot wrong-dot"></span>
              <span class="stat-text">错误 <b>{{ sheetStats.wrongCount }}</b></span>
              <span class="stat-dot partial-dot"></span>
              <span class="stat-text">部分 <b>{{ sheetStats.partialCount }}</b></span>
            </div>
          </div>
          <van-icon name="cross" class="close-icon" @click="showSheet = false" />
        </div>

        <!-- 总分概览 -->
        <div class="sheet-score-bar">
          <span class="score-label">已得分</span>
          <span class="score-value">{{ result.score }}</span>
          <span class="score-sep">/</span>
          <span class="score-total">{{ result.totalScore }}</span>
        </div>

        <!-- 按题型分组 -->
        <div class="sheet-content">
          <div v-for="group in questionGroups" :key="group.type" class="sheet-group">
            <div class="group-header">
              <span class="group-name">{{ group.typeName }}</span>
              <span class="group-count">{{ group.questions.length }}题</span>
              <span class="group-score">{{ groupGainedScore(group) }}/{{ groupTotalScore(group) }}分</span>
            </div>
            <div class="group-grid">
              <div v-for="q in group.questions" :key="q.id"
                class="sheet-item" :class="[getSheetItemStatus(q), { active: q._flatIndex === currentIndex }]"
                @click="jumpTo(q._flatIndex)">
                <span class="item-index">{{ q._flatIndex + 1 }}</span>
                <span class="item-score" :class="getScoreDeltaClass(q)">{{ formatScoreDelta(q) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showImagePreview, showToast } from 'vant'
import { mockExamResult } from '@/mock/exam'

const router = useRouter()
const route = useRoute()
const result = ref(mockExamResult)
const mode = ref(route.query.mode || 'full')
const currentIndex = ref(0)
const showSheet = ref(false)

// 将分组题目展平为一维数组，复合题保持为整体
const questionGroups = computed(() => {
  let flatIdx = 0
  return result.value.questionGroups.map(g => {
    const flatQuestions = []
    g.questions.forEach(q => {
      if (q.subQuestions) {
        // 复合题作为整体，不拆子题
        flatQuestions.push({
          ...q, type: 'composite', typeName: g.typeName || '复合题',
          _flatIndex: flatIdx++, _parentMaterial: null,
        })
      } else {
        flatQuestions.push({
          ...q, type: g.type, typeName: g.typeName, _flatIndex: flatIdx++, _parentMaterial: null,
        })
      }
    })
    return { ...g, questions: flatQuestions }
  })
})

const allQuestions = computed(() => questionGroups.value.flatMap(g => g.questions))
const currentQuestion = computed(() => allQuestions.value[currentIndex.value] || {})

// 状态相关
const statusClass = computed(() => {
  const q = currentQuestion.value
  if (q.type === 'composite') {
    // 复合题：满分绿色，0分红色，其余橙色
    if (q.studentScore === q.score) return 'status-correct'
    if (q.studentScore === 0) return 'status-wrong'
    return 'status-partial'
  }
  return q.status === 'correct' ? 'status-correct' : 'status-wrong'
})

// 选择题判断
const isChoiceType = computed(() => ['single', 'multiple'].includes(currentQuestion.value.type))

const isStudentSelected = (label) => {
  const a = currentQuestion.value.studentAnswer
  return Array.isArray(a) ? a.includes(label) : a === label
}
const isCorrectOpt = (label) => {
  const a = currentQuestion.value.correctAnswer
  return Array.isArray(a) ? a.includes(label) : a === label
}
const isWrongSelected = (label) => isStudentSelected(label) && !isCorrectOpt(label)

const getOptionClass = (label) => {
  const selected = isStudentSelected(label)
  if (!selected) return ''
  // 整题正确 → 绿色；整题错误 → 全部红色（多选一题错全错）
  return currentQuestion.value.status === 'correct' ? 'opt-correct-selected' : 'opt-wrong-selected'
}

// 格式化正确答案显示
const formatCorrectAnswer = (answer) => {
  return Array.isArray(answer) ? answer.join('、') : answer
}

// 填空题答案对比
const blankAnswers = computed(() => {
  const q = currentQuestion.value
  if (q.type !== 'blank') return []
  const sa = q.studentAnswer || []
  const ca = q.correctAnswer || []
  return sa.map((s, i) => ({ student: s, correct: ca[i], isCorrect: s === ca[i] }))
})

// 完形填空选项样式
const getClozeOptClass = (blank, label) => {
  const isSelected = label === blank.studentAnswer
  if (!isSelected) return ''
  return label === blank.correctAnswer ? 'opt-correct-selected' : 'opt-wrong-selected'
}

// 复合题子题辅助函数
const subTypeName = (type) => {
  const map = { single: '单选题', multiple: '多选题', judge: '判断题', blank: '填空题', essay: '简答题' }
  return map[type] || type
}
const isSubSelected = (sq, label) => {
  const a = sq.studentAnswer
  return Array.isArray(a) ? a.includes(label) : a === label
}
const getSubOptionClass = (sq, label) => {
  const a = sq.studentAnswer
  const selected = Array.isArray(a) ? a.includes(label) : a === label
  if (!selected) return ''
  return sq.status === 'correct' ? 'opt-correct-selected' : 'opt-wrong-selected'
}
const getSubBlankAnswers = (sq) => {
  const sa = sq.studentAnswer || []
  const ca = sq.correctAnswer || []
  return sa.map((s, i) => ({ student: s, correct: ca[i], isCorrect: s === ca[i] }))
}

// 简答题附件辅助函数
const getEssayText = (answer) => {
  if (!answer) return ''
  return typeof answer === 'string' ? answer : (answer.text || '')
}
const getEssayAttachments = (answer) => {
  if (!answer || typeof answer === 'string') return []
  return answer.attachments || []
}
const isImageFile = (type) => type && type.startsWith('image/')
const getFileIcon = (type) => {
  if (!type) return { name: 'description', color: '#86909c' }
  if (type.startsWith('image/')) return { name: 'photo', color: '#00B96B' }
  if (type.includes('pdf')) return { name: 'description', color: '#F53F3F' }
  if (type.includes('word') || type.includes('document')) return { name: 'description', color: '#1989fa' }
  if (type.includes('sheet') || type.includes('excel')) return { name: 'bar-chart-o', color: '#00B96B' }
  if (type.includes('presentation') || type.includes('powerpoint')) return { name: 'tv-o', color: '#FF7D00' }
  return { name: 'description', color: '#86909c' }
}
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i]
}
const previewFile = (file, attachments) => {
  if (isImageFile(file.type)) {
    const images = attachments.filter(a => isImageFile(a.type)).map(a => a.url)
    const startPosition = images.indexOf(file.url)
    showImagePreview({ images, startPosition: startPosition >= 0 ? startPosition : 0 })
  } else {
    showToast(`模拟预览：${file.name}`)
  }
}
const downloadFile = (file) => {
  showToast(`模拟下载：${file.name}`)
}

// 答题卡统计
const sheetStats = computed(() => {
  let correctCount = 0, wrongCount = 0, partialCount = 0
  allQuestions.value.forEach(q => {
    if (q.status === 'correct') correctCount++
    else if (q.status === 'wrong') wrongCount++
    else partialCount++
  })
  return { correctCount, wrongCount, partialCount }
})

const getSheetItemStatus = (q) => {
  if (q.type === 'composite') {
    if (q.studentScore === q.score) return 'item-correct'
    if (q.studentScore === 0) return 'item-wrong'
    return 'item-partial'
  }
  if (q.status === 'correct') return 'item-correct'
  if (q.status === 'wrong') return 'item-wrong'
  return 'item-partial'
}

const formatScoreDelta = (q) => {
  if (q.studentScore === q.score) return `+${q.studentScore}`
  if (q.studentScore === 0) return `-${q.score}`
  return `+${q.studentScore}`
}

const getScoreDeltaClass = (q) => {
  if (q.studentScore === q.score) return 'delta-correct'
  if (q.studentScore === 0) return 'delta-wrong'
  return 'delta-partial'
}

const groupGainedScore = (group) => group.questions.reduce((s, q) => s + q.studentScore, 0)
const groupTotalScore = (group) => group.questions.reduce((s, q) => s + q.score, 0)

// 导航
const prev = () => { if (currentIndex.value > 0) currentIndex.value-- }
const next = () => { if (currentIndex.value < allQuestions.value.length - 1) currentIndex.value++ }
const jumpTo = (idx) => { currentIndex.value = idx; showSheet.value = false }
const goBack = () => router.back()
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; padding-bottom: env(safe-area-inset-bottom); }

/* 导航栏 */
.nav-back { padding: 0 4px; }
.nav-title { font-size: 16px; font-weight: 600; }
.nav-sheet-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #E6F7F0;
  color: #00B96B;
  font-size: 13px;
  font-weight: 600;
  border-radius: 16px;
  cursor: pointer;
}
.nav-sheet-btn:active { opacity: 0.7; }
.nav-sheet-btn .van-icon { font-size: 15px; }

/* 题目信息栏 */
.question-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 16px; background: #fff; border-bottom: 1px solid #f2f3f5;
}
.bar-left { display: flex; align-items: baseline; gap: 2px; }
.q-index { font-size: 20px; font-weight: 700; color: #1d2129; }
.q-total { font-size: 13px; color: #86909c; }
.type-tag {
  font-size: 11px; color: #00B96B; background: #e6f9f0;
  padding: 2px 8px; border-radius: 10px; margin-left: 8px;
}
.q-score { font-size: 13px; font-weight: 600; }

/* 主内容区 */
.content { padding: 12px 16px; }

/* 状态颜色 */
.status-correct { color: #00B96B; }
.status-wrong { color: #F53F3F; }
.status-partial { color: #FF7D00; }

/* 题干 */
.question-stem {
  background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 12px;
}
.material-text {
  font-size: 13px; color: #86909c; line-height: 1.8; margin-bottom: 10px;
  padding-bottom: 10px; border-bottom: 1px dashed #e5e6eb; white-space: pre-line;
}
.stem-text { font-size: 15px; color: #1d2129; line-height: 1.7; }

/* 选择题选项 */
.options-list { margin-bottom: 12px; }
.option-item {
  display: flex; align-items: center; padding: 10px 12px; margin-bottom: 6px;
  border-radius: 8px; font-size: 14px; color: #4e5969; background: #fff;
  border: 1px solid transparent;
}
.opt-label { font-weight: 600; margin-right: 10px; min-width: 20px; }
.opt-text { flex: 1; }
.opt-mark { margin-left: 8px; font-weight: 700; font-size: 16px; }
.opt-mark.correct { color: #00B96B; }
.opt-mark.wrong { color: #F53F3F; }
.opt-correct-selected { background: #e6f9f0; border-color: #00B96B; }
.opt-wrong-selected { background: #fff1f0; border-color: #F53F3F; }
.correct-answer-hint {
  font-size: 13px; color: #00B96B; font-weight: 500;
  padding: 8px 12px; margin-top: 2px;
}

/* 判断题 */
.judge-result { background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
.judge-row { font-size: 14px; line-height: 2.2; }
.judge-label { color: #86909c; }
.text-correct { color: #00B96B; font-weight: 500; }
.text-wrong { color: #F53F3F; font-weight: 500; }

/* 填空题 */
.blank-result { background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
.blank-row { font-size: 14px; line-height: 2.2; }
.blank-index { color: #86909c; }
.blank-mark { color: #00B96B; font-weight: 700; margin-left: 6px; }
.blank-mark.wrong { color: #F53F3F; }

/* 简答题 */
.essay-result { margin-bottom: 12px; }
.essay-block { margin-bottom: 10px; }
.essay-label { font-size: 13px; font-weight: 500; color: #4e5969; margin-bottom: 6px; display: flex; align-items: center; gap: 4px; }
.label-student { color: #1989fa; }
.label-reference { color: #00B96B; }
.essay-content {
  font-size: 14px; line-height: 1.7; padding: 12px; border-radius: 8px;
}
.essay-content.student { background: #fff; color: #4e5969; border: 1px solid #e5e6eb; }
.essay-content.reference { background: #f0fff4; color: #1d2129; border: 1px solid #b7eb8f; }
.teacher-comment {
  font-size: 13px; color: #d48806; background: #fffbe6;
  padding: 10px 12px; border-radius: 8px;
}

/* 简答题附件 */
.essay-text { white-space: pre-line; }
.essay-attachments {
  margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e5e6eb;
}
.attachments-title {
  font-size: 12px; color: #86909c; margin-bottom: 8px;
  display: flex; align-items: center; gap: 4px;
}
.attachment-file {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 8px 10px; background: #f7f8fa; border-radius: 6px;
  margin-bottom: 6px;
}
.attachment-file > .van-icon { margin-top: 1px; flex-shrink: 0; }
.file-info { flex: 1; min-width: 0; }
.file-name {
  font-size: 13px; color: #4e5969; display: block;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.file-size { font-size: 11px; color: #c0c4cc; }
.file-actions {
  display: flex; align-items: flex-start; gap: 8px; flex-shrink: 0; margin-top: 1px;
}
.file-action {
  font-size: 12px; color: #1989fa; cursor: pointer; white-space: nowrap;
}
.file-action:active { opacity: 0.6; }

/* 完形填空 */
.cloze-result { margin-bottom: 12px; }
.cloze-item {
  background: #fff; border-radius: 10px; padding: 12px; margin-bottom: 8px;
}
.cloze-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px; font-size: 13px;
}
.cloze-order { color: #1d2129; font-weight: 600; }
.cloze-check { color: #00B96B; margin-left: 2px; }

/* 复合题 */
.composite-result { margin-bottom: 12px; }
.composite-sub {
  background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 10px;
}
.composite-sub-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
  padding-bottom: 8px; border-bottom: 1px solid #f2f3f5;
}
.composite-sub-index { font-size: 14px; font-weight: 600; color: #1d2129; }
.composite-sub-type {
  font-size: 11px; color: #00B96B; background: #e6f9f0;
  padding: 2px 8px; border-radius: 10px;
}
.composite-sub-score { font-size: 13px; font-weight: 600; margin-left: auto; }
.composite-sub-stem { font-size: 14px; color: #4e5969; line-height: 1.7; margin-bottom: 10px; }
.composite-sub .options-list { margin-bottom: 0; }
.composite-sub .judge-result,
.composite-sub .blank-result,
.composite-sub .essay-result { margin-bottom: 0; padding: 0; background: transparent; border-radius: 0; }
.sub-explanation {
  font-size: 12px; color: #86909c; margin-top: 8px;
  padding-top: 8px; border-top: 1px dashed #e5e6eb;
  display: flex; align-items: center; gap: 4px;
}

/* 解析 */
.explanation-card {
  background: #f7f8fa; border-radius: 10px; padding: 14px; margin-bottom: 12px;
}
.explanation-title { font-size: 14px; font-weight: 600; color: #86909c; margin-bottom: 6px; }
.explanation-text { font-size: 13px; color: #86909c; line-height: 1.7; }

/* 底部导航 */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0;
  display: flex; gap: 12px; padding: 10px 16px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  background: #fff; border-top: 1px solid #f2f3f5;
}
.bottom-nav .van-button { flex: 1; }

/* 答题卡弹窗 */
.answer-sheet {
  height: 75vh; display: flex; flex-direction: column;
  background: #f7f8fa; overflow: hidden;
}
.sheet-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; background: #fff; border-bottom: 1px solid #f0f1f2; flex-shrink: 0;
}
.sheet-header-left { display: flex; align-items: center; gap: 12px; }
.sheet-title { font-size: 16px; font-weight: 600; color: #1d2129; }
.sheet-stats-inline { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #86909c; }
.stat-dot { width: 8px; height: 8px; border-radius: 50%; margin-left: 6px; }
.stat-dot:first-child { margin-left: 0; }
.stat-dot.correct-dot { background: #00B96B; }
.stat-dot.wrong-dot { background: #F53F3F; }
.stat-dot.partial-dot { background: #FF7D00; }
.stat-text b { font-weight: 600; color: #4e5969; }
.close-icon { font-size: 20px; color: #86909c; cursor: pointer; padding: 4px; }
.close-icon:active { transform: scale(0.9); }

/* 总分概览 */
.sheet-score-bar {
  display: flex; align-items: baseline; justify-content: center; gap: 2px;
  padding: 10px 16px; background: #fff; border-bottom: 1px solid #f0f1f2; flex-shrink: 0;
}
.score-label { font-size: 13px; color: #86909c; margin-right: 4px; }
.score-value { font-size: 24px; font-weight: 700; color: #1d2129; }
.score-sep { font-size: 16px; color: #c0c4cc; margin: 0 2px; }
.score-total { font-size: 16px; color: #86909c; }

/* 分组内容 */
.sheet-content { flex: 1; overflow-y: auto; padding: 12px 16px; }
.sheet-group { margin-bottom: 16px; }
.sheet-group:last-child { margin-bottom: 0; }
.group-header { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.group-name { font-size: 13px; font-weight: 600; color: #1d2129; }
.group-count {
  font-size: 11px; color: #86909c; background: #f2f3f5;
  padding: 1px 6px; border-radius: 8px;
}
.group-score { font-size: 11px; color: #86909c; margin-left: auto; }
.group-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }

/* 题号格子 */
.sheet-item {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 6px 0; background: #fff; border-radius: 8px;
  border: 1.5px solid #e5e6eb; cursor: pointer; transition: all 0.15s ease;
}
.sheet-item:active { transform: scale(0.92); }
.item-index { font-size: 13px; font-weight: 500; color: #4e5969; line-height: 1.2; }
.item-score { font-size: 10px; line-height: 1.2; margin-top: 1px; }
.delta-correct { color: #00B96B; }
.delta-wrong { color: #F53F3F; }
.delta-partial { color: #FF7D00; }

/* 状态色 */
.sheet-item.item-correct { background: #e6f9f0; border-color: #00B96B; }
.sheet-item.item-correct .item-index { color: #00B96B; font-weight: 600; }
.sheet-item.item-wrong { background: #fff1f0; border-color: #F53F3F; }
.sheet-item.item-wrong .item-index { color: #F53F3F; font-weight: 600; }
.sheet-item.item-partial { background: #fff7e6; border-color: #FF7D00; }
.sheet-item.item-partial .item-index { color: #FF7D00; font-weight: 600; }

/* 当前题高亮 */
.sheet-item.active { box-shadow: 0 0 0 2px rgba(0, 185, 107, 0.3); }
</style>
