const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    projectId: '',
    project: null,
    loading: true,
    isLoggedIn: false,
    isAdmin: false,
    commentInput: '',
    showDonateModal: false,
    activeTab: 'timeline',
    tabs: [
      { id: 'timeline', name: '项目进展', icon: '📅' },
      { id: 'results', name: '文化成果', icon: '🏆' },
      { id: 'donations', name: '捐赠公示', icon: '💰' },
      { id: 'comments', name: '留言支持', icon: '💬' }
    ],
    timelineWithType: [],
    donationMethods: []
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ projectId: id });
    }
    this.setData({
      donationMethods: util.getDonationMethods()
    });
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    const isAdmin = app.isAdmin();
    this.setData({ isLoggedIn, isAdmin });

    if (this.data.projectId) {
      this.loadProjectDetail(this.data.projectId);
    }
  },

  onPullDownRefresh() {
    this.loadProjectDetail(this.data.projectId).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadProjectDetail(id) {
    this.setData({ loading: true });

    try {
      const res = await api.getFundProjectDetail(id);

      if (res.code === 200 && res.data) {
        const project = res.data;

        const timelineWithType = (project.timeline || []).map(item => ({
          ...item,
          typeInfo: util.getFundTimelineTypeInfo(item.type)
        }));

        this.setData({
          project: {
            ...project,
            targetAmountDisplay: util.formatAmount(project.targetAmount),
            raisedAmountDisplay: util.formatAmount(project.raisedAmount),
            usedAmountDisplay: util.formatAmount(project.usedAmount)
          },
          timelineWithType,
          loading: false
        });

        wx.setNavigationBarTitle({
          title: project.name.length > 12
            ? project.name.substring(0, 12) + '...'
            : project.name
        });
      } else {
        this.setData({
          project: null,
          loading: false
        });
        wx.showToast({
          title: res.message || '加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[FundDetail] 加载详情失败:', error);
      this.setData({
        project: null,
        loading: false
      });
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  },

  onTabChange(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ activeTab: id });
  },

  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value });
  },

  async onSubmitComment() {
    const app = getApp();
    if (!app.checkLogin()) return;

    const content = this.data.commentInput.trim();
    if (!content) {
      wx.showToast({ title: '请输入留言内容', icon: 'none' });
      return;
    }
    if (content.length > 200) {
      wx.showToast({ title: '留言不能超过200字', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '提交中...' });

    try {
      const res = await api.addFundComment(this.data.projectId, content);
      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({
          title: '留言提交成功，等待审核',
          icon: 'success'
        });
        this.setData({ commentInput: '' });
      } else {
        wx.showToast({
          title: res.message || '提交失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[FundDetail] 提交留言失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  },

  openDonateModal() {
    this.setData({ showDonateModal: true });
  },

  closeDonateModal() {
    this.setData({ showDonateModal: false });
  },

  goToArticle(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  goToActivity(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity-detail/activity-detail?id=${id}`
    });
  },

  goToAdminEdit() {
    const app = getApp();
    if (!app.isAdmin()) return;
    wx.navigateTo({
      url: `/pages/admin-fund/admin-fund?editId=${this.data.projectId}`
    });
  },

  stopPropagation() {},

  onShareAppMessage() {
    const { project } = this.data;
    if (!project) return {};

    return {
      title: project.name,
      path: `/pages/fund-detail/fund-detail?id=${project.id}`
    };
  }
});
