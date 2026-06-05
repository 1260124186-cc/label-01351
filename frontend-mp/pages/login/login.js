// pages/login/login.js
Page({
  data: {
    nickname: '',
    canLogin: false
  },

  onNicknameInput(e) {
    const nickname = e.detail.value;
    this.setData({
      nickname,
      canLogin: nickname.trim().length >= 2
    });
  },

  onLogin() {
    if (!this.data.canLogin) return;
    
    const app = getApp();
    const userInfo = {
      id: 'user_' + Date.now(),
      nickname: this.data.nickname.trim(),
      avatar: '',
      phone: '',
      createTime: new Date().toISOString().split('T')[0]
    };
    
    app.login(userInfo);
    
    wx.showToast({
      title: '登录成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  }
});
