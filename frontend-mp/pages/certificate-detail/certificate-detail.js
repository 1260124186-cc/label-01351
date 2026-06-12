// pages/certificate-detail/certificate-detail.js
// 证书详情页面

const api = require('../../utils/api');

Page({
  data: {
    certificateId: '',
    loading: false,
    certificate: null,
    showPosterModal: false,
    showVerifyModal: false,
    verifyCode: '',
    verifyResult: null,
    verifying: false,
    isOwner: false
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ certificateId: id });
      this.loadCertificateDetail();
    }
  },

  onShow() {
    if (this.data.certificateId) {
      this.loadCertificateDetail();
    }
  },

  async loadCertificateDetail() {
    if (!this.data.certificateId) return;

    this.setData({ loading: true });

    try {
      const res = await api.getCertificateDetail(this.data.certificateId);
      if (res.code === 200) {
        const app = getApp();
        const currentUser = app.getUserInfo();
        const isOwner = currentUser && currentUser.id === res.data.userId;
        this.setData({
          certificate: res.data,
          isOwner,
          loading: false
        });
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    } catch (e) {
      console.error('[CertificateDetail] 加载证书详情异常:', e);
      this.setData({ loading: false });
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    }
  },

  showPoster() {
    this.setData({ showPosterModal: true });
    this.recordShare();
  },

  hidePoster() {
    this.setData({ showPosterModal: false });
  },

  async recordShare() {
    try {
      await api.shareCertificate(this.data.certificateId);
    } catch (e) {
      console.error('[CertificateDetail] 记录分享失败:', e);
    }
  },

  savePoster() {
    wx.showToast({
      title: '海报已保存到相册',
      icon: 'success'
    });
    this.hidePoster();
  },

  showVerify() {
    this.setData({
      showVerifyModal: true,
      verifyCode: '',
      verifyResult: null
    });
  },

  hideVerify() {
    this.setData({ showVerifyModal: false });
  },

  onVerifyCodeInput(e) {
    this.setData({ verifyCode: e.detail.value.toUpperCase() });
  },

  async doVerify() {
    const { verifyCode, certificate } = this.data;

    if (!verifyCode || verifyCode.length !== 6) {
      wx.showToast({ title: '请输入6位验证码', icon: 'none' });
      return;
    }

    this.setData({ verifying: true });

    try {
      const res = await api.verifyCertificate({
        certificateNumber: certificate.certificateNumber,
        verificationCode: verifyCode
      });

      if (res.code === 200) {
        this.setData({
          verifyResult: {
            success: true,
            message: res.data.verifyResult.message,
            data: res.data
          },
          verifying: false
        });
      } else {
        this.setData({
          verifyResult: {
            success: false,
            message: res.message
          },
          verifying: false
        });
      }
    } catch (e) {
      console.error('[CertificateDetail] 验证异常:', e);
      this.setData({
        verifyResult: {
          success: false,
          message: '验证失败，请稍后重试'
        },
        verifying: false
      });
    }
  },

  copyNumber() {
    if (!this.data.certificate) return;

    wx.setClipboardData({
      data: this.data.certificate.certificateNumber,
      success: () => {
        wx.showToast({ title: '证书编号已复制', icon: 'success' });
      }
    });
  },

  copyVerifyCode() {
    if (!this.data.certificate) return;

    wx.setClipboardData({
      data: this.data.certificate.verificationCode,
      success: () => {
        wx.showToast({ title: '验证码已复制', icon: 'success' });
      }
    });
  },

  goToVerifyPage() {
    wx.navigateTo({
      url: '/pages/certificate-verify/certificate-verify'
    });
  },

  onShareAppMessage() {
    const cert = this.data.certificate;
    if (!cert) return {};

    this.recordShare();

    return {
      title: `${cert.userName}的${cert.title}`,
      path: `/pages/certificate-detail/certificate-detail?id=${cert.id}`,
      imageUrl: ''
    };
  },

  onShareTimeline() {
    const cert = this.data.certificate;
    if (!cert) return {};

    return {
      title: `${cert.userName}获得了${cert.title}`,
      query: `id=${cert.id}`
    };
  }
});
