const api = require('../../utils/api');
const operaData = require('../../utils/opera-data');

Page({
  data: {
    activeTab: 'operas',
    operaList: [],
    ariaList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    keyword: ''
  },

  onShow() {
    this.refreshOperaList();
    this.refreshAriaList();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  refreshOperaList() {
    this.setData({ page: 1, operaList: [], hasMore: true });
    this.loadOperaList();
  },

  async loadOperaList() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    try {
      const res = await api.getOperaFavoriteList({
        page: this.data.page,
        pageSize: this.data.pageSize,
        keyword: this.data.keyword
      });

      if (res.code === 200) {
        const newList = this.data.page === 1
          ? res.data.list
          : this.data.operaList.concat(res.data.list);

        this.setData({
          operaList: newList,
          hasMore: res.data.hasMore,
          page: this.data.page + 1
        });
      }
    } catch (error) {
      console.error('[OperaFavorites] 加载剧目收藏失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  async refreshAriaList() {
    this.setData({ loading: true });
    try {
      const res = await api.getAriaFavoriteList();
      if (res.code === 200) {
        this.setData({ ariaList: res.data.list });
      }
    } catch (error) {
      console.error('[OperaFavorites] 加载唱段收藏失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    if (this.data.activeTab === 'operas') {
      this.refreshOperaList();
    }
  },

  clearSearch() {
    this.setData({ keyword: '' });
    this.refreshOperaList();
  },

  onReachBottom() {
    if (this.data.activeTab === 'operas' && this.data.hasMore) {
      this.loadOperaList();
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/opera-detail/opera-detail?id=' + id
    });
  }
});
