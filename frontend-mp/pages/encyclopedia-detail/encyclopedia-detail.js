const api = require('../../utils/api');
const dialect = require('../../utils/dialect-dictionary');

Page({
  data: {
    entryId: '',
    entry: null,
    contentParagraphs: [],
    loading: true,
    isLoggedIn: false,
    activeTab: 'content',
    catalogExpanded: true,
    titlePinyin: '',
    titlePhonetic: '',
    t: {}
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
    const t = {
      loading: app.t('common.loading'),
      title: app.t('encyclopedia.title'),
      notFound: app.t('encyclopedia.notFound'),
      catalog: app.t('encyclopedia.catalog'),
      expand: app.t('encyclopedia.expand'),
      collapse: app.t('encyclopedia.collapse'),
      contentTab: app.t('encyclopedia.contentTab'),
      articlesTab: app.t('encyclopedia.articlesTab'),
      topicsTab: app.t('encyclopedia.topicsTab'),
      noRelatedArticles: app.t('encyclopedia.noRelatedArticles'),
      noRelatedTopics: app.t('encyclopedia.noRelatedTopics'),
      developing: app.t('encyclopedia.developing'),
      pinyin: app.t('dialect.pinyin'),
      phonetic: app.t('dialect.phonetic'),
      favorite: app.t('common.favorite'),
      like: app.t('common.likeCount'),
      share: app.t('common.share'),
      loginRequired: app.t('common.loginRequired')
    };
    this.setData({ isLoggedIn, t });

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

        let titlePinyin = entry.pinyin || '';
        let titlePhonetic = entry.phonetic || '';

        if (!titlePinyin || !titlePhonetic) {
          const dialectInfo = dialect.findDialectWord(entry.title);
          if (dialectInfo) {
            titlePinyin = titlePinyin || dialectInfo.pinyin || '';
            titlePhonetic = titlePhonetic || dialectInfo.phonetic || '';
          }
        }

        const navTitle = entry.title.length > 12
          ? entry.title.substring(0, 12) + '...'
          : entry.title;
        wx.setNavigationBarTitle({ title: navTitle });

        this.setData({
          entry,
          contentParagraphs,
          titlePinyin,
          titlePhonetic,
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
