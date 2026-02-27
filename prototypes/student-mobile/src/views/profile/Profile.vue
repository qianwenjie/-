<template>
  <div class="profile-page">
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
        <div class="user-meta-row">
          <span class="meta-item">
            <van-icon name="contact-o" />
            {{ userStore.userInfo?.username || '—' }}
          </span>
          <span class="meta-item">
            <van-icon name="phone-o" />
            {{ userStore.userInfo?.phone || '未绑定' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 功能列表 -->
    <van-cell-group :border="false" class="menu-group">
      <van-cell title="错题本" icon="warning-o" is-link to="/practice/wrong-book" />
      <van-cell title="错题收藏" icon="star-o" is-link to="/practice/favorites" />
      <van-cell title="刷题统计" icon="chart-trending-o" is-link to="/practice/stats" />
      <van-cell title="成绩统计" icon="bar-chart-o" is-link to="/exam/score-stats" />
    </van-cell-group>

    <van-cell-group :border="false" class="menu-group">
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
  margin-bottom: 8px;
}

.user-meta-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  opacity: 0.9;
}

.meta-item .van-icon {
  font-size: 13px;
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
