<template>
  <div class="blank-question">
    <div
      v-for="blank in question.blanks"
      :key="blank.id"
      class="blank-item"
    >
      <div class="blank-header">
        <span class="blank-num">第 {{ blank.order }} 空</span>
        <span v-if="value[blank.id]" class="filled-tag">
          <van-icon name="passed" /> 已填
        </span>
      </div>
      <div class="input-wrapper">
        <input
          :value="value[blank.id] || ''"
          @input="(e) => handleChange(blank.id, e.target.value)"
          placeholder="请输入答案"
          class="blank-input"
          type="text"
        />
        <van-icon
          v-if="value[blank.id]"
          name="clear"
          class="clear-btn"
          @click="handleChange(blank.id, '')"
        />
      </div>
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
  border: none;
  border-radius: 8px;
  font-size: 15px;
  color: #1D2129;
  outline: none;
  transition: all 0.2s ease;
}

.blank-input:focus {
  background: #FFFFFF;
  box-shadow: 0 0 0 2px #00B96B;
}

.blank-input::placeholder {
  color: #C9CDD4;
}

.clear-btn {
  position: absolute;
  right: 12px;
  font-size: 18px;
  color: #C9CDD4;
  cursor: pointer;
}

.clear-btn:active {
  color: #86909C;
}
</style>
