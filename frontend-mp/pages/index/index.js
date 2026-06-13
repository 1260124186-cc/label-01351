const articleListBehavior = require('../../behaviors/article-list');
const app = getApp();

Page({
  behaviors: [articleListBehavior],

  data: {
    articleList: [],
    currentVillage: null,
    currentVillageId: ''
  },

  getListKey() {
    return 'articleList';
  },

  getApiMethod() {
    return 'getArticleList';
  },

  onLoad() {
    this.loadCategories();
    this.loadCurrentVillage();
  },

  onShow() {
    this.refreshData();
    this.loadCurrentVillage();
  },

  loadCurrentVillage() {
    const currentVillage = app.getCurrentVillage();
    const currentVillageId = app.getCurrentVillageId();
    this.setData({
      currentVillage,
      currentVillageId
    });
  },

  goToVillageSelect() {
    wx.navigateTo({
      url: '/pages/village-select/village-select'
    });
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
  },

  goToFundProjects() {
    wx.navigateTo({
      url: '/pages/fund-projects/fund-projects'
    });
  },

  goToCalendar() {
    wx.navigateTo({
      url: '/pages/calendar/calendar'
    });
  },

  goToOperas() {
    wx.navigateTo({
      url: '/pages/operas/operas'
    });
  },

  goToQuiz() {
    wx.navigateTo({
      url: '/pages/quiz/quiz'
    });
  },

  onCardTagClick(e) {
    const tag = e.currentTarget.dataset.tag;
    if (!tag) return;
    this.filterByTag(tag);
  }
});
