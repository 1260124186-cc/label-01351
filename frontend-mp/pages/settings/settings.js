const app = getApp();
const api = require('../../utils/api');
const i18n = require('../../utils/i18n');

Page({
  data: {
    version: '1.0.0',
    useRemote: false,
    baseUrl: 'http://localhost:3000',
    baseUrlInput: '',
    showBaseUrlEdit: false,
    cacheSize: '0KB',
    language: 'zh-CN',
    languageOptions: [],
    languageName: '简体中文',
    showDialectAnnotation: true,
    showLanguagePicker: false,
    t: {}
  },

  onLoad() {
    this.loadSettings();
    this.calculateCacheSize();
  },

  onShow() {
    this.loadSettings();
  },

  loadSettings() {
    const globalData = app.globalData;
    const language = app.getLanguage();
    const t = {
      clearCache: app.t('settings.clearCache'),
      restoreDefault: app.t('settings.restoreDefault'),
      devMode: app.t('settings.devMode'),
      remoteDataSource: app.t('settings.remoteDataSource'),
      serverUrl: app.t('settings.serverUrl'),
      saved: app.t('settings.saved'),
      aboutUs: app.t('settings.aboutUs'),
      userAgreement: app.t('settings.userAgreement'),
      privacyPolicy: app.t('settings.privacyPolicy'),
      version: app.t('settings.version'),
      general: app.t('settings.general'),
      language: app.t('settings.language'),
      dialect: app.t('dialect.title'),
      showDialectAnnotation: app.t('dialect.showAnnotation'),
      hideDialectAnnotation: app.t('dialect.hideAnnotation'),
      about: app.t('settings.about')
    };
    this.setData({
      useRemote: globalData.useRemote,
      baseUrl: globalData.baseUrl,
      baseUrlInput: globalData.baseUrl,
      language,
      languageOptions: i18n.getLangOptions(),
      languageName: i18n.getLangName(language),
      showDialectAnnotation: app.getDialectAnnotation(),
      t
    });
  },

  onTapLanguage() {
    this.setData({ showLanguagePicker: true });
  },

  onCloseLanguagePicker() {
    this.setData({ showLanguagePicker: false });
  },

  onSelectLanguage(e) {
    const lang = e.currentTarget.dataset.lang;
    if (!lang) return;
    app.switchLanguage(lang);
    this.setData({
      showLanguagePicker: false
    });
    this.loadSettings();
    wx.showToast({
      title: lang === 'zh-TW' ? '已切換為繁體中文' : '已切换为简体中文',
      icon: 'success'
    });
  },

  onToggleDialectAnnotation(e) {
    const show = e.detail.value;
    app.toggleDialectAnnotation(show);
    this.setData({ showDialectAnnotation: show });
    wx.showToast({
      title: show ? app.t('dialect.showAnnotation') : app.t('dialect.hideAnnotation'),
      icon: 'none'
    });
  },

  calculateCacheSize() {
    try {
      const info = wx.getStorageInfoSync();
      const size = info.currentSize || 0;
      let sizeText;
      if (size < 1024) {
        sizeText = size + 'B';
      } else if (size < 1024 * 1024) {
        sizeText = (size / 1024).toFixed(1) + 'KB';
      } else {
        sizeText = (size / (1024 * 1024)).toFixed(2) + 'MB';
      }
      this.setData({ cacheSize: sizeText });
    } catch (e) {
      console.error('[Settings] 计算缓存大小失败:', e);
    }
  },

  onSwitchDataSource(e) {
    const useRemote = e.detail.value;
    app.switchDataSource(useRemote);
    this.setData({ useRemote });
    wx.showToast({
      title: useRemote ? '已切换为远程数据源' : '已切换为本地存储',
      icon: 'success'
    });
  },

  onToggleBaseUrlEdit() {
    this.setData({
      showBaseUrlEdit: !this.data.showBaseUrlEdit,
      baseUrlInput: this.data.baseUrl
    });
  },

  onBaseUrlInput(e) {
    this.setData({ baseUrlInput: e.detail.value });
  },

  onSaveBaseUrl() {
    const baseUrl = this.data.baseUrlInput.trim();
    if (!baseUrl) {
      wx.showToast({ title: '地址不能为空', icon: 'none' });
      return;
    }
    app.setBaseUrl(baseUrl);
    this.setData({
      baseUrl,
      showBaseUrlEdit: false
    });
    wx.showToast({ title: '保存成功', icon: 'success' });
  },

  onClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除缓存吗？将清除除文章数据外的所有用户数据。',
      confirmText: '清除',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          this.doClearCache();
        }
      }
    });
  },

  doClearCache() {
    try {
      const articles = wx.getStorageSync('articles');
      const keysToKeep = ['articles'];
      const info = wx.getStorageInfoSync();
      info.keys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          wx.removeStorageSync(key);
        }
      });
      if (articles && articles.length > 0) {
        wx.setStorageSync('articles', articles);
      }

      app.checkLoginStatus();

      this.calculateCacheSize();

      wx.showToast({
        title: '缓存已清除',
        icon: 'success'
      });
    } catch (e) {
      console.error('[Settings] 清除缓存失败:', e);
      wx.showToast({
        title: '清除失败',
        icon: 'none'
      });
    }
  },

  onRestoreDefaultData() {
    wx.showModal({
      title: '恢复默认数据',
      content: '确定要恢复默认示例数据吗？所有用户数据将被重置为初始状态。',
      confirmText: '恢复',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          this.doRestoreDefaultData();
        }
      }
    });
  },

  doRestoreDefaultData() {
    try {
      wx.clearStorageSync();

      app.initMockData();
      app.checkLoginStatus();

      this.calculateCacheSize();

      wx.showToast({
        title: '已恢复默认数据',
        icon: 'success'
      });
    } catch (e) {
      console.error('[Settings] 恢复默认数据失败:', e);
      wx.showToast({
        title: '恢复失败',
        icon: 'none'
      });
    }
  },

  goToAbout() {
    wx.showModal({
      title: '关于我们',
      content: '乡村文化库小程序\n\n致力于传承和弘扬乡村优秀传统文化，记录乡村记忆，守护文化根脉。\n\n让更多人了解乡村、热爱乡村、守护乡村。',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  goToUserAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '一、服务条款\n欢迎使用乡村文化库小程序。使用本服务前，请您仔细阅读本协议。\n\n二、用户规范\n1. 用户应遵守法律法规，不得发布违法违规内容。\n2. 用户应尊重他人权益，不得侵犯他人知识产权。\n3. 用户应保证发布内容的真实性和合法性。\n\n三、知识产权\n本平台内容的知识产权归原作者所有。\n\n四、免责声明\n用户因使用本服务产生的任何损失，平台不承担责任。\n\n五、协议修改\n平台保留修改协议的权利，修改后将在平台公示。',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  goToPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们非常重视您的个人信息和隐私保护。\n\n一、信息收集\n我们仅收集必要的用户信息用于提供服务。\n\n二、信息使用\n1. 用于提供、维护和改进我们的服务。\n2. 用于向您发送通知和消息。\n3. 用于保障账号安全。\n\n三、信息保护\n我们采用合理的安全措施保护您的个人信息。\n\n四、信息共享\n未经您同意，我们不会向第三方共享您的个人信息。\n\n五、您的权利\n您有权访问、更正、删除您的个人信息。',
      showCancel: false,
      confirmText: '我知道了'
    });
  }
});
