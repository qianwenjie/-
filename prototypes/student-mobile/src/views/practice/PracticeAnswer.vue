<template>
  <div class="practice-answer-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar fixed placeholder>
      <template #left>
        <div class="nav-back" @click="handleBack">
          <van-icon name="arrow-left" size="18" />
        </div>
      </template>
      <template #title>
        <span class="nav-title">{{ isReviewMode ? (route.query.session ? `第 ${route.query.session} 次记录` : '答题记录') : task?.name }}</span>
      </template>
      <template #right>
        <div class="nav-sheet-btn" @click="showSheet = true">
          <van-icon name="apps-o" />
          <span>答题卡</span>
        </div>
      </template>
    </van-nav-bar>

    <!-- 题目信息栏（fixed） -->
    <div v-if="!loading && currentQuestion" class="question-bar">
      <div class="bar-left">
        <span class="question-index">{{ store.currentQuestionIndex + 1 }}</span>
        <span class="question-total">/{{ store.questions.length }}</span>
        <span class="type-label" :style="{ color: typeColor(currentQuestion.type) }">{{ currentQuestion.typeName }}</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading-wrapper" vertical>加载中...</van-loading>

    <!-- 主内容区 -->
    <div v-else-if="currentQuestion" class="content">
      <!-- 题目内容 -->
      <div class="question-content">
        <!-- 复合题：显示材料 -->
        <div v-if="currentQuestion.type === 'composite'" class="question-text" v-html="currentQuestion.material"></div>
        <!-- 其他题型 -->
        <div v-else class="question-text" v-html="currentQuestion.content"></div>
      </div>

      <!-- 答题区域（普通题型） -->
      <!-- 已答：显示结果回显（选项带对错标记） -->
      <div v-if="!isClozeOrComposite && isAnswered" class="answer-area answered-review">
        <!-- 单选/多选：选项带对错标记，不显示正确答案 -->
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
        <!-- 判断题：只显示用户选择，不显示正确答案 -->
        <div v-else-if="currentQuestion.type === 'judge'" class="review-judge">
          <div class="review-judge-row">
            <span class="review-judge-label">你的答案：</span>
            <span :class="currentResult?.isCorrect ? 'text-correct' : 'text-wrong'">
              {{ formatJudgeAnswer(currentAnswer) }}
            </span>
          </div>
        </div>
        <!-- 填空题：只显示用户填写内容，不显示正确答案 -->
        <div v-else-if="currentQuestion.type === 'blank'" class="review-blank">
          <div v-for="(item, idx) in getBlankReviewDetails()" :key="idx" class="review-blank-row">
            <span class="review-blank-index">第{{ idx + 1 }}空：</span>
            <span :class="item.isCorrect ? 'text-correct' : 'text-wrong'">{{ item.student || '未作答' }}</span>
            <span v-if="item.isCorrect" class="review-blank-mark correct">✓</span>
            <span v-else class="review-blank-mark wrong">✗</span>
          </div>
        </div>
        <!-- 简答题：只显示用户作答，不显示参考答案 -->
        <div v-else-if="currentQuestion.type === 'essay'" class="review-essay">
          <div class="review-essay-block">
            <div class="review-essay-label label-student">我的作答</div>
            <div class="review-essay-content student">{{ getEssayUserText() || '未作答' }}</div>
          </div>
        </div>
      </div>
      <!-- 未答：显示答题组件 -->
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

      <!-- 完形填空/复合题 -->
      <ClozeQuestion
        v-if="currentQuestion.type === 'cloze'"
        ref="clozeRef"
        :question="currentQuestion"
        :value="currentAnswer"
        @update:value="handleAnswerChange"
      />
      <CompositeQuestion
        v-if="currentQuestion.type === 'composite'"
        ref="compositeRef"
        :question="currentQuestion"
        :value="currentAnswer"
        @update:value="handleAnswerChange"
      />

      <!-- 多选题/填空题确认按钮 -->
      <div v-if="needConfirmBtn && !isReviewMode" class="confirm-btn-wrapper">
        <van-button type="primary" block round @click="confirmAnswer">确认提交</van-button>
      </div>

      <!-- 完形填空反馈（提交后平铺展示每空对错） -->
      <ClozeFeedback
        v-if="isAnswered && currentQuestion.type === 'cloze'"
        :visible="true"
        :question="currentQuestion"
        :user-answer="currentAnswer"
        :correct-answer="currentQuestion.correctAnswer"
        :explanation="currentQuestion.explanation"
      />

      <!-- 复合题反馈（提交后平铺展示每个子题对错） -->
      <CompositeFeedback
        v-if="isAnswered && currentQuestion.type === 'composite'"
        :visible="true"
        :question="currentQuestion"
        :user-answer="currentAnswer"
        :correct-answer="currentQuestion.correctAnswer"
        :essay-accuracies="currentResult?.essayAccuracies || {}"
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
      />
    </div>

    <!-- 完形填空/复合题：悬浮按钮区域 -->
    <div v-if="!loading && currentQuestion && isClozeOrComposite && !isAnswered && !isReviewMode" class="floating-btn-group">
      <div class="floating-answer-btn" @click="openAnswerPanel">
        <van-icon name="edit" />
        <span>点击作答</span>
      </div>
      <div v-if="isClozeCompositeComplete" class="floating-submit-btn" @click="submitClozeOrComposite">
        <van-icon name="success" />
        <span>提交答案</span>
      </div>
    </div>

    <!-- 底部导航 -->
    <div v-if="!loading && currentQuestion" class="bottom-nav safe-area-bottom">
      <!-- wrong-redo 模式：答对后显示标记已掌握 -->
      <div v-if="isWrongRedoMode && isAnswered && currentResult?.isCorrect" class="mastered-btn" @click="markMastered">
        <van-icon name="passed" size="18" color="#00B96B" />
        <span>标记已掌握</span>
      </div>
      <!-- 普通模式：收藏按钮 -->
      <div v-else-if="!isReviewMode && !isWrongRedoMode" class="favorite-btn" @click="toggleFavorite">
        <van-icon :name="isFavorited ? 'star' : 'star-o'" :color="isFavorited ? '#FFD700' : '#86909c'" size="20" />
        <span>{{ isFavorited ? '已收藏' : '收藏本题' }}</span>
      </div>
      <!-- wrong-redo 模式：收藏按钮（上一题左边） -->
      <div v-if="isWrongRedoMode" class="favorite-btn" @click="toggleFavorite">
        <van-icon :name="isFavorited ? 'star' : 'star-o'" :color="isFavorited ? '#FFD700' : '#86909c'" size="20" />
        <span>{{ isFavorited ? '已收藏' : '收藏' }}</span>
      </div>
      <van-button
        type="default"
        size="large"
        :disabled="store.currentQuestionIndex === 0"
        @click="store.prevQuestion()"
      >
        上一题
      </van-button>
      <van-button
        v-if="store.currentQuestionIndex < store.questions.length - 1"
        type="primary"
        size="large"
        @click="handleNext"
      >
        下一题
      </van-button>
      <van-button
        v-else-if="isReviewMode"
        type="default"
        size="large"
        @click="router.back()"
      >
        返回
      </van-button>
      <van-button
        v-else
        type="success"
        size="large"
        @click="finishPractice"
      >
        {{ isWrongRedoMode ? '完成复习' : '完成刷题' }}
      </van-button>
    </div>

    <!-- 答题卡弹窗 -->
    <PracticeAnswerSheet
      v-model:show="showSheet"
      :questions="store.questions"
      :answer-sheet-data="store.answerSheetData"
      :current-index="store.currentQuestionIndex"
      @select="onSheetSelect"
      @finish="finishPractice"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores'
import { getPracticeSessions } from '@/api/practice'
import { showDialog, showToast } from 'vant'
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
import PracticeAnswerSheet from './components/PracticeAnswerSheet.vue'

const route = useRoute()
const router = useRouter()
const store = usePracticeStore()

const loading = ref(true)
const showSheet = ref(false)
const task = ref(null)
const clozeRef = ref(null)
const compositeRef = ref(null)

const taskId = route.params.id
// 查看记录模式：只读，不允许答题
const isReviewMode = computed(() => route.query.mode === 'review')
// 错题重做模式
const isWrongRedoMode = computed(() => route.query.mode === 'wrong-redo')

// 当前题目
const currentQuestion = computed(() => store.currentQuestion)
// 当前答案（根据题型返回正确的默认值）
const currentAnswer = computed(() => {
  if (!currentQuestion.value) return null
  const ans = store.answers[currentQuestion.value.id]
  if (ans !== undefined && ans !== null) return ans
  // 返回题型对应的默认值
  const type = currentQuestion.value.type
  if (type === 'multiple') return []
  if (type === 'blank') return {} // BlankQuestion 组件使用 { blankId: value } 对象格式
  if (type === 'cloze' || type === 'composite') return {}
  return ''
})
// 当前结果
const currentResult = computed(() => {
  if (!currentQuestion.value) return null
  return store.results[currentQuestion.value.id] || null
})
// 是否已答
const isAnswered = computed(() => !!currentResult.value)
// 是否已有答案（用于多选确认）
const hasAnswer = computed(() => {
  const ans = currentAnswer.value
  return Array.isArray(ans) ? ans.length > 0 : ans !== null && ans !== undefined
})
// 是否收藏
const isFavorited = computed(() => {
  if (!currentQuestion.value) return false
  return store.favorites.includes(currentQuestion.value.id)
})
// 是否为完形填空或复合题
const isClozeOrComposite = computed(() => {
  return currentQuestion.value?.type === 'cloze' || currentQuestion.value?.type === 'composite'
})
// 完形填空/复合题是否全部作答完成
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

// 题型颜色
const typeColor = (type) => {
  const map = {
    single: '#14C9C9', multiple: '#722ED1', judge: '#3491FA',
    blank: '#FF7D00', essay: '#722ED1', cloze: '#165DFF', composite: '#F77234',
  }
  return map[type] || '#4e5969'
}

// 初始化
onMounted(async () => {
  try {
    const detail = await store.fetchTaskDetail(taskId)
    task.value = detail
    // 查看记录模式：加载题目 + 恢复已有进度，不允许答题
    if (isReviewMode.value) {
      const drawCount = parseInt(route.query.drawCount) || 0
      const sessionIndex = parseInt(route.query.session) || 0
      if (sessionIndex > 0) {
        // 指定次数：从 sessions 数据注入
        await store.initPractice(taskId, { drawCount, skipLoadProgress: true })
        const sessions = await getPracticeSessions(taskId)
        const session = sessions.find(s => s.sessionIndex === sessionIndex)
        if (session) {
          store.loadProgressFromData(session)
        }
      } else {
        await store.initPractice(taskId, { drawCount })
      }
    } else if (route.query.mode === 'wrong-redo') {
      // 错题重做模式：只加载该任务的错题，不恢复进度
      store.loadWrongBook()
      store.initWrongRedo(taskId)
    } else {
      const drawCount = parseInt(route.query.drawCount) || 0
      await store.initPractice(taskId, { drawCount })
    }
    // 安全检查：确保 currentQuestionIndex 不超出范围
    if (store.currentQuestionIndex >= store.questions.length) {
      store.currentQuestionIndex = 0
    }
  } finally {
    loading.value = false
  }
})

// 返回（保存进度）
const handleBack = async () => {
  // 查看记录模式：直接返回
  if (isReviewMode.value) {
    router.back()
    return
  }
  try {
    await showDialog({
      title: '退出刷题',
      message: '当前进度已自动保存，确定退出吗？',
      confirmButtonText: '退出',
      cancelButtonText: '继续刷题',
      confirmButtonColor: '#00B96B',
    })
    store.saveProgress(taskId)
    router.back()
  } catch {
    // 取消
  }
}

// 答案变更
const handleAnswerChange = (val) => {
  if (isAnswered.value) return // 已答锁定
  if (isReviewMode.value) return // 查看记录模式锁定

  // 完形填空/复合题：只暂存，不立即判定
  if (isClozeOrComposite.value) {
    store.answers[currentQuestion.value.id] = val
    return
  }

  // 所有题型：先暂存，等确认按钮
  store.answers[currentQuestion.value.id] = val
}

// 是否需要确认按钮（未答且有答案的所有题型）
const needConfirmBtn = computed(() => {
  if (!currentQuestion.value || isAnswered.value) return false
  const type = currentQuestion.value.type
  if (type === 'cloze' || type === 'composite') return false
  const ans = currentAnswer.value
  if (type === 'single' || type === 'judge') return ans !== null && ans !== undefined && ans !== ''
  if (type === 'multiple') return Array.isArray(ans) && ans.length > 0
  if (type === 'blank') {
    if (ans && typeof ans === 'object' && !Array.isArray(ans)) {
      return Object.values(ans).some(v => v && String(v).trim())
    }
    return Array.isArray(ans) && ans.length > 0
  }
  if (type === 'essay') {
    if (typeof ans === 'string') return ans.trim().length > 0
    if (ans && typeof ans === 'object') return (ans.text && ans.text.trim().length > 0) || (ans.attachments && ans.attachments.length > 0)
    return false
  }
  return false
})

// 确认提交答案（所有题型统一走此处）
const confirmAnswer = () => {
  const val = currentAnswer.value
  const q = currentQuestion.value
  if (q.type === 'essay') {
    // 简答题：计算准确率
    const accuracy = calcEssayAccuracy(val, q.correctAnswer)
    const isCorrect = accuracy >= 80
    store.submitAnswer(q.id, val, isCorrect, { type: 'essay', accuracy })
  } else {
    const isCorrect = checkAnswer(val, q)
    store.submitAnswer(q.id, val, isCorrect)
  }
  if (isWrongRedoMode.value) store.recordRedoAttempt(q.id)
}

// 完形填空/复合题提交
const submitClozeOrComposite = () => {
  const q = currentQuestion.value
  const val = currentAnswer.value
  const isCorrect = checkClozeCompositeAnswer(val, q)
  // 复合题中简答子题的准确率信息
  const extra = {}
  if (q.type === 'composite') {
    const essayAccuracies = {}
    q.subQuestions?.forEach(sq => {
      if (sq.type === 'essay') {
        const userAns = val[sq.id]
        essayAccuracies[sq.id] = calcEssayAccuracy(userAns, sq.correctAnswer)
      }
    })
    if (Object.keys(essayAccuracies).length > 0) {
      extra.essayAccuracies = essayAccuracies
    }
  }
  store.submitAnswer(q.id, val, isCorrect, Object.keys(extra).length > 0 ? extra : undefined)
  if (isWrongRedoMode.value) store.recordRedoAttempt(q.id)
}

// 判定完形填空/复合题答案
const checkClozeCompositeAnswer = (userAnswer, question) => {
  const correct = question.correctAnswer
  if (!userAnswer || typeof userAnswer !== 'object') return false
  if (question.type === 'cloze') {
    // correctAnswer: { b1: 'A', b2: 'B', b3: 'A' }
    const keys = Object.keys(correct)
    return keys.every(k => userAnswer[k] === correct[k])
  }
  if (question.type === 'composite') {
    // 逐子题判定，任意一题错误则整题错误
    return question.subQuestions?.every(sq => {
      const userAns = userAnswer[sq.id]
      const correctAns = sq.correctAnswer
      if (sq.type === 'single') return userAns === correctAns
      if (sq.type === 'multiple') {
        return Array.isArray(userAns) && Array.isArray(correctAns)
          && userAns.length === correctAns.length
          && userAns.every(a => correctAns.includes(a))
      }
      if (sq.type === 'judge') return String(userAns) === String(correctAns)
      if (sq.type === 'blank') {
        if (Array.isArray(userAns) && Array.isArray(correctAns)) {
          return userAns.every((a, i) => a?.trim().toLowerCase() === correctAns[i]?.trim().toLowerCase())
        }
        if (typeof userAns === 'object' && userAns !== null && !Array.isArray(userAns) && Array.isArray(correctAns)) {
          const blanks = sq.blanks || []
          return blanks.every((b, i) => userAns[b.id]?.trim().toLowerCase() === correctAns[i]?.trim().toLowerCase())
        }
        return false
      }
      if (sq.type === 'essay') {
        const text = typeof userAns === 'string' ? userAns : userAns?.text || ''
        // 简答题：准确率>=80%视为正确
        const accuracy = calcEssayAccuracy(text, correctAns)
        return accuracy >= 80
      }
      return String(userAns) === String(correctAns)
    }) ?? false
  }
  return false
}

// 判定答案
const checkAnswer = (userAnswer, question) => {
  const correct = question.correctAnswer
  if (question.type === 'single') {
    return userAnswer === correct
  }
  if (question.type === 'multiple') {
    if (!Array.isArray(userAnswer) || !Array.isArray(correct)) return false
    return userAnswer.length === correct.length && userAnswer.every(a => correct.includes(a))
  }
  if (question.type === 'judge') {
    // JudgeQuestion 组件 emit 的是 string 'true'/'false'，mock 数据可能是 boolean
    return String(userAnswer) === String(correct)
  }
  if (question.type === 'blank') {
    // BlankQuestion 组件 emit 的是 { blankId: value } 对象格式
    if (userAnswer && typeof userAnswer === 'object' && !Array.isArray(userAnswer) && Array.isArray(correct)) {
      const blanks = question.blanks || []
      return blanks.every((b, i) => {
        const val = userAnswer[b.id] || ''
        return val.trim().toLowerCase() === (correct[i] || '').trim().toLowerCase()
      })
    }
    // 兼容数组格式
    if (Array.isArray(userAnswer) && Array.isArray(correct)) {
      return userAnswer.every((a, i) => a?.trim().toLowerCase() === correct[i]?.trim().toLowerCase())
    }
    return false
  }
  if (question.type === 'essay') {
    // 简答题：计算准确率，>=80% 视为通过
    const accuracy = calcEssayAccuracy(userAnswer, correct)
    return accuracy >= 80
  }
  return false
}

// 计算简答题准确率（基于关键词匹配）
const calcEssayAccuracy = (userAnswer, correctAnswer) => {
  const userText = (typeof userAnswer === 'string' ? userAnswer : userAnswer?.text || '').trim()
  const correctText = String(correctAnswer || '').trim()
  if (!userText || !correctText) return 0
  // 提取关键词（去除常见停用词，按字符分词）
  const stopWords = ['的', '了', '是', '在', '和', '与', '或', '等', '对', '将', '把', '被', '从', '到', '为', '以', '及', '而', '也', '都', '就', '又', '不', '有', '这', '那', '个', '一', '上', '下', '中', '大', '小']
  const extractKeywords = (text) => {
    // 按标点和空格分割，过滤停用词和短词
    return text
      .replace(/[，。、；：！？""''（）《》【】\s,.;:!?()\[\]{}]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2 && !stopWords.includes(w))
  }
  const correctKeywords = extractKeywords(correctText)
  if (correctKeywords.length === 0) {
    // 无关键词时直接比较
    return userText === correctText ? 100 : 0
  }
  const matchCount = correctKeywords.filter(kw => userText.includes(kw)).length
  return Math.round((matchCount / correctKeywords.length) * 100)
}

// === 已答题目回显辅助函数 ===

// 用户是否选了该选项
const isUserSelected = (label) => {
  const ans = currentAnswer.value
  return Array.isArray(ans) ? ans.includes(label) : ans === label
}

// 是否为正确答案选项
const isCorrectOption = (label) => {
  const correct = currentQuestion.value?.correctAnswer
  return Array.isArray(correct) ? correct.includes(label) : correct === label
}

// 选项回显样式：只标记用户选择的选项，不高亮正确答案
const getReviewOptionClass = (label) => {
  const selected = isUserSelected(label)
  const isRight = currentResult.value?.isCorrect  // 整体是否答对

  // 只对用户选择的选项添加样式
  if (selected && isRight) return 'review-opt-correct'   // 整体答对，选项显示绿色
  if (selected && !isRight) return 'review-opt-wrong'    // 整体答错，选项显示红色
  return ''
}

// 判断题答案格式化
const formatJudgeAnswer = (val) => {
  if (val === true || val === 'true') return '正确 ✓'
  if (val === false || val === 'false') return '错误 ✗'
  return '未作答'
}

// 填空题逐空对比
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
    return correct.map((c, i) => ({
      student: user[i] || '', correct: c,
      isCorrect: (user[i] || '').trim().toLowerCase() === (c || '').trim().toLowerCase(),
    }))
  }
  return correct.map(c => ({ student: '', correct: c, isCorrect: false }))
}

// 数组答案格式化
const formatArrayAnswer = (answer) => {
  return Array.isArray(answer) ? answer.join('、') : String(answer || '')
}

// 简答题用户文本
const getEssayUserText = () => {
  const ans = currentAnswer.value
  if (typeof ans === 'string') return ans
  if (ans && typeof ans === 'object' && ans.text) return ans.text
  return ''
}

// 下一题
const handleNext = () => {
  if (store.currentQuestionIndex < store.questions.length - 1) {
    store.nextQuestion()
  }
}

// 完成刷题
const finishPractice = () => {
  if (isWrongRedoMode.value) {
    router.replace('/practice/wrong-book')
    return
  }
  store.saveProgress(taskId)
  router.replace(`/practice/result/${taskId}`)
}

// 答题卡选择
const onSheetSelect = (index) => {
  store.setCurrentQuestion(index)
  showSheet.value = false
}

// 打开完形填空/复合题答题面板
const openAnswerPanel = () => {
  if (currentQuestion.value?.type === 'cloze') {
    clozeRef.value?.showPanel()
  } else if (currentQuestion.value?.type === 'composite') {
    compositeRef.value?.showPanel()
  }
}

// 收藏
const toggleFavorite = () => {
  if (!currentQuestion.value) return
  store.toggleFavorite(currentQuestion.value.id)
  showToast(isFavorited.value ? '已收藏' : '已取消收藏')
}

// 错题重做：标记已掌握
const markMastered = () => {
  if (!currentQuestion.value) return
  store.markMastered(currentQuestion.value.id)
  showToast({ message: '已标记为掌握', icon: 'passed' })
}
</script>

<style scoped>
.practice-answer-page {
  min-height: 100vh;
  background: var(--bg-color, #f7f8fa);
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
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

.nav-sheet-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  padding: 4px 10px;
  background: #E8F8F0;
  color: #00B96B;
  font-weight: 600;
  border-radius: 16px;
  cursor: pointer;
}

/* 题目信息栏（fixed，与考试模块一致） */
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

.loading-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

/* 主内容（与考试模块一致） */
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

/* === 已答题目回显样式 === */
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

.review-opt-text {
  flex: 1;
}

.review-opt-mark {
  margin-left: 8px;
  font-weight: 700;
  font-size: 16px;
}

.review-opt-mark.correct { color: #00B96B; }
.review-opt-mark.wrong { color: #F53F3F; }

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

.review-judge-label {
  color: #86909c;
}

.text-correct { color: #00B96B; font-weight: 500; }
.text-wrong { color: #F53F3F; font-weight: 500; }

/* 填空题回显 */
.review-blank-row {
  font-size: 14px;
  line-height: 2.2;
}

.review-blank-index {
  color: #86909c;
}

.review-blank-mark {
  font-weight: 700;
  margin-left: 6px;
}

.review-blank-mark.correct { color: #00B96B; }
.review-blank-mark.wrong { color: #F53F3F; }

.review-correct-hint {
  font-size: 13px;
  color: #00B96B;
  font-weight: 500;
  padding: 4px 0;
  margin-top: 2px;
}

/* 简答题回显 */
.review-essay-block {
  margin-bottom: 10px;
}

.review-essay-block:last-child {
  margin-bottom: 0;
}

.review-essay-label {
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
  margin-bottom: 6px;
}

.review-essay-label.label-student { color: #1989fa; }
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

.confirm-btn-wrapper {
  margin: 12px 12px 0;
}

.confirm-btn-wrapper :deep(.van-button--primary) {
  background: #00B96B;
  border-color: #00B96B;
}

/* 底部导航（与考试模块一致） */
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
  z-index: 100;
}

.bottom-nav .van-button {
  flex: 1;
}

.bottom-nav :deep(.van-button--primary) {
  background: #00B96B;
  border-color: #00B96B;
}

.bottom-nav :deep(.van-button--success) {
  background: #00B96B;
  border-color: #00B96B;
}

/* 底部收藏按钮 */
.favorite-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 56px;
  cursor: pointer;
  flex-shrink: 0;
}

.favorite-btn span {
  font-size: 10px;
  color: #86909c;
  white-space: nowrap;
}

/* 错题重做：标记已掌握按钮 */
.mastered-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 56px;
  cursor: pointer;
  flex-shrink: 0;
}

.mastered-btn span {
  font-size: 10px;
  color: #00B96B;
  white-space: nowrap;
}

/* 悬浮按钮组 */
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
</style>
