const api = require('../../utils/api');

Page({
  data: {
    operaList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    keyword: '',
    loading: false,
    loadingMore: false,
    dailyOpera: null,
    dailyAria: null,
    categoryList: [],
    genreList: [],
    regionList: [],
    currentCategory: 'all',
    currentGenre: 'all',
    currentRegion: 'all',
    showFilter: false,
    activeFilterTab: 'category',
    filterCount: 0,
    showRareOnly: false
  },

  _loadRequestId: 0,

  onLoad() {
    this.loadFilterOptions();
  },

  onShow() {
    if (this.data.operaList.length === 0) {
      this.refreshData();
    }
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

  async loadFilterOptions() {
    try {
      const res = await api.getOperaFilterOptions();
      if (res.code === 200) {
        this.setData({
          categoryList: res.data.categoryList,
          genreList: res.data.genreList,
          regionList: res.data.regionList
        });
      }
    } catch (error) {
      console.error('[Operas] 加载筛选选项失败:', error);
    }
  },

  async loadDaily() {
    try {
      const [operaRes, ariaRes] = await Promise.all([
        api.getDailyOpera(),
        api.getDailyAria()
      ]);
      if (operaRes.code === 200) {
        this.setData({ dailyOpera: operaRes.data });
      }
      if (ariaRes.code === 200) {
        this.setData({ dailyAria: ariaRes.data });
      }
    } catch (error) {
      console.error('[Operas] 加载今日一曲失败:', error);
    }
  },

  async refreshData() {
    this.setData({
      page: 1,
      operaList: [],
      hasMore: true
    });
    this.loadDaily();
    await this.loadList();
  },

  async loadList() {
    if (typeof this._loadRequestId !== 'number' || isNaN(this._loadRequestId)) {
      this._loadRequestId = 0;
    }
    const requestId = ++this._loadRequestId;

    this.setData({ loading: true });

    try {
      const res = await api.getOperaList({
        category: this.data.currentCategory,
        genre: this.data.currentGenre,
        region: this.data.currentRegion,
        keyword: this.data.keyword,
        isRare: this.data.showRareOnly,
        page: this.data.page,
        pageSize: this.data.pageSize
      });

      if (requestId !== this._loadRequestId) {
        return { cancelled: true };
      }

      if (res.code === 200) {
        this.setData({
          operaList: this.data.page === 1 ? res.data.list : [...this.data.operaList, ...res.data.list],
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
      console.error('[Operas] 加载列表失败:', error);
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

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  async onSearch() {
    this.setData({
      page: 1,
      operaList: [],
      hasMore: true
    });
    return this.loadList();
  },

  async clearSearch() {
    this.setData({
      keyword: '',
      page: 1,
      operaList: [],
      hasMore: true
    });
    return this.loadList();
  },

  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter });
  },

  switchFilterTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeFilterTab: tab });
  },

  onFilterChange(e) {
    const { type, id } = e.currentTarget.dataset;

    const updateData = {
      page: 1,
      operaList: [],
      hasMore: true,
      showFilter: false
    };

    if (type === 'category') {
      updateData.currentCategory = id;
    } else if (type === 'genre') {
      updateData.currentGenre = id;
    } else if (type === 'region') {
      updateData.currentRegion = id;
    }

    this.setData(updateData);
    this.updateFilterCount();
    return this.loadList();
  },

  resetFilters() {
    this.setData({
      currentCategory: 'all',
      currentGenre: 'all',
      currentRegion: 'all',
      page: 1,
      operaList: [],
      hasMore: true,
      showFilter: false
    });
    this.updateFilterCount();
    return this.loadList();
  },

  updateFilterCount() {
    let count = 0;
    if (this.data.currentCategory !== 'all') count++;
    if (this.data.currentGenre !== 'all') count++;
    if (this.data.currentRegion !== 'all') count++;
    this.setData({ filterCount: count });
  },

  toggleRareOnly() {
    this.setData({
      showRareOnly: !this.data.showRareOnly,
      page: 1,
      operaList: [],
      hasMore: true
    });
    this.loadList();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/opera-detail/opera-detail?id=${id}`
    });
  },

  goToSubmit() {
    wx.navigateTo({
      url: '/pages/opera-submit/opera-submit'
    });
  },

  goToFavorites() {
    wx.navigateTo({
      url: '/pages/opera-favorites/opera-favorites'
    });
  },

  goToDailyDetail() {
    if (this.data.dailyOpera && this.data.dailyOpera.id) {
      wx.navigateTo({
        url: `/pages/opera-detail/opera-detail?id=${this.data.dailyOpera.id}`
      });
    }
  },

  goToAdmin() {
    wx.navigateTo({
      url: '/pages/admin-opera/admin-opera'
    });
  }
});
