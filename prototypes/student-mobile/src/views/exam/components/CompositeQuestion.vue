<template>
  <div class="composite-question">
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
            <span class="sub-indicator">第 {{ currentSubIndex + 1 }} 小题</span>
            <span class="sub-total">共 {{ question.subQuestions.length }} 题</span>
          </div>
          <div class="top-progress">
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
        </div>

        <!-- 子题内容区域 -->
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

            <!-- 子题类型标签 + 分值 -->
            <div class="sub-meta">
              <van-tag :type="getSubTypeColor(subQuestion.type)" size="medium">
                {{ getSubTypeName(subQuestion.type) }}
              </van-tag>
              <span class="sub-score">{{ subQuestion.score }}分</span>
            </div>

            <!-- 根据子题类型渲染答题区域 -->
            <div class="sub-answer-area">
              <!-- 单选题 -->
              <div v-if="subQuestion.type === 'single'" class="options-list">
                <div
                  v-for="option in subQuestion.options"
                  :key="option.label"
                  class="option-item"
                  :class="{ 'option-selected': isSelected(subQuestion.id, option.label) }"
                  @click="selectOption(subQuestion.id, option.label)"
                >
                  <div class="option-badge">{{ option.label }}</div>
                  <div class="option-text">{{ option.text }}</div>
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
                  class="option-item multi-option"
                  :class="{ 'option-selected': isMultiSelected(subQuestion.id, option.label) }"
                  @click="toggleMultiOption(subQuestion.id, option.label)"
                >
                  <div class="checkbox-indicator" :class="{ 'checkbox-checked': isMultiSelected(subQuestion.id, option.label) }">
                    <van-icon v-if="isMultiSelected(subQuestion.id, option.label)" name="success" />
                  </div>
                  <div class="option-label">{{ option.label }}</div>
                  <div class="option-text">{{ option.text }}</div>
                </div>
              </div>

              <!-- 判断题 -->
              <div v-else-if="subQuestion.type === 'judge'" class="judge-area">
                <div
                  class="judge-row"
                  :class="{ 'row-selected correct': value[subQuestion.id] === 'true' }"
                  @click="selectOption(subQuestion.id, 'true')"
                >
                  <div class="row-icon correct-icon">
                    <van-icon name="success" />
                  </div>
                  <span class="row-text">正确</span>
                </div>
                <div
                  class="judge-row"
                  :class="{ 'row-selected wrong': value[subQuestion.id] === 'false' }"
                  @click="selectOption(subQuestion.id, 'false')"
                >
                  <div class="row-icon wrong-icon">
                    <van-icon name="cross" />
                  </div>
                  <span class="row-text">错误</span>
                </div>
              </div>

              <!-- 填空题 -->
              <div v-else-if="subQuestion.type === 'blank'" class="blank-area">
                <div
                  v-for="(blank, bIdx) in subQuestion.blanks"
                  :key="blank.id"
                  class="blank-item"
                >
                  <div class="blank-header">
                    <span class="blank-num">第 {{ blank.order }} 空</span>
                    <span v-if="getBlankValue(subQuestion.id, blank.id)" class="filled-tag">
                      <van-icon name="passed" /> 已填
                    </span>
                  </div>
                  <div v-if="subQuestion.blankHints && subQuestion.blankHints[bIdx]" class="blank-hint">
                    {{ subQuestion.blankHints[bIdx] }}
                  </div>
                  <div class="input-wrapper">
                    <input
                      :value="getBlankValue(subQuestion.id, blank.id)"
                      @input="(e) => handleBlankChange(subQuestion.id, blank.id, e.target.value)"
                      placeholder="请输入答案"
                      class="blank-input"
                      type="text"
                    />
                    <van-icon
                      v-if="getBlankValue(subQuestion.id, blank.id)"
                      name="clear"
                      class="clear-input-btn"
                      @click="handleBlankChange(subQuestion.id, blank.id, '')"
                    />
                  </div>
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

        <!-- 底部导航 -->
        <div class="panel-nav">
          <van-button
            class="nav-btn"
            :disabled="currentSubIndex === 0"
            @click="prevSub"
          >
            <van-icon name="arrow-left" />
            上一题
          </van-button>

          <div class="nav-indicator">
            {{ currentSubIndex + 1 }} / {{ question.subQuestions.length }}
          </div>

          <van-button
            v-if="currentSubIndex < question.subQuestions.length - 1"
            class="nav-btn nav-btn-primary"
            @click="nextSub"
          >
            下一题
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

const emit = defineEmits(['update:value'])

// 面板显示状态
const panelVisible = ref(false)

// 当前子题索引
const currentSubIndex = ref(0)

// 临时文件列表（用于上传组件）
const tempFileList = ref([])

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

// 获取子题类型名称
const getSubTypeName = (type) => {
  const nameMap = {
    single: '单选',
    multiple: '多选',
    judge: '判断',
    blank: '填空',
    essay: '简答',
  }
  return nameMap[type] || type
}

// 获取子题类型颜色
const getSubTypeColor = (type) => {
  const colorMap = {
    single: 'primary',
    multiple: 'success',
    judge: 'warning',
    blank: 'danger',
    essay: 'default',
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
  if (type === 'blank') {
    // 填空题：answer 是 { blankId: value } 对象，至少有一个空填了
    if (typeof answer === 'object' && !Array.isArray(answer)) {
      return Object.values(answer).some(v => v && String(v).trim())
    }
    return false
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

// 获取填空题某个空的值
const getBlankValue = (subQuestionId, blankId) => {
  const answer = props.value[subQuestionId]
  if (!answer || typeof answer !== 'object') return ''
  return answer[blankId] || ''
}

// 填空题输入
const handleBlankChange = (subQuestionId, blankId, val) => {
  const currentAnswer = props.value[subQuestionId] || {}
  const newSubAnswer = { ...currentAnswer, [blankId]: val }
  const newValue = { ...props.value, [subQuestionId]: newSubAnswer }
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

// 暴露给父组件的方法
const showPanel = () => {
  panelVisible.value = true
}

const openAtBlank = (index) => {
  currentSubIndex.value = index
  panelVisible.value = true
}

defineExpose({ showPanel, openAtBlank })
</script>

<style scoped>
.composite-question {
  position: relative;
}

/* 覆盖 van-popup 溢出裁切，让页签可以突出 */
.composite-question :deep(.van-popup) {
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

.sub-indicator {
  font-size: 20px;
  font-weight: 700;
  color: #00B96B;
}

.sub-total {
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

/* 内容区域 */
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.sub-question-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 子题题干 */
.sub-stem {
  display: flex;
  gap: 8px;
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

/* 子题元信息 */
.sub-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sub-score {
  font-size: 14px;
  font-weight: 600;
  color: #F77234;
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

/* 判断题区域 */
.judge-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.judge-row {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: #F7F8FA;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 12px;
}

.judge-row:active {
  transform: scale(0.98);
  background: #F0F1F3;
}

.row-selected.correct {
  background: #E8F8F0;
}

.row-selected.wrong {
  background: #FFF1F0;
}

.row-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.correct-icon {
  background: #D1FAE5;
  color: #00B96B;
}

.wrong-icon {
  background: #FEE2E2;
  color: #F53F3F;
}

.row-selected.correct .correct-icon {
  background: #00B96B;
  color: #FFFFFF;
}

.row-selected.wrong .wrong-icon {
  background: #F53F3F;
  color: #FFFFFF;
}

.row-icon .van-icon {
  font-size: 14px;
}

.row-text {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
}

/* 填空题区域 */
.blank-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.blank-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.blank-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.blank-num {
  font-size: 14px;
  font-weight: 600;
  color: #1D2129;
}

.blank-hint {
  font-size: 14px;
  line-height: 1.6;
  color: #4E5969;
  padding: 8px 12px;
  background: #F7F8FA;
  border-radius: 8px;
  border-left: 3px solid #00B96B;
}

.filled-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #00B96B;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.blank-input {
  width: 100%;
  padding: 12px 40px 12px 14px;
  background: #F7F8FA;
  border: 2px solid #E5E6EB;
  border-radius: 10px;
  font-size: 15px;
  color: #1D2129;
  outline: none;
  transition: all 0.2s ease;
}

.blank-input:focus {
  background: #FFFFFF;
  border-color: #00B96B;
  box-shadow: 0 0 0 2px rgba(0, 185, 107, 0.15);
}

.blank-input::placeholder {
  color: #C9CDD4;
}

.clear-input-btn {
  position: absolute;
  right: 12px;
  font-size: 18px;
  color: #C9CDD4;
  cursor: pointer;
}

.clear-input-btn:active {
  color: #86909C;
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

/* 多选复选框 */
.checkbox-indicator {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 2px solid #C9CDD4;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox-checked {
  background: #00B96B;
  border-color: #00B96B;
}

.checkbox-indicator .van-icon {
  color: #FFFFFF;
  font-size: 12px;
}

.option-label {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  color: #4E5969;
  min-width: 16px;
}

.option-selected .option-label {
  color: #00B96B;
}

.multi-option.option-selected {
  background: #E8F8F0;
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
  border-color: #00B96B;
  box-shadow: 0 4px 12px rgba(0, 185, 107, 0.1);
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
  border-color: #00B96B;
  background: #E8F5EE;
}

.trigger-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-trigger .van-icon {
  font-size: 18px;
  color: #00B96B;
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
