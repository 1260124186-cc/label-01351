var api = require('../../utils/api');

Page({
  data: {
    matchList: [],
    loading: false,
    type: ''
  },

  onLoad: function(options) {
    var type = options.type || '';
    var id = options.id || '';
    this.setData({ type: type });
    this.loadMatches(type, id);
  },

  loadMatches: function(type, id) {
    var that = this;
    that.setData({ loading: true });
    api.getPairingMatches({ type: type, id: id }).then(function(res) {
      if (res.code === 200) {
        that.setData({ matchList: res.data.list || [] });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    }).catch(function(error) {
      console.error('[PairingMatches] 加载失败:', error);
      wx.showToast({ title: '网络错误', icon: 'none' });
    }).finally(function() {
      that.setData({ loading: false });
    });
  },

  onMatchTap: function(e) {
    var id = e.currentTarget.dataset.id;
    var type = this.data.type;
    if (type === 'learning') {
      wx.navigateTo({ url: '/pages/teaching-detail/teaching-detail?id=' + id });
    } else {
      wx.navigateTo({ url: '/pages/learning-detail/learning-detail?id=' + id });
    }
  },

  onApplyPairing: function(e) {
    var that = this;
    var matchId = e.currentTarget.dataset.id;
    var type = this.data.type;
    if (type !== 'learning') return;
    wx.showModal({
      title: '确认申请',
      content: '确认申请与该用户配对学习？',
      success: function(res) {
        if (res.confirm) {
          api.createPairing({ matchId: matchId }).then(function(res) {
            if (res.code === 200) {
              wx.showToast({ title: '申请已发送', icon: 'success' });
            } else {
              wx.showToast({ title: res.message || '申请失败', icon: 'none' });
            }
          }).catch(function(error) {
            console.error('[PairingMatches] 申请配对失败:', error);
            wx.showToast({ title: '网络错误', icon: 'none' });
          });
        }
      }
    });
  },

  onShareAppMessage: function() {
    return {
      title: '推荐匹配',
      path: '/pages/pairing-matches/pairing-matches'
    };
  }
});
