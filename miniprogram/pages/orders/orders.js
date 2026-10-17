const db = wx.cloud.database()
const app = getApp()

Page({
  data: {
    orders: [],
    loading: true
  },

  onShow() {
    this.ensureLoginAndLoad()
  },

  async ensureLoginAndLoad() {
    if (!app.isReady()) {
      await app.login()
    }
    // 顾客只能看到自己（_openid 匹配）的订单
    const _ = db.command
    this.loadOrders()
  },

  async loadOrders() {
    this.setData({ loading: true })
    try {
      const res = await db.collection('orders')
        .where({ _openid: app.globalData.openid })
        .orderBy('createdAt', 'desc')
        .get()
      const orders = (res.data || []).map(o => {
        const total = (o.items || []).reduce((s, it) => s + it.count * it.price, 0)
        const d = new Date(o.createdAt)
        const pad = n => (n < 10 ? '0' + n : '' + n)
        return {
          ...o,
          total: total.toFixed(2),
          timeText: pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
        }
      })
      this.setData({ orders })
    } catch (e) {
      console.error(e)
    }
    this.setData({ loading: false })
  },

  onPullDownRefresh() {
    this.loadOrders().then(() => wx.stopPullDownRefresh())
  },

  statusText(s) {
    return { 0: '待处理', 1: '已完成', 2: '已取消' }[s] || '待处理'
  },
  statusTag(s) {
    return { 0: 'tag-wait', 1: 'tag-ok', 2: 'tag-cancel' }[s] || 'tag-wait'
  }
})