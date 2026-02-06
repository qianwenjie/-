<template>
  <div class="judge-question">
    <div
      class="judge-option"
      :class="{ 'option-selected correct': value === 'true' }"
      @click="handleSelect('true')"
    >
      <div class="option-icon correct-icon">
        <van-icon name="success" />
      </div>
      <span class="option-text">正确</span>
      <van-icon v-if="value === 'true'" name="checked" class="check-icon" />
    </div>
    <div
      class="judge-option"
      :class="{ 'option-selected wrong': value === 'false' }"
      @click="handleSelect('false')"
    >
      <div class="option-icon wrong-icon">
        <van-icon name="cross" />
      </div>
      <span class="option-text">错误</span>
      <van-icon v-if="value === 'false'" name="checked" class="check-icon" />
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

const handleSelect = (val) => {
  emit('update:value', val)
}
</script>

<style scoped>
.judge-question {
  display: flex;
  gap: 12px;
}

.judge-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  background: #F7F8FA;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 10px;
}

.judge-option:active {
  transform: scale(0.96);
}

.option-selected.correct {
  background: #E8F8F0;
}

.option-selected.wrong {
  background: #FFF1F0;
}

.option-icon {
  width: 48px;
  height: 48px;
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

.option-selected.correct .correct-icon {
  background: #00B96B;
  color: #FFFFFF;
}

.option-selected.wrong .wrong-icon {
  background: #F53F3F;
  color: #FFFFFF;
}

.option-icon .van-icon {
  font-size: 24px;
}

.option-text {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
}

.check-icon {
  font-size: 20px;
}

.option-selected.correct .check-icon {
  color: #00B96B;
}

.option-selected.wrong .check-icon {
  color: #F53F3F;
}
</style>
