const api = require('../utils/api');
const util = require('../utils/util');

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_SEARCH_HISTORY = 10;
const HOT_ARTICLES_KEY = 'hot_articles';

module.exports = Behavior({
  data: {
    categories: [],
    currentCategory: 'all',
    page: 1,
    pageSize: 10,
    hasMore: true,
    keyword: '',
    tag: '',
    loading: false,
    loadingMore: false,
    sortType: 'latest',
    sortOptions: [
      { id: 'latest', name: '最新发布' },
      { id: 'views', name: '最多阅读' },
      { id: 'likes', name: '最多点赞' }
    ],
    searchHistory: [],
    showSearchHistory: false,
    hotArticles: [],
    emptyResultType: 'normal'
  },

  _loadRequestId: 0,
  _debouncedSearch: null,

  created() {
    this._initDebouncedSearch();
    this._loadSearchHistory();
  },

  onLoad() {
  },

  onShow() {
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
    _initDebouncedSearch() {
      this._debouncedSearch = util.debounce(async () => {
        await this._triggerSearch();
      }, 300);
    },

    _loadSearchHistory() {
      try {
        const history = wx.getStorageSync(SEARCH_HISTORY_KEY) || [];
        this.setData({ searchHistory: history });
      } catch (error) {
        console.error('[ArticleList] 加载搜索历史失败:', error);
      }
    },

    _saveSearchHistory(keyword) {
      if (!keyword || !keyword.trim()) return;

      try {
        let history = wx.getStorageSync(SEARCH_HISTORY_KEY) || [];
        const trimmedKw = keyword.trim();

        history = history.filter(item => item !== trimmedKw);
        history.unshift(trimmedKw);
        history = history.slice(0, MAX_SEARCH_HISTORY);

        wx.setStorageSync(SEARCH_HISTORY_KEY, history);
        this.setData({ searchHistory: history });
      } catch (error) {
        console.error('[ArticleList] 保存搜索历史失败:', error);
      }
    },

    async _loadHotArticles() {
      try {
        const res = await api.getArticleList({
          page: 1,
          pageSize: 5,
          sort: 'views'
        });
        if (res.code === 200 && res.data.list) {
          const hotList = res.data.list.map(item => ({
            ...item,
            categoryName: util.getCategoryName(item.category)
          }));
          this.setData({ hotArticles: hotList });
        }
      } catch (error) {
        console.error('[ArticleList] 加载热门文章失败:', error);
        this.setData({ hotArticles: [] });
      }
    },

    async _triggerSearch() {
      const listKey = this.getListKey();
      this.setData({
        page: 1,
        [listKey]: [],
        hasMore: true,
        showSearchHistory: false
      });

      if (this.data.keyword && this.data.keyword.trim()) {
        this._saveSearchHistory(this.data.keyword);
      }

      const result = await this.loadList();

      if (this.data.keyword && this.data.keyword.trim()) {
        const list = this.data[listKey];
        if (list && list.length === 0) {
          this.setData({ emptyResultType: 'search' });
          await this._loadHotArticles();
        } else {
          this.setData({ emptyResultType: 'normal' });
        }
      } else {
        this.setData({ emptyResultType: 'normal' });
      }

      return result;
    },

    getListKey() {
      throw new Error('getListKey must be implemented by page');
    },

    getApiMethod() {
      throw new Error('getApiMethod must be implemented by page');
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
      if (typeof this._loadRequestId !== 'number' || isNaN(this._loadRequestId)) {
        this._loadRequestId = 0;
      }
      const requestId = ++this._loadRequestId;

      this.setData({ loading: true });

      try {
        const listKey = this.getListKey();
        const apiMethod = this.getApiMethod();

        const res = await api[apiMethod]({
          category: this.data.currentCategory,
          page: this.data.page,
          pageSize: this.data.pageSize,
          keyword: this.data.keyword,
          tag: this.data.tag,
          sort: this.data.sortType
        });

        if (requestId !== this._loadRequestId) {
          return { cancelled: true };
        }

        if (res.code === 200) {
          const list = res.data.list.map(item => ({
            ...item,
            categoryName: util.getCategoryName(item.category),
            summary: util.truncateText(item.content, 100),
            relativeTime: util.formatRelativeTime(item.createTime)
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

    onSortChange(e) {
      const sortType = e.currentTarget.dataset.sort;
      if (sortType === this.data.sortType) return;

      const listKey = this.getListKey();
      this.setData({
        sortType,
        page: 1,
        [listKey]: [],
        hasMore: true
      });

      return this.loadList();
    },

    onSearchInput(e) {
      const value = e.detail.value;
      this.setData({
        keyword: value,
        showSearchHistory: !!(value && value.trim())
      });

      if (this._debouncedSearch) {
        this._debouncedSearch.call(this);
      }
    },

    onSearchFocus() {
      if (this.data.searchHistory.length > 0 && !this.data.keyword) {
        this.setData({ showSearchHistory: true });
      }
    },

    onSearchBlur() {
      setTimeout(() => {
        this.setData({ showSearchHistory: false });
      }, 200);
    },

    onHistoryItemTap(e) {
      const keyword = e.currentTarget.dataset.keyword;
      this.setData({
        keyword,
        showSearchHistory: false
      });
      this._triggerSearch();
    },

    clearSearchHistory() {
      wx.showModal({
        title: '提示',
        content: '确定要清空搜索历史吗？',
        success: (res) => {
          if (res.confirm) {
            wx.removeStorageSync(SEARCH_HISTORY_KEY);
            this.setData({ searchHistory: [], showSearchHistory: false });
          }
        }
      });
    },

    async onSearch() {
      return this._triggerSearch();
    },

    async clearSearch() {
      const listKey = this.getListKey();
      this.setData({
        keyword: '',
        page: 1,
        [listKey]: [],
        hasMore: true,
        showSearchHistory: false,
        emptyResultType: 'normal',
        hotArticles: []
      });
      return this.loadList();
    },

    goToDetail(e) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      });
    },

    goToHotArticle(e) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      });
    },

    async filterByTag(tag) {
      const listKey = this.getListKey();
      this.setData({
        tag: tag || '',
        page: 1,
        [listKey]: [],
        hasMore: true
      });
      return this.loadList();
    },

    async clearTagFilter() {
      return this.filterByTag('');
    }
  }
});
