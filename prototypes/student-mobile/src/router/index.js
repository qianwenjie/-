import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/exam/list',
  },
  // 登录页面
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录', public: true },
  },
  // 考试模块
  {
    path: '/exam',
    children: [
      {
        path: 'list',
        name: 'ExamList',
        component: () => import('@/views/exam/ExamList.vue'),
        meta: { title: '考试列表' },
      },
      {
        path: 'detail/:id',
        name: 'ExamDetail',
        component: () => import('@/views/exam/ExamDetail.vue'),
        meta: { title: '考试详情' },
      },
      {
        path: 'face-verify/:id',
        name: 'FaceVerify',
        component: () => import('@/views/exam/FaceVerify.vue'),
        meta: { title: '人脸识别' },
      },
      {
        path: 'answer/:id',
        name: 'ExamAnswer',
        component: () => import('@/views/exam/ExamAnswer.vue'),
        meta: { title: '在线答题', keepAlive: true },
      },
      {
        path: 'answer-doc/:id',
        name: 'ExamAnswerDoc',
        component: () => import('@/views/exam/ExamAnswerDoc.vue'),
        meta: { title: '文档答题', keepAlive: true },
      },
      {
        path: 'submit/:id',
        redirect: to => `/exam/success/${to.params.id}`,
      },
      {
        path: 'success/:id',
        name: 'ExamSuccess',
        component: () => import('@/views/exam/ExamSuccess.vue'),
        meta: { title: '提交成功' },
      },
      {
        path: 'result/:id',
        redirect: to => `/exam/success/${to.params.id}`,
      },
      {
        path: 'score/:id',
        redirect: to => `/exam/success/${to.params.id}`,
      },
      {
        path: 'review/:id',
        name: 'ExamReview',
        component: () => import('@/views/exam/ExamReview.vue'),
        meta: { title: '答案详情' },
      },
      {
        path: 'review-doc/:id',
        name: 'ExamReviewDoc',
        component: () => import('@/views/exam/ExamReviewDoc.vue'),
        meta: { title: '答案详情' },
      },
      {
        path: 'score-stats',
        name: 'ExamScoreStats',
        component: () => import('@/views/exam/ExamScoreStats.vue'),
        meta: { title: '成绩统计' },
      },
    ],
  },
  // 刷题模块
  {
    path: '/practice',
    children: [
      {
        path: 'list',
        name: 'PracticeList',
        component: () => import('@/views/practice/PracticeList.vue'),
        meta: { title: '刷题练习' },
      },
      {
        path: 'detail/:id',
        name: 'PracticeDetail',
        component: () => import('@/views/practice/PracticeDetail.vue'),
        meta: { title: '任务详情' },
      },
      {
        path: 'answer/:id',
        name: 'PracticeAnswer',
        component: () => import('@/views/practice/PracticeAnswer.vue'),
        meta: { title: '刷题答题' },
      },
      {
        path: 'result/:id',
        name: 'PracticeResult',
        component: () => import('@/views/practice/PracticeResult.vue'),
        meta: { title: '刷题结果' },
      },
      {
        path: 'wrong-book',
        name: 'WrongBook',
        component: () => import('@/views/practice/WrongBook.vue'),
        meta: { title: '错题本' },
      },
      // 错题回顾（按任务）
      {
        path: 'wrong-book/review/:id',
        name: 'WrongBookReview',
        component: () => import('@/views/practice/WrongBookReview.vue'),
        meta: { title: '错题回顾' },
      },
      // 错题回顾（按题型）
      {
        path: 'wrong-book/review-type/:id',
        name: 'WrongBookReviewType',
        component: () => import('@/views/practice/WrongBookReview.vue'),
        meta: { title: '错题回顾' },
      },
      // 错题复习（按任务）
      {
        path: 'wrong-book/practice/:id',
        name: 'WrongBookPractice',
        component: () => import('@/views/practice/WrongBookPractice.vue'),
        meta: { title: '错题复习' },
      },
      // 错题复习（按题型）
      {
        path: 'wrong-book/practice-type/:id',
        name: 'WrongBookPracticeType',
        component: () => import('@/views/practice/WrongBookPractice.vue'),
        meta: { title: '错题复习' },
      },
      // 易掌握题集（按任务）
      {
        path: 'wrong-book/mastered/:id',
        name: 'WrongBookMastered',
        component: () => import('@/views/practice/WrongBookMastered.vue'),
        meta: { title: '易掌握题集' },
      },
      // 易掌握题集（按题型）
      {
        path: 'wrong-book/mastered-type/:id',
        name: 'WrongBookMasteredType',
        component: () => import('@/views/practice/WrongBookMastered.vue'),
        meta: { title: '易掌握题集' },
      },
      // 单题重做
      {
        path: 'wrong-book/redo/:qId',
        name: 'WrongBookRedo',
        component: () => import('@/views/practice/WrongBookRedo.vue'),
        meta: { title: '重做题目' },
      },
      // 旧路由兼容（保留）
      {
        path: 'wrong-book/:taskId',
        redirect: to => `/practice/wrong-book/review/${to.params.taskId}`,
      },
      {
        path: 'favorites',
        name: 'FavoriteList',
        component: () => import('@/views/practice/FavoriteList.vue'),
        meta: { title: '收藏夹' },
      },
      {
        path: 'stats',
        name: 'PracticeStats',
        component: () => import('@/views/practice/PracticeStats.vue'),
        meta: { title: '刷题统计' },
      },
    ],
  },
  // 个人中心
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/Profile.vue'),
    meta: { title: '我的' },
  },
  // 消息中心
  {
    path: '/message',
    name: 'Message',
    component: () => import('@/views/message/Message.vue'),
    meta: { title: '消息' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 检查登录状态
  const token = localStorage.getItem('token')
  const isPublicRoute = to.meta.public === true

  if (!token && !isPublicRoute) {
    // 未登录且不是公开页面，跳转到登录页
    next('/login')
  } else if (token && to.path === '/login') {
    // 已登录但访问登录页，跳转到首页
    next('/exam/list')
  } else {
    next()
  }
})

export default router
