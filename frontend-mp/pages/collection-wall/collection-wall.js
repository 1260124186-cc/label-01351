const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    typeList: [],
    statusList: [
      { id: 'all', name: '全部状态', icon: '📋' },
      { id: 'ongoing', name: '征集中', icon: '📢' },
      { id: 'achieved', name: '已达成', icon: '🎯' },
      { id: 'ended', name: '已结束', icon: '⏹️' }
    ],
    sortList: [
      { id: 'latest', name: '最新发布', icon: '🕒' },
      { id: 'hot', name: '热门响应', icon: '🔥' },
      { id: 'urgent', name: '即将截止', icon: '⏰' }
    ],
    currentType: 'all',
    currentStatus: 'all',
    currentSort: 'latest',
    collectionList: [],
    hotCollections: [],
    urgentCollections: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    keyword: '',
    loading: false,
    loadingMore: false,
    isLoggedIn: false,
    isAdmin: false,
    showHotRanking: true,
    showUrgentReminder: true
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
      const res = await api.getCollectionTypes();
      if (res.code === 200) {
        this.setData({
          typeList: [{ id: 'all', name: '全部类型', icon: '📌' }, ...res.data]
        });
      }
    } catch (error) {
      console.error('[CollectionWall] 加载类型失败:', error);
    }
  },

  async refreshData() {
    this._loadRequestId++;
    const requestId = this._loadRequestId;

    this.setData({
      page: 1,
      collectionList: [],
      hasMore: true
    });

    this.loadHotAndUrgent();
    return this.loadList(requestId);
  },

  async loadHotAndUrgent() {
    try {
      const [hotRes, urgentRes] = await Promise.all([
        api.getHotCollections(5),
        api.getUrgentCollections(5)
      ]);
      if (hotRes.code === 200) {
        this.setData({
          hotCollections: hotRes.data || [],
          showHotRanking: (hotRes.data || []).length > 0
        });
      }
      if (urgentRes.code === 200) {
        this.setData({
          urgentCollections: urgentRes.data || [],
          showUrgentReminder: (urgentRes.data || []).length > 0
        });
      }
    } catch (error) {
      console.error('[CollectionWall] 加载热门/紧急征集失败:', error);
    }
  },

  async loadList(requestId) {
    if (!requestId) {
      requestId = ++this._loadRequestId;
    }

    this.setData({ loading: true });

    try {
      const res = await api.getCollectionList({
        type: this.data.currentType,
        status: this.data.currentStatus,
        sort: this.data.currentSort,
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
          typeName: item.typeInfo ? item.typeInfo.name : '',
          typeIcon: item.typeInfo ? item.typeInfo.icon : '📌',
          summary: util.truncateText(item.description, 80),
          progress: {
            responseCount: item.respondedCount || 0,
            targetCount: item.targetCount || 0,
            progressText: (item.progressPercent || 0) + '%'
          }
        }));

        this.setData({
          collectionList: this.data.page === 1 ? list : [...this.data.collectionList, ...list],
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
      console.error('[CollectionWall] 加载列表失败:', error);
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
      collectionList: [],
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
      collectionList: [],
      hasMore: true
    });

    return this.loadList();
  },

  async onSortChange(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.currentSort) return;

    this._loadRequestId++;

    this.setData({
      currentSort: id,
      page: 1,
      collectionList: [],
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
      collectionList: [],
      hasMore: true
    });

    return this.loadList();
  },

  async clearSearch() {
    this._loadRequestId++;

    this.setData({
      keyword: '',
      page: 1,
      collectionList: [],
      hasMore: true
    });

    return this.loadList();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/collection-detail/collection-detail?id=${id}`
    });
  },

  goToHotDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/collection-detail/collection-detail?id=${id}`
    });
  },

  goToPublish() {
    const app = getApp();
    if (!app.checkLogin()) return;
    const userInfo = app.getUserInfo();
    if (!userInfo.role || (userInfo.role !== 'admin' && userInfo.role !== 'verified')) {
      wx.showModal({
        title: '无权限发布',
        content: '仅管理员或认证用户可发布征集。\n\n如需申请认证，请联系系统管理员。',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/collection-publish/collection-publish'
    });
  },

  goToMyCollections() {
    const app = getApp();
    if (!app.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/mine/mine'
    });
  },

  toggleHotRanking() {
    this.setData({ showHotRanking: !this.data.showHotRanking });
  },

  toggleUrgentReminder() {
    this.setData({ showUrgentReminder: !this.data.showUrgentReminder });
  }
});
