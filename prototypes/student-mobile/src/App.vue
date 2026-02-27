<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" v-if="$route.meta.keepAlive" />
      </keep-alive>
      <component :is="Component" v-if="!$route.meta.keepAlive" />
    </router-view>

    <!-- 底部标签栏 -->
    <van-tabbar v-model="active" :fixed="true" :placeholder="true" v-if="showTabbar">
      <van-tabbar-item to="/exam/list" icon="notes-o">
        考试
      </van-tabbar-item>
      <van-tabbar-item to="/practice/list" icon="edit">
        刷题
      </van-tabbar-item>
      <van-tabbar-item to="/message" icon="chat-o" :badge="unreadCount > 0 ? unreadCount : ''">
        消息
      </van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore, usePracticeStore, useMessageStore } from '@/stores'

const route = useRoute()
const userStore = useUserStore()
const practiceStore = usePracticeStore()
const messageStore = useMessageStore()

const active = ref(0)

const unreadCount = computed(() => messageStore.unreadCount)

// 需要隐藏 TabBar 的页面
const hideTabbarPages = [
  '/login',
  '/exam/detail',
  '/exam/face-verify',
  '/exam/answer',
  '/exam/submit',
  '/exam/success',
  '/exam/result',
  '/exam/score',
  '/exam/review',
  '/practice/answer',
  '/practice/detail',
  '/practice/result',
  '/practice/wrong-book',
  '/practice/favorites',
  '/practice/stats',
  '/exam/score-stats',
]

// 是否显示 TabBar
const showTabbar = computed(() => {
  const path = route.path
  return !hideTabbarPages.some(page => path.startsWith(page))
})

onMounted(async () => {
  // 从本地恢复用户信息
  userStore.loadFromLocal()
  // 初始化错题本 mock 数据（首次访问时注入）
  practiceStore.loadWrongBook()
  // 加载刷题任务列表，同步即将截止通知
  const data = await practiceStore.fetchTaskList()
  messageStore.syncPracticeSoon(data.list || [])
})

// 监听路由变化，更新 active
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/exam')) {
    active.value = 0
  } else if (newPath.startsWith('/practice')) {
    active.value = 1
  } else if (newPath.startsWith('/message')) {
    active.value = 2
  } else if (newPath.startsWith('/profile')) {
    active.value = 3
  }
}, { immediate: true })
</script>

<style>
/* App 全局样式已在 styles/index.css 中定义 */
#app {
  height: 100%;
}

/* 底部导航栏样式 */
.van-tabbar {
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}

.van-tabbar-item--active {
  color: #00B96B;
}
</style>
