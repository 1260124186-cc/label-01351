const api = require('../../utils/api');

Page({
  data: {
    activeTab: 'all',
    wrongList: [],
    displayList: [],
    totalCount: 0,
    unreviewedCount: 0,
    reviewedCount: 0,
    loading: true,
    expandedId: null,
    smartReviewData: null
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh());
  },

  async loadData() {
    this.setData({ loading: true });
    try {
      const [listRes, smartRes] = await Promise.all([
        api.getWrongQuizList({}),
        api.getWrongQuizForReview()
      ]);

      let list = listRes.code === 200 ? listRes.data.list : [];
      let smart = smartRes.code === 200 ? smartRes.data : null;

      list = list.map(item => ({
        ...item,
        categoryInfo: (item.quiz && item.quiz.categoryInfo) || null,
        difficultyInfo: (item.quiz && item.quiz.difficultyInfo) || null
      }));

      const unreviewed = list.filter(x => !x.isReviewed).length;
      const reviewed = list.length - unreviewed;

      this.setData({
        wrongList: list,
        totalCount: list.length,
        unreviewedCount: unreviewed,
        reviewedCount: reviewed,
        smartReviewData: smart
      }, () => this.applyFilter());
    } catch (e) {
      console.error('[WrongList] 加载异常:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  applyFilter() {
    let result = this.data.wrongList;
    if (this.data.activeTab === 'unreviewed') {
      result = result.filter(x => !x.isReviewed);
    } else if (this.data.activeTab === 'reviewed') {
      result = result.filter(x => x.isReviewed);
    }
    this.setData({ displayList: result });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (this.data.activeTab !== tab) {
      this.setData({ activeTab: tab }, () => this.applyFilter());
    }
  },

  toggleExpand(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      expandedId: this.data.expandedId === id ? null : id
    });
  },

  async markReviewed(e) {
    const id = e.currentTarget.dataset.id;
    try {
      const res = await api.markWrongQuizReviewed(id);
      if (res.code === 200) {
        wx.showToast({ title: '已标记为已复习', icon: 'success' });
        this.loadData();
      } else {
        wx.showToast({ title: res.message || '操作失败', icon: 'none' });
      }
    } catch (e) {
      console.error('[Mark] 异常:', e);
    }
  },

  async removeWrong(e) {
    const id = e.currentTarget.dataset.id;
    const modal = await new Promise(resolve => {
      wx.showModal({
        title: '确认移除',
        content: '确定要从错题本中移除这道题吗？',
        success: (res) => resolve(res.confirm)
      });
    });
    if (!modal) return;
    try {
      const res = await api.removeWrongQuiz(id);
      if (res.code === 200) {
        wx.showToast({ title: '已移除', icon: 'success' });
        this.loadData();
      } else {
        wx.showToast({ title: res.message || '操作失败', icon: 'none' });
      }
    } catch (e) {
      console.error('[Remove] 异常:', e);
    }
  },

  startSmartReview() {
    const smart = this.data.smartReviewData;
    if (!smart || smart.quizzes.length === 0) {
      wx.showToast({ title: '暂无可复习的错题', icon: 'none' });
      return;
    }
    wx.showToast({ title: '进入智能复习', icon: 'none' });
  },

  onBack() { wx.navigateBack(); },

  goArticle(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  }
});
