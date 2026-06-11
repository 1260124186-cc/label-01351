// pages/interview-collections/interview-collections.js
// 访谈合集列表页

const api = require('../../utils/api');
const interviewData = require('../../utils/interview-data');

Page({
  data: {
    collectionList: [],
    loading: true,
    refreshing: false
  },

  onLoad() {
    this.loadCollections();
  },

  onShow() {
    if (this.data.collectionList.length === 0) {
      this.loadCollections();
    }
  },

  onPullDownRefresh() {
    this.refreshData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadCollections() {
    this.setData({ loading: true });
    try {
      const res = await api.getInterviewCollectionList();
      if (res.code === 200) {
        const collections = res.data.map(collection => {
          const typeInfo = interviewData.COLLECTION_TYPES.find(t => t.id === collection.id);
          return {
            ...collection,
            icon: typeInfo ? typeInfo.icon : '📚',
            name: typeInfo ? typeInfo.name : collection.name
          };
        });
        this.setData({ collectionList: collections });
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[InterviewCollections] 加载合集列表失败:', error);
      this.loadMockCollections();
    } finally {
      this.setData({ loading: false });
    }
  },

  loadMockCollections() {
    const collections = interviewData.COLLECTION_TYPES.map(type => {
      const interviews = interviewData.filterInterviews(
        interviewData.DEFAULT_INTERVIEWS,
        { collectionId: type.id }
      );
      return {
        id: type.id,
        name: type.name,
        icon: type.icon,
        description: this.getCollectionDescription(type.id),
        interviewCount: interviews.length,
        coverImage: this.getCollectionCover(type.id),
        viewCount: interviews.reduce((sum, i) => sum + (i.viewCount || 0), 0)
      };
    });
    this.setData({ collectionList: collections });
  },

  getCollectionDescription(collectionId) {
    const descriptions = {
      'craftsman': '记录村里那些身怀绝技的老匠人，他们用一生诠释了什么是工匠精神',
      'solar_terms': '跟随二十四节气的脚步，聆听老人们讲述节气里的生活智慧',
      'village_history': '透过老人们的记忆，重温那些关于村庄的沧桑巨变与温情往事',
      'red_story': '聆听革命先辈的故事，传承红色基因，铭记峥嵘岁月',
      'food_culture': '舌尖上的记忆，老人们讲述的传统美食与背后的故事',
      'traditional_medicine': '杏林春暖，记录乡间老中医的行医故事与祖传秘方'
    };
    return descriptions[collectionId] || '探索更多乡村文化故事';
  },

  getCollectionCover(collectionId) {
    const covers = {
      'craftsman': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'solar_terms': 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800',
      'village_history': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
      'red_story': 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=800',
      'food_culture': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      'traditional_medicine': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800'
    };
    return covers[collectionId] || 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800';
  },

  async refreshData() {
    this.setData({ refreshing: true });
    try {
      const res = await api.getInterviewCollectionList();
      if (res.code === 200) {
        const collections = res.data.map(collection => {
          const typeInfo = interviewData.COLLECTION_TYPES.find(t => t.id === collection.id);
          return {
            ...collection,
            icon: typeInfo ? typeInfo.icon : '📚',
            name: typeInfo ? typeInfo.name : collection.name
          };
        });
        this.setData({ collectionList: collections });
      }
    } catch (error) {
      console.error('[InterviewCollections] 刷新失败:', error);
      this.loadMockCollections();
    } finally {
      this.setData({ refreshing: false });
    }
  },

  goToCollectionDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/interview-collection-detail/interview-collection-detail?id=${id}`
    });
  },

  goToCreateInterview() {
    const app = getApp();
    if (!app.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/interview-create/interview-create'
    });
  }
});
