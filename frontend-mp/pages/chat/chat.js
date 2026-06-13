const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    peerUserId: '',
    peerUserName: '',
    peerAvatar: '',
    source: '',
    sourceId: '',
    sourceTitle: '',
    messages: [],
    inputText: '',
    inputMax: 500,
    inputMin: 2,
    conversation: null,
    acceptStatus: 'accepted',
    loading: true,
    sending: false,
    showMoreSheet: false,
    showReportSheet: false,
    reportReasons: [],
    selectedReasonId: '',
    reportDescription: '',
    scrollToMsgId: '',
    sourceLabelMap: {
      author: '来自作者主页',
      activity: '来自活动',
      pairing: '来自结对',
      direct: '直接发起'
    }
  },

  onLoad(options) {
    const { peerUserId, peerUserName, peerAvatar, source, sourceId, sourceTitle } = options || {};
    this.setData({
      peerUserId: decodeURIComponent(peerUserId || ''),
      peerUserName: decodeURIComponent(peerUserName || ''),
      peerAvatar: decodeURIComponent(peerAvatar || ''),
      source: decodeURIComponent(source || ''),
      sourceId: decodeURIComponent(sourceId || ''),
      sourceTitle: decodeURIComponent(sourceTitle || '')
    });
    if (this.data.peerUserName) {
      wx.setNavigationBarTitle({
        title: this.data.peerUserName.length > 12
          ? this.data.peerUserName.substring(0, 12) + '...'
          : this.data.peerUserName
      });
    }
    this.loadChat();
    this.loadReportReasons();
  },

  onShow() {
    if (this.data.peerUserId) {
      api.markConversationAsRead(this.data.peerUserId);
    }
  },

  onUnload() {
    if (this.data.peerUserId) {
      api.markConversationAsRead(this.data.peerUserId);
    }
  },

  async loadChat() {
    const { peerUserId, peerUserName, peerAvatar, source, sourceId, sourceTitle } = this.data;
    this.setData({ loading: true });
    try {
      const extra = { peerUserName, peerAvatar, source, sourceId, sourceTitle };
      const res = await api.getOrCreateConversation(peerUserId, extra);
      if (res.code === 200) {
        const { conversation, messages } = res.data;
        const formattedMessages = (messages || []).map(m => this._formatMessage(m));
        const lastId = formattedMessages.length > 0
          ? 'msg-' + formattedMessages[formattedMessages.length - 1].id
          : '';
        this.setData({
          conversation,
          acceptStatus: conversation ? (conversation.acceptStatus || 'pending') : 'pending',
          messages: formattedMessages,
          loading: false,
          scrollToMsgId: lastId
        });
        api.markConversationAsRead(peerUserId);
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (e) {
      console.error('[Chat] 加载异常:', e);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
    }
  },

  async loadReportReasons() {
    try {
      const res = await api.getReportReasons();
      if (res.code === 200) {
        this.setData({ reportReasons: res.data || [] });
      }
    } catch (e) {
      console.error('[Chat] 加载举报原因失败:', e);
    }
  },

  _formatMessage(m) {
    const currentUserId = api.getCurrentUserId ? api.getCurrentUserId() : null;
    const fallbackUserId = (wx.getStorageSync('userInfo') || {}).id;
    const uid = currentUserId || fallbackUserId;
    return {
      ...m,
      isMine: m.fromUserId === uid,
      timeText: util.formatDate(new Date(m.createTime), 'HH:mm'),
      dateText: util.formatDate(new Date(m.createTime), 'MM-DD')
    };
  },

  onInputChange(e) {
    const value = e.detail.value || '';
    this.setData({ inputText: value });
  },

  async onSend() {
    const { inputText, peerUserId, peerUserName, peerAvatar, source, sourceId, sourceTitle, sending, acceptStatus } = this.data;
    if (sending) return;
    const text = inputText.trim();
    if (text.length < this.data.inputMin) {
      wx.showToast({ title: '消息至少2个字符', icon: 'none' });
      return;
    }
    if (text.length > this.data.inputMax) {
      wx.showToast({ title: '消息不能超过500字', icon: 'none' });
      return;
    }
    if (acceptStatus === 'pending' && this._iAmRecipient()) {
      wx.showToast({ title: '请先接受会话请求', icon: 'none' });
      return;
    }
    if (acceptStatus === 'rejected') {
      wx.showToast({ title: '会话已被拒绝，无法发送', icon: 'none' });
      return;
    }
    this.setData({ sending: true });
    try {
      const extra = { peerUserName, peerAvatar, source, sourceId, sourceTitle };
      const res = await api.sendMessage(peerUserId, text, extra);
      if (res.code === 200) {
        const newMsg = this._formatMessage(res.data);
        const newList = [...this.data.messages, newMsg];
        this.setData({
          inputText: '',
          messages: newList,
          sending: false,
          scrollToMsgId: 'msg-' + newMsg.id
        });
        const convRes = await api.getConversationList();
        if (convRes.code === 200) {
          const conv = (convRes.data.list || []).find(c => c.peerUserId === peerUserId);
          if (conv) {
            this.setData({ acceptStatus: conv.acceptStatus || 'accepted' });
          }
        }
      } else {
        this.setData({ sending: false });
        wx.showToast({ title: res.message || '发送失败', icon: 'none' });
      }
    } catch (e) {
      console.error('[Chat] 发送异常:', e);
      this.setData({ sending: false });
      wx.showToast({ title: '发送失败，请重试', icon: 'none' });
    }
  },

  _iAmRecipient() {
    const { messages, peerUserId } = this.data;
    if (!messages || messages.length === 0) return false;
    const firstFromStranger = messages.find(m => m.isFirstStrangerMessage);
    if (!firstFromStranger) return false;
    return firstFromStranger.fromUserId === peerUserId;
  },

  async onAcceptRequest() {
    wx.showLoading({ title: '处理中...' });
    try {
      const res = await api.acceptConversationRequest(this.data.peerUserId);
      wx.hideLoading();
      if (res.code === 200) {
        this.setData({ acceptStatus: 'accepted' });
        wx.showToast({ title: '已接受', icon: 'success' });
      } else {
        wx.showToast({ title: res.message || '操作失败', icon: 'none' });
      }
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  async onRejectRequest() {
    wx.showModal({
      title: '拒绝会话',
      content: '确定拒绝本次会话请求吗？',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '处理中...' });
        try {
          const r = await api.rejectConversationRequest(this.data.peerUserId);
          wx.hideLoading();
          if (r.code === 200) {
            wx.showToast({ title: '已拒绝', icon: 'success' });
            setTimeout(() => wx.navigateBack(), 800);
          } else {
            wx.showToast({ title: r.message || '操作失败', icon: 'none' });
          }
        } catch (e) {
          wx.hideLoading();
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    });
  },

  openMoreSheet() {
    this.setData({ showMoreSheet: true });
  },

  closeMoreSheet() {
    this.setData({ showMoreSheet: false });
  },

  async onBlockUser() {
    this.setData({ showMoreSheet: false });
    wx.showModal({
      title: '拉黑用户',
      content: `确定要拉黑 ${this.data.peerUserName || '该用户'} 吗？\n拉黑后将无法互相发消息，会话将被删除。`,
      confirmText: '确认拉黑',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '处理中...' });
        try {
          const r = await api.blockUser(this.data.peerUserId);
          wx.hideLoading();
          if (r.code === 200) {
            wx.showToast({ title: '已拉黑', icon: 'success' });
            setTimeout(() => wx.navigateBack(), 800);
          } else {
            wx.showToast({ title: r.message || '操作失败', icon: 'none' });
          }
        } catch (e) {
          wx.hideLoading();
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    });
  },

  onOpenReport() {
    this.setData({
      showMoreSheet: false,
      showReportSheet: true,
      selectedReasonId: '',
      reportDescription: ''
    });
  },

  closeReportSheet() {
    this.setData({ showReportSheet: false });
  },

  onSelectReason(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedReasonId: id });
  },

  onReportDescInput(e) {
    this.setData({ reportDescription: e.detail.value || '' });
  },

  async onSubmitReport() {
    const { selectedReasonId, reportDescription, peerUserId, conversation, messages } = this.data;
    if (!selectedReasonId) {
      wx.showToast({ title: '请选择举报原因', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '提交中...' });
    try {
      const res = await api.reportUser({
        targetUserId: peerUserId,
        reasonType: selectedReasonId,
        description: reportDescription,
        conversationId: conversation ? conversation.id : '',
        messageId: messages.length > 0 ? messages[messages.length - 1].id : ''
      });
      wx.hideLoading();
      if (res.code === 200) {
        this.setData({ showReportSheet: false });
        wx.showToast({ title: res.message || '举报已提交', icon: 'success' });
      } else {
        wx.showToast({ title: res.message || '提交失败', icon: 'none' });
      }
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
  },

  onDeleteMessage(e) {
    const msgId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除消息',
      content: '确定删除这条消息吗？',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '删除中...' });
        try {
          const r = await api.deleteMessage(msgId, this.data.peerUserId);
          wx.hideLoading();
          if (r.code === 200) {
            const next = this.data.messages.filter(m => m.id !== msgId);
            this.setData({ messages: next });
            wx.showToast({ title: '已删除', icon: 'success' });
          } else {
            wx.showToast({ title: r.message || '删除失败', icon: 'none' });
          }
        } catch (e) {
          wx.hideLoading();
          wx.showToast({ title: '删除失败', icon: 'none' });
        }
      }
    });
  },

  goToPeerHome() {
    if (!this.data.peerUserId) return;
    wx.navigateTo({
      url: '/pages/author-home/author-home?id=' + encodeURIComponent(this.data.peerUserId)
    });
  }
});
