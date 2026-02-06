<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 登录内容 -->
    <div class="login-content">
      <!-- Logo 和标题 -->
      <div class="login-header">
        <div class="logo">
          <van-icon name="edit" size="48" color="#00B96B" />
        </div>
        <h1 class="title">在线考试系统</h1>
        <p class="subtitle">学生端</p>
      </div>

      <!-- 登录表单 -->
      <div class="login-form">
        <van-form @submit="onSubmit">
          <van-cell-group inset>
            <van-field
              v-model="formData.username"
              name="username"
              label=""
              placeholder="请输入用户名/学号"
              :rules="[{ required: true, message: '请输入用户名' }]"
              clearable
              left-icon="user-o"
              size="large"
            />
            <van-field
              v-model="formData.password"
              type="password"
              name="password"
              label=""
              placeholder="请输入密码"
              :rules="[{ required: true, message: '请输入密码' }]"
              clearable
              left-icon="lock"
              size="large"
            />
          </van-cell-group>

          <!-- 记住密码 -->
          <div class="form-options">
            <van-checkbox v-model="rememberMe" shape="square" icon-size="16px">
              记住密码
            </van-checkbox>
            <a class="forgot-link" @click="handleForgotPassword">忘记密码？</a>
          </div>

          <!-- 登录按钮 -->
          <div class="form-actions">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="loading"
              loading-text="登录中..."
              size="large"
            >
              登 录
            </van-button>
          </div>
        </van-form>

      </div>

      <!-- 底部信息 -->
      <div class="login-footer">
        <p>登录即表示同意 <a @click="showAgreement">《用户协议》</a> 和 <a @click="showPrivacy">《隐私政策》</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { showToast, showDialog } from 'vant'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const formData = ref({
  username: '',
  password: '',
})

// 记住密码
const rememberMe = ref(false)

// 加载状态
const loading = ref(false)

// 提交登录
const onSubmit = async () => {
  loading.value = true

  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟验证（实际应调用后端接口）
    if (formData.value.username && formData.value.password) {
      // 模拟用户信息
      const userInfo = {
        id: 'user001',
        username: formData.value.username,
        name: '张三',
        studentId: '2024001',
        className: '计算机科学与技术2024级1班',
        avatar: '',
      }

      // 保存用户信息和 token
      userStore.setUserInfo(userInfo)
      userStore.setToken('mock_token_' + Date.now())

      // 记住密码
      if (rememberMe.value) {
        localStorage.setItem('rememberedUsername', formData.value.username)
      } else {
        localStorage.removeItem('rememberedUsername')
      }

      showToast({
        type: 'success',
        message: '登录成功',
        duration: 1000,
      })

      // 跳转到考试列表
      setTimeout(() => {
        router.replace('/exam/list')
      }, 1000)
    } else {
      showToast('用户名或密码错误')
    }
  } catch (error) {
    showToast('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

// 忘记密码
const handleForgotPassword = () => {
  showDialog({
    title: '忘记密码',
    message: '请联系管理员重置密码\n联系电话：400-123-4567',
    confirmButtonText: '我知道了',
  })
}

// 用户协议
const showAgreement = () => {
  showDialog({
    title: '用户协议',
    message: '用户协议内容...',
    confirmButtonText: '关闭',
  })
}

// 隐私政策
const showPrivacy = () => {
  showDialog({
    title: '隐私政策',
    message: '隐私政策内容...',
    confirmButtonText: '关闭',
  })
}

// 初始化
onMounted(() => {
  // 恢复记住的用户名
  const rememberedUsername = localStorage.getItem('rememberedUsername')
  if (rememberedUsername) {
    formData.value.username = rememberedUsername
    rememberMe.value = true
  }

  // 如果已登录，直接跳转
  if (userStore.isLoggedIn) {
    router.replace('/exam/list')
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #E6F7F0 0%, #FFFFFF 50%, #F0F9FF 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: #00B96B;
  top: -100px;
  right: -100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  background: #165DFF;
  bottom: 100px;
  left: -80px;
}

.circle-3 {
  width: 150px;
  height: 150px;
  background: #00B96B;
  bottom: -50px;
  right: 50px;
}

/* 登录内容 */
.login-content {
  position: relative;
  z-index: 1;
  padding: 60px 24px 40px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 头部 */
.login-header {
  text-align: center;
  margin-bottom: 48px;
}

.logo {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(0, 185, 107, 0.15);
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #1D2129;
  margin: 0 0 8px;
}

.subtitle {
  font-size: 14px;
  color: #86909C;
  margin: 0;
}

/* 表单 */
.login-form {
  flex: 1;
}

.login-form :deep(.van-cell-group--inset) {
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.login-form :deep(.van-field) {
  padding: 16px;
}

.login-form :deep(.van-field__left-icon) {
  margin-right: 12px;
  color: #86909C;
}

.login-form :deep(.van-field__control) {
  font-size: 16px;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 4px;
}

.form-options :deep(.van-checkbox__label) {
  font-size: 14px;
  color: #4E5969;
}

.forgot-link {
  font-size: 14px;
  color: #00B96B;
  cursor: pointer;
}

/* 登录按钮 */
.form-actions {
  margin-top: 32px;
}

.form-actions :deep(.van-button--primary) {
  background: linear-gradient(135deg, #00B96B 0%, #00A65D 100%);
  border: none;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 185, 107, 0.3);
}

/* 底部 */
.login-footer {
  text-align: center;
  padding-top: 32px;
}

.login-footer p {
  font-size: 12px;
  color: #86909C;
  margin: 0;
}

.login-footer a {
  color: #00B96B;
  cursor: pointer;
}
</style>
