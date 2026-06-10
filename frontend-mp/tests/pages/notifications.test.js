const api = require('../../utils/api');
const { createPageInstance, initStorage, defaultUser } = require('../helpers');

describe('Notifications 通知页', () => {
  let page;
  let notificationsPage;
  let getNotificationListSpy;
  let markAsReadSpy;
  let markAllAsReadSpy;
  let deleteNotificationSpy;

  beforeAll(() => {
    require('../../pages/notifications/notifications');
    notificationsPage = Page.mock.calls[Page.mock.calls.length - 1][0];
  });

  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);

    getNotificationListSpy = jest.spyOn(api, 'getNotificationList').mockResolvedValue({
      code: 200,
      data: { list: [], total: 0, page: 1, pageSize: 50, unreadCount: 0 }
    });
    markAsReadSpy = jest.spyOn(api, 'markAsRead').mockResolvedValue({ code: 200 });
    markAllAsReadSpy = jest.spyOn(api, 'markAllAsRead').mockResolvedValue({ code: 200 });
    deleteNotificationSpy = jest.spyOn(api, 'deleteNotification').mockResolvedValue({ code: 200 });

    page = createPageInstance(notificationsPage);
  });

  afterEach(() => {
    getNotificationListSpy.mockRestore();
    markAsReadSpy.mockRestore();
    markAllAsReadSpy.mockRestore();
    deleteNotificationSpy.mockRestore();
  });

  test('初始 data 状态正确', () => {
    expect(page.data.notifications).toEqual([]);
    expect(page.data.unreadCount).toBe(0);
    expect(page.data.loading).toBe(true);
    expect(page.data.currentTab).toBe('all');
    expect(page.data.tabs).toEqual([
      { key: 'all', name: '全部' },
      { key: 'like', name: '点赞' },
      { key: 'favorite', name: '收藏' },
      { key: 'comment', name: '评论' },
      { key: 'reply', name: '回复' },
      { key: 'system', name: '系统' }
    ]);
  });

  describe('onTabChange', () => {
    test('切换 tab 时更新 currentTab 并调用 loadNotifications', () => {
      page.onTabChange({ currentTarget: { dataset: { tab: 'like' } } });
      expect(page.data.currentTab).toBe('like');
      expect(getNotificationListSpy).toHaveBeenCalled();
    });

    test('切换到相同 tab 不调用 loadNotifications', () => {
      page.data.currentTab = 'all';
      getNotificationListSpy.mockClear();

      page.onTabChange({ currentTarget: { dataset: { tab: 'all' } } });
      expect(page.data.currentTab).toBe('all');
      expect(getNotificationListSpy).not.toHaveBeenCalled();
    });
  });

  describe('onNotificationTap', () => {
    test('未读通知调用 api.markAsRead 并更新 unreadCount', async () => {
      page.data.notifications = [
        { id: 'n1', isRead: false, type: 'like', jumpType: '', jumpId: '' }
      ];
      page.data.unreadCount = 1;

      await page.onNotificationTap({ currentTarget: { dataset: { id: 'n1' } } });
      expect(markAsReadSpy).toHaveBeenCalledWith('n1');
      expect(page.data.unreadCount).toBe(0);
    });

    test('已读通知不调用 api.markAsRead', async () => {
      page.data.notifications = [
        { id: 'n2', isRead: true, type: 'like', jumpType: '', jumpId: '' }
      ];
      page.data.unreadCount = 0;

      await page.onNotificationTap({ currentTarget: { dataset: { id: 'n2' } } });
      expect(markAsReadSpy).not.toHaveBeenCalled();
    });

    test('通知不存在时不调用 api.markAsRead', async () => {
      page.data.notifications = [];

      await page.onNotificationTap({ currentTarget: { dataset: { id: 'n99' } } });
      expect(markAsReadSpy).not.toHaveBeenCalled();
    });

    test('文章类型通知跳转到详情页', async () => {
      page.data.notifications = [
        { id: 'n3', isRead: true, type: 'comment', jumpType: 'article', jumpId: 'article_001' }
      ];

      await page.onNotificationTap({ currentTarget: { dataset: { id: 'n3' } } });
      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/detail/detail?id=article_001'
      });
    });
  });

  describe('onMarkAllRead', () => {
    test('全部标记为已读', async () => {
      page.data.notifications = [
        { id: 'n1', isRead: false, type: 'like' },
        { id: 'n2', isRead: true, type: 'system' },
        { id: 'n3', isRead: false, type: 'comment' }
      ];
      page.data.unreadCount = 2;

      await page.onMarkAllRead();
      expect(markAllAsReadSpy).toHaveBeenCalled();
      expect(page.data.notifications.every(item => item.isRead)).toBe(true);
      expect(page.data.unreadCount).toBe(0);
      expect(wx.showToast).toHaveBeenCalledWith({ title: '已全部标记为已读', icon: 'success' });
    });

    test('没有未读消息时提示', async () => {
      page.data.unreadCount = 0;

      await page.onMarkAllRead();
      expect(markAllAsReadSpy).not.toHaveBeenCalled();
      expect(wx.showToast).toHaveBeenCalledWith({ title: '没有未读消息', icon: 'none' });
    });
  });

  describe('onDeleteNotification', () => {
    test('确认删除时调用 api.deleteNotification 并移除通知', async () => {
      page.data.notifications = [
        { id: 'n1', isRead: true, type: 'like' },
        { id: 'n2', isRead: false, type: 'comment' }
      ];
      page.data.unreadCount = 1;

      wx.showModal = jest.fn(({ success }) => {
        success({ confirm: true });
      });

      await page.onDeleteNotification({ currentTarget: { dataset: { id: 'n1' } } });
      expect(deleteNotificationSpy).toHaveBeenCalledWith('n1');
      expect(page.data.notifications.find(item => item.id === 'n1')).toBeUndefined();
      expect(page.data.unreadCount).toBe(1);
    });

    test('删除未读通知时 unreadCount 减一', async () => {
      page.data.notifications = [
        { id: 'n1', isRead: true, type: 'like' },
        { id: 'n2', isRead: false, type: 'comment' }
      ];
      page.data.unreadCount = 1;

      wx.showModal = jest.fn(({ success }) => {
        success({ confirm: true });
      });

      await page.onDeleteNotification({ currentTarget: { dataset: { id: 'n2' } } });
      expect(page.data.unreadCount).toBe(0);
    });

    test('取消删除时不调用 api.deleteNotification', async () => {
      page.data.notifications = [
        { id: 'n1', isRead: true, type: 'like' }
      ];

      wx.showModal = jest.fn(({ success }) => {
        success({ confirm: false });
      });

      await page.onDeleteNotification({ currentTarget: { dataset: { id: 'n1' } } });
      expect(deleteNotificationSpy).not.toHaveBeenCalled();
    });
  });
});
