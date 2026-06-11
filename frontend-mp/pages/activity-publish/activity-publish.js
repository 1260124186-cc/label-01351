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
      startTime: '',
      startDate: '',
      startHour: '09:00',
      endTime: '',
      endDate: '',
      endHour: '11:00',
      location: '',
      maxParticipants: '',
      description: '',
      cover: ''
    },

    minDate: '',
    canSubmit: false,
    submitting: false,
    showSuccess: false,
    newActivityId: ''
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
      const res = await api.getActivityTypes();
      if (res.code === 200) {
        this.setData({ typeList: res.data });
      }
    } catch (error) {
      console.error('[ActivityPublish] 加载类型失败:', error);
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

  onStartDateChange(e) {
    const startDate = e.detail.value;
    this.setData({
      'formData.startDate': startDate,
      'formData.startTime': `${startDate} ${this.data.formData.startHour}:00`
    });
    this.updateEndTimeIfNeeded();
    this.checkCanSubmit();
  },

  onStartHourChange(e) {
    const startHour = e.detail.value;
    const { startDate } = this.data.formData;
    this.setData({
      'formData.startHour': startHour,
      'formData.startTime': startDate ? `${startDate} ${startHour}:00` : ''
    });
    this.updateEndTimeIfNeeded();
    this.checkCanSubmit();
  },

  onEndDateChange(e) {
    const endDate = e.detail.value;
    this.setData({
      'formData.endDate': endDate,
      'formData.endTime': `${endDate} ${this.data.formData.endHour}:00`
    });
    this.checkCanSubmit();
  },

  onEndHourChange(e) {
    const endHour = e.detail.value;
    const { endDate } = this.data.formData;
    this.setData({
      'formData.endHour': endHour,
      'formData.endTime': endDate ? `${endDate} ${endHour}:00` : ''
    });
    this.checkCanSubmit();
  },

  updateEndTimeIfNeeded() {
    const { startDate, startHour, endDate, endHour } = this.data.formData;
    if (!endDate && startDate) {
      this.setData({
        'formData.endDate': startDate,
        'formData.endTime': `${startDate} ${endHour}:00`
      });
    }
  },

  onLocationInput(e) {
    this.setData({ 'formData.location': e.detail.value });
    this.checkCanSubmit();
  },

  onMaxParticipantsInput(e) {
    this.setData({ 'formData.maxParticipants': e.detail.value });
    this.checkCanSubmit();
  },

  onDescriptionInput(e) {
    this.setData({ 'formData.description': e.detail.value });
    this.checkCanSubmit();
  },

  checkCanSubmit() {
    const { title, type, startTime, endTime, location, maxParticipants, description } = this.data.formData;
    const canSubmit = title.trim().length >= 2 &&
      type !== '' &&
      startTime !== '' &&
      endTime !== '' &&
      location.trim().length > 0 &&
      parseInt(maxParticipants) > 0 &&
      description.trim().length >= 10;

    this.setData({ canSubmit });
  },

  async onSubmit() {
    if (this.data.submitting) return;

    const app = getApp();
    if (!app.checkLogin()) return;

    const { title, type, startTime, endTime, location, maxParticipants, description, cover } = this.data.formData;

    if (!title || title.trim().length < 2) {
      wx.showToast({ title: '请输入活动标题（至少2字）', icon: 'none' });
      return;
    }
    if (!type) {
      wx.showToast({ title: '请选择活动类型', icon: 'none' });
      return;
    }
    if (!startTime) {
      wx.showToast({ title: '请选择开始时间', icon: 'none' });
      return;
    }
    if (!endTime) {
      wx.showToast({ title: '请选择结束时间', icon: 'none' });
      return;
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      wx.showToast({ title: '结束时间必须晚于开始时间', icon: 'none' });
      return;
    }
    if (!location || location.trim().length === 0) {
      wx.showToast({ title: '请输入活动地点', icon: 'none' });
      return;
    }
    if (!maxParticipants || parseInt(maxParticipants) <= 0) {
      wx.showToast({ title: '请输入有效的人数上限', icon: 'none' });
      return;
    }
    if (!description || description.trim().length < 10) {
      wx.showToast({ title: '请输入活动详情（至少10字）', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({ title: '发布中...' });

    try {
      const activityData = {
        title: title.trim(),
        type,
        startTime,
        endTime,
        location: location.trim(),
        maxParticipants: parseInt(maxParticipants),
        description: description.trim()
      };
      if (cover) {
        activityData.cover = cover;
      }

      const res = await api.createActivity(activityData);

      wx.hideLoading();

      if (res.code === 200) {
        this.setData({
          showSuccess: true,
          newActivityId: res.data.id,
          formData: {
            title: '',
            type: '',
            startTime: '',
            startDate: '',
            startHour: '09:00',
            endTime: '',
            endDate: '',
            endHour: '11:00',
            location: '',
            maxParticipants: '',
            description: '',
            cover: ''
          },
          canSubmit: false
        });
      } else {
        wx.showToast({ title: res.message || '发布失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[ActivityPublish] 发布活动异常:', error);
      wx.hideLoading();
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  continuePublish() {
    this.setData({ showSuccess: false });
  },

  goToActivity() {
    const { newActivityId } = this.data;
    this.setData({ showSuccess: false });

    if (newActivityId) {
      wx.redirectTo({
        url: `/pages/activity-detail/activity-detail?id=${newActivityId}`
      });
    } else {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  goToList() {
    this.setData({ showSuccess: false });
    wx.navigateBack();
  }
});
