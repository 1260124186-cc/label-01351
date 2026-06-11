// pages/mine/mine.js
// 我的页面 - 展示用户信息、统计数据和我的投稿列表

const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    // 登录状态
    isLoggedIn: false,

    // 用户信息
    userInfo: {
      id: '',
      nickname: '',
      avatar: '',
      phone: '',
      createTime: '',
      role: 'user'
    },

    // 是否管理员
    isAdmin: false,

    // 角色调试
    roleInput: 'admin',

    // 统计数据
    stats: {
      articleCount: 0,
      likeCount: 0,
      viewCount: 0
    },

    // 我的文章列表
    myArticles: [],

    // 加载状态
    loading: false,

    unreadNotificationCount: 0
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
    if (this.data.isLoggedIn) {
      this.loadUserInfo();
      this.loadStats();
      this.loadMyArticles();
      this.loadUnreadCount();
    }
  },

  checkLoginStatus() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    const userInfo = app.getUserInfo();
    const isAdmin = app.isAdmin();

    this.setData({
      isLoggedIn,
      userInfo: userInfo || {},
      isAdmin,
      roleInput: isAdmin ? 'admin' : 'user'
    });
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.logout();

          this.setData({
            isLoggedIn: false,
            userInfo: {},
            stats: { articleCount: 0, likeCount: 0, viewCount: 0 },
            myArticles: []
          });

          wx.showToast({
            title: '已退出登录',
            icon: 'none'
          });
        }
      }
    });
  },

  async loadUserInfo() {
    try {
      const res = await api.getUserInfo();
      if (res.code === 200) {
        this.setData({ userInfo: res.data });
      }
    } catch (error) {
      console.error('[Mine] 加载用户信息异常:', error);
    }
  },

  async loadStats() {
    try {
      const res = await api.getUserStats();
      if (res.code === 200) {
        this.setData({ stats: res.data });
      }
    } catch (error) {
      console.error('[Mine] 加载统计数据异常:', error);
    }
  },

  async loadMyArticles() {
    this.setData({ loading: true });

    try {
      const res = await api.getMyArticles();
      if (res.code === 200) {
        const list = res.data.list.map(item => ({
          ...item,
          categoryName: util.getCategoryName(item.category)
        }));
        this.setData({ myArticles: list });
      }
    } catch (error) {
      console.error('[Mine] 加载我的文章异常:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  goToPublish() {
    wx.switchTab({
      url: '/pages/publish/publish'
    });
  },

  goToFavorites() {
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    });
  },

  goToMyActivities() {
    wx.navigateTo({
      url: '/pages/my-activities/my-activities'
    });
  },

  goToNotifications() {
    wx.navigateTo({
      url: '/pages/notifications/notifications'
    });
  },

  async loadUnreadCount() {
    try {
      const res = await api.getUnreadCount();
      if (res.code === 200) {
        this.setData({ unreadNotificationCount: res.data.count });
      }
    } catch (error) {
      console.error('[Mine] 加载未读通知数异常:', error);
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id
    });
  },

  // 进入管理后台（含权限校验）
  goToAdmin() {
    const app = getApp();
    if (!app.checkLogin()) return;
    if (!app.isAdmin()) {
      wx.showModal({
        title: '无权限访问',
        content: '您当前不是管理员账号，无法访问管理后台。\n\n如需申请管理员权限，请联系系统管理员。',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/admin/admin'
    });
  },

  // 角色调试：输入 role
  onRoleInput(e) {
    this.setData({ roleInput: e.detail.value });
  },

  // 角色调试：写入 Storage
  onSwitchRole() {
    const app = getApp();
    if (!app.checkLogin()) return;

    const role = (this.data.roleInput || '').trim().toLowerCase();
    if (role !== 'admin' && role !== 'user') {
      wx.showToast({
        title: '仅支持 admin / user',
        icon: 'none'
      });
      return;
    }

    const ok = app.updateUserRole(role);
    if (ok) {
      const isAdmin = role === 'admin';
      this.setData({ isAdmin, 'userInfo.role': role });
      wx.showToast({
        title: isAdmin ? '已切换为管理员' : '已切换为普通用户',
        icon: 'success'
      });
    } else {
      wx.showToast({ title: '切换失败', icon: 'none' });
    }
  }
});
