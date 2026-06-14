var api = require('../../utils/api');
var pairingData = require('../../utils/pairing-data');
var figureData = require('../../utils/figure-data');

Page({
  data: {
    skillTags: [],
    regions: [],
    timeCommitments: [],
    form: {
      skillType: '',
      title: '',
      description: '',
      region: '',
      timeCommitment: 'flexible',
      tags: []
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
    this.setData({
      skillTags: pairingData.SKILL_TAGS,
      regions: figureData.REGIONS,
      timeCommitments: pairingData.TIME_COMMITMENTS
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

  onRegionChange: function(e) {
    this.setData({ 'form.region': e.currentTarget.dataset.id });
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

  onSubmit: function() {
    var form = this.data.form;
    if (this.data.submitting) return;

    if (!form.skillType) {
      wx.showToast({ title: '请选择想学的技艺', icon: 'none' });
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
    if (!form.region) {
      wx.showToast({ title: '请选择地区', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    var submitData = {
      skillType: form.skillType,
      title: form.title.trim(),
      description: form.description.trim(),
      region: form.region,
      timeCommitment: form.timeCommitment,
      tags: form.tags
    };

    var that = this;
    api.publishLearning(submitData).then(function(res) {
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
