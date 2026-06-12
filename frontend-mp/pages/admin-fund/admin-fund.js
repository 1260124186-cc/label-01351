const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    checkingPermission: true,
    hasPermission: false,
    userInfo: null,

    currentTab: 0,
    tabs: [
      { id: 0, name: '项目管理', icon: '📋', badge: 0 },
      { id: 1, name: '留言审核', icon: '💬', badge: 0 }
    ],

    // 项目管理
    projectList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    statusFilter: 'all',
    statusFilters: [
      { id: 'all', name: '全部' },
      { id: 'ongoing', name: '进行中' },
      { id: 'achieved', name: '已达成' },
      { id: 'ended', name: '已结束' }
    ],

    // 留言审核
    pendingComments: [],
    commentPage: 1,
    commentPageSize: 20,
    commentHasMore: true,
    commentLoading: false,

    // 创建/编辑项目弹窗
    showEditModal: false,
    editingProject: null,
    editForm: {
      name: '',
      targetAmount: '',
      description: '',
      beneficiaryDesc: '',
      projectStatus: 'ongoing'
    },

    // 添加时间线弹窗
    showTimelineModal: false,
    timelineProjectId: '',
    timelineForm: {
      title: '',
      date: '',
      content: '',
      type: 'milestone'
    },
    timelineTypes: [
      { id: 'milestone', name: '里程碑', icon: '🎯' },
      { id: 'funding', name: '资金拨付', icon: '💰' },
      { id: 'event', name: '活动', icon: '📅' },
      { id: 'report', name: '公示', icon: '📋' },
      { id: 'other', name: '其他', icon: '📌' }
    ],

    // 添加捐赠记录弹窗
    showDonationModal: false,
    donationProjectId: '',
    donationForm: {
      donorName: '',
      amount: '',
      method: 'offline_bank',
      remark: '',
      isAnonymous: false
    },
    donationMethods: [],

    // 驳回原因弹窗
    showRejectModal: false,
    rejectCommentId: '',
    rejectReason: '',

    windowHeight: 0
  },

  onLoad(options) {
    this.setData({
      donationMethods: util.getDonationMethods()
    });

    try {
      const sysInfo = wx.getSystemInfoSync();
      this.setData({ windowHeight: sysInfo.windowHeight });
    } catch (e) {}

    this.checkPermission();

    if (options.editId) {
      // 从详情页跳转过来编辑
    }
  },

  onShow() {
    if (!this.data.checkingPermission && this.data.hasPermission) {
      this.refreshAllData();
    }
  },

  onPullDownRefresh() {
    if (this.data.hasPermission) {
      this.refreshAllData().then(() => {
        wx.stopPullDownRefresh();
      });
    } else {
      wx.stopPullDownRefresh();
    }
  },

  onReachBottom() {
    if (this.data.currentTab === 0 && this.data.hasMore && !this.data.loading) {
      this.loadMoreProjects();
    } else if (this.data.currentTab === 1 && this.data.commentHasMore && !this.data.commentLoading) {
      this.loadMoreComments();
    }
  },

  checkPermission() {
    const app = getApp();

    try {
      app.checkLoginStatus();
    } catch (e) {}

    const isLoggedIn = app.getLoginStatus();
    const isAdmin = app.isAdmin();
    const userInfo = app.getUserInfo();

    if (!isLoggedIn) {
      this.setData({ checkingPermission: false, hasPermission: false, userInfo: null });
      wx.showModal({
        title: '请先登录',
        content: '需要登录后才能访问管理后台',
        showCancel: false,
        success: () => {
          wx.switchTab({ url: '/pages/mine/mine' });
        }
      });
      return;
    }

    if (!isAdmin) {
      this.setData({
        checkingPermission: false,
        hasPermission: false,
        userInfo: userInfo || null
      });
      wx.showModal({
        title: '无权限访问',
        content: '您当前不是管理员账号，无法访问管理后台。',
        showCancel: false,
        confirmText: '返回',
        success: () => {
          wx.navigateBack();
        }
      });
      return;
    }

    this.setData({
      checkingPermission: false,
      hasPermission: true,
      userInfo: userInfo || null
    });

    this.refreshAllData();
  },

  goBack() {
    wx.navigateBack();
  },

  async refreshAllData() {
    this.loadProjectList();
    this.loadPendingComments();
  },

  // === Tab 切换 ===
  onTabChange(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ currentTab: id });
  },

  // === 项目管理 ===
  async loadProjectList() {
    this.setData({
      page: 1,
      projectList: [],
      hasMore: true
    });
    return this.loadProjects();
  },

  async loadProjects() {
    this.setData({ loading: true });

    try {
      const res = await api.getFundProjectAdminList({
        status: this.data.statusFilter,
        page: this.data.page,
        pageSize: this.data.pageSize
      });

      if (res.code === 200) {
        const list = res.data.list.map(item => ({
          ...item,
          targetAmountDisplay: util.formatAmount(item.targetAmount),
          raisedAmountDisplay: util.formatAmount(item.raisedAmount)
        }));

        this.setData({
          projectList: this.data.page === 1 ? list : [...this.data.projectList, ...list],
          hasMore: res.data.hasMore
        });
      }
    } catch (error) {
      console.error('[AdminFund] 加载项目列表失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadMoreProjects() {
    if (!this.data.hasMore || this.data.loading) return;

    this.setData({
      loading: true,
      page: this.data.page + 1
    });

    await this.loadProjects();
  },

  onStatusFilterChange(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.statusFilter) return;

    this.setData({
      statusFilter: id,
      page: 1,
      projectList: [],
      hasMore: true
    });

    this.loadProjects();
  },

  // 创建新项目
  openCreateModal() {
    const today = util.formatDate(new Date(), 'YYYY-MM-DD');
    this.setData({
      showEditModal: true,
      editingProject: null,
      editForm: {
        name: '',
        targetAmount: '',
        description: '',
        beneficiaryDesc: '',
        projectStatus: 'ongoing'
      },
      timelineForm: {
        title: '',
        date: today,
        content: '',
        type: 'milestone'
      }
    });
  },

  closeEditModal() {
    this.setData({ showEditModal: false });
  },

  onEditInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`editForm.${field}`]: value
    });
  },

  onStatusSelect(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      'editForm.projectStatus': status
    });
  },

  async onSaveProject() {
    const { editForm, editingProject } = this.data;

    if (!editForm.name || !editForm.name.trim()) {
      wx.showToast({ title: '请输入项目名称', icon: 'none' });
      return;
    }
    if (!editForm.targetAmount || parseFloat(editForm.targetAmount) <= 0) {
      wx.showToast({ title: '请输入有效的目标金额', icon: 'none' });
      return;
    }
    if (!editForm.description || !editForm.description.trim()) {
      wx.showToast({ title: '请输入项目描述', icon: 'none' });
      return;
    }
    if (!editForm.beneficiaryDesc || !editForm.beneficiaryDesc.trim()) {
      wx.showToast({ title: '请输入受益说明', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    try {
      let res;
      if (editingProject) {
        res = await api.updateFundProject(editingProject.id, editForm);
      } else {
        res = await api.createFundProject(editForm);
      }

      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({
          title: editingProject ? '更新成功' : '创建成功',
          icon: 'success'
        });
        this.setData({ showEditModal: false });
        this.loadProjectList();
      } else {
        wx.showToast({
          title: res.message || '操作失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[AdminFund] 保存项目失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  },

  // 编辑项目
  onEditProject(e) {
    const id = e.currentTarget.dataset.id;
    const project = this.data.projectList.find(p => p.id === id);
    if (!project) return;

    this.setData({
      showEditModal: true,
      editingProject: project,
      editForm: {
        name: project.name,
        targetAmount: String(project.targetAmount),
        description: project.description,
        beneficiaryDesc: project.beneficiaryDesc,
        projectStatus: project.projectStatus
      }
    });
  },

  // 更新项目状态
  onUpdateStatus(e) {
    const { id, status } = e.currentTarget.dataset;
    const project = this.data.projectList.find(p => p.id === id);
    if (!project) return;

    const statusMap = {
      ongoing: '进行中',
      achieved: '已达成',
      ended: '已结束'
    };

    wx.showModal({
      title: '确认操作',
      content: `确定要将项目状态更新为「${statusMap[status]}」吗？`,
      success: async (res) => {
        if (!res.confirm) return;

        try {
          const result = await api.updateFundProject(id, { projectStatus: status });
          if (result.code === 200) {
            wx.showToast({ title: '更新成功', icon: 'success' });
            this.loadProjectList();
          } else {
            wx.showToast({ title: result.message || '更新失败', icon: 'none' });
          }
        } catch (error) {
          console.error('[AdminFund] 更新状态失败:', error);
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    });
  },

  // 添加时间线
  openTimelineModal(e) {
    const projectId = e.currentTarget.dataset.id;
    const today = util.formatDate(new Date(), 'YYYY-MM-DD');

    this.setData({
      showTimelineModal: true,
      timelineProjectId: projectId,
      timelineForm: {
        title: '',
        date: today,
        content: '',
        type: 'milestone'
      }
    });
  },

  closeTimelineModal() {
    this.setData({ showTimelineModal: false });
  },

  onTimelineInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`timelineForm.${field}`]: value
    });
  },

  onTimelineTypeSelect(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      'timelineForm.type': type
    });
  },

  onTimelineDateChange(e) {
    this.setData({
      'timelineForm.date': e.detail.value
    });
  },

  async onSaveTimeline() {
    const { timelineProjectId, timelineForm } = this.data;

    if (!timelineForm.title || !timelineForm.title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    try {
      const res = await api.addFundTimeline(timelineProjectId, timelineForm);
      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({ title: '添加成功', icon: 'success' });
        this.setData({ showTimelineModal: false });
      } else {
        wx.showToast({
          title: res.message || '添加失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[AdminFund] 添加时间线失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  // 添加捐赠记录
  openDonationModal(e) {
    const projectId = e.currentTarget.dataset.id;

    this.setData({
      showDonationModal: true,
      donationProjectId: projectId,
      donationForm: {
        donorName: '',
        amount: '',
        method: 'offline_bank',
        remark: '',
        isAnonymous: false
      }
    });
  },

  closeDonationModal() {
    this.setData({ showDonationModal: false });
  },

  onDonationInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`donationForm.${field}`]: value
    });
  },

  onDonationMethodSelect(e) {
    const method = e.currentTarget.dataset.method;
    this.setData({
      'donationForm.method': method
    });
  },

  onAnonymousToggle(e) {
    this.setData({
      'donationForm.isAnonymous': e.detail.value
    });
  },

  async onSaveDonation() {
    const { donationProjectId, donationForm } = this.data;

    if (!donationForm.amount || parseFloat(donationForm.amount) <= 0) {
      wx.showToast({ title: '请输入有效的捐赠金额', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    try {
      const res = await api.addFundDonation(donationProjectId, donationForm);
      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({ title: '添加成功', icon: 'success' });
        this.setData({ showDonationModal: false });
        this.loadProjectList();
      } else {
        wx.showToast({
          title: res.message || '添加失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[AdminFund] 添加捐赠记录失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  // === 留言审核 ===
  async loadPendingComments() {
    this.setData({
      commentPage: 1,
      pendingComments: [],
      commentHasMore: true
    });
    return this.loadComments();
  },

  async loadComments() {
    this.setData({ commentLoading: true });

    try {
      const res = await api.getPendingFundComments({
        page: this.data.commentPage,
        pageSize: this.data.commentPageSize
      });

      if (res.code === 200) {
        const list = res.data.list || [];
        this.setData({
          pendingComments: this.data.commentPage === 1 ? list : [...this.data.pendingComments, ...list],
          commentHasMore: res.data.hasMore,
          'tabs[1].badge': res.data.total || 0
        });
      }
    } catch (error) {
      console.error('[AdminFund] 加载待审核留言失败:', error);
    } finally {
      this.setData({ commentLoading: false });
    }
  },

  async loadMoreComments() {
    if (!this.data.commentHasMore || this.data.commentLoading) return;

    this.setData({
      commentLoading: true,
      commentPage: this.data.commentPage + 1
    });

    await this.loadComments();
  },

  onApproveComment(e) {
    const id = e.currentTarget.dataset.id;
    const comment = this.data.pendingComments.find(c => c.id === id);
    if (!comment) return;

    wx.showModal({
      title: '审核通过',
      content: '确定要通过这条留言吗？通过后将在项目详情页展示。',
      confirmColor: '#52c41a',
      success: async (res) => {
        if (!res.confirm) return;

        try {
          const result = await api.approveFundComment(id);
          if (result.code === 200) {
            wx.showToast({ title: '已通过', icon: 'success' });
            this.loadPendingComments();
          } else {
            wx.showToast({ title: result.message || '操作失败', icon: 'none' });
          }
        } catch (error) {
          console.error('[AdminFund] 审核通过失败:', error);
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    });
  },

  openRejectModal(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      showRejectModal: true,
      rejectCommentId: id,
      rejectReason: ''
    });
  },

  closeRejectModal() {
    this.setData({ showRejectModal: false });
  },

  onRejectReasonInput(e) {
    this.setData({ rejectReason: e.detail.value });
  },

  async onConfirmReject() {
    const { rejectCommentId, rejectReason } = this.data;

    if (!rejectReason || rejectReason.trim().length < 5) {
      wx.showToast({ title: '驳回原因至少5字', icon: 'none' });
      return;
    }

    try {
      const res = await api.rejectFundComment(rejectCommentId, rejectReason.trim());
      if (res.code === 200) {
        wx.showToast({ title: '已驳回', icon: 'success' });
        this.setData({ showRejectModal: false });
        this.loadPendingComments();
      } else {
        wx.showToast({ title: res.message || '操作失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[AdminFund] 驳回留言失败:', error);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  // 查看项目详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/fund-detail/fund-detail?id=${id}`
    });
  },

  stopPropagation() {}
});
