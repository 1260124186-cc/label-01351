const api = require('../../utils/api');

Page({
  data: {
    activeTab: 'weekly',
    weeklyList: [],
    totalList: [],
    myRank: { weekly: null, total: null },
    currentUserId: 'user_mock_001',
    loading: true
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({ currentUserId: userInfo.id || 'user_mock_001' });
    this.loadRanking();
  },

  onShow() {
    if (!this.data.loading) this.loadRanking();
  },

  onPullDownRefresh() {
    this.loadRanking().then(() => wx.stopPullDownRefresh());
  },

  switchTab(e) {
    const type = e.currentTarget.dataset.type;
    if (this.data.activeTab !== type) {
      this.setData({ activeTab: type });
    }
  },

  async loadRanking() {
    this.setData({ loading: true });
    try {
      const [weeklyRes, totalRes] = await Promise.all([
        api.getQuizRankings('weekly'),
        api.getQuizRankings('total')
      ]);

      let weeklyList = weeklyRes.code === 200 ? weeklyRes.data.list : [];
      let totalList = totalRes.code === 200 ? totalRes.data.list : [];

      const myWeekly = this.findMyRank(weeklyList);
      const myTotal = this.findMyRank(totalList);

      weeklyList = weeklyList.slice(0, 10);
      totalList = totalList.slice(0, 10);

      this.setData({
        weeklyList,
        totalList,
        myRank: { weekly: myWeekly, total: myTotal }
      });
    } catch (e) {
      console.error('[Ranking] 加载异常:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  findMyRank(list) {
    const idx = list.findIndex(item => item.id === this.data.currentUserId);
    if (idx >= 0) {
      return { ...list[idx], rank: idx + 1 };
    }
    return null;
  },

  getMedal(rank) {
    return rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
  },

  getAvatarBgColor(name) {
    const colors = ['#FF7875', '#FFC53D', '#69C0FF', '#95DE64', '#FF85C0', '#B37FEB'];
    const idx = (name || '?').charCodeAt(0) % colors.length;
    return colors[idx];
  },

  getInitial(name) {
    return (name || '?').charAt(0).toUpperCase();
  },

  onBack() { wx.navigateBack(); }
});
