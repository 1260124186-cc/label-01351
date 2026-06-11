const api = require('../../utils/api');

Page({
  data: {
    loading: false,
    categories: [],
    stats: {
      totalQuestions: 0,
      correctCount: 0,
      accuracy: 0,
      totalScore: 0,
      streakDays: 0,
      categoryDetails: []
    },
    todayAnswered: false,
    todayCorrect: null
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  async onPullDownRefresh() {
    await this.loadData();
    wx.stopPullDownRefresh();
  },

  async loadData() {
    this.setData({ loading: true });
    try {
      const [catRes, dailyRes, statsRes] = await Promise.all([
        api.getQuizCategories(),
        api.getDailyQuiz(),
        api.getQuizStats().catch(() => ({ code: 0, data: null }))
      ]);

      if (catRes.code === 200) {
        this.setData({ categories: catRes.data });
      }
      if (dailyRes.code === 200 && dailyRes.data.dailyInfo) {
        this.setData({
          todayAnswered: dailyRes.data.dailyInfo.answered,
          todayCorrect: dailyRes.data.dailyInfo.isCorrect
        });
      }
      if (statsRes.code === 200 && statsRes.data) {
        this.setData({ stats: statsRes.data });
      }
    } catch (e) {
      console.error('[Quiz] 加载数据异常:', e);
    } finally {
      this.setData({ loading: false });
    }
  },

  goDaily() {
    wx.navigateTo({ url: '/pages/quiz-daily/quiz-daily' });
  },

  goChallenge(e) {
    const category = e.currentTarget.dataset.category || 'all';
    wx.navigateTo({ url: '/pages/quiz-challenge/quiz-challenge?category=' + category });
  },

  goTimed() {
    wx.navigateTo({ url: '/pages/quiz-timed/quiz-timed' });
  },

  goRanking() {
    wx.navigateTo({ url: '/pages/quiz-ranking/quiz-ranking' });
  },

  goWrong() {
    wx.navigateTo({ url: '/pages/quiz-wrong/quiz-wrong' });
  }
});
