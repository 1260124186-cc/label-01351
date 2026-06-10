const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    notifications: [],
    unreadCount: 0,
    loading: true,
    currentTab: 'all',
    tabs: [
      { key: 'all', name: '全部' },
      { key: 'like', name: '点赞' },
      { key: 'favorite', name: '收藏' },
      { key: 'comment', name: '评论' },
      { key: 'reply', name: '回复' },
      { key: 'system', name: '系统' }
    ],
    typeIconMap: {
      like: '👍',
      favorite: '⭐',
      comment: '💬',
      reply: '↩️',
      system: '📢'
    },
    typeLabelMap: {
      like: '点赞',
      favorite: '收藏',
      comment: '评论',
      reply: '回复',
      system: '系统公告'
    }
  },

  onLoad() {
    this.loadNotifications();
  },

  onShow() {
    this.loadNotifications();
  },

  async loadNotifications() {
    this.setData({ loading: true });
    try {
      const res = await api.getNotificationList({
        type: this.data.currentTab,
        readStatus: 'all',
        page: 1,
        pageSize: 50
      });
      if (res.code === 200) {
        const list = res.data.list.map(item => ({
          ...item,
          timeText: util.formatRelativeTime(item.createTime),
          typeIcon: this.data.typeIconMap[item.type] || '🔔',
          typeLabel: this.data.typeLabelMap[item.type] || '通知'
        }));
        this.setData({
          notifications: list,
          unreadCount: res.data.unreadCount,
          loading: false
        });
      } else {
        this.setData({ loading: false });
      }
    } catch (error) {
      console.error('[Notifications] 加载通知列表失败:', error);
      this.setData({ loading: false });
    }
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;
    this.setData({ currentTab: tab });
    this.loadNotifications();
  },

  async onNotificationTap(e) {
    const id = e.currentTarget.dataset.id;
    const notification = this.data.notifications.find(item => item.id === id);
    if (!notification) return;

    if (!notification.isRead) {
      await api.markAsRead(id);
      const idx = this.data.notifications.findIndex(item => item.id === id);
      if (idx > -1) {
        this.setData({
          [`notifications[${idx}].isRead`]: true,
          unreadCount: Math.max(0, this.data.unreadCount - 1)
        });
      }
    }

    if (notification.jumpType === 'article' && notification.jumpId) {
      wx.navigateTo({
        url: '/pages/detail/detail?id=' + notification.jumpId
      });
    }
  },

  async onMarkAllRead() {
    if (this.data.unreadCount === 0) {
      wx.showToast({ title: '没有未读消息', icon: 'none' });
      return;
    }
    const res = await api.markAllAsRead();
    if (res.code === 200) {
      const updatedList = this.data.notifications.map(item => ({
        ...item,
        isRead: true
      }));
      this.setData({
        notifications: updatedList,
        unreadCount: 0
      });
      wx.showToast({ title: '已全部标记为已读', icon: 'success' });
    }
  },

  async onDeleteNotification(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定删除该通知吗？',
      success: async (res) => {
        if (res.confirm) {
          const result = await api.deleteNotification(id);
          if (result.code === 200) {
            const list = this.data.notifications.filter(item => item.id !== id);
            const wasUnread = this.data.notifications.find(item => item.id === id && !item.isRead);
            this.setData({
              notifications: list,
              unreadCount: wasUnread ? Math.max(0, this.data.unreadCount - 1) : this.data.unreadCount
            });
            wx.showToast({ title: '已删除', icon: 'success' });
          }
        }
      }
    });
  }
});
