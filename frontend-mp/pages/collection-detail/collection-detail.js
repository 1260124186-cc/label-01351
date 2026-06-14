const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    collectionId: '',
    collection: null,
    loading: true,
    isLoggedIn: false,
    isAuthor: false,
    canRespond: false
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ collectionId: id });
    }
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });

    if (this.data.collectionId) {
      this.loadCollectionDetail(this.data.collectionId);
    }
  },

  async loadCollectionDetail(id) {
    this.setData({ loading: true });

    try {
      const res = await api.getCollectionDetail(id);

      if (res.code === 200 && res.data) {
        const collection = {
          ...res.data,
          typeName: res.data.typeInfo ? res.data.typeInfo.name : '',
          typeIcon: res.data.typeInfo ? res.data.typeInfo.icon : '📌'
        };

        const app = getApp();
        const userInfo = app.getUserInfo();
        const isAuthor = userInfo && collection.authorId === userInfo.id;
        const canRespond = collection.statusInfo && collection.statusInfo.id === 'ongoing' && !collection.hasResponded;

        this.setData({
          collection,
          loading: false,
          isAuthor,
          canRespond
        });

        wx.setNavigationBarTitle({
          title: collection.title.length > 12
            ? collection.title.substring(0, 12) + '...'
            : collection.title
        });
      } else {
        this.setData({
          collection: null,
          loading: false
        });
        wx.showToast({
          title: res.message || '征集加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[CollectionDetail] 加载征集详情失败:', error);
      this.setData({
        collection: null,
        loading: false
      });
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  },

  goToRespond() {
    const app = getApp();
    if (!app.checkLogin()) return;

    const { collectionId, collection } = this.data;
    if (!collection || !collection.statusInfo || collection.statusInfo.id !== 'ongoing') {
      wx.showToast({ title: '该征集已结束', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/publish/publish?collectionRequestId=${collectionId}`
    });
  },

  goToResultTopic() {
    const { collection } = this.data;
    if (collection && collection.resultTopicId) {
      wx.navigateTo({
        url: `/pages/topic-detail/topic-detail?id=${collection.resultTopicId}`
      });
    }
  },

  goToArticle(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  previewCover() {
    const { collection } = this.data;
    if (collection && collection.cover) {
      wx.previewImage({
        urls: [collection.cover]
      });
    }
  },

  async onDelete() {
    const { collectionId } = this.data;
    wx.showModal({
      title: '确认删除',
      content: '删除后将无法恢复，确定要删除这条征集吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          try {
            const result = await api.deleteCollection(collectionId);
            wx.hideLoading();
            if (result.code === 200) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              setTimeout(() => {
                wx.navigateBack();
              }, 1500);
            } else {
              wx.showToast({ title: result.message || '删除失败', icon: 'none' });
            }
          } catch (error) {
            wx.hideLoading();
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  onShareAppMessage() {
    const { collection } = this.data;
    return {
      title: collection ? collection.title : '文化征集墙',
      path: `/pages/collection-detail/collection-detail?id=${this.data.collectionId}`
    };
  }
});
