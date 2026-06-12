const api = require('../../utils/api');
const taskSystem = require('../../utils/task');

Page({
  data: {
    loading: true,
    currentStep: 0,
    steps: [],
    totalSteps: 0,
    progress: 0,
    showWelcome: true,
    points: 0,
    newBadges: [],
    showRewardModal: false,
    lastReward: null,
    showCompleteModal: false
  },

  onLoad() {
    this.initOnboarding();
  },

  onShow() {
    this.refreshProgress();
  },

  async initOnboarding() {
    this.setData({ loading: true });
    try {
      const res = await api.getOnboardingProgress();
      if (res.code === 200) {
        const progress = res.data;
        const currentStepIndex = progress.steps.findIndex(s => !s.isCompleted);
        this.setData({
          steps: progress.steps,
          totalSteps: progress.total,
          currentStep: currentStepIndex >= 0 ? currentStepIndex : progress.total - 1,
          progress: progress.progress,
          showWelcome: !progress.isCompleted && progress.completed === 0,
          isCompleted: progress.isCompleted
        });

        if (progress.isCompleted) {
          this.navigateToIndex();
          return;
        }
      }
    } catch (e) {
      console.error('[Onboarding] 初始化异常:', e);
    } finally {
      this.setData({ loading: false });
    }
  },

  async refreshProgress() {
    try {
      const res = await api.getOnboardingProgress();
      if (res.code === 200) {
        const progress = res.data;
        const currentStepIndex = progress.steps.findIndex(s => !s.isCompleted);
        this.setData({
          steps: progress.steps,
          totalSteps: progress.total,
          currentStep: currentStepIndex >= 0 ? currentStepIndex : progress.total - 1,
          progress: progress.progress
        });

        if (progress.isCompleted && !this.data.isCompleted) {
          this.setData({ isCompleted: true, showCompleteModal: true });
        }
      }
    } catch (e) {
      console.error('[Onboarding] 刷新进度异常:', e);
    }
  },

  startGuide() {
    this.setData({ showWelcome: false });
  },

  goToStepAction() {
    const step = this.data.steps[this.data.currentStep];
    if (!step || !step.action) return;

    const { page, params } = step.action;
    if (!page) return;

    const queryStr = Object.entries(params || {})
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    const url = queryStr ? `${page}?${queryStr}` : page;

    const isTabPage = ['/pages/index/index', '/pages/figures/figures', '/pages/publish/publish', '/pages/mine/mine'].includes(page);

    if (isTabPage) {
      wx.switchTab({ url });
    } else {
      wx.navigateTo({
        url,
        fail: () => {
          wx.redirectTo({ url });
        }
      });
    }
  },

  async checkAndCompleteStep() {
    const step = this.data.steps[this.data.currentStep];
    if (!step) return;
    if (step.isCompleted) {
      this.goNextStep();
      return;
    }

    wx.showLoading({ title: '验证中...' });
    try {
      const res = await api.completeOnboardingStep(step.id);
      wx.hideLoading();

      if (res.code === 200 && res.data && res.data.success) {
        const { reward, onboardingCompleted, nextStep } = res.data;

        if (reward && (reward.points > 0 || reward.badge)) {
          this.setData({
            showRewardModal: true,
            lastReward: reward
          });
        }

        await this.refreshProgress();

        if (onboardingCompleted) {
          this.setData({ showCompleteModal: true });
        }

        wx.showToast({
          title: '步骤完成！',
          icon: 'success'
        });
      } else if (res.data && res.data.conditionNotMet) {
        wx.showModal({
          title: '条件未达成',
          content: '请先完成引导中的操作后再回来领取奖励哦~',
          showCancel: false
        });
      } else {
        wx.showToast({
          title: res.message || '操作失败',
          icon: 'none'
        });
      }
    } catch (e) {
      wx.hideLoading();
      console.error('[Onboarding] 完成步骤异常:', e);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  goNextStep() {
    if (this.data.currentStep < this.data.totalSteps - 1) {
      this.setData({ currentStep: this.data.currentStep + 1 });
    } else {
      const allCompleted = this.data.steps.every(s => s.isCompleted);
      if (allCompleted) {
        this.setData({ showCompleteModal: true });
      } else {
        wx.showToast({ title: '请先完成当前步骤', icon: 'none' });
      }
    }
  },

  goPrevStep() {
    if (this.data.currentStep > 0) {
      this.setData({ currentStep: this.data.currentStep - 1 });
    }
  },

  goToStep(e) {
    const index = e.currentTarget.dataset.index;
    if (index !== undefined && index >= 0 && index < this.data.totalSteps) {
      this.setData({ currentStep: index });
    }
  },

  closeRewardModal() {
    this.setData({ showRewardModal: false });
  },

  closeCompleteModal() {
    this.setData({ showCompleteModal: false });
    this.navigateToIndex();
  },

  async skipOnboarding() {
    wx.showModal({
      title: '跳过新手引导',
      content: '跳过将无法获得新手奖励，确定要跳过吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.skipOnboarding();
            wx.showToast({ title: '已跳过', icon: 'none' });
            this.navigateToIndex();
          } catch (e) {
            console.error('[Onboarding] 跳过异常:', e);
          }
        }
      }
    });
  },

  navigateToIndex() {
    wx.switchTab({
      url: '/pages/index/index',
      fail: () => {
        wx.redirectTo({ url: '/pages/index/index' });
      }
    });
  },

  goToTasks() {
    wx.navigateTo({ url: '/pages/tasks/tasks' });
  },

  onShareAppMessage() {
    return {
      title: '一起来探索乡村文化吧~',
      path: '/pages/index/index'
    };
  }
});
