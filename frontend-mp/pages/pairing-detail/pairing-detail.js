var api = require('../../utils/api');
var pairingData = require('../../utils/pairing-data');
var util = require('../../utils/util');

Page({
  data: {
    id: '',
    pairing: null,
    checkins: [],
    loading: true,
    showCheckinSheet: false,
    checkinHours: 1,
    checkinContent: '',
    isMaster: false,
    isLearner: false
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ id: options.id });
    }
  },

  onShow: function() {
    if (this.data.id) {
      this.loadDetail(this.data.id);
    }
  },

  loadDetail: function(id) {
    var that = this;
    this.setData({ loading: true });
    api.getPairingDetail(id).then(function(res) {
      if (res.code === 200 && res.data) {
        var pairing = res.data;
        var userInfo = wx.getStorageSync('userInfo');
        var isMaster = userInfo && pairing.masterId === userInfo.id;
        var isLearner = userInfo && pairing.learnerId === userInfo.id;
        pairing.methodInfo = pairingData.getTeachingMethodInfo(pairing.method);
        pairing.regionName = pairingData.getRegionName(pairing.region);
        that.setData({
          pairing: pairing,
          checkins: pairing.checkins || [],
          isMaster: isMaster,
          isLearner: isLearner,
          loading: false
        });
      } else {
        that.setData({ pairing: null, loading: false });
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    }).catch(function(error) {
      console.error('[PairingDetail] 加载详情失败:', error);
      that.setData({ pairing: null, loading: false });
      wx.showToast({ title: '网络错误', icon: 'none' });
    });
  },

  onAccept: function() {
    var that = this;
    wx.showModal({
      title: '确认结对',
      content: '确认接受此结对申请？',
      success: function(res) {
        if (res.confirm) {
          api.acceptPairing(that.data.id).then(function(res) {
            if (res.code === 200) {
              wx.showToast({ title: '已确认结对', icon: 'success' });
              that.loadDetail(that.data.id);
            } else {
              wx.showToast({ title: res.message || '操作失败', icon: 'none' });
            }
          }).catch(function() {
            wx.showToast({ title: '操作失败', icon: 'none' });
          });
        }
      }
    });
  },

  onReject: function() {
    var that = this;
    wx.showModal({
      title: '拒绝结对',
      content: '确认拒绝此结对申请？',
      success: function(res) {
        if (res.confirm) {
          api.rejectPairing(that.data.id).then(function(res) {
            if (res.code === 200) {
              wx.showToast({ title: '已拒绝结对', icon: 'none' });
              that.loadDetail(that.data.id);
            } else {
              wx.showToast({ title: res.message || '操作失败', icon: 'none' });
            }
          }).catch(function() {
            wx.showToast({ title: '操作失败', icon: 'none' });
          });
        }
      }
    });
  },

  onCancel: function() {
    var that = this;
    wx.showModal({
      title: '取消结对',
      content: '确认取消此结对？',
      success: function(res) {
        if (res.confirm) {
          api.cancelPairing(that.data.id).then(function(res) {
            if (res.code === 200) {
              wx.showToast({ title: '已取消结对', icon: 'none' });
              that.loadDetail(that.data.id);
            } else {
              wx.showToast({ title: res.message || '操作失败', icon: 'none' });
            }
          }).catch(function() {
            wx.showToast({ title: '操作失败', icon: 'none' });
          });
        }
      }
    });
  },

  onCheckin: function() {
    this.setData({ showCheckinSheet: true, checkinHours: 1, checkinContent: '' });
  },

  onCheckinHoursChange: function(e) {
    this.setData({ checkinHours: Number(e.detail.value) });
  },

  onCheckinContentInput: function(e) {
    this.setData({ checkinContent: e.detail.value });
  },

  onSubmitCheckin: function() {
    var that = this;
    var hours = this.data.checkinHours;
    var content = this.data.checkinContent.trim();
    if (!hours || hours <= 0) {
      wx.showToast({ title: '请选择学时', icon: 'none' });
      return;
    }
    if (!content) {
      wx.showToast({ title: '请输入学习内容', icon: 'none' });
      return;
    }
    api.studyCheckin(this.data.id, { hours: hours, content: content }).then(function(res) {
      if (res.code === 200) {
        wx.showToast({ title: '打卡成功', icon: 'success' });
        that.setData({ showCheckinSheet: false });
        that.loadDetail(that.data.id);
      } else {
        wx.showToast({ title: res.message || '打卡失败', icon: 'none' });
      }
    }).catch(function() {
      wx.showToast({ title: '打卡失败', icon: 'none' });
    });
  },

  onComplete: function() {
    var that = this;
    wx.showModal({
      title: '确认结业',
      content: '确认将此结对标记为已结业？',
      success: function(res) {
        if (res.confirm) {
          api.completePairing(that.data.id).then(function(res) {
            if (res.code === 200) {
              wx.showToast({ title: '结业成功', icon: 'success' });
              that.loadDetail(that.data.id);
            } else {
              wx.showToast({ title: res.message || '操作失败', icon: 'none' });
            }
          }).catch(function() {
            wx.showToast({ title: '操作失败', icon: 'none' });
          });
        }
      }
    });
  },

  onGenerateCard: function() {
    var that = this;
    api.generateCommemorativeCard(this.data.id).then(function(res) {
      if (res.code === 200) {
        wx.showToast({ title: '纪念卡生成成功', icon: 'success' });
        setTimeout(function() {
          wx.navigateTo({ url: '/pages/commemorative-card/commemorative-card?id=' + that.data.id });
        }, 1500);
      } else {
        wx.showToast({ title: res.message || '生成失败', icon: 'none' });
      }
    }).catch(function() {
      wx.showToast({ title: '生成失败', icon: 'none' });
    });
  },

  goToChat: function() {
    wx.navigateTo({ url: '/pages/chat/chat?source=pairing&id=' + this.data.id });
  },

  goToMasterHome: function() {
    var pairing = this.data.pairing;
    if (pairing && pairing.masterId) {
      wx.navigateTo({ url: '/pages/figure-detail/figure-detail?id=' + pairing.masterId });
    }
  },

  goToLearnerHome: function() {
    var pairing = this.data.pairing;
    if (pairing && pairing.learnerId) {
      wx.navigateTo({ url: '/pages/user-profile/user-profile?id=' + pairing.learnerId });
    }
  },

  onHideCheckinSheet: function() {
    this.setData({ showCheckinSheet: false });
  },

  onShareAppMessage: function() {
    var pairing = this.data.pairing;
    if (!pairing) return {};
    return {
      title: pairing.masterName + ' 与 ' + pairing.learnerName + ' 的结对',
      path: '/pages/pairing-detail/pairing-detail?id=' + pairing.id
    };
  }
});
