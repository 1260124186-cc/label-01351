const api = require('../../utils/api');

Page({
  data: {
    loading: true,
    badgeId: '',
    badge: null,
    userInfo: null,
    points: 0,
    level: null,
    shareImage: ''
  },

  onLoad(options) {
    const { badgeId } = options;
    if (badgeId) {
      this.setData({ badgeId });
      this.loadAchievementData();
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  async loadAchievementData() {
    this.setData({ loading: true });
    try {
      const [cardRes, levelRes] = await Promise.all([
        api.getAchievementCard(this.data.badgeId),
        api.getUserLevel()
      ]);

      if (cardRes.code === 200 && cardRes.data) {
        const { badge, user, points } = cardRes.data;
        const level = levelRes.code === 200 ? levelRes.data : null;
        
        this.setData({
          badge,
          userInfo: user,
          points,
          level,
          loading: false
        });

        wx.setNavigationBarTitle({
          title: badge.name || '成就卡片'
        });
      } else {
        wx.showToast({ title: cardRes.message || '加载失败', icon: 'none' });
        this.setData({ loading: false });
      }
    } catch (e) {
      console.error('[AchievementShare] 加载异常:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  onShareAppMessage() {
    const { badge, userInfo, points } = this.data;
    const badgeName = badge ? badge.name : '成就';
    const nickname = userInfo ? userInfo.nickname : '我';
    
    return {
      title: `${nickname}在乡村文化库获得了「${badgeName}」勋章！`,
      path: '/pages/index/index',
      imageUrl: this.data.shareImage || ''
    };
  },

  onShareTimeline() {
    const { badge, points } = this.data;
    const badgeName = badge ? badge.name : '成就';
    
    return {
      title: `我获得了「${badgeName}」勋章，已有${points}积分`,
      imageUrl: this.data.shareImage || ''
    };
  },

  goToAchievements() {
    wx.navigateTo({ url: '/pages/achievements/achievements' });
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  }
});
