// pages/figure-detail/figure-detail.js
// 人物详情页

const api = require('../../utils/api');

Page({
  data: {
    figureId: '',
    figure: null,
    loading: true,
    activeTab: 'timeline',
    isLike: false,
    likeCount: 0
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ figureId: id });
      this.loadFigureDetail();
      this.checkLikeStatus();
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' });
    }
  },

  async loadFigureDetail() {
    this.setData({ loading: true });
    try {
      const res = await api.getFigureDetail(this.data.figureId);
      if (res.code === 200) {
        this.setData({
          figure: res.data,
          likeCount: res.data.likeCount || 0
        });
        wx.setNavigationBarTitle({ title: res.data.name });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[FigureDetail] 加载详情失败:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async checkLikeStatus() {
    try {
      const res = await api.checkFigureLike(this.data.figureId);
      if (res.code === 200) {
        this.setData({ isLike: res.data.isLike });
      }
    } catch (error) {
      console.error('[FigureDetail] 检查点赞状态失败:', error);
    }
  },

  async toggleLike() {
    const app = getApp();
    if (!app.checkLogin()) return;

    if (this.data.isLike) {
      this.doUnlike();
    } else {
      this.doLike();
    }
  },

  async doLike() {
    try {
      const res = await api.likeFigure(this.data.figureId);
      if (res.code === 200) {
        this.setData({
          isLike: true,
          likeCount: res.data.likeCount
        });
        wx.showToast({ title: '点赞成功', icon: 'success' });
      }
    } catch (error) {
      console.error('[FigureDetail] 点赞失败:', error);
      wx.showToast({ title: '点赞失败，请重试', icon: 'none' });
    }
  },

  async doUnlike() {
    try {
      const res = await api.unlikeFigure(this.data.figureId);
      if (res.code === 200) {
        this.setData({
          isLike: false,
          likeCount: res.data.likeCount
        });
        wx.showToast({ title: '已取消点赞', icon: 'none' });
      }
    } catch (error) {
      console.error('[FigureDetail] 取消点赞失败:', error);
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  goToArticleDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  goToCreateFigure() {
    const app = getApp();
    if (!app.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/figure-create/figure-create'
    });
  },

  onShareAppMessage() {
    const { figure } = this.data;
    if (!figure) return {};
    return {
      title: `${figure.name} - ${figure.identityInfo.name}`,
      path: `/pages/figure-detail/figure-detail?id=${figure.id}`
    };
  }
});
