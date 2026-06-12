const api = require('../../utils/api');

const RARITY_CONFIG = {
  common: { name: '普通', color: '#757575', bg: 'linear-gradient(135deg, #E0E0E0, #BDBDBD)' },
  rare: { name: '稀有', color: '#1976D2', bg: 'linear-gradient(135deg, #BBDEFB, #64B5F6)' },
  epic: { name: '史诗', color: '#7B1FA2', bg: 'linear-gradient(135deg, #E1BEE7, #BA68C8)' },
  legendary: { name: '传说', color: '#FF6F00', bg: 'linear-gradient(135deg, #FFE0B2, #FFB74D)' }
};

Page({
  data: {
    loading: true,
    points: 0,
    userBadges: [],
    allBadges: [],
    displayBadges: [],
    filterRarity: 'all',
    rarityOptions: [
      { id: 'all', name: '全部', count: 0 },
      { id: 'common', name: '普通', count: 0 },
      { id: 'rare', name: '稀有', count: 0 },
      { id: 'epic', name: '史诗', count: 0 },
      { id: 'legendary', name: '传说', count: 0 }
    ],
    showBadgeDetail: false,
    selectedBadge: null,
    rarityConfig: RARITY_CONFIG
  },

  onLoad() {
    this.loadBadgeData();
  },

  onShow() {
    this.loadBadgeData();
  },

  async loadBadgeData() {
    this.setData({ loading: true });
    try {
      const [pointsRes, userBadgesRes, allRes] = await Promise.all([
        api.getUserPoints(),
        api.getUserBadges(),
        api.getAllBadges()
      ]);

      const points = pointsRes.code === 200 ? pointsRes.data.points : 0;
      const userBadges = userBadgesRes.code === 200 ? (userBadgesRes.data.badges || []) : [];
      const allBadges = allRes.code === 200 ? (allRes.data.badges || []) : [];

      const userBadgeIds = new Set(userBadges.map(b => b.id));
      const enrichedBadges = allBadges.map(badge => ({
        ...badge,
        isOwned: userBadgeIds.has(badge.id),
        rarityInfo: RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.common
      }));

      const rarityCounts = { all: enrichedBadges.length, common: 0, rare: 0, epic: 0, legendary: 0 };
      enrichedBadges.forEach(b => {
        if (rarityCounts[b.rarity] !== undefined) {
          rarityCounts[b.rarity]++;
        }
      });

      const rarityOptions = this.data.rarityOptions.map(opt => ({
        ...opt,
        count: rarityCounts[opt.id] || 0
      }));

      const displayBadges = this.filterBadges(enrichedBadges, 'all');
      const ownedCount = userBadges.length;
      const totalCount = allBadges.length;

      this.setData({
        points,
        userBadges,
        allBadges: enrichedBadges,
        displayBadges,
        rarityOptions,
        ownedCount,
        totalCount,
        progressPercent: totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0
      });
    } catch (e) {
      console.error('[Achievements] 加载异常:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  filterBadges(badges, rarity) {
    if (rarity === 'all') {
      return badges;
    }
    return badges.filter(b => b.rarity === rarity);
  },

  onFilterRarity(e) {
    const rarity = e.currentTarget.dataset.id;
    if (!rarity) return;
    const displayBadges = this.filterBadges(this.data.allBadges, rarity);
    this.setData({
      filterRarity: rarity,
      displayBadges
    });
  },

  onBadgeTap(e) {
    const badge = e.currentTarget.dataset.badge;
    if (!badge) return;
    this.setData({
      showBadgeDetail: true,
      selectedBadge: badge
    });
  },

  closeBadgeDetail() {
    this.setData({
      showBadgeDetail: false,
      selectedBadge: null
    });
  },

  goToTasks() {
    wx.navigateTo({ url: '/pages/tasks/tasks' });
  },

  onShareAppMessage() {
    return {
      title: `我在乡村文化库已获得${this.data.ownedCount}枚勋章，一起来吧~`,
      path: '/pages/index/index'
    };
  }
});
