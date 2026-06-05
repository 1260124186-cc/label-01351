const api = require('../utils/api');
const util = require('../utils/util');

module.exports = Behavior({
  data: {
    categories: [],
    currentCategory: 'all',
    page: 1,
    pageSize: 10,
    hasMore: true,
    keyword: '',
    loading: false,
    loadingMore: false
  },

  created() {
    this._loadRequestId = 0;
  },

  methods: {
    getListKey() {
      throw new Error('getListKey must be implemented by page');
    },

    getApiMethod() {
      throw new Error('getApiMethod must be implemented by page');
    },

    onLoad() {
      this.loadCategories();
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

    async refreshData() {
      const listKey = this.getListKey();
      this.setData({
        page: 1,
        [listKey]: [],
        hasMore: true
      });
      await this.loadList();
    },

    async loadCategories() {
      try {
        const res = await api.getCategoryList();
        if (res.code === 200) {
          this.setData({ categories: res.data });
        }
      } catch (error) {
        console.error('[ArticleList] 加载分类失败:', error);
        wx.showToast({ title: '加载分类失败', icon: 'none' });
      }
    },

    async loadList() {
      const requestId = ++this._loadRequestId;

      this.setData({ loading: true });

      try {
        const listKey = this.getListKey();
        const apiMethod = this.getApiMethod();

        const res = await api[apiMethod]({
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
            categoryName: util.getCategoryName(item.category),
            summary: util.truncateText(item.content, 100)
          }));

          this.setData({
            [listKey]: this.data.page === 1 ? list : [...this.data[listKey], ...list],
            hasMore: res.data.hasMore
          });
        } else if (res.code === 401) {
          wx.showToast({ title: res.message || '请先登录', icon: 'none' });
          wx.navigateTo({
            url: '/pages/login/login'
          });
        } else {
          wx.showToast({ title: res.message || '加载失败', icon: 'none' });
        }

        return { cancelled: false, success: res.code === 200 };
      } catch (error) {
        if (requestId !== this._loadRequestId) {
          return { cancelled: true };
        }
        console.error('[ArticleList] 加载列表失败:', error);
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

      const listKey = this.getListKey();
      this.setData({
        currentCategory: id,
        page: 1,
        [listKey]: [],
        hasMore: true
      });

      return this.loadList();
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

    goToDetail(e) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      });
    }
  }
});
