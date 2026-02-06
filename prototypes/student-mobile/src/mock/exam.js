/**
 * Mock 数据 - 考试列表
 */

// 动态生成未来时间
const now = new Date()
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000)
const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000)
const in10Minutes = new Date(now.getTime() + 10 * 60 * 1000) // 10分钟后（可提前进入测试）
// 跨天考试：今晚22:00开始，明天凌晨2:00结束
const tonight = new Date(now)
tonight.setHours(22, 0, 0, 0)
if (tonight.getTime() < now.getTime()) {
  tonight.setDate(tonight.getDate() + 1) // 如果已过22点，设为明天
}

const formatDate = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:00`
}

export const mockExamList = [
  {
    id: 'exam001',
    name: '2026年春季期中考试',
    startTime: formatDate(in3Days),
    endTime: formatDate(new Date(in3Days.getTime() + 2 * 60 * 60 * 1000)),
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
      allowEarlyEntry: false,
      earlyMinutes: 0,
      allowLateEntry: false,
      lateMinutes: 0,
      minAnswerTime: 30,
      maxAttempts: 3,
      currentAttempt: 0,
    },
    description: '本次考试为期中考试，请认真作答。',
  },
  {
    id: 'exam002',
    name: '数据结构与算法测试',
    startTime: formatDate(new Date(now.getTime() - 30 * 60 * 1000)),
    endTime: formatDate(new Date(now.getTime() + 60 * 60 * 1000)),
    duration: 90,
    status: 'in_progress',
    myStatus: 'not_started',
    score: null,
    totalScore: 100,
    paper: {
      id: 'paper002',
      name: '数据结构试卷A',
      questionCount: 12,
    },
    config: {
      enableFaceRecognition: true,
      allowSkipFaceVerify: true,
      enableRandomCapture: true,
      captureCount: 3,
      allowEarlyEntry: true,
      earlyMinutes: 15,
      allowLateEntry: true,
      lateMinutes: 15,
      minAnswerTime: 20,
      maxAttempts: 2,
      currentAttempt: 0,
    },
    description: '本次测试涵盖数据结构的核心知识点，包括线性表、树、图等内容。',
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
      allowEarlyEntry: false,
      earlyMinutes: 0,
      allowLateEntry: false,
      lateMinutes: 0,
      minAnswerTime: 30,
      maxAttempts: 2,
      currentAttempt: 1,
    },
    description: '本次考试涵盖操作系统的核心知识点，包括进程管理、内存管理、文件系统等内容。',
  },
  // 新增：10分钟后开始的考试（允许提前15分钟进入，现在就可以进入）
  {
    id: 'exam008',
    name: '程序设计基础测验',
    startTime: formatDate(in10Minutes),
    endTime: formatDate(new Date(in10Minutes.getTime() + 1 * 60 * 60 * 1000)),
    duration: 60,
    status: 'not_started',
    myStatus: 'not_started',
    score: null,
    totalScore: 100,
    paper: {
      id: 'paper008',
      name: 'C语言基础试卷',
      questionCount: 30,
    },
    config: {
      enableFaceRecognition: true,
      allowSkipFaceVerify: true,
      enableRandomCapture: true,
      captureCount: 2,
      allowEarlyEntry: true,
      earlyMinutes: 15,
      allowLateEntry: true,
      lateMinutes: 10,
      minAnswerTime: 15,
      maxAttempts: 1,
      currentAttempt: 0,
    },
    description: 'C语言程序设计基础测验，涵盖变量、循环、函数等基础知识。',
  },
  // 新增：30分钟后开始的考试（允许提前10分钟进入）
  {
    id: 'exam004',
    name: '英语四级模拟测试',
    startTime: formatDate(in30Minutes),
    endTime: formatDate(new Date(in30Minutes.getTime() + 2 * 60 * 60 * 1000)),
    duration: 120,
    status: 'not_started',
    myStatus: 'not_started',
    score: null,
    totalScore: 100,
    paper: {
      id: 'paper004',
      name: '英语四级模拟试卷',
      questionCount: 60,
    },
    config: {
      enableFaceRecognition: false,
      allowSkipFaceVerify: false,
      enableRandomCapture: false,
      captureCount: 0,
      allowEarlyEntry: true,
      earlyMinutes: 10,
      allowLateEntry: true,
      lateMinutes: 10,
      minAnswerTime: 60,
      maxAttempts: 1,
      currentAttempt: 0,
    },
    description: '英语四级模拟测试，包含听力、阅读、翻译和写作。',
  },
  // 新增：2小时后开始的考试（允许提前15分钟进入）
  {
    id: 'exam005',
    name: '高等数学期末考试',
    startTime: formatDate(in2Hours),
    endTime: formatDate(new Date(in2Hours.getTime() + 2.5 * 60 * 60 * 1000)),
    duration: 150,
    status: 'not_started',
    myStatus: 'not_started',
    score: null,
    totalScore: 150,
    paper: {
      id: 'paper005',
      name: '高等数学综合试卷',
      questionCount: 25,
    },
    config: {
      enableFaceRecognition: true,
      allowSkipFaceVerify: false,
      enableRandomCapture: true,
      captureCount: 5,
      allowEarlyEntry: true,
      earlyMinutes: 15,
      allowLateEntry: false,
      lateMinutes: 0,
      minAnswerTime: 60,
      maxAttempts: 1,
      currentAttempt: 0,
    },
    description: '高等数学期末考试，涵盖微积分、线性代数等内容。',
  },
  // 新增：明天的考试
  {
    id: 'exam006',
    name: '计算机网络测验',
    startTime: formatDate(tomorrow),
    endTime: formatDate(new Date(tomorrow.getTime() + 1.5 * 60 * 60 * 1000)),
    duration: 90,
    status: 'not_started',
    myStatus: 'not_started',
    score: null,
    totalScore: 100,
    paper: {
      id: 'paper006',
      name: '计算机网络试卷',
      questionCount: 40,
    },
    config: {
      enableFaceRecognition: true,
      allowSkipFaceVerify: true,
      enableRandomCapture: false,
      captureCount: 0,
      allowEarlyEntry: true,
      earlyMinutes: 30,
      allowLateEntry: true,
      lateMinutes: 15,
      minAnswerTime: 30,
      maxAttempts: 2,
      currentAttempt: 0,
    },
    description: '',
  },
  // 新增：7天后的考试
  {
    id: 'exam007',
    name: '软件工程期末考试',
    startTime: formatDate(in7Days),
    endTime: formatDate(new Date(in7Days.getTime() + 2 * 60 * 60 * 1000)),
    duration: 120,
    status: 'not_started',
    myStatus: 'not_started',
    score: null,
    totalScore: 100,
    paper: {
      id: 'paper007',
      name: '软件工程综合试卷',
      questionCount: 35,
    },
    config: {
      enableFaceRecognition: true,
      allowSkipFaceVerify: false,
      enableRandomCapture: true,
      captureCount: 3,
      allowEarlyEntry: false,
      earlyMinutes: 0,
      allowLateEntry: false,
      lateMinutes: 0,
      minAnswerTime: 45,
      maxAttempts: 1,
      currentAttempt: 0,
    },
    description: '软件工程期末考试，包含软件开发流程、设计模式等内容。',
  },
  // 新增：跨天考试（今晚22:00开始，明天凌晨2:00结束）
  {
    id: 'exam009',
    name: '通宵编程马拉松',
    startTime: formatDate(tonight),
    endTime: formatDate(new Date(tonight.getTime() + 4 * 60 * 60 * 1000)), // 4小时后（跨天）
    duration: 240,
    status: 'not_started',
    myStatus: 'not_started',
    score: null,
    totalScore: 200,
    paper: {
      id: 'paper009',
      name: '编程实战综合试卷',
      questionCount: 20,
    },
    config: {
      enableFaceRecognition: false,
      allowSkipFaceVerify: false,
      enableRandomCapture: false,
      captureCount: 0,
      allowEarlyEntry: true,
      earlyMinutes: 30,
      allowLateEntry: true,
      lateMinutes: 60,
      minAnswerTime: 120,
      maxAttempts: 1,
      currentAttempt: 0,
    },
    description: '编程马拉松挑战赛，考验你的编程能力和耐力！',
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
    questionCount: 12,
    questions: [], // 实际答题时才加载
  },
  config: {
    enableFaceRecognition: true,
    allowSkipFaceVerify: true,
    enableRandomCapture: true,
    captureCount: 3,
    allowEarlyEntry: true,
    earlyMinutes: 15,
    allowLateEntry: true,
    lateMinutes: 15,
    minAnswerTime: 20,
    scorePublishMode: 'after_exam',
    scorePublishContent: 'full',
    maxAttempts: 2, // 允许作答次数
    currentAttempt: 0, // 当前作答次数
  },
  description: '本次测试涵盖数据结构的核心知识点，包括线性表、树、图等内容。',
}

/**
 * Mock 数据 - 试卷题目（包含所有7种题型）
 * 题型名称来自管理端配置，可以自定义修改
 */
export const mockPaperQuestions = [
  // 1. 单选题
  {
    id: 'q001',
    type: 'single',
    typeName: '单选题', // 可在管理端自定义修改
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

  // 2. 多选题
  {
    id: 'q003',
    type: 'multiple',
    typeName: '多选题', // 可在管理端自定义修改
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

  // 3. 判断题
  {
    id: 'q005',
    type: 'judge',
    typeName: '判断题', // 可在管理端自定义修改
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

  // 4. 填空题
  {
    id: 'q007',
    type: 'blank',
    typeName: '填空题', // 可在管理端自定义修改
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

  // 5. 简答题
  {
    id: 'q009',
    type: 'essay',
    typeName: '简答题', // 可在管理端自定义修改
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

  // 6. 完形填空
  {
    id: 'q011',
    type: 'cloze',
    typeName: '完形填空', // 可在管理端自定义修改
    content: '在计算机科学中，___1___是一种重要的数据结构，它遵循___2___原则。这种结构常用于___3___的实现。',
    blanks: [
      {
        id: 'c1',
        order: 1,
        options: [
          { label: 'A', text: '栈' },
          { label: 'B', text: '队列' },
          { label: 'C', text: '树' },
          { label: 'D', text: '图' },
        ],
      },
      {
        id: 'c2',
        order: 2,
        options: [
          { label: 'A', text: 'FIFO（先进先出）' },
          { label: 'B', text: 'LIFO（后进先出）' },
          { label: 'C', text: 'FILO（先进后出）' },
          { label: 'D', text: 'Random（随机访问）' },
        ],
      },
      {
        id: 'c3',
        order: 3,
        options: [
          { label: 'A', text: '函数调用' },
          { label: 'B', text: '打印队列' },
          { label: 'C', text: '图遍历' },
          { label: 'D', text: '排序算法' },
        ],
      },
    ],
    score: 6,
    order: 11,
  },

  // 7. 复合题（内容丰富版）
  {
    id: 'q012',
    type: 'composite',
    typeName: '复合题', // 可在管理端自定义修改
    material: `【材料一】阅读以下关于数据库事务的技术文档：

数据库事务（Transaction）是数据库管理系统执行过程中的一个逻辑单位，由一个有限的数据库操作序列构成。事务具有四个基本特性，通常称为ACID特性：

1. 原子性（Atomicity）：事务是一个不可分割的工作单位，事务中的操作要么都发生，要么都不发生。例如，在银行转账操作中，从账户A转出100元到账户B，这个操作必须保证A账户扣款和B账户入款同时成功或同时失败。

2. 一致性（Consistency）：事务必须使数据库从一个一致性状态变换到另一个一致性状态。继续以转账为例，转账前后两个账户的总金额必须保持不变。

3. 隔离性（Isolation）：多个用户并发访问数据库时，数据库为每一个用户开启的事务，不能被其他事务的操作数据所干扰，多个并发事务之间要相互隔离。

4. 持久性（Durability）：一个事务一旦被提交，它对数据库中数据的改变就是永久性的，接下来即使数据库发生故障也不应该对其有任何影响。

【材料二】以下是一段模拟银行转账的代码：

\`\`\`python
class BankAccount:
    def __init__(self, account_id, balance):
        self.account_id = account_id
        self.balance = balance
        self.lock = threading.Lock()

    def withdraw(self, amount):
        if self.balance >= amount:
            time.sleep(0.01)  # 模拟网络延迟
            self.balance -= amount
            return True
        return False

    def deposit(self, amount):
        time.sleep(0.01)  # 模拟网络延迟
        self.balance += amount
        return True

def transfer(from_account, to_account, amount):
    if from_account.withdraw(amount):
        to_account.deposit(amount)
        print(f"转账成功: {amount}元")
        return True
    else:
        print("余额不足，转账失败")
        return False
\`\`\`

【材料三】某电商平台在双十一期间遇到了以下问题：
- 同一商品被多个用户同时下单，导致超卖
- 用户支付成功但订单状态未更新
- 库存扣减与订单创建不一致

请根据以上材料回答下列问题：`,
    subQuestions: [
      {
        id: 'sq1',
        type: 'single',
        content: '根据材料一，以下哪个选项最准确地描述了事务的原子性？',
        options: [
          { label: 'A', text: '事务执行的结果必须是使数据库从一个一致性状态变到另一个一致性状态' },
          { label: 'B', text: '事务是一个不可分割的工作单位，其中的操作要么全部执行，要么全部不执行' },
          { label: 'C', text: '一个事务的执行不能被其他事务干扰' },
          { label: 'D', text: '事务一旦提交，其对数据库的修改就是永久性的' },
        ],
        score: 3,
      },
      {
        id: 'sq2',
        type: 'multiple',
        content: '分析材料二中的代码，以下哪些问题可能在并发环境下发生？（多选）',
        options: [
          { label: 'A', text: '竞态条件（Race Condition）：多个线程同时检查余额可能导致超额提款' },
          { label: 'B', text: '死锁（Deadlock）：两个账户互相转账时可能发生死锁' },
          { label: 'C', text: '数据不一致：withdraw成功但deposit失败时，资金会丢失' },
          { label: 'D', text: '内存泄漏：频繁创建BankAccount对象会导致内存溢出' },
          { label: 'E', text: '原子性问题：transfer函数中的两个操作不是原子的' },
        ],
        score: 5,
      },
      {
        id: 'sq3',
        type: 'single',
        content: '针对材料三中电商平台的超卖问题，以下哪种解决方案最为合适？',
        options: [
          { label: 'A', text: '使用乐观锁，在更新库存时检查版本号' },
          { label: 'B', text: '增加服务器数量，提高并发处理能力' },
          { label: 'C', text: '将库存数据缓存到前端，减少数据库访问' },
          { label: 'D', text: '取消库存检查，允许负库存' },
        ],
        score: 3,
      },
      {
        id: 'sq4',
        type: 'essay',
        content: '请结合ACID特性，分析材料二中transfer函数存在的问题，并给出改进方案。要求：\n1. 指出至少两个违反ACID特性的问题\n2. 给出具体的代码改进思路\n3. 说明改进后如何保证事务的完整性',
        score: 12,
      },
      {
        id: 'sq5',
        type: 'essay',
        content: '针对材料三中电商平台遇到的三个问题，请分别设计解决方案，并说明每个方案如何利用事务特性来保证数据一致性。',
        score: 12,
      },
    ],
    score: 35,
    order: 12,
  },
]
