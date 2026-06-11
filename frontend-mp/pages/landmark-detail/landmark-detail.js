const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    landmarkId: '',
    landmark: null,
    loading: true,
    relatedArticles: [],
    isLoggedIn: false
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ landmarkId: id });
    }
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });

    if (this.data.landmarkId && !this.data.landmark) {
      this.loadLandmarkDetail(this.data.landmarkId);
    }
  },

  async loadLandmarkDetail(id) {
    this.setData({ loading: true });
    try {
      const res = await api.getLandmarkDetail(id);
      if (res.code === 200 && res.data) {
        const landmark = {
          ...res.data,
          categoryName: this.getCategoryName(res.data.category)
        };
        this.setData({ landmark, loading: false });
        wx.setNavigationBarTitle({ title: landmark.name });
        await this.loadRelatedArticles(id);
      } else {
        this.setData({ landmark: null, loading: false });
        wx.showToast({ title: res.message || '地标不存在', icon: 'none' });
      }
    } catch (error) {
      console.error('[LandmarkDetail] 加载地标详情失败:', error);
      this.setData({ landmark: null, loading: false });
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    }
  },

  async loadRelatedArticles(landmarkId) {
    try {
      const res = await api.getRelatedArticles(landmarkId);
      if (res.code === 200 && res.data) {
        this.setData({ relatedArticles: res.data });
      }
    } catch (error) {
      console.error('[LandmarkDetail] 加载关联文章失败:', error);
    }
  },

  getCategoryName(category) {
    const categoryMap = {
      'folklore': '民俗遗址',
      'nature': '自然景观',
      'craft': '传统技艺传习地',
      'history': '历史古迹'
    };
    return categoryMap[category] || '其他';
  },

  navigateToAddress() {
    const { landmark } = this.data;
    if (!landmark) return;

    wx.openLocation({
      latitude: landmark.latitude,
      longitude: landmark.longitude,
      name: landmark.name,
      address: landmark.address,
      scale: 18
    });
  },

  goToArticleDetail(e) {
    const articleId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${articleId}` });
  },

  goBack() {
    wx.navigateBack();
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  onShareAppMessage() {
    const { landmark } = this.data;
    if (!landmark) return {};
    return {
      title: landmark.name,
      path: `/pages/landmark-detail/landmark-detail?id=${landmark.id}`
    };
  }
});