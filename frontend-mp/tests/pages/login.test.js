const { createPageInstance, initStorage, defaultUser } = require('../helpers');

function createMockApp() {
  return {
    globalData: {
      userInfo: null,
      isLoggedIn: false,
      baseUrl: 'http://localhost:3000'
    },
    login(userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLoggedIn = true;
      wx.setStorageSync('userInfo', userInfo);
      wx.setStorageSync('isLoggedIn', true);
      return userInfo;
    }
  };
}

describe('Login 登录页', () => {
  let page;
  let loginPage;

  beforeAll(() => {
    jest.resetModules();
    require('../../pages/login/login');
    loginPage = Page.mock.calls[Page.mock.calls.length - 1][0];
  });

  beforeEach(() => {
    initStorage();
    global.getApp = jest.fn(() => createMockApp());
    page = createPageInstance(loginPage);
  });

  test('初始 data 状态正确', () => {
    expect(page.data.nickname).toBe('');
    expect(page.data.canLogin).toBe(false);
  });

  describe('onNicknameInput', () => {
    test('更新昵称并设置 canLogin', () => {
      page.onNicknameInput({ detail: { value: '测试' } });
      expect(page.data.nickname).toBe('测试');
      expect(page.data.canLogin).toBe(true);
    });

    test('昵称不足2字时 canLogin 为 false', () => {
      page.onNicknameInput({ detail: { value: '一' } });
      expect(page.data.canLogin).toBe(false);
    });

    test('空白昵称 canLogin 为 false', () => {
      page.onNicknameInput({ detail: { value: '   ' } });
      expect(page.data.canLogin).toBe(false);
    });

    test('2字昵称 canLogin 为 true', () => {
      page.onNicknameInput({ detail: { value: '两字' } });
      expect(page.data.canLogin).toBe(true);
    });
  });

  describe('onLogin', () => {
    test('canLogin 为 false 时不执行登录', () => {
      page.data.canLogin = false;
      page.onLogin();
      expect(wx.showToast).not.toHaveBeenCalled();
    });

    test('canLogin 为 true 时执行登录', () => {
      page.data.nickname = '测试用户';
      page.data.canLogin = true;
      page.onLogin();

      expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '登录成功' }));
    });

    test('登录成功后延迟返回上一页', () => {
      jest.useFakeTimers();
      page.data.nickname = '测试用户';
      page.data.canLogin = true;
      page.onLogin();

      expect(wx.navigateBack).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1000);
      expect(wx.navigateBack).toHaveBeenCalled();
      jest.useRealTimers();
    });

    test('登录后 globalData 已更新', () => {
      const mockApp = createMockApp();
      global.getApp = jest.fn(() => mockApp);

      page.data.nickname = '测试用户';
      page.data.canLogin = true;
      page.onLogin();

      expect(mockApp.globalData.isLoggedIn).toBe(true);
      expect(mockApp.globalData.userInfo.nickname).toBe('测试用户');
    });

    test('用户 ID 格式为 "user_时间戳"', () => {
      const mockApp = createMockApp();
      global.getApp = jest.fn(() => mockApp);

      page.data.nickname = '测试用户';
      page.data.canLogin = true;
      page.onLogin();

      expect(mockApp.globalData.userInfo.id).toMatch(/^user_\d+$/);
    });

    test('用户昵称自动 trim', () => {
      const mockApp = createMockApp();
      global.getApp = jest.fn(() => mockApp);

      page.data.nickname = '  带空格用户  ';
      page.data.canLogin = true;
      page.onLogin();

      expect(mockApp.globalData.userInfo.nickname).toBe('带空格用户');
    });
  });
});
