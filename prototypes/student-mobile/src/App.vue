<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" v-if="$route.meta.keepAlive" />
    </keep-alive>
    <component :is="Component" v-if="!$route.meta.keepAlive" />
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

onMounted(() => {
  // 从本地恢复用户信息
  userStore.loadFromLocal()
})
</script>

<style>
/* App 全局样式已在 styles/index.css 中定义 */
</style>
