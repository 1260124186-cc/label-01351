const api = require('../utils/api');

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
};

global.wx = wx;

global.getApp = jest.fn(() => ({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    baseUrl: 'http://localhost:3000',
    useRemote: false
  },
  login(userInfo) {
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = true;
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('isLoggedIn', true);
    return userInfo;
  },
  logout() {
    wx.removeStorageSync('isLoggedIn');
    wx.removeStorageSync('userInfo');
    this.globalData.isLoggedIn = false;
    this.globalData.userInfo = null;
  },
  getLoginStatus() {
    return this.globalData.isLoggedIn;
  },
  getUserInfo() {
    return this.globalData.userInfo;
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
    if (isLoggedIn && userInfo) {
      this.globalData.isLoggedIn = true;
      this.globalData.userInfo = userInfo;
    }
  },
  initApiConfig() {
    api.setConfig({
      useRemote: this.globalData.useRemote,
      baseUrl: this.globalData.baseUrl
    });
  },
  switchDataSource(useRemote) {
    this.globalData.useRemote = useRemote;
    api.setConfig({ useRemote, baseUrl: this.globalData.baseUrl });
  },
  setBaseUrl(baseUrl) {
    this.globalData.baseUrl = baseUrl;
    api.setConfig({ baseUrl });
  }
}));

global.Page = jest.fn((options) => options);
global.App = jest.fn((options) => options);

beforeEach(() => {
  wx._resetStorage();
  jest.clearAllMocks();
  api.setConfig({
    useRemote: false,
    baseUrl: 'http://localhost:3000',
    timeout: 10000
  });
});
