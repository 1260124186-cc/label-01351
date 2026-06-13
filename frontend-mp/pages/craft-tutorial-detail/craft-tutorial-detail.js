var api = require('../../utils/api');

Page({
  data: {
    id: '',
    detail: null,
    loading: true,
    activeTab: 'intro',
    isLike: false,
    hasCheckedIn: false,
    showReviewInput: false,
    reviewContent: '',
    reviewRating: 5
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ id: options.id });
    }
  },

  onShow: function() {
    if (this.data.id && !this.data.detail) {
      this.loadDetail(this.data.id);
    } else if (this.data.id && this.data.detail) {
      this.checkLikeStatus();
      this.checkCheckInStatus();
    }
  },

  loadDetail: function(id) {
    var that = this;
    this.setData({ loading: true });
    api.getCraftTutorialDetail(id).then(function(res) {
      if (res.code === 200 && res.data) {
        var detail = res.data;
        var navTitle = detail.title.length > 12
          ? detail.title.substring(0, 12) + '...'
          : detail.title;
        wx.setNavigationBarTitle({ title: navTitle });
        that.setData({
          detail: detail,
          isLike: false,
          hasCheckedIn: detail.hasCheckedIn || false,
          loading: false
        });
        that.checkLikeStatus();
      } else {
        that.setData({ detail: null, loading: false });
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    }).catch(function(error) {
      console.error('[CraftTutorialDetail] 加载详情失败:', error);
      that.setData({ detail: null, loading: false });
      wx.showToast({ title: '网络错误', icon: 'none' });
    });
  },

  checkLikeStatus: function() {
    var that = this;
    api.checkCraftTutorialLike(this.data.id).then(function(res) {
      if (res.code === 200) {
        that.setData({ isLike: res.data.isLike });
      }
    }).catch(function() {});
  },

  checkCheckInStatus: function() {
    var that = this;
    api.checkCraftTutorialCheckIn(this.data.id).then(function(res) {
      if (res.code === 200) {
        that.setData({ hasCheckedIn: res.data.hasCheckedIn });
      }
    }).catch(function() {});
  },

  switchTab: function(e) {
    var tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  onCheckIn: function() {
    var app = getApp();
    if (!app.checkLogin()) return;

    var that = this;
    api.checkInCraftTutorial(this.data.id).then(function(res) {
      if (res.code === 200) {
        wx.showToast({ title: '打卡成功！', icon: 'success' });
        that.setData({ hasCheckedIn: true });
        var detail = that.data.detail;
        if (detail) {
          detail.checkInCount = (detail.checkInCount || 0) + 1;
          that.setData({ detail: detail });
        }
      } else {
        wx.showToast({ title: res.message || '打卡失败', icon: 'none' });
      }
    }).catch(function() {
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },

  onLike: function() {
    var app = getApp();
    if (!app.checkLogin()) return;

    var that = this;
    var isLike = this.data.isLike;
    var promise = isLike
      ? api.unlikeCraftTutorial(this.data.id)
      : api.likeCraftTutorial(this.data.id);

    promise.then(function(res) {
      if (res.code === 200) {
        that.setData({
          isLike: !isLike
        });
        wx.showToast({ title: isLike ? '已取消点赞' : '点赞成功', icon: 'none' });
      }
    }).catch(function() {
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },

  toggleReviewInput: function() {
    this.setData({ showReviewInput: !this.data.showReviewInput });
  },

  onReviewInput: function(e) {
    this.setData({ reviewContent: e.detail.value });
  },

  onRatingChange: function(e) {
    var rating = e.currentTarget.dataset.rating;
    this.setData({ reviewRating: rating });
  },

  submitReview: function() {
    var app = getApp();
    if (!app.checkLogin()) return;

    var content = this.data.reviewContent.trim();
    if (!content) {
      wx.showToast({ title: '请输入心得内容', icon: 'none' });
      return;
    }

    var that = this;
    api.addCraftTutorialReview(this.data.id, {
      content: content,
      rating: that.data.reviewRating
    }).then(function(res) {
      if (res.code === 200) {
        wx.showToast({ title: '发表成功', icon: 'success' });
        var detail = that.data.detail;
        if (detail && detail.reviews) {
          detail.reviews.unshift(res.data);
        }
        that.setData({
          detail: detail,
          showReviewInput: false,
          reviewContent: '',
          reviewRating: 5
        });
      } else {
        wx.showToast({ title: res.message || '发表失败', icon: 'none' });
      }
    }).catch(function() {
      wx.showToast({ title: '发表失败', icon: 'none' });
    });
  },

  goToFigure: function(e) {
    var id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({ url: '/pages/figure-detail/figure-detail?id=' + id });
    }
  },

  goToLandmark: function(e) {
    var id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({ url: '/pages/landmark-detail/landmark-detail?id=' + id });
    }
  },

  goToEncyclopedia: function(e) {
    var id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({ url: '/pages/encyclopedia-detail/encyclopedia-detail?id=' + id });
    }
  },

  onShareAppMessage: function() {
    var detail = this.data.detail;
    if (!detail) return {};
    return {
      title: detail.title,
      path: '/pages/craft-tutorial-detail/craft-tutorial-detail?id=' + detail.id
    };
  }
});
