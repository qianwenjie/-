import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/exam/list',
  },
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
  next()
})

export default router
