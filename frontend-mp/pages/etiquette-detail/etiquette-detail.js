const api = require('../../utils/api');
const etiquetteData = require('../../utils/etiquette-data');

Page({
  data: {
    id: '',
    detail: null,
    loading: true,
    activeTab: 'process',
    isFavorite: false,
    currentRegion: 'all',
    regionOptions: [],
    filteredRegionDiffs: []
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id });
    }
    var regions = etiquetteData.getRegionList();
    var regionOptions = [{ id: 'all', name: '全部地区', provinces: [] }].concat(regions);
    this.setData({ regionOptions: regionOptions });
  },

  onShow() {
    if (this.data.id && !this.data.detail) {
      this.loadDetail(this.data.id);
    } else if (this.data.id && this.data.detail) {
      this.checkFavoriteStatus();
    }
  },

  async loadDetail(id) {
    this.setData({ loading: true });
    try {
      var res = await api.getEtiquetteDetail(id);
      if (res.code === 200 && res.data) {
        var detail = res.data;

        var navTitle = detail.title.length > 12
          ? detail.title.substring(0, 12) + '...'
          : detail.title;
        wx.setNavigationBarTitle({ title: navTitle });

        this.setData({
          detail: detail,
          isFavorite: detail.isFavorite || false,
          loading: false,
          filteredRegionDiffs: detail.regionalDiffs || []
        });
      } else {
        this.setData({ detail: null, loading: false });
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[EtiquetteDetail] 加载详情失败:', error);
      this.setData({ detail: null, loading: false });
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    }
  },

  async checkFavoriteStatus() {
    try {
      var res = await api.checkEtiquetteFavorite(this.data.id);
      if (res.code === 200) {
        this.setData({ isFavorite: res.data.isFavorite });
      }
    } catch (error) {
      console.error('[EtiquetteDetail] 检查收藏状态失败:', error);
    }
  },

  switchTab(e) {
    var tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  onRegionFilter(e) {
    var regionId = e.currentTarget.dataset.id;
    this.setData({ currentRegion: regionId });
    this.filterRegionDiffs(regionId);
  },

  filterRegionDiffs(regionId) {
    var detail = this.data.detail;
    if (!detail || !detail.regionalDiffs) {
      this.setData({ filteredRegionDiffs: [] });
      return;
    }
    var diffs;
    if (regionId === 'all') {
      diffs = detail.regionalDiffs;
    } else {
      diffs = detail.regionalDiffs.filter(function(rd) {
        return rd.region === regionId || rd.province === regionId;
      });
    }
    this.setData({ filteredRegionDiffs: diffs });
  },

  async onFavorite() {
    var app = getApp();
    if (!app.checkLogin()) return;

    var isFav = this.data.isFavorite;
    try {
      var res;
      if (isFav) {
        res = await api.unfavoriteEtiquette(this.data.id);
      } else {
        res = await api.favoriteEtiquette(this.data.id);
      }
      if (res.code === 200) {
        wx.showToast({
          title: isFav ? '已取消收藏' : '收藏成功',
          icon: 'none'
        });
        this.setData({ isFavorite: !isFav });
      }
    } catch (error) {
      console.error('[EtiquetteDetail] 收藏操作失败:', error);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  onShareAppMessage() {
    var detail = this.data.detail;
    if (!detail) return {};
    return {
      title: detail.title,
      path: '/pages/etiquette-detail/etiquette-detail?id=' + detail.id
    };
  }
});
