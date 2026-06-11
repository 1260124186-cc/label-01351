const storage = {};

const wx = {
  _storage: storage,
  _resetStorage() {
    Object.keys(storage).forEach(key => delete storage[key]);
  },

  getStorageSync(key) {
    return storage[key] !== undefined ? storage[key] : '';
  },

  setStorageSync(key, value) {
    storage[key] = value;
  },

  removeStorageSync(key) {
    delete storage[key];
  },

  clearStorageSync() {
    Object.keys(storage).forEach(key => delete storage[key]);
  },

  showToast: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showModal: jest.fn(),
  showActionSheet: jest.fn(),

  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  switchTab: jest.fn(),
  navigateBack: jest.fn(),

  setNavigationBarTitle: jest.fn(),
  stopPullDownRefresh: jest.fn(),

  request: jest.fn(),

  login: jest.fn(({ success }) => {
    if (success) {
      success({ code: 'mock_wx_code_123' });
    }
  })
};

global.wx = wx;

global.getApp = jest.fn(() => ({
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
  },
  getLoginStatus() {
    return this.globalData.isLoggedIn;
  },
  getUserInfo() {
    return this.globalData.userInfo;
  },
  getToken() {
    return this.globalData.token;
  },
  checkLogin() {
    if (!this.globalData.isLoggedIn) {
      wx.navigateTo({ url: '/pages/login/login' });
      return false;
    }
    return true;
  },
  updateUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  },
  checkLoginStatus() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn') || false;
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    if (isLoggedIn && userInfo && token) {
      this.globalData.isLoggedIn = true;
      this.globalData.userInfo = userInfo;
      this.globalData.token = token;
    }
  }
}));

global.Page = jest.fn((options) => options);
global.App = jest.fn((options) => options);
global.Behavior = jest.fn((options) => options);
