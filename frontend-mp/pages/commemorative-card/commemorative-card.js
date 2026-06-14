var api = require('../../utils/api');

Page({
  data: {
    cardData: null,
    loading: false
  },

  onLoad: function(options) {
    var id = options.id || '';
    this.loadCard(id);
  },

  loadCard: function(id) {
    var that = this;
    that.setData({ loading: true });
    api.getCommemorativeCard(id).then(function(res) {
      if (res.code === 200) {
        that.setData({ cardData: res.data });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    }).catch(function(error) {
      console.error('[CommemorativeCard] 加载失败:', error);
      wx.showToast({ title: '网络错误', icon: 'none' });
    }).finally(function() {
      that.setData({ loading: false });
    });
  },

  onSaveImage: function() {
    wx.showToast({ title: '图片已保存', icon: 'success' });
  },

  onShareCard: function() {
    this.onShareAppMessage();
  },

  onShareAppMessage: function() {
    var cardData = this.data.cardData;
    return {
      title: (cardData && cardData.skillName) ? cardData.skillName + ' - 结业纪念卡' : '结业纪念卡',
      path: '/pages/commemorative-card/commemorative-card'
    };
  }
});
