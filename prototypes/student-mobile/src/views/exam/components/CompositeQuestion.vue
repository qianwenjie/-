<template>
  <div class="composite-question">
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
        <div class="header-left">
          <span class="sub-indicator">第 {{ currentSubIndex + 1 }} 小题</span>
          <span class="sub-total">共 {{ question.subQuestions.length }} 题</span>
        </div>
        <div class="header-right">
          <span class="sub-score">{{ currentSubQuestion.score }}分</span>
          <span class="answer-status" :class="hasAnswer ? 'status-done' : 'status-pending'">
            {{ hasAnswer ? '已答' : '未答' }}
          </span>
        </div>
      </div>

      <!-- 子题进度条 -->
      <div class="header-progress">
        <div
          v-for="(sub, index) in question.subQuestions"
          :key="sub.id"
          class="progress-dot"
          :class="{
            'dot-current': index === currentSubIndex,
            'dot-answered': isSubAnswered(sub.id, sub.type)
          }"
          @click="currentSubIndex = index"
        ></div>
      </div>

      <!-- 子题内容 -->
      <div class="panel-content">
        <div
          v-for="(subQuestion, index) in question.subQuestions"
          :key="subQuestion.id"
          class="sub-question-wrapper"
          v-show="currentSubIndex === index"
        >
          <!-- 子题题干 -->
          <div class="sub-stem">
            <span class="stem-number">({{ index + 1 }})</span>
            <span class="stem-text">{{ subQuestion.content }}</span>
          </div>

          <!-- 子题类型标签 -->
          <div class="sub-type-tag">
            <van-tag :type="getSubTypeColor(subQuestion.type)" size="medium">
              {{ getSubTypeName(subQuestion.type) }}
            </van-tag>
          </div>

          <!-- 根据子题类型渲染答题区域 -->
          <div class="sub-answer-area">
            <!-- 单选题 -->
            <div v-if="subQuestion.type === 'single'" class="options-list">
              <div
                v-for="option in subQuestion.options"
                :key="option.label"
                class="option-card"
                :class="{ 'option-selected': isSelected(subQuestion.id, option.label) }"
                @click="selectOption(subQuestion.id, option.label)"
              >
                <div class="option-indicator">{{ option.label }}</div>
                <div class="option-content">{{ option.text }}</div>
                <div class="option-check" v-if="isSelected(subQuestion.id, option.label)">
                  <van-icon name="success" />
                </div>
              </div>
            </div>

            <!-- 多选题 -->
            <div v-else-if="subQuestion.type === 'multiple'" class="options-list">
              <div class="multi-hint">
                <van-icon name="info-o" />
                <span>本题为多选题</span>
              </div>
              <div
                v-for="option in subQuestion.options"
                :key="option.label"
                class="option-card multi-option"
                :class="{ 'option-selected': isMultiSelected(subQuestion.id, option.label) }"
                @click="toggleMultiOption(subQuestion.id, option.label)"
              >
                <div class="checkbox-indicator" :class="{ 'checkbox-checked': isMultiSelected(subQuestion.id, option.label) }">
                  <van-icon v-if="isMultiSelected(subQuestion.id, option.label)" name="success" />
                </div>
                <div class="option-label">{{ option.label }}</div>
                <div class="option-content">{{ option.text }}</div>
              </div>
            </div>

            <!-- 简答题 -->
            <div v-else-if="subQuestion.type === 'essay'" class="essay-area">
              <textarea
                :value="getSubAnswer(subQuestion.id).text"
                @input="(e) => handleEssayChange(subQuestion.id, e.target.value)"
                placeholder="请输入你的答案..."
                class="essay-input"
                rows="6"
              ></textarea>
              <div class="essay-footer">
                <span class="char-count">{{ (getSubAnswer(subQuestion.id).text || '').length }} 字</span>
                <div class="attachment-count">{{ (getSubAnswer(subQuestion.id).attachments || []).length }}/3</div>
              </div>

              <!-- 已上传的附件列表 -->
              <div v-if="(getSubAnswer(subQuestion.id).attachments || []).length > 0" class="attachment-list">
                <div
                  v-for="(file, fileIndex) in getSubAnswer(subQuestion.id).attachments"
                  :key="fileIndex"
                  class="attachment-item"
                >
                  <div class="file-preview">
                    <img v-if="file.type && file.type.startsWith('image/')" :src="file.url" class="preview-image" />
                    <div v-else class="file-icon-wrapper">
                      <van-icon name="description" />
                    </div>
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-meta">{{ formatFileSize(file.size) }}</div>
                  </div>
                  <van-icon
                    name="cross"
                    class="delete-btn"
                    @click="handleAttachmentDelete(subQuestion.id, fileIndex)"
                  />
                </div>
              </div>

              <!-- 上传按钮 -->
              <van-uploader
                v-model="tempFileList"
                :max-count="3"
                :max-size="10 * 1024 * 1024"
                :after-read="(file) => handleAttachmentUpload(subQuestion.id, file)"
                @oversize="handleOversize"
                multiple
                :disabled="(getSubAnswer(subQuestion.id).attachments || []).length >= 3"
              >
                <div class="upload-trigger" :class="{ 'trigger-disabled': (getSubAnswer(subQuestion.id).attachments || []).length >= 3 }">
                  <van-icon name="plus" />
                  <span>{{ (getSubAnswer(subQuestion.id).attachments || []).length >= 3 ? '已达上限' : '添加附件' }}</span>
                </div>
              </van-uploader>
            </div>
          </div>
        </div>
      </div>

      <!-- 导航栏 -->
      <div class="panel-nav">
        <van-button
          class="nav-btn"
          :disabled="currentSubIndex === 0"
          @click="prevSub"
        >
          <van-icon name="arrow-left" />
          上一题
        </van-button>

        <div class="nav-progress">
          <span class="progress-current">{{ currentSubIndex + 1 }}</span>
          <span class="progress-divider">/</span>
          <span class="progress-total">{{ question.subQuestions.length }}</span>
        </div>

        <van-button
          class="nav-btn nav-btn-primary"
          :disabled="currentSubIndex === question.subQuestions.length - 1"
          @click="nextSub"
        >
          下一题
          <van-icon name="arrow" />
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast } from 'vant'

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

// 当前子题索引
const currentSubIndex = ref(0)

// 面板高度（默认55vh）
const panelHeight = ref(55)

// 临时文件列表（用于上传组件）
const tempFileList = ref([])

// 当前子题
const currentSubQuestion = computed(() => {
  return props.question.subQuestions[currentSubIndex.value] || {}
})

// 当前子题是否已答
const hasAnswer = computed(() => {
  const sub = currentSubQuestion.value
  return isSubAnswered(sub.id, sub.type)
})

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

// 获取子题类型名称
const getSubTypeName = (type) => {
  const nameMap = {
    single: '单选',
    multiple: '多选',
    essay: '简答',
  }
  return nameMap[type] || type
}

// 获取子题类型颜色
const getSubTypeColor = (type) => {
  const colorMap = {
    single: 'primary',
    multiple: 'success',
    essay: 'warning',
  }
  return colorMap[type] || 'default'
}

// 判断子题是否已答
const isSubAnswered = (subId, type) => {
  const answer = props.value[subId]
  if (!answer) return false

  if (type === 'essay') {
    return (answer.text && answer.text.trim()) || (answer.attachments && answer.attachments.length > 0)
  }
  if (Array.isArray(answer)) {
    return answer.length > 0
  }
  return !!answer
}

// 获取子题答案
const getSubAnswer = (subQuestionId) => {
  const answer = props.value[subQuestionId]
  if (typeof answer === 'string') {
    return { text: answer, attachments: [] }
  }
  return answer || { text: '', attachments: [] }
}

// 单选题判断是否选中
const isSelected = (subQuestionId, label) => {
  return props.value[subQuestionId] === label
}

// 多选题判断是否选中
const isMultiSelected = (subQuestionId, label) => {
  const answer = props.value[subQuestionId] || []
  return answer.includes(label)
}

// 单选题选择
const selectOption = (subQuestionId, label) => {
  const newValue = { ...props.value, [subQuestionId]: label }
  emit('update:value', newValue)
}

// 多选题切换
const toggleMultiOption = (subQuestionId, label) => {
  const currentAnswer = props.value[subQuestionId] || []
  const newAnswer = [...currentAnswer]
  const index = newAnswer.indexOf(label)

  if (index > -1) {
    newAnswer.splice(index, 1)
  } else {
    newAnswer.push(label)
  }

  const newValue = { ...props.value, [subQuestionId]: newAnswer }
  emit('update:value', newValue)
}

// 简答题输入
const handleEssayChange = (subQuestionId, text) => {
  const currentAnswer = getSubAnswer(subQuestionId)
  const newValue = {
    ...props.value,
    [subQuestionId]: {
      text,
      attachments: currentAnswer.attachments || []
    }
  }
  emit('update:value', newValue)
}

// 附件上传
const handleAttachmentUpload = (subQuestionId, file) => {
  const currentAnswer = getSubAnswer(subQuestionId)
  const attachments = [...(currentAnswer.attachments || [])]

  const files = Array.isArray(file) ? file : [file]

  files.forEach(f => {
    const newAttachment = {
      name: f.file?.name || '附件',
      size: f.file?.size || 0,
      type: f.file?.type || '',
      url: f.content || (f.file ? URL.createObjectURL(f.file) : ''),
      file: f.file
    }
    attachments.push(newAttachment)
  })

  const newValue = {
    ...props.value,
    [subQuestionId]: {
      text: currentAnswer.text || '',
      attachments
    }
  }
  emit('update:value', newValue)

  // 清空临时文件列表
  tempFileList.value = []

  showToast({
    message: '附件添加成功',
    icon: 'passed',
  })
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) {
    return bytes + ' B'
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB'
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
}

// 文件超出大小限制
const handleOversize = () => {
  showToast({
    message: '文件大小不能超过 10MB',
    icon: 'warning-o',
  })
}

// 删除附件
const handleAttachmentDelete = (subQuestionId, index) => {
  const currentAnswer = getSubAnswer(subQuestionId)
  const attachments = [...(currentAnswer.attachments || [])]
  attachments.splice(index, 1)

  const newValue = {
    ...props.value,
    [subQuestionId]: {
      text: currentAnswer.text || '',
      attachments
    }
  }
  emit('update:value', newValue)
}

// 上一题
const prevSub = () => {
  if (currentSubIndex.value > 0) {
    currentSubIndex.value--
  }
}

// 下一题
const nextSub = () => {
  if (currentSubIndex.value < props.question.subQuestions.length - 1) {
    currentSubIndex.value++
  }
}
</script>

<style scoped>
.composite-question {
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
  transition: all 0.2s ease;
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
  padding: 8px 20px 12px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.sub-indicator {
  font-size: 18px;
  font-weight: 700;
  color: #00B96B;
}

.sub-total {
  font-size: 13px;
  color: #86909C;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sub-score {
  font-size: 14px;
  font-weight: 600;
  color: #F77234;
}

.answer-status {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.status-done {
  background: #D1FAE5;
  color: #065F46;
}

.status-pending {
  background: #FEF3C7;
  color: #92400E;
}

/* 进度点 */
.header-progress {
  display: flex;
  gap: 6px;
  padding: 0 20px 12px;
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
  padding: 0 20px 16px;
  border-top: 1px solid #F0F1F2;
}

.sub-question-wrapper {
  padding-top: 16px;
}

/* 子题题干 */
.sub-stem {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.stem-number {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 600;
  color: #00B96B;
}

.stem-text {
  flex: 1;
  font-size: 15px;
  line-height: 1.6;
  color: #1D2129;
}

/* 子题类型标签 */
.sub-type-tag {
  margin-bottom: 16px;
}

/* 答题区域 */
.sub-answer-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 选项列表 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.multi-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #FFF7E6;
  border-radius: 8px;
  font-size: 13px;
  color: #D46B08;
}

/* 选项卡片 */
.option-card {
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

.option-card:active {
  transform: scale(0.98);
}

.option-selected {
  background: linear-gradient(135deg, #F0E6FF 0%, #F5F0FF 100%);
  border-color: #722ED1;
  box-shadow: 0 4px 12px rgba(114, 46, 209, 0.12);
}

.option-indicator {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #E5E6EB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #4E5969;
  transition: all 0.25s ease;
}

.option-selected .option-indicator {
  background: #722ED1;
  color: #FFFFFF;
}

/* 多选复选框 */
.checkbox-indicator {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: 2px solid #C9CDD4;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.checkbox-checked {
  background: #722ED1;
  border-color: #722ED1;
}

.checkbox-indicator .van-icon {
  color: #FFFFFF;
  font-size: 14px;
}

.option-label {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  color: #4E5969;
  min-width: 20px;
}

.option-selected .option-label {
  color: #722ED1;
}

.option-content {
  flex: 1;
  font-size: 15px;
  line-height: 1.5;
  color: #1D2129;
}

.option-selected .option-content {
  font-weight: 500;
}

.option-check {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #722ED1;
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

/* 简答题区域 */
.essay-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.essay-input {
  width: 100%;
  padding: 14px 16px;
  background: #FFFFFF;
  border: 2px solid #E5E6EB;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.6;
  color: #1D2129;
  resize: none;
  min-height: 140px;
  transition: all 0.3s ease;
  outline: none;
  font-family: inherit;
}

.essay-input::placeholder {
  color: #C9CDD4;
}

.essay-input:focus {
  border-color: #722ED1;
  box-shadow: 0 4px 12px rgba(114, 46, 209, 0.1);
}

.essay-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.char-count {
  font-size: 13px;
  color: #86909C;
}

.attachment-count {
  font-size: 13px;
  color: #86909C;
}

/* 附件列表 */
.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #F9FAFB;
  border: 1px solid #E5E6EB;
  border-radius: 10px;
  gap: 12px;
}

.file-preview {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  background: #F5F6F7;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #E6F7FF 0%, #F0F5FF 100%);
}

.file-icon-wrapper .van-icon {
  font-size: 20px;
  color: #3491FA;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  color: #1D2129;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  font-size: 12px;
  color: #86909C;
  margin-top: 2px;
}

.delete-btn {
  flex-shrink: 0;
  font-size: 18px;
  color: #C9CDD4;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s ease;
}

.delete-btn:active {
  transform: scale(0.9);
  color: #F53F3F;
}

/* 上传触发器 */
.upload-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  background: #FFFFFF;
  border: 2px dashed #D9D9D9;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-trigger:active {
  border-color: #F7BA1E;
  background: #FFFBE6;
}

.trigger-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-trigger .van-icon {
  font-size: 18px;
  color: #F7BA1E;
}

.upload-trigger > span {
  font-size: 14px;
  color: #4E5969;
}

/* 隐藏 Vant 上传组件默认样式 */
.essay-area :deep(.van-uploader) {
  display: block;
}

.essay-area :deep(.van-uploader__wrapper) {
  display: block;
}

.essay-area :deep(.van-uploader__input-wrapper) {
  display: block;
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

.nav-progress {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.progress-current {
  font-size: 14px;
  font-weight: 500;
  color: #86909C;
}

.progress-divider {
  font-size: 14px;
  color: #C9CDD4;
  margin: 0 2px;
}

.progress-total {
  font-size: 14px;
  color: #86909C;
}
</style>
