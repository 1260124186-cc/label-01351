// pages/detail/detail.js
// 文章详情页 - 展示文章完整内容，支持点赞、收藏、评论功能

const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    articleId: '',
    article: null,
    loading: true,
    liked: false,
    favorited: false,
    isLoggedIn: false,
    commentContent: '',
    comments: [],
    commentPage: 1,
    commentPageSize: 10,
    commentHasMore: true,
    commentLoading: false,
    replyToId: null,
    replyToUserName: '',
    replyToUserId: null,
    showReplyInput: false,
    showReportModal: false,
    reportReason: '',
    reportDescription: ''
  },

  /**
   * 页面加载时获取文章ID
   * @param {Object} options - 页面参数，包含文章ID
   */
  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ articleId: id });
    }
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });

    if (this.data.articleId && !this.data.article) {
      this.loadArticleDetail(this.data.articleId);
    }
  },

  /**
   * 加载文章详情
   * @param {string} id - 文章ID
   */
  async loadArticleDetail(id) {
    this.setData({ loading: true });

    try {
      const res = await api.getArticleDetail(id);

      if (res.code === 200 && res.data) {
        const article = {
          ...res.data,
          categoryName: util.getCategoryName(res.data.category),
          commentCount: res.data.commentCount || 0,
          summary: res.data.summary || util.truncateText(res.data.content, 100),
          tags: res.data.tags || []
        };

        this.setData({
          article,
          loading: false
        });

        wx.setNavigationBarTitle({
          title: article.title.length > 10
            ? article.title.substring(0, 10) + '...'
            : article.title
        });

        const app = getApp();
        if (app.getLoginStatus()) {
          await this.checkFavoriteStatus(id);
          await this.checkLikeStatus(id);
          await api.addHistory(id);
        }
        this.loadComments(true);
      } else {
        this.setData({
          article: null,
          loading: false
        });
        wx.showToast({
          title: res.message || '文章加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[Detail] 加载文章详情失败:', error);
      this.setData({
        article: null,
        loading: false
      });
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  },

  async checkFavoriteStatus(id) {
    const app = getApp();
    if (!app.getLoginStatus()) {
      this.setData({ favorited: false });
      return;
    }
    try {
      const res = await api.checkFavorite(id);
      if (res.code === 200) {
        this.setData({ favorited: res.data.isFavorite });
      }
    } catch (error) {
      console.error('[Detail] 检查收藏状态失败:', error);
    }
  },

  async checkLikeStatus(id) {
    const app = getApp();
    if (!app.getLoginStatus()) {
      this.setData({ liked: false });
      return;
    }
    try {
      const res = await api.checkLike(id);
      if (res.code === 200) {
        this.setData({ liked: res.data.isLike });
      }
    } catch (error) {
      console.error('[Detail] 检查点赞状态失败:', error);
    }
  },

  async loadComments(reset = false) {
    if (this.data.commentLoading) return;
    if (!reset && !this.data.commentHasMore) return;

    this.setData({ commentLoading: true });

    const page = reset ? 1 : this.data.commentPage;

    try {
      const res = await api.getCommentList({
        articleId: this.data.articleId,
        page,
        pageSize: this.data.commentPageSize
      });

      if (res.code === 200) {
        const newComments = reset ? res.data.list : [...this.data.comments, ...res.data.list];
        this.setData({
          comments: newComments,
          commentPage: reset ? 2 : this.data.commentPage + 1,
          commentHasMore: res.data.hasMore,
          commentLoading: false
        });
      } else {
        this.setData({ commentLoading: false });
        wx.showToast({
          title: res.message || '评论加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[Detail] 加载评论失败:', error);
      this.setData({ commentLoading: false });
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  },

  onCommentInput(e) {
    this.setData({ commentContent: e.detail.value });
  },

  async onSubmitComment() {
    const app = getApp();
    if (!app.getLoginStatus()) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }

    const { commentContent, articleId, replyToId, replyToUserId, replyToUserName } = this.data;
    const trimmedContent = commentContent.trim();

    if (!trimmedContent) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }
    if (trimmedContent.length < 2) {
      wx.showToast({ title: '评论至少2个字符', icon: 'none' });
      return;
    }
    if (trimmedContent.length > 500) {
      wx.showToast({ title: '评论不能超过500字符', icon: 'none' });
      return;
    }

    try {
      const data = {
        articleId,
        content: trimmedContent
      };
      if (replyToId) {
        data.replyToId = replyToId;
        data.replyToUserId = replyToUserId;
        data.replyToUserName = replyToUserName;
      }

      const res = await api.createComment(data);

      if (res.code === 200) {
        wx.showToast({ title: '评论成功', icon: 'success' });
        this.setData({
          commentContent: '',
          replyToId: null,
          replyToUserName: '',
          replyToUserId: null,
          showReplyInput: false,
          'article.commentCount': (this.data.article.commentCount || 0) + 1
        });
        this.loadComments(true);
      } else {
        wx.showToast({ title: res.message || '评论失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[Detail] 发布评论失败:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    }
  },

  onReplyTap(e) {
    const { commentid, authorid, authorname } = e.currentTarget.dataset;
    this.setData({
      replyToId: commentid,
      replyToUserId: authorid,
      replyToUserName: authorname,
      showReplyInput: true
    });
  },

  onCancelReply() {
    this.setData({
      replyToId: null,
      replyToUserName: '',
      replyToUserId: null,
      showReplyInput: false,
      commentContent: ''
    });
  },

  async onCommentLike(e) {
    const app = getApp();
    if (!app.getLoginStatus()) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }

    const { commentid, isliked } = e.currentTarget.dataset;
    const comments = this.data.comments;

    try {
      const res = isliked
        ? await api.unlikeComment(commentid)
        : await api.likeComment(commentid);

      if (res.code === 200) {
        const updatedComments = comments.map(parent => {
          if (parent.id === commentid) {
            return { ...parent, isLiked: res.data.isLike, likeCount: res.data.likeCount };
          }
          if (parent.replies && parent.replies.length > 0) {
            const updatedReplies = parent.replies.map(reply => {
              if (reply.id === commentid) {
                return { ...reply, isLiked: res.data.isLike, likeCount: res.data.likeCount };
              }
              return reply;
            });
            return { ...parent, replies: updatedReplies };
          }
          return parent;
        });
        this.setData({ comments: updatedComments });
      }
    } catch (error) {
      console.error('[Detail] 评论点赞失败:', error);
    }
  },

  async onDeleteComment(e) {
    const { commentid } = e.currentTarget.dataset;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await api.deleteComment(commentid);
            if (result.code === 200) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.setData({
                'article.commentCount': Math.max((this.data.article.commentCount || 1) - 1, 0)
              });
              this.loadComments(true);
            } else {
              wx.showToast({ title: result.message || '删除失败', icon: 'none' });
            }
          } catch (error) {
            console.error('[Detail] 删除评论失败:', error);
            wx.showToast({ title: '网络错误，请重试', icon: 'none' });
          }
        }
      }
    });
  },

  async onLike() {
    const app = getApp();
    if (!app.getLoginStatus()) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }

    const { articleId, liked } = this.data;

    try {
      if (liked) {
        const res = await api.unlikeArticle(articleId);

        if (res.code === 200) {
          this.setData({
            liked: false,
            'article.likeCount': res.data.likeCount
          });

          wx.showToast({
            title: '已取消点赞',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: res.message || '取消失败',
            icon: 'none'
          });
        }
      } else {
        const res = await api.likeArticle(articleId);

        if (res.code === 200) {
          this.setData({
            liked: true,
            'article.likeCount': res.data.likeCount
          });

          wx.showToast({
            title: '点赞成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.message || '点赞失败',
            icon: 'none'
          });
        }
      }
    } catch (error) {
      console.error('[Detail] 点赞操作失败:', error);
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  },

  async onFavorite() {
    const app = getApp();
    if (!app.getLoginStatus()) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }

    const { articleId, favorited } = this.data;

    try {
      if (favorited) {
        const res = await api.unfavoriteArticle(articleId);

        if (res.code === 200) {
          this.setData({ favorited: false });
          wx.showToast({
            title: '已取消收藏',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: res.message || '取消失败',
            icon: 'none'
          });
        }
      } else {
        const res = await api.favoriteArticle(articleId);

        if (res.code === 200) {
          this.setData({ favorited: true });
          wx.showToast({
            title: '收藏成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.message || '收藏失败',
            icon: 'none'
          });
        }
      }
    } catch (error) {
      console.error('[Detail] 收藏操作失败:', error);
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  },

  onReachBottom() {
    if (this.data.commentHasMore && !this.data.commentLoading) {
      this.loadComments(false);
    }
  },

  goBack() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  onReportTap() {
    const app = getApp();
    if (!app.getLoginStatus()) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    this.setData({ showReportModal: true });
  },

  onCloseReport() {
    this.setData({
      showReportModal: false,
      reportReason: '',
      reportDescription: ''
    });
  },

  onSelectReportReason(e) {
    const { reason } = e.currentTarget.dataset;
    this.setData({ reportReason: reason });
  },

  onReportDescInput(e) {
    this.setData({ reportDescription: e.detail.value });
  },

  async onSubmitReport() {
    const { articleId, reportReason, reportDescription } = this.data;

    if (!reportReason) {
      wx.showToast({ title: '请选择举报原因', icon: 'none' });
      return;
    }

    try {
      const res = await api.submitReport({
        articleId,
        reason: reportReason,
        description: reportDescription
      });

      if (res.code === 200) {
        wx.showToast({ title: '举报成功', icon: 'success' });
        this.setData({
          showReportModal: false,
          reportReason: '',
          reportDescription: ''
        });
      } else {
        wx.showToast({ title: res.message || '举报失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[Detail] 提交举报失败:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    }
  },

  onShareAppMessage() {
    const { article } = this.data;
    if (!article) return {};

    return {
      title: article.title,
      path: `/pages/detail/detail?id=${article.id}`
    };
  },

  onTagClick(e) {
    const tag = e.currentTarget.dataset.tag;
    if (!tag) return;
    wx.switchTab({
      url: '/pages/index/index',
      success: () => {
        setTimeout(() => {
          const pages = getCurrentPages();
          const currentPage = pages[pages.length - 1];
          if (currentPage && currentPage.filterByTag) {
            currentPage.filterByTag(tag);
          }
        }, 100);
      }
    });
  }
});
