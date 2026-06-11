const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    isLoggedIn: false,
    loading: false,
    draftList: [],
    categoryIcons: {
      'folklore': '🎭',
      'farming': '🌾',
      'craft': '🧵',
      'memory': '🏡'
    }
  },

  onLoad() {
    this.checkLoginStatus();
    if (this.data.isLoggedIn) {
      this.loadDrafts();
    }
  },

  onShow() {
    if (this.checkLoginStatus()) {
      this.loadDrafts();
    }
  },

  onPullDownRefresh() {
    this.loadDrafts().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  checkLoginStatus() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });
    return isLoggedIn;
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  async loadDrafts() {
    if (!this.checkLoginStatus()) return;

    this.setData({ loading: true });
    try {
      const res = await api.getArticleDraftList();
      if (res.code === 200) {
        const list = (res.data && res.data.list ? res.data.list : (res.data || [])).map(item => ({
          ...item,
          categoryName: util.getCategoryName(item.category),
          displayTime: item.updateTime || item.createTime || ''
        }));
        this.setData({ draftList: list });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[Drafts] 加载草稿异常:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onEditDraft(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/publish/publish?draftId=' + id
    });
  },

  onPublishDraft(e) {
    const id = e.currentTarget.dataset.id;
    const draft = this.data.draftList.find(d => d.id === id);

    if (!draft) {
      wx.showToast({ title: '草稿不存在', icon: 'none' });
      return;
    }

    if (!draft.title || draft.title.trim().length < 2) {
      wx.showToast({ title: '标题至少2字', icon: 'none' });
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/publish/publish?draftId=' + id });
      }, 1500);
      return;
    }
    if (!draft.category) {
      wx.showToast({ title: '请选择分类', icon: 'none' });
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/publish/publish?draftId=' + id });
      }, 1500);
      return;
    }
    if (!draft.content || draft.content.trim().length < 10) {
      wx.showToast({ title: '内容至少10字', icon: 'none' });
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/publish/publish?draftId=' + id });
      }, 1500);
      return;
    }

    wx.showModal({
      title: '提示',
      content: '确定要发布这篇草稿吗？',
      success: async (res) => {
        if (res.confirm) {
          this.doPublishDraft(id);
        }
      }
    });
  },

  async doPublishDraft(id) {
    wx.showLoading({ title: '发布中...' });
    try {
      const res = await api.publishArticleDraft(id);
      wx.hideLoading();
      if (res.code === 200) {
        wx.showToast({ title: '发布成功', icon: 'success' });
        const updatedList = this.data.draftList.filter(item => item.id !== id);
        this.setData({ draftList: updatedList });
      } else {
        wx.showModal({
          title: '发布失败',
          content: res.message + '\n是否前往编辑页修改？',
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.navigateTo({ url: '/pages/publish/publish?draftId=' + id });
            }
          }
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('[Drafts] 发布草稿异常:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    }
  },

  onDeleteDraft(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除这篇草稿吗？删除后无法恢复。',
      confirmColor: '#E74C3C',
      success: async (res) => {
        if (res.confirm) {
          this.doDeleteDraft(id);
        }
      }
    });
  },

  async doDeleteDraft(id) {
    try {
      wx.showLoading({ title: '删除中...' });
      const res = await api.deleteArticleDraft(id);
      wx.hideLoading();
      if (res.code === 200) {
        wx.showToast({ title: '已删除', icon: 'none' });
        const updatedList = this.data.draftList.filter(item => item.id !== id);
        this.setData({ draftList: updatedList });
      } else {
        wx.showToast({ title: res.message || '删除失败', icon: 'none' });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('[Drafts] 删除草稿异常:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    }
  },

  goToPublish() {
    wx.switchTab({
      url: '/pages/publish/publish'
    });
  }
});
