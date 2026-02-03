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
      <van-tabbar-item to="/profile" icon="user-o">
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores'

const route = useRoute()
const userStore = useUserStore()

const active = ref(0)

// 需要隐藏 TabBar 的页面
const hideTabbarPages = [
  '/exam/detail',
  '/exam/face-verify',
  '/exam/answer',
  '/exam/submit',
  '/exam/success',
  '/exam/result',
  '/exam/score',
  '/exam/review',
  '/practice/answer',
  '/practice/result',
]

// 是否显示 TabBar
const showTabbar = computed(() => {
  const path = route.path
  return !hideTabbarPages.some(page => path.startsWith(page))
})

onMounted(() => {
  // 从本地恢复用户信息
  userStore.loadFromLocal()
})

// 监听路由变化，更新 active
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/exam')) {
    active.value = 0
  } else if (newPath.startsWith('/practice')) {
    active.value = 1
  } else if (newPath.startsWith('/profile')) {
    active.value = 2
  }
}, { immediate: true })
</script>

<style>
/* App 全局样式已在 styles/index.css 中定义 */
#app {
  height: 100%;
}
</style>
