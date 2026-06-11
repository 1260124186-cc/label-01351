const api = require('../../utils/api');
const { createPageInstance, initStorage, defaultUser } = require('../helpers');

function createMockApp(userOverrides = {}) {
  const userInfo = { ...defaultUser, signature: '', location: '', ...userOverrides };
  return {
    globalData: {
      userInfo,
      isLoggedIn: true,
      baseUrl: 'http://localhost:3000'
    },
    getLoginStatus: jest.fn(() => true),
    getUserInfo: jest.fn(() => userInfo),
    updateUserInfo: jest.fn(function(updated) {
      this.globalData.userInfo = { ...this.globalData.userInfo, ...updated };
      wx.setStorageSync('userInfo', this.globalData.userInfo);
    })
  };
}

describe('ProfileEdit 编辑资料页', () => {
  let page;
  let profileEditPage;

  beforeAll(() => {
    jest.resetModules();
    require('../../pages/profile-edit/profile-edit');
    profileEditPage = Page.mock.calls[Page.mock.calls.length - 1][0];
  });

  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', { ...defaultUser, signature: '', location: '' });
    wx.setStorageSync('isLoggedIn', true);
    global.getApp = jest.fn(() => createMockApp());
    page = createPageInstance(profileEditPage);
  });

  test('初始 data 状态正确', () => {
    expect(page.data.nickname).toBeDefined();
    expect(page.data.signature).toBeDefined();
    expect(page.data.location).toBeDefined();
    expect(page.data.avatarUrl).toBeDefined();
    expect(page.data.canSave).toBe(false);
    expect(page.data.saving).toBe(false);
  });

  test('onLoad 从 app 读取用户信息', () => {
    global.getApp = jest.fn(() => createMockApp({
      nickname: '乡村文化爱好者',
      signature: '热爱乡村',
      location: '河北衡水'
    }));
    page.onLoad();
    expect(page.data.nickname).toBe('乡村文化爱好者');
    expect(page.data.signature).toBe('热爱乡村');
    expect(page.data.location).toBe('河北衡水');
  });

  describe('昵称输入', () => {
    test('输入昵称更新 nickname 和 nicknameFirstChar', () => {
      page.onNicknameInput({ detail: { value: '小明' } });
      expect(page.data.nickname).toBe('小明');
      expect(page.data.nicknameFirstChar).toBe('小');
    });

    test('空昵称时 nicknameFirstChar 为 "用"', () => {
      page.onNicknameInput({ detail: { value: '' } });
      expect(page.data.nicknameFirstChar).toBe('用');
    });
  });

  describe('签名输入', () => {
    test('输入签名更新 signature', () => {
      page.onSignatureInput({ detail: { value: '热爱乡村文化' } });
      expect(page.data.signature).toBe('热爱乡村文化');
    });
  });

  describe('地区输入', () => {
    test('输入地区更新 location', () => {
      page.onLocationInput({ detail: { value: '山东济南' } });
      expect(page.data.location).toBe('山东济南');
    });
  });

  describe('保存逻辑', () => {
    test('昵称少于2字时提示错误', async () => {
      page.setData({ nickname: '一', signature: '', location: '' });
      wx.showToast = jest.fn();
      await page.onSave();
      expect(wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: '昵称需要2-20个字符' })
      );
    });

    test('昵称超过20字时提示错误', async () => {
      page.setData({ nickname: '啊'.repeat(21), signature: '', location: '' });
      wx.showToast = jest.fn();
      await page.onSave();
      expect(wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: '昵称需要2-20个字符' })
      );
    });

    test('签名超过100字时提示错误', async () => {
      page.setData({ nickname: '测试昵称', signature: '啊'.repeat(101), location: '' });
      wx.showToast = jest.fn();
      await page.onSave();
      expect(wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: '个性签名不能超过100字' })
      );
    });

    test('保存中不允许重复提交', async () => {
      page.setData({ nickname: '测试昵称', signature: '', location: '', saving: true, canSave: true });
      const result = await page.onSave();
      expect(result).toBeUndefined();
    });

    test('保存成功后同步更新 app 用户信息', async () => {
      const mockApp = createMockApp({ nickname: '旧昵称', signature: '', location: '' });
      global.getApp = jest.fn(() => mockApp);
      page.setData({
        nickname: '新昵称',
        signature: '新签名',
        location: '新地区',
        originalNickname: '旧昵称',
        originalSignature: '',
        originalLocation: '',
        originalAvatarUrl: '',
        avatarUrl: '',
        canSave: true
      });

      await page.onSave();
      expect(mockApp.updateUserInfo).toHaveBeenCalled();
    });

    test('保存成功后 navigateBack', async () => {
      page.setData({
        nickname: '新昵称',
        signature: '',
        location: '',
        originalNickname: '旧昵称',
        originalSignature: '',
        originalLocation: '',
        originalAvatarUrl: '',
        avatarUrl: '',
        canSave: true
      });

      wx.showToast = jest.fn();
      await page.onSave();

      expect(wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: '保存成功' })
      );
    });
  });

  describe('_checkCanSave', () => {
    test('无变化时 canSave 为 false', () => {
      page.setData({
        nickname: '测试',
        signature: '',
        location: '',
        avatarUrl: '',
        originalNickname: '测试',
        originalSignature: '',
        originalLocation: '',
        originalAvatarUrl: ''
      });
      page._checkCanSave();
      expect(page.data.canSave).toBe(false);
    });

    test('有变化且合法时 canSave 为 true', () => {
      page.setData({
        nickname: '新昵称',
        signature: '',
        location: '',
        avatarUrl: '',
        originalNickname: '旧昵称',
        originalSignature: '',
        originalLocation: '',
        originalAvatarUrl: ''
      });
      page._checkCanSave();
      expect(page.data.canSave).toBe(true);
    });

    test('昵称不合法时 canSave 为 false', () => {
      page.setData({
        nickname: '一',
        signature: '',
        location: '',
        avatarUrl: '',
        originalNickname: '旧昵称',
        originalSignature: '',
        originalLocation: '',
        originalAvatarUrl: ''
      });
      page._checkCanSave();
      expect(page.data.canSave).toBe(false);
    });
  });

  describe('头像选择', () => {
    test('选择头像后更新 avatarUrl', () => {
      wx.chooseMedia = jest.fn(({ success }) => {
        success({ tempFiles: [{ tempFilePath: '/tmp/avatar.jpg' }] });
      });
      page.onChooseAvatar();
      expect(page.data.avatarUrl).toBe('/tmp/avatar.jpg');
    });
  });

  describe('goToEditProfile (mine 页面)', () => {
    test('mine 页面跳转到 profile-edit', () => {
      jest.resetModules();
      require('../../pages/mine/mine');
      const minePage = Page.mock.calls[Page.mock.calls.length - 1][0];
      const mineInstance = createPageInstance(minePage);
      mineInstance.goToEditProfile();
      expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/profile-edit/profile-edit' });
    });
  });
});
