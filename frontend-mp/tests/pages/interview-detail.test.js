const api = require('../../utils/api');
const { initStorage, defaultUser, createPageInstance } = require('../helpers');

function createMockApp(loggedIn = true) {
  return {
    globalData: {
      userInfo: loggedIn ? defaultUser : null,
      isLoggedIn: loggedIn,
      baseUrl: 'http://localhost:3000'
    },
    getLoginStatus: jest.fn(() => loggedIn),
    getUserInfo: jest.fn(() => loggedIn ? defaultUser : null),
    checkLogin: jest.fn(() => loggedIn),
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

describe('pages/interview-detail', () => {
  let page;
  let pageDef;

  beforeAll(() => {
    jest.resetModules();
    require('../../pages/interview-detail/interview-detail');
    pageDef = Page.mock.calls[Page.mock.calls.length - 1][0];
  });

  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    global.getApp = jest.fn(() => createMockApp(true));
    page = createPageInstance(pageDef);
  });

  test('初始 data 状态正确', () => {
    expect(page.data.interviewId).toBe('');
    expect(page.data.interview).toBeNull();
    expect(page.data.loading).toBe(true);
    expect(page.data.isLike).toBe(false);
    expect(page.data.likeCount).toBe(0);
  });

  test('页面初始化获取访谈详情', async () => {
    await page.onLoad({ id: 'interview_001' });

    expect(page.data.loading).toBe(false);
    expect(page.data.interview.intervieweeName).toBe('王德福');
    expect(page.data.interview.age).toBe(86);
    expect(page.data.likeCount).toBe(127);
  });

  test('访谈内容解析为对话形式', async () => {
    await page.onLoad({ id: 'interview_001' });

    expect(page.data.contentParagraphs).toBeDefined();
    expect(page.data.contentParagraphs.length).toBeGreaterThan(0);
    
    const firstParagraph = page.data.contentParagraphs[0];
    expect(firstParagraph).toHaveProperty('speaker');
    expect(firstParagraph).toHaveProperty('text');
  });

  test('点赞功能', async () => {
    await page.onLoad({ id: 'interview_001' });

    const beforeLike = page.data.likeCount;
    expect(page.data.isLike).toBe(false);

    await page.doLike();

    expect(page.data.isLike).toBe(true);
    expect(page.data.likeCount).toBe(beforeLike + 1);
  });

  test('取消点赞功能', async () => {
    await page.onLoad({ id: 'interview_001' });

    await page.doLike();
    expect(page.data.isLike).toBe(true);
    const afterLike = page.data.likeCount;

    await page.doUnlike();

    expect(page.data.isLike).toBe(false);
    expect(page.data.likeCount).toBe(afterLike - 1);
  });

  test('访谈不存在时显示错误提示', async () => {
    const toastSpy = jest.spyOn(wx, 'showToast').mockImplementation(() => {});
    
    await page.onLoad({ id: 'nonexistent_id' });

    expect(toastSpy).toHaveBeenCalled();
    expect(page.data.loading).toBe(false);
    toastSpy.mockRestore();
  });

  test('分享功能返回正确配置', () => {
    page.data.interview = {
      id: 'interview_001',
      intervieweeName: '王德福',
      summary: '王德福老人种了一辈子地...'
    };

    const result = page.onShareAppMessage();
    expect(result.title).toBe('王德福 - 口述史访谈录');
    expect(result.path).toBe('/pages/interview-detail/interview-detail?id=interview_001');
  });
});
