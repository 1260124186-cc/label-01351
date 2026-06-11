const api = require('../../utils/api');

Page({
  data: {
    entryId: '',
    entry: null,
    contentParagraphs: [],
    loading: true,
    isLoggedIn: false,
    activeTab: 'content',
    catalogExpanded: true
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ entryId: id });
    }
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });

    if (this.data.entryId && !this.data.entry) {
      this.loadEntryDetail(this.data.entryId);
    }
  },

  async loadEntryDetail(id) {
    this.setData({ loading: true });

    try {
      const res = await api.getEncyclopediaDetail(id);

      if (res.code === 200 && res.data) {
        const entry = res.data;
        const contentParagraphs = (entry.content || '').split('\n\n').filter(p => p.trim());

        wx.setNavigationBarTitle({
          title: entry.title.length > 12
            ? entry.title.substring(0, 12) + '...'
            : entry.title
        });

        this.setData({
          entry,
          contentParagraphs,
          loading: false
        });
      } else {
        this.setData({
          entry: null,
          loading: false
        });
        wx.showToast({
          title: res.message || '词条加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[EncyclopediaDetail] 加载词条详情失败:', error);
      this.setData({
        entry: null,
        loading: false
      });
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  toggleCatalog() {
    this.setData({ catalogExpanded: !this.data.catalogExpanded });
  },

  scrollToSection(e) {
    const sectionId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '已定位到：' + sectionId,
      icon: 'none'
    });
  },

  goToArticle(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  goToTopic(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/topic-detail/topic-detail?id=${id}`
    });
  },

  async onLike() {
    const app = getApp();
    if (!app.checkLogin()) return;

    wx.showToast({
      title: '点赞功能开发中',
      icon: 'none'
    });
  },

  async onFavorite() {
    const app = getApp();
    if (!app.checkLogin()) return;

    wx.showToast({
      title: '收藏功能开发中',
      icon: 'none'
    });
  },

  onShareAppMessage() {
    const { entry } = this.data;
    if (!entry) return {};

    return {
      title: entry.title,
      path: `/pages/encyclopedia-detail/encyclopedia-detail?id=${entry.id}`
    };
  }
});
