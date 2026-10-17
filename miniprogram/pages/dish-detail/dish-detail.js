const db = wx.cloud.database()

Page({
  data: {
    id: '',
    dish: null,
    count: 1
  },

  onLoad(options) {
    this.setData({ id: options.id })
    this.loadDish()
  },

  async loadDish() {
    try {
      const res = await db.collection('dishes').doc(this.data.id).get()
      const dish = res.data
      dish.imgs = dish.imgs || []
      this.setData({ dish })
    } catch (e) {
      wx.showToast({ title: '菜品不存在', icon: 'none' })
    }
  },

  onMinus() { if (this.data.count > 1) this.setData({ count: this.data.count - 1 }) },
  onPlus() { this.setData({ count: this.data.count + 1 }) },

  onSwiperImg(e) {
    const src = e.currentTarget.dataset.src
    wx.previewImage({ urls: this.data.dish.imgs, current: src })
  },

  addToCart() {
    const d = this.data.dish
    const cart = wx.getStorageSync('cart') || []
    const idx = cart.findIndex(i => i.id === d._id)
    const count = this.data.count
    if (idx > -1) cart[idx].count += count
    else cart.push({ id: d._id, name: d.name, price: d.price, img: (d.imgs && d.imgs[0]) || '', count })
    wx.setStorageSync('cart', cart)
    wx.showToast({ title: '已加入点单', icon: 'success' })
    setTimeout(() => wx.switchTab({ url: '/pages/cart/cart' }), 500)
  }
})