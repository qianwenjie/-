<template>
  <div class="cloze-question">
    <!-- 答题面板 -->
    <div class="answer-panel" :style="{ height: panelHeight + 'vh' }">
      <!-- 拖拽手柄 -->
      <div
        class="drag-handle"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div class="handle-bar"></div>
      </div>

      <!-- 面板头部 -->
      <div class="panel-header">
        <div class="header-title">
          <span class="blank-indicator">第 {{ currentBlankIndex + 1 }} 空</span>
          <span class="blank-total">共 {{ question.blanks.length }} 空</span>
        </div>
        <div class="header-progress">
          <div
            v-for="(blank, index) in question.blanks"
            :key="blank.id"
            class="progress-dot"
            :class="{
              'dot-current': index === currentBlankIndex,
              'dot-answered': value[blank.id]
            }"
            @click="currentBlankIndex = index"
          ></div>
        </div>
      </div>

      <!-- 选项区域 -->
      <div class="panel-content">
        <div
          v-for="(blank, index) in question.blanks"
          :key="blank.id"
          class="blank-options"
          v-show="currentBlankIndex === index"
        >
          <div
            v-for="option in blank.options"
            :key="option.label"
            class="option-item"
            :class="{ 'option-selected': isSelected(blank.id, option.label) }"
            @click="selectOption(blank.id, option.label)"
          >
            <div class="option-badge">{{ option.label }}</div>
            <div class="option-text">{{ option.text }}</div>
            <div class="option-check" v-if="isSelected(blank.id, option.label)">
              <van-icon name="success" />
            </div>
          </div>

          <!-- 清除按钮 -->
          <div v-if="value[blank.id]" class="clear-action">
            <van-button
              size="small"
              plain
              round
              icon="delete-o"
              @click="clearAnswer(blank.id)"
            >
              清除本空答案
            </van-button>
          </div>
        </div>
      </div>

      <!-- 导航栏 -->
      <div class="panel-nav">
        <van-button
          class="nav-btn"
          :disabled="currentBlankIndex === 0"
          @click="prevBlank"
        >
          <van-icon name="arrow-left" />
          上一空
        </van-button>

        <div class="nav-indicator">
          {{ currentBlankIndex + 1 }} / {{ question.blanks.length }}
        </div>

        <van-button
          class="nav-btn nav-btn-primary"
          :disabled="currentBlankIndex === question.blanks.length - 1"
          @click="nextBlank"
        >
          下一空
          <van-icon name="arrow" />
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  value: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:value', 'complete'])

// 当前空位索引
const currentBlankIndex = ref(0)

// 面板高度（默认55vh）
const panelHeight = ref(55)

// 拖动相关
let startY = 0
let startHeight = 0
let isDragging = false

const handleTouchStart = (e) => {
  isDragging = true
  startY = e.touches[0].clientY
  startHeight = panelHeight.value
  e.preventDefault()
}

const handleTouchMove = (e) => {
  if (!isDragging) return
  e.preventDefault()

  const currentY = e.touches[0].clientY
  const deltaY = startY - currentY
  const deltaVh = (deltaY / window.innerHeight) * 100
  const newHeight = startHeight + deltaVh

  if (newHeight >= 35 && newHeight <= 85) {
    panelHeight.value = newHeight
  }
}

const handleTouchEnd = (e) => {
  isDragging = false
  e.preventDefault()
}

const isSelected = (blankId, label) => {
  return props.value[blankId] === label
}

const selectOption = (blankId, label) => {
  const newValue = { ...props.value, [blankId]: label }
  emit('update:value', newValue)
}

const clearAnswer = (blankId) => {
  const newValue = { ...props.value }
  delete newValue[blankId]
  emit('update:value', newValue)
}

const prevBlank = () => {
  if (currentBlankIndex.value > 0) {
    currentBlankIndex.value--
  }
}

const nextBlank = () => {
  if (currentBlankIndex.value < props.question.blanks.length - 1) {
    currentBlankIndex.value++
  }
}
</script>

<style scoped>
.cloze-question {
  position: relative;
  min-height: 400px;
}

/* 答题面板 */
.answer-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 64px;
  background: #FFFFFF;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  z-index: 60; /* 高于题目信息栏的 z-index: 50 */
  will-change: height;
}

/* 拖拽手柄 */
.drag-handle {
  flex-shrink: 0;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ns-resize;
  touch-action: none;
  user-select: none;
}

.handle-bar {
  width: 36px;
  height: 4px;
  background: #E5E6EB;
  border-radius: 2px;
  transition: background 0.2s ease;
}

.drag-handle:active .handle-bar {
  background: #00B96B;
  width: 48px;
}

/* 面板头部 */
.panel-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px 16px;
  border-bottom: 1px solid #F0F1F2;
}

.header-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.blank-indicator {
  font-size: 18px;
  font-weight: 700;
  color: #00B96B;
}

.blank-total {
  font-size: 13px;
  color: #86909C;
}

/* 进度点 */
.header-progress {
  display: flex;
  gap: 6px;
}

.progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #E5E6EB;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dot-current {
  width: 20px;
  border-radius: 4px;
  background: #00B96B;
}

.dot-answered {
  background: #00B96B;
}

.dot-answered.dot-current {
  background: #00B96B;
}

/* 面板内容 */
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.blank-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 选项卡片 */
.option-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #F9FAFB;
  border: 2px solid #E5E6EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  gap: 12px;
}

.option-item:active {
  transform: scale(0.98);
}

.option-selected {
  background: linear-gradient(135deg, #FFFBE6 0%, #FFF9E6 100%);
  border-color: #F7BA1E;
  box-shadow: 0 4px 12px rgba(247, 186, 30, 0.15);
}

.option-badge {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #E5E6EB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #4E5969;
  transition: all 0.25s ease;
}

.option-selected .option-badge {
  background: #F7BA1E;
  color: #FFFFFF;
}

.option-text {
  flex: 1;
  font-size: 15px;
  line-height: 1.5;
  color: #1D2129;
}

.option-selected .option-text {
  font-weight: 500;
}

.option-check {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #F7BA1E;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: checkPop 0.3s ease;
}

.option-check .van-icon {
  color: #FFFFFF;
  font-size: 12px;
}

@keyframes checkPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* 清除按钮 */
.clear-action {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.clear-action :deep(.van-button) {
  color: #86909C;
  border-color: #E5E6EB;
}

/* 导航栏 */
.panel-nav {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid #F0F1F2;
  background: #FAFAFA;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: #FFFFFF;
  border: 1px solid #E5E6EB;
  border-radius: 20px;
  font-size: 14px;
  color: #4E5969;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-btn:not(:disabled):active {
  transform: scale(0.96);
}

.nav-btn-primary {
  background: #00B96B;
  border-color: #00B96B;
  color: #FFFFFF;
}

.nav-btn .van-icon {
  font-size: 14px;
}

.nav-indicator {
  font-size: 14px;
  color: #86909C;
  font-weight: 500;
}
</style>
