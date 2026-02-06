<template>
  <div class="profile-page">
    <!-- 顶部标题 -->
    <div class="header-section">
      <div class="page-title">我的</div>
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-avatar">
        <van-image
          round
          width="64"
          height="64"
          :src="userStore.userInfo?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
        />
      </div>
      <div class="user-info">
        <div class="user-name">{{ userStore.userInfo?.name || '未登录' }}</div>
        <div class="user-meta">
          <span class="user-id">学号: {{ userStore.userInfo?.studentId || '-' }}</span>
          <span class="user-class">{{ userStore.userInfo?.className || '' }}</span>
        </div>
      </div>
      <van-icon name="arrow" class="arrow-icon" />
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
      router.replace('/login')
    })
    .catch(() => {
      // 取消
    })
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #F5F6F7;
  padding-bottom: 60px;
}

/* 顶部区域 */
.header-section {
  background: #FFFFFF;
  padding: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1D2129;
}

.user-card {
  margin: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #00B96B 0%, #00D68F 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 185, 107, 0.2);
}

.user-avatar {
  margin-right: 14px;
  flex-shrink: 0;
}

.user-avatar :deep(.van-image) {
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.user-info {
  flex: 1;
  color: white;
  min-width: 0;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-id {
  font-size: 13px;
  opacity: 0.9;
}

.user-class {
  font-size: 12px;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow-icon {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
}

.menu-group {
  margin: 12px;
  border-radius: 12px;
  overflow: hidden;
}

.menu-group + .menu-group {
  margin-top: 12px;
}

.menu-group :deep(.van-cell) {
  padding: 14px 16px;
}

.menu-group :deep(.van-cell__left-icon) {
  color: #4E5969;
  font-size: 18px;
  margin-right: 10px;
}
</style>
