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

describe('Detail 文章详情页', () => {
  let page;
  let detailPage;

  beforeAll(() => {
    jest.resetModules();
    require('../../pages/detail/detail');
    detailPage = Page.mock.calls[Page.mock.calls.length - 1][0];
  });

  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    global.getApp = jest.fn(() => createMockApp(true));
    page = createPageInstance(detailPage);
  });

  test('初始 data 状态正确', () => {
    expect(page.data.articleId).toBe('');
    expect(page.data.article).toBeNull();
    expect(page.data.loading).toBe(true);
    expect(page.data.liked).toBe(false);
    expect(page.data.favorited).toBe(false);
    expect(page.data.isLoggedIn).toBe(false);
  });

  describe('onLoad', () => {
    test('接收文章 ID 参数', () => {
      page.onLoad({ id: 'article_001' });
      expect(page.data.articleId).toBe('article_001');
    });

    test('无 ID 参数时 articleId 保持为空', () => {
      page.onLoad({});
      expect(page.data.articleId).toBe('');
    });
  });

  describe('onShow', () => {
    test('未登录时设置 isLoggedIn 为 false', () => {
      global.getApp = jest.fn(() => createMockApp(false));
      page.onShow();
      expect(page.data.isLoggedIn).toBe(false);
    });

    test('已登录时设置 isLoggedIn 为 true', () => {
      global.getApp = jest.fn(() => createMockApp(true));
      page.onShow();
      expect(page.data.isLoggedIn).toBe(true);
    });

    test('已登录且有 articleId 时加载文章详情', async () => {
      global.getApp = jest.fn(() => createMockApp(true));
      page.data.articleId = 'article_001';
      page.data.article = null;
      page.loadArticleDetail = jest.fn();
      page.onShow();
      expect(page.loadArticleDetail).toHaveBeenCalledWith('article_001');
    });

    test('未登录但有 articleId 时也加载文章详情', async () => {
      global.getApp = jest.fn(() => createMockApp(false));
      page.data.articleId = 'article_001';
      page.data.article = null;
      page.loadArticleDetail = jest.fn();
      page.onShow();
      expect(page.loadArticleDetail).toHaveBeenCalledWith('article_001');
    });

    test('已登录但无 articleId 时不加载文章', () => {
      global.getApp = jest.fn(() => createMockApp(true));
      page.data.articleId = '';
      page.data.article = null;
      page.loadArticleDetail = jest.fn();
      page.onShow();
      expect(page.loadArticleDetail).not.toHaveBeenCalled();
    });

    test('已加载过文章时不重复加载', () => {
      global.getApp = jest.fn(() => createMockApp(true));
      page.data.articleId = 'article_001';
      page.data.article = { id: 'article_001', title: '测试' };
      page.loadArticleDetail = jest.fn();
      page.onShow();
      expect(page.loadArticleDetail).not.toHaveBeenCalled();
    });
  });

  describe('loadArticleDetail', () => {
    test('加载前设置 loading 为 true', async () => {
      page.setData({ loading: false });
      const promise = page.loadArticleDetail('article_001');
      expect(page.data.loading).toBe(true);
      await promise;
    });

    test('成功加载文章详情', async () => {
      await page.loadArticleDetail('article_001');
      expect(page.data.article).not.toBeNull();
      expect(page.data.article.id).toBe('article_001');
      expect(page.data.loading).toBe(false);
      expect(page.data.article.categoryName).toBeDefined();
    });

    test('文章不存在时设置 article 为 null', async () => {
      await page.loadArticleDetail('notexist');
      expect(page.data.article).toBeNull();
      expect(page.data.loading).toBe(false);
      expect(wx.showToast).toHaveBeenCalled();
    });

    test('加载成功后设置导航栏标题', async () => {
      await page.loadArticleDetail('article_001');
      expect(wx.setNavigationBarTitle).toHaveBeenCalled();
    });

    test('长标题截断显示', async () => {
      const articles = JSON.parse(JSON.stringify(wx.getStorageSync('articles')));
      articles[0].title = '这是一个非常非常非常非常非常长的标题超过十个字符';
      wx.setStorageSync('articles', articles);

      await page.loadArticleDetail('article_001');
      const calls = wx.setNavigationBarTitle.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const titleCall = calls[calls.length - 1][0];
      expect(titleCall.title.endsWith('...')).toBe(true);
    });

    test('短标题不截断', async () => {
      const articles = JSON.parse(JSON.stringify(wx.getStorageSync('articles')));
      articles[0].title = '短标题';
      wx.setStorageSync('articles', articles);

      await page.loadArticleDetail('article_001');
      const calls = wx.setNavigationBarTitle.mock.calls;
      const titleCall = calls[calls.length - 1][0];
      expect(titleCall.title).toBe('短标题');
    });

    test('加载成功后检查收藏状态', async () => {
      page.checkFavoriteStatus = jest.fn();
      page.checkLikeStatus = jest.fn();
      await page.loadArticleDetail('article_001');
      expect(page.checkFavoriteStatus).toHaveBeenCalledWith('article_001');
    });

    test('加载成功后检查点赞状态', async () => {
      page.checkFavoriteStatus = jest.fn();
      page.checkLikeStatus = jest.fn();
      await page.loadArticleDetail('article_001');
      expect(page.checkLikeStatus).toHaveBeenCalledWith('article_001');
    });

    test('未登录时加载文章详情不检查收藏和点赞状态', async () => {
      global.getApp = jest.fn(() => createMockApp(false));
      page.checkFavoriteStatus = jest.fn();
      page.checkLikeStatus = jest.fn();
      await page.loadArticleDetail('article_001');
      expect(page.data.article).not.toBeNull();
      expect(page.checkFavoriteStatus).not.toHaveBeenCalled();
      expect(page.checkLikeStatus).not.toHaveBeenCalled();
    });

    test('未登录用户可以成功加载文章详情', async () => {
      global.getApp = jest.fn(() => createMockApp(false));
      await page.loadArticleDetail('article_001');
      expect(page.data.article).not.toBeNull();
      expect(page.data.article.id).toBe('article_001');
      expect(page.data.loading).toBe(false);
    });
  });

  describe('onLike', () => {
    test('未登录时跳转登录页', async () => {
      global.getApp = jest.fn(() => createMockApp(false));
      page.data.articleId = 'article_001';
      page.data.liked = false;
      await page.onLike();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/login/login' });
    });

    test('点赞成功', async () => {
      global.getApp = jest.fn(() => createMockApp(true));
      page.data.articleId = 'article_001';
      page.data.liked = false;
      await page.loadArticleDetail('article_001');
      await page.onLike();
      expect(page.data.liked).toBe(true);
      expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '点赞成功', icon: 'success' }));
    });

    test('取消点赞成功', async () => {
      global.getApp = jest.fn(() => createMockApp(true));
      page.data.articleId = 'article_001';
      await page.loadArticleDetail('article_001');
      await page.onLike();
      expect(page.data.liked).toBe(true);
      await page.onLike();
      expect(page.data.liked).toBe(false);
      expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '已取消点赞', icon: 'none' }));
    });

    test('点赞后 likeCount 更新', async () => {
      global.getApp = jest.fn(() => createMockApp(true));
      page.data.articleId = 'article_001';
      page.data.liked = false;
      await page.loadArticleDetail('article_001');
      const beforeCount = page.data.article.likeCount;
      await page.onLike();
      expect(page.data.article.likeCount).toBe(beforeCount + 1);
    });

    test('取消点赞后 likeCount 更新', async () => {
      global.getApp = jest.fn(() => createMockApp(true));
      page.data.articleId = 'article_001';
      page.data.liked = false;
      await page.loadArticleDetail('article_001');
      await page.onLike();
      const afterLikeCount = page.data.article.likeCount;
      await page.onLike();
      expect(page.data.article.likeCount).toBe(afterLikeCount - 1);
    });
  });

  describe('onFavorite', () => {
    test('未登录时跳转登录页', async () => {
      global.getApp = jest.fn(() => createMockApp(false));
      page.data.articleId = 'article_001';
      page.data.favorited = false;
      await page.onFavorite();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/login/login' });
    });

    test('收藏成功', async () => {
      wx.setStorageSync('userInfo', defaultUser);
      global.getApp = jest.fn(() => createMockApp(true));
      page.data.articleId = 'article_001';
      page.data.favorited = false;
      await page.onFavorite();
      expect(page.data.favorited).toBe(true);
      expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '收藏成功', icon: 'success' }));
    });

    test('取消收藏成功', async () => {
      wx.setStorageSync('userInfo', defaultUser);
      global.getApp = jest.fn(() => createMockApp(true));
      page.data.articleId = 'article_001';
      page.data.favorited = false;
      await page.onFavorite();
      expect(page.data.favorited).toBe(true);
      await page.onFavorite();
      expect(page.data.favorited).toBe(false);
      expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '已取消收藏', icon: 'none' }));
    });
  });

  describe('checkFavoriteStatus', () => {
    beforeEach(() => {
      wx.setStorageSync('userInfo', defaultUser);
      wx.setStorageSync('isLoggedIn', true);
      wx.setStorageSync('favorites', {});
    });

    test('已收藏时设置 favorited 为 true', async () => {
      await api.favoriteArticle('article_001');
      await page.checkFavoriteStatus('article_001');
      expect(page.data.favorited).toBe(true);
    });

    test('未收藏时设置 favorited 为 false', async () => {
      await page.checkFavoriteStatus('article_001');
      expect(page.data.favorited).toBe(false);
    });

    test('未登录时设置 favorited 为 false', async () => {
      global.getApp = jest.fn(() => createMockApp(false));
      page.data.favorited = true;
      await page.checkFavoriteStatus('article_001');
      expect(page.data.favorited).toBe(false);
    });
  });

  describe('checkLikeStatus', () => {
    beforeEach(() => {
      wx.setStorageSync('userInfo', defaultUser);
      wx.setStorageSync('isLoggedIn', true);
      wx.setStorageSync('likes', {});
    });

    test('已点赞时设置 liked 为 true', async () => {
      await api.likeArticle('article_001');
      await page.checkLikeStatus('article_001');
      expect(page.data.liked).toBe(true);
    });

    test('未点赞时设置 liked 为 false', async () => {
      await page.checkLikeStatus('article_001');
      expect(page.data.liked).toBe(false);
    });

    test('未登录时设置 liked 为 false', async () => {
      global.getApp = jest.fn(() => createMockApp(false));
      page.data.liked = true;
      await page.checkLikeStatus('article_001');
      expect(page.data.liked).toBe(false);
    });
  });

  describe('加载详情后恢复点赞状态', () => {
    beforeEach(() => {
      wx.setStorageSync('userInfo', defaultUser);
      wx.setStorageSync('isLoggedIn', true);
      wx.setStorageSync('likes', {});
    });

    test('已点赞文章加载详情后 liked 为 true', async () => {
      await api.likeArticle('article_001');
      page.data.articleId = 'article_001';
      page.data.article = null;
      await page.loadArticleDetail('article_001');
      expect(page.data.liked).toBe(true);
    });

    test('未点赞文章加载详情后 liked 为 false', async () => {
      page.data.articleId = 'article_001';
      page.data.article = null;
      await page.loadArticleDetail('article_001');
      expect(page.data.liked).toBe(false);
    });
  });

  describe('goBack', () => {
    test('跳转到首页', () => {
      page.goBack();
      expect(wx.switchTab).toHaveBeenCalledWith({ url: '/pages/index/index' });
    });
  });

  describe('goToLogin', () => {
    test('跳转到登录页', () => {
      page.goToLogin();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/login/login' });
    });
  });

  describe('onShareAppMessage', () => {
    test('有文章时返回分享信息', () => {
      const articles = wx.getStorageSync('articles');
      page.data.article = articles.find(a => a.id === 'article_001');
      const shareInfo = page.onShareAppMessage();
      expect(shareInfo.title).toBe(page.data.article.title);
      expect(shareInfo.path).toContain('article_001');
    });

    test('无文章时返回空对象', () => {
      page.data.article = null;
      const shareInfo = page.onShareAppMessage();
      expect(shareInfo).toEqual({});
    });
  });
});
