const api = require('../../utils/api');

Page({
  data: {
    mode: 'challenge',
    showStats: true,
    showDetail: true,
    resultData: null,
    questions: [],
    expandedIdx: -1
  },

  onLoad(options) {
    const sessionId = options.sessionId || '';
    const mode = options.mode || 'challenge';
    this.setData({ mode });

    const cache = wx.getStorageSync('quizResultCache');
    if (cache && cache.sessionId === sessionId) {
      this.setData({
        resultData: cache.resultData,
        questions: cache.questions
      });
    } else {
      wx.showToast({ title: '结果已过期', icon: 'none' });
      setTimeout(() => wx.redirectTo({ url: '/pages/quiz/quiz' }), 1500);
    }
  },

  toggleExpand(e) {
    const idx = e.currentTarget.dataset.idx;
    this.setData({
      expandedIdx: this.data.expandedIdx === idx ? -1 : idx
    });
  },

  goQuizHome() {
    wx.redirectTo({ url: '/pages/quiz/quiz' });
  },

  goRanking() {
    wx.navigateTo({ url: '/pages/quiz-ranking/quiz-ranking' });
  },

  retry() {
    const mode = this.data.mode;
    if (mode === 'challenge') {
      const cat = (this.data.resultData && this.data.resultData.categoryId) || 'all';
      wx.redirectTo({ url: '/pages/quiz-challenge/quiz-challenge?category=' + cat });
    } else if (mode === 'timed') {
      wx.redirectTo({ url: '/pages/quiz-timed/quiz-timed' });
    } else {
      wx.redirectTo({ url: '/pages/quiz-daily/quiz-daily' });
    }
  },

  goArticle(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  }
});
