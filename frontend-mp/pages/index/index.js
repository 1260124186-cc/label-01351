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

  loadArticles() {
    return this.loadList();
  }
});
