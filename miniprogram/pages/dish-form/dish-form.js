const db = wx.cloud.database()
const app = getApp()

Page({
  data: {
    id: '',
    name: '',
    price: '',
    category: '',
    desc: '',
    available: true,
    imgs: [],
    categories: [],
    saving: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      wx.setNavigationBarTitle({ title: '编辑菜品' })
      this.loadDish(options.id)
    }
    this.loadCategories()
  },

  async loadCategories() {
    try {
      const res = await db.collection('dishes').field({ category: true }).limit(100).get()
      const cats = [...new Set(res.data.map(d => d.category).filter(Boolean))]
      this.setData({ categories: cats })
    } catch (e) {}
  },

  async loadDish(id) {
    try {
      const res = await db.collection('dishes').doc(id).get()
      const d = res.data
      this.setData({
        name: d.name, price: String(d.price), category: d.category || '',
        desc: d.desc || '', available: d.available !== false, imgs: d.imgs || []
      })
    } catch (e) { console.error(e) }
  },

  onName(e) { this.setData({ name: e.detail.value }) },
  onPrice(e) { this.setData({ price: e.detail.value }) },
  onCategory(e) { this.setData({ category: e.detail.value }) },
  onDesc(e) { this.setData({ desc: e.detail.value }) },

  onCategoryChip(e) {
    this.setData({ category: e.currentTarget.dataset.cat })
  },

  chooseImg() {
    wx.chooseMedia({
      count: 9 - this.data.imgs.length,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: res => {
        const files = res.tempFiles.map(f => f.tempFilePath)
        this.uploadImgs(files)
      }
    })
  },

  uploadImgs(files) {
    const { imgs } = this.data
    wx.showLoading({ title: '上传中...' })
    const tasks = files.map((f, i) => {
      const ext = f.split('.').pop() || 'jpg'
      const cloudPath = 'dish/' + Date.now() + '_' + i + '.' + ext
      return wx.cloud.uploadFile({ cloudPath, filePath: f }).then(r => r.fileID)
    })
    Promise.all(tasks).then(ids => {
      wx.hideLoading()
      this.setData({ imgs: imgs.concat(ids) })
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: '上传失败', icon: 'none' })
      console.error(err)
    })
  },

  removeImg(e) {
    const idx = e.currentTarget.dataset.index
    const imgs = this.data.imgs.slice()
    imgs.splice(idx, 1)
    this.setData({ imgs })
  },

  previewImg(e) {
    const src = e.currentTarget.dataset.src
    wx.previewImage({ urls: this.data.imgs, current: src })
  },

  submit() {
    const { id, name, price, category, desc, available, imgs } = this.data
    if (!name.trim()) return wx.showToast({ title: '请填写菜名', icon: 'none' })
    let priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum < 0) return wx.showToast({ title: '请输入正确价格', icon: 'none' })
    priceNum = Math.round(priceNum * 100) / 100

    this.setData({ saving: true })
    wx.cloud.callFunction({
      name: 'saveDish',
      data: {
        id: id || undefined,
        name: name.trim(),
        price: priceNum,
        category: category.trim(),
        desc: desc.trim(),
        available,
        imgs
      }
    }).then(r => {
      this.setData({ saving: false })
      const rr = r.result
      if (rr && rr.ok) {
        wx.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 600)
      } else {
        wx.showToast({ title: (rr && rr.msg) || '保存失败', icon: 'none' })
      }
    }).catch(err => {
      this.setData({ saving: false })
      console.error(err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    })
  }
})