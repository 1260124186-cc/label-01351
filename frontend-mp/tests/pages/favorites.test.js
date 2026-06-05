const api = require('../../utils/api');
const { createPageInstance, initStorage, defaultUser } = require('../helpers');

describe('Favorites 收藏页', () => {
  let page;
  let favoritesPage;

  beforeAll(() => {
    jest.resetModules();
    require('../../pages/favorites/favorites');
    favoritesPage = Page.mock.calls[Page.mock.calls.length - 1][0];
  });

  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    page = createPageInstance(favoritesPage);
  });

  test('初始 data 状态正确', () => {
    expect(page.data.categories).toEqual([]);
    expect(page.data.currentCategory).toBe('all');
    expect(page.data.favoriteList).toEqual([]);
    expect(page.data.page).toBe(1);
    expect(page.data.pageSize).toBe(10);
    expect(page.data.hasMore).toBe(true);
    expect(page.data.keyword).toBe('');
    expect(page.data.loading).toBe(false);
    expect(page.data.loadingMore).toBe(false);
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

    test('加载中不再重复请求', async () => {
      page.data.loading = true;
      await page.loadFavorites();
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
});
