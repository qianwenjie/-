/**
 * rem 适配方案
 * 设计稿宽度: 375px
 * 基准字体: 37.5px (375 / 10)
 */

const baseSize = 37.5

function setRem() {
  const scale = document.documentElement.clientWidth / 375
  const fontSize = baseSize * Math.min(scale, 2)
  document.documentElement.style.fontSize = fontSize + 'px'
}

// 初始化
setRem()

// 窗口大小改变时重新计算
window.addEventListener('resize', setRem)
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    setRem()
  }
})
