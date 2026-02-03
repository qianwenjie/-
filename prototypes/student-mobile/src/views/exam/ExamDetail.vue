<template>
  <div class="exam-detail-page">
    <van-nav-bar title="考试详情" left-arrow @click-left="$router.back()" fixed placeholder />
    <div class="content">
      <van-empty description="页面开发中..." />
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.exam-detail-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}
.content {
  padding: 20px;
}
</style>
