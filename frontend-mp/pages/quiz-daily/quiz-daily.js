const api = require('../../utils/api');

Page({
  data: {
    loading: true,
    submitting: false,
    quiz: null,
    dailyInfo: null,
    selectedAnswer: null,
    showResult: false,
    isCorrect: false,
    correctAnswer: null,
    analysis: '',
    score: 0,
    relatedArticles: []
  },

  onLoad() {
    this.loadDaily();
  },

  async loadDaily() {
    this.setData({ loading: true });
    try {
      const res = await api.getDailyQuiz();
      if (res.code === 200) {
        this.setData({
          quiz: res.data.quiz,
          dailyInfo: res.data.dailyInfo,
          showResult: res.data.dailyInfo.answered,
          isCorrect: res.data.dailyInfo.isCorrect,
          selectedAnswer: res.data.dailyInfo.userAnswer
        });
        if (res.data.dailyInfo.answered) {
          const detailRes = await api.getQuizDetail(res.data.quiz.id);
          if (detailRes.code === 200) {
            this.setData({
              correctAnswer: detailRes.data.answer,
              analysis: detailRes.data.analysis,
              relatedArticles: detailRes.data.relatedArticles || []
            });
          }
        }
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (e) {
      console.error('[DailyQuiz] 加载异常:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onSelectAnswer(e) {
    if (this.data.showResult || this.data.submitting) return;
    const index = e.currentTarget.dataset.index;
    this.setData({ selectedAnswer: index });
  },

  async onSubmit() {
    if (this.data.selectedAnswer === null) {
      wx.showToast({ title: '请先选择答案', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    try {
      const res = await api.submitDailyQuiz(this.data.selectedAnswer);
      if (res.code === 200) {
        this.setData({
          showResult: true,
          isCorrect: res.data.isCorrect,
          correctAnswer: res.data.correctAnswer,
          analysis: res.data.analysis,
          score: res.data.score,
          relatedArticles: res.data.relatedArticles || []
        });
        wx.showToast({
          title: res.data.isCorrect ? '回答正确！' : '回答错误',
          icon: res.data.isCorrect ? 'success' : 'none'
        });
      } else {
        wx.showToast({ title: res.message || '提交失败', icon: 'none' });
      }
    } catch (e) {
      console.error('[DailyQuiz] 提交异常:', e);
      wx.showToast({ title: '提交失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  goArticle(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  }
});
