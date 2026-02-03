<template>
  <div class="practice-list-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="刷题练习" fixed placeholder />

    <!-- 内容区域 -->
    <div class="content">
      <van-empty description="刷题功能开发中..." image="search">
        <template #description>
          <div class="empty-desc">
            <p>刷题模块即将上线</p>
            <p class="text-secondary">敬请期待</p>
          </div>
        </template>
      </van-empty>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.practice-list-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 50px;
}

.content {
  padding: 60px 20px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 100px);
}

.empty-desc {
  margin-top: 16px;
}

.empty-desc p {
  margin: 8px 0;
  font-size: 14px;
  color: #4e5969;
}

.text-secondary {
  color: #86909c;
  font-size: 12px;
}
</style>
