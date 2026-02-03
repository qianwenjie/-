import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'

// 导入全局样式
import './styles/index.css'

// 导入 rem 适配
import './utils/rem'

// 导入 Vant 样式
import 'vant/lib/index.css'

const app = createApp(App)

app.use(router)
app.use(pinia)

app.mount('#app')
