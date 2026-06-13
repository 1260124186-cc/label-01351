const api = require('../../utils/api');
const etiquetteData = require('../../utils/etiquette-data');

Page({
  data: {
    scenes: [],
    regions: [],
    currentScene: 'all',
    currentRegion: 'all',
    recommendRegion: null,
    locationText: '',
    etiquetteList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    keyword: '',
    loading: false,
    loadingMore: false,
    showRegionPicker: false,
    showFavOnly: false
  },

  _loadRequestId: 0,

  onLoad() {
    this.loadScenes();
    this.loadRegions();
    this.loadRecommendRegion();
  },

  onShow() {
    if (this.data.etiquetteList.length === 0) {
      this.refreshData();
    } else {
      this.refreshData();
    }
  },

  onPullDownRefresh() {
    this.refreshData().then(function() {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  async loadScenes() {
    var res = await api.getEtiquetteScenes();
    if (res.code === 200) {
      var scenes = [{ id: 'all', name: '全部', icon: '📖', desc: '所有场景' }].concat(res.data);
      this.setData({ scenes: scenes });
    }
  },

  async loadRegions() {
    var res = await api.getEtiquetteRegions();
    if (res.code === 200) {
      var regions = [{ id: 'all', name: '全部地区', provinces: [] }].concat(res.data);
      this.setData({ regions: regions });
    }
  },

  async loadRecommendRegion() {
    var res = await api.getEtiquetteRecommendRegion();
    if (res.code === 200 && res.data.region) {
      this.setData({
        recommendRegion: res.data.region,
        locationText: res.data.location
      });
    }
  },

  async refreshData() {
    this._loadRequestId++;
    this.setData({
      page: 1,
      etiquetteList: [],
      hasMore: true
    });
    return this.loadList();
  },

  async loadList(requestId) {
    if (!requestId) {
      requestId = ++this._loadRequestId;
    }
    this.setData({ loading: true });

    try {
      var res = await api.getEtiquetteList({
        scene: this.data.currentScene,
        region: this.data.currentRegion,
        page: this.data.page,
        pageSize: this.data.pageSize,
        keyword: this.data.keyword
      });

      if (requestId !== this._loadRequestId) {
        return { cancelled: true };
      }

      if (res.code === 200) {
        var list = res.data.list.map(function(item) {
          var sceneInfo = etiquetteData.getSceneById(item.scene);
          return Object.assign({}, item, {
            sceneName: sceneInfo ? sceneInfo.name : '',
            sceneIcon: sceneInfo ? sceneInfo.icon : ''
          });
        });

        this.setData({
          etiquetteList: this.data.page === 1 ? list : this.data.etiquetteList.concat(list),
          hasMore: res.data.hasMore
        });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }

      return { cancelled: false, success: res.code === 200 };
    } catch (error) {
      if (requestId !== this._loadRequestId) {
        return { cancelled: true };
      }
      console.error('[Etiquette] 加载列表失败:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      return { cancelled: false, success: false, error: error };
    } finally {
      if (requestId === this._loadRequestId) {
        this.setData({ loading: false });
      }
    }
  },

  async loadMore() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    this.setData({
      loadingMore: true,
      page: this.data.page + 1
    });
    var result = await this.loadList();
    if (!result.cancelled) {
      this.setData({ loadingMore: false });
    }
    return result;
  },

  onSceneChange(e) {
    var id = e.currentTarget.dataset.id;
    if (id === this.data.currentScene) return;
    this._loadRequestId++;
    this.setData({
      currentScene: id,
      page: 1,
      etiquetteList: [],
      hasMore: true
    });
    return this.loadList();
  },

  onRegionChange(e) {
    var id = e.currentTarget.dataset.id;
    if (id === this.data.currentRegion) return;
    this._loadRequestId++;
    this.setData({
      currentRegion: id,
      showRegionPicker: false,
      page: 1,
      etiquetteList: [],
      hasMore: true
    });
    return this.loadList();
  },

  toggleRegionPicker() {
    this.setData({ showRegionPicker: !this.data.showRegionPicker });
  },

  useRecommendRegion() {
    if (!this.data.recommendRegion) return;
    if (this.data.currentRegion === this.data.recommendRegion.id) return;
    this._loadRequestId++;
    this.setData({
      currentRegion: this.data.recommendRegion.id,
      showRegionPicker: false,
      page: 1,
      etiquetteList: [],
      hasMore: true
    });
    return this.loadList();
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  async onSearch() {
    this._loadRequestId++;
    this.setData({
      page: 1,
      etiquetteList: [],
      hasMore: true
    });
    return this.loadList();
  },

  async clearSearch() {
    this._loadRequestId++;
    this.setData({
      keyword: '',
      page: 1,
      etiquetteList: [],
      hasMore: true
    });
    return this.loadList();
  },

  goToDetail(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/etiquette-detail/etiquette-detail?id=' + id
    });
  },

  async onFavorite(e) {
    var app = getApp();
    if (!app.checkLogin()) return;

    var id = e.currentTarget.dataset.id;
    var isFav = e.currentTarget.dataset.fav;
    var that = this;

    try {
      var res;
      if (isFav) {
        res = await api.unfavoriteEtiquette(id);
      } else {
        res = await api.favoriteEtiquette(id);
      }

      if (res.code === 200) {
        wx.showToast({
          title: isFav ? '已取消收藏' : '收藏成功',
          icon: 'none'
        });

        var list = that.data.etiquetteList.map(function(item) {
          if (item.id === id) {
            return Object.assign({}, item, { isFavorite: !isFav });
          }
          return item;
        });
        that.setData({ etiquetteList: list });
      }
    } catch (error) {
      console.error('[Etiquette] 收藏操作失败:', error);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  toggleFavOnly() {
    this.setData({ showFavOnly: !this.data.showFavOnly });
  },

  onShareAppMessage() {
    return {
      title: '红白礼仪与乡风民俗指南',
      path: '/pages/etiquette/etiquette'
    };
  }
});
