<template>
  <div class="profile-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="我的" fixed placeholder />

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-avatar">
        <van-image
          round
          width="60"
          height="60"
          src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
        />
      </div>
      <div class="user-info">
        <div class="user-name">学生姓名</div>
        <div class="user-id">学号: 2024001</div>
      </div>
    </div>

    <!-- 功能列表 -->
    <van-cell-group :border="false" class="menu-group">
      <van-cell title="我的考试" icon="notes-o" is-link to="/exam/list" />
      <van-cell title="刷题记录" icon="edit" is-link to="/practice/list" />
      <van-cell title="错题本" icon="warning-o" is-link />
      <van-cell title="成绩统计" icon="chart-trending-o" is-link />
    </van-cell-group>

    <van-cell-group :border="false" class="menu-group">
      <van-cell title="个人信息" icon="manager-o" is-link />
      <van-cell title="设置" icon="setting-o" is-link />
    </van-cell-group>

    <van-cell-group :border="false" class="menu-group">
      <van-cell title="关于" icon="info-o" is-link />
      <van-cell title="退出登录" icon="logout" is-link @click="handleLogout" />
    </van-cell-group>
  </div>
</template>

<script setup>
import { showConfirmDialog, showToast } from 'vant'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出登录吗？',
  })
    .then(() => {
      userStore.logout()
      showToast('已退出登录')
      // 实际项目中可能需要跳转到登录页
    })
    .catch(() => {
      // 取消
    })
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 50px;
}

.user-card {
  margin: 12px;
  padding: 24px;
  background: linear-gradient(135deg, #00B96B 0%, #00D68F 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 185, 107, 0.2);
}

.user-avatar {
  margin-right: 16px;
}

.user-info {
  flex: 1;
  color: white;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.user-id {
  font-size: 14px;
  opacity: 0.9;
}

.menu-group {
  margin: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.menu-group + .menu-group {
  margin-top: 12px;
}
</style>
