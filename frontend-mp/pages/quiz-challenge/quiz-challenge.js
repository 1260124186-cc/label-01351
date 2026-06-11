const api = require('../../utils/api');

Page({
  data: {
    loading: true,
    submitting: false,
    sessionId: '',
    categoryInfo: null,
    totalCount: 0,
    questions: [],
    currentIndex: 0,
    answers: [],
    showResult: false,
    resultData: null
  },

  onLoad(options) {
    const category = options.category || 'all';
    this.startChallenge(category);
  },

  async startChallenge(category) {
    this.setData({ loading: true });
    try {
      const res = await api.getChallengeQuiz(category);
      if (res.code === 200) {
        const d = res.data;
        this.setData({
          sessionId: d.sessionId,
          categoryInfo: d.categoryInfo,
          totalCount: d.totalCount,
          questions: d.questions,
          answers: new Array(d.totalCount).fill(null)
        });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    } catch (e) {
      console.error('[Challenge] 启动异常:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onSelectAnswer(e) {
    if (this.data.showResult || this.data.submitting) return;
    const index = e.currentTarget.dataset.index;
    const answers = [...this.data.answers];
    answers[this.data.currentIndex] = index;
    this.setData({ answers });
  },

  onPrev() {
    if (this.data.currentIndex > 0) {
      this.setData({ currentIndex: this.data.currentIndex - 1 });
    }
  },

  onNext() {
    if (this.data.currentIndex < this.data.totalCount - 1) {
      this.setData({ currentIndex: this.data.currentIndex + 1 });
    }
  },

  onJumpTo(e) {
    const idx = e.currentTarget.dataset.idx;
    this.setData({ currentIndex: idx });
  },

  async onSubmit() {
    const answeredCount = this.data.answers.filter(a => a !== null).length;
    if (answeredCount < this.data.totalCount) {
      const modal = await new Promise(resolve => {
        wx.showModal({
          title: '提示',
          content: `还有 ${this.data.totalCount - answeredCount} 道题未作答，确定要提交吗？`,
          success: (res) => resolve(res.confirm)
        });
      });
      if (!modal) return;
    }

    this.setData({ submitting: true });
    try {
      const res = await api.submitChallengeQuiz(this.data.sessionId, this.data.answers);
      if (res.code === 200) {
        this.setData({ showResult: true, resultData: res.data });
      } else {
        wx.showToast({ title: res.message || '提交失败', icon: 'none' });
      }
    } catch (e) {
      console.error('[Challenge] 提交异常:', e);
      wx.showToast({ title: '提交失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  onBack() {
    wx.navigateBack();
  },

  goQuizHome() {
    wx.redirectTo({ url: '/pages/quiz/quiz' });
  },

  goArticle(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  }
});
