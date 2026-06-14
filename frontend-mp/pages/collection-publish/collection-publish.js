const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    isLoggedIn: false,
    hasPermission: false,

    typeList: [],
    formData: {
      title: '',
      type: '',
      endDate: '',
      endTime: '',
      targetCount: '',
      description: '',
      requirements: '',
      cover: ''
    },

    minDate: '',
    canSubmit: false,
    submitting: false,
    showSuccess: false,
    newCollectionId: ''
  },

  onLoad() {
    const today = new Date();
    const minDate = util.formatDate(today, 'YYYY-MM-DD');
    this.setData({ minDate });
    this.loadTypes();
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    const userInfo = app.getUserInfo();
    const hasPermission = isLoggedIn && userInfo &&
      (userInfo.role === 'admin' || userInfo.role === 'verified');

    this.setData({ isLoggedIn, hasPermission });
    this.checkCanSubmit();
  },

  async loadTypes() {
    try {
      const res = await api.getCollectionTypes();
      if (res.code === 200) {
        this.setData({ typeList: res.data });
      }
    } catch (error) {
      console.error('[CollectionPublish] 加载类型失败:', error);
    }
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  onTitleInput(e) {
    this.setData({ 'formData.title': e.detail.value });
    this.checkCanSubmit();
  },

  onTypeSelect(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ 'formData.type': id });
    this.checkCanSubmit();
  },

  onEndDateChange(e) {
    this.setData({ 'formData.endDate': e.detail.value });
    this.checkCanSubmit();
  },

  onTargetCountInput(e) {
    this.setData({ 'formData.targetCount': e.detail.value });
    this.checkCanSubmit();
  },

  onDescriptionInput(e) {
    this.setData({ 'formData.description': e.detail.value });
    this.checkCanSubmit();
  },

  onRequirementsInput(e) {
    this.setData({ 'formData.requirements': e.detail.value });
  },

  chooseCover() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (res.tempFiles && res.tempFiles.length > 0) {
          this.setData({ 'formData.cover': res.tempFiles[0].tempFilePath });
        }
      }
    });
  },

  removeCover() {
    this.setData({ 'formData.cover': '' });
  },

  checkCanSubmit() {
    const { title, type, endDate, targetCount, description } = this.data.formData;
    const canSubmit = !!(
      title && title.trim() &&
      type &&
      endDate &&
      targetCount && parseInt(targetCount) > 0 &&
      description && description.trim()
    );
    this.setData({ canSubmit });
  },

  async onSubmit() {
    if (!this.data.canSubmit || this.data.submitting) return;

    const app = getApp();
    if (!app.checkLogin()) return;

    const { formData } = this.data;

    this.setData({ submitting: true });
    wx.showLoading({ title: '发布中...' });

    try {
      const res = await api.createCollection({
        title: formData.title,
        type: formData.type,
        endTime: formData.endDate + ' 23:59:59',
        targetCount: formData.targetCount,
        description: formData.description,
        requirements: formData.requirements,
        cover: formData.cover
      });

      wx.hideLoading();

      if (res.code === 200) {
        this.setData({
          showSuccess: true,
          newCollectionId: res.data.id
        });
      } else if (res.code === 400 && res.data && res.data.matchedWords) {
        wx.showModal({
          title: '内容包含敏感词',
          content: '敏感词：' + res.data.matchedWords.join('、') + '\n\n请修改后重新提交',
          showCancel: false
        });
      } else {
        wx.showToast({
          title: res.message || '发布失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('[CollectionPublish] 发布失败:', error);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  goToNewCollection() {
    const { newCollectionId } = this.data;
    if (newCollectionId) {
      wx.redirectTo({
        url: `/pages/collection-detail/collection-detail?id=${newCollectionId}`
      });
    }
  },

  goBackToList() {
    wx.redirectTo({
      url: '/pages/collection-wall/collection-wall'
    });
  },

  publishAnother() {
    this.setData({
      showSuccess: false,
      formData: {
        title: '',
        type: '',
        endDate: '',
        endTime: '',
        targetCount: '',
        description: '',
        requirements: '',
        cover: ''
      },
      canSubmit: false,
      newCollectionId: ''
    });
  }
});
