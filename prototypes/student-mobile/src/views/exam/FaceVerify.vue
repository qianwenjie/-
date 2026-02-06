<template>
  <div class="face-verify-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="人脸识别验证" left-arrow @click-left="handleBack" fixed placeholder />

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading-wrapper" vertical>加载中...</van-loading>

    <!-- 主内容 -->
    <div v-else class="content">
      <!-- 识别成功状态 -->
      <div v-if="verifyStatus === 'success'" class="status-view success">
        <div class="status-icon-wrapper success">
          <van-icon name="checked" size="48" />
        </div>
        <div class="status-title">验证成功</div>
        <div class="status-desc">正在进入考试...</div>
      </div>

      <!-- 识别失败状态 -->
      <div v-else-if="verifyStatus === 'failed'" class="status-view failed">
        <div class="status-icon-wrapper failed">
          <van-icon name="close" size="48" />
        </div>
        <div class="status-title">验证失败</div>
        <div class="status-desc">{{ errorMessage }}</div>
        <van-button type="primary" round class="retry-btn" @click="resetStatus">
          重新识别
        </van-button>
      </div>

      <!-- 摄像头预览区域 -->
      <template v-else>
        <!-- 摄像头预览框 -->
        <div class="camera-section">
          <div class="camera-frame" :class="{ recognizing: recognizing }">
            <!-- 扫描动画 -->
            <div v-if="recognizing" class="scan-line"></div>
            <!-- 人脸占位 -->
            <div class="face-placeholder">
              <van-icon name="user-circle-o" size="64" color="#C9CDD4" />
            </div>
            <!-- 四角装饰 -->
            <div class="corner tl"></div>
            <div class="corner tr"></div>
            <div class="corner bl"></div>
            <div class="corner br"></div>
          </div>
          <div class="camera-hint">{{ recognizing ? '正在识别，请保持不动...' : '请将面部置于框内' }}</div>
        </div>

        <!-- 说明提示 -->
        <div class="tips-section">
          <div class="tip-item">
            <van-icon name="bulb-o" />
            <span>光线充足</span>
          </div>
          <div class="tip-item">
            <van-icon name="eye-o" />
            <span>正面面对</span>
          </div>
          <div class="tip-item">
            <van-icon name="smile-o" />
            <span>面部清晰</span>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="bottom-section">
          <van-button
            type="primary"
            size="large"
            round
            block
            :loading="recognizing"
            loading-text="识别中..."
            @click="handleCapture"
          >
            开始识别
          </van-button>
          <van-button
            v-if="canSkip"
            type="default"
            size="small"
            round
            class="skip-btn"
            @click="handleSkip"
          >
            跳过验证
          </van-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExamStore } from '@/stores'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const examStore = useExamStore()

const loading = ref(true)
const exam = ref(null)
const recognizing = ref(false)
const verifyStatus = ref('') // '', 'success', 'failed'
const errorMessage = ref('')

// 是否可以跳过
const canSkip = computed(() => {
  return exam.value?.config?.allowSkipFaceVerify || false
})

// 加载考试信息
const loadExamInfo = async () => {
  loading.value = true
  try {
    const examId = route.params.id
    const data = await examStore.fetchExamDetail(examId)
    exam.value = data

    // 检查是否需要人脸识别
    if (!data.config.enableFaceRecognition) {
      showToast('该考试无需人脸识别')
      router.replace(`/exam/answer/${examId}`)
      return
    }
  } catch (error) {
    showToast('加载失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 重置状态
const resetStatus = () => {
  verifyStatus.value = ''
  errorMessage.value = ''
}

// 开始识别
const handleCapture = async () => {
  recognizing.value = true

  try {
    // 模拟人脸识别过程
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模拟识别结果（90%成功率）
    const success = Math.random() > 0.1

    if (success) {
      verifyStatus.value = 'success'
      recognizing.value = false

      // 延迟跳转到答题页面
      setTimeout(() => {
        router.replace(`/exam/answer/${exam.value.id}`)
      }, 1500)
    } else {
      verifyStatus.value = 'failed'
      errorMessage.value = '未能识别到人脸，请重试'
      recognizing.value = false
    }
  } catch (error) {
    verifyStatus.value = 'failed'
    errorMessage.value = '识别失败，请重试'
    recognizing.value = false
  }
}

// 跳过验证
const handleSkip = async () => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要跳过人脸识别吗？',
    })

    router.replace(`/exam/answer/${exam.value.id}`)
  } catch {
    // 取消
  }
}

// 返回处理
const handleBack = async () => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要退出验证吗？',
    })

    router.back()
  } catch {
    // 取消
  }
}

onMounted(() => {
  loadExamInfo()
})
</script>

<style scoped>
.face-verify-page {
  height: 100vh;
  background-color: #f7f8fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}

/* 状态视图 */
.status-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.status-icon-wrapper {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon-wrapper.success {
  background: linear-gradient(135deg, #00B96B 0%, #52C41A 100%);
  color: white;
}

.status-icon-wrapper.failed {
  background: linear-gradient(135deg, #FF4D4F 0%, #F53F3F 100%);
  color: white;
}

.status-title {
  font-size: 20px;
  font-weight: 600;
  color: #1D2129;
}

.status-desc {
  font-size: 14px;
  color: #86909C;
}

.retry-btn {
  margin-top: 24px;
  width: 140px;
}

/* 摄像头区域 */
.camera-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.camera-frame {
  width: 220px;
  height: 280px;
  position: relative;
  border: 2px solid #E5E6EB;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  overflow: hidden;
  transition: border-color 0.3s;
}

.camera-frame.recognizing {
  border-color: #00B96B;
}

/* 扫描线动画 */
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00B96B, transparent);
  animation: scan 1.5s ease-in-out infinite;
}

@keyframes scan {
  0% {
    top: 0;
  }
  50% {
    top: calc(100% - 3px);
  }
  100% {
    top: 0;
  }
}

.face-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* 四角装饰 */
.corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 3px solid #00B96B;
}

.corner.tl {
  top: -1px;
  left: -1px;
  border-right: none;
  border-bottom: none;
  border-radius: 16px 0 0 0;
}

.corner.tr {
  top: -1px;
  right: -1px;
  border-left: none;
  border-bottom: none;
  border-radius: 0 16px 0 0;
}

.corner.bl {
  bottom: -1px;
  left: -1px;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 16px;
}

.corner.br {
  bottom: -1px;
  right: -1px;
  border-left: none;
  border-top: none;
  border-radius: 0 0 16px 0;
}

.camera-hint {
  margin-top: 16px;
  font-size: 14px;
  color: #86909C;
}

/* 提示区域 */
.tips-section {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 20px 0;
  flex-shrink: 0;
}

.tip-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #4E5969;
}

.tip-item .van-icon {
  font-size: 24px;
  color: #00B96B;
}

/* 底部按钮 */
.bottom-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-bottom: env(safe-area-inset-bottom);
  flex-shrink: 0;
}

.bottom-section :deep(.van-button--primary) {
  background: #00B96B;
  border-color: #00B96B;
}

.skip-btn {
  color: #86909C;
}
</style>
