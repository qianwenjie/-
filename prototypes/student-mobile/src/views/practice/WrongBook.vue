<template>
  <div class="wrong-book-page">
    <van-nav-bar title="错题本" left-arrow @click-left="$router.back()" fixed placeholder />

    <!-- 任务分组列表 -->
    <div class="list-section">
      <div
        v-for="group in store.wrongBookByTask"
        :key="group.taskId"
        class="task-card"
      >
        <div class="card-header">
          <svg class="card-deco-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 书脊 -->
            <rect x="6" y="6" width="8" height="36" rx="2" fill="#00995a"/>
            <!-- 书页主体 -->
            <rect x="12" y="6" width="28" height="36" rx="2" fill="#00C97A"/>
            <!-- 书页高光 -->
            <rect x="12" y="6" width="28" height="4" rx="2" fill="#33d993"/>
            <!-- 书脊高光 -->
            <rect x="6" y="6" width="4" height="36" rx="2" fill="#00b368"/>
            <!-- 横线装饰 -->
            <line x1="18" y1="18" x2="34" y2="18" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
            <line x1="18" y1="24" x2="34" y2="24" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
            <line x1="18" y1="30" x2="28" y2="30" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
            <!-- 书签 -->
            <path d="M36 6 L36 16 L33 13 L30 16 L30 6 Z" fill="#4A90E2"/>
          </svg>
          <div class="card-header-content">
            <h3 class="task-name">{{ group.taskName }}</h3>
            <span class="wrong-count">
              {{ group.wrongCount }} 道错题
              <template v-if="group.masteredCount > 0">，{{ group.masteredCount }} 道已掌握</template>
              <template v-if="group.notRedoneCount > 0">，<span class="not-redone-text">{{ group.notRedoneCount }} 道未重做</span></template>
            </span>
          </div>
        </div>

        <div class="card-actions">
          <div class="action-btn" @click="viewReview(group.taskId)">
            <van-icon name="eye-o" size="15" />
            <span>错题回顾</span>
          </div>
          <div class="action-divider"></div>
          <div class="action-btn action-btn--redo" @click="startRedo(group.taskId)">
            <van-icon name="replay" size="15" />
            <span>错题复习</span>
          </div>
          <div class="action-divider"></div>
          <div class="action-btn action-btn--mastered" @click="viewMastered(group.taskId)">
            <van-icon name="passed" size="15" />
            <span>已掌握题集</span>
          </div>
        </div>
      </div>

      <van-empty
        v-if="store.wrongBookByTask.length === 0"
        description="暂无错题，继续保持！"
        image="search"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores'

const router = useRouter()
const store = usePracticeStore()

onMounted(() => {
  store.loadWrongBook()
})

const viewReview = (taskId) => {
  router.push(`/practice/wrong-book/review/${taskId}`)
}

const startRedo = (taskId) => {
  router.push(`/practice/answer/${taskId}?mode=wrong-redo`)
}

const viewMastered = (taskId) => {
  router.push(`/practice/wrong-book/mastered/${taskId}`)
}
</script>

<style scoped>
.wrong-book-page {
  --primary-color: #00B96B;
  --text-primary: #1d2129;
  --text-secondary: #4e5969;
  --bg-color: #f7f8fa;
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: 24px;
}

.list-section {
  padding: 12px;
}

.task-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.card-deco-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.book-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.card-header-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.task-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wrong-count {
  font-size: 12px;
  color: #86909c;
  line-height: 1;
}

.not-redone-text {
  color: #FF7D00;
}

.card-actions {
  display: flex;
  align-items: center;
  border-top: 1px solid #f2f3f5;
  margin-top: 14px;
  padding-top: 12px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 4px 0;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
}

.action-btn:active {
  opacity: 0.6;
}

.action-btn--redo {
  color: #00B96B;
}

.action-divider {
  width: 1px;
  height: 16px;
  background: #e5e6eb;
  flex-shrink: 0;
}
</style>
