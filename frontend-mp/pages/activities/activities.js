const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    typeList: [],
    statusList: [
      { id: 'all', name: '全部状态', icon: '📋' },
      { id: 'open', name: '报名中', icon: '✅' },
      { id: 'full', name: '已满', icon: '🔴' },
      { id: 'ended', name: '已结束', icon: '⏹️' }
    ],
    currentType: 'all',
    currentStatus: 'all',
    activityList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    keyword: '',
    loading: false,
    loadingMore: false,
    isLoggedIn: false,
    isAdmin: false
  },

  _loadRequestId: 0,

  onLoad() {
    this.loadTypes();
  },

  onShow() {
    const app = getApp();
    this.setData({
      isLoggedIn: app.getLoginStatus(),
      isAdmin: app.isAdmin()
    });
    this.refreshData();
  },

  onPullDownRefresh() {
    this.refreshData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  async loadTypes() {
    try {
      const res = await api.getActivityTypes();
      if (res.code === 200) {
        this.setData({
          typeList: [{ id: 'all', name: '全部类型', icon: '📌' }, ...res.data]
        });
      }
    } catch (error) {
      console.error('[Activities] 加载类型失败:', error);
    }
  },

  async refreshData() {
    this._loadRequestId++;
    const requestId = this._loadRequestId;

    this.setData({
      page: 1,
      activityList: [],
      hasMore: true
    });

    return this.loadList(requestId);
  },

  async loadList(requestId) {
    if (!requestId) {
      requestId = ++this._loadRequestId;
    }

    this.setData({ loading: true });

    try {
      const res = await api.getActivityList({
        type: this.data.currentType,
        status: this.data.currentStatus,
        page: this.data.page,
        pageSize: this.data.pageSize,
        keyword: this.data.keyword
      });

      if (requestId !== this._loadRequestId) {
        return { cancelled: true };
      }

      if (res.code === 200) {
        const list = res.data.list.map(item => ({
          ...item,
          timeDisplay: util.formatActivityTime(item.startTime, item.endTime),
          summary: util.truncateText(item.description, 80)
        }));

        this.setData({
          activityList: this.data.page === 1 ? list : [...this.data.activityList, ...list],
          hasMore: res.data.hasMore
        });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }

      return { cancelled: false, success: res.code === 200 };
    } catch (error) {
      if (requestId !== this._loadRequestId) {
        return { cancelled: true };
      }
      console.error('[Activities] 加载列表失败:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      return { cancelled: false, success: false, error };
    } finally {
      if (requestId === this._loadRequestId) {
        this.setData({ loading: false });
      }
    }
  },

  async loadMore() {
    if (!this.data.hasMore || this.data.loadingMore) return;

    this.setData({
      loadingMore: true,
      page: this.data.page + 1
    });

    const result = await this.loadList();

    if (!result.cancelled) {
      this.setData({ loadingMore: false });
    }

    return result;
  },

  async onTypeChange(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.currentType) return;

    this._loadRequestId++;

    this.setData({
      currentType: id,
      page: 1,
      activityList: [],
      hasMore: true
    });

    return this.loadList();
  },

  async onStatusChange(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.currentStatus) return;

    this._loadRequestId++;

    this.setData({
      currentStatus: id,
      page: 1,
      activityList: [],
      hasMore: true
    });

    return this.loadList();
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  async onSearch() {
    this._loadRequestId++;

    this.setData({
      page: 1,
      activityList: [],
      hasMore: true
    });

    return this.loadList();
  },

  async clearSearch() {
    this._loadRequestId++;

    this.setData({
      keyword: '',
      page: 1,
      activityList: [],
      hasMore: true
    });

    return this.loadList();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity-detail/activity-detail?id=${id}`
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
  },

  goToMyActivities() {
    const app = getApp();
    if (!app.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/my-activities/my-activities'
    });
  }
});
