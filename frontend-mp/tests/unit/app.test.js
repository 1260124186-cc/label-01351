const { initStorage, defaultUser } = require('../helpers');
const util = require('../../utils/util');

const generateToken = (userId) => {
  return util.generateToken(userId);
};

function createApp() {
  const app = {
    globalData: {
      userInfo: null,
      isLoggedIn: false,
      token: null,
      baseUrl: 'http://localhost:3000',
      useRemote: false
    },

    checkLoginStatus() {
      const isLoggedIn = wx.getStorageSync('isLoggedIn') || false;
      const userInfo = wx.getStorageSync('userInfo');
      const token = wx.getStorageSync('token');

      if (isLoggedIn && userInfo && token) {
        const normalizedUserInfo = {
          ...userInfo,
          openid: userInfo.openid || '',
          loginType: userInfo.loginType || 'nickname',
          role: userInfo.role === 'admin' ? 'admin' : 'user'
        };
        this.globalData.isLoggedIn = true;
        this.globalData.userInfo = normalizedUserInfo;
        this.globalData.token = token;
        try { wx.setStorageSync('userInfo', normalizedUserInfo); } catch (e) {}
      } else {
        this.globalData.isLoggedIn = false;
        this.globalData.userInfo = null;
        this.globalData.token = null;
        wx.removeStorageSync('isLoggedIn');
        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo');
      }
    },

    login(userInfo) {
      const user = userInfo || {
        id: 'user_' + Date.now(),
        openid: '',
        nickname: '乡村文化爱好者',
        avatar: '',
        phone: '',
        loginType: 'nickname',
        createTime: new Date().toISOString().split('T')[0],
        role: 'user'
      };

      if (!user.role) user.role = 'user';
      if (!user.openid) user.openid = '';
      if (!user.loginType) user.loginType = 'nickname';

      const token = generateToken(user.id);

      wx.setStorageSync('userInfo', user);
      wx.setStorageSync('isLoggedIn', true);
      wx.setStorageSync('token', token);
      this.globalData.userInfo = user;
      this.globalData.isLoggedIn = true;
      this.globalData.token = token;

      return { ...user, token };
    },

    logout() {
      wx.removeStorageSync('isLoggedIn');
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('token');
      this.globalData.isLoggedIn = false;
      this.globalData.userInfo = null;
      this.globalData.token = null;
    },

    checkLogin() {
      if (!this.globalData.isLoggedIn) {
        wx.navigateTo({ url: '/pages/login/login' });
        return false;
      }
      return true;
    },

    getUserInfo() {
      return this.globalData.userInfo;
    },

    getLoginStatus() {
      return this.globalData.isLoggedIn;
    },

    getToken() {
      return this.globalData.token;
    },

    updateUserInfo(userInfo) {
      this.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
    },

    isAdmin() {
      const userInfo = this.globalData.userInfo || wx.getStorageSync('userInfo');
      return !!(userInfo && userInfo.role === 'admin');
    },

    getUserRole() {
      const userInfo = this.globalData.userInfo || wx.getStorageSync('userInfo');
      if (!userInfo) return 'guest';
      return userInfo.role === 'admin' ? 'admin' : 'user';
    },

    initMockData() {
      const articles = wx.getStorageSync('articles');
      if (!articles || articles.length === 0) {
        wx.setStorageSync('articles', []);
      }
      const categories = wx.getStorageSync('categories');
      if (!categories || categories.length === 0) {
        wx.setStorageSync('categories', []);
      }
    }
  };
  return app;
}

describe('App - 全局状态管理', () => {
  let app;

  beforeEach(() => {
    initStorage();
    app = createApp();
  });

  describe('login', () => {
    test('登录后更新 globalData 和 Storage', () => {
      const result = app.login(defaultUser);
      expect(app.globalData.isLoggedIn).toBe(true);
      expect(app.globalData.userInfo).toEqual(defaultUser);
      expect(app.globalData.token).toBeTruthy();
      expect(wx.getStorageSync('userInfo')).toEqual(defaultUser);
      expect(wx.getStorageSync('isLoggedIn')).toBe(true);
      expect(wx.getStorageSync('token')).toBeTruthy();
    });

    test('登录返回用户信息和token', () => {
      const result = app.login(defaultUser);
      expect(result.id).toBe('user_001');
      expect(result.nickname).toBe('测试用户');
      expect(result.token).toBeTruthy();
    });

    test('不传参数时使用默认用户信息', () => {
      const result = app.login();
      expect(result.nickname).toBe('乡村文化爱好者');
      expect(result.id).toMatch(/^user_\d+$/);
      expect(result.token).toBeTruthy();
      expect(app.globalData.isLoggedIn).toBe(true);
    });

    test('登录后生成有效的 token', () => {
      const result = app.login(defaultUser);
      expect(result.token).toMatch(/^[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/);
      expect(app.globalData.token).toBe(result.token);
      expect(wx.getStorageSync('token')).toBe(result.token);
    });

    test('登录时自动补全缺失字段', () => {
      const partialUser = { id: 'test_001', nickname: '测试' };
      const result = app.login(partialUser);
      expect(result.openid).toBe('');
      expect(result.loginType).toBe('nickname');
      expect(result.role).toBe('user');
    });
  });

  describe('logout', () => {
    test('退出登录后清除 globalData', () => {
      app.login(defaultUser);
      app.logout();
      expect(app.globalData.isLoggedIn).toBe(false);
      expect(app.globalData.userInfo).toBeNull();
      expect(app.globalData.token).toBeNull();
    });

    test('退出登录后清除 Storage 中的登录状态和用户信息', () => {
      app.login(defaultUser);
      app.logout();
      expect(wx.getStorageSync('isLoggedIn')).toBe('');
      expect(wx.getStorageSync('userInfo')).toBe('');
      expect(wx.getStorageSync('token')).toBe('');
    });
  });

  describe('checkLoginStatus', () => {
    test('Storage 中有完整登录信息时恢复状态', () => {
      const token = 'test_token_123';
      wx.setStorageSync('isLoggedIn', true);
      wx.setStorageSync('userInfo', defaultUser);
      wx.setStorageSync('token', token);
      app.checkLoginStatus();
      expect(app.globalData.isLoggedIn).toBe(true);
      expect(app.globalData.userInfo).toEqual(expect.objectContaining(defaultUser));
      expect(app.globalData.token).toBe(token);
    });

    test('Storage 中无登录信息时保持未登录', () => {
      app.checkLoginStatus();
      expect(app.globalData.isLoggedIn).toBe(false);
      expect(app.globalData.userInfo).toBeNull();
      expect(app.globalData.token).toBeNull();
    });

    test('Storage 中只有登录状态无用户信息时清除所有登录信息', () => {
      wx.setStorageSync('isLoggedIn', true);
      wx.setStorageSync('token', 'some_token');
      wx.removeStorageSync('userInfo');
      app.checkLoginStatus();
      expect(app.globalData.isLoggedIn).toBe(false);
      expect(app.globalData.userInfo).toBeNull();
      expect(app.globalData.token).toBeNull();
      expect(wx.getStorageSync('isLoggedIn')).toBe('');
      expect(wx.getStorageSync('token')).toBe('');
    });

    test('Storage 中有登录状态和用户信息但无token时清除所有登录信息', () => {
      wx.setStorageSync('isLoggedIn', true);
      wx.setStorageSync('userInfo', defaultUser);
      wx.removeStorageSync('token');
      app.checkLoginStatus();
      expect(app.globalData.isLoggedIn).toBe(false);
      expect(app.globalData.userInfo).toBeNull();
      expect(app.globalData.token).toBeNull();
      expect(wx.getStorageSync('isLoggedIn')).toBe('');
      expect(wx.getStorageSync('userInfo')).toBe('');
    });

    test('登录信息不完整时清除不一致的状态', () => {
      wx.setStorageSync('isLoggedIn', true);
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('token');
      app.checkLoginStatus();
      expect(app.globalData.isLoggedIn).toBe(false);
      expect(wx.getStorageSync('isLoggedIn')).toBe('');
      expect(wx.getStorageSync('userInfo')).toBe('');
      expect(wx.getStorageSync('token')).toBe('');
    });

    test('恢复登录状态时自动补全用户信息字段', () => {
      const token = 'test_token';
      const partialUser = { id: 'user_001', nickname: '测试用户' };
      wx.setStorageSync('isLoggedIn', true);
      wx.setStorageSync('userInfo', partialUser);
      wx.setStorageSync('token', token);
      app.checkLoginStatus();
      expect(app.globalData.userInfo.openid).toBe('');
      expect(app.globalData.userInfo.loginType).toBe('nickname');
      expect(app.globalData.userInfo.role).toBe('user');
    });

    test('admin 角色用户登录状态恢复', () => {
      const token = 'test_token';
      const adminUser = { ...defaultUser, role: 'admin' };
      wx.setStorageSync('isLoggedIn', true);
      wx.setStorageSync('userInfo', adminUser);
      wx.setStorageSync('token', token);
      app.checkLoginStatus();
      expect(app.globalData.userInfo.role).toBe('admin');
      expect(app.isAdmin()).toBe(true);
    });
  });

  describe('checkLogin', () => {
    test('已登录时返回 true', () => {
      app.login(defaultUser);
      expect(app.checkLogin()).toBe(true);
      expect(wx.navigateTo).not.toHaveBeenCalled();
    });

    test('未登录时跳转登录页并返回 false', () => {
      expect(app.checkLogin()).toBe(false);
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/login/login' });
    });
  });

  describe('getUserInfo / getLoginStatus', () => {
    test('未登录时 getUserInfo 返回 null', () => {
      expect(app.getUserInfo()).toBeNull();
    });

    test('未登录时 getLoginStatus 返回 false', () => {
      expect(app.getLoginStatus()).toBe(false);
    });

    test('登录后 getUserInfo 返回用户信息', () => {
      app.login(defaultUser);
      expect(app.getUserInfo()).toEqual(defaultUser);
    });

    test('登录后 getLoginStatus 返回 true', () => {
      app.login(defaultUser);
      expect(app.getLoginStatus()).toBe(true);
    });
  });

  describe('updateUserInfo', () => {
    test('更新 globalData 和 Storage 中的用户信息', () => {
      app.login(defaultUser);
      const updated = { ...defaultUser, nickname: '新昵称' };
      app.updateUserInfo(updated);
      expect(app.globalData.userInfo.nickname).toBe('新昵称');
      expect(wx.getStorageSync('userInfo').nickname).toBe('新昵称');
    });
  });
});
