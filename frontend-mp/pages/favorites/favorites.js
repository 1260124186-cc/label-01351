// pages/favorites/favorites.js
// 我的收藏页面 - 展示收藏的文章列表，支持分类筛选和关键词搜索

const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    categories: [],
    currentCategory: 'all',
    favoriteList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    keyword: '',
    loading: false,
    loadingMore: false
  },

  onLoad() {
    this.loadCategories();
    this.loadFavorites();
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
    this.setData({
      page: 1,
      favoriteList: [],
      hasMore: true
    });
    await this.loadFavorites();
  },

  async loadCategories() {
    try {
      const res = await api.getCategoryList();
      if (res.code === 200) {
        this.setData({ categories: res.data });
      }
    } catch (error) {
      console.error('[Favorites] 加载分类失败:', error);
      wx.showToast({ title: '加载分类失败', icon: 'none' });
    }
  },

  async loadFavorites() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const res = await api.getFavoriteList({
        category: this.data.currentCategory,
        page: this.data.page,
        pageSize: this.data.pageSize,
        keyword: this.data.keyword
      });

      if (res.code === 200) {
        const list = res.data.list.map(item => ({
          ...item,
          categoryName: util.getCategoryName(item.category),
          summary: util.truncateText(item.content, 100)
        }));

        this.setData({
          favoriteList: this.data.page === 1 ? list : [...this.data.favoriteList, ...list],
          hasMore: res.data.hasMore
        });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[Favorites] 加载收藏失败:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadMore() {
    if (!this.data.hasMore || this.data.loadingMore) return;

    this.setData({
      loadingMore: true,
      page: this.data.page + 1
    });

    await this.loadFavorites();
    this.setData({ loadingMore: false });
  },

  onCategoryChange(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.currentCategory) return;

    this.setData({
      currentCategory: id,
      page: 1,
      favoriteList: [],
      hasMore: true
    });

    this.loadFavorites();
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.setData({
      page: 1,
      favoriteList: [],
      hasMore: true
    });
    this.loadFavorites();
  },

  clearSearch() {
    this.setData({
      keyword: '',
      page: 1,
      favoriteList: [],
      hasMore: true
    });
    this.loadFavorites();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  async onUnfavorite(e) {
    const id = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;

    wx.showModal({
      title: '提示',
      content: '确定要取消收藏吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await api.unfavoriteArticle(id);
            if (result.code === 200) {
              wx.showToast({ title: '已取消收藏', icon: 'none' });

              const favoriteList = this.data.favoriteList.filter(item => item.id !== id);
              this.setData({ favoriteList });
            }
          } catch (error) {
            console.error('[Favorites] 取消收藏失败:', error);
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  }
});
