const { createPageInstance, initStorage, defaultUser } = require('../helpers');

function createMockApp() {
  return {
    globalData: {
      userInfo: null,
      isLoggedIn: false,
      token: null,
      baseUrl: 'http://localhost:3000'
    },
    login(userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLoggedIn = true;
      const token = 'mock_token_' + Date.now();
      this.globalData.token = token;
      wx.setStorageSync('userInfo', userInfo);
      wx.setStorageSync('isLoggedIn', true);
      wx.setStorageSync('token', token);
      return { ...userInfo, token };
    },
    logout() {
      wx.removeStorageSync('isLoggedIn');
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('token');
      this.globalData.isLoggedIn = false;
      this.globalData.userInfo = null;
      this.globalData.token = null;
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
    expect(page.data.loginMode).toBe('wechat');
    expect(page.data.nickname).toBe('');
    expect(page.data.canLogin).toBe(false);
    expect(page.data.wechatLoading).toBe(false);
    expect(page.data.wechatStep).toBe('idle');
    expect(page.data.wechatAvatar).toBe('');
    expect(page.data.wechatNickname).toBe('');
  });

  describe('模式切换', () => {
    test('switchToNickname 切换到昵称模式', () => {
      page.switchToNickname();
      expect(page.data.loginMode).toBe('nickname');
    });

    test('switchToWechat 切换到微信模式', () => {
      page.setData({ loginMode: 'nickname' });
      page.switchToWechat();
      expect(page.data.loginMode).toBe('wechat');
    });
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

  describe('onNicknameLogin', () => {
    test('canLogin 为 false 时不执行登录', () => {
      page.data.canLogin = false;
      page.onNicknameLogin();
      expect(wx.showToast).not.toHaveBeenCalled();
    });

    test('canLogin 为 true 时执行昵称登录', () => {
      const mockApp = createMockApp();
      global.getApp = jest.fn(() => mockApp);

      page.data.nickname = '测试用户';
      page.data.canLogin = true;
      page.onNicknameLogin();

      expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '登录成功' }));
    });

    test('昵称登录 loginType 为 nickname', () => {
      const mockApp = createMockApp();
      global.getApp = jest.fn(() => mockApp);

      page.data.nickname = '测试用户';
      page.data.canLogin = true;
      page.onNicknameLogin();

      expect(mockApp.globalData.userInfo.loginType).toBe('nickname');
    });

    test('昵称登录 openid 为空', () => {
      const mockApp = createMockApp();
      global.getApp = jest.fn(() => mockApp);

      page.data.nickname = '测试用户';
      page.data.canLogin = true;
      page.onNicknameLogin();

      expect(mockApp.globalData.userInfo.openid).toBe('');
    });

    test('昵称登录后 token 已生成', () => {
      const mockApp = createMockApp();
      global.getApp = jest.fn(() => mockApp);

      page.data.nickname = '测试用户';
      page.data.canLogin = true;
      page.onNicknameLogin();

      expect(mockApp.globalData.token).toBeTruthy();
      expect(wx.getStorageSync('token')).toBeTruthy();
    });

    test('登录成功后延迟返回上一页', () => {
      jest.useFakeTimers();
      const mockApp = createMockApp();
      global.getApp = jest.fn(() => mockApp);

      page.data.nickname = '测试用户';
      page.data.canLogin = true;
      page.onNicknameLogin();

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
      page.onNicknameLogin();

      expect(mockApp.globalData.isLoggedIn).toBe(true);
      expect(mockApp.globalData.userInfo.nickname).toBe('测试用户');
    });

    test('用户昵称自动 trim', () => {
      const mockApp = createMockApp();
      global.getApp = jest.fn(() => mockApp);

      page.data.nickname = '  带空格用户  ';
      page.data.canLogin = true;
      page.onNicknameLogin();

      expect(mockApp.globalData.userInfo.nickname).toBe('带空格用户');
    });
  });

  describe('微信登录', () => {
    test('onWechatLogin 在 loading 时不重复执行', async () => {
      page.data.wechatLoading = true;
      await page.onWechatLogin();
      expect(page.data.wechatStep).toBe('idle');
    });

    test('wxLogin 返回 mock code', async () => {
      const result = await page.wxLogin();
      expect(result.code).toBeTruthy();
    });

    test('onChooseAvatar 更新头像', () => {
      page.onChooseAvatar({ detail: { avatarUrl: 'https://example.com/avatar.png' } });
      expect(page.data.wechatAvatar).toBe('https://example.com/avatar.png');
    });

    test('onChooseAvatar 处理空头像', () => {
      page.onChooseAvatar({ detail: {} });
      expect(page.data.wechatAvatar).toBe('');
    });

    test('onWechatNicknameInput 更新微信昵称', () => {
      page.onWechatNicknameInput({ detail: { value: '微信昵称' } });
      expect(page.data.wechatNickname).toBe('微信昵称');
    });

    test('微信登录成功后 loginType 为 wechat', async () => {
      const mockApp = createMockApp();
      global.getApp = jest.fn(() => mockApp);

      page.data.wechatLoading = false;
      await page.onWechatLogin();

      expect(mockApp.globalData.userInfo.loginType).toBe('wechat');
    });

    test('微信登录成功后 openid 已填充', async () => {
      const mockApp = createMockApp();
      global.getApp = jest.fn(() => mockApp);

      page.data.wechatLoading = false;
      await page.onWechatLogin();

      expect(mockApp.globalData.userInfo.openid).toBeTruthy();
      expect(mockApp.globalData.userInfo.openid).toContain('mock_openid_');
    });

    test('微信登录成功后 token 已生成', async () => {
      const mockApp = createMockApp();
      global.getApp = jest.fn(() => mockApp);

      page.data.wechatLoading = false;
      await page.onWechatLogin();

      expect(mockApp.globalData.token).toBeTruthy();
    });
  });

  describe('退出登录清除 token', () => {
    test('logout 清除 token 和用户信息', () => {
      const mockApp = createMockApp();
      mockApp.login({ id: 'user_1', nickname: '测试', loginType: 'nickname' });
      global.getApp = jest.fn(() => mockApp);

      expect(mockApp.globalData.token).toBeTruthy();
      expect(wx.getStorageSync('token')).toBeTruthy();

      mockApp.logout();

      expect(mockApp.globalData.isLoggedIn).toBe(false);
      expect(mockApp.globalData.userInfo).toBeNull();
      expect(mockApp.globalData.token).toBeNull();
      expect(wx.getStorageSync('token')).toBe('');
    });
  });
});
