const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    conversations: [],
    totalUnread: 0,
    loading: true,
    currentTab: 'all',
    tabs: [
      { key: 'all', name: '全部会话' },
      { key: 'pending', name: '待接受' }
    ],
    acceptStatusMap: {
      pending: '待接受',
      sent_pending: '等待对方接受',
      accepted: '已接受',
      rejected: '已拒绝'
    },
    sourceLabelMap: {
      author: '来自作者主页',
      activity: '来自活动',
      pairing: '来自结对',
      direct: '直接发起'
    }
  },

  onLoad() {
    this.loadConversations();
  },

  onShow() {
    this.loadConversations();
  },

  onPullDownRefresh() {
    this.loadConversations().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadConversations() {
    this.setData({ loading: true });
    try {
      const res = await api.getConversationList();
      if (res.code === 200) {
        const list = (res.data.list || []).map(item => ({
          ...item,
          lastMessageText: util.truncateText(item.lastMessage || '（空会话）', 30),
          timeText: util.formatRelativeTime(item.lastMessageTime),
          statusText: this.data.acceptStatusMap[item.acceptStatus] || '',
          sourceLabel: this.data.sourceLabelMap[item.source] || ''
        }));
        this.setData({
          conversations: list,
          totalUnread: res.data.totalUnread || 0,
          loading: false
        });
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (e) {
      console.error('[Conversations] 加载异常:', e);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
    }
  },

  getFilteredList() {
    const { conversations, currentTab } = this.data;
    if (currentTab === 'pending') {
      return conversations.filter(c => c.acceptStatus === 'pending');
    }
    return conversations;
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;
    this.setData({ currentTab: tab });
  },

  async onConversationTap(e) {
    const peerUserId = e.currentTarget.dataset.peer;
    const item = this.data.conversations.find(c => c.peerUserId === peerUserId);
    if (!item) return;
    if (item.acceptStatus === 'pending') {
      wx.navigateTo({
        url: `/pages/chat/chat?peerUserId=${encodeURIComponent(peerUserId)}&peerUserName=${encodeURIComponent(item.peerUserName || '')}&peerAvatar=${encodeURIComponent(item.peerAvatar || '')}&source=${encodeURIComponent(item.source || '')}`
      });
      return;
    }
    await api.markConversationAsRead(peerUserId);
    wx.navigateTo({
      url: `/pages/chat/chat?peerUserId=${encodeURIComponent(peerUserId)}&peerUserName=${encodeURIComponent(item.peerUserName || '')}&peerAvatar=${encodeURIComponent(item.peerAvatar || '')}&source=${encodeURIComponent(item.source || '')}`
    });
  },

  async onAcceptRequest(e) {
    const peerUserId = e.currentTarget.dataset.peer;
    wx.showLoading({ title: '处理中...' });
    try {
      const res = await api.acceptConversationRequest(peerUserId);
      wx.hideLoading();
      if (res.code === 200) {
        wx.showToast({ title: '已接受', icon: 'success' });
        this.loadConversations();
      } else {
        wx.showToast({ title: res.message || '操作失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  async onRejectRequest(e) {
    const peerUserId = e.currentTarget.dataset.peer;
    const peerUserName = e.currentTarget.dataset.name || '该用户';
    wx.showModal({
      title: '拒绝会话',
      content: `确定要拒绝 ${peerUserName} 的会话请求吗？`,
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '处理中...' });
        try {
          const r = await api.rejectConversationRequest(peerUserId);
          wx.hideLoading();
          if (r.code === 200) {
            wx.showToast({ title: '已拒绝', icon: 'success' });
            this.loadConversations();
          } else {
            wx.showToast({ title: r.message || '操作失败', icon: 'none' });
          }
        } catch (err) {
          wx.hideLoading();
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    });
  },

  async onDeleteConversation(e) {
    const peerUserId = e.currentTarget.dataset.peer;
    const peerUserName = e.currentTarget.dataset.name || '该会话';
    wx.showModal({
      title: '删除会话',
      content: `确定要删除与 ${peerUserName} 的会话吗？\n删除后聊天记录将被清空。`,
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '删除中...' });
        try {
          const r = await api.deleteConversation(peerUserId);
          wx.hideLoading();
          if (r.code === 200) {
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadConversations();
          } else {
            wx.showToast({ title: r.message || '删除失败', icon: 'none' });
          }
        } catch (err) {
          wx.hideLoading();
          wx.showToast({ title: '删除失败', icon: 'none' });
        }
      }
    });
  },

  async onBlockUser(e) {
    const peerUserId = e.currentTarget.dataset.peer;
    const peerUserName = e.currentTarget.dataset.name || '该用户';
    wx.showModal({
      title: '拉黑用户',
      content: `确定要拉黑 ${peerUserName} 吗？\n拉黑后将无法接收对方消息，且会话会被删除。`,
      confirmText: '确认拉黑',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '处理中...' });
        try {
          const r = await api.blockUser(peerUserId);
          wx.hideLoading();
          if (r.code === 200) {
            wx.showToast({ title: '已拉黑', icon: 'success' });
            this.loadConversations();
          } else {
            wx.showToast({ title: r.message || '操作失败', icon: 'none' });
          }
        } catch (err) {
          wx.hideLoading();
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    });
  },

  async onMarkAllRead() {
    if (this.data.totalUnread === 0) {
      wx.showToast({ title: '暂无未读', icon: 'none' });
      return;
    }
    const list = this.data.conversations.filter(c => (c.unreadCount || 0) > 0);
    wx.showLoading({ title: '处理中...' });
    try {
      const tasks = list.map(c => api.markConversationAsRead(c.peerUserId));
      await Promise.all(tasks);
      wx.hideLoading();
      wx.showToast({ title: '已全部标记', icon: 'success' });
      this.loadConversations();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/mine/mine' });
    }
  }
});
