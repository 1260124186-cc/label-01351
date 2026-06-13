const api = require('../../utils/api');

Page({
  data: {
    operaId: '',
    opera: null,
    loading: true,
    activeTab: 'info',
    isFavorite: false,
    favoriteCount: 0,
    expandedArias: []
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ operaId: id });
      this.loadOperaDetail();
      this.checkOperaFavorite();
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' });
    }
  },

  async loadOperaDetail() {
    this.setData({ loading: true });
    try {
      const res = await api.getOperaDetail(this.data.operaId);
      if (res.code === 200) {
        this.setData({
          opera: res.data,
          favoriteCount: res.data.favoriteCount || 0
        });
        wx.setNavigationBarTitle({ title: res.data.title });

        const app = getApp();
        if (app.getLoginStatus()) {
          await api.recordTaskAction('view_opera', {
            operaId: this.data.operaId
          });
        }
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[OperaDetail] 加载详情失败:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async checkOperaFavorite() {
    try {
      const res = await api.checkOperaFavorite(this.data.operaId);
      if (res.code === 200) {
        this.setData({ isFavorite: res.data.isFavorite });
      }
    } catch (error) {
      console.error('[OperaDetail] 检查收藏状态失败:', error);
    }
  },

  async toggleFavorite() {
    const app = getApp();
    if (!app.checkLogin()) return;

    if (this.data.isFavorite) {
      this.doUnfavorite();
    } else {
      this.doFavorite();
    }
  },

  async doFavorite() {
    try {
      const res = await api.favoriteOpera(this.data.operaId);
      if (res.code === 200) {
        const operas = wx.getStorageSync('operas') || [];
        const opera = operas.find(item => item.id === this.data.operaId);
        const favoriteCount = opera ? (opera.favoriteCount || 0) : this.data.favoriteCount;
        this.setData({
          isFavorite: true,
          favoriteCount
        });
        wx.showToast({ title: '收藏成功', icon: 'success' });
        try {
          await api.recordTaskAction('favorite_opera', {
            operaId: this.data.operaId
          });
        } catch (e) {
          console.warn('[OperaDetail] 记录任务失败:', e);
        }
      }
    } catch (error) {
      console.error('[OperaDetail] 收藏失败:', error);
      wx.showToast({ title: '收藏失败，请重试', icon: 'none' });
    }
  },

  async doUnfavorite() {
    try {
      const res = await api.unfavoriteOpera(this.data.operaId);
      if (res.code === 200) {
        const operas = wx.getStorageSync('operas') || [];
        const opera = operas.find(item => item.id === this.data.operaId);
        const favoriteCount = opera ? (opera.favoriteCount || 0) : this.data.favoriteCount;
        this.setData({
          isFavorite: false,
          favoriteCount
        });
        wx.showToast({ title: '已取消收藏', icon: 'none' });
      }
    } catch (error) {
      console.error('[OperaDetail] 取消收藏失败:', error);
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  },

  toggleAria(e) {
    const ariaId = e.currentTarget.dataset.ariaId;
    const expandedArias = [...this.data.expandedArias];
    const index = expandedArias.indexOf(ariaId);
    if (index > -1) {
      expandedArias.splice(index, 1);
    } else {
      expandedArias.push(ariaId);
    }
    this.setData({ expandedArias });
  },

  async toggleAriaFavorite(e) {
    const ariaId = e.currentTarget.dataset.ariaId;
    const app = getApp();
    if (!app.checkLogin()) return;

    const aria = (this.data.opera.representativeArias || []).find(a => a.id === ariaId);
    if (!aria) return;

    try {
      if (aria.isFavorite) {
        const res = await api.unfavoriteAria(this.data.operaId, ariaId);
        if (res.code === 200) {
          this.updateAriaFavoriteStatus(ariaId, false);
        }
      } else {
        const res = await api.favoriteAria(this.data.operaId, ariaId);
        if (res.code === 200) {
          this.updateAriaFavoriteStatus(ariaId, true);
          wx.showToast({ title: '收藏成功', icon: 'success' });
        }
      }
    } catch (error) {
      console.error('[OperaDetail] 唱段收藏操作失败:', error);
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  },

  updateAriaFavoriteStatus(ariaId, isFavorite) {
    const opera = { ...this.data.opera };
    if (Array.isArray(opera.representativeArias)) {
      opera.representativeArias = opera.representativeArias.map(a =>
        a.id === ariaId ? { ...a, isFavorite } : a
      );
    }
    this.setData({ opera });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  goToFigureDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/figure-detail/figure-detail?id=${id}`
    });
  },

  goToTopicDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/topic-detail/topic-detail?id=${id}`
    });
  },

  goToSubmit() {
    const app = getApp();
    if (!app.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/opera-submit/opera-submit'
    });
  },

  onShareAppMessage() {
    const { opera } = this.data;
    if (!opera) return {};
    return {
      title: `${opera.title} - ${opera.genreName}`,
      path: `/pages/opera-detail/opera-detail?id=${opera.id}`
    };
  }
});
