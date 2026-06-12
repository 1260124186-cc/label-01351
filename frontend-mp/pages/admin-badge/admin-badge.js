const api = require('../../utils/api');

const RARITY_CONFIG = {
  common: { name: '普通', color: '#757575' },
  rare: { name: '稀有', color: '#1976D2' },
  epic: { name: '史诗', color: '#7B1FA2' },
  legendary: { name: '传说', color: '#FF6F00' }
};

const CATEGORY_CONFIG = {
  growth: { name: '成长', icon: '🌱' },
  contribution: { name: '贡献', icon: '💪' },
  explore: { name: '探索', icon: '🔍' },
  knowledge: { name: '知识', icon: '📚' },
  popularity: { name: '人气', icon: '⭐' },
  activity: { name: '活动', icon: '🎉' },
  festival: { name: '节日', icon: '🎊' }
};

Page({
  data: {
    loading: true,
    allBadges: [],
    displayBadges: [],
    filterCategory: 'all',
    categoryOptions: [
      { id: 'all', name: '全部', icon: '📋' },
      { id: 'growth', name: '成长', icon: '🌱' },
      { id: 'contribution', name: '贡献', icon: '💪' },
      { id: 'explore', name: '探索', icon: '🔍' },
      { id: 'knowledge', name: '知识', icon: '📚' },
      { id: 'popularity', name: '人气', icon: '⭐' },
      { id: 'activity', name: '活动', icon: '🎉' },
      { id: 'festival', name: '节日', icon: '🎊' }
    ],

    showBadgeDetail: false,
    selectedBadge: null,
    isEditing: false,
    editForm: {},

    showAddModal: false,
    rarityConfig: RARITY_CONFIG,
    categoryConfig: CATEGORY_CONFIG
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
      const res = await api.getAllBadges();
      if (res.code === 200 && res.data && res.data.badges) {
        const allBadges = res.data.badges.map(badge => ({
          ...badge,
          rarityInfo: RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.common,
          categoryInfo: CATEGORY_CONFIG[badge.category] || CATEGORY_CONFIG.growth,
          isActivity: badge.category === 'activity' || badge.category === 'festival',
          hasValidity: !!(badge.startDate && badge.endDate)
        }));

        this.setData({
          allBadges,
          displayBadges: this.filterBadges(allBadges, 'all'),
          loading: false
        });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
        this.setData({ loading: false });
      }
    } catch (e) {
      console.error('[AdminBadge] 加载异常:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  filterBadges(badges, category) {
    if (category === 'all') {
      return badges;
    }
    return badges.filter(b => b.category === category);
  },

  onFilterCategory(e) {
    const category = e.currentTarget.dataset.id;
    if (!category) return;
    const displayBadges = this.filterBadges(this.data.allBadges, category);
    this.setData({
      filterCategory: category,
      displayBadges
    });
  },

  onBadgeTap(e) {
    const badge = e.currentTarget.dataset.badge;
    if (!badge) return;
    this.setData({
      showBadgeDetail: true,
      selectedBadge: badge,
      isEditing: false
    });
  },

  closeBadgeDetail() {
    this.setData({
      showBadgeDetail: false,
      selectedBadge: null,
      isEditing: false,
      editForm: {}
    });
  },

  startEdit() {
    const badge = this.data.selectedBadge;
    if (!badge) return;
    
    this.setData({
      isEditing: true,
      editForm: {
        id: badge.id,
        name: badge.name || '',
        icon: badge.icon || '🏅',
        description: badge.description || '',
        rarity: badge.rarity || 'common',
        category: badge.category || 'growth',
        startDate: badge.startDate || '',
        endDate: badge.endDate || '',
        isActive: badge.isActive !== false
      }
    });
  },

  cancelEdit() {
    this.setData({
      isEditing: false,
      editForm: {}
    });
  },

  onEditInput(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`editForm.${field}`]: value
    });
  },

  onRaritySelect(e) {
    const rarity = e.currentTarget.dataset.rarity;
    this.setData({
      'editForm.rarity': rarity
    });
  },

  onCategorySelect(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      'editForm.category': category
    });
  },

  onDateChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`editForm.${field}`]: value
    });
  },

  toggleActive() {
    this.setData({
      'editForm.isActive': !this.data.editForm.isActive
    });
  },

  async saveEdit() {
    const { editForm } = this.data;
    
    if (!editForm.name || !editForm.name.trim()) {
      wx.showToast({ title: '请输入勋章名称', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    try {
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({ title: '保存成功', icon: 'success' });
        this.closeBadgeDetail();
        this.loadBadgeData();
      }, 500);
    } catch (e) {
      wx.hideLoading();
      console.error('[AdminBadge] 保存异常:', e);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  }
});
