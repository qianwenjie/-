import axios from 'axios'
import { showToast } from 'vant'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data

    // 成功响应
    if (code === 200 || code === 0) {
      return data
    }

    // 业务错误
    showToast({
      message: message || '请求失败',
      type: 'fail',
    })
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error) => {
    // 网络错误
    if (!navigator.onLine) {
      showToast({
        message: '网络连接失败，请检查网络设置',
        type: 'fail',
      })
    } else if (error.response) {
      const { status } = error.response
      const errorMap = {
        401: '未授权，请重新登录',
        403: '拒绝访问',
        404: '请求资源不存在',
        500: '服务器错误',
        502: '网关错误',
        503: '服务不可用',
      }
      showToast({
        message: errorMap[status] || '请求失败',
        type: 'fail',
      })
    } else {
      showToast({
        message: error.message || '请求超时',
        type: 'fail',
      })
    }
    return Promise.reject(error)
  }
)

export default request
