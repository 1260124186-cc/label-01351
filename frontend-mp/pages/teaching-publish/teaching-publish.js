var api = require('../../utils/api');
var pairingData = require('../../utils/pairing-data');
var figureData = require('../../utils/figure-data');

Page({
  data: {
    skillTypes: [],
    teachingMethods: [],
    regions: [],
    timeCommitments: [],
    figureList: [],
    form: {
      skillType: '',
      title: '',
      description: '',
      method: '',
      region: '',
      location: '',
      maxStudents: '',
      timeCommitment: '',
      tags: [],
      relatedFigureId: ''
    },
    tagInput: '',
    submitting: false
  },

  onLoad: function() {
    var app = getApp();
    if (!app.checkLogin()) {
      wx.navigateBack();
      return;
    }
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo.role !== 'admin' && userInfo.role !== 'certified') {
      wx.showToast({ title: '无权限发布传授技艺', icon: 'none' });
      setTimeout(function() { wx.navigateBack(); }, 1500);
      return;
    }

    this.setData({
      skillTypes: pairingData.SKILL_TAGS,
      teachingMethods: pairingData.TEACHING_METHODS,
      regions: figureData.REGIONS,
      timeCommitments: pairingData.TIME_COMMITMENTS,
      figureList: figureData.DEFAULT_FIGURES
    });
  },

  onSkillTypeChange: function(e) {
    this.setData({ 'form.skillType': e.currentTarget.dataset.id });
  },

  onTitleInput: function(e) {
    this.setData({ 'form.title': e.detail.value });
  },

  onDescriptionInput: function(e) {
    this.setData({ 'form.description': e.detail.value });
  },

  onMethodChange: function(e) {
    this.setData({ 'form.method': e.currentTarget.dataset.id });
  },

  onRegionChange: function(e) {
    this.setData({ 'form.region': e.currentTarget.dataset.id });
  },

  onLocationInput: function(e) {
    this.setData({ 'form.location': e.detail.value });
  },

  onMaxStudentsInput: function(e) {
    this.setData({ 'form.maxStudents': e.detail.value });
  },

  onTimeCommitmentChange: function(e) {
    this.setData({ 'form.timeCommitment': e.currentTarget.dataset.id });
  },

  onTagInput: function(e) {
    this.setData({ tagInput: e.detail.value });
  },

  onTagsChange: function() {
    var tag = this.data.tagInput.trim();
    if (!tag) return;
    if (this.data.form.tags.length >= 5) {
      wx.showToast({ title: '标签最多5个', icon: 'none' });
      return;
    }
    var tags = this.data.form.tags.slice();
    if (tags.indexOf(tag) === -1) {
      tags.push(tag);
    }
    this.setData({ 'form.tags': tags, tagInput: '' });
  },

  removeTag: function(e) {
    var idx = e.currentTarget.dataset.index;
    var tags = this.data.form.tags.slice();
    tags.splice(idx, 1);
    this.setData({ 'form.tags': tags });
  },

  onRelatedFigureChange: function(e) {
    this.setData({ 'form.relatedFigureId': e.currentTarget.dataset.id });
  },

  onSubmit: function() {
    var form = this.data.form;
    if (this.data.submitting) return;

    if (!form.skillType) {
      wx.showToast({ title: '请选择技艺类型', icon: 'none' });
      return;
    }
    if (!form.title.trim()) {
      wx.showToast({ title: '请填写标题', icon: 'none' });
      return;
    }
    if (!form.description.trim()) {
      wx.showToast({ title: '请填写描述', icon: 'none' });
      return;
    }
    if (!form.method) {
      wx.showToast({ title: '请选择传授方式', icon: 'none' });
      return;
    }
    if (!form.region) {
      wx.showToast({ title: '请选择地区', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    var submitData = {
      skillType: form.skillType,
      title: form.title.trim(),
      description: form.description.trim(),
      method: form.method,
      region: form.region,
      location: form.location.trim(),
      maxStudents: form.maxStudents ? parseInt(form.maxStudents) : 5,
      timeCommitment: form.timeCommitment || 'flexible',
      tags: form.tags,
      relatedFigureId: form.relatedFigureId
    };

    var that = this;
    api.publishTeaching(submitData).then(function(res) {
      that.setData({ submitting: false });
      if (res.code === 200) {
        wx.showToast({ title: '发布成功', icon: 'success' });
        setTimeout(function() {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({ title: res.message || '发布失败', icon: 'none' });
      }
    }).catch(function() {
      that.setData({ submitting: false });
      wx.showToast({ title: '发布失败', icon: 'none' });
    });
  }
});
