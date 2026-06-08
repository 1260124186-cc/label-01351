// pages/publish/publish.js
// 投稿页面 - 发布文章表单，支持标题、分类、内容输入

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
      content: ''
    },

    // 表单状态
    canSubmit: false,    // 是否可以提交
    submitting: false,   // 提交中状态
    showSuccess: false,  // 显示成功弹窗
    newArticleId: ''     // 新发布的文章ID
  },

  _categoriesLoaded: false,

  onLoad() {
    this.loadCategories();
    this._categoriesLoaded = true;
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
      this.checkCanSubmit();
    }
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  /**
   * 加载分类列表
   */
  async loadCategories() {
    try {
      const res = await api.getCategoryList();
      if (res.code === 200 && res.data && res.data.length > 0) {
        // 过滤掉 'all' 分类
        const categories = res.data.filter(item => item.id !== 'all');
        this.setData({ categories });
      } else {
        // 如果没有数据，使用默认分类
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
      // 出错时也使用默认分类
      const defaultCategories = [
        { id: 'folklore', name: '民俗故事' },
        { id: 'farming', name: '农耕智慧' },
        { id: 'craft', name: '传统技艺' },
        { id: 'memory', name: '乡土记忆' }
      ];
      this.setData({ categories: defaultCategories });
    }
  },

  /**
   * 标题输入处理
   * @param {Object} e - 事件对象
   */
  onTitleInput(e) {
    this.setData({ 'formData.title': e.detail.value });
    this.checkCanSubmit();
  },

  /**
   * 分类选择处理
   * @param {Object} e - 事件对象
   */
  onCategorySelect(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ 'formData.category': id });
    this.checkCanSubmit();
  },

  /**
   * 内容输入处理
   * @param {Object} e - 事件对象
   */
  onContentInput(e) {
    this.setData({ 'formData.content': e.detail.value });
    this.checkCanSubmit();
  },

  /**
   * 检查表单是否可以提交
   * 标题至少2字，内容至少10字，分类必选
   */
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

  /**
   * 提交表单
   */
  async onSubmit() {
    // 防止重复提交
    if (this.data.submitting) return;

    const { title, category, content } = this.data.formData;

    // 表单验证并提示
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

    this.setData({ submitting: true });
    wx.showLoading({ title: '发布中...' });

    try {
      const res = await api.publishArticle({
        title: title.trim(),
        category,
        content: content.trim()
      });

      wx.hideLoading();

      if (res.code === 200) {
        // 发布成功，保存文章ID，清空表单
        this.setData({
          showSuccess: true,
          newArticleId: res.data.id,
          formData: {
            title: '',
            category: '',
            content: ''
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

  /**
   * 继续投稿 - 重置表单
   */
  continuePublish() {
    this.setData({
      showSuccess: false,
      formData: {
        title: '',
        category: '',
        content: ''
      },
      canSubmit: false
    });
  },

  /**
   * 查看文章 - 跳转到文章详情
   */
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
