const api = require('../../utils/api');

Page({
  data: {
    isLoggedIn: false,
    topicList: [],
    loading: false,
    showForm: false,
    editMode: false,
    editId: null,
    submitting: false,

    categories: [],

    formData: {
      title: '',
      coverImage: '',
      category: '',
      introduction: '',
      tags: [],
      articleIds: [],
      relatedTopicIds: []
    },

    tagInput: '',
    canSubmit: false
  },

  onLoad() {
    this.checkLogin();
    this.loadCategories();
  },

  onShow() {
    if (this.data.isLoggedIn && this.data.topicList.length === 0) {
      this.loadTopicList();
    }
  },

  checkLogin() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });
    if (!isLoggedIn) {
      wx.showModal({
        title: '需要登录',
        content: '请先登录后再使用管理功能',
        showCancel: false,
        success: () => {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      });
    }
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  async loadCategories() {
    try {
      const res = await api.getTopicCategories();
      if (res.code === 200) {
        this.setData({
          categories: res.data.filter(item => item.id !== 'all')
        });
      }
    } catch (error) {
      console.error('[AdminTopic] 加载分类失败:', error);
    }
  },

  async loadTopicList() {
    this.setData({ loading: true });

    try {
      const res = await api.getTopicList({ page: 1, pageSize: 100 });
      if (res.code === 200) {
        this.setData({ topicList: res.data.list });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[AdminTopic] 加载列表失败:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  openCreateForm() {
    this.setData({
      showForm: true,
      editMode: false,
      editId: null,
      formData: {
        title: '',
        coverImage: '',
        category: '',
        introduction: '',
        tags: [],
        articleIds: [],
        relatedTopicIds: []
      },
      tagInput: '',
      canSubmit: false
    });
  },

  openEditForm(e) {
    const id = e.currentTarget.dataset.id;
    const topic = this.data.topicList.find(item => item.id === id);
    if (!topic) return;

    this.setData({
      showForm: true,
      editMode: true,
      editId: id,
      formData: {
        title: topic.title || '',
        coverImage: topic.coverImage || '',
        category: topic.category || '',
        introduction: topic.introduction || '',
        tags: topic.tags || [],
        articleIds: topic.articleIds || [],
        relatedTopicIds: topic.relatedTopicIds || []
      },
      tagInput: '',
      canSubmit: true
    });
  },

  closeForm() {
    this.setData({ showForm: false });
  },

  onTitleInput(e) {
    this.setData({ 'formData.title': e.detail.value });
    this.checkCanSubmit();
  },

  onCoverImageInput(e) {
    this.setData({ 'formData.coverImage': e.detail.value });
  },

  onCategorySelect(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ 'formData.category': id });
    this.checkCanSubmit();
  },

  onIntroductionInput(e) {
    this.setData({ 'formData.introduction': e.detail.value });
    this.checkCanSubmit();
  },

  onTagInput(e) {
    this.setData({ tagInput: e.detail.value });
  },

  addTag() {
    const tag = this.data.tagInput.trim();
    if (!tag) {
      wx.showToast({ title: '请输入标签内容', icon: 'none' });
      return;
    }
    if (this.data.formData.tags.includes(tag)) {
      wx.showToast({ title: '标签已存在', icon: 'none' });
      return;
    }

    const tags = [...this.data.formData.tags, tag];
    this.setData({
      'formData.tags': tags,
      tagInput: ''
    });
  },

  removeTag(e) {
    const index = e.currentTarget.dataset.index;
    const tags = [...this.data.formData.tags];
    tags.splice(index, 1);
    this.setData({ 'formData.tags': tags });
  },

  checkCanSubmit() {
    const { title, category, introduction } = this.data.formData;
    const canSubmit = title.trim().length >= 2 &&
                      category !== '' &&
                      introduction.trim().length >= 10;
    this.setData({ canSubmit });
  },

  async onSubmit() {
    const app = getApp();
    if (!app.checkLogin()) return;
    if (this.data.submitting) return;

    const { title, coverImage, category, introduction, tags, articleIds, relatedTopicIds } = this.data.formData;

    if (!title || title.trim().length < 2) {
      wx.showToast({ title: '请输入专题标题（至少2字）', icon: 'none' });
      return;
    }
    if (!category) {
      wx.showToast({ title: '请选择专题分类', icon: 'none' });
      return;
    }
    if (!introduction || introduction.trim().length < 10) {
      wx.showToast({ title: '请填写专题导语（至少10字）', icon: 'none' });
      return;
    }

    const submitData = {
      title: title.trim(),
      coverImage: coverImage.trim() || '',
      category,
      introduction: introduction.trim(),
      tags: tags || [],
      articleIds: articleIds || [],
      relatedTopicIds: relatedTopicIds || []
    };

    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...' });

    try {
      let res;
      if (this.data.editMode) {
        res = await api.updateTopic(this.data.editId, submitData);
      } else {
        res = await api.createTopic(submitData);
      }

      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({
          title: this.data.editMode ? '更新成功' : '创建成功',
          icon: 'success'
        });
        this.setData({ showForm: false });
        this.loadTopicList();
      } else {
        wx.showToast({ title: res.message || '提交失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[AdminTopic] 提交失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  async onDelete(e) {
    const app = getApp();
    if (!app.checkLogin()) return;

    const id = e.currentTarget.dataset.id;
    const topic = this.data.topicList.find(item => item.id === id);

    wx.showModal({
      title: '确认删除',
      content: `确定要删除专题「${topic.title}」吗？此操作不可恢复。`,
      confirmColor: '#FF6B6B',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await api.deleteTopic(id);
            if (result.code === 200) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.loadTopicList();
            } else {
              wx.showToast({ title: result.message || '删除失败', icon: 'none' });
            }
          } catch (error) {
            console.error('[AdminTopic] 删除失败:', error);
            wx.showToast({ title: '网络错误，请重试', icon: 'none' });
          }
        }
      }
    });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/topic-detail/topic-detail?id=${id}`
    });
  }
});
