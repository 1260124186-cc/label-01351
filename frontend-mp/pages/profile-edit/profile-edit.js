// pages/profile-edit/profile-edit.js

const api = require('../../utils/api');

Page({
  data: {
    nickname: '',
    signature: '',
    location: '',
    avatarUrl: '',
    nicknameFirstChar: '',
    nicknameFocus: false,
    locationFocus: false,
    canSave: false,
    saving: false,
    originalNickname: '',
    originalSignature: '',
    originalLocation: '',
    originalAvatarUrl: ''
  },

  onLoad() {
    const app = getApp();
    const userInfo = app.getUserInfo() || {};
    this.setData({
      nickname: userInfo.nickname || '',
      signature: userInfo.signature || '',
      location: userInfo.location || '',
      avatarUrl: userInfo.avatar || '',
      nicknameFirstChar: (userInfo.nickname || '用')[0],
      originalNickname: userInfo.nickname || '',
      originalSignature: userInfo.signature || '',
      originalLocation: userInfo.location || '',
      originalAvatarUrl: userInfo.avatar || ''
    });
  },

  onChooseAvatar() {
    const self = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        self.setData({
          avatarUrl: tempFilePath,
          nicknameFirstChar: (self.data.nickname || '用')[0]
        });
        self._checkCanSave();
      }
    });
  },

  onNicknameInput(e) {
    const nickname = e.detail.value;
    this.setData({
      nickname,
      nicknameFirstChar: (nickname || '用')[0]
    });
    this._checkCanSave();
  },

  onNicknameBlur() {
    this.setData({ nicknameFocus: false });
  },

  onFocusNickname() {
    this.setData({ nicknameFocus: true });
  },

  onSignatureInput(e) {
    this.setData({ signature: e.detail.value });
    this._checkCanSave();
  },

  onLocationInput(e) {
    this.setData({ location: e.detail.value });
    this._checkCanSave();
  },

  onFocusLocation() {
    this.setData({ locationFocus: true });
  },

  _checkCanSave() {
    const { nickname, signature, location, avatarUrl, originalNickname, originalSignature, originalLocation, originalAvatarUrl } = this.data;
    const nicknameValid = nickname.trim().length >= 2 && nickname.trim().length <= 20;
    const signatureValid = signature.length <= 100;
    const locationValid = location.length <= 30;
    const hasChange = nickname !== originalNickname || signature !== originalSignature || location !== originalLocation || avatarUrl !== originalAvatarUrl;
    this.setData({
      canSave: nicknameValid && signatureValid && locationValid && hasChange
    });
  },

  async onSave() {
    const { nickname, signature, location, avatarUrl, saving } = this.data;
    if (saving) return;

    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
      wx.showToast({ title: '昵称需要2-20个字符', icon: 'none' });
      return;
    }
    if (signature.length > 100) {
      wx.showToast({ title: '个性签名不能超过100字', icon: 'none' });
      return;
    }
    if (location.length > 30) {
      wx.showToast({ title: '地区不能超过30字', icon: 'none' });
      return;
    }

    this.setData({ saving: true });

    try {
      const updateData = {
        nickname: trimmedNickname,
        signature: signature.trim(),
        location: location.trim()
      };

      if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('wxfile://')) {
        updateData.avatar = avatarUrl;
      } else if (avatarUrl) {
        updateData.avatar = avatarUrl;
      }

      const res = await api.updateUserInfo(updateData);

      if (res.code === 200) {
        const app = getApp();
        app.updateUserInfo(res.data);

        wx.showToast({ title: '保存成功', icon: 'success' });

        setTimeout(() => {
          wx.navigateBack();
        }, 1200);
      } else {
        wx.showToast({ title: res.message || '保存失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[ProfileEdit] 保存资料异常:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  }
});
