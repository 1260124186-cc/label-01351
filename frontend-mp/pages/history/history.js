const api = require('../../utils/api');
const articleListBehavior = require('../../behaviors/article-list');

Page({
  behaviors: [articleListBehavior],

  data: {
    isLoggedIn: false,
    historyList: []
  },

  getListKey() {
    return 'historyList';
  },

  getApiMethod() {
    return 'getHistoryList';
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

  async loadHistory() {
    if (!this.checkLoginStatus()) return { cancelled: true, success: false };
    return this.loadList();
  },

  async onDelete(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '提示',
      content: '确定要删除这条阅读记录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await api.deleteHistory(id);
            if (result.code === 200) {
              wx.showToast({ title: '删除成功', icon: 'none' });

              const listKey = this.getListKey();
              const updatedList = this.data[listKey].filter(item => item.id !== id);
              this.setData({ [listKey]: updatedList });
            }
          } catch (error) {
            console.error('[History] 删除阅读记录失败:', error);
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  async onClear() {
    const listKey = this.getListKey();
    if (this.data[listKey].length === 0) {
      wx.showToast({ title: '暂无阅读记录', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '提示',
      content: '确定要清空所有阅读记录吗？此操作不可恢复。',
      confirmText: '清空',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await api.clearHistory();
            if (result.code === 200) {
              wx.showToast({ title: '已清空阅读历史', icon: 'success' });
              this.setData({ [listKey]: [] });
            }
          } catch (error) {
            console.error('[History] 清空阅读历史失败:', error);
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  formatReadTime(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const readDate = new Date(dateStr);
    const diff = now.getTime() - readDate.getTime();

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) {
      return '刚刚';
    } else if (diff < hour) {
      return Math.floor(diff / minute) + '分钟前';
    } else if (diff < day) {
      return Math.floor(diff / hour) + '小时前';
    } else if (diff < 7 * day) {
      return Math.floor(diff / day) + '天前';
    } else {
      return dateStr.split(' ')[0];
    }
  }
});
