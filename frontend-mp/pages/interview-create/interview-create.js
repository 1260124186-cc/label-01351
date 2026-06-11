// pages/interview-create/interview-create.js
// 访谈投稿表单页

const api = require('../../utils/api');
const interviewData = require('../../utils/interview-data');

Page({
  data: {
    isLoggedIn: false,
    submitting: false,
    showSuccess: false,

    craftList: [],
    regionList: [],
    collectionList: [],
    genderOptions: [
      { id: 'male', name: '男' },
      { id: 'female', name: '女' }
    ],

    formData: {
      intervieweeName: '',
      gender: '',
      age: '',
      birthYear: '',
      occupation: '',
      region: '',
      address: '',
      interviewDate: '',
      interviewLocation: '',
      interviewer: '',
      crafts: [],
      summary: '',
      content: '',
      collectionIds: [],
      tags: '',
      relatedFigureId: ''
    },

    canSubmit: false
  },

  onLoad() {
    this.loadOptions();
    this.setToday();
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });
  },

  setToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.setData({ 'formData.interviewDate': `${year}-${month}-${day}` });
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  async loadOptions() {
    try {
      const res = await api.getInterviewFilterOptions();
      if (res.code === 200) {
        this.setData({
          craftList: res.data.craftList.filter(item => item.id !== 'all'),
          regionList: res.data.regionList.filter(item => item.id !== 'all')
        });
      }
    } catch (error) {
      console.error('[InterviewCreate] 加载选项失败:', error);
      this.setData({
        craftList: interviewData.CRAFT_TYPES.filter(item => item.id !== 'all'),
        regionList: interviewData.REGIONS.filter(item => item.id !== 'all')
      });
    }

    this.setData({
      collectionList: interviewData.COLLECTION_TYPES
    });
  },

  onNameInput(e) {
    this.setData({ 'formData.intervieweeName': e.detail.value });
    this.checkCanSubmit();
  },

  onGenderSelect(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ 'formData.gender': id });
  },

  onAgeInput(e) {
    const value = e.detail.value;
    if (value === '' || /^\d{0,3}$/.test(value)) {
      this.setData({ 'formData.age': value });
    }
  },

  onBirthYearInput(e) {
    const value = e.detail.value;
    if (value === '' || /^\d{0,4}$/.test(value)) {
      this.setData({ 'formData.birthYear': value });
    }
  },

  onOccupationInput(e) {
    this.setData({ 'formData.occupation': e.detail.value });
  },

  onRegionSelect(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ 'formData.region': id });
  },

  onAddressInput(e) {
    this.setData({ 'formData.address': e.detail.value });
  },

  onInterviewDateChange(e) {
    this.setData({ 'formData.interviewDate': e.detail.value });
  },

  onInterviewLocationInput(e) {
    this.setData({ 'formData.interviewLocation': e.detail.value });
  },

  onInterviewerInput(e) {
    this.setData({ 'formData.interviewer': e.detail.value });
  },

  onCraftToggle(e) {
    const id = e.currentTarget.dataset.id;
    const crafts = [...this.data.formData.crafts];
    const index = crafts.indexOf(id);
    if (index > -1) {
      crafts.splice(index, 1);
    } else {
      crafts.push(id);
    }
    this.setData({ 'formData.crafts': crafts });
  },

  onCollectionToggle(e) {
    const id = e.currentTarget.dataset.id;
    const collectionIds = [...this.data.formData.collectionIds];
    const index = collectionIds.indexOf(id);
    if (index > -1) {
      collectionIds.splice(index, 1);
    } else {
      collectionIds.push(id);
    }
    this.setData({ 'formData.collectionIds': collectionIds });
  },

  onSummaryInput(e) {
    this.setData({ 'formData.summary': e.detail.value });
    this.checkCanSubmit();
  },

  onContentInput(e) {
    this.setData({ 'formData.content': e.detail.value });
    this.checkCanSubmit();
  },

  onTagsInput(e) {
    this.setData({ 'formData.tags': e.detail.value });
  },

  onRelatedFigureInput(e) {
    this.setData({ 'formData.relatedFigureId': e.detail.value });
  },

  checkCanSubmit() {
    const { intervieweeName, summary, content } = this.data.formData;
    const canSubmit = intervieweeName.trim().length >= 2 &&
                      summary.trim().length >= 20 &&
                      content.trim().length >= 50;
    this.setData({ canSubmit });
  },

  async onSubmit() {
    const app = getApp();
    if (!app.checkLogin()) return;

    if (this.data.submitting) return;

    const {
      intervieweeName, gender, age, birthYear, occupation, region, address,
      interviewDate, interviewLocation, interviewer, crafts, summary, content,
      collectionIds, tags, relatedFigureId
    } = this.data.formData;

    if (!intervieweeName || intervieweeName.trim().length < 2) {
      wx.showToast({ title: '请输入受访者姓名（至少2字）', icon: 'none' });
      return;
    }

    if (!summary || summary.trim().length < 20) {
      wx.showToast({ title: '请填写访谈摘要（至少20字）', icon: 'none' });
      return;
    }

    if (!content || content.trim().length < 50) {
      wx.showToast({ title: '请填写访谈内容（至少50字）', icon: 'none' });
      return;
    }

    const tagArray = tags
      ? tags.split(/[,，\s]+/).filter(t => t.trim())
      : [];

    const submitData = {
      intervieweeName: intervieweeName.trim(),
      gender: gender || '',
      age: age ? parseInt(age) : null,
      birthYear: birthYear ? parseInt(birthYear) : null,
      occupation: occupation.trim(),
      region: region || '',
      address: address.trim(),
      interviewDate: interviewDate || '',
      interviewLocation: interviewLocation.trim(),
      interviewer: interviewer.trim(),
      crafts: crafts || [],
      summary: summary.trim(),
      content: content.trim(),
      collectionIds: collectionIds || [],
      tags: tagArray,
      relatedFigureId: relatedFigureId.trim() || ''
    };

    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...' });

    try {
      const res = await api.createInterview(submitData);

      wx.hideLoading();

      if (res.code === 200) {
        this.setData({ showSuccess: true });
      } else {
        wx.showToast({ title: res.message || '提交失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[InterviewCreate] 提交失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  async saveDraft() {
    const app = getApp();
    if (!app.checkLogin()) return;

    const {
      intervieweeName, gender, age, birthYear, occupation, region, address,
      interviewDate, interviewLocation, interviewer, crafts, summary, content,
      collectionIds, tags, relatedFigureId
    } = this.data.formData;

    if (!intervieweeName && !summary && !content) {
      wx.showToast({ title: '请填写至少一项内容', icon: 'none' });
      return;
    }

    const tagArray = tags
      ? tags.split(/[,，\s]+/).filter(t => t.trim())
      : [];

    const draftData = {
      intervieweeName: intervieweeName.trim(),
      gender: gender || '',
      age: age ? parseInt(age) : null,
      birthYear: birthYear ? parseInt(birthYear) : null,
      occupation: occupation.trim(),
      region: region || '',
      address: address.trim(),
      interviewDate: interviewDate || '',
      interviewLocation: interviewLocation.trim(),
      interviewer: interviewer.trim(),
      crafts: crafts || [],
      summary: summary.trim(),
      content: content.trim(),
      collectionIds: collectionIds || [],
      tags: tagArray,
      relatedFigureId: relatedFigureId.trim() || ''
    };

    wx.showLoading({ title: '保存中...' });

    try {
      const res = await api.createInterviewDraft(draftData);

      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({ title: '草稿已保存', icon: 'success' });
      } else {
        wx.showToast({ title: res.message || '保存失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[InterviewCreate] 保存草稿失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    }
  },

  goToInterviewList() {
    this.setData({ showSuccess: false });
    wx.navigateBack({ delta: 1, fail: () => {
      wx.switchTab({ url: '/pages/interviews/interviews' });
    }});
  },

  continueCreate() {
    this.setData({
      showSuccess: false,
      formData: {
        intervieweeName: '',
        gender: '',
        age: '',
        birthYear: '',
        occupation: '',
        region: '',
        address: '',
        interviewDate: '',
        interviewLocation: '',
        interviewer: '',
        crafts: [],
        summary: '',
        content: '',
        collectionIds: [],
        tags: '',
        relatedFigureId: ''
      },
      canSubmit: false
    });
    this.setToday();
  }
});
