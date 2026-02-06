<template>
  <div class="single-choice">
    <div
      v-for="option in question.options"
      :key="option.label"
      class="option-row"
      :class="{ 'option-selected': isSelected(option.label) }"
      @click="selectOption(option.label)"
    >
      <div class="option-label" :class="{ 'label-selected': isSelected(option.label) }">
        {{ option.label }}
      </div>
      <div class="option-text">{{ option.text }}</div>
      <van-icon v-if="isSelected(option.label)" name="success" class="check-icon" />
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

const isSelected = (label) => props.value === label

const selectOption = (label) => {
  emit('update:value', label)
}
</script>

<style scoped>
.single-choice {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-row {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: #F7F8FA;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 12px;
}

.option-row:active {
  transform: scale(0.98);
  background: #F0F1F3;
}

.option-selected {
  background: #E8F8F0;
}

.option-label {
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

.label-selected {
  background: #00B96B;
  color: #FFFFFF;
}

.option-text {
  flex: 1;
  font-size: 15px;
  line-height: 1.5;
  color: #1D2129;
}

.check-icon {
  flex-shrink: 0;
  color: #00B96B;
  font-size: 18px;
}
</style>
