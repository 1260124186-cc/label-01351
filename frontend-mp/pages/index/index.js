const articleListBehavior = require('../../behaviors/article-list');

Page({
  behaviors: [articleListBehavior],

  data: {
    articleList: []
  },

  getListKey() {
    return 'articleList';
  },

  getApiMethod() {
    return 'getArticleList';
  },

  async loadArticles() {
    return this.loadList();
  },

  goToMap() {
    wx.navigateTo({
      url: '/pages/map/map'
    });
  },

  goToTopics() {
    wx.navigateTo({
      url: '/pages/topics/topics'
    });
  },

  goToEncyclopedia() {
    wx.navigateTo({
      url: '/pages/encyclopedia/encyclopedia'
    });
  },

  goToFigures() {
    wx.navigateTo({
      url: '/pages/figures/figures'
    });
  },

  goToActivities() {
    wx.navigateTo({
      url: '/pages/activities/activities'
    });
  },

  goToPublish() {
    wx.navigateTo({
      url: '/pages/publish/publish'
    });
  }
});
