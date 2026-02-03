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
      maxAttempts: 3, // 允许作答次数
      currentAttempt: 0, // 当前作答次数
    },
    description: '本次考试为期中考试，请认真作答。',
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
      maxAttempts: 2, // 允许作答次数
      currentAttempt: 0, // 当前作答次数
    },
    description: '', // 无说明
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
      maxAttempts: 2, // 允许作答次数
      currentAttempt: 1, // 当前作答次数
    },
    description: '本次考试涵盖操作系统的核心知识点，包括进程管理、内存管理、文件系统等内容。',
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
    maxAttempts: 2, // 允许作答次数
    currentAttempt: 0, // 当前作答次数
  },
  description: '', // 无说明
}

/**
 * Mock 数据 - 试卷题目
 */
export const mockPaperQuestions = [
  // 单选题
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
    type: 'single',
    typeName: '单选题',
    content: '二叉树的前序遍历顺序是？',
    options: [
      { label: 'A', text: '根-左-右' },
      { label: 'B', text: '左-根-右' },
      { label: 'C', text: '左-右-根' },
      { label: 'D', text: '右-根-左' },
    ],
    score: 2,
    order: 2,
  },
  // 多选题
  {
    id: 'q003',
    type: 'multiple',
    typeName: '多选题',
    content: '以下哪些是线性数据结构？（多选）',
    options: [
      { label: 'A', text: '数组' },
      { label: 'B', text: '链表' },
      { label: 'C', text: '树' },
      { label: 'D', text: '栈' },
      { label: 'E', text: '图' },
    ],
    score: 3,
    order: 3,
  },
  {
    id: 'q004',
    type: 'multiple',
    typeName: '多选题',
    content: '关于哈希表，以下说法正确的是？（多选）',
    options: [
      { label: 'A', text: '查找时间复杂度为O(1)' },
      { label: 'B', text: '可能发生哈希冲突' },
      { label: 'C', text: '需要额外的存储空间' },
      { label: 'D', text: '不支持范围查询' },
    ],
    score: 3,
    order: 4,
  },
  // 判断题
  {
    id: 'q005',
    type: 'judge',
    typeName: '判断题',
    content: '二叉树的前序遍历和中序遍历可以唯一确定一棵二叉树。',
    score: 2,
    order: 5,
  },
  {
    id: 'q006',
    type: 'judge',
    typeName: '判断题',
    content: '栈是一种后进先出（LIFO）的数据结构。',
    score: 2,
    order: 6,
  },
  // 填空题
  {
    id: 'q007',
    type: 'blank',
    typeName: '填空题',
    content: '在一个有n个顶点的无向完全图中，边的数量为___。',
    blanks: [
      { id: 'b1', order: 1 },
    ],
    score: 3,
    order: 7,
  },
  {
    id: 'q008',
    type: 'blank',
    typeName: '填空题',
    content: '快速排序的平均时间复杂度是___，最坏情况时间复杂度是___。',
    blanks: [
      { id: 'b1', order: 1 },
      { id: 'b2', order: 2 },
    ],
    score: 4,
    order: 8,
  },
  // 简答题
  {
    id: 'q009',
    type: 'essay',
    typeName: '简答题',
    content: '请简述快速排序算法的基本思想和时间复杂度。',
    score: 10,
    order: 9,
  },
  {
    id: 'q010',
    type: 'essay',
    typeName: '简答题',
    content: '请解释什么是二叉搜索树（BST），并说明其主要特点。',
    score: 10,
    order: 10,
  },
]
