<template>
  <div class="cloze-question">
    <!-- 全屏答题面板 -->
    <van-popup
      v-model:show="panelVisible"
      position="right"
      :style="{ width: '90%', height: '100vh' }"
      :lock-scroll="true"
      :close-on-click-overlay="true"
    >
      <div
        class="panel-wrapper"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- 左侧突出页签：查看题目 -->
        <div class="panel-tab" @click="panelVisible = false">
          <van-icon name="arrow" />
          <span>查</span>
          <span>看</span>
          <span>题</span>
          <span>目</span>
        </div>

        <!-- 顶部栏 -->
        <div class="panel-top">
          <div class="top-title">
            <span class="blank-indicator">第 {{ currentBlankIndex + 1 }} 空</span>
            <span class="blank-total">共 {{ question.blanks.length }} 空</span>
          </div>
          <div class="top-progress">
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

        <!-- 底部导航 -->
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
            v-if="currentBlankIndex < question.blanks.length - 1"
            class="nav-btn nav-btn-primary"
            @click="nextBlank"
          >
            下一空
            <van-icon name="arrow" />
          </van-button>
          <van-button
            v-else
            class="nav-btn nav-btn-done"
            @click="panelVisible = false"
          >
            完成作答
            <van-icon name="success" />
          </van-button>
        </div>
      </div>
    </van-popup>
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

const emit = defineEmits(['update:value'])

// 面板显示状态
const panelVisible = ref(false)

// 当前空位索引
const currentBlankIndex = ref(0)

// 右滑收起手势
const touchStartX = ref(0)
const touchStartY = ref(0)
const isSwiping = ref(false)

const onTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isSwiping.value = false
}

const onTouchMove = (e) => {
  const deltaX = e.touches[0].clientX - touchStartX.value
  const deltaY = Math.abs(e.touches[0].clientY - touchStartY.value)
  // 水平滑动距离大于垂直滑动，判定为横向手势
  if (deltaX > 20 && deltaX > deltaY) {
    isSwiping.value = true
  }
}

const onTouchEnd = (e) => {
  if (!isSwiping.value) return
  const deltaX = e.changedTouches[0].clientX - touchStartX.value
  // 右滑超过 80px 收起面板
  if (deltaX > 80) {
    panelVisible.value = false
  }
  isSwiping.value = false
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

// 暴露给父组件的方法
const showPanel = () => {
  panelVisible.value = true
}

const openAtBlank = (index) => {
  currentBlankIndex.value = index
  panelVisible.value = true
}

defineExpose({ showPanel, openAtBlank })
</script>

<style scoped>
.cloze-question {
  position: relative;
}

/* 覆盖 van-popup 溢出裁切，让页签可以突出 */
.cloze-question :deep(.van-popup) {
  overflow: visible !important;
}

/* 面板容器 */
.panel-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  position: relative;
}

/* 左侧突出页签 */
.panel-tab {
  position: absolute;
  left: -36px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 6px;
  background: #FFFFFF;
  border-radius: 10px 0 0 10px;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  z-index: 10;
  font-size: 13px;
  font-weight: 600;
  color: #86909C;
  line-height: 1;
  transition: all 0.2s ease;
}

.panel-tab:active {
  background: #E8F5EE;
  color: #00B96B;
}

.panel-tab .van-icon {
  font-size: 14px;
  margin-bottom: 4px;
}

/* 顶部栏 */
.panel-top {
  flex-shrink: 0;
  padding: 16px 20px 14px;
  border-bottom: 1px solid #F0F1F2;
}

.top-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 14px;
}

.blank-indicator {
  font-size: 20px;
  font-weight: 700;
  color: #00B96B;
}

.blank-total {
  font-size: 13px;
  color: #86909C;
}

/* 进度点 */
.top-progress {
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

/* 选项区域 */
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.blank-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 选项卡片 — 与 SingleChoice 统一风格 */
.option-item {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: #F7F8FA;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 12px;
}

.option-item:active {
  transform: scale(0.98);
  background: #F0F1F3;
}

.option-selected {
  background: #E8F8F0;
}

.option-badge {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #E5E6EB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #4E5969;
  transition: all 0.2s ease;
}

.option-selected .option-badge {
  background: #00B96B;
  color: #FFFFFF;
}

.option-text {
  flex: 1;
  font-size: 15px;
  line-height: 1.5;
  color: #1D2129;
}

.option-check {
  flex-shrink: 0;
  color: #00B96B;
  font-size: 18px;
}

.option-check .van-icon {
  color: #00B96B;
  font-size: 18px;
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

/* 底部导航 */
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

.nav-btn-done {
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
