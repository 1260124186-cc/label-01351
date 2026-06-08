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
    getUserInfo: jest.fn(() => loggedIn ? defaultUser : null)
  };
}

describe('Publish 投稿页', () => {
  let page;
  let publishPage;

  beforeAll(() => {
    jest.resetModules();
    require('../../pages/publish/publish');
    publishPage = Page.mock.calls[Page.mock.calls.length - 1][0];
  });

  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    global.getApp = jest.fn(() => createMockApp(true));
    page = createPageInstance(publishPage);
  });

  test('初始 data 状态正确', () => {
    expect(page.data.isLoggedIn).toBe(false);
    expect(page.data.categories).toEqual([]);
    expect(page.data.formData).toEqual({ title: '', category: '', content: '', figureId: '' });
    expect(page.data.canSubmit).toBe(false);
    expect(page.data.submitting).toBe(false);
    expect(page.data.showSuccess).toBe(false);
    expect(page.data.newArticleId).toBe('');
  });

  describe('loadCategories', () => {
    test('成功加载分类列表（过滤掉 all）', async () => {
      await page.loadCategories();
      expect(page.data.categories.length).toBeGreaterThan(0);
      expect(page.data.categories.find(c => c.id === 'all')).toBeUndefined();
    });

    test('无分类数据时使用默认分类', async () => {
      wx.setStorageSync('categories', []);
      await page.loadCategories();
      expect(page.data.categories.length).toBe(4);
      expect(page.data.categories[0].id).toBe('folklore');
    });

    test('加载异常时使用默认分类', async () => {
      const original = api.getCategoryList;
      api.getCategoryList = jest.fn().mockRejectedValue(new Error('fail'));
      await page.loadCategories();
      expect(page.data.categories.length).toBe(4);
      api.getCategoryList = original;
    });
  });

  describe('checkCanSubmit', () => {
    test('标题不足2字时不可提交', () => {
      page.data.formData = { title: '短', category: 'folklore', content: '内容超过十个字符的内容' };
      page.checkCanSubmit();
      expect(page.data.canSubmit).toBe(false);
    });

    test('未选择分类时不可提交', () => {
      page.data.formData = { title: '标题文字', category: '', content: '内容超过十个字符的内容' };
      page.checkCanSubmit();
      expect(page.data.canSubmit).toBe(false);
    });

    test('内容不足10字时不可提交', () => {
      page.data.formData = { title: '标题文字', category: 'folklore', content: '短内容' };
      page.checkCanSubmit();
      expect(page.data.canSubmit).toBe(false);
    });

    test('全部满足时可以提交', () => {
      page.data.formData = { title: '标题文字', category: 'folklore', content: '内容超过十个字符的内容' };
      page.checkCanSubmit();
      expect(page.data.canSubmit).toBe(true);
    });
  });

  describe('onTitleInput', () => {
    test('更新标题并检查提交状态', () => {
      page.onTitleInput({ detail: { value: '测试标题' } });
      expect(page.data.formData.title).toBe('测试标题');
    });
  });

  describe('onCategorySelect', () => {
    test('更新分类并检查提交状态', () => {
      page.onCategorySelect({ currentTarget: { dataset: { id: 'farming' } } });
      expect(page.data.formData.category).toBe('farming');
    });
  });

  describe('onContentInput', () => {
    test('更新内容并检查提交状态', () => {
      page.onContentInput({ detail: { value: '测试内容文字' } });
      expect(page.data.formData.content).toBe('测试内容文字');
    });
  });

  describe('onSubmit', () => {
    test('提交中时不重复提交', async () => {
      page.data.submitting = true;
      await page.onSubmit();
    });

    test('标题不足2字时提示', async () => {
      page.data.formData = { title: '短', category: 'folklore', content: '内容超过十个字符' };
      await page.onSubmit();
      expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining('至少2字') }));
    });

    test('未选分类时提示', async () => {
      page.data.formData = { title: '标题文字', category: '', content: '内容超过十个字符' };
      await page.onSubmit();
      expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining('分类') }));
    });

    test('内容不足10字时提示', async () => {
      page.data.formData = { title: '标题文字', category: 'folklore', content: '短' };
      await page.onSubmit();
      expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining('至少10字') }));
    });

    test('发布成功后显示成功弹窗', async () => {
      page.data.formData = { title: '测试投稿标题', category: 'folklore', content: '测试投稿内容，长度超过十个字符' };
      await page.onSubmit();
      expect(page.data.showSuccess).toBe(true);
      expect(page.data.newArticleId).toBeTruthy();
      expect(page.data.formData.title).toBe('');
      expect(page.data.formData.category).toBe('');
      expect(page.data.formData.content).toBe('');
      expect(page.data.canSubmit).toBe(false);
    });

    test('发布完成后 submitting 状态重置', async () => {
      page.data.formData = { title: '测试投稿标题', category: 'folklore', content: '测试投稿内容，长度超过十个字符' };
      await page.onSubmit();
      expect(page.data.submitting).toBe(false);
    });
  });

  describe('continuePublish', () => {
    test('重置表单和成功状态', () => {
      page.data.showSuccess = true;
      page.data.formData = { title: '旧标题', category: 'folklore', content: '旧内容', figureId: 'figure_001' };
      page.continuePublish();
      expect(page.data.showSuccess).toBe(false);
      expect(page.data.formData).toEqual({ title: '', category: '', content: '', figureId: '' });
      expect(page.data.canSubmit).toBe(false);
    });
  });

  describe('goToHome', () => {
    test('有新文章 ID 时跳转详情页', () => {
      page.data.newArticleId = 'article_new';
      page.goToHome();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/detail/detail?id=article_new' });
    });

    test('无新文章 ID 时跳转首页', () => {
      page.data.newArticleId = '';
      page.goToHome();
      expect(wx.switchTab).toHaveBeenCalledWith({ url: '/pages/index/index' });
    });
  });

  describe('onShow', () => {
    test('未登录时更新状态，显示登录引导（不跳转）', () => {
      global.getApp = jest.fn(() => createMockApp(false));
      page.loadCategories = jest.fn();
      page.checkCanSubmit = jest.fn();

      page.onShow();

      expect(page.data.isLoggedIn).toBe(false);
      expect(page.loadCategories).not.toHaveBeenCalled();
      expect(page.checkCanSubmit).not.toHaveBeenCalled();
      expect(wx.showToast).not.toHaveBeenCalled();
      expect(wx.navigateTo).not.toHaveBeenCalled();
    });

    test('已登录但分类未加载时，加载分类并检查提交状态', () => {
      global.getApp = jest.fn(() => createMockApp(true));
      page.loadCategories = jest.fn();
      page.checkCanSubmit = jest.fn();
      page._categoriesLoaded = false;

      page.onShow();

      expect(page.data.isLoggedIn).toBe(true);
      expect(page.loadCategories).toHaveBeenCalledTimes(1);
      expect(page._categoriesLoaded).toBe(true);
      expect(page.checkCanSubmit).toHaveBeenCalled();
    });

    test('已登录且分类已加载时，不重复加载分类', () => {
      global.getApp = jest.fn(() => createMockApp(true));
      page.loadCategories = jest.fn();
      page.checkCanSubmit = jest.fn();
      page._categoriesLoaded = true;

      page.onShow();

      expect(page.data.isLoggedIn).toBe(true);
      expect(page.loadCategories).not.toHaveBeenCalled();
      expect(page._categoriesLoaded).toBe(true);
      expect(page.checkCanSubmit).toHaveBeenCalled();
    });
  });

  describe('首屏加载防重复', () => {
    test('onLoad 调用后 _categoriesLoaded 标记为 true', () => {
      page.loadCategories = jest.fn();
      page._categoriesLoaded = false;

      page.onLoad();

      expect(page.loadCategories).toHaveBeenCalledTimes(1);
      expect(page._categoriesLoaded).toBe(true);
    });

    test('onLoad 后紧接着 onShow 不会重复调用 loadCategories', () => {
      page.loadCategories = jest.fn();
      page.checkCanSubmit = jest.fn();
      global.getApp = jest.fn(() => createMockApp(true));
      page._categoriesLoaded = false;

      page.onLoad();
      page.onShow();

      expect(page.loadCategories).toHaveBeenCalledTimes(1);
      expect(page.checkCanSubmit).toHaveBeenCalled();
      expect(page._categoriesLoaded).toBe(true);
    });

    test('多次调用 onShow 不会重复加载分类', () => {
      page.loadCategories = jest.fn();
      page.checkCanSubmit = jest.fn();
      global.getApp = jest.fn(() => createMockApp(true));
      page._categoriesLoaded = false;

      page.onShow();
      expect(page.loadCategories).toHaveBeenCalledTimes(1);
      expect(page._categoriesLoaded).toBe(true);

      page.onShow();
      page.onShow();

      expect(page.loadCategories).toHaveBeenCalledTimes(1);
      expect(page.checkCanSubmit).toHaveBeenCalledTimes(3);
    });

    test('未登录时 onShow 不设置 _categoriesLoaded', () => {
      page.loadCategories = jest.fn();
      page.checkCanSubmit = jest.fn();
      global.getApp = jest.fn(() => createMockApp(false));
      page._categoriesLoaded = false;

      page.onShow();

      expect(page._categoriesLoaded).toBe(false);
      expect(page.loadCategories).not.toHaveBeenCalled();
    });

    test('先未登录后登录时，登录后 onShow 会加载分类', () => {
      page.loadCategories = jest.fn();
      page.checkCanSubmit = jest.fn();
      page._categoriesLoaded = false;

      global.getApp = jest.fn(() => createMockApp(false));
      page.onShow();
      expect(page.loadCategories).not.toHaveBeenCalled();
      expect(page._categoriesLoaded).toBe(false);

      global.getApp = jest.fn(() => createMockApp(true));
      page.onShow();
      expect(page.loadCategories).toHaveBeenCalledTimes(1);
      expect(page._categoriesLoaded).toBe(true);
    });
  });

  describe('goToLogin', () => {
    test('跳转到登录页', () => {
      page.goToLogin();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/login/login' });
    });
  });
});
