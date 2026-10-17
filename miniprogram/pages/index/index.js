const db = wx.cloud.database()

Page({
  data: {
    loading: true,
    categories: [],
    activeCategory: '全部',
    dishes: [],
    cartCount: 0,
    colors: ['#f6b267', '#f29d8e', '#8ec5a0', '#8fb7e0', '#d0a6e0', '#e0c58f']
  },

  onLoad() {
    this.loadMenu()
    this.refreshCartCount()
  },

  onShow() {
    this.refreshCartCount()
  },

  onPullDownRefresh() {
    this.loadMenu(() => wx.stopPullDownRefresh())
  },

  async loadMenu(done) {
    this.setData({ loading: true })
    try {
      const res = await db.collection('dishes').where({ available: true }).orderBy('sort', 'asc').get()
      const dishes = res.data
      const categories = ['全部', ...Array.from(new Set(dishes.map(d => d.category).filter(Boolean)))]
      this.setData({ categories, dishes })
      this.applyFilter()
    } catch (e) {
      console.error(e)
      wx.showToast({ title: '菜单加载失败', icon: 'none' })
    }
    this.setData({ loading: false })
    done && done()
  },

  applyFilter() {
    const { activeCategory, dishes } = this.data
    const list = activeCategory === '全部' ? dishes : dishes.filter(d => d.category === activeCategory)
    this.setData({ list })
  },

  onCategory(e) {
    const name = e.currentTarget.dataset.name
    this.setData({ activeCategory: name })
    this.applyFilter()
  },

  refreshCartCount() {
    const cart = wx.getStorageSync('cart') || []
    const count = cart.reduce((s, i) => s + i.count, 0)
    this.setData({ cartCount: count })
  },

  addToCart(e) {
    const dish = e.currentTarget.dataset.dish
    const cart = wx.getStorageSync('cart') || []
    const idx = cart.findIndex(i => i.id === dish._id)
    if (idx > -1) {
      cart[idx].count += 1
    } else {
      cart.push({
        id: dish._id,
        name: dish.name,
        price: dish.price,
        img: (dish.imgs && dish.imgs[0]) || '',
        count: 1
      })
    }
    wx.setStorageSync('cart', cart)
    this.refreshCartCount()
    wx.showToast({ title: '已加入点单', icon: 'success' })
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/dish-detail/dish-detail?id=' + id })
  },

  goCart() {
    wx.switchTab({ url: '/pages/cart/cart' })
  }
})