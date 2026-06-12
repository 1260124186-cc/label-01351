// pages/village-select/village-select.js
// 村庄选择/切换页面

const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    currentVillageId: '',
    currentVillage: null,
    villageList: [],
    featuredChannels: [],
    searchKeyword: '',
    activeLevel: 'village',
    levelTabs: [
      { id: 'village', name: '村庄' },
      { id: 'county', name: '县级频道' },
      { id: 'city', name: '市级频道' }
    ],
    villageTree: []
  },

  onLoad() {
    this.loadCurrentVillage();
    this.loadFeaturedChannels();
    this.loadVillageList();
  },

  onShow() {
    this.loadCurrentVillage();
  },

  loadCurrentVillage() {
    const currentVillage = app.getCurrentVillage();
    const currentVillageId = app.getCurrentVillageId();
    this.setData({
      currentVillage,
      currentVillageId
    });
  },

  loadFeaturedChannels() {
    api.getFeaturedChannels().then(res => {
      if (res.code === 200) {
        this.setData({
          featuredChannels: res.data || []
        });
      }
    });
  },

  loadVillageList() {
    const { activeLevel, searchKeyword } = this.data;
    const params = {
      level: activeLevel,
      pageSize: 100
    };
    if (searchKeyword) {
      params.keyword = searchKeyword;
    }
    api.getVillageList(params).then(res => {
      if (res.code === 200) {
        this.setData({
          villageList: res.data.list || []
        });
      }
    });
  },

  onLevelChange(e) {
    const level = e.currentTarget.dataset.level;
    this.setData({
      activeLevel: level
    });
    this.loadVillageList();
  },

  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  onSearch() {
    this.loadVillageList();
  },

  clearSearch() {
    this.setData({
      searchKeyword: ''
    });
    this.loadVillageList();
  },

  selectVillage(e) {
    const villageId = e.currentTarget.dataset.id;
    if (villageId === this.data.currentVillageId) {
      wx.navigateBack();
      return;
    }
    const village = app.setCurrentVillage(villageId);
    if (village) {
      wx.showToast({
        title: `已切换到${village.name`,
        icon: 'success'
      });
      this.setData({
        currentVillage: village,
        currentVillageId: villageId
      });
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1000);
    }
  },

  selectChannel(e) {
    const villageId = e.currentTarget.dataset.id;
    const village = app.setCurrentVillage(villageId);
    if (village) {
      wx.showToast({
        title: `已切换到${village.name}`,
        icon: 'success'
      });
      this.setData({
        currentVillage: village,
        currentVillageId: villageId
      });
    }
  }
});
