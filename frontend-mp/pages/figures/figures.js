// pages/figures/figures.js
// 人物列表页 - 传承人手谱

const figureListBehavior = require('../../behaviors/figure-list');

Page({
  behaviors: [figureListBehavior],

  data: {
    figureList: [],
    filterCount: 0
  },

  getListKey() {
    return 'figureList';
  },

  onShow() {
    this.updateFilterCount();
  },

  onFilterChange(e) {
    const { type, id } = e.currentTarget.dataset;
    const listKey = this.getListKey();

    const updateData = {
      page: 1,
      [listKey]: [],
      hasMore: true,
      showFilter: false
    };

    if (type === 'identity') {
      updateData.currentIdentity = id;
    } else if (type === 'craft') {
      updateData.currentCraft = id;
    } else if (type === 'region') {
      updateData.currentRegion = id;
    } else if (type === 'era') {
      updateData.currentEra = id;
    }

    this.setData(updateData);
    this.updateFilterCount();
    return this.loadList();
  },

  resetFilters() {
    const listKey = this.getListKey();
    this.setData({
      currentIdentity: 'all',
      currentCraft: 'all',
      currentRegion: 'all',
      currentEra: 'all',
      page: 1,
      [listKey]: [],
      hasMore: true,
      showFilter: false
    });
    this.updateFilterCount();
    return this.loadList();
  },

  updateFilterCount() {
    let count = 0;
    if (this.data.currentIdentity !== 'all') count++;
    if (this.data.currentCraft !== 'all') count++;
    if (this.data.currentRegion !== 'all') count++;
    if (this.data.currentEra !== 'all') count++;
    this.setData({ filterCount: count });
  }
});
