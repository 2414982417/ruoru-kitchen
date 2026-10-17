// 云函数：addAdmin
// 首次调用（admins 集合为空）的人会成为管理员。
// 情侣项目里，谁先点一下「授权后台」谁就是老板。
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  const admins = db.collection('admins')

  try {
    const countRes = await admins.count()
    if (countRes.total === 0) {
      await admins.add({
        data: { openid: OPENID, createdAt: Date.now() }
      })
      return { ok: true, msg: '授权成功，你就是老板啦！' }
    }
    // 已经有人是管理员了，检查是否本人
    const chk = await admins.where({ openid: OPENID }).count()
    if (chk.total > 0) {
      return { ok: true, msg: '你本来就是老板哦' }
    }
    return { ok: false, msg: '已有管理员啦，只有第一个授权的人能当老板' }
  } catch (e) {
    console.error(e)
    return { ok: false, msg: '授权失败，请确认已创建 admins 集合' }
  }
}