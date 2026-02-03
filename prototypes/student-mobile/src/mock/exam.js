/**
 * Mock 数据 - 考试列表
 */

export const mockExamList = [
  {
    id: 'exam001',
    name: '2026年春季期中考试',
    startTime: '2026-02-05 09:00:00',
    endTime: '2026-02-05 11:00:00',
    duration: 120,
    status: 'not_started',
    myStatus: 'not_started',
    score: null,
    totalScore: 100,
    paper: {
      id: 'paper001',
      name: '计算机基础综合试卷',
      questionCount: 50,
    },
    config: {
      enableFaceRecognition: true,
      allowSkipFaceVerify: false,
      enableRandomCapture: true,
      captureCount: 3,
      allowLateEntry: false,
      lateMinutes: 0,
      minAnswerTime: 30,
    },
  },
  {
    id: 'exam002',
    name: '数据结构与算法测试',
    startTime: '2026-02-03 14:00:00',
    endTime: '2026-02-03 16:00:00',
    duration: 90,
    status: 'in_progress',
    myStatus: 'not_started',
    score: null,
    totalScore: 100,
    paper: {
      id: 'paper002',
      name: '数据结构试卷A',
      questionCount: 40,
    },
    config: {
      enableFaceRecognition: true,
      allowSkipFaceVerify: true,
      enableRandomCapture: false,
      allowLateEntry: true,
      lateMinutes: 15,
      minAnswerTime: 20,
    },
  },
  {
    id: 'exam003',
    name: '操作系统原理考试',
    startTime: '2026-01-28 10:00:00',
    endTime: '2026-01-28 12:00:00',
    duration: 120,
    status: 'ended',
    myStatus: 'submitted',
    score: 85,
    totalScore: 100,
    paper: {
      id: 'paper003',
      name: '操作系统综合试卷',
      questionCount: 45,
    },
    config: {
      enableFaceRecognition: true,
      allowSkipFaceVerify: false,
      enableRandomCapture: true,
      captureCount: 5,
      allowLateEntry: false,
      minAnswerTime: 30,
    },
  },
]

/**
 * Mock 数据 - 考试详情
 */
export const mockExamDetail = {
  id: 'exam002',
  name: '数据结构与算法测试',
  startTime: '2026-02-03 14:00:00',
  endTime: '2026-02-03 16:00:00',
  duration: 90,
  status: 'in_progress',
  myStatus: 'not_started',
  score: null,
  totalScore: 100,
  paper: {
    id: 'paper002',
    name: '数据结构试卷A',
    questionCount: 40,
    questions: [], // 实际答题时才加载
  },
  config: {
    enableFaceRecognition: true,
    allowSkipFaceVerify: true,
    enableRandomCapture: false,
    allowLateEntry: true,
    lateMinutes: 15,
    minAnswerTime: 20,
    scorePublishMode: 'after_exam',
    scorePublishContent: 'full',
  },
  description: '本次考试主要考察数据结构与算法的基础知识，包括线性表、树、图等内容。',
}

/**
 * Mock 数据 - 试卷题目
 */
export const mockPaperQuestions = [
  {
    id: 'q001',
    type: 'single',
    typeName: '单选题',
    content: '以下哪种数据结构是先进先出（FIFO）的？',
    options: [
      { label: 'A', text: '栈' },
      { label: 'B', text: '队列' },
      { label: 'C', text: '链表' },
      { label: 'D', text: '树' },
    ],
    score: 2,
    order: 1,
  },
  {
    id: 'q002',
    type: 'multiple',
    typeName: '多选题',
    content: '以下哪些是线性数据结构？',
    options: [
      { label: 'A', text: '数组' },
      { label: 'B', text: '链表' },
      { label: 'C', text: '树' },
      { label: 'D', text: '栈' },
      { label: 'E', text: '图' },
    ],
    score: 3,
    order: 2,
  },
  {
    id: 'q003',
    type: 'judge',
    typeName: '判断题',
    content: '二叉树的前序遍历和中序遍历可以唯一确定一棵二叉树。',
    score: 2,
    order: 3,
  },
  {
    id: 'q004',
    type: 'blank',
    typeName: '填空题',
    content: '在一个有n个顶点的无向完全图中，边的数量为___。',
    blanks: [
      { id: 'b1', order: 1 },
    ],
    score: 3,
    order: 4,
  },
  {
    id: 'q005',
    type: 'essay',
    typeName: '简答题',
    content: '请简述快速排序算法的基本思想和时间复杂度。',
    score: 10,
    order: 5,
  },
]
