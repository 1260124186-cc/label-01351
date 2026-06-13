process.on('unhandledRejection', () => {});
global.wx = {
  _storage: {},
  _resetStorage() { Object.keys(this._storage).forEach(k => delete this._storage[k]); },
  getStorageInfoSync() { return { keys: Object.keys(this._storage) }; },
  getStorageSync(k) { return this._storage[k] !== undefined ? this._storage[k] : ''; },
  setStorageSync(k, v) { this._storage[k] = v; },
  removeStorageSync(k) { delete this._storage[k]; },
  clearStorageSync() { this._resetStorage(); },
  showToast: () => {}, showLoading: () => {}, hideLoading: () => {}, showModal: () => {},
  showActionSheet: () => {}, navigateTo: () => {}, redirectTo: () => {},
  switchTab: () => {}, navigateBack: () => {}, setNavigationBarTitle: () => {},
  stopPullDownRefresh: () => {}, request: () => {}, login: () => {}
};

global.getApp = () => ({
  globalData: { userInfo: null, isLoggedIn: false, token: null, baseUrl: 'http://localhost:3000' },
  login(userInfo) { this.globalData.userInfo = userInfo; this.globalData.isLoggedIn = true; const token = 'mock_'+Date.now(); this.globalData.token = token; wx.setStorageSync('userInfo', userInfo); wx.setStorageSync('isLoggedIn', true); wx.setStorageSync('token', token); return { ...userInfo, token }; },
  logout() { wx.removeStorageSync('isLoggedIn'); wx.removeStorageSync('userInfo'); wx.removeStorageSync('token'); this.globalData.isLoggedIn = false; this.globalData.userInfo = null; this.globalData.token = null; },
  getLoginStatus() { return this.globalData.isLoggedIn; },
  getUserInfo() { return this.globalData.userInfo; },
  checkLogin() { return !!this.globalData.isLoggedIn; },
  checkLoginStatus() { const isLoggedIn = wx.getStorageSync('isLoggedIn') || false; const u = wx.getStorageSync('userInfo'); const t = wx.getStorageSync('token'); if (isLoggedIn && u && t) { this.globalData.isLoggedIn = true; this.globalData.userInfo = u; this.globalData.token = t; } },
});

const api = require('./frontend-mp/utils/api');
console.log('Total exported methods:', Object.keys(api).length);
const msgKeys = Object.keys(api).filter(k =>
  k.toLowerCase().includes('message') || k.toLowerCase().includes('conversation') || k.toLowerCase().includes('send') || k.toLowerCase().includes('block') || k.toLowerCase().includes('report')
);
console.log('Chat-related exported keys:\n  ' + msgKeys.join('\n  '));
console.log('api.sendMessage =', typeof api.sendMessage);
console.log('api.storageApi.sendMessage =', typeof (api.storageApi && api.storageApi.sendMessage));
