// 云函数：updateOrderStatus
// 管理员标记订单完成(1) 或取消(2)；0 是待处理
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function isAdmin(openid) {
  const res = await db.collection('admins').where({ openid }).count()
  return res.total > 0
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()

  if (!(await isAdmin(OPENID))) {
    return { ok: false, msg: '没有权限' }
  }

  const { orderId, status } = event
  if (!orderId || ![1, 2].includes(status)) {
    return { ok: false, msg: '参数错误' }
  }

  try {
    await db.collection('orders').doc(orderId).update({
      data: { status, updatedAt: Date.now() }
    })
    return { ok: true }
  } catch (e) {
    console.error(e)
    return { ok: false, msg: '操作失败' }
  }
}