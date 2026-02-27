<template>
  <div class="judge-question">
    <div
      class="judge-row"
      :class="{ 'row-selected correct': value === 'true' }"
      @click="handleSelect('true')"
    >
      <div class="row-icon correct-icon">
        <van-icon name="success" />
      </div>
      <span class="row-text">正确</span>
    </div>
    <div
      class="judge-row"
      :class="{ 'row-selected wrong': value === 'false' }"
      @click="handleSelect('false')"
    >
      <div class="row-icon wrong-icon">
        <van-icon name="cross" />
      </div>
      <span class="row-text">错误</span>
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
</style>
