const api = require('../../utils/api');
const { createPageInstance, initStorage, defaultUser } = require('../helpers');

function createMockApp(loggedIn = true, userOverride = null) {
  const user = userOverride || defaultUser;
  return {
    globalData: {
      userInfo: loggedIn ? user : null,
      isLoggedIn: loggedIn,
      baseUrl: 'http://localhost:3000'
    },
    getLoginStatus: jest.fn(() => loggedIn),
    getUserInfo: jest.fn(() => loggedIn ? user : null),
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

describe('AuthorHome 作者主页', () => {
  let page;
  let authorHomePage;

  beforeAll(() => {
    jest.resetModules();
    require('../../pages/author-home/author-home');
    authorHomePage = Page.mock.calls[Page.mock.calls.length - 1][0];
  });

  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    global.getApp = jest.fn(() => createMockApp(true));
    page = createPageInstance(authorHomePage);
  });

  test('初始 data 状态正确', () => {
    expect(page.data.authorId).toBe('');
    expect(page.data.authorName).toBe('');
    expect(page.data.authorAvatar).toBe('');
    expect(page.data.articleCount).toBe(0);
    expect(page.data.likeCount).toBe(0);
    expect(page.data.viewCount).toBe(0);
    expect(page.data.articles).toEqual([]);
    expect(page.data.loading).toBe(true);
    expect(page.data.isSelf).toBe(false);
    expect(page.data.isLoggedIn).toBe(false);
  });

  describe('onLoad', () => {
    test('接收作者 ID 参数', () => {
      page.onLoad({ id: 'user_001' });
      expect(page.data.authorId).toBe('user_001');
    });

    test('无 ID 参数时 authorId 保持为空', () => {
      page.onLoad({});
      expect(page.data.authorId).toBe('');
    });
  });

  describe('onShow', () => {
    beforeEach(() => {
      page.data.authorId = 'user_001';
      page.loadAuthorProfile = jest.fn();
    });

    test('未登录时设置 isLoggedIn 为 false', () => {
      global.getApp = jest.fn(() => createMockApp(false));
      page.onShow();
      expect(page.data.isLoggedIn).toBe(false);
    });

    test('已登录时设置 isLoggedIn 为 true', () => {
      page.onShow();
      expect(page.data.isLoggedIn).toBe(true);
    });

    test('已登录且查看他人主页时 isSelf 为 false', () => {
      page.data.authorId = 'user_002';
      page.onShow();
      expect(page.data.isSelf).toBe(false);
    });

    test('查看本人主页时 isSelf 为 true', () => {
      page.data.authorId = 'user_001';
      page.onShow();
      expect(page.data.isSelf).toBe(true);
    });

    test('有 authorId 时调用 loadAuthorProfile', () => {
      page.onShow();
      expect(page.loadAuthorProfile).toHaveBeenCalled();
    });

    test('无 authorId 时不调用 loadAuthorProfile', () => {
      page.data.authorId = '';
      page.onShow();
      expect(page.loadAuthorProfile).not.toHaveBeenCalled();
    });
  });

  describe('loadAuthorProfile', () => {
    beforeEach(() => {
      page.data.authorId = 'user_001';
    });

    test('加载前设置 loading 为 true', async () => {
      page.setData({ loading: false });
      const promise = page.loadAuthorProfile();
      expect(page.data.loading).toBe(true);
      await promise;
    });

    test('成功加载作者信息', async () => {
      await page.loadAuthorProfile();
      expect(page.data.loading).toBe(false);
      expect(page.data.authorName).toBe('张大爷');
      expect(page.data.articleCount).toBeGreaterThanOrEqual(1);
      expect(page.data.articles.length).toBeGreaterThanOrEqual(1);
    });

    test('加载成功后设置导航栏标题', async () => {
      await page.loadAuthorProfile();
      expect(wx.setNavigationBarTitle).toHaveBeenCalled();
    });

    test('长作者名截断显示', async () => {
      const articles = JSON.parse(JSON.stringify(wx.getStorageSync('articles')));
      articles.forEach(a => {
        if (a.authorId === 'user_001') {
          a.authorName = '这是一个非常非常非常非常非常长的作者名超过十个字';
        }
      });
      wx.setStorageSync('articles', articles);

      await page.loadAuthorProfile();
      const calls = wx.setNavigationBarTitle.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const titleCall = calls[calls.length - 1][0];
      expect(titleCall.title.endsWith('...')).toBe(true);
    });

    test('短作者名不截断', async () => {
      const articles = JSON.parse(JSON.stringify(wx.getStorageSync('articles')));
      articles.forEach(a => {
        if (a.authorId === 'user_001') {
          a.authorName = '短名字';
        }
      });
      wx.setStorageSync('articles', articles);

      await page.loadAuthorProfile();
      const calls = wx.setNavigationBarTitle.mock.calls;
      const titleCall = calls[calls.length - 1][0];
      expect(titleCall.title).toBe('短名字');
    });

    test('作者不存在时显示 toast', async () => {
      page.data.authorId = 'notexist_author';
      await page.loadAuthorProfile();
      expect(page.data.loading).toBe(false);
      expect(wx.showToast).toHaveBeenCalled();
    });

    test('有用户信息但无文章时返回正确数据', async () => {
      const users = [{ id: 'user_no_articles', nickname: '无文章用户', avatar: '' }];
      wx.setStorageSync('users', users);
      page.data.authorId = 'user_no_articles';
      await page.loadAuthorProfile();
      expect(page.data.authorName).toBe('无文章用户');
      expect(page.data.articleCount).toBe(0);
      expect(page.data.articles).toEqual([]);
    });
  });

  describe('goToDetail', () => {
    test('跳转到文章详情页', () => {
      page.goToDetail({ currentTarget: { dataset: { id: 'article_001' } } });
      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/detail/detail?id=article_001'
      });
    });
  });

  describe('goToMine', () => {
    test('跳转到我的页面（tabBar）', () => {
      page.goToMine();
      expect(wx.switchTab).toHaveBeenCalledWith({
        url: '/pages/mine/mine'
      });
    });
  });

  describe('goToLogin', () => {
    test('跳转到登录页', () => {
      page.goToLogin();
      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/login/login'
      });
    });
  });

  describe('goBack', () => {
    test('优先调用 navigateBack', () => {
      wx.navigateBack.mockImplementation(({ fail }) => {
        fail();
      });
      page.goBack();
      expect(wx.navigateBack).toHaveBeenCalled();
    });

    test('navigateBack 失败时跳转到首页', () => {
      wx.navigateBack.mockImplementation(({ fail }) => {
        fail();
      });
      page.goBack();
      expect(wx.switchTab).toHaveBeenCalledWith({
        url: '/pages/index/index'
      });
    });
  });
});
