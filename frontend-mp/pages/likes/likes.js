const api = require('../../utils/api');
const articleListBehavior = require('../../behaviors/article-list');

Page({
  behaviors: [articleListBehavior],

  data: {
    isLoggedIn: false,
    likeList: []
  },

  getListKey() {
    return 'likeList';
  },

  getApiMethod() {
    return 'getLikeList';
  },

  onLoad() {
    this.checkLoginStatus();
    if (this.data.isLoggedIn) {
      this.loadCategories();
    }
  },

  async onShow() {
    this.checkLoginStatus();
    if (this.data.isLoggedIn) {
      return this.refreshData();
    }
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

  async loadLikes() {
    if (!this.checkLoginStatus()) return { cancelled: true, success: false };
    return this.loadList();
  },

  async onUnlike(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '提示',
      content: '确定要取消点赞吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await api.unlikeArticle(id);
            if (result.code === 200) {
              wx.showToast({ title: '已取消点赞', icon: 'none' });

              const listKey = this.getListKey();
              const updatedList = this.data[listKey].filter(item => item.id !== id);
              this.setData({ [listKey]: updatedList });
            }
          } catch (error) {
            console.error('[Likes] 取消点赞失败:', error);
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  }
});
