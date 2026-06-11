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
    expect(page.data.formData).toEqual({ title: '', category: '', summary: '', content: '', figureId: '', tags: [] });
    expect(page.data.suggestedTags).toBeDefined();
    expect(page.data.tagInput).toBe('');
    expect(page.data.showTagInput).toBe(false);
    expect(page.data.showPreview).toBe(false);
    expect(page.data.previewData).toBeNull();
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
      page.data.formData = { title: '旧标题', category: 'folklore', summary: '旧摘要', content: '旧内容', figureId: 'figure_001', tags: ['端午节'] };
      page.continuePublish();
      expect(page.data.showSuccess).toBe(false);
      expect(page.data.formData).toEqual({ title: '', category: '', summary: '', content: '', figureId: '', tags: [] });
      expect(page.data.canSubmit).toBe(false);
    });
  });

  describe('onSummaryInput', () => {
    test('更新摘要内容', () => {
      page.onSummaryInput({ detail: { value: '测试摘要内容' } });
      expect(page.data.formData.summary).toBe('测试摘要内容');
    });
  });

  describe('标签系统', () => {
    test('toggleSuggestedTag 添加推荐标签', () => {
      page.data.formData.tags = [];
      page.toggleSuggestedTag({ currentTarget: { dataset: { tag: '端午节' } } });
      expect(page.data.formData.tags).toContain('端午节');
    });

    test('toggleSuggestedTag 超过3个时不添加', () => {
      page.data.formData.tags = ['标签1', '标签2', '标签3'];
      page.toggleSuggestedTag({ currentTarget: { dataset: { tag: '端午节' } } });
      expect(page.data.formData.tags.length).toBe(3);
      expect(page.data.formData.tags).not.toContain('端午节');
    });

    test('toggleSuggestedTag 移除已选标签', () => {
      page.data.formData.tags = ['端午节', '织布'];
      page.toggleSuggestedTag({ currentTarget: { dataset: { tag: '端午节' } } });
      expect(page.data.formData.tags).not.toContain('端午节');
      expect(page.data.formData.tags).toContain('织布');
    });

    test('addCustomTag 添加自定义标签', () => {
      page.data.formData.tags = [];
      page.data.tagInput = '我的标签';
      page.addCustomTag();
      expect(page.data.formData.tags).toContain('我的标签');
      expect(page.data.tagInput).toBe('');
      expect(page.data.showTagInput).toBe(false);
    });

    test('addCustomTag 空标签不添加', () => {
      page.data.formData.tags = [];
      page.data.tagInput = '';
      page.addCustomTag();
      expect(page.data.formData.tags.length).toBe(0);
    });

    test('removeTag 删除指定标签', () => {
      page.data.formData.tags = ['端午节', '织布', '刺绣'];
      page.removeTag({ currentTarget: { dataset: { tag: '织布' } } });
      expect(page.data.formData.tags).toEqual(['端午节', '刺绣']);
    });
  });

  describe('onSubmit 扩展验证', () => {
    test('摘要超过50字时提示', async () => {
      page.data.formData = {
        title: '标题文字',
        category: 'folklore',
        summary: 'a'.repeat(51),
        content: '内容超过十个字符的内容',
        tags: []
      };
      await page.onSubmit();
      expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({
        title: expect.stringContaining('50')
      }));
    });

    test('标签超过3个时提示', async () => {
      page.data.formData = {
        title: '标题文字',
        category: 'folklore',
        summary: '',
        content: '内容超过十个字符的内容',
        tags: ['标签1', '标签2', '标签3', '标签4']
      };
      await page.onSubmit();
      expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({
        title: expect.stringContaining('3个')
      }));
    });

    test('命中敏感词时弹窗提示', async () => {
      page.data.formData = {
        title: '测试标题',
        category: 'folklore',
        summary: '',
        content: '这是包含虚假宣传的内容',
        tags: []
      };
      await page.onSubmit();
      expect(wx.showModal).toHaveBeenCalledWith(expect.objectContaining({
        title: expect.stringContaining('敏感')
      }));
    });
  });

  describe('投稿预览', () => {
    test('onPreview 生成预览数据并打开弹窗', () => {
      page.data.formData = {
        title: '测试预览标题',
        category: 'folklore',
        summary: '自定义摘要内容',
        content: '这是正文内容，长度超过十个字符',
        tags: ['端午节', '织布']
      };
      page.checkCanSubmit();
      page.onPreview();
      expect(page.data.showPreview).toBe(true);
      expect(page.data.previewData).not.toBeNull();
      expect(page.data.previewData.title).toBe('测试预览标题');
      expect(page.data.previewData.tags).toEqual(['端午节', '织布']);
    });

    test('未填写摘要时自动生成', () => {
      page.data.formData = {
        title: '测试预览标题',
        category: 'folklore',
        summary: '',
        content: 'a'.repeat(150),
        tags: []
      };
      page.checkCanSubmit();
      page.onPreview();
      expect(page.data.previewData).not.toBeNull();
      expect(page.data.previewData.summary).toBeTruthy();
      expect(page.data.previewData.summary.length).toBeLessThanOrEqual(103);
    });

    test('closePreview 关闭预览弹窗', () => {
      page.data.showPreview = true;
      page.data.previewData = { title: 'test' };
      page.closePreview();
      expect(page.data.showPreview).toBe(false);
    });
  });

  describe('onShow 初始化标签', () => {
    test('onLoad 初始化 suggestedTags', () => {
      expect(page.data.suggestedTags).toBeDefined();
      expect(Array.isArray(page.data.suggestedTags)).toBe(true);
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
