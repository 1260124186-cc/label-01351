const api = require('../../utils/api');
const { OPERA_CATEGORIES, OPERA_GENRES, REGIONS, getGenreName, getCategoryInfo } = require('../../utils/opera-data');

Page({
  data: {
    form: {
      title: '',
      category: '',
      genre: '',
      alias: [],
      aliasInput: '',
      introduction: '',
      plotSummary: '',
      heritageRegions: [],
      tags: [],
      tagInput: '',
      isRare: true,
      representativeArias: []
    },
    categoryName: '',
    genreName: '',
    heritageRegionNames: [],
    categoryList: OPERA_CATEGORIES,
    genreList: OPERA_GENRES,
    filteredGenreList: [],
    regionList: REGIONS,
    showRegionPicker: false,
    submitting: false,
    myDrafts: [],
    isLoggedIn: false
  },

  onLoad() {
    this.loadMyDrafts();
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

  async loadMyDrafts() {
    try {
      const res = await api.getMyOperaDrafts();
      if (res.code === 200) {
        this.setData({ myDrafts: res.data.list });
      }
    } catch (error) {
      console.error('[OperaSubmit] 加载我的草稿失败:', error);
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  selectCategory(e) {
    const value = e.detail.value;
    const category = this.data.categoryList[value];
    const filteredGenreList = OPERA_GENRES.filter(g => g.category === category.id);
    this.setData({
      'form.category': category.id,
      categoryName: category.name,
      filteredGenreList,
      'form.genre': '',
      genreName: ''
    });
  },

  selectGenre(e) {
    const value = e.detail.value;
    const genre = this.data.filteredGenreList[value] || this.data.genreList[value];
    this.setData({ 'form.genre': genre.id, genreName: genre.name });
  },

  toggleRegionPicker() {
    this.setData({ showRegionPicker: !this.data.showRegionPicker });
  },

  toggleRegion(e) {
    const regionId = e.currentTarget.dataset.id;
    const heritageRegions = [...this.data.form.heritageRegions];
    const index = heritageRegions.indexOf(regionId);
    if (index > -1) {
      heritageRegions.splice(index, 1);
    } else {
      heritageRegions.push(regionId);
    }
    const heritageRegionNames = heritageRegions.map(id => {
      const r = this.data.regionList.find(item => item.id === id);
      return r ? r.name : id;
    });
    this.setData({ 'form.heritageRegions': heritageRegions, heritageRegionNames });
  },

  addAlias() {
    const aliasInput = this.data.form.aliasInput.trim();
    if (!aliasInput) return;
    const alias = [...this.data.form.alias, aliasInput];
    this.setData({
      'form.alias': alias,
      'form.aliasInput': ''
    });
  },

  removeAlias(e) {
    const idx = e.currentTarget.dataset.idx;
    const alias = [...this.data.form.alias];
    alias.splice(idx, 1);
    this.setData({ 'form.alias': alias });
  },

  addTag() {
    const tagInput = this.data.form.tagInput.trim();
    if (!tagInput) return;
    const tags = [...this.data.form.tags, tagInput];
    this.setData({
      'form.tags': tags,
      'form.tagInput': ''
    });
  },

  removeTag(e) {
    const idx = e.currentTarget.dataset.idx;
    const tags = [...this.data.form.tags];
    tags.splice(idx, 1);
    this.setData({ 'form.tags': tags });
  },

  addAria() {
    const arias = [...this.data.form.representativeArias];
    arias.push({
      id: 'aria_' + Date.now(),
      name: '',
      role: '',
      text: '',
      tune: ''
    });
    this.setData({ 'form.representativeArias': arias });
  },

  removeAria(e) {
    const idx = e.currentTarget.dataset.idx;
    const arias = [...this.data.form.representativeArias];
    arias.splice(idx, 1);
    this.setData({ 'form.representativeArias': arias });
  },

  updateAria(e) {
    const idx = e.currentTarget.dataset.idx;
    const field = e.currentTarget.dataset.field;
    const arias = [...this.data.form.representativeArias];
    arias[idx][field] = e.detail.value;
    this.setData({ 'form.representativeArias': arias });
  },

  toggleRare() {
    this.setData({ 'form.isRare': !this.data.form.isRare });
  },

  async submit() {
    const app = getApp();
    if (!app.checkLogin()) return;

    if (this.data.submitting) return;

    const { title, category, genre, introduction, alias, plotSummary,
            heritageRegions, tags, isRare, representativeArias } = this.data.form;

    if (!title || title.trim().length < 2) {
      wx.showToast({ title: '请输入剧名（至少2字）', icon: 'none' });
      return;
    }

    if (!category) {
      wx.showToast({ title: '请选择分类（戏曲/曲艺）', icon: 'none' });
      return;
    }

    if (!genre) {
      wx.showToast({ title: '请选择剧种/曲种', icon: 'none' });
      return;
    }

    if (!introduction || introduction.trim().length < 10) {
      wx.showToast({ title: '请填写剧目简介（至少10字）', icon: 'none' });
      return;
    }

    const submitData = {
      title: title.trim(),
      category,
      genre,
      alias: alias || [],
      introduction: introduction.trim(),
      plotSummary: (plotSummary || '').trim(),
      heritageRegions: heritageRegions || [],
      tags: tags || [],
      isRare,
      representativeArias: (representativeArias || []).map(aria => ({
        id: aria.id,
        name: aria.name.trim(),
        role: aria.role.trim(),
        text: aria.text.trim(),
        tune: aria.tune.trim()
      })).filter(aria => aria.name || aria.text)
    };

    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...' });

    try {
      const res = await api.submitOperaDraft(submitData);

      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({ title: '提交成功', icon: 'success' });
        this.setData({
          form: {
            title: '',
            category: '',
            genre: '',
            alias: [],
            aliasInput: '',
            introduction: '',
            plotSummary: '',
            heritageRegions: [],
            tags: [],
            tagInput: '',
            isRare: true,
            representativeArias: []
          },
          categoryName: '',
          genreName: '',
          heritageRegionNames: [],
          filteredGenreList: []
        });
        this.loadMyDrafts();
      } else {
        wx.showToast({ title: res.message || '提交失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[OperaSubmit] 提交失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/opera-detail/opera-detail?id=' + id
    });
  }
});
