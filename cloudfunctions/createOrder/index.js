// 云函数：createOrder
// 顾客提交点单，写入 orders 集合；后台通过实时监听秒级收到
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const pad = n => (n < 10 ? '0' + n : '' + n)

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const items = Array.isArray(event.items) ? event.items : []
  const note = (event.note || '').trim().slice(0, 100)
  const nickName = (event.nickName || '宝贝').slice(0, 20)

  if (!items.length) {
    return { ok: false, msg: '订单是空的' }
  }

  // 校验并规整菜品，防止价格被篡改
  const cleaned = []
  for (const it of items) {
    const id = it.id
    if (!id) continue
    try {
      const doc = await db.collection('dishes').doc(id).get()
      const d = doc.data
      const count = Math.max(1, Math.min(99, parseInt(it.count) || 1))
      cleaned.push({
        id: d._id,
        name: d.name,
        price: d.price,
        count
      })
    } catch (e) {
      // 菜品不存在或被删除，跳过
    }
  }

  if (!cleaned.length) {
    return { ok: false, msg: '菜品不可用，请刷新后重试' }
  }

  const total = cleaned.reduce((s, it) => s + it.price * it.count, 0)
  const now = Date.now()
  const d = new Date(now)
  const orderNo = '' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
    pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()) +
    Math.floor(1000 + Math.random() * 9000)

  try {
    const res = await db.collection('orders').add({
      data: {
        _openid: OPENID,
        orderNo,
        items: cleaned,
        note,
        nickName,
        total: Math.round(total * 100) / 100,
        status: 0, // 0 待处理
        createdAt: now,
        updatedAt: now
      }
    })
    return { ok: true, orderId: res._id, orderNo }
  } catch (e) {
    console.error(e)
    return { ok: false, msg: '下单失败' }
  }
}