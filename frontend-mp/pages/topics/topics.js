const api = require('../../utils/api');

Page({
  data: {
    categories: [],
    currentCategory: 'all',
    topicList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    keyword: '',
    loading: false,
    loadingMore: false
  },

  _loadRequestId: 0,

  onLoad() {
    this.loadCategories();
  },

  onShow() {
    if (this.data.topicList.length === 0) {
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

  async loadCategories() {
    try {
      const res = await api.getTopicCategories();
      if (res.code === 200) {
        this.setData({ categories: res.data });
      }
    } catch (error) {
      console.error('[Topics] 加载分类失败:', error);
    }
  },

  async refreshData() {
    this._loadRequestId++;
    const requestId = this._loadRequestId;

    this.setData({
      page: 1,
      topicList: [],
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
      const res = await api.getTopicList({
        category: this.data.currentCategory,
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
          summary: this.truncateText(item.introduction, 80)
        }));

        this.setData({
          topicList: this.data.page === 1 ? list : [...this.data.topicList, ...list],
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
      console.error('[Topics] 加载列表失败:', error);
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

  async onCategoryChange(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.currentCategory) return;

    this._loadRequestId++;

    this.setData({
      currentCategory: id,
      page: 1,
      topicList: [],
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
      topicList: [],
      hasMore: true
    });

    return this.loadList();
  },

  async clearSearch() {
    this._loadRequestId++;

    this.setData({
      keyword: '',
      page: 1,
      topicList: [],
      hasMore: true
    });

    return this.loadList();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/topic-detail/topic-detail?id=${id}`
    });
  },

  goToAdmin() {
    const app = getApp();
    if (!app.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/admin-topic/admin-topic'
    });
  },

  truncateText(text, length) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }
});
