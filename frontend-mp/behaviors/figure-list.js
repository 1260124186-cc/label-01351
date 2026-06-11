// behaviors/figure-list.js
// 人物列表 behavior - 复用人列表加载逻辑

const api = require('../utils/api');

module.exports = Behavior({
  data: {
    // 筛选选项
    identityList: [],
    craftList: [],
    regionList: [],
    eraList: [],

    // 当前筛选条件
    currentIdentity: 'all',
    currentCraft: 'all',
    currentRegion: 'all',
    currentEra: 'all',

    // 分页
    page: 1,
    pageSize: 10,
    hasMore: true,

    // 搜索
    keyword: '',

    // 状态
    loading: false,
    loadingMore: false,
    showFilter: false,
    activeFilterTab: 'identity'
  },

  _loadRequestId: 0,

  onLoad() {
    this.loadFilterOptions();
  },

  onShow() {
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

  methods: {
    getListKey() {
      throw new Error('getListKey must be implemented by page');
    },

    async loadFilterOptions() {
      try {
        const res = await api.getFilterOptions();
        if (res.code === 200) {
          this.setData({
            identityList: res.data.identityList,
            craftList: res.data.craftList,
            regionList: res.data.regionList,
            eraList: res.data.eraList
          });
        }
      } catch (error) {
        console.error('[FigureList] 加载筛选选项失败:', error);
      }
    },

    async refreshData() {
      const listKey = this.getListKey();
      this.setData({
        page: 1,
        [listKey]: [],
        hasMore: true
      });
      await this.loadList();
    },

    async loadList() {
      if (typeof this._loadRequestId !== 'number' || isNaN(this._loadRequestId)) {
        this._loadRequestId = 0;
      }
      const requestId = ++this._loadRequestId;

      this.setData({ loading: true });

      try {
        const listKey = this.getListKey();

        const res = await api.getFigureList({
          identity: this.data.currentIdentity,
          craft: this.data.currentCraft,
          region: this.data.currentRegion,
          era: this.data.currentEra,
          page: this.data.page,
          pageSize: this.data.pageSize,
          keyword: this.data.keyword
        });

        if (requestId !== this._loadRequestId) {
          return { cancelled: true };
        }

        if (res.code === 200) {
          this.setData({
            [listKey]: this.data.page === 1 ? res.data.list : [...this.data[listKey], ...res.data.list],
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
        console.error('[FigureList] 加载列表失败:', error);
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
      const listKey = this.getListKey();
      this.setData({
        page: 1,
        [listKey]: [],
        hasMore: true
      });
      return this.loadList();
    },

    async clearSearch() {
      const listKey = this.getListKey();
      this.setData({
        keyword: '',
        page: 1,
        [listKey]: [],
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

    async onFilterChange(e) {
      const { type, id } = e.currentTarget.dataset;
      const listKey = this.getListKey();

      const updateData = {
        page: 1,
        [listKey]: [],
        hasMore: true,
        showFilter: false
      };

      if (type === 'identity') {
        updateData.currentIdentity = id;
      } else if (type === 'craft') {
        updateData.currentCraft = id;
      } else if (type === 'region') {
        updateData.currentRegion = id;
      } else if (type === 'era') {
        updateData.currentEra = id;
      }

      this.setData(updateData);
      return this.loadList();
    },

    async resetFilters() {
      const listKey = this.getListKey();
      this.setData({
        currentIdentity: 'all',
        currentCraft: 'all',
        currentRegion: 'all',
        currentEra: 'all',
        page: 1,
        [listKey]: [],
        hasMore: true,
        showFilter: false
      });
      return this.loadList();
    },

    goToDetail(e) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: `/pages/figure-detail/figure-detail?id=${id}`
      });
    },

    goToCreateFigure() {
      wx.navigateTo({
        url: '/pages/figure-create/figure-create'
      });
    },

    getActiveFilterCount() {
      let count = 0;
      if (this.data.currentIdentity !== 'all') count++;
      if (this.data.currentCraft !== 'all') count++;
      if (this.data.currentRegion !== 'all') count++;
      if (this.data.currentEra !== 'all') count++;
      return count;
    }
  }
});
