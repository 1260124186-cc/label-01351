const api = require('../../utils/api');

Page({
  data: {
    topicId: '',
    topic: null,
    loading: true,
    isLoggedIn: false,
    activeTab: 'articles'
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ topicId: id });
    }
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });

    if (this.data.topicId && !this.data.topic) {
      this.loadTopicDetail(this.data.topicId);
    }
  },

  async loadTopicDetail(id) {
    this.setData({ loading: true });

    try {
      const res = await api.getTopicDetail(id);

      if (res.code === 200 && res.data) {
        const topic = res.data;

        wx.setNavigationBarTitle({
          title: topic.title.length > 12
            ? topic.title.substring(0, 12) + '...'
            : topic.title
        });

        this.setData({
          topic,
          loading: false
        });
      } else {
        this.setData({
          topic: null,
          loading: false
        });
        wx.showToast({
          title: res.message || '专题加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[TopicDetail] 加载专题详情失败:', error);
      this.setData({
        topic: null,
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

  openExternal(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.showToast({
        title: '外部链接：' + url,
        icon: 'none'
      });
    }
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
    const { topic } = this.data;
    if (!topic) return {};

    return {
      title: topic.title,
      path: `/pages/topic-detail/topic-detail?id=${topic.id}`
    };
  }
});
