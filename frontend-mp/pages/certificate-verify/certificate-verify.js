// pages/certificate-verify/certificate-verify.js
// 证书查验页面

const api = require('../../utils/api');

Page({
  data: {
    certificateNumber: '',
    verificationCode: '',
    verifying: false,
    verifyResult: null,
    historyList: [],
    showHistory: false
  },

  onLoad() {
    this.loadHistory();
  },

  onNumberInput(e) {
    this.setData({ certificateNumber: e.detail.value.toUpperCase() });
  },

  onCodeInput(e) {
    this.setData({ verificationCode: e.detail.value.toUpperCase() });
  },

  async doVerify() {
    const { certificateNumber, verificationCode } = this.data;

    if (!certificateNumber) {
      wx.showToast({ title: '请输入证书编号', icon: 'none' });
      return;
    }

    if (!verificationCode || verificationCode.length !== 6) {
      wx.showToast({ title: '请输入6位验证码', icon: 'none' });
      return;
    }

    this.setData({ verifying: true, verifyResult: null });

    try {
      const res = await api.verifyCertificate({
        certificateNumber,
        verificationCode
      });

      if (res.code === 200) {
        this.setData({
          verifyResult: {
            success: true,
            message: res.data.verifyResult.message,
            certificate: res.data.certificate,
            verifyResult: res.data.verifyResult
          },
          verifying: false
        });
        this.addToHistory(certificateNumber);
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
      console.error('[CertificateVerify] 验证异常:', e);
      this.setData({
        verifyResult: {
          success: false,
          message: '验证失败，请稍后重试'
        },
        verifying: false
      });
    }
  },

  loadHistory() {
    try {
      const history = wx.getStorageSync('certificate_verify_history') || [];
      this.setData({ historyList: history });
    } catch (e) {
      console.error('[CertificateVerify] 加载历史失败:', e);
    }
  },

  addToHistory(certificateNumber) {
    try {
      let history = wx.getStorageSync('certificate_verify_history') || [];
      history = history.filter(item => item !== certificateNumber);
      history.unshift(certificateNumber);
      if (history.length > 10) {
        history = history.slice(0, 10);
      }
      wx.setStorageSync('certificate_verify_history', history);
      this.setData({ historyList: history });
    } catch (e) {
      console.error('[CertificateVerify] 保存历史失败:', e);
    }
  },

  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定要清空查询历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('certificate_verify_history');
          this.setData({ historyList: [], showHistory: false });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  useHistory(e) {
    const { number } = e.currentTarget.dataset;
    this.setData({
      certificateNumber: number,
      verificationCode: '',
      verifyResult: null,
      showHistory: false
    });
  },

  toggleHistory() {
    this.setData({ showHistory: !this.data.showHistory });
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    if (id) {
      wx.navigateTo({
        url: `/pages/certificate-detail/certificate-detail?id=${id}`
      });
    }
  },

  resetForm() {
    this.setData({
      certificateNumber: '',
      verificationCode: '',
      verifyResult: null
    });
  }
});
