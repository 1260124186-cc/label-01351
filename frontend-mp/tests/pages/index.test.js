const { createPageInstance, initStorage } = require('../helpers');

function createControllablePromise() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('Index 首页', () => {
  let page;
  let indexPage;
  let api;

  beforeAll(() => {
    jest.resetModules();
    require('../../pages/index/index');
    indexPage = Page.mock.calls[Page.mock.calls.length - 1][0];
    api = require('../../utils/api');
  });

  beforeEach(() => {
    initStorage();
    page = createPageInstance(indexPage);
  });

  test('初始 data 状态正确', () => {
    expect(page.data.categories).toEqual([]);
    expect(page.data.currentCategory).toBe('all');
    expect(page.data.articleList).toEqual([]);
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

  describe('loadArticles', () => {
    test('成功加载文章列表', async () => {
      await page.loadArticles();
      expect(page.data.articleList.length).toBeGreaterThan(0);
      expect(page.data.loading).toBe(false);
    });

    test('文章包含 categoryName 和 summary 字段', async () => {
      await page.loadArticles();
      const article = page.data.articleList[0];
      expect(article).toHaveProperty('categoryName');
      expect(article).toHaveProperty('summary');
    });

    test('加载中允许新请求（可重入），旧请求结果被取消', async () => {
      const { promise: firstPromise, resolve: resolveFirst } = createControllablePromise();
      const { promise: secondPromise, resolve: resolveSecond } = createControllablePromise();

      const mockApi = jest.spyOn(api, 'getArticleList')
        .mockReturnValueOnce(firstPromise)
        .mockReturnValueOnce(secondPromise);

      const firstCall = page.loadArticles();
      expect(page._loadRequestId).toBe(1);

      const secondCall = page.loadArticles();
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
      expect(page.data.articleList.length).toBe(1);
      expect(page.data.articleList[0].id).toBe('article_002');

      resolveFirst({
        code: 200,
        data: {
          list: [{ id: 'article_001', title: '第一篇', category: 'farming', content: '内容1', createTime: '2024-12-15' }],
          hasMore: false
        }
      });

      const firstResult = await firstCall;
      expect(firstResult.cancelled).toBe(true);
      expect(page.data.articleList.length).toBe(1);
      expect(page.data.articleList[0].id).toBe('article_002');

      mockApi.mockRestore();
    });

    test('分页追加文章', async () => {
      await page.loadArticles();
      page.data.page = 2;
      page.data.hasMore = true;
      await page.loadArticles();
    });
  });

  describe('loadCategories', () => {
    test('成功加载分类列表', async () => {
      await page.loadCategories();
      expect(page.data.categories.length).toBeGreaterThan(0);
    });

    test('分类加载失败时显示 Toast', async () => {
      const spy = jest.spyOn(api, 'getCategoryList').mockRejectedValue(new Error('fail'));
      await page.loadCategories();
      expect(wx.showToast).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('生命周期', () => {
    test('onLoad 只加载分类，不加载列表', () => {
      page.loadCategories = jest.fn();
      page.loadList = jest.fn();

      page.onLoad();

      expect(page.loadCategories).toHaveBeenCalled();
      expect(page.loadList).not.toHaveBeenCalled();
    });

    test('onShow 刷新数据', () => {
      page.refreshData = jest.fn();

      page.onShow();

      expect(page.refreshData).toHaveBeenCalled();
    });

    test('首屏 onLoad + onShow 只触发一次列表请求', () => {
      page.loadCategories = jest.fn();
      page.refreshData = jest.fn();

      page.onLoad();
      page.onShow();

      expect(page.loadCategories).toHaveBeenCalledTimes(1);
      expect(page.refreshData).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshData', () => {
    test('重置分页并重新加载', async () => {
      page.data.page = 3;
      page.data.articleList = [{ id: 'old' }];
      page.data.hasMore = false;

      await page.refreshData();

      expect(page.data.page).toBe(1);
      expect(page.data.articleList.length).toBeGreaterThan(0);
      expect(page.data.hasMore).toBeDefined();
    });
  });

  describe('onCategoryChange', () => {
    test('切换分类时重置分页', () => {
      page.data.currentCategory = 'all';
      page.data.articleList = [{ id: 'old' }];

      page.onCategoryChange({ currentTarget: { dataset: { id: 'farming' } } });

      expect(page.data.currentCategory).toBe('farming');
      expect(page.data.page).toBe(1);
      expect(page.data.articleList).toEqual([]);
      expect(page.data.hasMore).toBe(true);
    });

    test('点击当前分类不做操作', () => {
      page.data.currentCategory = 'all';
      page.data.articleList = [{ id: 'existing' }];

      page.onCategoryChange({ currentTarget: { dataset: { id: 'all' } } });

      expect(page.data.articleList).toEqual([{ id: 'existing' }]);
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
      expect(page.data.articleList).toEqual([]);
      expect(page.data.hasMore).toBe(true);
    });
  });

  describe('clearSearch', () => {
    test('清除搜索关键词并重新加载', () => {
      page.data.keyword = '农耕';
      page.clearSearch();
      expect(page.data.keyword).toBe('');
      expect(page.data.page).toBe(1);
    });
  });

  describe('onSortChange', () => {
    test('切换排序方式时重置分页', () => {
      page.data.sortType = 'latest';
      page.data.articleList = [{ id: 'old' }];
      page.data.page = 3;

      page.onSortChange({ currentTarget: { dataset: { sort: 'views' } } });

      expect(page.data.sortType).toBe('views');
      expect(page.data.page).toBe(1);
      expect(page.data.articleList).toEqual([]);
      expect(page.data.hasMore).toBe(true);
    });

    test('点击当前排序方式不做操作', () => {
      page.data.sortType = 'latest';
      page.data.articleList = [{ id: 'existing' }];

      page.onSortChange({ currentTarget: { dataset: { sort: 'latest' } } });

      expect(page.data.articleList).toEqual([{ id: 'existing' }]);
    });
  });

  describe('搜索历史', () => {
    test('搜索关键词会保存到历史记录', () => {
      page._saveSearchHistory('农耕文化');

      const history = wx.getStorageSync('search_history');
      expect(history).toContain('农耕文化');
      expect(page.data.searchHistory).toContain('农耕文化');
    });

    test('搜索历史最多保存10条', () => {
      for (let i = 0; i < 15; i++) {
        page._saveSearchHistory(`关键词${i}`);
      }

      const history = wx.getStorageSync('search_history');
      expect(history.length).toBeLessThanOrEqual(10);
    });

    test('重复搜索的关键词会移到最前面', () => {
      page._saveSearchHistory('农耕');
      page._saveSearchHistory('民俗');
      page._saveSearchHistory('农耕');

      const history = wx.getStorageSync('search_history');
      expect(history[0]).toBe('农耕');
      expect(history.filter(k => k === '农耕').length).toBe(1);
    });

    test('点击历史记录项触发搜索', () => {
      page._triggerSearch = jest.fn();
      page.onHistoryItemTap({ currentTarget: { dataset: { keyword: '历史关键词' } } });
      expect(page.data.keyword).toBe('历史关键词');
      expect(page.data.showSearchHistory).toBe(false);
      expect(page._triggerSearch).toHaveBeenCalled();
    });

    test('空关键词不保存到历史记录', () => {
      wx.setStorageSync('search_history', []);
      page._saveSearchHistory('');
      page._saveSearchHistory('   ');
      const history = wx.getStorageSync('search_history');
      expect(history).toEqual([]);
    });

    test('清空搜索历史', () => {
      wx.setStorageSync('search_history', ['农耕', '民俗']);
      page.setData({ searchHistory: ['农耕', '民俗'] });

      wx.showModal = jest.fn(({ success }) => {
        success({ confirm: true });
      });

      page.clearSearchHistory();

      expect(wx.getStorageSync('search_history')).toEqual('');
      expect(page.data.searchHistory).toEqual([]);
    });

    test('取消清空搜索历史时不做操作', () => {
      wx.setStorageSync('search_history', ['农耕', '民俗']);
      page.setData({ searchHistory: ['农耕', '民俗'] });

      wx.showModal = jest.fn(({ success }) => {
        success({ confirm: false });
      });

      page.clearSearchHistory();

      expect(wx.getStorageSync('search_history')).toEqual(['农耕', '民俗']);
      expect(page.data.searchHistory).toEqual(['农耕', '民俗']);
    });
  });

  describe('时间格式化', () => {
    test('文章列表包含相对时间字段', async () => {
      await page.loadArticles();
      expect(page.data.articleList.length).toBeGreaterThan(0);
      const article = page.data.articleList[0];
      expect(article).toHaveProperty('relativeTime');
      expect(typeof article.relativeTime).toBe('string');
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

  describe('竞态场景测试', () => {
    test('refreshData 打断正在进行的 loadList，旧请求结果被取消', async () => {
      const { promise: loadPromise, resolve: resolveLoad } = createControllablePromise();
      const { promise: refreshPromise, resolve: resolveRefresh } = createControllablePromise();

      const mockApi = jest.spyOn(api, 'getArticleList')
        .mockReturnValueOnce(loadPromise)
        .mockReturnValueOnce(refreshPromise);

      page.data.page = 2;
      page.data.articleList = [{ id: 'old' }];

      const loadCall = page.loadList();
      expect(page._loadRequestId).toBe(1);

      const refreshCall = page.refreshData();
      expect(page._loadRequestId).toBe(2);
      expect(page.data.page).toBe(1);
      expect(page.data.articleList).toEqual([]);

      resolveRefresh({
        code: 200,
        data: {
          list: [{ id: 'new', title: '新数据', category: 'all', content: '新内容', createTime: '2024-12-20' }],
          hasMore: false
        }
      });

      await refreshCall;
      expect(page.data.articleList.length).toBe(1);
      expect(page.data.articleList[0].id).toBe('new');

      resolveLoad({
        code: 200,
        data: {
          list: [{ id: 'old_data', title: '旧数据', category: 'all', content: '旧内容', createTime: '2024-12-01' }],
          hasMore: true
        }
      });

      const loadResult = await loadCall;
      expect(loadResult.cancelled).toBe(true);
      expect(page.data.articleList.length).toBe(1);
      expect(page.data.articleList[0].id).toBe('new');

      mockApi.mockRestore();
    });

    test('切换分类打断正在进行的加载，显示最新分类数据', async () => {
      const { promise: allPromise, resolve: resolveAll } = createControllablePromise();
      const { promise: farmingPromise, resolve: resolveFarming } = createControllablePromise();

      const mockApi = jest.spyOn(api, 'getArticleList')
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
          list: [{ id: 'farming_001', title: '农耕文章', category: 'farming', content: '农耕内容', createTime: '2024-12-15' }],
          hasMore: false
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(page.data.articleList.length).toBe(1);
      expect(page.data.articleList[0].category).toBe('farming');

      resolveAll({
        code: 200,
        data: {
          list: [{ id: 'all_001', title: '全部文章', category: 'all', content: '全部内容', createTime: '2024-12-10' }],
          hasMore: true
        }
      });

      const allResult = await allCall;
      expect(allResult.cancelled).toBe(true);
      expect(page.data.articleList.length).toBe(1);
      expect(page.data.articleList[0].category).toBe('farming');

      mockApi.mockRestore();
    });

    test('搜索打断正在进行的加载，显示搜索结果', async () => {
      const { promise: normalPromise, resolve: resolveNormal } = createControllablePromise();
      const { promise: searchPromise, resolve: resolveSearch } = createControllablePromise();

      const mockApi = jest.spyOn(api, 'getArticleList')
        .mockReturnValueOnce(normalPromise)
        .mockReturnValueOnce(searchPromise);

      const normalCall = page.loadList();
      expect(page._loadRequestId).toBe(1);

      page.data.keyword = '农耕';
      page.onSearch();
      expect(page._loadRequestId).toBe(2);

      resolveSearch({
        code: 200,
        data: {
          list: [{ id: 'search_001', title: '农耕搜索结果', category: 'farming', content: '农耕内容', createTime: '2024-12-15' }],
          hasMore: false
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(page.data.articleList.length).toBe(1);
      expect(page.data.articleList[0].title).toContain('搜索');

      resolveNormal({
        code: 200,
        data: {
          list: [{ id: 'normal_001', title: '普通结果', category: 'all', content: '普通内容', createTime: '2024-12-10' }],
          hasMore: true
        }
      });

      const normalResult = await normalCall;
      expect(normalResult.cancelled).toBe(true);
      expect(page.data.articleList.length).toBe(1);
      expect(page.data.articleList[0].title).toContain('搜索');

      mockApi.mockRestore();
    });

    test('旧请求出错被取消时不显示错误提示', async () => {
      const { promise: firstPromise, reject: rejectFirst } = createControllablePromise();
      const { promise: secondPromise, resolve: resolveSecond } = createControllablePromise();

      const mockApi = jest.spyOn(api, 'getArticleList')
        .mockReturnValueOnce(firstPromise)
        .mockReturnValueOnce(secondPromise);

      const toastSpy = jest.spyOn(wx, 'showToast');

      const firstCall = page.loadList();
      page.loadList();

      resolveSecond({
        code: 200,
        data: { list: [{ id: 'ok', title: '正常', category: 'all', content: '内容', createTime: '2024-12-15' }], hasMore: false }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      rejectFirst(new Error('网络错误'));

      const firstResult = await firstCall;
      expect(firstResult.cancelled).toBe(true);

      expect(toastSpy).not.toHaveBeenCalledWith(expect.objectContaining({
        title: '网络错误，请重试'
      }));

      mockApi.mockRestore();
      toastSpy.mockRestore();
    });

    test('loadMore 被刷新打断时，loadingMore 状态正确处理', async () => {
      const { promise: morePromise, resolve: resolveMore } = createControllablePromise();
      const { promise: refreshPromise, resolve: resolveRefresh } = createControllablePromise();

      const mockApi = jest.spyOn(api, 'getArticleList')
        .mockReturnValueOnce(morePromise)
        .mockReturnValueOnce(refreshPromise);

      page.data.hasMore = true;
      page.data.loadingMore = false;
      page.data.page = 1;

      const moreCall = page.loadMore();
      expect(page._loadRequestId).toBe(1);
      expect(page.data.loadingMore).toBe(true);
      expect(page.data.page).toBe(2);

      const refreshCall = page.refreshData();
      expect(page._loadRequestId).toBe(2);
      expect(page.data.page).toBe(1);

      resolveRefresh({
        code: 200,
        data: { list: [{ id: 'refreshed', title: '刷新数据', category: 'all', content: '内容', createTime: '2024-12-20' }], hasMore: true }
      });

      await refreshCall;

      resolveMore({
        code: 200,
        data: { list: [{ id: 'more_data', title: '更多数据', category: 'all', content: '内容', createTime: '2024-12-01' }], hasMore: false }
      });

      const moreResult = await moreCall;
      expect(moreResult.cancelled).toBe(true);
      expect(page.data.loadingMore).toBe(true);
      expect(page.data.articleList[0].id).toBe('refreshed');

      mockApi.mockRestore();
    });

    test('快速连续多次调用，只有最后一次生效', async () => {
      const promises = [];
      const resolvers = [];
      for (let i = 0; i < 5; i++) {
        const { promise, resolve } = createControllablePromise();
        promises.push(promise);
        resolvers.push(resolve);
      }

      const mockApi = jest.spyOn(api, 'getArticleList');
      promises.forEach(p => mockApi.mockReturnValueOnce(p));

      const calls = [];
      for (let i = 0; i < 5; i++) {
        calls.push(page.loadList());
      }

      expect(page._loadRequestId).toBe(5);

      for (let i = 4; i >= 0; i--) {
        resolvers[i]({
          code: 200,
          data: { list: [{ id: `call_${i}`, title: `第${i}次`, category: 'all', content: '内容', createTime: '2024-12-15' }], hasMore: false }
        });
      }

      const results = await Promise.all(calls);

      for (let i = 0; i < 4; i++) {
        expect(results[i].cancelled).toBe(true);
      }
      expect(results[4].cancelled).toBe(false);
      expect(page.data.articleList[0].id).toBe('call_4');

      mockApi.mockRestore();
    });
  });
});
