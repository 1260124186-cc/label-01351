const api = require('../../utils/api');

Page({
  data: {
    loading: true,
    points: 0,
    badgeCount: 0,
    today: '',
    activeTab: 'sevenDay',
    tabs: [
      { id: 'sevenDay', name: '七日任务', icon: '📅' },
      { id: 'festival', name: '节日任务', icon: '🎉' },
      { id: 'onboarding', name: '新手引导', icon: '🌱' }
    ],
    onboarding: null,
    sevenDay: null,
    activeFestival: null,
    festivalProgress: null,
    showRewardModal: false,
    lastReward: null,
    showFestivalRewardModal: false,
    lastFestivalReward: null
  },

  onLoad() {
    this.loadTaskCenter();
  },

  onShow() {
    this.loadTaskCenter();
  },

  async loadTaskCenter() {
    this.setData({ loading: true });
    try {
      const res = await api.getTaskCenterData();
      if (res.code === 200) {
        const data = res.data;
        this.setData({
          points: data.points,
          badgeCount: data.badges.length,
          today: data.today,
          onboarding: data.onboarding,
          sevenDay: data.sevenDay,
          activeFestival: data.activeFestival,
          festivalProgress: data.festivalProgress
        });
      }
    } catch (e) {
      console.error('[Tasks] 加载异常:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  switchTab(e) {
    const tabId = e.currentTarget.dataset.id;
    if (tabId && this.data.tabs.find(t => t.id === tabId)) {
      this.setData({ activeTab: tabId });
    }
  },

  async claimSevenDayReward(e) {
    const taskId = e.currentTarget.dataset.id;
    if (!taskId) return;

    wx.showLoading({ title: '领取中...' });
    try {
      const res = await api.claimSevenDayReward(taskId);
      wx.hideLoading();

      if (res.code === 200) {
        const { reward, allCompleted } = res.data;
        if (reward && (reward.points > 0 || reward.badge)) {
          this.setData({
            showRewardModal: true,
            lastReward: reward
          });
        }
        wx.showToast({ title: '领取成功！', icon: 'success' });
        this.loadTaskCenter();
      } else {
        wx.showToast({ title: res.message || '领取失败', icon: 'none' });
      }
    } catch (e) {
      wx.hideLoading();
      console.error('[Tasks] 领取七日奖励异常:', e);
      wx.showToast({ title: '领取失败', icon: 'none' });
    }
  },

  async claimFestivalReward(e) {
    const { festivalId, taskId } = e.currentTarget.dataset;
    if (!festivalId || !taskId) return;

    wx.showLoading({ title: '领取中...' });
    try {
      const res = await api.claimFestivalReward(festivalId, taskId);
      wx.hideLoading();

      if (res.code === 200) {
        const { reward } = res.data;
        if (reward && (reward.points > 0 || reward.badge)) {
          this.setData({
            showFestivalRewardModal: true,
            lastFestivalReward: reward
          });
        }
        wx.showToast({ title: '领取成功！', icon: 'success' });
        this.loadTaskCenter();
      } else {
        wx.showToast({ title: res.message || '领取失败', icon: 'none' });
      }
    } catch (e) {
      wx.hideLoading();
      console.error('[Tasks] 领取节日奖励异常:', e);
      wx.showToast({ title: '领取失败', icon: 'none' });
    }
  },

  closeRewardModal() {
    this.setData({ showRewardModal: false });
  },

  closeFestivalRewardModal() {
    this.setData({ showFestivalRewardModal: false });
  },

  goToOnboarding() {
    wx.navigateTo({ url: '/pages/onboarding/onboarding' });
  },

  goToAchievements() {
    wx.navigateTo({ url: '/pages/achievements/achievements' });
  },

  goTaskAction(e) {
    const task = e.currentTarget.dataset.task;
    if (!task) return;

    let url = '';
    switch (task.type || task.checkCondition) {
      case 'read_article':
      case 'viewedArticleCount':
        url = '/pages/index/index';
        break;
      case 'favorite':
      case 'favoritedArticleCount':
        url = '/pages/index/index';
        break;
      case 'like':
      case 'likedArticleCount':
        url = '/pages/index/index';
        break;
      case 'answer_quiz':
      case 'correctQuizCount':
      case 'answeredQuizCount':
        url = '/pages/quiz-daily/quiz-daily';
        break;
      case 'calendar_subscribe':
      case 'subscribedEventCount':
        url = '/pages/calendar/calendar';
        break;
      case 'view_figure':
      case 'viewedFigureCount':
        url = '/pages/figures/figures';
        break;
      case 'publish':
      case 'publishedArticleCount':
        url = '/pages/publish/publish';
        break;
      case 'hasPublishedOrJoined':
      case 'join_activity':
      case 'joinedActivityCount':
        url = '/pages/activities/activities';
        break;
      default:
        url = '/pages/index/index';
    }

    const isTabPage = ['/pages/index/index', '/pages/figures/figures', '/pages/publish/publish', '/pages/mine/mine'].includes(url);
    if (isTabPage) {
      wx.switchTab({ url });
    } else {
      wx.navigateTo({
        url,
        fail: () => wx.redirectTo({ url })
      });
    }
  },

  async resetTestData() {
    wx.showModal({
      title: '重置任务数据',
      content: '确定要重置所有任务数据吗？此操作仅供测试使用。',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.resetTaskData();
            wx.showToast({ title: '已重置', icon: 'success' });
            this.loadTaskCenter();
          } catch (e) {
            console.error('[Tasks] 重置数据异常:', e);
          }
        }
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '一起来完成乡村文化任务，获取积分勋章吧~',
      path: '/pages/index/index'
    };
  }
});
