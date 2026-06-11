const { createPageInstance, initStorage, defaultUser } = require('../helpers');

function createControllablePromise() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

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

describe('Favorites 收藏页', () => {
  let page;
  let favoritesPage;
  let api;

  beforeAll(() => {
    jest.resetModules();
    require('../../pages/favorites/favorites');
    favoritesPage = Page.mock.calls[Page.mock.calls.length - 1][0];
    api = require('../../utils/api');
  });

  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    global.getApp = jest.fn(() => createMockApp(true));
    page = createPageInstance(favoritesPage);
  });

  test('初始 data 状态正确', () => {
    expect(page.data.isLoggedIn).toBe(false);
    expect(page.data.categories).toEqual([]);
    expect(page.data.currentCategory).toBe('all');
    expect(page.data.favoriteList).toEqual([]);
    expect(page.data.page).toBe(1);
    expect(page.data.pageSize).toBe(10);
    expect(page.data.hasMore).toBe(true);
    expect(page.data.keyword).toBe('');
    expect(page.data.loading).toBe(false);
    expect(page.data.loadingMore).toBe(false);
    expect(page.data.sortType).toBe('latest');
    expect(page.data.sortOptions).toEqual([
      { id: 'latest', name: '最新发布' },
      { id: 'views', name: '最多阅读' },
      { id: 'likes', name: '最多点赞' }
    ]);
    expect(page.data.searchHistory).toEqual([]);
    expect(page.data.showSearchHistory).toBe(false);
    expect(page.data.hotArticles).toEqual([]);
    expect(page.data.emptyResultType).toBe('normal');
  });

  describe('登录守卫', () => {
    test('checkLoginStatus 已登录时返回 true 并更新状态', () => {
      const result = page.checkLoginStatus();
      expect(result).toBe(true);
      expect(page.data.isLoggedIn).toBe(true);
    });

    test('checkLoginStatus 未登录时返回 false 并更新状态（不跳转）', () => {
      global.getApp = jest.fn(() => createMockApp(false));
      const result = page.checkLoginStatus();
      expect(result).toBe(false);
      expect(page.data.isLoggedIn).toBe(false);
      expect(wx.showToast).not.toHaveBeenCalled();
      expect(wx.navigateTo).not.toHaveBeenCalled();
    });

    test('onLoad 未登录时不加载数据（显示登录引导）', () => {
      global.getApp = jest.fn(() => createMockApp(false));
      page.loadCategories = jest.fn();
      page.loadList = jest.fn();

      page.onLoad();

      expect(page.data.isLoggedIn).toBe(false);
      expect(page.loadCategories).not.toHaveBeenCalled();
      expect(page.loadList).not.toHaveBeenCalled();
      expect(wx.showToast).not.toHaveBeenCalled();
      expect(wx.navigateTo).not.toHaveBeenCalled();
    });

    test('onLoad 已登录时只加载分类，不加载列表', () => {
      page.loadCategories = jest.fn();
      page.loadList = jest.fn();
      page.checkLoginStatus = jest.fn(() => {
        page.setData({ isLoggedIn: true });
        return true;
      });

      page.onLoad();

      expect(page.checkLoginStatus).toHaveBeenCalled();
      expect(page.loadCategories).toHaveBeenCalled();
      expect(page.loadList).not.toHaveBeenCalled();
    });

    test('onShow 未登录时不刷新数据（显示登录引导）', () => {
      global.getApp = jest.fn(() => createMockApp(false));
      page.refreshData = jest.fn();

      page.onShow();

      expect(page.data.isLoggedIn).toBe(false);
      expect(page.refreshData).not.toHaveBeenCalled();
      expect(wx.showToast).not.toHaveBeenCalled();
      expect(wx.navigateTo).not.toHaveBeenCalled();
    });

    test('onShow 已登录时刷新数据', () => {
      page.refreshData = jest.fn();
      page.checkLoginStatus = jest.fn(() => {
        page.setData({ isLoggedIn: true });
        return true;
      });

      page.onShow();

      expect(page.checkLoginStatus).toHaveBeenCalled();
      expect(page.refreshData).toHaveBeenCalled();
    });

    test('首屏 onLoad + onShow 只触发一次列表请求', () => {
      page.loadCategories = jest.fn();
      page.refreshData = jest.fn();
      page.checkLoginStatus = jest.fn(() => {
        page.setData({ isLoggedIn: true });
        return true;
      });

      page.onLoad();
      page.onShow();

      expect(page.loadCategories).toHaveBeenCalledTimes(1);
      expect(page.refreshData).toHaveBeenCalledTimes(1);
    });

    test('goToLogin 跳转到登录页', () => {
      page.goToLogin();
      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/login/login'
      });
    });

    test('loadFavorites 未登录时不加载（返回 cancelled）', () => {
      global.getApp = jest.fn(() => createMockApp(false));
      page.loadList = jest.fn();

      const result = page.loadFavorites();

      expect(page.loadList).not.toHaveBeenCalled();
      expect(wx.showToast).not.toHaveBeenCalled();
      expect(wx.navigateTo).not.toHaveBeenCalled();
      expect(result).resolves.toEqual({ cancelled: true, success: false });
    });

    test('loadFavorites 已登录时调用 loadList', () => {
      global.getApp = jest.fn(() => createMockApp(true));
      page.loadList = jest.fn(() => Promise.resolve());

      page.loadFavorites();

      expect(page.loadList).toHaveBeenCalled();
    });
  });

  describe('API 层未登录保护', () => {
    test('getFavoriteList 未登录时返回 401', async () => {
      wx.removeStorageSync('isLoggedIn');
      wx.removeStorageSync('userInfo');

      const res = await api.getFavoriteList();

      expect(res.code).toBe(401);
      expect(res.data).toBeNull();
      expect(res.message).toBe('请先登录');
    });

    test('getFavoriteList 有 userInfo 但无 isLoggedIn 标记时返回 401', async () => {
      wx.removeStorageSync('isLoggedIn');
      wx.setStorageSync('userInfo', defaultUser);

      const res = await api.getFavoriteList();

      expect(res.code).toBe(401);
      expect(res.message).toBe('请先登录');
    });

    test('getFavoriteList 已登录时正常返回数据', async () => {
      wx.setStorageSync('isLoggedIn', true);
      wx.setStorageSync('userInfo', defaultUser);
      wx.setStorageSync('favorites', { [defaultUser.id]: ['article_001'] });

      const res = await api.getFavoriteList();

      expect(res.code).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  describe('loadCategories', () => {
    test('成功加载分类列表', async () => {
      await page.loadCategories();
      expect(page.data.categories.length).toBeGreaterThan(0);
    });
  });

  describe('loadFavorites', () => {
    test('无收藏时返回空列表', async () => {
      await page.loadFavorites();
      expect(page.data.favoriteList).toEqual([]);
      expect(page.data.loading).toBe(false);
    });

    test('有收藏时加载收藏列表', async () => {
      await api.favoriteArticle('article_001');
      await api.favoriteArticle('article_002');

      await page.loadFavorites();
      expect(page.data.favoriteList.length).toBe(2);
    });

    test('收藏文章包含 categoryName 和 summary', async () => {
      await api.favoriteArticle('article_001');
      await page.loadFavorites();

      const item = page.data.favoriteList[0];
      expect(item).toHaveProperty('categoryName');
      expect(item).toHaveProperty('summary');
    });

    test('加载中允许新请求（可重入），旧请求结果被取消', async () => {
      const { promise: firstPromise, resolve: resolveFirst } = createControllablePromise();
      const { promise: secondPromise, resolve: resolveSecond } = createControllablePromise();

      const mockApi = jest.spyOn(api, 'getFavoriteList')
        .mockReturnValueOnce(firstPromise)
        .mockReturnValueOnce(secondPromise);

      const firstCall = page.loadFavorites();
      expect(page._loadRequestId).toBe(1);

      const secondCall = page.loadFavorites();
      expect(page._loadRequestId).toBe(2);

      resolveSecond({
        code: 200,
        data: {
          list: [{ id: 'article_002', title: '第二篇', category: 'farming', content: '内容2', createTime: '2024-12-10' }],
          hasMore: false
        }
      });

      const secondResult = await secondCall;
      expect(secondResult.cancelled).toBe(false);
      expect(page.data.favoriteList.length).toBe(1);
      expect(page.data.favoriteList[0].id).toBe('article_002');

      resolveFirst({
        code: 200,
        data: {
          list: [{ id: 'article_001', title: '第一篇', category: 'farming', content: '内容1', createTime: '2024-12-15' }],
          hasMore: false
        }
      });

      const firstResult = await firstCall;
      expect(firstResult.cancelled).toBe(true);
      expect(page.data.favoriteList.length).toBe(1);
      expect(page.data.favoriteList[0].id).toBe('article_002');

      mockApi.mockRestore();
    });
  });

  describe('refreshData', () => {
    test('重置分页并重新加载', async () => {
      await api.favoriteArticle('article_001');

      page.data.page = 3;
      page.data.favoriteList = [{ id: 'old' }];
      page.data.hasMore = false;

      await page.refreshData();
      expect(page.data.page).toBe(1);
      expect(page.data.favoriteList.length).toBeGreaterThan(0);
    });
  });

  describe('onCategoryChange', () => {
    test('切换分类时重置分页', async () => {
      await api.favoriteArticle('article_001');
      page.data.currentCategory = 'all';
      page.data.favoriteList = [{ id: 'old' }];

      page.onCategoryChange({ currentTarget: { dataset: { id: 'farming' } } });
      expect(page.data.currentCategory).toBe('farming');
      expect(page.data.page).toBe(1);
      expect(page.data.favoriteList).toEqual([]);
    });

    test('点击当前分类不做操作', async () => {
      page.data.currentCategory = 'all';
      page.data.favoriteList = [{ id: 'existing' }];

      page.onCategoryChange({ currentTarget: { dataset: { id: 'all' } } });
      expect(page.data.favoriteList).toEqual([{ id: 'existing' }]);
    });
  });

  describe('onSearchInput', () => {
    test('更新搜索关键词', () => {
      page.onSearchInput({ detail: { value: '农耕' } });
      expect(page.data.keyword).toBe('农耕');
    });
  });

  describe('onSearch', () => {
    test('搜索时重置分页', () => {
      page.data.keyword = '农耕';
      page.data.page = 3;
      page.onSearch();
      expect(page.data.page).toBe(1);
      expect(page.data.favoriteList).toEqual([]);
    });
  });

  describe('clearSearch', () => {
    test('清除关键词并重新加载', () => {
      page.data.keyword = '农耕';
      page.clearSearch();
      expect(page.data.keyword).toBe('');
      expect(page.data.page).toBe(1);
    });
  });

  describe('onSortChange', () => {
    test('切换排序方式时重置分页', () => {
      page.data.sortType = 'latest';
      page.data.favoriteList = [{ id: 'old' }];
      page.data.page = 3;

      page.onSortChange({ currentTarget: { dataset: { sort: 'likes' } } });

      expect(page.data.sortType).toBe('likes');
      expect(page.data.page).toBe(1);
      expect(page.data.favoriteList).toEqual([]);
      expect(page.data.hasMore).toBe(true);
    });

    test('点击当前排序方式不做操作', () => {
      page.data.sortType = 'latest';
      page.data.favoriteList = [{ id: 'existing' }];

      page.onSortChange({ currentTarget: { dataset: { sort: 'latest' } } });

      expect(page.data.favoriteList).toEqual([{ id: 'existing' }]);
    });
  });

  describe('时间格式化', () => {
    test('收藏文章包含相对时间字段', async () => {
      await api.favoriteArticle('article_001');
      await page.loadFavorites();
      const item = page.data.favoriteList[0];
      expect(item).toHaveProperty('relativeTime');
      expect(typeof item.relativeTime).toBe('string');
    });
  });

  describe('loadMore', () => {
    test('有更多数据时页码递增', async () => {
      page.data.hasMore = true;
      page.data.loadingMore = false;
      page.data.page = 1;

      await page.loadMore();
      expect(page.data.page).toBe(2);
      expect(page.data.loadingMore).toBe(false);
    });

    test('无更多数据时不加载', async () => {
      page.data.hasMore = false;
      page.data.page = 1;

      await page.loadMore();
      expect(page.data.page).toBe(1);
    });

    test('正在加载中时不重复加载', async () => {
      page.data.hasMore = true;
      page.data.loadingMore = true;
      page.data.page = 1;

      await page.loadMore();
      expect(page.data.page).toBe(1);
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

  describe('onUnfavorite', () => {
    test('确认取消收藏后移除文章', async () => {
      await api.favoriteArticle('article_001');
      await api.favoriteArticle('article_002');
      await page.loadFavorites();
      expect(page.data.favoriteList.length).toBe(2);

      wx.showModal = jest.fn(({ success }) => {
        success({ confirm: true });
      });

      await page.onUnfavorite({ currentTarget: { dataset: { id: 'article_001', index: 0 } } });
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(page.data.favoriteList.length).toBe(1);
      expect(page.data.favoriteList.find(item => item.id === 'article_001')).toBeUndefined();
    });

    test('取消操作时不移除文章', async () => {
      await api.favoriteArticle('article_001');
      await page.loadFavorites();
      const countBefore = page.data.favoriteList.length;

      wx.showModal = jest.fn(({ success }) => {
        success({ confirm: false });
      });

      await page.onUnfavorite({ currentTarget: { dataset: { id: 'article_001', index: 0 } } });
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(page.data.favoriteList.length).toBe(countBefore);
    });
  });

  describe('竞态场景测试', () => {
    test('refreshData 打断正在进行的 loadList，旧请求结果被取消', async () => {
      const { promise: loadPromise, resolve: resolveLoad } = createControllablePromise();
      const { promise: refreshPromise, resolve: resolveRefresh } = createControllablePromise();

      const mockApi = jest.spyOn(api, 'getFavoriteList')
        .mockReturnValueOnce(loadPromise)
        .mockReturnValueOnce(refreshPromise);

      page.data.page = 3;
      page.data.favoriteList = [{ id: 'old' }];

      const loadCall = page.loadList();
      expect(page._loadRequestId).toBe(1);

      const refreshCall = page.refreshData();
      expect(page._loadRequestId).toBe(2);
      expect(page.data.page).toBe(1);
      expect(page.data.favoriteList).toEqual([]);

      resolveRefresh({
        code: 200,
        data: {
          list: [{ id: 'new', title: '新数据', category: 'all', content: '新内容', createTime: '2024-12-20' }],
          hasMore: false
        }
      });

      await refreshCall;
      expect(page.data.favoriteList.length).toBe(1);
      expect(page.data.favoriteList[0].id).toBe('new');

      resolveLoad({
        code: 200,
        data: {
          list: [{ id: 'old_data', title: '旧数据', category: 'all', content: '旧内容', createTime: '2024-12-01' }],
          hasMore: true
        }
      });

      const loadResult = await loadCall;
      expect(loadResult.cancelled).toBe(true);
      expect(page.data.favoriteList.length).toBe(1);
      expect(page.data.favoriteList[0].id).toBe('new');

      mockApi.mockRestore();
    });

    test('切换分类打断正在进行的加载，显示最新分类数据', async () => {
      const { promise: allPromise, resolve: resolveAll } = createControllablePromise();
      const { promise: farmingPromise, resolve: resolveFarming } = createControllablePromise();

      const mockApi = jest.spyOn(api, 'getFavoriteList')
        .mockReturnValueOnce(allPromise)
        .mockReturnValueOnce(farmingPromise);

      page.data.currentCategory = 'all';
      const allCall = page.loadList();
      expect(page._loadRequestId).toBe(1);

      page.onCategoryChange({ currentTarget: { dataset: { id: 'farming' } } });
      expect(page._loadRequestId).toBe(2);
      expect(page.data.currentCategory).toBe('farming');

      resolveFarming({
        code: 200,
        data: {
          list: [{ id: 'farming_001', title: '农耕收藏', category: 'farming', content: '农耕内容', createTime: '2024-12-15' }],
          hasMore: false
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(page.data.favoriteList.length).toBe(1);
      expect(page.data.favoriteList[0].category).toBe('farming');

      resolveAll({
        code: 200,
        data: {
          list: [{ id: 'all_001', title: '全部收藏', category: 'all', content: '全部内容', createTime: '2024-12-10' }],
          hasMore: true
        }
      });

      const allResult = await allCall;
      expect(allResult.cancelled).toBe(true);
      expect(page.data.favoriteList.length).toBe(1);
      expect(page.data.favoriteList[0].category).toBe('farming');

      mockApi.mockRestore();
    });

    test('onShow 触发的 refreshData 打断正在进行的加载', async () => {
      const { promise: firstPromise, resolve: resolveFirst } = createControllablePromise();
      const { promise: secondPromise, resolve: resolveSecond } = createControllablePromise();

      const mockApi = jest.spyOn(api, 'getFavoriteList')
        .mockReturnValueOnce(firstPromise)
        .mockReturnValueOnce(secondPromise);

      const firstCall = page.loadList();
      expect(page._loadRequestId).toBe(1);

      page.onShow();
      expect(page._loadRequestId).toBe(2);

      resolveSecond({
        code: 200,
        data: {
          list: [{ id: 'onshow_data', title: 'onShow刷新', category: 'all', content: '内容', createTime: '2024-12-20' }],
          hasMore: false
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(page.data.favoriteList.length).toBe(1);
      expect(page.data.favoriteList[0].title).toBe('onShow刷新');

      resolveFirst({
        code: 200,
        data: {
          list: [{ id: 'old_data', title: '旧数据', category: 'all', content: '旧内容', createTime: '2024-12-01' }],
          hasMore: true
        }
      });

      const firstResult = await firstCall;
      expect(firstResult.cancelled).toBe(true);
      expect(page.data.favoriteList.length).toBe(1);
      expect(page.data.favoriteList[0].title).toBe('onShow刷新');

      mockApi.mockRestore();
    });

    test('快速连续多次调用，只有最后一次生效', async () => {
      const promises = [];
      const resolvers = [];
      for (let i = 0; i < 3; i++) {
        const { promise, resolve } = createControllablePromise();
        promises.push(promise);
        resolvers.push(resolve);
      }

      const mockApi = jest.spyOn(api, 'getFavoriteList');
      promises.forEach(p => mockApi.mockReturnValueOnce(p));

      const calls = [];
      calls.push(page.loadFavorites());
      calls.push(page.refreshData());
      calls.push(page.onCategoryChange({ currentTarget: { dataset: { id: 'craft' } } }));

      expect(page._loadRequestId).toBe(3);

      for (let i = 2; i >= 0; i--) {
        resolvers[i]({
          code: 200,
          data: { list: [{ id: `call_${i}`, title: `第${i}次`, category: 'all', content: '内容', createTime: '2024-12-15' }], hasMore: false }
        });
      }

      const results = await Promise.all(calls);

      expect(page.data.favoriteList[0].id).toBe('call_2');

      mockApi.mockRestore();
    });
  });
});
