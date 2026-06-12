// pages/admin-certificate/admin-certificate.js
// 管理员证书颁发页面

const api = require('../../utils/api');

Page({
  data: {
    issueMode: 'single',
    issueModes: [
      { id: 'single', name: '单张颁发', icon: '📜' },
      { id: 'batch', name: '批量颁发', icon: '📦' },
      { id: 'activity', name: '活动结业', icon: '🎓' },
      { id: 'collection', name: '征集完成', icon: '📝' },
      { id: 'annual', name: '年度评选', icon: '🏆' }
    ],

    certificateTypes: [],
    selectedTypeId: '',
    typeIndex: 0,
    selectedTypeName: '',
    issuingUnits: [],
    selectedUnitId: '',
    unitIndex: 0,
    selectedUnitName: '',

    users: [],
    selectedUserIds: [],
    searchKeyword: '',
    filteredUsersWithSelected: [],
    selectedUsersDisplay: [],

    activities: [],
    selectedActivityId: '',
    activityIndex: 0,
    selectedActivityTitle: '',

    articles: [],
    selectedArticleId: '',
    articleIndex: 0,
    selectedArticleTitle: '',

    title: '',
    reason: '',
    issueDate: '',

    submitting: false,
    previewData: null,
    submitBtnText: '确认颁发 0 张证书',

    showUserPicker: false,
    showActivityPicker: false,
    showArticlePicker: false,

    issueResult: null
  },

  onLoad() {
    this.initData();
  },

  async initData() {
    try {
      const [typesRes, unitsRes, usersRes, activitiesRes, articlesRes] = await Promise.all([
        api.getCertificateTypes(),
        api.getIssuingUnits(),
        api.getAllUsers(),
        api.getActivityList({ pageSize: 100 }),
        api.getAllArticles()
      ]);

      const today = new Date().toISOString().split('T')[0];

      this.setData({
        certificateTypes: typesRes.code === 200 ? typesRes.data : [],
        issuingUnits: unitsRes.code === 200 ? unitsRes.data : [],
        users: usersRes.code === 200 ? usersRes.data : [],
        activities: activitiesRes.code === 200 ? (activitiesRes.data.list || []) : [],
        articles: articlesRes.code === 200 ? articlesRes.data : [],
        issueDate: today
      });

      if (this.data.certificateTypes.length > 0) {
        this.setData({ selectedTypeId: this.data.certificateTypes[0].id });
      }
      if (this.data.issuingUnits.length > 0) {
        this.setData({ selectedUnitId: this.data.issuingUnits[0].id });
      }
      this.updateComputedData();
    } catch (e) {
      console.error('[AdminCertificate] 初始化数据失败:', e);
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    }
  },

  onModeChange(e) {
    const { mode } = e.currentTarget.dataset;
    this.setData({
      issueMode: mode,
      selectedUserIds: [],
      selectedActivityId: '',
      selectedArticleId: '',
      issueResult: null
    });
    this.updatePreview();
  },

  onTypeChange(e) {
    const index = parseInt(e.detail.value, 10);
    const selectedType = this.data.certificateTypes[index];
    this.setData({ selectedTypeId: selectedType ? selectedType.id : '' });
    this.updatePreview();
  },

  onUnitChange(e) {
    const index = parseInt(e.detail.value, 10);
    const selectedUnit = this.data.issuingUnits[index];
    this.setData({ selectedUnitId: selectedUnit ? selectedUnit.id : '' });
    this.updatePreview();
  },

  onReasonInput(e) {
    this.setData({ reason: e.detail.value });
    this.updatePreview();
  },

  onDateChange(e) {
    this.setData({ issueDate: e.detail.value });
    this.updatePreview();
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
    this.updateComputedData();
  },

  toggleUserSelect(e) {
    const { userId } = e.currentTarget.dataset;
    let selectedUserIds = [...this.data.selectedUserIds];
    const index = selectedUserIds.indexOf(userId);

    if (index > -1) {
      selectedUserIds.splice(index, 1);
    } else {
      selectedUserIds.push(userId);
    }

    this.setData({ selectedUserIds });
    this.updatePreview();
  },

  selectAllUsers() {
    const filteredUsers = this.getFilteredUsers();
    const allIds = filteredUsers.map(u => u.id);
    this.setData({ selectedUserIds: allIds });
    this.updatePreview();
  },

  clearSelectedUsers() {
    this.setData({ selectedUserIds: [] });
    this.updatePreview();
  },

  onActivityChange(e) {
    const index = parseInt(e.detail.value, 10);
    const selectedActivity = this.data.activities[index];
    this.setData({ selectedActivityId: selectedActivity ? selectedActivity.id : '' });
    this.updatePreview();
  },

  onArticleChange(e) {
    const index = parseInt(e.detail.value, 10);
    const selectedArticle = this.data.articles[index];
    this.setData({ selectedArticleId: selectedArticle ? selectedArticle.id : '' });
    this.updatePreview();
  },

  getFilteredUsers() {
    const { users, searchKeyword } = this.data;
    if (!searchKeyword) return users;
    const keyword = searchKeyword.toLowerCase();
    return users.filter(u =>
      u.nickname.toLowerCase().includes(keyword) ||
      (u.phone && u.phone.includes(keyword))
    );
  },

  openUserPicker() {
    this.setData({ showUserPicker: true });
  },

  closeUserPicker() {
    this.setData({ showUserPicker: false });
  },

  confirmUserPicker() {
    this.setData({ showUserPicker: false });
  },

  updateComputedData() {
    const {
      certificateTypes, selectedTypeId,
      issuingUnits, selectedUnitId,
      activities, selectedActivityId,
      articles, selectedArticleId,
      users, selectedUserIds, searchKeyword,
      previewData, submitting
    } = this.data;

    const typeIndex = Math.max(0, certificateTypes.findIndex(t => t.id === selectedTypeId));
    const selectedTypeName = typeIndex >= 0 && certificateTypes[typeIndex] ? certificateTypes[typeIndex].name : '请选择';

    const unitIndex = Math.max(0, issuingUnits.findIndex(u => u.id === selectedUnitId));
    const selectedUnitName = unitIndex >= 0 && issuingUnits[unitIndex] ? issuingUnits[unitIndex].name : '请选择';

    const activityIndex = Math.max(0, activities.findIndex(a => a.id === selectedActivityId));
    const selectedActivityTitle = activityIndex >= 0 && activities[activityIndex] ? activities[activityIndex].title : '请选择活动';

    const articleIndex = Math.max(0, articles.findIndex(a => a.id === selectedArticleId));
    const selectedArticleTitle = articleIndex >= 0 && articles[articleIndex] ? articles[articleIndex].title : '请选择作品';

    const keyword = searchKeyword ? searchKeyword.toLowerCase() : '';
    const filteredUsersWithSelected = users
      .filter(u => {
        if (!keyword) return true;
        const nickMatch = u.nickname && u.nickname.toLowerCase().indexOf(keyword) > -1;
        const phoneMatch = u.phone && u.phone.indexOf(keyword) > -1;
        return nickMatch || phoneMatch;
      })
      .map(u => ({
        ...u,
        isSelected: selectedUserIds.indexOf(u.id) > -1,
        firstChar: u.nickname ? u.nickname.charAt(0) : '?'
      }));

    const selectedUsersDisplay = users
      .filter(u => selectedUserIds.indexOf(u.id) > -1);

    const count = previewData ? previewData.count : 0;
    const submitBtnText = submitting ? '颁发中...' : ('确认颁发 ' + count + ' 张证书');

    this.setData({
      typeIndex,
      selectedTypeName,
      unitIndex,
      selectedUnitName,
      activityIndex,
      selectedActivityTitle,
      articleIndex,
      selectedArticleTitle,
      filteredUsersWithSelected,
      selectedUsersDisplay,
      submitBtnText
    });
  },

  updatePreview() {
    const {
      issueMode, selectedTypeId, selectedUnitId, selectedUserIds,
      selectedActivityId, selectedArticleId, reason, issueDate,
      certificateTypes, issuingUnits, users, activities, articles
    } = this.data;

    const typeInfo = certificateTypes.find(t => t.id === selectedTypeId);
    const unitInfo = issuingUnits.find(u => u.id === selectedUnitId);

    let selectedUsers = [];
    let relatedTitle = '';

    if (issueMode === 'single' || issueMode === 'batch') {
      selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
    } else if (issueMode === 'activity' && selectedActivityId) {
      const activity = activities.find(a => a.id === selectedActivityId);
      if (activity) {
        relatedTitle = activity.title;
        selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
        if (selectedUsers.length === 0) {
          selectedUsers = users.slice(0, 3);
        }
      }
    } else if (issueMode === 'collection' && selectedArticleId) {
      const article = articles.find(a => a.id === selectedArticleId);
      if (article) {
        relatedTitle = article.title;
        selectedUsers = users.filter(u => u.id === article.authorId);
      }
    } else if (issueMode === 'annual') {
      selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
      relatedTitle = `${new Date().getFullYear()}年度荣誉评选`;
    }

    const previewData = {
      typeInfo,
      unitInfo,
      reason: reason || (typeInfo ? typeInfo.defaultReason : ''),
      issueDate,
      selectedUsers,
      relatedTitle,
      count: selectedUsers.length
    };

    this.setData({ previewData });
    this.updateComputedData();
  },

  async submitIssue() {
    const {
      issueMode, selectedTypeId, selectedUnitId, reason, issueDate,
      previewData, selectedActivityId, selectedArticleId
    } = this.data;

    if (!selectedTypeId) {
      wx.showToast({ title: '请选择证书类型', icon: 'none' });
      return;
    }

    if (!selectedUnitId) {
      wx.showToast({ title: '请选择颁发单位', icon: 'none' });
      return;
    }

    if (!previewData || previewData.count === 0) {
      wx.showToast({ title: '请选择接收人', icon: 'none' });
      return;
    }

    const reasonText = reason || previewData.reason;

    this.setData({ submitting: true });
    this.updateComputedData();

    try {
      let res;

      if (issueMode === 'activity' && selectedActivityId) {
        res = await api.issueCertificatesForActivity(selectedActivityId);
      } else if (issueMode === 'collection' && selectedArticleId) {
        res = await api.issueCertificateForArticle(selectedArticleId);
      } else {
        const recipients = previewData.selectedUsers.map(u => ({
          userId: u.id,
          userName: u.nickname
        }));

        const data = {
          typeId: selectedTypeId,
          issuingUnitId: selectedUnitId,
          reason: reasonText,
          issueDate,
          recipients,
          relatedType: issueMode === 'annual' ? 'annual_award' : 'manual',
          relatedId: issueMode === 'annual' ? 'annual_' + new Date().getFullYear() : null,
          relatedTitle: previewData.relatedTitle
        };

        if (recipients.length === 1) {
          data.userId = recipients[0].userId;
          data.userName = recipients[0].userName;
          res = await api.issueCertificate(data);
        } else {
          res = await api.batchIssueCertificates(data);
        }
      }

      if (res.code === 200) {
        this.setData({
          submitting: false,
          issueResult: {
            success: true,
            count: res.data.count || 1,
            certificates: res.data.certificates || []
          }
        });

        wx.showToast({
          title: `成功颁发${res.data.count || 1}张证书`,
          icon: 'success'
        });
      } else {
        this.setData({ submitting: false });
        this.updateComputedData();
        wx.showToast({ title: res.message || '颁发失败', icon: 'none' });
      }
    } catch (e) {
      console.error('[AdminCertificate] 颁发失败:', e);
      this.setData({ submitting: false });
      this.updateComputedData();
      wx.showToast({ title: '颁发失败，请重试', icon: 'none' });
    }
  },

  resetForm() {
    this.setData({
      selectedUserIds: [],
      selectedActivityId: '',
      selectedArticleId: '',
      reason: '',
      issueResult: null,
      previewData: null,
      searchKeyword: ''
    });
  },

  goToCertificateList() {
    wx.navigateTo({
      url: '/pages/my-certificates/my-certificates'
    });
  }
});
