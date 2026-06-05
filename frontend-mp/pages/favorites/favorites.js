const api = require('../../utils/api');
const articleListBehavior = require('../../behaviors/article-list');

Page({
  behaviors: [articleListBehavior],

  data: {
    isLoggedIn: false,
    favoriteList: []
  },

  getListKey() {
    return 'favoriteList';
  },

  getApiMethod() {
    return 'getFavoriteList';
  },

  onLoad() {
    if (!this.checkLoginStatus()) return;
    this.loadCategories();
    this.loadList();
  },

  async onShow() {
    if (!this.checkLoginStatus()) return;
    return this.refreshData();
  },

  checkLoginStatus() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });
    return isLoggedIn;
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  async loadFavorites() {
    if (!this.checkLoginStatus()) return { cancelled: false, success: false };
    return this.loadList();
  },

  async onUnfavorite(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '提示',
      content: '确定要取消收藏吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await api.unfavoriteArticle(id);
            if (result.code === 200) {
              wx.showToast({ title: '已取消收藏', icon: 'none' });

              const listKey = this.getListKey();
              const updatedList = this.data[listKey].filter(item => item.id !== id);
              this.setData({ [listKey]: updatedList });
            }
          } catch (error) {
            console.error('[Favorites] 取消收藏失败:', error);
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  }
});
