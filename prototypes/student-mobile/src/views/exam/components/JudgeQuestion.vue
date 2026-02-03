<template>
  <div class="judge-question">
    <van-radio-group :model-value="value" @update:model-value="handleChange">
      <div class="option-item">
        <van-radio name="true" icon-size="24px">
          <div class="option-content">
            <van-icon name="success" color="#00B96B" size="24" />
            <span class="option-text">正确</span>
          </div>
        </van-radio>
      </div>
      <div class="option-item">
        <van-radio name="false" icon-size="24px">
          <div class="option-content">
            <van-icon name="cross" color="#F53F3F" size="24" />
            <span class="option-text">错误</span>
          </div>
        </van-radio>
      </div>
    </van-radio-group>
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
.judge-question {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-item {
  padding: 20px;
  background: #f7f8fa;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.option-item:has(.van-radio--checked) {
  background: #E8F9F0;
  border-color: #00B96B;
}

.option-content {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.option-text {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}
</style>
