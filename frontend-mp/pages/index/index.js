// pages/index/index.js
// 首页 - 展示文章列表，支持分类筛选和关键词搜索

const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    categories: [],           // 分类列表
    currentCategory: 'all',   // 当前选中分类
    articleList: [],          // 文章列表
    page: 1,                  // 当前页码
    pageSize: 10,             // 每页数量
    hasMore: true,            // 是否有更多数据
    keyword: '',              // 搜索关键词
    loading: false,           // 首次加载状态
    loadingMore: false        // 加载更多状态
  },

  onLoad() {
    this.loadCategories();
    this.loadArticles();
  },

  onShow() {
    // 每次显示页面时刷新数据，确保新投稿能及时显示
    this.refreshData();
  },

  /**
   * 下拉刷新处理
   */
  onPullDownRefresh() {
    this.refreshData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  /**
   * 刷新数据 - 重置分页并重新加载
   */
  async refreshData() {
    this.setData({
      page: 1,
      articleList: [],
      hasMore: true
    });
    await this.loadArticles();
  },

  /**
   * 加载分类列表
   */
  async loadCategories() {
    try {
      const res = await api.getCategoryList();
      if (res.code === 200) {
        this.setData({ categories: res.data });
      }
    } catch (error) {
      console.error('[Index] 加载分类失败:', error);
      wx.showToast({ title: '加载分类失败', icon: 'none' });
    }
  },

  /**
   * 加载文章列表
   */
  async loadArticles() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const res = await api.getArticleList({
        category: this.data.currentCategory,
        page: this.data.page,
        pageSize: this.data.pageSize,
        keyword: this.data.keyword
      });
      
      if (res.code === 200) {
        // 处理文章数据，添加分类名称和摘要
        const list = res.data.list.map(item => ({
          ...item,
          categoryName: util.getCategoryName(item.category),
          summary: util.truncateText(item.content, 100)
        }));
        
        this.setData({
          articleList: this.data.page === 1 ? list : [...this.data.articleList, ...list],
          hasMore: res.data.hasMore
        });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[Index] 加载文章失败:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 加载更多文章
   */
  async loadMore() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    
    this.setData({
      loadingMore: true,
      page: this.data.page + 1
    });
    
    await this.loadArticles();
    this.setData({ loadingMore: false });
  },

  /**
   * 切换分类
   * @param {Object} e - 事件对象
   */
  onCategoryChange(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.currentCategory) return;
    
    this.setData({
      currentCategory: id,
      page: 1,
      articleList: [],
      hasMore: true
    });
    
    this.loadArticles();
  },

  /**
   * 搜索输入处理
   * @param {Object} e - 事件对象
   */
  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  /**
   * 执行搜索
   */
  onSearch() {
    this.setData({
      page: 1,
      articleList: [],
      hasMore: true
    });
    this.loadArticles();
  },

  /**
   * 清除搜索关键词
   */
  clearSearch() {
    this.setData({
      keyword: '',
      page: 1,
      articleList: [],
      hasMore: true
    });
    this.loadArticles();
  },

  /**
   * 跳转到文章详情页
   * @param {Object} e - 事件对象
   */
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  }
});
