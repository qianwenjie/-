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
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text=""
          @load="onLoad"
        >
          <div
            v-for="message in filteredMessages"
            :key="message.id"
            class="message-card"
            :class="{ unread: !message.isRead }"
            @click="handleMessageClick(message)"
          >
            <!-- 消息图标 -->
            <div class="message-icon" :class="message.type">
              <van-icon :name="getMessageIcon(message.type)" />
            </div>

            <!-- 消息内容 -->
            <div class="message-content">
              <div class="message-header">
                <span class="message-title">{{ message.title }}</span>
                <span class="message-time">{{ formatTime(message.time) }}</span>
              </div>
              <div class="message-body">{{ message.content }}</div>
              <div class="message-meta" v-if="message.examName">
                <van-tag size="small" plain>{{ message.examName }}</van-tag>
              </div>
            </div>

            <!-- 未读标记 -->
            <div v-if="!message.isRead" class="unread-dot"></div>
          </div>

          <!-- 空状态 -->
          <van-empty
            v-if="!loading && filteredMessages.length === 0"
            image="default"
            :description="emptyText"
          />
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

// 状态
const activeTab = ref('all')
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(true)

// 消息分类
const tabs = computed(() => [
  { label: '全部', value: 'all', count: unreadCount.value },
  { label: '考试通知', value: 'exam', count: getTypeUnreadCount('exam') },
  { label: '成绩通知', value: 'score', count: getTypeUnreadCount('score') },
  { label: '系统消息', value: 'system', count: getTypeUnreadCount('system') },
])

// 模拟消息数据
const messages = ref([
  {
    id: 1,
    type: 'exam',
    title: '考试即将开始',
    content: '您报名的《2024年度综合能力测试》将于明天上午9:00开始，请提前做好准备。',
    examName: '2024年度综合能力测试',
    time: '2026-02-05 10:30',
    isRead: false,
  },
  {
    id: 2,
    type: 'score',
    title: '成绩已发布',
    content: '您参加的《计算机基础知识考试》成绩已发布，点击查看详情。',
    examName: '计算机基础知识考试',
    time: '2026-02-04 15:20',
    isRead: false,
  },
  {
    id: 3,
    type: 'exam',
    title: '新考试已发布',
    content: '《数据结构与算法》考试已发布，考试时间：2026年2月10日，请及时报名参加。',
    examName: '数据结构与算法',
    time: '2026-02-03 09:00',
    isRead: true,
  },
  {
    id: 4,
    type: 'system',
    title: '系统维护通知',
    content: '系统将于本周六凌晨2:00-6:00进行维护升级，届时将暂停服务，请提前安排好您的学习计划。',
    examName: '',
    time: '2026-02-02 14:00',
    isRead: true,
  },
  {
    id: 5,
    type: 'score',
    title: '补考通知',
    content: '您在《英语四级模拟考试》中未达到及格线，可申请补考，补考时间：2026年2月15日。',
    examName: '英语四级模拟考试',
    time: '2026-02-01 11:30',
    isRead: false,
  },
  {
    id: 6,
    type: 'system',
    title: '账号安全提醒',
    content: '检测到您的账号在新设备上登录，如非本人操作，请及时修改密码。',
    examName: '',
    time: '2026-01-30 08:45',
    isRead: true,
  },
])

// 未读消息数量
const unreadCount = computed(() => {
  return messages.value.filter(m => !m.isRead).length
})

// 获取指定类型的未读数量
const getTypeUnreadCount = (type) => {
  return messages.value.filter(m => m.type === type && !m.isRead).length
}

// 筛选后的消息列表
const filteredMessages = computed(() => {
  if (activeTab.value === 'all') {
    return messages.value
  }
  return messages.value.filter(m => m.type === activeTab.value)
})

// 空状态文本
const emptyText = computed(() => {
  const tabText = tabs.value.find(t => t.value === activeTab.value)?.label || ''
  return `暂无${tabText === '全部' ? '' : tabText}消息`
})

// 获取消息图标
const getMessageIcon = (type) => {
  const iconMap = {
    exam: 'notes-o',
    score: 'chart-trending-o',
    system: 'info-o',
  }
  return iconMap[type] || 'comment-o'
}

// 格式化时间
const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `今天 ${hours}:${minutes}`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  }
}

// 点击消息
const handleMessageClick = (message) => {
  // 标记为已读
  message.isRead = true

  // 根据消息类型跳转
  if (message.type === 'exam' && message.examName) {
    showToast('跳转到考试详情')
    // router.push(`/exam/detail/${message.examId}`)
  } else if (message.type === 'score' && message.examName) {
    showToast('跳转到成绩详情')
    // router.push(`/exam/result/${message.examId}`)
  } else {
    showToast('查看消息详情')
  }
}

// 全部标记已读
const markAllRead = () => {
  messages.value.forEach(m => {
    m.isRead = true
  })
  showToast('已全部标记为已读')
}

// 下拉刷新
const onRefresh = () => {
  setTimeout(() => {
    refreshing.value = false
    showToast('刷新成功')
  }, 1000)
}

// 加载更多
const onLoad = () => {
  loading.value = false
  finished.value = true
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
  gap: 12px;
  border-top: 1px solid #F0F1F2;
  overflow-x: auto;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  font-size: 14px;
  color: #4E5969;
  background: #F5F6F7;
  border-radius: 20px;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tab-item.active {
  background: #00B96B;
  color: white;
  font-weight: 500;
}

.tab-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  background: #FF4D4F;
  color: white;
  border-radius: 9px;
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
  margin-bottom: 12px;
  position: relative;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: background 0.2s ease;
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
}

.message-icon .van-icon {
  font-size: 22px;
}

.message-icon.exam {
  background: #E6F7FF;
  color: #1890FF;
}

.message-icon.score {
  background: #F6FFED;
  color: #52C41A;
}

.message-icon.system {
  background: #FFF7E6;
  color: #FA8C16;
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
  margin-bottom: 6px;
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

.message-meta {
  margin-top: 8px;
}

.message-meta :deep(.van-tag) {
  background: #F5F6F7;
  color: #4E5969;
  border-color: #E5E6EB;
}

/* 未读标记 */
.unread-dot {
  position: absolute;
  top: 16px;
  right: 16px;
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
