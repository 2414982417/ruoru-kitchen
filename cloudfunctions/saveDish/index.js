// 云函数：saveDish
// 管理员新增 / 编辑 / 上下架 / 删除菜品
// 通过存放在云存储的 fileID 引用图片（imgs）
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

  const { id, deleted } = event

  // 删除
  if (deleted && id) {
    try {
      await db.collection('dishes').doc(id).remove()
      return { ok: true }
    } catch (e) {
      return { ok: false, msg: '删除失败' }
    }
  }

  // 上下架（仅改 available）
  if (event.hasOwnProperty('available') && id && !event.name) {
    try {
      await db.collection('dishes').doc(id).update({
        data: { available: !!event.available, updatedAt: Date.now() }
      })
      return { ok: true }
    } catch (e) {
      return { ok: false, msg: '更新失败' }
    }
  }

  const name = (event.name || '').trim()
  if (!name) return { ok: false, msg: '菜名为空' }
  const price = Math.round((parseFloat(event.price) || 0) * 100) / 100
  if (price < 0) return { ok: false, msg: '价格非法' }

  const payload = {
    name,
    price,
    category: (event.category || '').trim(),
    desc: (event.desc || '').trim(),
    imgs: Array.isArray(event.imgs) ? event.imgs.slice(0, 9) : [],
    available: event.available !== false,
    updatedAt: Date.now()
  }

  try {
    if (id) {
      await db.collection('dishes').doc(id).update({ data: payload })
    } else {
      payload.sort = Date.now()
      payload.createdAt = Date.now()
      await db.collection('dishes').add({ data: payload })
    }
    return { ok: true }
  } catch (e) {
    console.error(e)
    return { ok: false, msg: '保存失败' }
  }
}