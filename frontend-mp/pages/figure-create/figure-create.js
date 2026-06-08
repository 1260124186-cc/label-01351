// pages/figure-create/figure-create.js
// 新建人物草稿页

const api = require('../../utils/api');
const figureData = require('../../utils/figure-data');

Page({
  data: {
    isLoggedIn: false,
    submitting: false,
    showSuccess: false,

    identityList: [],
    craftList: [],
    regionList: [],
    eraList: [],

    formData: {
      name: '',
      birthYear: '',
      deathYear: '',
      identity: '',
      region: '',
      era: '',
      crafts: [],
      briefIntroduction: '',
      detailedIntroduction: '',
      timeline: [],
      works: []
    },

    newTimeline: {
      year: '',
      event: ''
    },

    newWork: {
      title: '',
      type: 'story',
      content: ''
    },

    workTypes: [
      { id: 'work', name: '作品' },
      { id: 'story', name: '故事' },
      { id: 'article', name: '文章' }
    ],

    canSubmit: false
  },

  onLoad() {
    this.loadOptions();
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  async loadOptions() {
    try {
      const res = await api.getFilterOptions();
      if (res.code === 200) {
        this.setData({
          identityList: res.data.identityList.filter(item => item.id !== 'all'),
          craftList: res.data.craftList.filter(item => item.id !== 'all'),
          regionList: res.data.regionList.filter(item => item.id !== 'all'),
          eraList: res.data.eraList.filter(item => item.id !== 'all')
        });
      }
    } catch (error) {
      console.error('[FigureCreate] 加载选项失败:', error);
    }
  },

  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value });
    this.checkCanSubmit();
  },

  onBirthYearInput(e) {
    const value = e.detail.value;
    if (value === '' || /^\d{0,4}$/.test(value)) {
      this.setData({ 'formData.birthYear': value });
      this.checkCanSubmit();
    }
  },

  onDeathYearInput(e) {
    const value = e.detail.value;
    if (value === '' || /^\d{0,4}$/.test(value)) {
      this.setData({ 'formData.deathYear': value });
    }
  },

  onIdentitySelect(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ 'formData.identity': id });
    this.checkCanSubmit();
  },

  onRegionSelect(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ 'formData.region': id });
  },

  onEraSelect(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ 'formData.era': id });
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

  onBriefInput(e) {
    this.setData({ 'formData.briefIntroduction': e.detail.value });
    this.checkCanSubmit();
  },

  onDetailedInput(e) {
    this.setData({ 'formData.detailedIntroduction': e.detail.value });
  },

  onTimelineYearInput(e) {
    const value = e.detail.value;
    if (value === '' || /^\d{0,4}$/.test(value)) {
      this.setData({ 'newTimeline.year': value });
    }
  },

  onTimelineEventInput(e) {
    this.setData({ 'newTimeline.event': e.detail.value });
  },

  addTimeline() {
    const { year, event } = this.data.newTimeline;
    if (!year || !event.trim()) {
      wx.showToast({ title: '请填写年份和事件', icon: 'none' });
      return;
    }

    const timeline = [...this.data.formData.timeline];
    timeline.push({
      year: parseInt(year),
      event: event.trim()
    });
    timeline.sort((a, b) => a.year - b.year);

    this.setData({
      'formData.timeline': timeline,
      newTimeline: { year: '', event: '' }
    });
  },

  removeTimeline(e) {
    const index = e.currentTarget.dataset.index;
    const timeline = [...this.data.formData.timeline];
    timeline.splice(index, 1);
    this.setData({ 'formData.timeline': timeline });
  },

  onWorkTitleInput(e) {
    this.setData({ 'newWork.title': e.detail.value });
  },

  onWorkTypeSelect(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ 'newWork.type': type });
  },

  onWorkContentInput(e) {
    this.setData({ 'newWork.content': e.detail.value });
  },

  addWork() {
    const { title, type, content } = this.data.newWork;
    if (!title.trim() || !content.trim()) {
      wx.showToast({ title: '请填写标题和内容', icon: 'none' });
      return;
    }

    const works = [...this.data.formData.works];
    works.push({
      id: 'work_' + Date.now(),
      title: title.trim(),
      type,
      content: content.trim()
    });

    this.setData({
      'formData.works': works,
      newWork: { title: '', type: 'story', content: '' }
    });
  },

  removeWork(e) {
    const index = e.currentTarget.dataset.index;
    const works = [...this.data.formData.works];
    works.splice(index, 1);
    this.setData({ 'formData.works': works });
  },

  checkCanSubmit() {
    const { name, identity, briefIntroduction } = this.data.formData;
    const canSubmit = name.trim().length >= 2 &&
                      identity !== '' &&
                      briefIntroduction.trim().length >= 10;
    this.setData({ canSubmit });
  },

  async onSubmit() {
    const app = getApp();
    if (!app.checkLogin()) return;

    if (this.data.submitting) return;

    const { name, birthYear, deathYear, identity, region, era, crafts,
            briefIntroduction, detailedIntroduction, timeline, works } = this.data.formData;

    if (!name || name.trim().length < 2) {
      wx.showToast({ title: '请输入人物姓名（至少2字）', icon: 'none' });
      return;
    }

    if (!identity) {
      wx.showToast({ title: '请选择人物身份', icon: 'none' });
      return;
    }

    if (!briefIntroduction || briefIntroduction.trim().length < 10) {
      wx.showToast({ title: '请填写人物简介（至少10字）', icon: 'none' });
      return;
    }

    const submitData = {
      name: name.trim(),
      birthYear: birthYear ? parseInt(birthYear) : null,
      deathYear: deathYear ? parseInt(deathYear) : null,
      identity,
      region: region || '',
      era: era || '',
      crafts: crafts || [],
      briefIntroduction: briefIntroduction.trim(),
      detailedIntroduction: detailedIntroduction.trim(),
      timeline: timeline || [],
      works: works || []
    };

    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...' });

    try {
      const res = await api.createFigureDraft(submitData);

      wx.hideLoading();

      if (res.code === 200) {
        this.setData({ showSuccess: true });
      } else {
        wx.showToast({ title: res.message || '提交失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[FigureCreate] 提交失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  goToFigureList() {
    this.setData({ showSuccess: false });
    wx.switchTab({ url: '/pages/figures/figures' });
  },

  continueCreate() {
    this.setData({
      showSuccess: false,
      formData: {
        name: '',
        birthYear: '',
        deathYear: '',
        identity: '',
        region: '',
        era: '',
        crafts: [],
        briefIntroduction: '',
        detailedIntroduction: '',
        timeline: [],
        works: []
      },
      canSubmit: false
    });
  }
});
