const api = require('../../utils/api');
const util = require('../../utils/util');
const app = getApp();

Page({
  data: {
    // 权限状态
    checkingPermission: true,
    hasPermission: false,
    userInfo: null,
    isSuperAdmin: false,

    // 村庄筛选
    villageList: [],
    reviewVillageId: 'all',

    // 当前 Tab
    currentTab: 0,
    tabs: [
      { id: 0, name: '数据看板', icon: '📊' },
      { id: 1, name: '内容审核', icon: '✅', badge: 0 },
      { id: 2, name: '举报处理', icon: '🚨', badge: 0 },
      { id: 3, name: '运营配置', icon: '⚙️' }
    ],

    // === 看板数据 ===
    dashboard: {
      totalUsers: 0,
      totalArticles: 0,
      totalTopics: 0,
      totalFigures: 0,
      dailySubmissions: [],
      categoryStats: []
    },

    // === 审核数据 ===
    reviewFilter: 'all', // all / figure / topic / encyclopedia
    reviewFilters: [
      { id: 'all', name: '全部' },
      { id: 'figure', name: '人物志' },
      { id: 'topic', name: '文化专题' },
      { id: 'encyclopedia', name: '文化百科' }
    ],
    pendingReview: [], // 待审列表

    // 驳回弹窗
    showRejectModal: false,
    rejectTargetId: '',
    rejectTargetType: '',
    rejectReason: '',

    // === 举报数据 ===
    reportFilter: 'all', // all / article / topic
    reportFilters: [
      { id: 'all', name: '全部' },
      { id: 'article', name: '文章' },
      { id: 'topic', name: '专题' }
    ],
    reports: [],

    // === 配置数据 ===
    configSections: [
      {
        id: 'banner',
        title: '广告位 Banner',
        icon: '🎯',
        desc: '首页顶部轮播 Banner 管理',
        count: 0
      },
      {
        id: 'hot',
        title: '热门推荐',
        icon: '🔥',
        desc: '热门推荐位维护',
        count: 0
      },
      {
        id: 'topic',
        title: '文化专题',
        icon: '📖',
        desc: '专题栏目创建、编辑、删除',
        page: '/pages/admin-topic/admin-topic'
      },
      {
        id: 'encyclopedia',
        title: '文化百科',
        icon: '📚',
        desc: '百科词条创建、编辑、删除',
        page: '/pages/admin-encyclopedia/admin-encyclopedia'
      },
      {
        id: 'sensitive',
        title: '敏感词库',
        icon: '🛑',
        desc: '维护敏感词库用于内容过滤',
        count: 0
      }
    ],

    // 动态高度（px，用于列表区精确计算）
    windowHeight: 0,
    statusBarHeight: 0,
    navBarHeight: 44,        // 小程序默认导航栏 44px
    headerHeight: 0,         // 顶部管理员头 + 四主 Tab 总高
    reviewFilterHeight: 68,  // 审核 Tab 的筛选栏高度（默认 fallback）
    reportFilterHeight: 68,  // 举报 Tab 的筛选栏高度（默认 fallback）
    tabContentHeight: 400,   // Tab 内容区总高度（windowHeight - headerHeight）
    reviewListHeight: 300,   // 审核 Tab 列表可滚动高度
    reportListHeight: 300,   // 举报 Tab 列表可滚动高度
    layoutReady: false,
    measureAttempts: 0       // 测量尝试次数，最多 5 次
  },

  // =============== 生命周期 ===============
  onLoad() {
    // 1. 先拿窗口信息（精确 px）
    this.initWindowMetrics();
    // 2. 权限校验
    this.checkPermission();
  },

  onReady() {
    // 渲染后测量各区域真实高度
    const app = getApp();
    if (app.isAdmin()) {
      // 延迟 200ms，等 DOM 渲染完整（含筛选栏 offscreen 元素）
      setTimeout(() => {
        this.measureAllRegions();
      }, 200);
    }
  },

  onShow() {
    if (!this.data.checkingPermission && !this.data.hasPermission) {
      this.checkPermission();
    }
    if (this.data.hasPermission) {
      this.refreshAllData();
      // 如果还没准备好，补一次测量（最多 5 次）
      if (!this.data.layoutReady && this.data.measureAttempts < 5) {
        setTimeout(() => this.measureAllRegions(), 150);
      }
    }
  },

  // =============== 权限守卫 ===============
  checkPermission() {
    const app = getApp();

    // 从 Storage 兜底读取，确保数据新鲜
    try {
      app.checkLoginStatus();
    } catch (e) {}

    const isLoggedIn = app.getLoginStatus();
    const isAdmin = app.isAdmin();
    const isSuperAdmin = app.isSuperAdmin();
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
        content: '您当前不是管理员账号，无法访问管理后台。\n\n如需申请管理员权限，请联系系统管理员。',
        showCancel: false,
        confirmText: '返回我的',
        success: () => {
          wx.switchTab({ url: '/pages/mine/mine' });
        }
      });
      return;
    }

    this.setData({
      checkingPermission: false,
      hasPermission: true,
      userInfo: userInfo || null,
      isSuperAdmin
    });
    // 权限通过后：立即触发测量（不依赖 onReady 时序）
    setTimeout(() => this.measureAllRegions(), 100);
    this.loadVillageList();
    this.refreshAllData();
  },

  goBack() {
    wx.switchTab({ url: '/pages/mine/mine' });
  },

  // =============== 动态高度计算（核心修复） ===============
  initWindowMetrics() {
    let winInfo = null;
    try {
      if (typeof wx.getWindowInfo === 'function') {
        winInfo = wx.getWindowInfo();
      } else {
        winInfo = wx.getSystemInfoSync();
      }
    } catch (e) {
      winInfo = wx.getSystemInfoSync();
    }
    // 微信小程序 windowHeight = 屏幕高度 - 状态栏高度 - 胶囊导航栏高度
    // 这是可用于渲染的真实高度，不需要再额外减 navBarHeight
    const windowHeight = winInfo.windowHeight || 667;
    const statusBarHeight = winInfo.statusBarHeight || 20;

    let navBarHeight = 44;
    if (winInfo.system && /android/i.test(winInfo.system)) {
      navBarHeight = 48;
    }

    // 用窗口信息先粗略算一下，防止首帧空白
    const approxHeader = 170; // 预估 header 约 170px
    const tabContentHeight = Math.max(windowHeight - approxHeader, 300);
    const approxFilter = 68;

    this.setData({
      windowHeight,
      statusBarHeight,
      navBarHeight,
      tabContentHeight,
      reviewFilterHeight: approxFilter,
      reportFilterHeight: approxFilter,
      reviewListHeight: Math.max(tabContentHeight - approxFilter, 240),
      reportListHeight: Math.max(tabContentHeight - approxFilter, 240)
    });
    console.log('[Admin] 窗口信息 (粗略值):', { windowHeight, statusBarHeight, navBarHeight, tabContentHeight });
  },

  // 通过 selectorQuery 测量 Header + 两个筛选栏的真实高度（含 fallback）
  measureAllRegions() {
    const attempts = this.data.measureAttempts + 1;
    this.setData({ measureAttempts: attempts });
    console.log(`[Admin] 测量尝试 ${attempts}/5`);

    const query = wx.createSelectorQuery().in(this);
    query.select('.admin-header').boundingClientRect();
    query.select('.review-filter-wrap').boundingClientRect();
    query.select('.report-filter-wrap').boundingClientRect();
    query.exec((res) => {
      const headerRect = (res && res[0]) || null;
      const reviewFilterRect = (res && res[1]) || null;
      const reportFilterRect = (res && res[2]) || null;

      // fallback 默认值（经验值，单位 px）
      const headerHeight = headerRect && headerRect.height > 0 ? headerRect.height : 170;
      let reviewFilterHeight = reviewFilterRect && reviewFilterRect.height > 0 ? reviewFilterRect.height : 0;
      let reportFilterHeight = reportFilterRect && reportFilterRect.height > 0 ? reportFilterRect.height : 0;

      // 如果某个筛选栏还是测不到（可能 DOM 还没渲染好），尝试重试最多 5 次
      const needRetry = (!reviewFilterHeight || !reportFilterHeight) && attempts < 5;

      if (needRetry) {
        console.log('[Admin] 测量未完成，150ms 后重试:', { reviewFilterHeight, reportFilterHeight });
        setTimeout(() => this.measureAllRegions(), 150);
        return;
      }

      // 最终兜底：如果重试完还没到，用经验值 68px
      if (!reviewFilterHeight) reviewFilterHeight = 68;
      if (!reportFilterHeight) reportFilterHeight = 68;

      console.log('[Admin] 各区域测量完成:', {
        headerHeight,
        reviewFilterHeight,
        reportFilterHeight,
        attempts
      });

      this.setData({
        headerHeight,
        reviewFilterHeight,
        reportFilterHeight
      });

      this.recalcListHeights();
    });
  },

  // 根据测量结果精确计算列表高度
  recalcListHeights() {
    const { windowHeight, headerHeight, reviewFilterHeight, reportFilterHeight } = this.data;

    // 关键公式：
    // tabContentHeight = windowHeight - headerHeight - 20 (安全边距)
    //   这个是整个 Tab 内容区的高度（筛选栏 + 列表），写在 tab-layout 的 style.height 上
    //
    // reviewListHeight = tabContentHeight - reviewFilterHeight
    //   这个是列表区的精确高度，写在 scroll-view 的 style.height 上

    const tabContentHeight = Math.max(windowHeight - headerHeight - 20, 240);
    const reviewListHeight = Math.max(tabContentHeight - reviewFilterHeight, 200);
    const reportListHeight = Math.max(tabContentHeight - reportFilterHeight, 200);

    this.setData({
      tabContentHeight,
      reviewListHeight,
      reportListHeight,
      layoutReady: true
    });
    console.log('[Admin] 最终高度计算:', {
      windowHeight,
      headerHeight,
      tabContentHeight,
      reviewFilterHeight,
      reportFilterHeight,
      reviewListHeight,
      reportListHeight
    });
  },

  // =============== 数据刷新 ===============
  async refreshAllData() {
    this.loadDashboard();
    this.loadPendingReview();
    this.loadReports();
    this.loadConfigCounts();
  },

  // === 数据看板 ===
  async loadDashboard() {
    try {
      const articlesRes = await api.getArticleList({ page: 1, pageSize: 1 });
      const topicsRes = await api.getTopicList({ page: 1, pageSize: 1 });
      const figuresRes = await api.getFigureList({ page: 1, pageSize: 1 });

      const totalArticles = articlesRes.data ? articlesRes.data.total : 0;
      const totalTopics = topicsRes.data ? topicsRes.data.total : 0;
      const totalFigures = figuresRes.data ? figuresRes.data.total : 0;

      // 模拟用户数
      const users = wx.getStorageSync('registeredUsers') || [];
      const totalUsers = Math.max(users.length, 128);

      // 模拟近7天日投稿趋势
      const categories = wx.getStorageSync('categories') || [];
      const articles = wx.getStorageSync('articles') || [];

      const dailySubmissions = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const date = d.toISOString().split('T')[0].slice(5);
        const count = Math.floor(Math.random() * 8) + 2 + (6 - i);
        dailySubmissions.push({ date, count });
      }

      // 分类占比统计
      const categoryMap = {};
      articles.forEach(a => {
        categoryMap[a.category] = (categoryMap[a.category] || 0) + 1;
      });
      const categoryStats = categories
        .filter(c => c.id !== 'all')
        .map(c => ({
          id: c.id,
          name: c.name,
          count: categoryMap[c.id] || 0,
          percent: 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
      const catTotal = categoryStats.reduce((s, c) => s + c.count, 0) || 1;
      categoryStats.forEach(c => {
        c.percent = Math.round((c.count / catTotal) * 100);
      });

      this.setData({
        'dashboard.totalUsers': totalUsers,
        'dashboard.totalArticles': totalArticles,
        'dashboard.totalTopics': totalTopics,
        'dashboard.totalFigures': totalFigures,
        'dashboard.dailySubmissions': dailySubmissions,
        'dashboard.categoryStats': categoryStats
      });
    } catch (error) {
      console.error('[Admin] 加载看板数据异常:', error);
    }
  },

  // === 村庄列表 ===
  async loadVillageList() {
    try {
      const res = await api.getVillageList({ pageSize: 100 });
      if (res.code === 200) {
        this.setData({
          villageList: res.data.list || []
        });
      }
    } catch (error) {
      console.error('[Admin] 加载村庄列表失败:', error);
    }
  },

  onReviewVillageChange(e) {
    const villageId = e.currentTarget.dataset.id;
    this.setData({
      reviewVillageId: villageId
    });
    this.loadPendingReview();
    this.loadReports();
  },

  // === 待审核内容 ===
  async loadPendingReview() {
    try {
      const { reviewVillageId, villageList, isSuperAdmin } = this.data;

      const currentVillageId = app.getCurrentVillageId();
      const filterVillageId = isSuperAdmin ? reviewVillageId : currentVillageId;

      const getVillageName = (vid) => {
        const v = villageList.find(item => item.id === vid);
        return v ? v.name : '';
      };

      // 从 figureDrafts 读取待审人物志
      const drafts = wx.getStorageSync('figureDrafts') || [];
      let pendingFigureDrafts = drafts
        .filter(d => d.reviewStatus === 'pending' || d.status === 0);

      if (filterVillageId && filterVillageId !== 'all') {
        pendingFigureDrafts = pendingFigureDrafts.filter(d => d.villageId === filterVillageId);
      }

      pendingFigureDrafts = pendingFigureDrafts.map(d => ({
        id: d.id,
        type: 'figure',
        title: d.name,
        desc: (d.briefIntroduction || '').slice(0, 60),
        submitter: d.submitterName || '匿名',
        createTime: d.createTime,
        villageId: d.villageId,
        villageName: getVillageName(d.villageId),
        data: d
      }));

      // 从 articles 找 status=0 的待审文章
      const articles = wx.getStorageSync('articles') || [];
      let pendingArticles = articles
        .filter(a => a.status === 0);

      if (filterVillageId && filterVillageId !== 'all') {
        pendingArticles = pendingArticles.filter(a => a.villageId === filterVillageId);
      }

      pendingArticles = pendingArticles.map(a => ({
        id: a.id,
        type: 'article',
        title: a.title,
        desc: (a.content || '').slice(0, 60),
        submitter: a.authorName || '匿名',
        createTime: a.createTime,
        villageId: a.villageId,
        villageName: getVillageName(a.villageId),
        data: a
      }));

      const typeMap = {
        figure: '人物志',
        topic: '文化专题',
        encyclopedia: '文化百科',
        article: '文章'
      };
      const pendingReview = [...pendingFigureDrafts, ...pendingArticles].map(item => ({
        ...item,
        typeName: typeMap[item.type] || '文章'
      }));
      const reviewBadge = pendingReview.length;

      this.setData({
        pendingReview,
        'tabs[1].badge': reviewBadge
      });
    } catch (error) {
      console.error('[Admin] 加载待审核内容异常:', error);
    }
  },

  // === 举报 ===
  loadReports() {
    try {
      const typeMap = {
        article: '文章举报',
        topic: '专题举报'
      };
      const processReports = (reports) => reports.map(r => {
        let statusName = '待处理';
        if (r.status === 'handled') {
          statusName = r.action === 'taken-down' ? '已下架' : '已忽略';
        }
        return {
          ...r,
          typeName: typeMap[r.type] || '举报',
          statusName
        };
      });

      let reports = wx.getStorageSync('reports') || [];
      // 若空，初始化一批 mock 举报
      if (reports.length === 0) {
        const mockReports = [
          {
            id: 'r_001',
            type: 'article',
            targetId: 'article_002',
            targetTitle: '外婆的织布手艺',
            reporter: '用户A',
            reason: '内容不实，有夸大成分',
            detail: '部分内容涉及虚构的故事和人物经历。',
            createTime: '2024-12-22 14:30',
            status: 'pending'
          },
          {
            id: 'r_002',
            type: 'article',
            targetId: 'article_005',
            targetTitle: '爷爷的二十四节气歌',
            reporter: '用户B',
            reason: '涉嫌抄袭',
            detail: '内容疑似来自某微信公众号文章。',
            createTime: '2024-12-23 09:12',
            status: 'pending'
          },
          {
            id: 'r_003',
            type: 'topic',
            targetId: 'topic_002',
            targetTitle: '传统织布技艺',
            reporter: '用户C',
            reason: '广告引流',
            detail: '专题内包含第三方联系方式和链接。',
            createTime: '2024-12-24 20:45',
            status: 'pending'
          }
        ];
        wx.setStorageSync('reports', mockReports);
        const processedReports = processReports(mockReports);
        this.setData({
          reports: processedReports,
          'tabs[2].badge': processedReports.filter(r => r.status === 'pending').length
        });
      } else {
        const processedReports = processReports(reports);
        this.setData({
          reports: processedReports,
          'tabs[2].badge': processedReports.filter(r => r.status === 'pending').length
        });
      }
    } catch (error) {
      console.error('[Admin] 加载举报数据异常:', error);
    }
  },

  // === 配置计数 ===
  loadConfigCounts() {
    try {
      const banners = wx.getStorageSync('banners') || [];
      const hotRecs = wx.getStorageSync('hotRecommendations') || [];
      const words = wx.getStorageSync('sensitiveWords') || [];

      const sections = this.data.configSections.map(s => {
        if (s.id === 'banner') return { ...s, count: banners.length };
        if (s.id === 'hot') return { ...s, count: hotRecs.length };
        if (s.id === 'sensitive') return { ...s, count: words.length };
        return s;
      });

      this.setData({ configSections: sections });
    } catch (error) {
      console.error('[Admin] 加载配置计数异常:', error);
    }
  },

  // =============== Tab 切换 ===============
  onTabChange(e) {
    const id = e.currentTarget.dataset.id;
    const prevTab = this.data.currentTab;
    this.setData({ currentTab: id });

    // 切到审核或举报 Tab 时，确保高度已计算；如果还没 ready，补一次测量
    if ((id === 1 || id === 2) && !this.data.layoutReady) {
      setTimeout(() => this.measureAllRegions(), 60);
    }
    // 如果从非审核/举报 Tab 切过来，也补一次重算（确保当前激活的筛选栏高度正确）
    if ((id === 1 || id === 2) && (prevTab !== 1 && prevTab !== 2)) {
      setTimeout(() => this.recalcListHeights(), 50);
    }
  },

  onReviewFilterChange(e) {
    this.setData({ reviewFilter: e.currentTarget.dataset.id });
  },

  onReportFilterChange(e) {
    this.setData({ reportFilter: e.currentTarget.dataset.id });
  },

  // 计算过滤后的待审列表
  getFilteredReview() {
    const filter = this.data.reviewFilter;
    const list = this.data.pendingReview;
    if (filter === 'all') return list;
    return list.filter(item => item.type === filter);
  },

  getFilteredReports() {
    const filter = this.data.reportFilter;
    const list = this.data.reports;
    if (filter === 'all') return list;
    return list.filter(r => r.type === filter);
  },

  // =============== 审核操作 ===============
  onApprove(e) {
    const { id, type } = e.currentTarget.dataset;
    const item = this.data.pendingReview.find(p => p.id === id);
    if (!item) return;

    wx.showModal({
      title: '确认通过',
      content: `确定要通过审核「${item.title}」吗？`,
      confirmColor: '#52c41a',
      success: async (res) => {
        if (!res.confirm) return;

        try {
          if (type === 'figure') {
            const drafts = wx.getStorageSync('figureDrafts') || [];
            const figures = wx.getStorageSync('figures') || [];
            const idx = drafts.findIndex(d => d.id === id);
            if (idx > -1) {
              const draft = drafts[idx];
              const figure = {
                ...draft,
                status: 1,
                reviewStatus: 'approved',
                approveTime: util.formatDate(new Date(), 'YYYY-MM-DD'),
                viewCount: 0,
                likeCount: 0,
                relatedArticles: draft.relatedArticles || []
              };
              figures.unshift(figure);
              drafts.splice(idx, 1);
              wx.setStorageSync('figureDrafts', drafts);
              wx.setStorageSync('figures', figures);
            }
          } else if (type === 'article') {
            const articles = wx.getStorageSync('articles') || [];
            const idx = articles.findIndex(a => a.id === id);
            if (idx > -1) {
              articles[idx].status = 1;
              articles[idx].approveTime = util.formatDate(new Date(), 'YYYY-MM-DD');
              wx.setStorageSync('articles', articles);
            }
          }

          wx.showToast({ title: '审核通过', icon: 'success' });
          this.loadPendingReview();
        } catch (error) {
          console.error('[Admin] 审核通过异常:', error);
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    });
  },

  openRejectModal(e) {
    const { id, type } = e.currentTarget.dataset;
    this.setData({
      showRejectModal: true,
      rejectTargetId: id,
      rejectTargetType: type,
      rejectReason: ''
    });
  },

  closeRejectModal() {
    this.setData({ showRejectModal: false, rejectReason: '' });
  },

  onRejectReasonInput(e) {
    this.setData({ rejectReason: e.detail.value });
  },

  confirmReject() {
    const reason = (this.data.rejectReason || '').trim();
    if (reason.length < 5) {
      wx.showToast({ title: '驳回原因至少5字', icon: 'none' });
      return;
    }

    const id = this.data.rejectTargetId;
    const type = this.data.rejectTargetType;

    try {
      if (type === 'figure') {
        const drafts = wx.getStorageSync('figureDrafts') || [];
        const idx = drafts.findIndex(d => d.id === id);
        if (idx > -1) {
          drafts[idx].reviewStatus = 'rejected';
          drafts[idx].rejectReason = reason;
          drafts[idx].rejectTime = util.formatDate(new Date(), 'YYYY-MM-DD');
          wx.setStorageSync('figureDrafts', drafts);
        }
      } else if (type === 'article') {
        const articles = wx.getStorageSync('articles') || [];
        const idx = articles.findIndex(a => a.id === id);
        if (idx > -1) {
          articles[idx].status = 2;
          articles[idx].rejectReason = reason;
          articles[idx].rejectTime = util.formatDate(new Date(), 'YYYY-MM-DD');
          wx.setStorageSync('articles', articles);
        }
      }

      wx.showToast({ title: '已驳回', icon: 'success' });
      this.setData({ showRejectModal: false, rejectReason: '' });
      this.loadPendingReview();
    } catch (error) {
      console.error('[Admin] 驳回异常:', error);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  // =============== 举报操作 ===============
  onTakeDown(e) {
    const id = e.currentTarget.dataset.id;
    const report = this.data.reports.find(r => r.id === id);
    if (!report) return;

    wx.showModal({
      title: '确认下架',
      content: `确定要下架「${report.targetTitle}」吗？该内容将被用户端隐藏。`,
      confirmColor: '#FF4D4F',
      success: (res) => {
        if (!res.confirm) return;
        try {
          // 处理不同类型的下架
          if (report.type === 'article') {
            const articles = wx.getStorageSync('articles') || [];
            const idx = articles.findIndex(a => a.id === report.targetId);
            if (idx > -1) {
              articles[idx].status = 0;
              articles[idx].takenDownTime = util.formatDate(new Date(), 'YYYY-MM-DD');
              wx.setStorageSync('articles', articles);
            }
          } else if (report.type === 'topic') {
            const topics = wx.getStorageSync('topics') || [];
            const idx = topics.findIndex(t => t.id === report.targetId);
            if (idx > -1) {
              topics[idx].status = 0;
              wx.setStorageSync('topics', topics);
            }
          }
          // 更新举报状态
          const reports = wx.getStorageSync('reports') || [];
          const rIdx = reports.findIndex(r => r.id === id);
          if (rIdx > -1) {
            reports[rIdx].status = 'handled';
            reports[rIdx].action = 'taken-down';
            reports[rIdx].handleTime = util.formatDate(new Date(), 'YYYY-MM-DD HH:mm');
            wx.setStorageSync('reports', reports);
          }
          this.loadReports();
          wx.showToast({ title: '已下架', icon: 'success' });
        } catch (error) {
          console.error('[Admin] 下架异常:', error);
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    });
  },

  onIgnoreReport(e) {
    const id = e.currentTarget.dataset.id;
    try {
      const reports = wx.getStorageSync('reports') || [];
      const idx = reports.findIndex(r => r.id === id);
      if (idx > -1) {
        reports[idx].status = 'handled';
        reports[idx].action = 'ignored';
        reports[idx].handleTime = util.formatDate(new Date(), 'YYYY-MM-DD HH:mm');
        wx.setStorageSync('reports', reports);
      }
      this.loadReports();
      wx.showToast({ title: '已忽略', icon: 'success' });
    } catch (error) {
      console.error('[Admin] 忽略举报异常:', error);
    }
  },

  // =============== 配置模块跳转 ===============
  onConfigSectionTap(e) {
    const id = e.currentTarget.dataset.id;
    const section = this.data.configSections.find(s => s.id === id);
    if (!section) return;

    if (section.page) {
      wx.navigateTo({ url: section.page });
    } else {
      wx.showToast({ title: `${section.title}功能开发中`, icon: 'none' });
    }
  }
});
