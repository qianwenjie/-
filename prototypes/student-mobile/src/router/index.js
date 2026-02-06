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
        path: 'submit/:id',
        name: 'ExamSubmit',
        component: () => import('@/views/exam/ExamSubmit.vue'),
        meta: { title: '提交确认' },
      },
      {
        path: 'success/:id',
        name: 'ExamSuccess',
        component: () => import('@/views/exam/ExamSuccess.vue'),
        meta: { title: '提交成功' },
      },
      {
        path: 'result/:id',
        name: 'ExamResult',
        component: () => import('@/views/exam/ExamResult.vue'),
        meta: { title: '考试结果' },
      },
      {
        path: 'score/:id',
        name: 'ExamScore',
        component: () => import('@/views/exam/ExamScore.vue'),
        meta: { title: '成绩详情' },
      },
      {
        path: 'review/:id',
        name: 'ExamReview',
        component: () => import('@/views/exam/ExamReview.vue'),
        meta: { title: '查看批阅' },
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
