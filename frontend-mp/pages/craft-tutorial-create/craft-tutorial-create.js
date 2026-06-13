var api = require('../../utils/api');
var craftTutorialData = require('../../utils/craft-tutorial-data');

Page({
  data: {
    categories: [],
    difficulties: [],
    toolOptions: [],
    form: {
      title: '',
      category: '',
      difficulty: 'beginner',
      timeRequired: '',
      tools: [],
      summary: '',
      introduction: '',
      materials: [],
      steps: [],
      commonMistakes: [],
      furtherReading: [],
      relatedFigureId: '',
      relatedLandmarkId: '',
      relatedEncyclopediaId: '',
      tags: []
    },
    tagInput: '',
    newMaterial: { name: '', spec: '', quantity: '', note: '' },
    newStep: { title: '', keyPoint: '', caution: '', duration: '' },
    newMistake: { title: '', desc: '' },
    newReading: { title: '', type: 'book', desc: '' },
    showToolPicker: false,
    submitting: false,
    fromArticle: null
  },

  onLoad: function(options) {
    var app = getApp();
    if (!app.checkLogin()) {
      wx.navigateBack();
      return;
    }
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo.role !== 'admin' && userInfo.role !== 'certified') {
      wx.showToast({ title: '无权限创建教程', icon: 'none' });
      setTimeout(function() { wx.navigateBack(); }, 1500);
      return;
    }

    this.setData({
      categories: craftTutorialData.getCategoryList(),
      difficulties: craftTutorialData.getDifficultyList(),
      toolOptions: craftTutorialData.TOOL_LIST
    });

    if (options.fromArticle) {
      this.loadFromArticle(options.fromArticle);
    }
  },

  loadFromArticle: function(articleId) {
    var that = this;
    api.convertArticleToTutorial(articleId).then(function(res) {
      if (res.code === 200) {
        var template = res.data;
        that.setData({
          form: Object.assign({}, that.data.form, {
            title: template.title,
            summary: template.summary,
            introduction: template.introduction,
            relatedFigureId: template.relatedFigureId,
            tags: template.tags
          }),
          fromArticle: template
        });
        wx.showToast({ title: '已从文章导入', icon: 'success' });
      } else {
        wx.showToast({ title: res.message || '转换失败', icon: 'none' });
      }
    }).catch(function() {
      wx.showToast({ title: '转换失败', icon: 'none' });
    });
  },

  onTitleInput: function(e) {
    this.setData({ 'form.title': e.detail.value });
  },

  onCategoryChange: function(e) {
    this.setData({ 'form.category': e.currentTarget.dataset.id });
  },

  onDifficultyChange: function(e) {
    this.setData({ 'form.difficulty': e.currentTarget.dataset.id });
  },

  onTimeRequiredInput: function(e) {
    this.setData({ 'form.timeRequired': e.detail.value });
  },

  onSummaryInput: function(e) {
    this.setData({ 'form.summary': e.detail.value });
  },

  onIntroductionInput: function(e) {
    this.setData({ 'form.introduction': e.detail.value });
  },

  toggleToolPicker: function() {
    this.setData({ showToolPicker: !this.data.showToolPicker });
  },

  onToolToggle: function(e) {
    var tool = e.currentTarget.dataset.tool;
    var tools = this.data.form.tools.slice();
    var idx = tools.indexOf(tool);
    if (idx > -1) {
      tools.splice(idx, 1);
    } else {
      tools.push(tool);
    }
    this.setData({ 'form.tools': tools });
  },

  onMaterialNameInput: function(e) {
    this.setData({ 'newMaterial.name': e.detail.value });
  },
  onMaterialSpecInput: function(e) {
    this.setData({ 'newMaterial.spec': e.detail.value });
  },
  onMaterialQtyInput: function(e) {
    this.setData({ 'newMaterial.quantity': e.detail.value });
  },
  onMaterialNoteInput: function(e) {
    this.setData({ 'newMaterial.note': e.detail.value });
  },

  addMaterial: function() {
    var m = this.data.newMaterial;
    if (!m.name.trim()) {
      wx.showToast({ title: '请输入材料名称', icon: 'none' });
      return;
    }
    var materials = this.data.form.materials.slice();
    materials.push({ name: m.name.trim(), spec: m.spec.trim(), quantity: m.quantity.trim(), note: m.note.trim() });
    this.setData({
      'form.materials': materials,
      newMaterial: { name: '', spec: '', quantity: '', note: '' }
    });
  },

  removeMaterial: function(e) {
    var idx = e.currentTarget.dataset.index;
    var materials = this.data.form.materials.slice();
    materials.splice(idx, 1);
    this.setData({ 'form.materials': materials });
  },

  onStepTitleInput: function(e) {
    this.setData({ 'newStep.title': e.detail.value });
  },
  onStepKeyPointInput: function(e) {
    this.setData({ 'newStep.keyPoint': e.detail.value });
  },
  onStepCautionInput: function(e) {
    this.setData({ 'newStep.caution': e.detail.value });
  },
  onStepDurationInput: function(e) {
    this.setData({ 'newStep.duration': e.detail.value });
  },

  addStep: function() {
    var s = this.data.newStep;
    if (!s.title.trim()) {
      wx.showToast({ title: '请输入步骤标题', icon: 'none' });
      return;
    }
    var steps = this.data.form.steps.slice();
    steps.push({
      title: s.title.trim(),
      keyPoint: s.keyPoint.trim(),
      caution: s.caution.trim(),
      duration: s.duration ? parseInt(s.duration) : 0
    });
    this.setData({
      'form.steps': steps,
      newStep: { title: '', keyPoint: '', caution: '', duration: '' }
    });
  },

  removeStep: function(e) {
    var idx = e.currentTarget.dataset.index;
    var steps = this.data.form.steps.slice();
    steps.splice(idx, 1);
    this.setData({ 'form.steps': steps });
  },

  onMistakeTitleInput: function(e) {
    this.setData({ 'newMistake.title': e.detail.value });
  },
  onMistakeDescInput: function(e) {
    this.setData({ 'newMistake.desc': e.detail.value });
  },

  addMistake: function() {
    var m = this.data.newMistake;
    if (!m.title.trim()) {
      wx.showToast({ title: '请输入误区标题', icon: 'none' });
      return;
    }
    var mistakes = this.data.form.commonMistakes.slice();
    mistakes.push({ title: m.title.trim(), desc: m.desc.trim() });
    this.setData({
      'form.commonMistakes': mistakes,
      newMistake: { title: '', desc: '' }
    });
  },

  removeMistake: function(e) {
    var idx = e.currentTarget.dataset.index;
    var mistakes = this.data.form.commonMistakes.slice();
    mistakes.splice(idx, 1);
    this.setData({ 'form.commonMistakes': mistakes });
  },

  onReadingTitleInput: function(e) {
    this.setData({ 'newReading.title': e.detail.value });
  },
  onReadingDescInput: function(e) {
    this.setData({ 'newReading.desc': e.detail.value });
  },
  onReadingTypeChange: function(e) {
    this.setData({ 'newReading.type': e.currentTarget.dataset.type });
  },

  addReading: function() {
    var r = this.data.newReading;
    if (!r.title.trim()) {
      wx.showToast({ title: '请输入阅读标题', icon: 'none' });
      return;
    }
    var readings = this.data.form.furtherReading.slice();
    readings.push({ title: r.title.trim(), type: r.type, desc: r.desc.trim() });
    this.setData({
      'form.furtherReading': readings,
      newReading: { title: '', type: 'book', desc: '' }
    });
  },

  removeReading: function(e) {
    var idx = e.currentTarget.dataset.index;
    var readings = this.data.form.furtherReading.slice();
    readings.splice(idx, 1);
    this.setData({ 'form.furtherReading': readings });
  },

  onTagInput: function(e) {
    this.setData({ tagInput: e.detail.value });
  },

  addTag: function() {
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

    if (!form.title.trim()) {
      wx.showToast({ title: '请输入教程标题', icon: 'none' });
      return;
    }
    if (!form.category) {
      wx.showToast({ title: '请选择工艺分类', icon: 'none' });
      return;
    }
    if (!form.summary.trim()) {
      wx.showToast({ title: '请填写教程简介', icon: 'none' });
      return;
    }
    if (!form.introduction.trim()) {
      wx.showToast({ title: '请填写教程详细介绍', icon: 'none' });
      return;
    }
    if (form.steps.length === 0) {
      wx.showToast({ title: '请至少添加一个步骤', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    var submitData = {
      title: form.title.trim(),
      category: form.category,
      difficulty: form.difficulty,
      timeRequired: form.timeRequired ? parseInt(form.timeRequired) : 0,
      tools: form.tools,
      summary: form.summary.trim(),
      introduction: form.introduction.trim(),
      materials: form.materials,
      steps: form.steps,
      commonMistakes: form.commonMistakes,
      furtherReading: form.furtherReading,
      relatedFigureId: form.relatedFigureId,
      relatedLandmarkId: form.relatedLandmarkId,
      relatedEncyclopediaId: form.relatedEncyclopediaId,
      tags: form.tags,
      sourceArticleId: this.data.fromArticle ? this.data.fromArticle.sourceArticleId : ''
    };

    var that = this;
    api.createCraftTutorial(submitData).then(function(res) {
      that.setData({ submitting: false });
      if (res.code === 200) {
        wx.showToast({ title: '创建成功', icon: 'success' });
        setTimeout(function() {
          wx.redirectTo({ url: '/pages/craft-tutorial-detail/craft-tutorial-detail?id=' + res.data.id });
        }, 1500);
      } else {
        wx.showToast({ title: res.message || '创建失败', icon: 'none' });
      }
    }).catch(function() {
      that.setData({ submitting: false });
      wx.showToast({ title: '创建失败', icon: 'none' });
    });
  }
});
