const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    isLoggedIn: false,
    loading: false,
    currentTab: 'registered',
    registeredList: [],
    publishedList: [],
    tabList: [
      { id: 'registered', name: '已报名', icon: '📋' },
      { id: 'published', name: '我发布的', icon: '📝' }
    ]
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    this.checkLogin();
    if (this.data.isLoggedIn) {
      this.loadData();
    }
  },

  checkLogin() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  onTabChange(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.currentTab) return;
    this.setData({ currentTab: id });
  },

  async loadData() {
    this.setData({ loading: true });

    try {
      const [registeredRes, publishedRes] = await Promise.all([
        api.getMyActivities(),
        api.getMyPublishedActivities()
      ]);

      const registeredList = (registeredRes.code === 200 ? registeredRes.data.list : []).map(item => ({
        ...item,
        timeDisplay: util.formatActivityTime(item.startTime, item.endTime)
      }));

      const publishedList = (publishedRes.code === 200 ? publishedRes.data.list : []).map(item => ({
        ...item,
        timeDisplay: util.formatActivityTime(item.startTime, item.endTime)
      }));

      this.setData({
        registeredList,
        publishedList,
        loading: false
      });
    } catch (error) {
      console.error('[MyActivities] 加载数据失败:', error);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
    }
  },

  async onPullDownRefresh() {
    await this.loadData();
    wx.stopPullDownRefresh();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity-detail/activity-detail?id=${id}`
    });
  },

  async onCancelRegistration(e) {
    const id = e.currentTarget.dataset.id;
    const activity = this.data.registeredList.find(item => item.id === id);

    if (!activity || !activity.canCancel) {
      wx.showToast({ title: '活动开始前24小时内不可取消', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认取消',
      content: `确定要取消报名"${activity.title}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '取消中...' });

          try {
            const result = await api.cancelRegistration(id);
            wx.hideLoading();

            if (result.code === 200) {
              wx.showToast({
                title: result.message || '取消成功',
                icon: 'success'
              });
              this.loadData();
            } else {
              wx.showToast({
                title: result.message || '取消失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('[MyActivities] 取消报名失败:', error);
            wx.hideLoading();
            wx.showToast({ title: '操作失败，请重试', icon: 'none' });
          }
        }
      }
    });
  },

  goToPublish() {
    const app = getApp();
    if (!app.checkLogin()) return;
    const userInfo = app.getUserInfo();
    if (!userInfo.role || (userInfo.role !== 'admin' && userInfo.role !== 'verified')) {
      wx.showModal({
        title: '无权限发布',
        content: '仅管理员或认证用户可发布活动。\n\n如需申请认证，请联系系统管理员。',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/activity-publish/activity-publish'
    });
  }
});
