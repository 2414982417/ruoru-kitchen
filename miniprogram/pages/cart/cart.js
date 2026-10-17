Page({
  data: {
    cart: [],
    totalCount: 0,
    totalPrice: 0,
    note: ''
  },

  onShow() {
    this.loadCart()
  },

  loadCart() {
    const cart = wx.getStorageSync('cart') || []
    this.setData({ cart })
    this.compute()
  },

  compute() {
    const cart = this.data.cart
    const totalCount = cart.reduce((s, i) => s + i.count, 0)
    const totalPrice = cart.reduce((s, i) => s + i.count * i.price, 0)
    this.setData({ totalCount, totalPrice: totalPrice.toFixed(2) })
  },

  onMinus(e) {
    const { cart } = this.data
    const idx = e.currentTarget.dataset.index
    cart[idx].count -= 1
    if (cart[idx].count <= 0) cart.splice(idx, 1)
    this.setData({ cart })
    wx.setStorageSync('cart', cart)
    this.compute()
  },

  onPlus(e) {
    const { cart } = this.data
    const idx = e.currentTarget.dataset.index
    cart[idx].count += 1
    this.setData({ cart })
    wx.setStorageSync('cart', cart)
    this.compute()
  },

  onNote(e) {
    this.setData({ note: e.detail.value })
  },

  clearAll() {
    wx.showModal({
      title: '清空点单',
      content: '确定清空购物车吗？',
      success: res => {
        if (res.confirm) {
          wx.setStorageSync('cart', [])
          this.setData({ note: '' })
          this.loadCart()
        }
      }
    })
  },

  submit() {
    const { cart, note } = this.data
    if (!cart.length) {
      wx.showToast({ title: '还没有选择菜品', icon: 'none' })
      return
    }
    wx.showLoading({ title: '提交中...' })
    const app = getApp()
    wx.cloud.callFunction({
      name: 'createOrder',
      data: {
        items: cart,
        note,
        nickName: app.globalData.nickName
      }
    }).then(res => {
      wx.hideLoading()
      const r = res.result
      if (r && r.ok) {
        wx.setStorageSync('cart', [])
        this.setData({ note: '' })
        this.loadCart()
        wx.showModal({
          title: '下单成功 🎉',
          content: '订单号：' + r.orderNo + '\n已经推送到他的后台啦',
          showCancel: false,
          confirmText: '好的',
          success: () => wx.switchTab({ url: '/pages/orders/orders' })
        })
      } else {
        wx.showToast({ title: (r && r.msg) || '下单失败', icon: 'none' })
      }
    }).catch(err => {
      wx.hideLoading()
      console.error(err)
      wx.showToast({ title: '提交失败，请重试', icon: 'none' })
    })
  },

  goMenu() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})