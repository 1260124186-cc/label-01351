var api = require('../../utils/api');
var pairingData = require('../../utils/pairing-data');

Page({
  data: {
    tabs: [
      { id: 'teaching', name: '传技艺' },
      { id: 'learning', name: '想学' },
      { id: 'myPairings', name: '我的结对' }
    ],
    currentTab: 'teaching',
    skillTypes: [],
    regions: [],
    currentSkillType: 'all',
    currentRegion: 'all',
    keyword: '',
    teachingList: [],
    learningList: [],
    myPairingList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    loadingMore: false,
    showFabMenu: false
  },

  _loadRequestId: 0,

  onLoad: function() {
    this.loadSkillTypes();
    this.loadRegions();
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

  loadSkillTypes: function() {
    var list = pairingData.SKILL_TAGS;
    var skillTypes = [{ id: 'all', name: '全部', icon: '✨' }].concat(list);
    this.setData({ skillTypes: skillTypes });
  },

  loadRegions: function() {
    var list = [
      { id: 'north', name: '华北地区' },
      { id: 'east', name: '华东地区' },
      { id: 'south', name: '华南地区' },
      { id: 'central', name: '华中地区' },
      { id: 'southwest', name: '西南地区' },
      { id: 'northwest', name: '西北地区' },
      { id: 'northeast', name: '东北地区' }
    ];
    var regions = [{ id: 'all', name: '全部地区' }].concat(list);
    this.setData({ regions: regions });
  },

  onTabChange: function(e) {
    var id = e.currentTarget.dataset.id;
    if (id === this.data.currentTab) return;
    this._loadRequestId++;
    this.setData({
      currentTab: id,
      page: 1,
      hasMore: true,
      showFabMenu: false
    });
    this.refreshData();
  },

  onSkillChange: function(e) {
    var id = e.currentTarget.dataset.id;
    if (id === this.data.currentSkillType) return;
    this._loadRequestId++;
    this.setData({
      currentSkillType: id,
      page: 1,
      hasMore: true
    });
    this.refreshData();
  },

  onRegionChange: function(e) {
    var id = e.currentTarget.dataset.id;
    if (id === this.data.currentRegion) return;
    this._loadRequestId++;
    this.setData({
      currentRegion: id,
      page: 1,
      hasMore: true
    });
    this.refreshData();
  },

  onSearchInput: function(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch: function() {
    this._loadRequestId++;
    this.setData({
      page: 1,
      hasMore: true
    });
    this.refreshData();
  },

  clearSearch: function() {
    this._loadRequestId++;
    this.setData({
      keyword: '',
      page: 1,
      hasMore: true
    });
    this.refreshData();
  },

  refreshData: function() {
    this._loadRequestId++;
    this.setData({
      page: 1,
      hasMore: true
    });

    var currentTab = this.data.currentTab;
    if (currentTab === 'teaching') {
      this.setData({ teachingList: [] });
    } else if (currentTab === 'learning') {
      this.setData({ learningList: [] });
    } else {
      this.setData({ myPairingList: [] });
    }

    return this.loadCurrentList();
  },

  loadCurrentList: function(requestId) {
    if (!requestId) {
      requestId = ++this._loadRequestId;
    }
    this.setData({ loading: true });

    var that = this;
    var currentTab = this.data.currentTab;

    if (currentTab === 'teaching') {
      return that.loadTeachingList(requestId);
    } else if (currentTab === 'learning') {
      return that.loadLearningList(requestId);
    } else {
      return that.loadMyPairings(requestId);
    }
  },

  loadTeachingList: function(requestId) {
    var that = this;
    return api.getTeachingList({
      skillType: that.data.currentSkillType,
      region: that.data.currentRegion,
      keyword: that.data.keyword,
      page: that.data.page,
      pageSize: that.data.pageSize
    }).then(function(res) {
      if (requestId !== that._loadRequestId) {
        return { cancelled: true };
      }
      if (res.code === 200) {
        that.setData({
          teachingList: that.data.page === 1 ? res.data.list : that.data.teachingList.concat(res.data.list),
          hasMore: res.data.hasMore
        });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
      return { cancelled: false, success: res.code === 200 };
    }).catch(function(error) {
      console.error('[Pairing] 加载传技艺列表失败:', error);
      wx.showToast({ title: '网络错误', icon: 'none' });
      return { cancelled: false, success: false, error: error };
    }).finally(function() {
      if (requestId === that._loadRequestId) {
        that.setData({ loading: false });
      }
    });
  },

  loadLearningList: function(requestId) {
    var that = this;
    return api.getLearningList({
      skillType: that.data.currentSkillType,
      region: that.data.currentRegion,
      keyword: that.data.keyword,
      page: that.data.page,
      pageSize: that.data.pageSize
    }).then(function(res) {
      if (requestId !== that._loadRequestId) {
        return { cancelled: true };
      }
      if (res.code === 200) {
        that.setData({
          learningList: that.data.page === 1 ? res.data.list : that.data.learningList.concat(res.data.list),
          hasMore: res.data.hasMore
        });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
      return { cancelled: false, success: res.code === 200 };
    }).catch(function(error) {
      console.error('[Pairing] 加载想学列表失败:', error);
      wx.showToast({ title: '网络错误', icon: 'none' });
      return { cancelled: false, success: false, error: error };
    }).finally(function() {
      if (requestId === that._loadRequestId) {
        that.setData({ loading: false });
      }
    });
  },

  loadMyPairings: function(requestId) {
    var that = this;
    return api.getPairingList({
      page: that.data.page,
      pageSize: that.data.pageSize
    }).then(function(res) {
      if (requestId !== that._loadRequestId) {
        return { cancelled: true };
      }
      if (res.code === 200) {
        that.setData({
          myPairingList: that.data.page === 1 ? res.data.list : that.data.myPairingList.concat(res.data.list),
          hasMore: res.data.hasMore
        });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
      return { cancelled: false, success: res.code === 200 };
    }).catch(function(error) {
      console.error('[Pairing] 加载我的结对列表失败:', error);
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
    this.loadCurrentList().then(function(result) {
      if (!result.cancelled) {
        that.setData({ loadingMore: false });
      }
    });
  },

  toggleFabMenu: function() {
    this.setData({ showFabMenu: !this.data.showFabMenu });
  },

  goToTeachingPublish: function() {
    this.setData({ showFabMenu: false });
    wx.navigateTo({ url: '/pages/teaching-publish/teaching-publish' });
  },

  goToLearningPublish: function() {
    this.setData({ showFabMenu: false });
    wx.navigateTo({ url: '/pages/learning-publish/learning-publish' });
  },

  goToPairingDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/pairing-detail/pairing-detail?id=' + id });
  },

  goToTeachingDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/teaching-detail/teaching-detail?id=' + id });
  },

  goToLearningDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/learning-detail/learning-detail?id=' + id });
  },

  goToPairingMatches: function(e) {
    var id = e.currentTarget.dataset.id;
    var type = e.currentTarget.dataset.type;
    wx.navigateTo({ url: '/pages/pairing-matches/pairing-matches?id=' + id + '&type=' + type });
  },

  onShareAppMessage: function() {
    return {
      title: '师徒结对·技艺传承',
      path: '/pages/pairing/pairing'
    };
  }
});
