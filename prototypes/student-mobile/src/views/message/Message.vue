<template>
  <div class="message-page">
    <!-- 顶部标题 -->
    <div class="header-section">
      <div class="page-title">消息中心</div>
      <div class="header-actions">
        <span class="action-text" @click="markAllRead" v-if="unreadCount > 0">
          全部已读
        </span>
      </div>
    </div>

    <!-- 消息分类标签 -->
    <div class="tabs-section">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</span>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="list-section">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div
          v-for="message in filteredMessages"
          :key="message.id"
          class="message-card"
          :class="{ unread: !message.isRead }"
          @click="handleMessageClick(message)"
        >
          <!-- 消息图标 -->
          <div class="message-icon" :class="message.subType">
            <van-icon :name="getMessageIcon(message.subType)" />
          </div>

          <!-- 消息内容 -->
          <div class="message-content">
            <div class="message-header">
              <span class="message-title">{{ message.title }}</span>
              <span class="message-time">{{ formatTime(message.time) }}</span>
            </div>
            <div class="message-body">{{ message.content }}</div>
</div>

          <!-- 未读标记 -->
          <div v-if="!message.isRead" class="unread-dot"></div>
        </div>

        <!-- 空状态 -->
        <van-empty
          v-if="filteredMessages.length === 0"
          image="default"
          :description="emptyText"
        />
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useMessageStore } from '@/stores'

const router = useRouter()
const messageStore = useMessageStore()
const activeTab = ref('all')
const refreshing = ref(false)

const messages = computed(() => messageStore.messages)
const unreadCount = computed(() => messageStore.unreadCount)

// tab 配置
const tabs = computed(() => [
  { label: '全部',     value: 'all',      count: unreadCount.value },
  { label: '考试通知', value: 'exam',     count: getTypeUnreadCount('exam') },
  { label: '成绩通知', value: 'score',    count: getTypeUnreadCount('score') },
  { label: '刷题通知', value: 'practice', count: getTypeUnreadCount('practice') },
])

const getTypeUnreadCount = (type) =>
  messages.value.filter(m => m.type === type && !m.isRead).length

const filteredMessages = computed(() => {
  if (activeTab.value === 'all') return messages.value
  return messages.value.filter(m => m.type === activeTab.value)
})

const emptyText = computed(() => {
  const label = tabs.value.find(t => t.value === activeTab.value)?.label || ''
  return `暂无${label === '全部' ? '' : label}`
})

// subType -> 图标
const getMessageIcon = (subType) => {
  const map = {
    exam_new:         'notes-o',
    exam_soon:        'clock-o',
    score_published:  'chart-trending-o',
    practice_new:     'edit',
    practice_soon:    'warning-o',
  }
  return map[subType] || 'bell-o'
}

// 格式化时间
const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) {
    return `今天 ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

// 点击消息：标记已读 + 跳转
const handleMessageClick = (message) => {
  messageStore.markRead(message.id)
  const { type, taskId } = message
  if (type === 'exam') {
    router.push(`/exam/detail/${taskId}`)
  } else if (type === 'score') {
    router.push(`/exam/result/${taskId}`)
  } else if (type === 'practice') {
    router.push(`/practice/detail/${taskId}`)
  }
}

// 全部已读
const markAllRead = () => {
  messageStore.markAllRead()
  showToast('已全部标记为已读')
}

// 下拉刷新
const onRefresh = () => {
  setTimeout(() => {
    refreshing.value = false
    showToast('刷新成功')
  }, 1000)
}
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  background-color: #F5F6F7;
  padding-bottom: 60px;
}

/* 顶部区域 */
.header-section {
  background: #FFFFFF;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1D2129;
}

.action-text {
  font-size: 14px;
  color: #00B96B;
  cursor: pointer;
}

/* 标签区域 */
.tabs-section {
  display: flex;
  background: #FFFFFF;
  padding: 12px 16px;
  gap: 8px;
  border-top: 1px solid #F0F1F2;
}

.tab-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  padding: 6px 4px;
  font-size: 13px;
  color: #4E5969;
  background: #F5F6F7;
  border-radius: 20px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-item.active {
  background: #00B96B;
  color: white;
  font-weight: 500;
}

.tab-badge {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  background: #FF4D4F;
  color: white;
  border-radius: 8px;
}

.tab-item.active .tab-badge {
  background: rgba(255, 255, 255, 0.9);
  color: #FF4D4F;
}

/* 列表区域 */
.list-section {
  padding: 12px 16px;
}

/* 消息卡片 */
.message-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
  position: relative;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: background 0.15s ease;
}

.message-card.unread {
  background: #FAFFFE;
}

.message-card:active {
  background: #F5F6F7;
}

/* 消息图标 */
.message-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 22px;
}

.message-icon.exam_new {
  background: #E6F7FF;
  color: #1890FF;
}

.message-icon.exam_soon {
  background: #FFF7E6;
  color: #FA8C16;
}

.message-icon.score_published {
  background: #F6FFED;
  color: #52C41A;
}

.message-icon.practice_new {
  background: #F0F5FF;
  color: #2F54EB;
}

.message-icon.practice_soon {
  background: #FFF1F0;
  color: #FF4D4F;
}

/* 消息内容 */
.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 5px;
}

.message-title {
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
  flex: 1;
  line-height: 1.4;
}

.message-time {
  font-size: 12px;
  color: #C9CDD4;
  white-space: nowrap;
  flex-shrink: 0;
}

.message-body {
  font-size: 13px;
  color: #86909C;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 未读红点 */
.unread-dot {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 8px;
  height: 8px;
  background: #FF4D4F;
  border-radius: 50%;
}

/* 空状态 */
.list-section :deep(.van-empty) {
  padding: 60px 0;
}
</style>
