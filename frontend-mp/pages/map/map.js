const api = require('../../utils/api');

Page({
  data: {
    latitude: 30.2672,
    longitude: 120.1552,
    markers: [],
    categories: [],
    selectedCategory: 'all',
    showFilter: false,
    landmarkList: [],
    loading: false,
    isLoggedIn: false
  },

  onLoad() {
    this.loadCategories();
    this.loadLandmarks();
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });
    this.loadLandmarks(this.data.selectedCategory);
  },

  async loadCategories() {
    try {
      const res = await api.getLandmarkCategories();
      if (res.code === 200 && res.data) {
        this.setData({ categories: res.data });
      }
    } catch (error) {
      console.error('[Map] 加载分类失败:', error);
    }
  },

  async loadLandmarks(category = 'all') {
    this.setData({ loading: true });
    try {
      const res = await api.getLandmarkList({ category });
      if (res.code === 200 && res.data) {
        const { list } = res.data;
        const processedList = list.map(item => ({
          ...item,
          categoryName: this.getCategoryName(item.category)
        }));
        this.setData({
          landmarkList: processedList,
          markers: list.map(item => ({
            id: item.id,
            latitude: item.latitude,
            longitude: item.longitude,
            iconPath: this.getCategoryIcon(item.category),
            width: 32,
            height: 32,
            callout: {
              content: item.name,
              fontSize: 12,
              borderRadius: 4,
              bgColor: '#ffffff',
              padding: 6
            }
          }))
        });
      }
    } catch (error) {
      console.error('[Map] 加载地标失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  getCategoryIcon(category) {
    const iconMap = {
      'folklore': 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=traditional%20chinese%20cultural%20site%20icon%20red%20pin&image_size=square',
      'nature': 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=nature%20landscape%20icon%20green%20pin&image_size=square',
      'craft': 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=traditional%20craft%20workshop%20icon%20blue%20pin&image_size=square',
      'history': 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=ancient%20history%20site%20icon%20yellow%20pin&image_size=square'
    };
    return iconMap[category] || iconMap['folklore'];
  },

  onMarkerTap(e) {
    const markerId = e.detail.markerId;
    const landmark = this.data.landmarkList.find(item => item.id === markerId);
    if (landmark) {
      wx.navigateTo({
        url: `/pages/landmark-detail/landmark-detail?id=${landmark.id}`
      });
    }
  },

  onCategorySelect(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({
      selectedCategory: categoryId,
      showFilter: false
    });
    this.loadLandmarks(categoryId);
  },

  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter });
  },

  goToPublish() {
    const app = getApp();
    if (!app.getLoginStatus()) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    wx.navigateTo({
      url: '/pages/landmark-publish/landmark-publish'
    });
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  goToDetail(e) {
    const landmarkId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/landmark-detail/landmark-detail?id=${landmarkId}`
    });
  },

  getCategoryName(category) {
    const categoryMap = {
      'folklore': '民俗遗址',
      'nature': '自然景观',
      'craft': '传统技艺传习地',
      'history': '历史古迹'
    };
    return categoryMap[category] || '其他';
  },

  onRegionChange(e) {
    if (e.type === 'end') {
      const { detail } = e;
      this.setData({
        latitude: detail.centerLocation.latitude,
        longitude: detail.centerLocation.longitude
      });
    }
  },

  onShareAppMessage() {
    return {
      title: '乡村文化地图',
      path: '/pages/map/map'
    };
  }
});