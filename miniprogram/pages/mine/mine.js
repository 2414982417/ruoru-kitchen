const app = getApp()

Page({
  data: {
    nickName: '用户',
    avatar: '',
    isAdmin: false
  },

  onShow() {
    this.sync()
  },

  async sync() {
    const app2 = app
    if (!app2.isReady()) {
      await app2.login()
    }
    this.setData({
      nickName: app2.globalData.nickName,
      isAdmin: app2.globalData.isAdmin
    })
  },

  goAdmin() {
    if (this.data.isAdmin) {
      wx.navigateTo({ url: '/pages/admin/admin' })
    } else {
      wx.showToast({ title: '暂无后台权限', icon: 'none' })
    }
  },

  goOrders() {
    wx.switchTab({ url: '/pages/orders/orders' })
  },

  // 首次授权成为管理员（谁是第一个点这个的，谁就是老板）
  becomeAdmin() {
    wx.showModal({
      title: '授权为老板',
      content: '这是情侣专属入口：第一个点确定的人会成为管理员，负责后台接单和上菜。TA点了的话可就抢不到啦，确定吗？',
      confirmText: '我要当老板',
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({ name: 'addAdmin' }).then(r => {
            const rr = r.result || {}
            if (rr.ok) {
              app.login().then(() => this.sync())
              wx.showToast({ title: rr.msg || '授权成功', icon: 'success' })
            } else {
              wx.showModal({ title: '抢不到啦', content: rr.msg || '已有老板了', showCancel: false })
            }
          })
        }
      }
    })
  }
})