<template>
  <div class="essay-question">
    <van-field
      :model-value="value"
      @update:model-value="handleChange"
      type="textarea"
      placeholder="请输入答案..."
      rows="8"
      autosize
      show-word-limit
      :maxlength="2000"
    />
    <div class="tips">
      <van-icon name="info-o" />
      <span>答案将自动保存，请放心作答</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  value: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:value'])

const handleChange = (value) => {
  emit('update:value', value)
}
</script>

<style scoped>
.essay-question {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.van-field {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
}

.tips {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #86909c;
}

.tips .van-icon {
  color: #165DFF;
}
</style>
