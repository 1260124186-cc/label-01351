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
      role: 'user',
      signature: '',
      location: ''
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

    unreadNotificationCount: 0,

    draftCount: 0,

    showFeedbackModal: false,
    feedbackContent: '',
    feedbackContact: ''
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
      this.loadDraftCount();
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

  goToLikes() {
    wx.navigateTo({
      url: '/pages/likes/likes'
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

  onEditArticle(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/publish/publish?articleId=' + id
    });
  },

  onDeleteArticle(e) {
    const id = e.currentTarget.dataset.id;
    const article = this.data.myArticles.find(item => item.id === id);
    if (!article) return;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除文章「${article.title}」吗？\n删除后无法恢复，相关的收藏和点赞数据也会被清理。`,
      confirmText: '删除',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          await this.doDeleteArticle(id);
        }
      }
    });
  },

  async doDeleteArticle(id) {
    try {
      wx.showLoading({ title: '删除中...' });
      const res = await api.deleteArticle(id);
      wx.hideLoading();

      if (res.code === 200) {
        const myArticles = this.data.myArticles.filter(item => item.id !== id);
        this.setData({ myArticles });
        this.loadStats();
        wx.showToast({ title: '删除成功', icon: 'success' });
      } else {
        wx.showToast({ title: res.message || '删除失败', icon: 'none' });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('[Mine] 删除文章异常:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    }
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
  },

  onFeedbackTap() {
    this.setData({ showFeedbackModal: true });
  },

  onCloseFeedback() {
    this.setData({
      showFeedbackModal: false,
      feedbackContent: '',
      feedbackContact: ''
    });
  },

  onFeedbackContentInput(e) {
    this.setData({ feedbackContent: e.detail.value });
  },

  onFeedbackContactInput(e) {
    this.setData({ feedbackContact: e.detail.value });
  },

  async onSubmitFeedback() {
    const { feedbackContent, feedbackContact } = this.data;
    const trimmedContent = feedbackContent.trim();

    if (!trimmedContent) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' });
      return;
    }
    if (trimmedContent.length < 5) {
      wx.showToast({ title: '反馈内容至少5个字符', icon: 'none' });
      return;
    }
    if (trimmedContent.length > 500) {
      wx.showToast({ title: '反馈内容不能超过500字符', icon: 'none' });
      return;
    }

    try {
      const res = await api.submitFeedback({
        content: trimmedContent,
        contact: feedbackContact.trim()
      });

      if (res.code === 200) {
        wx.showToast({ title: '提交成功', icon: 'success' });
        this.setData({
          showFeedbackModal: false,
          feedbackContent: '',
          feedbackContact: ''
        });
      } else {
        wx.showToast({ title: res.message || '提交失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[Mine] 提交反馈失败:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    }
  },

  goToEditProfile() {
    wx.navigateTo({
      url: '/pages/profile-edit/profile-edit'
    });
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  async loadDraftCount() {
    try {
      const res = await api.getArticleDraftList();
      if (res.code === 200) {
        const list = res.data && res.data.list ? res.data.list : (res.data || []);
        this.setData({ draftCount: Array.isArray(list) ? list.length : 0 });
      }
    } catch (error) {
      console.error('[Mine] 加载草稿数量异常:', error);
    }
  },

  goToDrafts() {
    wx.navigateTo({
      url: '/pages/drafts/drafts'
    });
  }
});
