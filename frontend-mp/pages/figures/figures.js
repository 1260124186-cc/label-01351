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
    this.refreshData();
    this.updateFilterCount();
  },

  onFilterChange(e) {
    const result = this._superOnFilterChange(e);
    this.updateFilterCount();
    return result;
  },

  resetFilters() {
    const result = this._superResetFilters();
    this.updateFilterCount();
    return result;
  },

  _superOnFilterChange(e) {
    return figureListBehavior.methods.onFilterChange.call(this, e);
  },

  _superResetFilters() {
    return figureListBehavior.methods.resetFilters.call(this);
  },

  updateFilterCount() {
    const count = this.getActiveFilterCount();
    this.setData({ filterCount: count });
  },

  getActiveFilterCount() {
    return figureListBehavior.methods.getActiveFilterCount.call(this);
  }
});
