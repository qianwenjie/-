import { defineStore } from 'pinia'
import { getExamList, getExamDetail } from '@/api/exam'

export const useExamStore = defineStore('exam', {
  state: () => ({
    examList: [],
    currentExam: null,
    currentPaper: null,
    loading: false,
    // 已通过人脸验证的考试ID集合
    faceVerifiedExams: new Set(),
  }),

  getters: {
    // 获取当前考试状态
    examStatus: (state) => {
      if (!state.currentExam) return null
      const now = Date.now()
      const startTime = new Date(state.currentExam.startTime).getTime()
      const endTime = new Date(state.currentExam.endTime).getTime()

      if (now < startTime) return 'not_started'
      if (now > endTime) return 'ended'
      return 'in_progress'
    },

    // 是否可以进入考试
    canEnter: (state) => {
      if (!state.currentExam) return false
      const status = state.examStatus
      return status === 'in_progress' && state.currentExam.myStatus !== 'submitted'
    },
  },

  actions: {
    // 获取考试列表
    async fetchExamList(params = {}) {
      this.loading = true
      try {
        const data = await getExamList(params)
        this.examList = data.list || []
        return data
      } finally {
        this.loading = false
      }
    },

    // 获取考试详情
    async fetchExamDetail(examId) {
      this.loading = true
      try {
        const data = await getExamDetail(examId)
        this.currentExam = data
        return data
      } finally {
        this.loading = false
      }
    },

    // 设置当前试卷
    setCurrentPaper(paper) {
      this.currentPaper = paper
    },

    // 清空当前考试
    clearCurrentExam() {
      this.currentExam = null
      this.currentPaper = null
    },

    // 标记考试已通过人脸验证
    setFaceVerified(examId) {
      this.faceVerifiedExams.add(examId)
    },

    // 检查考试是否已通过人脸验证
    isFaceVerified(examId) {
      return this.faceVerifiedExams.has(examId)
    },
  },
})
