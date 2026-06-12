const articleListBehavior = require('../../behaviors/article-list');
const api = require('../../utils/api');

Page({
  behaviors: [articleListBehavior],

  data: {
    articleList: [],
    showTaskBanner: false,
    taskBannerTitle: '',
    taskBannerDesc: '',
    activeFestival: null
  },

  getListKey() {
    return 'articleList';
  },

  getApiMethod() {
    return 'getArticleList';
  },

  onLoad() {
    this.loadCategories();
  },

  onShow() {
    this.refreshData();
    this.checkTaskPromotion();
  },

  async checkTaskPromotion() {
    try {
      const [onboardingRes, sevenDayRes, festivalRes] = await Promise.all([
        api.getOnboardingProgress(),
        api.getSevenDayProgress(),
        api.getActiveFestivalTaskLine()
      ]);

      let showTaskBanner = false;
      let taskBannerTitle = '新手引导';
      let taskBannerDesc = '完成引导解锁新手勋章';

      if (onboardingRes.code === 200 && onboardingRes.data.progress < 100) {
        showTaskBanner = true;
        const steps = onboardingRes.data.steps || [];
        const nextStep = steps.find(s => !s.completed);
        if (nextStep) {
          taskBannerTitle = '下一步：' + nextStep.title;
          taskBannerDesc = '继续完成引导获取奖励';
        }
      } else if (sevenDayRes.code === 200 && sevenDayRes.data.claimableCount > 0) {
        showTaskBanner = true;
        taskBannerTitle = '七日任务有奖励可领取';
        taskBannerDesc = `可领取${sevenDayRes.data.claimableCount}个任务奖励`;
      } else if (sevenDayRes.code === 200 && sevenDayRes.data.currentDay <= 7) {
        showTaskBanner = true;
        const tasks = sevenDayRes.data.tasks || [];
        const todayTask = tasks.find(t => t.day === sevenDayRes.data.currentDay);
        if (todayTask && !todayTask.completed) {
          taskBannerTitle = '今日七日任务：' + todayTask.title;
          taskBannerDesc = todayTask.description;
        } else {
          taskBannerTitle = '七日文化任务';
          taskBannerDesc = `第${sevenDayRes.data.currentDay}天，坚持完成有好礼`;
        }
      }

      let activeFestival = null;
      if (festivalRes.code === 200 && festivalRes.data.active) {
        const line = festivalRes.data.line;
        const progress = festivalRes.data.progress || {};
        activeFestival = {
          ...line,
          badgeName: festivalRes.data.badgeName
        };
        if (!showTaskBanner && progress.claimableCount > 0) {
          showTaskBanner = true;
          taskBannerTitle = line.name + '任务有奖励可领';
          taskBannerDesc = progress.claimableCount + '个任务奖励待领取';
        }
      }

      this.setData({
        showTaskBanner,
        taskBannerTitle,
        taskBannerDesc,
        activeFestival
      });
    } catch (e) {
      console.error('[Index] 任务推广检查失败:', e);
    }
  },

  async loadArticles() {
    return this.loadList();
  },

  goToOnboarding() {
    wx.navigateTo({
      url: '/pages/onboarding/onboarding'
    });
  },

  goToTasks() {
    wx.navigateTo({
      url: '/pages/tasks/tasks'
    });
  },

  goToAchievements() {
    wx.navigateTo({
      url: '/pages/achievements/achievements'
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

  goToCalendar() {
    wx.navigateTo({
      url: '/pages/calendar/calendar'
    });
  },

  onCardTagClick(e) {
    const tag = e.currentTarget.dataset.tag;
    if (!tag) return;
    this.filterByTag(tag);
  }
});
