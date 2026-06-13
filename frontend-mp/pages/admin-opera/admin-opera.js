const api = require('../../utils/api');

Page({
  data: {
    isLoggedIn: false,
    draftList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    currentStatus: 'pending',
    statusList: [
      { id: 'pending', name: '待审核' },
      { id: 'approved', name: '已通过' },
      { id: 'rejected', name: '已驳回' },
      { id: 'all', name: '全部' }
    ],
    totalStats: {
      pending: 0,
      approved: 0,
      rejected: 0
    }
  },

  onLoad() {
    this.checkLogin();
    this.loadList();
    this.loadStats();
  },

  onShow() {
    this.refreshList();
  },

  onReachBottom() {
    this.loadMore();
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
      return;
    }
    if (!app.isAdmin()) {
      wx.showModal({
        title: '无权限访问',
        content: '您当前不是管理员账号，无法访问管理功能。',
        showCancel: false,
        confirmText: '返回我的',
        success: () => {
          wx.switchTab({ url: '/pages/mine/mine' });
        }
      });
    }
  },

  refreshList() {
    this.setData({
      page: 1,
      draftList: [],
      hasMore: true
    });
    this.loadList();
  },

  async loadList() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const res = await api.getOperaReviewList({
        status: this.data.currentStatus,
        page: this.data.page,
        pageSize: this.data.pageSize
      });
      if (res.code === 200) {
        const newList = this.data.page === 1
          ? res.data.list
          : [...this.data.draftList, ...res.data.list];
        this.setData({
          draftList: newList,
          hasMore: res.data.hasMore
        });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[AdminOpera] 加载列表失败:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadMore() {
    if (this.data.loading || !this.data.hasMore) return;
    this.setData({
      page: this.data.page + 1
    });
    this.loadList();
  },

  async loadStats() {
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        api.getOperaReviewList({ status: 'pending', page: 1, pageSize: 1 }),
        api.getOperaReviewList({ status: 'approved', page: 1, pageSize: 1 }),
        api.getOperaReviewList({ status: 'rejected', page: 1, pageSize: 1 })
      ]);
      this.setData({
        'totalStats.pending': pendingRes.code === 200 ? pendingRes.data.total : 0,
        'totalStats.approved': approvedRes.code === 200 ? approvedRes.data.total : 0,
        'totalStats.rejected': rejectedRes.code === 200 ? rejectedRes.data.total : 0
      });
    } catch (error) {
      console.error('[AdminOpera] 加载统计失败:', error);
    }
  },

  switchStatus(e) {
    const statusId = e.currentTarget.dataset.id;
    if (statusId === this.data.currentStatus) return;
    this.setData({ currentStatus: statusId });
    this.refreshList();
  },

  approve(e) {
    const id = e.currentTarget.dataset.id;
    const draft = this.data.draftList.find(item => item.id === id);
    if (!draft) return;

    wx.showModal({
      title: '确认通过',
      content: `确定通过戏曲「${draft.title}」的审核吗？`,
      confirmColor: '#2E8B57',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '审核中...' });
          try {
            const result = await api.reviewOperaDraft(id, 'approved');
            wx.hideLoading();
            if (result.code === 200) {
              wx.showToast({ title: '审核通过', icon: 'success' });
              this.refreshList();
              this.loadStats();
            } else {
              wx.showToast({ title: result.message || '审核失败', icon: 'none' });
            }
          } catch (error) {
            console.error('[AdminOpera] 审核失败:', error);
            wx.hideLoading();
            wx.showToast({ title: '网络错误，请重试', icon: 'none' });
          }
        }
      }
    });
  },

  reject(e) {
    const id = e.currentTarget.dataset.id;
    const draft = this.data.draftList.find(item => item.id === id);
    if (!draft) return;

    wx.showModal({
      title: '确认驳回',
      content: `确定驳回戏曲「${draft.title}」的审核吗？`,
      confirmColor: '#FF6B6B',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          try {
            const result = await api.reviewOperaDraft(id, 'rejected');
            wx.hideLoading();
            if (result.code === 200) {
              wx.showToast({ title: '已驳回', icon: 'success' });
              this.refreshList();
              this.loadStats();
            } else {
              wx.showToast({ title: result.message || '操作失败', icon: 'none' });
            }
          } catch (error) {
            console.error('[AdminOpera] 驳回失败:', error);
            wx.hideLoading();
            wx.showToast({ title: '网络错误，请重试', icon: 'none' });
          }
        }
      }
    });
  },

  viewDraft(e) {
    const id = e.currentTarget.dataset.id;
    const draft = this.data.draftList.find(item => item.id === id);
    if (!draft) return;

    const summary = [
      `剧名：${draft.title || '-'}`,
      `分类：${draft.categoryInfo ? draft.categoryInfo.name : draft.category || '-'}`,
      `剧种：${draft.genreName || '-'}`,
      `提交人：${draft.submitterName || '-'}`,
      `提交时间：${draft.createTime || '-'}`,
      `简介：${(draft.introduction || draft.plotSummary || '无').slice(0, 100)}...`
    ].join('\n');

    wx.showModal({
      title: '戏曲草稿详情',
      content: summary,
      showCancel: false,
      confirmText: '关闭'
    });
  },

  goToApprovedDetail(e) {
    const id = e.currentTarget.dataset.id;
    const draft = this.data.draftList.find(item => item.id === id);
    if (!draft || !draft.approvedOperaId) return;
    wx.navigateTo({
      url: `/pages/opera-detail/opera-detail?id=${draft.approvedOperaId}`
    });
  }
});
