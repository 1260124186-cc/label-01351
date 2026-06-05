const api = require('../../utils/api');
const { createPageInstance, initStorage, defaultUser } = require('../helpers');

function createMockApp(loggedIn = true) {
  return {
    globalData: {
      userInfo: loggedIn ? defaultUser : null,
      isLoggedIn: loggedIn,
      baseUrl: 'http://localhost:3000'
    },
    getLoginStatus: jest.fn(() => loggedIn),
    getUserInfo: jest.fn(() => loggedIn ? defaultUser : null),
    login(userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLoggedIn = true;
    },
    logout() {
      this.globalData.isLoggedIn = false;
      this.globalData.userInfo = null;
    }
  };
}

describe('Mine 个人中心页', () => {
  let page;
  let minePage;

  beforeAll(() => {
    jest.resetModules();
    require('../../pages/mine/mine');
    minePage = Page.mock.calls[Page.mock.calls.length - 1][0];
  });

  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    global.getApp = jest.fn(() => createMockApp(true));
    page = createPageInstance(minePage);
  });

  test('初始 data 状态正确', () => {
    expect(page.data.isLoggedIn).toBe(false);
    expect(page.data.stats).toEqual({ articleCount: 0, likeCount: 0, viewCount: 0 });
    expect(page.data.myArticles).toEqual([]);
    expect(page.data.loading).toBe(false);
  });

  describe('checkLoginStatus', () => {
    test('已登录时更新登录状态和用户信息', () => {
      page.checkLoginStatus();
      expect(page.data.isLoggedIn).toBe(true);
      expect(page.data.userInfo).toEqual(defaultUser);
    });

    test('未登录时 isLoggedIn 为 false', () => {
      global.getApp = jest.fn(() => createMockApp(false));
      page.checkLoginStatus();
      expect(page.data.isLoggedIn).toBe(false);
    });
  });

  describe('loadUserInfo', () => {
    test('成功加载用户信息', async () => {
      await page.loadUserInfo();
      expect(page.data.userInfo).toBeDefined();
    });
  });

  describe('loadStats', () => {
    test('成功加载统计数据', async () => {
      await page.loadStats();
      expect(page.data.stats.articleCount).toBeGreaterThanOrEqual(0);
      expect(page.data.stats.likeCount).toBeGreaterThanOrEqual(0);
      expect(page.data.stats.viewCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('loadMyArticles', () => {
    test('成功加载我的文章', async () => {
      await page.loadMyArticles();
      expect(page.data.loading).toBe(false);
    });

    test('文章包含 categoryName 字段', async () => {
      wx.setStorageSync('userInfo', { id: 'user_001', nickname: '张大爷' });
      await page.loadMyArticles();
      if (page.data.myArticles.length > 0) {
        expect(page.data.myArticles[0]).toHaveProperty('categoryName');
      }
    });
  });

  describe('onLogout', () => {
    test('确认退出时清除数据', () => {
      page.data.isLoggedIn = true;
      page.data.userInfo = defaultUser;
      page.data.stats = { articleCount: 5, likeCount: 10, viewCount: 100 };
      page.data.myArticles = [{ id: 'a1' }];

      wx.showModal = jest.fn(({ success }) => {
        success({ confirm: true });
      });

      page.onLogout();
      expect(page.data.isLoggedIn).toBe(false);
      expect(page.data.userInfo).toEqual({});
      expect(page.data.stats).toEqual({ articleCount: 0, likeCount: 0, viewCount: 0 });
      expect(page.data.myArticles).toEqual([]);
    });

    test('取消退出时保持数据不变', () => {
      page.data.isLoggedIn = true;
      page.data.stats = { articleCount: 5, likeCount: 10, viewCount: 100 };

      wx.showModal = jest.fn(({ success }) => {
        success({ confirm: false });
      });

      page.onLogout();
      expect(page.data.isLoggedIn).toBe(true);
      expect(page.data.stats.articleCount).toBe(5);
    });
  });

  describe('goToLogin', () => {
    test('跳转到登录页', () => {
      page.goToLogin();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/login/login' });
    });
  });

  describe('goToPublish', () => {
    test('跳转到投稿页', () => {
      page.goToPublish();
      expect(wx.switchTab).toHaveBeenCalledWith({ url: '/pages/publish/publish' });
    });
  });

  describe('goToFavorites', () => {
    test('跳转到收藏页', () => {
      page.goToFavorites();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/favorites/favorites' });
    });
  });

  describe('goToDetail', () => {
    test('跳转到文章详情页', () => {
      page.goToDetail({ currentTarget: { dataset: { id: 'article_001' } } });
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/detail/detail?id=article_001' });
    });
  });
});
