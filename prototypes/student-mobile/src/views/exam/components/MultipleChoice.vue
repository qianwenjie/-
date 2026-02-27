<template>
  <div class="multiple-choice">
    <div class="hint-bar">
      <van-icon name="info-o" />
      <span>本题为多选题，可选择多个答案</span>
    </div>
    <div
      v-for="option in question.options"
      :key="option.label"
      class="option-row"
      :class="{ 'option-selected': isSelected(option.label) }"
      @click="toggleOption(option.label)"
    >
      <div class="checkbox" :class="{ 'checkbox-checked': isSelected(option.label) }">
        <van-icon v-if="isSelected(option.label)" name="success" />
      </div>
      <div class="option-label">{{ option.label }}</div>
      <div class="option-text">{{ option.text }}</div>
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
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:value'])

const isSelected = (label) => props.value.includes(label)

const toggleOption = (label) => {
  const newValue = [...props.value]
  const index = newValue.indexOf(label)
  if (index > -1) {
    newValue.splice(index, 1)
  } else {
    newValue.push(label)
  }
  emit('update:value', newValue)
}
</script>

<style scoped>
.multiple-choice {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hint-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #FFF7E6;
  border-radius: 6px;
  font-size: 13px;
  color: #D46B08;
  margin-bottom: 4px;
}

.option-row {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: #F7F8FA;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 10px;
}

.option-row:active {
  transform: scale(0.98);
  background: #F0F1F3;
}

.option-selected {
  background: #E8F8F0;
}

.checkbox {
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

.checkbox .van-icon {
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

.option-text {
  flex: 1;
  font-size: 15px;
  line-height: 1.5;
  color: #1D2129;
}
</style>
