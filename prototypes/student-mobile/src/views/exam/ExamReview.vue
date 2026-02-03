<template>
  <div class="page">
    <van-nav-bar :title="title" left-arrow @click-left="$router.back()" fixed placeholder />
    <div class="content">
      <van-empty description="页面开发中..." />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta.title || '页面')
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}
.content {
  padding: 20px;
}
</style>
