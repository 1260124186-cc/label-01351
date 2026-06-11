// pages/login/login.js
Page({
  data: {
    loginMode: 'wechat',
    nickname: '',
    canLogin: false,
    wechatLoading: false,
    wechatAvatar: '',
    wechatNickname: '',
    wechatStep: 'idle'
  },

  onNicknameInput(e) {
    const nickname = e.detail.value;
    this.setData({
      nickname,
      canLogin: nickname.trim().length >= 2
    });
  },

  switchToNickname() {
    this.setData({ loginMode: 'nickname' });
  },

  switchToWechat() {
    this.setData({ loginMode: 'wechat' });
  },

  async onWechatLogin() {
    if (this.data.wechatLoading) return;
    this.setData({ wechatLoading: true, wechatStep: 'logging' });

    try {
      const loginRes = await this.wxLogin();
      if (!loginRes.code) {
        this.setData({ wechatLoading: false, wechatStep: 'idle' });
        wx.showToast({ title: '微信登录失败', icon: 'none' });
        return;
      }

      this.setData({ wechatStep: 'profile' });

      const userInfo = {
        id: 'wx_' + Date.now(),
        openid: 'mock_openid_' + loginRes.code,
        nickname: this.data.wechatNickname || '微信用户',
        avatar: this.data.wechatAvatar || '',
        phone: '',
        loginType: 'wechat',
        createTime: new Date().toISOString().split('T')[0],
        role: 'user'
      };

      const app = getApp();
      const result = app.login(userInfo);

      if (result.token) {
        this.setData({ wechatLoading: false, wechatStep: 'done' });
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => { wx.navigateBack(); }, 1000);
      } else {
        this.setData({ wechatLoading: false, wechatStep: 'idle' });
        wx.showToast({ title: '登录失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[Login] 微信登录异常:', error);
      this.setData({ wechatLoading: false, wechatStep: 'idle' });
      wx.showToast({ title: '登录异常', icon: 'none' });
    }
  },

  wxLogin() {
    return new Promise((resolve) => {
      if (typeof wx !== 'undefined' && wx.login) {
        wx.login({
          success: (res) => {
            resolve({ code: res.code });
          },
          fail: () => {
            resolve({ code: 'mock_code_' + Date.now() });
          }
        });
      } else {
        resolve({ code: 'mock_code_' + Date.now() });
      }
    });
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl || '';
    this.setData({ wechatAvatar: avatarUrl });
  },

  onWechatNicknameInput(e) {
    this.setData({ wechatNickname: e.detail.value });
  },

  onNicknameLogin() {
    if (!this.data.canLogin) return;

    const app = getApp();
    const userInfo = {
      id: 'user_' + Date.now(),
      openid: '',
      nickname: this.data.nickname.trim(),
      avatar: '',
      phone: '',
      loginType: 'nickname',
      createTime: new Date().toISOString().split('T')[0],
      role: 'user'
    };

    const result = app.login(userInfo);

    if (result.token) {
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => { wx.navigateBack(); }, 1000);
    } else {
      wx.showToast({ title: '登录失败', icon: 'none' });
    }
  }
});
