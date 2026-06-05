const { initStorage, defaultUser } = require('../helpers');

function createApp() {
  const app = {
    globalData: {
      userInfo: null,
      isLoggedIn: false,
      baseUrl: 'http://localhost:3000'
    },

    checkLoginStatus() {
      const isLoggedIn = wx.getStorageSync('isLoggedIn') || false;
      const userInfo = wx.getStorageSync('userInfo');
      if (isLoggedIn && userInfo) {
        this.globalData.isLoggedIn = true;
        this.globalData.userInfo = userInfo;
      } else {
        this.globalData.isLoggedIn = false;
        this.globalData.userInfo = null;
      }
    },

    login(userInfo) {
      const user = userInfo || {
        id: 'user_' + Date.now(),
        nickname: '乡村文化爱好者',
        avatar: '',
        phone: '',
        createTime: new Date().toISOString().split('T')[0]
      };
      wx.setStorageSync('userInfo', user);
      wx.setStorageSync('isLoggedIn', true);
      this.globalData.userInfo = user;
      this.globalData.isLoggedIn = true;
      return user;
    },

    logout() {
      wx.removeStorageSync('isLoggedIn');
      this.globalData.isLoggedIn = false;
      this.globalData.userInfo = null;
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

    updateUserInfo(userInfo) {
      this.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
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
      const user = app.login(defaultUser);
      expect(app.globalData.isLoggedIn).toBe(true);
      expect(app.globalData.userInfo).toEqual(defaultUser);
      expect(wx.getStorageSync('userInfo')).toEqual(defaultUser);
      expect(wx.getStorageSync('isLoggedIn')).toBe(true);
    });

    test('登录返回用户信息', () => {
      const user = app.login(defaultUser);
      expect(user.id).toBe('user_001');
      expect(user.nickname).toBe('测试用户');
    });

    test('不传参数时使用默认用户信息', () => {
      const user = app.login();
      expect(user.nickname).toBe('乡村文化爱好者');
      expect(user.id).toMatch(/^user_\d+$/);
      expect(app.globalData.isLoggedIn).toBe(true);
    });
  });

  describe('logout', () => {
    test('退出登录后清除 globalData', () => {
      app.login(defaultUser);
      app.logout();
      expect(app.globalData.isLoggedIn).toBe(false);
      expect(app.globalData.userInfo).toBeNull();
    });

    test('退出登录后清除 Storage 中的登录状态', () => {
      app.login(defaultUser);
      app.logout();
      expect(wx.getStorageSync('isLoggedIn')).toBe('');
    });
  });

  describe('checkLoginStatus', () => {
    test('Storage 中有登录信息时恢复状态', () => {
      wx.setStorageSync('isLoggedIn', true);
      wx.setStorageSync('userInfo', defaultUser);
      app.checkLoginStatus();
      expect(app.globalData.isLoggedIn).toBe(true);
      expect(app.globalData.userInfo).toEqual(defaultUser);
    });

    test('Storage 中无登录信息时保持未登录', () => {
      app.checkLoginStatus();
      expect(app.globalData.isLoggedIn).toBe(false);
      expect(app.globalData.userInfo).toBeNull();
    });

    test('Storage 中只有登录状态无用户信息时保持未登录', () => {
      wx.setStorageSync('isLoggedIn', true);
      wx.removeStorageSync('userInfo');
      app.checkLoginStatus();
      expect(app.globalData.isLoggedIn).toBe(false);
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
