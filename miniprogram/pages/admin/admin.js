const db = wx.cloud.database()
const app = getApp()

Page({
  data: {
    isAdmin: false,
    tab: 'orders',            // orders | dishes
    pendingOrders: [],
    historyOrders: [],
    orderToShow: 'pending',   // pending | history
    dishes: [],
    loadingOrders: true,
    loadingDishes: true
  },

  onLoad() {
    this.init()
  },

  async init() {
    if (!app.isReady()) await app.login()
    if (!app.globalData.isAdmin) {
      wx.showModal({ title: '无权限', content: '只有管理员能进入后台', showCancel: false })
      return
    }
    this.setData({ isAdmin: true })
    this.loadTodayOrders()
    this.loadDishes()
    this.subscribeRealtime()
  },

  onUnload() {
    if (this.watcher && this.watcher.close) this.watcher.close()
  },

  // 实时监听新订单，女朋友下单立刻弹出
  subscribeRealtime() {
    this.watcher = db.collection('orders').where({ status: 0 }).watch({
      onChange: snapshot => {
        const docs = (snapshot.docs || []).slice().sort((a, b) => b.createdAt - a.createdAt)
        this.setData({ pendingOrders: this.decorate(docs) })
        this.loadTodayOrders()
      },
      onError: err => {
        console.error('实时监听失败', err)
        // 降级：下拉刷新也能看到
      }
    })
  },

  decorate(orders) {
    const pad = n => (n < 10 ? '0' + n : '' + n)
    return (orders || []).map(o => {
      const total = (o.items || []).reduce((s, it) => s + it.count * it.price, 0)
      const d = new Date(o.createdAt)
      return {
        ...o,
        total: total.toFixed(2),
        timeText: pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
      }
    })
  },

  async loadTodayOrders() {
    try {
      const res = await db.collection('orders')
        .where({ status: db.command.neq(0) })
        .orderBy('createdAt', 'desc')
        .get()
      this.setData({ historyOrders: this.decorate(res.data) })
    } catch (e) {
      console.error(e)
    }
  },

  switchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab })
  },
  showPending() { this.setData({ orderToShow: 'pending' }) },
  showHistory() { this.setData({ orderToShow: 'history' }) },

  // 标记完成 / 取消
  setStatus(e) {
    const { id, status, no } = e.currentTarget.dataset
    const hint = status == 1 ? '确认这份订单已完成了吗？' : '取消这份订单？'
    wx.showModal({
      title: '处理订单',
      content: '单号 ' + no + '\n' + hint,
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({ name: 'updateOrderStatus', data: { orderId: id, status } })
            .then(r => {
              const rr = r.result
              if (rr && rr.ok) {
                wx.showToast({ title: status == 1 ? '已标记完成' : '已取消', icon: 'success' })
              } else {
                wx.showToast({ title: (rr && rr.msg) || '操作失败', icon: 'none' })
              }
            })
        }
      }
    })
  },

  async loadDishes() {
    this.setData({ loadingDishes: true })
    try {
      const res = await db.collection('dishes').orderBy('sort', 'asc').get()
      this.setData({ dishes: res.data })
    } catch (e) {
      console.error(e)
    }
    this.setData({ loadingDishes: false })
  },

  toggleDish(e) {
    const { id, available } = e.currentTarget.dataset
    wx.cloud.callFunction({ name: 'saveDish', data: { id, available: !available } })
      .then(r => {
        if (r.result && r.result.ok) this.loadDishes()
        else wx.showToast({ title: '操作失败', icon: 'none' })
      })
  },

  addDish() {
    wx.navigateTo({ url: '/pages/dish-form/dish-form' })
  },
  editDish(e) {
    wx.navigateTo({ url: '/pages/dish-form/dish-form?id=' + e.currentTarget.dataset.id })
  },
  deleteDish(e) {
    const { id, name } = e.currentTarget.dataset
    wx.showModal({
      title: '删除菜品',
      content: '确定删除「' + name + '」吗？',
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({ name: 'saveDish', data: { id, deleted: true } })
            .then(r => {
              if (r.result && r.result.ok) this.loadDishes()
              else wx.showToast({ title: '操作失败', icon: 'none' })
            })
        }
      }
    })
  },

  onPullDownRefresh() {
    Promise.all([this.loadDishes()]).then(() => wx.stopPullDownRefresh())
  }
})