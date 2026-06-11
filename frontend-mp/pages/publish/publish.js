// pages/publish/publish.js
// 投稿页面 - 发布文章表单，支持标题、分类、摘要、标签、内容输入

const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    // 登录状态
    isLoggedIn: false,

    // 分类数据
    categories: [],
    categoryIcons: {
      'folklore': '🎭',
      'farming': '🌾',
      'craft': '🧵',
      'memory': '🏡'
    },

    // 表单数据
    formData: {
      title: '',
      category: '',
      summary: '',
      content: '',
      figureId: '',
      tags: []
    },

    // 标签相关
    suggestedTags: [],
    tagInput: '',
    showTagInput: false,

    // 关联人物数据
    selectedFigure: null,
    showFigureSelector: false,
    figureSearchKeyword: '',
    allFigures: [],
    filteredFigures: [],

    // 预览弹窗
    showPreview: false,
    previewData: null,

    // 表单状态
    canSubmit: false,
    submitting: false,
    showSuccess: false,
    newArticleId: ''
  },

  _categoriesLoaded: false,
  _figuresLoaded: false,

  onLoad() {
    this.loadCategories();
    this._categoriesLoaded = true;
    this.setData({ suggestedTags: util.SUGGESTED_TAGS });
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });

    if (isLoggedIn) {
      if (!this._categoriesLoaded) {
        this.loadCategories();
        this._categoriesLoaded = true;
      }
      if (!this._figuresLoaded) {
        this.loadFigures();
        this._figuresLoaded = true;
      }
      this.checkCanSubmit();
    }
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  async loadFigures() {
    try {
      const res = await api.getFigureList({ page: 1, pageSize: 100 });
      if (res.code === 200 && res.data && res.data.list) {
        const figures = res.data.list.filter(item => item.status === 1);
        this.setData({
          allFigures: figures,
          filteredFigures: figures
        });
      }
    } catch (error) {
      console.error('[Publish] 加载人物列表异常:', error);
    }
  },

  toggleFigureSelector() {
    this.setData({
      showFigureSelector: !this.data.showFigureSelector
    });
  },

  onFigureSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ figureSearchKeyword: keyword });
    this.filterFigures(keyword);
  },

  clearFigureSearch() {
    this.setData({
      figureSearchKeyword: '',
      filteredFigures: this.data.allFigures
    });
  },

  filterFigures(keyword) {
    if (!keyword) {
      this.setData({ filteredFigures: this.data.allFigures });
      return;
    }
    const keywordLower = keyword.toLowerCase();
    const filtered = this.data.allFigures.filter(item =>
      item.name.toLowerCase().includes(keywordLower) ||
      (item.briefIntroduction && item.briefIntroduction.toLowerCase().includes(keywordLower))
    );
    this.setData({ filteredFigures: filtered });
  },

  onFigureSelect(e) {
    const figure = e.currentTarget.dataset.figure;
    this.setData({
      selectedFigure: figure,
      'formData.figureId': figure.id,
      showFigureSelector: false,
      figureSearchKeyword: ''
    });
    this.checkCanSubmit();
  },

  clearSelectedFigure() {
    this.setData({
      selectedFigure: null,
      'formData.figureId': ''
    });
    this.checkCanSubmit();
  },

  goToCreateFigure() {
    wx.navigateTo({
      url: '/pages/figure-create/figure-create'
    });
  },

  async loadCategories() {
    try {
      const res = await api.getCategoryList();
      if (res.code === 200 && res.data && res.data.length > 0) {
        const categories = res.data.filter(item => item.id !== 'all');
        this.setData({ categories });
      } else {
        const defaultCategories = [
          { id: 'folklore', name: '民俗故事' },
          { id: 'farming', name: '农耕智慧' },
          { id: 'craft', name: '传统技艺' },
          { id: 'memory', name: '乡土记忆' }
        ];
        this.setData({ categories: defaultCategories });
        console.warn('[Publish] 使用默认分类数据');
      }
    } catch (error) {
      console.error('[Publish] 加载分类异常:', error);
      const defaultCategories = [
        { id: 'folklore', name: '民俗故事' },
        { id: 'farming', name: '农耕智慧' },
        { id: 'craft', name: '传统技艺' },
        { id: 'memory', name: '乡土记忆' }
      ];
      this.setData({ categories: defaultCategories });
    }
  },

  onTitleInput(e) {
    this.setData({ 'formData.title': e.detail.value });
    this.checkCanSubmit();
  },

  onSummaryInput(e) {
    this.setData({ 'formData.summary': e.detail.value });
  },

  onCategorySelect(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ 'formData.category': id });
    this.checkCanSubmit();
  },

  onContentInput(e) {
    this.setData({ 'formData.content': e.detail.value });
    this.checkCanSubmit();
  },

  toggleSuggestedTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const currentTags = [...this.data.formData.tags];
    const index = currentTags.indexOf(tag);
    if (index > -1) {
      currentTags.splice(index, 1);
    } else {
      if (currentTags.length >= 3) {
        wx.showToast({ title: '最多选择3个标签', icon: 'none' });
        return;
      }
      currentTags.push(tag);
    }
    this.setData({ 'formData.tags': currentTags });
  },

  onTagInputChange(e) {
    this.setData({ tagInput: e.detail.value });
  },

  showAddTagInput() {
    this.setData({ showTagInput: true });
  },

  hideAddTagInput() {
    this.setData({ showTagInput: false, tagInput: '' });
  },

  addCustomTag() {
    const tag = this.data.tagInput.trim();
    if (!tag) {
      this.setData({ showTagInput: false });
      return;
    }
    if (tag.length > 10) {
      wx.showToast({ title: '标签长度不超过10字', icon: 'none' });
      return;
    }
    const currentTags = [...this.data.formData.tags];
    if (currentTags.includes(tag)) {
      wx.showToast({ title: '标签已存在', icon: 'none' });
      return;
    }
    if (currentTags.length >= 3) {
      wx.showToast({ title: '最多选择3个标签', icon: 'none' });
      return;
    }
    currentTags.push(tag);
    this.setData({
      'formData.tags': currentTags,
      tagInput: '',
      showTagInput: false
    });
  },

  removeTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const currentTags = this.data.formData.tags.filter(t => t !== tag);
    this.setData({ 'formData.tags': currentTags });
  },

  checkCanSubmit() {
    const { title, category, content } = this.data.formData;
    const titleLen = title.trim().length;
    const contentLen = content.trim().length;
    const canSubmit = titleLen >= 2 &&
                      category !== '' &&
                      contentLen >= 10;

    console.log('[Publish] 表单检查:', { titleLen, category, contentLen, canSubmit });
    this.setData({ canSubmit });
  },

  onPreview() {
    if (!this.data.canSubmit) {
      wx.showToast({ title: '请先完善必填信息', icon: 'none' });
      return;
    }
    const { title, category, summary, content, tags } = this.data.formData;
    const contentTrimmed = content.trim();
    const autoSummary = (summary || '').trim() || util.truncateText(contentTrimmed, 100);
    const categoryName = util.getCategoryName(category);
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      showPreview: true,
      previewData: {
        title: title.trim(),
        category,
        categoryName,
        summary: autoSummary,
        content: contentTrimmed,
        tags: tags || [],
        authorName: userInfo.nickname || '我',
        createTime: util.formatDate(new Date(), 'YYYY-MM-DD')
      }
    });
  },

  closePreview() {
    this.setData({ showPreview: false, previewData: null });
  },

  async onSubmit() {
    if (this.data.submitting) return;

    const { title, category, summary, content, figureId, tags } = this.data.formData;

    if (!title || title.trim().length < 2) {
      wx.showToast({ title: '请输入文章标题（至少2字）', icon: 'none' });
      return;
    }

    if (!category) {
      wx.showToast({ title: '请选择文章分类', icon: 'none' });
      return;
    }

    if (!content || content.trim().length < 10) {
      wx.showToast({ title: '请输入文章内容（至少10字）', icon: 'none' });
      return;
    }

    if (summary && summary.trim().length > 50) {
      wx.showToast({ title: '摘要不超过50字', icon: 'none' });
      return;
    }

    if (tags && tags.length > 3) {
      wx.showToast({ title: '标签最多3个', icon: 'none' });
      return;
    }

    const titleTrimmed = title.trim();
    const contentTrimmed = content.trim();
    const summaryTrimmed = (summary || '').trim();
    const autoSummary = summaryTrimmed || util.truncateText(contentTrimmed, 100);

    const sensitiveCheck = util.checkSensitiveWords(
      titleTrimmed + ' ' + autoSummary + ' ' + contentTrimmed + ' ' + (tags || []).join(' ')
    );
    if (sensitiveCheck.hasSensitive) {
      wx.showModal({
        title: '内容包含敏感词',
        content: '检测到敏感词：' + sensitiveCheck.matchedWords.join('、') + '\n请修改后重新发布',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({ title: '发布中...' });

    try {
      const articleData = {
        title: titleTrimmed,
        category,
        summary: autoSummary,
        content: contentTrimmed,
        tags: tags && tags.length > 0 ? tags : []
      };
      if (figureId) {
        articleData.figureId = figureId;
      }
      const res = await api.publishArticle(articleData);

      wx.hideLoading();

      if (res.code === 200) {
        this.setData({
          showPreview: false,
          previewData: null,
          showSuccess: true,
          newArticleId: res.data.id,
          formData: {
            title: '',
            category: '',
            summary: '',
            content: '',
            figureId: '',
            tags: []
          },
          canSubmit: false
        });
      } else {
        wx.showToast({ title: res.message || '发布失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[Publish] 发布文章异常:', error);
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
        title: '',
        category: '',
        summary: '',
        content: '',
        figureId: '',
        tags: []
      },
      selectedFigure: null,
      showFigureSelector: false,
      figureSearchKeyword: '',
      canSubmit: false
    });
  },

  goToHome() {
    const { newArticleId } = this.data;
    this.setData({ showSuccess: false });

    if (newArticleId) {
      wx.navigateTo({ url: '/pages/detail/detail?id=' + newArticleId });
    } else {
      wx.switchTab({ url: '/pages/index/index' });
    }
  }
});
