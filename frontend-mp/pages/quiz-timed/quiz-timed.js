const api = require('../../utils/api');

Page({
  data: {
    loading: true,
    submitting: false,
    sessionId: '',
    totalCount: 0,
    questions: [],
    currentIndex: 0,
    answers: [],
    remaining: 60,
    remainingDisplay: '1:00',
    timer: null,
    showResult: false,
    resultData: null
  },

  onLoad() {
    this.startTimed();
  },

  onUnload() {
    if (this.data.timer) clearInterval(this.data.timer);
  },

  async startTimed() {
    this.setData({ loading: true });
    try {
      const res = await api.getTimedQuiz(60);
      if (res.code === 200) {
        const d = res.data;
        this.setData({
          sessionId: d.sessionId,
          totalCount: d.totalCount,
          questions: d.questions,
          answers: new Array(d.totalCount).fill(null),
          remaining: d.duration,
          remainingDisplay: this.formatTime(d.duration)
        });
        this.startTimer();
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    } catch (e) {
      console.error('[Timed] 启动异常:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  startTimer() {
    const timer = setInterval(async () => {
      const remaining = this.data.remaining - 1;
      if (remaining <= 0) {
        clearInterval(timer);
        this.setData({ timer: null, remaining: 0, remainingDisplay: '0:00' });
        if (!this.data.showResult && !this.data.submitting) {
          wx.showToast({ title: '时间到！自动提交', icon: 'none' });
          await this.submitAnswers(true);
        }
      } else {
        this.setData({ remaining, remainingDisplay: this.formatTime(remaining) });
      }
    }, 1000);
    this.setData({ timer });
  },

  onSelectAnswer(e) {
    if (this.data.showResult || this.data.submitting) return;
    const index = e.currentTarget.dataset.index;
    const answers = [...this.data.answers];
    answers[this.data.currentIndex] = index;
    this.setData({ answers });
  },

  onNext() {
    if (this.data.currentIndex < this.data.totalCount - 1) {
      this.setData({ currentIndex: this.data.currentIndex + 1 });
    }
  },

  onPrev() {
    if (this.data.currentIndex > 0) {
      this.setData({ currentIndex: this.data.currentIndex - 1 });
    }
  },

  async onSubmit() {
    await this.submitAnswers(false);
  },

  async submitAnswers(auto) {
    if (this.data.submitting || this.data.showResult) return;
    if (!auto) {
      const modal = await new Promise(resolve => {
        wx.showModal({
          title: '提示',
          content: '确定要提交答卷吗？',
          success: (res) => resolve(res.confirm)
        });
      });
      if (!modal) return;
    }
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.setData({ timer: null });
    }
    this.setData({ submitting: true });
    try {
      const res = await api.submitTimedQuiz(this.data.sessionId, this.data.answers);
      if (res.code === 200) {
        this.setData({ showResult: true, resultData: res.data });
      } else {
        wx.showToast({ title: res.message || '提交失败', icon: 'none' });
      }
    } catch (e) {
      console.error('[Timed] 提交异常:', e);
      wx.showToast({ title: '提交失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  onBack() { wx.navigateBack(); },

  goQuizHome() {
    wx.redirectTo({ url: '/pages/quiz/quiz' });
  },

  formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  },

  goArticle(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  }
});
