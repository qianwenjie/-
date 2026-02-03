<template>
  <div class="single-choice">
    <van-radio-group :model-value="value" @update:model-value="handleChange">
      <div
        v-for="option in question.options"
        :key="option.label"
        class="option-item"
      >
        <van-radio :name="option.label" icon-size="20px">
          <div class="option-content">
            <span class="option-label">{{ option.label }}.</span>
            <span class="option-text">{{ option.text }}</span>
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
.single-choice {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.option-item:has(.van-radio--checked) {
  background: #E8F9F0;
  border-color: #00B96B;
}

.option-content {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.option-label {
  font-weight: 600;
  color: #1d2129;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  color: #4e5969;
  line-height: 1.6;
}
</style>
