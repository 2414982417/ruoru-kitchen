// app.js
App({
  globalData: {
    openid: '',
    nickName: '用户',
    isAdmin: false
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      // 这里改为你的云开发环境 ID（导入后在开发者工具云开发面板中查看）
      env: 'YOUR-ENV-ID',
      traceUser: true
    })
    // 登录并获取身份
    this.login()
  },

  // 登录：获取 openid，并判断是否管理员
  login() {
    return wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      const data = res.result || {}
      this.globalData.openid = data.openid || ''
      this.globalData.isAdmin = !!data.isAdmin
      this.globalData.nickName = data.nickName || '用户'
      return data
    }).catch(err => {
      console.error('登录失败', err)
      return null
    })
  },

  isReady() {
    return !!this.globalData.openid
  }
})