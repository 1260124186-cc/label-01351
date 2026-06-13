// pages/author-home/author-home.js
// 作者主页 - 展示作者信息、统计数据和公开文章列表

const api = require('../../utils/api');

Page({
  data: {
    authorId: '',
    authorName: '',
    authorAvatar: '',
    articleCount: 0,
    likeCount: 0,
    viewCount: 0,
    articles: [],
    loading: true,
    isSelf: false,
    isLoggedIn: false,
    points: 0,
    level: null,
    levelProgress: null,
    badges: [],
    badgeCount: 0
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ authorId: id });
    }
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    const userInfo = app.getUserInfo();
    this.setData({ isLoggedIn });

    if (this.data.authorId) {
      const currentUserId = (isLoggedIn && userInfo) ? userInfo.id : null;
      const isSelf = currentUserId === this.data.authorId;
      this.setData({ isSelf });
      this.loadAuthorProfile();
    }
  },

  async loadAuthorProfile() {
    this.setData({ loading: true });

    try {
      const res = await api.getAuthorProfile(this.data.authorId);

      if (res.code === 200 && res.data) {
        const {
          authorName,
          authorAvatar,
          articleCount,
          likeCount,
          viewCount,
          articles,
          points,
          level,
          levelProgress,
          badges,
          badgeCount
        } = res.data;

        wx.setNavigationBarTitle({
          title: authorName.length > 10
            ? authorName.substring(0, 10) + '...'
            : authorName
        });

        this.setData({
          authorName,
          authorAvatar,
          articleCount,
          likeCount,
          viewCount,
          articles,
          points,
          level,
          levelProgress,
          badges,
          badgeCount,
          loading: false
        });
      } else {
        this.setData({ loading: false });
        wx.showToast({
          title: res.message || '加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[AuthorHome] 加载作者主页失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id
    });
  },

  goToMine() {
    wx.switchTab({
      url: '/pages/mine/mine'
    });
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  },

  async goToChat() {
    const app = getApp();
    if (!app.checkLogin()) return;
    const { authorId, authorName, authorAvatar } = this.data;
    try {
      const blockedRes = await api.checkBlocked(authorId);
      if (blockedRes.code === 200 && blockedRes.data) {
        const { iBlocked, blockedBy } = blockedRes.data;
        if (iBlocked) {
          wx.showModal({
            title: '已拉黑该用户',
            content: '您已拉黑此用户，无法发送私信。是否解除拉黑？',
            confirmText: '解除拉黑',
            success: async (r) => {
              if (r.confirm) {
                const u = await api.unblockUser(authorId);
                if (u.code === 200) {
                  wx.showToast({ title: '已解除拉黑', icon: 'success' });
                  this.goToChat();
                }
              }
            }
          });
          return;
        }
        if (blockedBy) {
          wx.showToast({ title: '您已被对方拉黑，无法私信', icon: 'none' });
          return;
        }
      }
    } catch (e) {
      console.error('[AuthorHome] 检查拉黑状态失败:', e);
    }
    const params = [
      'peerUserId=' + encodeURIComponent(authorId),
      'peerUserName=' + encodeURIComponent(authorName || ''),
      'peerAvatar=' + encodeURIComponent(authorAvatar || ''),
      'source=' + encodeURIComponent('author'),
      'sourceId=' + encodeURIComponent(authorId || ''),
      'sourceTitle=' + encodeURIComponent('')
    ].join('&');
    wx.navigateTo({
      url: '/pages/chat/chat?' + params
    });
  }
});
