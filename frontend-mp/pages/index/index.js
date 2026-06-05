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
  }
});
