<template>
  <div class="face-verify-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="人脸识别验证" left-arrow @click-left="handleBack" fixed placeholder />

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading-wrapper" vertical>加载中...</van-loading>

    <!-- 主内容 -->
    <div v-else class="content">
      <!-- 识别状态提示 -->
      <div v-if="verifyStatus === 'success'" class="status-card success">
        <van-icon name="checked" size="60" color="#00B96B" />
        <div class="status-title">验证成功</div>
        <div class="status-desc">正在进入考试...</div>
      </div>

      <div v-else-if="verifyStatus === 'failed'" class="status-card failed">
        <van-icon name="close" size="60" color="#F53F3F" />
        <div class="status-title">验证失败</div>
        <div class="status-desc">{{ errorMessage }}</div>
      </div>

      <!-- 摄像头预览区域 -->
      <div v-else class="camera-container">
        <!-- 说明文字 -->
        <div class="instruction-card">
          <div class="instruction-title">
            <van-icon name="info-o" />
            <span>人脸识别说明</span>
          </div>
          <div class="instruction-list">
            <div class="instruction-item">
              <van-icon name="success" color="#00B96B" />
              <span>请保持面部清晰可见</span>
            </div>
            <div class="instruction-item">
              <van-icon name="success" color="#00B96B" />
              <span>确保光线充足</span>
            </div>
            <div class="instruction-item">
              <van-icon name="success" color="#00B96B" />
              <span>摘下眼镜和帽子</span>
            </div>
            <div class="instruction-item">
              <van-icon name="success" color="#00B96B" />
              <span>保持正面面对摄像头</span>
            </div>
          </div>
        </div>

        <!-- 摄像头预览框 -->
        <div class="camera-preview">
          <div class="preview-frame">
            <div class="frame-corner tl"></div>
            <div class="frame-corner tr"></div>
            <div class="frame-corner bl"></div>
            <div class="frame-corner br"></div>
            <div class="preview-placeholder">
              <van-icon name="user-circle-o" size="80" color="#C9CDD4" />
              <div class="placeholder-text">请将面部置于框内</div>
            </div>
          </div>
        </div>

        <!-- 识别进度 -->
        <div v-if="recognizing" class="recognizing-overlay">
          <van-loading type="spinner" size="40" color="#00B96B">
            <span class="recognizing-text">识别中...</span>
          </van-loading>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <van-button
            type="primary"
            size="large"
            block
            :loading="recognizing"
            @click="handleCapture"
          >
            {{ recognizing ? '识别中...' : '开始识别' }}
          </van-button>

          <!-- 跳过按钮（如果允许） -->
          <van-button
            v-if="canSkip"
            type="default"
            size="large"
            block
            class="skip-button"
            @click="handleSkip"
          >
            跳过验证
          </van-button>
        </div>

        <!-- 提示信息 -->
        <div class="tips-card">
          <van-icon name="warning-o" color="#FF7D00" />
          <span>为保证考试公平性,请确保本人参加考试</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

    // 检查考试状态
    if (data.status !== 'in_progress') {
      showToast('考试未开始或已结束')
      router.back()
      return
    }
  } catch (error) {
    showToast('加载失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 开始识别
const handleCapture = async () => {
  recognizing.value = true

  try {
    // 模拟人脸识别过程（实际项目中需要调用真实的人脸识别API）
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模拟识别结果（90%成功率）
    const success = Math.random() > 0.1

    if (success) {
      verifyStatus.value = 'success'
      showToast('验证成功')

      // 延迟跳转到答题页面
      setTimeout(() => {
        router.replace(`/exam/answer/${exam.value.id}`)
      }, 1500)
    } else {
      verifyStatus.value = 'failed'
      errorMessage.value = '未能识别到人脸，请重试'
      recognizing.value = false

      // 3秒后重置状态
      setTimeout(() => {
        verifyStatus.value = ''
        errorMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    verifyStatus.value = 'failed'
    errorMessage.value = '识别失败，请重试'
    recognizing.value = false

    setTimeout(() => {
      verifyStatus.value = ''
      errorMessage.value = ''
    }, 3000)
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
  min-height: 100vh;
  background-color: #f7f8fa;
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.content {
  padding: 12px;
  padding-bottom: 80px;
}

/* 状态卡片 */
.status-card {
  background: white;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  margin-bottom: 20px;
}

.status-card .van-icon {
  margin-bottom: 20px;
}

.status-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.status-card.success .status-title {
  color: #00B96B;
}

.status-card.failed .status-title {
  color: #F53F3F;
}

.status-desc {
  font-size: 14px;
  color: #86909c;
}

/* 摄像头容器 */
.camera-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 说明卡片 */
.instruction-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.instruction-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 12px;
}

.instruction-title .van-icon {
  color: #165DFF;
}

.instruction-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4e5969;
}

/* 摄像头预览 */
.camera-preview {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  position: relative;
}

.preview-frame {
  width: 280px;
  height: 350px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px dashed #C9CDD4;
  border-radius: 12px;
}

/* 边角装饰 */
.frame-corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid #00B96B;
}

.frame-corner.tl {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
  border-radius: 12px 0 0 0;
}

.frame-corner.tr {
  top: -2px;
  right: -2px;
  border-left: none;
  border-bottom: none;
  border-radius: 0 12px 0 0;
}

.frame-corner.bl {
  bottom: -2px;
  left: -2px;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 12px;
}

.frame-corner.br {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
  border-radius: 0 0 12px 0;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.placeholder-text {
  font-size: 14px;
  color: #86909c;
}

/* 识别中遮罩 */
.recognizing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.recognizing-text {
  margin-left: 12px;
  color: white;
  font-size: 16px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skip-button {
  margin-top: 0;
}

/* 提示卡片 */
.tips-card {
  background: #FFF7E8;
  border: 1px solid #FFCF8B;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #86909c;
}
</style>
