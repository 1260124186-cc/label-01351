const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    isLoggedIn: false,
    categories: [],
    formData: {
      name: '',
      category: '',
      description: '',
      address: '',
      latitude: '',
      longitude: '',
      history: '',
      cover: ''
    },
    submitting: false,
    showSuccess: false,
    newLandmarkId: ''
  },

  onLoad() {
    this.loadCategories();
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  async loadCategories() {
    try {
      const res = await api.getLandmarkCategories();
      if (res.code === 200 && res.data) {
        const categories = res.data.filter(item => item.id !== 'all');
        this.setData({ categories });
      }
    } catch (error) {
      console.error('[LandmarkPublish] 加载分类失败:', error);
    }
  },

  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value });
  },

  onCategorySelect(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({ 'formData.category': categoryId });
  },

  onDescriptionInput(e) {
    this.setData({ 'formData.description': e.detail.value });
  },

  onAddressInput(e) {
    this.setData({ 'formData.address': e.detail.value });
  },

  onLatitudeInput(e) {
    this.setData({ 'formData.latitude': parseFloat(e.detail.value) || '' });
  },

  onLongitudeInput(e) {
    this.setData({ 'formData.longitude': parseFloat(e.detail.value) || '' });
  },

  onHistoryInput(e) {
    this.setData({ 'formData.history': e.detail.value });
  },

  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          'formData.latitude': res.latitude,
          'formData.longitude': res.longitude
        });
        wx.showToast({ title: '定位成功', icon: 'success' });
      },
      fail: (err) => {
        console.error('[LandmarkPublish] 获取位置失败:', err);
        wx.showToast({ title: '定位失败，请手动输入坐标', icon: 'none' });
      }
    });
  },

  checkForm() {
    const { name, category, description, address, latitude, longitude } = this.data.formData;
    
    if (!name || name.trim().length < 2) {
      wx.showToast({ title: '请输入地标名称（至少2字）', icon: 'none' });
      return false;
    }
    
    if (!category) {
      wx.showToast({ title: '请选择地标分类', icon: 'none' });
      return false;
    }
    
    if (!description || description.trim().length < 10) {
      wx.showToast({ title: '请输入地标简介（至少10字）', icon: 'none' });
      return false;
    }
    
    if (!address || !address.trim()) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' });
      return false;
    }
    
    if (!latitude || !longitude) {
      wx.showToast({ title: '请获取或输入坐标', icon: 'none' });
      return false;
    }
    
    return true;
  },

  async onSubmit() {
    if (this.data.submitting) return;
    if (!this.checkForm()) return;

    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...' });

    try {
      const { name, category, description, address, latitude, longitude, history } = this.data.formData;
      const res = await api.createLandmark({
        name: name.trim(),
        category,
        description: description.trim(),
        address: address.trim(),
        latitude,
        longitude,
        history: history.trim() || ''
      });

      wx.hideLoading();

      if (res.code === 200) {
        this.setData({
          showSuccess: true,
          newLandmarkId: res.data.id
        });
      } else {
        wx.showToast({ title: res.message || '提交失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[LandmarkPublish] 提交地标失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  continuePublish() {
    this.setData({
      showSuccess: false,
      formData: {
        name: '',
        category: '',
        description: '',
        address: '',
        latitude: '',
        longitude: '',
        history: '',
        cover: ''
      }
    });
  },

  goToMap() {
    this.setData({ showSuccess: false });
    wx.navigateBack();
  }
});