import { defineStore } from 'pinia'
import { saveAnswer, syncAnswers } from '@/api/exam'

const STORAGE_KEY_PREFIX = 'exam_answers_'

export const useAnswerStore = defineStore('answer', {
  state: () => ({
    examId: null,
    paperId: null,
    answers: {}, // questionId -> answer
    marked: [], // 标记的题目ID列表
    currentQuestionIndex: 0,
    startTime: null,
    remainingTime: 0,
    autoSaveTimer: null,
    countdownTimer: null,
  }),

  getters: {
    // 获取题目列表（从 exam store）
    questions() {
      // 需要在这里导入，避免循环依赖
      const { useExamStore } = require('./exam')
      const examStore = useExamStore()
      return examStore.currentPaper?.questions || []
    },

    // 已答题数
    answeredCount: (state) => {
      return Object.keys(state.answers).length
    },

    // 未答题数
    unansweredCount() {
      const totalCount = this.questions.length
      return totalCount - this.answeredCount
    },

    // 当前题目
    currentQuestion() {
      return this.questions[this.currentQuestionIndex]
    },

    // 格式化剩余时间
    formattedTime: (state) => {
      const hours = Math.floor(state.remainingTime / 3600)
      const minutes = Math.floor((state.remainingTime % 3600) / 60)
      const seconds = state.remainingTime % 60
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    },
  },

  actions: {
    // 初始化答题
    initAnswer(examId, paperId, duration) {
      this.examId = examId
      this.paperId = paperId
      this.startTime = Date.now()
      this.remainingTime = duration * 60 // 转换为秒

      // 从本地存储恢复答案
      this.loadFromLocal()

      // 启动自动保存
      this.startAutoSave()

      // 启动倒计时
      this.startCountdown()
    },

    // 保存答案
    async saveAnswer(questionId, answer) {
      this.answers[questionId] = answer
      this.saveToLocal()

      // 异步保存到服务器
      try {
        await saveAnswer(this.examId, questionId, answer)
      } catch (error) {
        console.error('保存答案失败:', error)
      }
    },

    // 标记题目
    toggleMark(questionId) {
      const index = this.marked.indexOf(questionId)
      if (index > -1) {
        this.marked.splice(index, 1)
      } else {
        this.marked.push(questionId)
      }
      this.saveToLocal()
    },

    // 切换题目
    setCurrentQuestion(index) {
      this.currentQuestionIndex = index
    },

    // 下一题
    nextQuestion() {
      const totalCount = this.questions.length
      if (this.currentQuestionIndex < totalCount - 1) {
        this.currentQuestionIndex++
      }
    },

    // 上一题
    prevQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
      }
    },

    // 启动自动保存
    startAutoSave() {
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer)
      }
      this.autoSaveTimer = setInterval(() => {
        this.syncToServer()
      }, 30000) // 每30秒同步一次
    },

    // 启动倒计时
    startCountdown() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
      }
      this.countdownTimer = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--
          this.saveToLocal() // 保存剩余时间
        } else {
          this.stopCountdown()
          // 时间到，触发自动提交（由组件监听）
        }
      }, 1000)
    },

    // 停止倒计时
    stopCountdown() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
    },

    // 停止自动保存
    stopAutoSave() {
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer)
        this.autoSaveTimer = null
      }
    },

    // 同步到服务器
    async syncToServer() {
      if (!navigator.onLine) return

      try {
        await syncAnswers(this.examId, {
          answers: this.answers,
          marked: this.marked,
          currentQuestionIndex: this.currentQuestionIndex,
        })
      } catch (error) {
        console.error('同步答案失败:', error)
      }
    },

    // 保存到本地
    saveToLocal() {
      const data = {
        examId: this.examId,
        paperId: this.paperId,
        answers: this.answers,
        marked: this.marked,
        currentQuestionIndex: this.currentQuestionIndex,
        startTime: this.startTime,
        remainingTime: this.remainingTime,
      }
      localStorage.setItem(STORAGE_KEY_PREFIX + this.examId, JSON.stringify(data))
    },

    // 从本地恢复
    loadFromLocal() {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + this.examId)
      if (data) {
        try {
          const parsed = JSON.parse(data)
          this.answers = parsed.answers || {}
          this.marked = parsed.marked || []
          this.currentQuestionIndex = parsed.currentQuestionIndex || 0
          // 恢复剩余时间（考虑已过去的时间）
          if (parsed.startTime && parsed.remainingTime) {
            const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000)
            this.remainingTime = Math.max(0, parsed.remainingTime - elapsed)
          }
        } catch (error) {
          console.error('恢复本地数据失败:', error)
        }
      }
    },

    // 清空本地数据
    clearLocal() {
      localStorage.removeItem(STORAGE_KEY_PREFIX + this.examId)
    },

    // 重置状态
    reset() {
      this.stopCountdown()
      this.stopAutoSave()
      this.clearLocal()
      this.$reset()
    },
  },
})
