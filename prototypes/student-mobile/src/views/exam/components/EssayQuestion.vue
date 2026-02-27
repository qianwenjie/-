<template>
  <div class="essay-question">
    <!-- 答题区域 -->
    <div class="answer-section">
      <div class="section-header">
        <div class="header-left">
          <van-icon name="edit" />
          <span>作答区域</span>
        </div>
        <div class="char-counter" :class="{ 'counter-active': charCount > 0 }">
          {{ charCount }} 字
        </div>
      </div>

      <div class="textarea-wrapper">
        <textarea
          :value="value.text || ''"
          @input="handleTextChange"
          @focus="isFocused = true"
          @blur="isFocused = false"
          placeholder="请在此输入你的答案..."
          class="essay-textarea"
          :class="{ 'textarea-focused': isFocused }"
          rows="8"
        ></textarea>
        <div class="textarea-border" :class="{ 'border-active': isFocused }"></div>
      </div>

      <div class="answer-tips">
        <van-icon name="info-o" />
        <span>答案将自动保存，请放心作答</span>
      </div>
    </div>

    <!-- 附件上传区域 -->
    <div class="attachment-section">
      <div class="section-header">
        <div class="header-left">
          <van-icon name="photo-o" />
          <span>附件上传</span>
          <span class="optional-tag">选填</span>
        </div>
        <span class="attachment-count">{{ attachments.length }}/5</span>
      </div>

      <!-- 已上传的附件列表 -->
      <div v-if="attachments.length > 0" class="attachment-list">
        <div
          v-for="(file, index) in attachments"
          :key="index"
          class="attachment-item"
        >
          <div class="file-preview">
            <img v-if="isImage(file.type)" :src="file.url" class="preview-image" />
            <div v-else class="file-icon-wrapper">
              <van-icon :name="getFileIcon(file.type)" />
            </div>
          </div>
          <div class="file-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-meta">{{ formatFileSize(file.size) }}</div>
          </div>
          <van-icon
            name="cross"
            class="delete-btn"
            @click="handleDeleteFile(index)"
          />
        </div>
      </div>

      <!-- 上传按钮 -->
      <van-uploader
        v-model="fileList"
        :max-count="5"
        :max-size="10 * 1024 * 1024"
        :after-read="handleFileRead"
        @oversize="handleOversize"
        multiple
      >
        <div class="upload-trigger" :class="{ 'trigger-disabled': attachments.length >= 5 }">
          <van-icon name="plus" />
          <span>{{ attachments.length >= 5 ? '已达上限' : '添加附件' }}</span>
          <span class="upload-hint">支持图片、PDF等，单个不超过10MB</span>
        </div>
      </van-uploader>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  value: {
    type: Object,
    default: () => ({ text: '', attachments: [] }),
  },
})

const emit = defineEmits(['update:value'])

const fileList = ref([])
const attachments = ref(props.value.attachments || [])
const isFocused = ref(false)

const charCount = computed(() => (props.value.text || '').length)

// 监听value变化，同步attachments
watch(() => props.value.attachments, (newVal) => {
  if (newVal) {
    attachments.value = newVal
  }
}, { immediate: true })

const handleTextChange = (e) => {
  const newValue = {
    text: e.target.value,
    attachments: attachments.value,
  }
  emit('update:value', newValue)
}

// 判断是否为图片
const isImage = (type) => {
  return type && type.startsWith('image/')
}

// 获取文件图标
const getFileIcon = (type) => {
  if (type.includes('pdf')) {
    return 'description'
  } else if (type.includes('word') || type.includes('document')) {
    return 'notes-o'
  } else if (type.includes('excel') || type.includes('sheet')) {
    return 'orders-o'
  } else {
    return 'description'
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) {
    return bytes + ' B'
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB'
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
}

// 文件读取完成
const handleFileRead = (file) => {
  if (Array.isArray(file)) {
    file.forEach(f => addAttachment(f.file))
  } else {
    addAttachment(file.file)
  }
  fileList.value = []
}

// 添加附件
const addAttachment = (file) => {
  const newAttachment = {
    name: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file),
    file: file,
  }

  attachments.value.push(newAttachment)

  const newValue = {
    text: props.value.text || '',
    attachments: attachments.value,
  }
  emit('update:value', newValue)

  showToast('附件添加成功')
}

// 删除附件
const handleDeleteFile = (index) => {
  attachments.value.splice(index, 1)

  const newValue = {
    text: props.value.text || '',
    attachments: attachments.value,
  }
  emit('update:value', newValue)

  showToast('附件已删除')
}

// 文件超出大小限制
const handleOversize = () => {
  showToast('文件大小不能超过 10MB')
}
</script>

<style scoped>
.essay-question {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 区域头部 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #1D2129;
}

.header-left .van-icon {
  font-size: 18px;
  color: #00B96B;
}

.optional-tag {
  font-size: 11px;
  font-weight: 400;
  color: #86909C;
  padding: 2px 6px;
  background: #F5F6F7;
  border-radius: 4px;
}

/* 字数统计 */
.char-counter {
  font-size: 13px;
  color: #C9CDD4;
  font-weight: 500;
  transition: color 0.2s ease;
}

.counter-active {
  color: #00B96B;
}

/* 文本域容器 */
.textarea-wrapper {
  position: relative;
}

.essay-textarea {
  width: 100%;
  padding: 16px;
  background: #FFFFFF;
  border: 2px solid #E5E6EB;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.7;
  color: #1D2129;
  resize: none;
  min-height: 180px;
  transition: all 0.3s ease;
  outline: none;
  font-family: inherit;
}

.essay-textarea::placeholder {
  color: #C9CDD4;
}

.textarea-focused {
  border-color: #00B96B;
  box-shadow: 0 4px 16px rgba(0, 185, 107, 0.12);
}

/* 答题提示 */
.answer-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #86909C;
  padding-left: 4px;
}

.answer-tips .van-icon {
  font-size: 14px;
  color: #3491FA;
}

/* 附件区域 */
.attachment-section {
  background: transparent;
  border-radius: 12px;
  padding: 16px;
}

.attachment-count {
  font-size: 13px;
  color: #86909C;
}

/* 附件列表 */
.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #FFFFFF;
  border: 1px solid #E5E6EB;
  border-radius: 10px;
  gap: 12px;
}

.file-preview {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
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
  font-size: 22px;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #FFFFFF;
  border: 2px dashed #D9D9D9;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-trigger:active {
  border-color: #00B96B;
  background: #E8F8F0;
}

.trigger-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-trigger .van-icon {
  font-size: 28px;
  color: #00B96B;
  margin-bottom: 8px;
}

.upload-trigger > span:first-of-type {
  font-size: 14px;
  color: #1D2129;
  font-weight: 500;
}

.upload-hint {
  font-size: 12px;
  color: #86909C;
  margin-top: 4px;
}

/* 隐藏 Vant 上传组件默认样式 */
.attachment-section :deep(.van-uploader) {
  display: block;
}

.attachment-section :deep(.van-uploader__wrapper) {
  display: block;
}

.attachment-section :deep(.van-uploader__input-wrapper) {
  display: block;
}
</style>
