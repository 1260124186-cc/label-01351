var api = require('../../utils/api');
var craftTutorialData = require('../../utils/craft-tutorial-data');

Page({
  data: {
    categories: [],
    difficulties: [],
    currentCategory: 'all',
    currentDifficulty: 'all',
    sortType: 'latest',
    sortOptions: [
      { id: 'latest', name: '最新' },
      { id: 'views', name: '最热' },
      { id: 'likes', name: '最赞' },
      { id: 'checkins', name: '最多打卡' }
    ],
    tutorialList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    keyword: '',
    loading: false,
    loadingMore: false,
    showSortMenu: false
  },

  _loadRequestId: 0,

  onLoad: function() {
    this.loadCategories();
    this.loadDifficulties();
  },

  onShow: function() {
    this.refreshData();
  },

  onPullDownRefresh: function() {
    var that = this;
    this.refreshData().then(function() {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  loadCategories: function() {
    var list = craftTutorialData.getCategoryList();
    var categories = [{ id: 'all', name: '全部', icon: '🧶', desc: '' }].concat(list);
    this.setData({ categories: categories });
  },

  loadDifficulties: function() {
    var list = craftTutorialData.getDifficultyList();
    var difficulties = [{ id: 'all', name: '全部难度', icon: '📊', desc: '' }].concat(list);
    this.setData({ difficulties: difficulties });
  },

  refreshData: function() {
    this._loadRequestId++;
    this.setData({
      page: 1,
      tutorialList: [],
      hasMore: true
    });
    return this.loadList();
  },

  loadList: function(requestId) {
    if (!requestId) {
      requestId = ++this._loadRequestId;
    }
    this.setData({ loading: true });

    var that = this;
    return api.getCraftTutorialList({
      category: that.data.currentCategory,
      difficulty: that.data.currentDifficulty,
      sort: that.data.sortType,
      page: that.data.page,
      pageSize: that.data.pageSize,
      keyword: that.data.keyword
    }).then(function(res) {
      if (requestId !== that._loadRequestId) {
        return { cancelled: true };
      }
      if (res.code === 200) {
        that.setData({
          tutorialList: that.data.page === 1 ? res.data.list : that.data.tutorialList.concat(res.data.list),
          hasMore: res.data.hasMore
        });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
      return { cancelled: false, success: res.code === 200 };
    }).catch(function(error) {
      console.error('[CraftTutorial] 加载列表失败:', error);
      wx.showToast({ title: '网络错误', icon: 'none' });
      return { cancelled: false, success: false, error: error };
    }).finally(function() {
      if (requestId === that._loadRequestId) {
        that.setData({ loading: false });
      }
    });
  },

  loadMore: function() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    var that = this;
    this.setData({ loadingMore: true, page: this.data.page + 1 });
    this.loadList().then(function(result) {
      if (!result.cancelled) {
        that.setData({ loadingMore: false });
      }
    });
  },

  onCategoryChange: function(e) {
    var id = e.currentTarget.dataset.id;
    if (id === this.data.currentCategory) return;
    this._loadRequestId++;
    this.setData({
      currentCategory: id,
      page: 1,
      tutorialList: [],
      hasMore: true
    });
    this.loadList();
  },

  onDifficultyChange: function(e) {
    var id = e.currentTarget.dataset.id;
    if (id === this.data.currentDifficulty) return;
    this._loadRequestId++;
    this.setData({
      currentDifficulty: id,
      page: 1,
      tutorialList: [],
      hasMore: true
    });
    this.loadList();
  },

  onSortChange: function(e) {
    var id = e.currentTarget.dataset.id;
    if (id === this.data.sortType) {
      this.setData({ showSortMenu: false });
      return;
    }
    this._loadRequestId++;
    this.setData({
      sortType: id,
      showSortMenu: false,
      page: 1,
      tutorialList: [],
      hasMore: true
    });
    this.loadList();
  },

  toggleSortMenu: function() {
    this.setData({ showSortMenu: !this.data.showSortMenu });
  },

  onSearchInput: function(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch: function() {
    this._loadRequestId++;
    this.setData({
      page: 1,
      tutorialList: [],
      hasMore: true
    });
    this.loadList();
  },

  clearSearch: function() {
    this._loadRequestId++;
    this.setData({
      keyword: '',
      page: 1,
      tutorialList: [],
      hasMore: true
    });
    this.loadList();
  },

  goToDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/craft-tutorial-detail/craft-tutorial-detail?id=' + id });
  },

  goToCreate: function() {
    var app = getApp();
    if (!app.checkLogin()) return;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo.role !== 'admin' && userInfo.role !== 'certified') {
      wx.showToast({ title: '仅管理员或认证用户可创建', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/craft-tutorial-create/craft-tutorial-create' });
  },

  onShareAppMessage: function() {
    return {
      title: '传统工艺分步教程',
      path: '/pages/craft-tutorial/craft-tutorial'
    };
  }
});
