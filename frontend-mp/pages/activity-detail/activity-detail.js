const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    activityId: '',
    activity: null,
    loading: true,
    isLoggedIn: false,
    isAuthor: false,
    showLinkModal: false,
    myArticles: []
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ activityId: id });
    }
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });

    if (this.data.activityId) {
      this.loadActivityDetail(this.data.activityId);
    }
  },

  async loadActivityDetail(id) {
    this.setData({ loading: true });

    try {
      const res = await api.getActivityDetail(id);

      if (res.code === 200 && res.data) {
        const activity = {
          ...res.data,
          timeDisplay: util.formatActivityTime(res.data.startTime, res.data.endTime)
        };

        const app = getApp();
        const userInfo = app.getUserInfo();
        const isAuthor = userInfo && activity.authorId === userInfo.id;

        this.setData({
          activity,
          loading: false,
          isAuthor
        });

        wx.setNavigationBarTitle({
          title: activity.title.length > 12
            ? activity.title.substring(0, 12) + '...'
            : activity.title
        });
      } else {
        this.setData({
          activity: null,
          loading: false
        });
        wx.showToast({
          title: res.message || '活动加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[ActivityDetail] 加载活动详情失败:', error);
      this.setData({
        activity: null,
        loading: false
      });
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  },

  async onRegister() {
    const app = getApp();
    if (!app.checkLogin()) return;

    const { activityId, activity } = this.data;

    if (activity.statusInfo.id === 'ended') {
      wx.showToast({ title: '活动已结束', icon: 'none' });
      return;
    }
    if (activity.statusInfo.id === 'full') {
      wx.showToast({ title: '活动已满员', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '报名中...' });

    try {
      const res = await api.registerActivity(activityId);
      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({
          title: res.message || '报名成功',
          icon: 'success'
        });
        this.loadActivityDetail(activityId);
      } else {
        wx.showToast({
          title: res.message || '报名失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[ActivityDetail] 报名失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  },

  async onCancelRegistration() {
    const app = getApp();
    if (!app.checkLogin()) return;

    const { activityId, activity } = this.data;

    if (!activity.canCancel) {
      wx.showToast({ title: '活动开始前24小时内不可取消', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认取消',
      content: '确定要取消报名吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '取消中...' });

          try {
            const result = await api.cancelRegistration(activityId);
            wx.hideLoading();

            if (result.code === 200) {
              wx.showToast({
                title: result.message || '取消成功',
                icon: 'success'
              });
              this.loadActivityDetail(activityId);
            } else {
              wx.showToast({
                title: result.message || '取消失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('[ActivityDetail] 取消报名失败:', error);
            wx.hideLoading();
            wx.showToast({ title: '操作失败，请重试', icon: 'none' });
          }
        }
      }
    });
  },

  async openLinkModal() {
    const app = getApp();
    if (!app.checkLogin()) return;

    try {
      const res = await api.getMyArticles();
      if (res.code === 200) {
        this.setData({
          showLinkModal: true,
          myArticles: res.data.list || []
        });
      }
    } catch (error) {
      console.error('[ActivityDetail] 加载我的文章失败:', error);
    }
  },

  closeLinkModal() {
    this.setData({ showLinkModal: false });
  },

  async onLinkArticle(e) {
    const articleId = e.currentTarget.dataset.id;
    const { activityId } = this.data;

    wx.showLoading({ title: '关联中...' });

    try {
      const res = await api.linkReviewArticle(activityId, articleId);
      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({ title: '关联成功', icon: 'success' });
        this.setData({ showLinkModal: false });
        this.loadActivityDetail(activityId);
      } else {
        wx.showToast({ title: res.message || '关联失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[ActivityDetail] 关联文章失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  },

  async onUnlinkArticle(e) {
    const articleId = e.currentTarget.dataset.id;
    const { activityId } = this.data;

    wx.showModal({
      title: '确认取消关联',
      content: '确定要取消该文章的关联吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });

          try {
            const result = await api.unlinkReviewArticle(activityId, articleId);
            wx.hideLoading();

            if (result.code === 200) {
              wx.showToast({ title: '取消关联成功', icon: 'success' });
              this.loadActivityDetail(activityId);
            } else {
              wx.showToast({ title: result.message || '操作失败', icon: 'none' });
            }
          } catch (error) {
            console.error('[ActivityDetail] 取消关联失败:', error);
            wx.hideLoading();
            wx.showToast({ title: '操作失败，请重试', icon: 'none' });
          }
        }
      }
    });
  },

  goToArticleDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  goBack() {
    wx.navigateBack();
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  stopPropagation() {},

  onShareAppMessage() {
    const { activity } = this.data;
    if (!activity) return {};

    return {
      title: activity.title,
      path: `/pages/activity-detail/activity-detail?id=${activity.id}`
    };
  }
});
