// utils/util.js
const pad = n => (n < 10 ? '0' + n : '' + n)

// 生成订单号：日期时间 + 4位随机
function makeOrderNo() {
  const d = new Date()
  const s =
    '' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
    pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds())
  return s + Math.floor(1000 + Math.random() * 9000)
}

// 格式化时间戳为“MM-DD HH:mm”
function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

// 金额展示（分转元，保留2位）
function formatPrice(cent) {
  return (parseInt(cent || 0) / 100).toFixed(2)
}

module.exports = {
  makeOrderNo,
  formatTime,
  formatPrice
}