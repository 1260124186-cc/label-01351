// pages/my-certificates/my-certificates.js
// 我的证书列表页面

const api = require('../../utils/api');

Page({
  data: {
    isLoggedIn: false,
    loading: false,
    certificates: [],
    total: 0,
    page: 1,
    pageSize: 10,
    hasMore: true,
    filterType: 'all',
    certificateTypes: [],
    searchKeyword: '',
    stats: {
      totalCount: 0,
      typeStats: []
    }
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
    if (this.data.isLoggedIn) {
      this.loadCertificateTypes();
      this.loadStats();
      this.loadCertificates(true);
    }
  },

  checkLoginStatus() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  async loadCertificateTypes() {
    try {
      const res = await api.getCertificateTypes();
      if (res.code === 200) {
        const types = [{ id: 'all', name: '全部', icon: '📋', color: '#8B4513' }, ...res.data];
        this.setData({ certificateTypes: types });
      }
    } catch (e) {
      console.error('[MyCertificates] 加载证书类型失败:', e);
    }
  },

  async loadStats() {
    try {
      const res = await api.getCertificateStats();
      if (res.code === 200) {
        this.setData({ stats: res.data });
      }
    } catch (e) {
      console.error('[MyCertificates] 加载统计数据失败:', e);
    }
  },

  async loadCertificates(reset = false) {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const page = reset ? 1 : this.data.page;
      const res = await api.getMyCertificates({
        page,
        pageSize: this.data.pageSize,
        typeId: this.data.filterType,
        keyword: this.data.searchKeyword
      });

      if (res.code === 200) {
        const newCertificates = reset ? res.data.list : [...this.data.certificates, ...res.data.list];
        this.setData({
          certificates: newCertificates,
          total: res.data.total,
          page: page,
          hasMore: res.data.hasMore,
          loading: false
        });
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (e) {
      console.error('[MyCertificates] 加载证书列表异常:', e);
      this.setData({ loading: false });
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    }
  },

  onPullDownRefresh() {
    this.loadStats();
    this.loadCertificates(true);
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadCertificates(false);
    }
  },

  onFilterTypeChange(e) {
    const typeId = e.currentTarget.dataset.type;
    this.setData({ filterType: typeId, page: 1 });
    this.loadCertificates(true);
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  onSearchConfirm() {
    this.setData({ page: 1 });
    this.loadCertificates(true);
  },

  onClearSearch() {
    this.setData({ searchKeyword: '', page: 1 });
    this.loadCertificates(true);
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/certificate-detail/certificate-detail?id=${id}`
    });
  },

  goToVerify() {
    wx.navigateTo({
      url: '/pages/certificate-verify/certificate-verify'
    });
  },

  onShareAppMessage() {
    return {
      title: '我的荣誉证书',
      path: '/pages/my-certificates/my-certificates'
    };
  }
});
