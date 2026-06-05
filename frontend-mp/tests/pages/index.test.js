const { createPageInstance, initStorage } = require('../helpers');

describe('Index 首页', () => {
  let page;
  let indexPage;
  let pageApi;

  beforeAll(() => {
    jest.resetModules();
    require('../../pages/index/index');
    indexPage = Page.mock.calls[Page.mock.calls.length - 1][0];
    pageApi = require('../../utils/api');
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

    test('加载中不再重复请求', async () => {
      page.data.loading = true;
      await page.loadArticles();
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
      const spy = jest.spyOn(pageApi, 'getCategoryList').mockRejectedValue(new Error('fail'));
      await page.loadCategories();
      expect(wx.showToast).toHaveBeenCalled();
      spy.mockRestore();
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
});
