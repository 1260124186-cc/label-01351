const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    statusList: [
      { id: 'all', name: '全部', icon: '📋' },
      { id: 'ongoing', name: '进行中', icon: '🟢' },
      { id: 'achieved', name: '已达成', icon: '🎯' },
      { id: 'ended', name: '已结束', icon: '⏹️' }
    ],
    currentStatus: 'all',
    projectList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    keyword: '',
    loading: false,
    loadingMore: false,
    isLoggedIn: false,
    isAdmin: false,
    totalRaised: 0,
    totalProjects: 0
  },

  _loadRequestId: 0,

  onLoad() {
    this.loadStats();
  },

  onShow() {
    const app = getApp();
    this.setData({
      isLoggedIn: app.getLoginStatus(),
      isAdmin: app.isAdmin()
    });
    this.refreshData();
  },

  onPullDownRefresh() {
    this.refreshData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  async loadStats() {
    try {
      const res = await api.getFundProjectList({ page: 1, pageSize: 100 });
      if (res.code === 200 && res.data) {
        const list = res.data.list || [];
        const totalRaised = list.reduce((sum, item) => sum + (item.raisedAmount || 0), 0);
        this.setData({
          totalRaised,
          totalProjects: list.length
        });
      }
    } catch (error) {
      console.error('[FundProjects] 加载统计数据失败:', error);
    }
  },

  async refreshData() {
    this._loadRequestId++;
    const requestId = this._loadRequestId;

    this.setData({
      page: 1,
      projectList: [],
      hasMore: true
    });

    return this.loadList(requestId);
  },

  async loadList(requestId) {
    if (!requestId) {
      requestId = ++this._loadRequestId;
    }

    this.setData({ loading: true });

    try {
      const res = await api.getFundProjectList({
        status: this.data.currentStatus,
        page: this.data.page,
        pageSize: this.data.pageSize,
        keyword: this.data.keyword
      });

      if (requestId !== this._loadRequestId) {
        return { cancelled: true };
      }

      if (res.code === 200) {
        const list = res.data.list.map(item => ({
          ...item,
          targetAmountDisplay: util.formatAmount(item.targetAmount),
          raisedAmountDisplay: util.formatAmount(item.raisedAmount),
          usedAmountDisplay: util.formatAmount(item.usedAmount),
          beneficiaryDescShort: util.truncateText(item.beneficiaryDesc, 60)
        }));

        this.setData({
          projectList: this.data.page === 1 ? list : [...this.data.projectList, ...list],
          hasMore: res.data.hasMore
        });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }

      return { cancelled: false, success: res.code === 200 };
    } catch (error) {
      if (requestId !== this._loadRequestId) {
        return { cancelled: true };
      }
      console.error('[FundProjects] 加载列表失败:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      return { cancelled: false, success: false, error };
    } finally {
      if (requestId === this._loadRequestId) {
        this.setData({ loading: false });
      }
    }
  },

  async loadMore() {
    if (!this.data.hasMore || this.data.loadingMore) return;

    this.setData({
      loadingMore: true,
      page: this.data.page + 1
    });

    const result = await this.loadList();

    if (!result.cancelled) {
      this.setData({ loadingMore: false });
    }

    return result;
  },

  async onStatusChange(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.currentStatus) return;

    this._loadRequestId++;

    this.setData({
      currentStatus: id,
      page: 1,
      projectList: [],
      hasMore: true
    });

    return this.loadList();
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  async onSearch() {
    this._loadRequestId++;

    this.setData({
      page: 1,
      projectList: [],
      hasMore: true
    });

    return this.loadList();
  },

  async clearSearch() {
    this._loadRequestId++;

    this.setData({
      keyword: '',
      page: 1,
      projectList: [],
      hasMore: true
    });

    return this.loadList();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/fund-detail/fund-detail?id=${id}`
    });
  },

  goToAdmin() {
    const app = getApp();
    if (!app.checkLogin()) return;
    if (!app.isAdmin()) {
      wx.showToast({ title: '无权限访问', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: '/pages/admin-fund/admin-fund'
    });
  },

  goToDonateInfo() {
    wx.showModal({
      title: '线下捐赠说明',
      content: '感谢您对文化公益事业的支持！\n\n目前仅支持线下捐赠方式：\n\n🏦 银行转账\n户名：乡村文化基金会\n账号：6222 **** **** 8888\n开户行：中国工商银行\n\n💚 微信转账\n微信号：culture_fund\n\n💙 支付宝\n账号：donate@culture.org\n\n💵 现金捐赠\n请前往基金会办公室办理\n\n备注：请在转账备注中注明项目名称，捐赠后可联系客服公示。',
      showCancel: false,
      confirmText: '我知道了'
    });
  }
});
