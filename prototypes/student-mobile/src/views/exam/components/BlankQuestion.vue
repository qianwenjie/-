<template>
  <div class="blank-question">
    <div
      v-for="blank in question.blanks"
      :key="blank.id"
      class="blank-item"
    >
      <div class="blank-label">第 {{ blank.order }} 空：</div>
      <van-field
        :model-value="value[blank.id] || ''"
        @update:model-value="(val) => handleChange(blank.id, val)"
        placeholder="请输入答案"
        type="text"
        rows="1"
        autosize
        clearable
      />
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
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:value'])

const handleChange = (blankId, val) => {
  const newValue = { ...props.value, [blankId]: val }
  emit('update:value', newValue)
}
</script>

<style scoped>
.blank-question {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.blank-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.blank-label {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.van-field {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
}
</style>
