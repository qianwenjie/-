<template>
  <Teleport to="body">
    <Transition name="capture-fade">
      <div v-if="visible" class="capture-overlay">
        <!-- 即将抓拍提示 -->
        <div v-if="phase === 'notice'" class="capture-phase notice">
          <div class="capture-icon-ring">
            <van-icon name="photograph" size="48" />
          </div>
          <div class="capture-title">即将进行身份抓拍</div>
          <div class="capture-desc">请正面面对屏幕，保持面部清晰</div>
        </div>

        <!-- 倒计时 -->
        <div v-else-if="phase === 'countdown'" class="capture-phase countdown">
          <div class="countdown-circle">
            <svg viewBox="0 0 120 120" class="countdown-svg">
              <circle cx="60" cy="60" r="54" class="countdown-track" />
              <circle cx="60" cy="60" r="54" class="countdown-progress" :style="progressStyle" />
            </svg>
            <span class="countdown-number">{{ countdownNum }}</span>
          </div>
          <div class="capture-desc">请保持不动</div>
        </div>

        <!-- 抓拍中（闪光效果） -->
        <div v-else-if="phase === 'flash'" class="capture-phase flash">
          <div class="flash-effect"></div>
        </div>

        <!-- 抓拍成功 -->
        <div v-else-if="phase === 'success'" class="capture-phase success">
          <div class="success-icon-ring">
            <van-icon name="checked" size="48" />
          </div>
          <div class="capture-title success-text">抓拍成功</div>
          <div class="capture-desc">第 {{ captureIndex }} / {{ totalCaptures }} 次</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  totalCaptures: {
    type: Number,
    default: 3,
  },
})

const emit = defineEmits(['captured'])

const visible = ref(false)
const phase = ref('') // 'notice' | 'countdown' | 'flash' | 'success'
const countdownNum = ref(3)
const captureIndex = ref(0)

// 倒计时圆环进度
const progressStyle = computed(() => {
  const circumference = 2 * Math.PI * 54
  // 3 → 0%，2 → 33%，1 → 66%
  const progress = (3 - countdownNum.value) / 3
  const offset = circumference * (1 - progress)
  return {
    strokeDasharray: `${circumference}`,
    strokeDashoffset: `${offset}`,
  }
})

// 延时工具
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 执行一次抓拍流程
const startCapture = async (index) => {
  captureIndex.value = index
  visible.value = true

  // Phase 1: 提示即将抓拍（1.5秒）
  phase.value = 'notice'
  await delay(1500)

  // Phase 2: 倒计时 3-2-1（每秒一次）
  phase.value = 'countdown'
  countdownNum.value = 3
  await delay(1000)
  countdownNum.value = 2
  await delay(1000)
  countdownNum.value = 1
  await delay(1000)

  // Phase 3: 闪光抓拍（0.3秒）
  phase.value = 'flash'
  await delay(300)

  // Phase 4: 抓拍成功（1.5秒）
  phase.value = 'success'
  emit('captured', index)
  await delay(1500)

  // 关闭
  visible.value = false
  phase.value = ''
}

defineExpose({
  startCapture,
})
</script>

<style scoped>
.capture-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 过渡动画 */
.capture-fade-enter-active,
.capture-fade-leave-active {
  transition: opacity 0.3s ease;
}

.capture-fade-enter-from,
.capture-fade-leave-to {
  opacity: 0;
}

/* 阶段通用 */
.capture-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: phase-in 0.3s ease;
}

@keyframes phase-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 即将抓拍提示 */
.capture-icon-ring {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 3px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  animation: ring-pulse 1.5s ease-in-out infinite;
}

@keyframes ring-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow: 0 0 0 16px rgba(255, 255, 255, 0);
  }
}

.capture-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.capture-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* 倒计时 */
.countdown-circle {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.countdown-track {
  fill: none;
  stroke: rgba(255, 255, 255, 0.15);
  stroke-width: 6;
}

.countdown-progress {
  fill: none;
  stroke: #00B96B;
  stroke-width: 6;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}

.countdown-number {
  font-size: 56px;
  font-weight: 700;
  color: #fff;
  font-family: 'DIN Alternate', 'SF Mono', 'Menlo', monospace;
  line-height: 1;
  z-index: 1;
}

/* 闪光效果 */
.flash-effect {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  animation: flash-anim 0.3s ease-out;
}

@keyframes flash-anim {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* 抓拍成功 */
.success-icon-ring {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00B96B 0%, #52C41A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  animation: success-bounce 0.5s ease;
}

@keyframes success-bounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

.success-text {
  color: #52C41A;
}
</style>
