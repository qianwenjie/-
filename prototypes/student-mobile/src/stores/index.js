import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 导出所有 store
export { useExamStore } from './exam'
export { useAnswerStore } from './answer'
export { useUserStore } from './user'
export { usePracticeStore } from './practice'
export { useMessageStore } from './message'
