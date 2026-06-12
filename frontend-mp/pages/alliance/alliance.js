const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    activeTab: 'featured',
    tabs: [
      { id: 'featured', name: '联盟精选' },
      { id: 'nodes', name: '联盟节点' },
      { id: 'search', name: '联盟搜索' }
    ],
    featuredList: [],
    featuredType: 'all',
    featuredPage: 1,
    featuredHasMore: true,
    featuredLoading: false,
    nodesList: [],
    nodesLoading: false,
    showRegisterModal: false,
    registerForm: {
      name: '',
      apiAddress: '',
      syncStrategy: 'incremental',
      description: '',
      region: '',
      contactName: ''
    },
    syncStrategyOptions: [
      { id: 'full', name: '全量同步' },
      { id: 'incremental', name: '增量同步' },
      { id: 'manual', name: '手动同步' }
    ],
    searchKeyword: '',
    searchAlliance: false,
    searchType: 'all',
    searchResults: [],
    searchLoading: false,
    searchPage: 1,
    searchHasMore: true,
    isAdmin: false
  },

  onLoad() {
    this.checkAdmin();
  },

  onShow() {
    this.loadCurrentTab();
  },

  onPullDownRefresh() {
    this.refreshCurrentTab().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    this.loadMoreCurrentTab();
  },

  checkAdmin() {
    const app = getApp();
    this.setData({ isAdmin: app.isAdmin() });
  },

  loadCurrentTab() {
    if (this.data.activeTab === 'featured') this.loadFeatured();
    else if (this.data.activeTab === 'nodes') this.loadNodes();
  },

  refreshCurrentTab() {
    if (this.data.activeTab === 'featured') {
      this.setData({ featuredPage: 1, featuredList: [], featuredHasMore: true });
      return this.loadFeatured();
    } else if (this.data.activeTab === 'nodes') {
      return this.loadNodes();
    } else if (this.data.activeTab === 'search') {
      this.setData({ searchPage: 1, searchResults: [], searchHasMore: true });
      return this.doSearch();
    }
    return Promise.resolve();
  },

  loadMoreCurrentTab() {
    if (this.data.activeTab === 'featured' && this.data.featuredHasMore) this.loadFeatured(true);
    else if (this.data.activeTab === 'search' && this.data.searchHasMore) this.doSearch(true);
  },

  onTabChange(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.activeTab) return;
    this.setData({ activeTab: id });
    this.loadCurrentTab();
  },

  async loadFeatured(loadMore = false) {
    if (this.data.featuredLoading) return;
    const page = loadMore ? this.data.featuredPage + 1 : 1;
    this.setData({ featuredLoading: true });
    try {
      const res = await api.getAllianceFeatured({
        type: this.data.featuredType,
        page,
        pageSize: 10
      });
      if (res.code === 200) {
        const list = res.data.list.map(item => ({
          ...item,
          categoryName: util.getCategoryName(item.category),
          relativeTime: util.formatRelativeTime(item.createTime)
        }));
        this.setData({
          featuredList: loadMore ? [...this.data.featuredList, ...list] : list,
          featuredPage: page,
          featuredHasMore: res.data.hasMore
        });
      }
    } catch (e) {
      console.error('[Alliance] 加载精选失败:', e);
    } finally {
      this.setData({ featuredLoading: false });
    }
  },

  onFeaturedTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    if (type === this.data.featuredType) return;
    this.setData({
      featuredType: type,
      featuredPage: 1,
      featuredList: [],
      featuredHasMore: true
    });
    this.loadFeatured();
  },

  async loadNodes() {
    this.setData({ nodesLoading: true });
    try {
      const status = this.data.isAdmin ? 'all' : 'approved';
      const res = await api.getAllianceNodeList({ status, pageSize: 50 });
      if (res.code === 200) {
        this.setData({ nodesList: res.data.list });
      }
    } catch (e) {
      console.error('[Alliance] 加载节点失败:', e);
    } finally {
      this.setData({ nodesLoading: false });
    }
  },

  showRegister() {
    this.setData({ showRegisterModal: true });
  },

  hideRegister() {
    this.setData({ showRegisterModal: false });
  },

  onRegisterInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`registerForm.${field}`]: e.detail.value });
  },

  onSyncStrategyChange(e) {
    const idx = e.detail.value;
    this.setData({ 'registerForm.syncStrategy': this.data.syncStrategyOptions[idx].id });
  },

  async submitRegister() {
    const form = this.data.registerForm;
    if (!form.name || !form.name.trim()) {
      wx.showToast({ title: '节点名称不能为空', icon: 'none' });
      return;
    }
    if (!form.apiAddress || !form.apiAddress.trim()) {
      wx.showToast({ title: 'API地址不能为空', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '提交中...' });
    try {
      const res = await api.registerAllianceNode(form);
      wx.hideLoading();
      if (res.code === 200) {
        wx.showToast({ title: '注册成功，等待审核', icon: 'none' });
        this.setData({
          showRegisterModal: false,
          registerForm: { name: '', apiAddress: '', syncStrategy: 'incremental', description: '', region: '', contactName: '' }
        });
        this.loadNodes();
      } else {
        wx.showToast({ title: res.message || '注册失败', icon: 'none' });
      }
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
  },

  async approveNode(e) {
    const id = e.currentTarget.dataset.id;
    wx.showLoading({ title: '处理中...' });
    const res = await api.approveAllianceNode(id);
    wx.hideLoading();
    if (res.code === 200) {
      wx.showToast({ title: '已通过', icon: 'success' });
      this.loadNodes();
    } else {
      wx.showToast({ title: res.message || '操作失败', icon: 'none' });
    }
  },

  async rejectNode(e) {
    const id = e.currentTarget.dataset.id;
    wx.showLoading({ title: '处理中...' });
    const res = await api.rejectAllianceNode(id);
    wx.hideLoading();
    if (res.code === 200) {
      wx.showToast({ title: '已拒绝', icon: 'success' });
      this.loadNodes();
    } else {
      wx.showToast({ title: res.message || '操作失败', icon: 'none' });
    }
  },

  async removeNode(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要移除该节点吗？',
      success: async (res) => {
        if (res.confirm) {
          const result = await api.removeAllianceNode(id);
          if (result.code === 200) {
            wx.showToast({ title: '已移除', icon: 'success' });
            this.loadNodes();
          } else {
            wx.showToast({ title: result.message || '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  onSearchAllianceChange(e) {
    this.setData({ searchAlliance: e.detail.value });
  },

  onSearchTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    if (type === this.data.searchType) return;
    this.setData({ searchType: type, searchPage: 1, searchResults: [], searchHasMore: true });
  },

  async onSearch() {
    this.setData({ searchPage: 1, searchResults: [], searchHasMore: true });
    await this.doSearch();
  },

  async doSearch(loadMore = false) {
    const keyword = this.data.searchKeyword;
    if (!keyword || !keyword.trim()) {
      this.setData({ searchResults: [] });
      return;
    }
    if (this.data.searchLoading) return;
    const page = loadMore ? this.data.searchPage + 1 : 1;
    this.setData({ searchLoading: true });
    try {
      const res = await api.searchAlliance({
        keyword,
        type: this.data.searchType,
        searchAlliance: this.data.searchAlliance,
        page,
        pageSize: 10
      });
      if (res.code === 200) {
        const list = res.data.list.map(item => ({
          ...item,
          categoryName: util.getCategoryName(item.category),
          relativeTime: item.createTime ? util.formatRelativeTime(item.createTime) : ''
        }));
        this.setData({
          searchResults: loadMore ? [...this.data.searchResults, ...list] : list,
          searchPage: page,
          searchHasMore: res.data.hasMore
        });
      }
    } catch (e) {
      console.error('[Alliance] 搜索失败:', e);
    } finally {
      this.setData({ searchLoading: false });
    }
  },

  goToNodeDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/alliance-detail/alliance-detail?id=${id}` });
  },

  goToFeaturedDetail(e) {
    const item = e.currentTarget.dataset.item;
    if (item.sourceNodeId && item.sourceNodeId !== 'local') {
      wx.showToast({ title: '联盟内容仅供浏览', icon: 'none' });
      return;
    }
    if (item.itemType === 'article') {
      wx.navigateTo({ url: `/pages/detail/detail?id=${item.originalId}` });
    } else if (item.itemType === 'figure') {
      wx.navigateTo({ url: `/pages/figure-detail/figure-detail?id=${item.originalId}` });
    } else if (item.itemType === 'encyclopedia') {
      wx.navigateTo({ url: `/pages/encyclopedia-detail/encyclopedia-detail?id=${item.originalId}` });
    }
  }
});
