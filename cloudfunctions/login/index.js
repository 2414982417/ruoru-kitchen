// 云函数：login
// 返回当前用户的 openid、昵称，以及是否为管理员
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  let isAdmin = false
  try {
    const res = await db.collection('admins').where({ openid: OPENID }).count()
    isAdmin = res.total > 0
  } catch (e) {
    console.log('查询admins失败', e)
  }

  return {
    openid: OPENID,
    isAdmin,
    nickName: '宝贝' // 可在后续扩展为可编辑昵称
  }
}