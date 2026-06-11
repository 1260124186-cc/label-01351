// pages/interviews/interviews.js
// 口述史列表页

const api = require('../../utils/api');
const interviewData = require('../../utils/interview-data');

Page({
  data: {
    interviewList: [],
    regionList: [],
    ageGroupList: [],
    craftList: [],
    currentRegion: 'all',
    currentAgeGroup: 'all',
    currentCraft: 'all',
    keyword: '',
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    showFilter: false,
    filterCount: 0,
    activeTab: 'list',
    collectionList: []
  },

  onLoad() {
    this.loadFilterOptions();
    this.loadList();
    this.loadCollections();
  },

  onShow() {
    if (this.data.page === 1) {
      this.refreshData();
    }
  },

  onPullDownRefresh() {
    this.refreshData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadList();
    }
  },

  async loadFilterOptions() {
    try {
      const res = await api.getInterviewFilterOptions();
      if (res.code === 200) {
        this.setData({
          regionList: res.data.regionList,
          ageGroupList: res.data.ageGroupList,
          craftList: res.data.craftList
        });
      }
    } catch (error) {
      console.error('[Interviews] 加载筛选选项失败:', error);
    }
  },

  async loadList() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const res = await api.getInterviewList({
        region: this.data.currentRegion,
        ageGroup: this.data.currentAgeGroup,
        craft: this.data.currentCraft,
        keyword: this.data.keyword,
        page: this.data.page,
        pageSize: this.data.pageSize
      });

      if (res.code === 200) {
        const newList = this.data.page === 1
          ? res.data.list
          : [...this.data.interviewList, ...res.data.list];

        this.setData({
          interviewList: newList,
          hasMore: res.data.hasMore,
          page: this.data.page + 1
        });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[Interviews] 加载列表失败:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadCollections() {
    try {
      const res = await api.getInterviewCollectionList({ pageSize: 5 });
      if (res.code === 200) {
        this.setData({
          collectionList: res.data.list
        });
      }
    } catch (error) {
      console.error('[Interviews] 加载合集失败:', error);
    }
  },

  refreshData() {
    this.setData({
      page: 1,
      interviewList: [],
      hasMore: true
    });
    return this.loadList();
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.refreshData();
  },

  onFilterChange(e) {
    const { type, id } = e.currentTarget.dataset;
    const updateData = {
      page: 1,
      interviewList: [],
      hasMore: true,
      showFilter: false
    };

    if (type === 'region') {
      updateData.currentRegion = id;
    } else if (type === 'ageGroup') {
      updateData.currentAgeGroup = id;
    } else if (type === 'craft') {
      updateData.currentCraft = id;
    }

    this.setData(updateData);
    this.updateFilterCount();
    return this.loadList();
  },

  resetFilters() {
    this.setData({
      currentRegion: 'all',
      currentAgeGroup: 'all',
      currentCraft: 'all',
      keyword: '',
      page: 1,
      interviewList: [],
      hasMore: true,
      showFilter: false
    });
    this.updateFilterCount();
    return this.loadList();
  },

  updateFilterCount() {
    let count = 0;
    if (this.data.currentRegion !== 'all') count++;
    if (this.data.currentAgeGroup !== 'all') count++;
    if (this.data.currentCraft !== 'all') count++;
    this.setData({ filterCount: count });
  },

  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    if (tab === 'collections') {
      this.loadCollections();
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/interview-detail/interview-detail?id=${id}`
    });
  },

  goToCollectionDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/interview-collection-detail/interview-collection-detail?id=${id}`
    });
  },

  goToCollections() {
    wx.navigateTo({
      url: '/pages/interview-collections/interview-collections'
    });
  },

  goToCreate() {
    const app = getApp();
    if (!app.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/interview-create/interview-create'
    });
  },

  onShareAppMessage() {
    return {
      title: '口述史 - 聆听老人的故事',
      path: '/pages/interviews/interviews'
    };
  }
});
