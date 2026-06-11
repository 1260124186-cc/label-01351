// pages/interview-collection-detail/interview-collection-detail.js
// 访谈合集详情页

const api = require('../../utils/api');
const interviewData = require('../../utils/interview-data');

Page({
  data: {
    collectionId: '',
    collection: null,
    interviewList: [],
    loading: true,
    refreshing: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    regionName: ''
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ collectionId: id });
      this.loadCollectionDetail();
      this.loadInterviews();
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' });
    }
  },

  onShow() {
    if (this.data.page === 1 && this.data.interviewList.length > 0) {
      this.refreshData();
    }
  },

  onPullDownRefresh() {
    this.refreshData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadInterviews();
    }
  },

  async loadCollectionDetail() {
    try {
      const res = await api.getInterviewCollectionDetail(this.data.collectionId);
      if (res.code === 200) {
        const collection = res.data;
        const typeInfo = interviewData.COLLECTION_TYPES.find(t => t.id === collection.id);
        if (typeInfo) {
          collection.icon = typeInfo.icon;
          collection.name = typeInfo.name;
        }
        if (!collection.description) {
          collection.description = this.getCollectionDescription(collection.id);
        }
        if (!collection.coverImage) {
          collection.coverImage = this.getCollectionCover(collection.id);
        }
        this.setData({ collection });
        wx.setNavigationBarTitle({ title: collection.name });
      } else {
        this.loadMockCollection();
      }
    } catch (error) {
      console.error('[CollectionDetail] 加载合集详情失败:', error);
      this.loadMockCollection();
    }
  },

  loadMockCollection() {
    const typeInfo = interviewData.COLLECTION_TYPES.find(t => t.id === this.data.collectionId);
    if (typeInfo) {
      const interviews = interviewData.filterInterviews(
        interviewData.DEFAULT_INTERVIEWS,
        { collectionId: this.data.collectionId }
      );
      const collection = {
        id: typeInfo.id,
        name: typeInfo.name,
        icon: typeInfo.icon,
        description: this.getCollectionDescription(typeInfo.id),
        coverImage: this.getCollectionCover(typeInfo.id),
        interviewCount: interviews.length,
        viewCount: interviews.reduce((sum, i) => sum + (i.viewCount || 0), 0)
      };
      this.setData({ collection });
      wx.setNavigationBarTitle({ title: collection.name });
    }
  },

  getCollectionDescription(collectionId) {
    const descriptions = {
      'craftsman': '记录村里那些身怀绝技的老匠人，他们用一生诠释了什么是工匠精神。从木工到陶艺，从编织到雕刻，每一位匠人都有自己的传奇故事。',
      'solar_terms': '跟随二十四节气的脚步，聆听老人们讲述节气里的生活智慧。春种、夏耘、秋收、冬藏，每一个节气都承载着祖辈们对自然的敬畏与理解。',
      'village_history': '透过老人们的记忆，重温那些关于村庄的沧桑巨变与温情往事。从旧时光到新时代，村庄的每一步变迁都值得被记录。',
      'red_story': '聆听革命先辈的故事，传承红色基因，铭记峥嵘岁月。那些战火纷飞的年代，那些感人至深的事迹，永远值得我们缅怀与学习。',
      'food_culture': '舌尖上的记忆，老人们讲述的传统美食与背后的故事。每一道家乡菜，都承载着家人的温暖和故乡的味道。',
      'traditional_medicine': '杏林春暖，记录乡间老中医的行医故事与祖传秘方。千百年来，中医药守护着乡民的健康，这些宝贵的经验值得被传承下去。'
    };
    return descriptions[collectionId] || '探索更多乡村文化故事，感受乡村的温度与力量。';
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

  async loadInterviews() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const res = await api.getInterviewList({
        collectionId: this.data.collectionId,
        page: this.data.page,
        pageSize: this.data.pageSize
      });

      if (res.code === 200) {
        const newList = this.data.page === 1
          ? res.data.list
          : [...this.data.interviewList, ...res.data.list];

        const processedList = newList.map(interview => {
          const region = interviewData.REGIONS.find(r => r.id === interview.region);
          const craftNames = interview.crafts.map(craftId => {
            const craft = interviewData.CRAFT_TYPES.find(c => c.id === craftId);
            return craft ? craft.name : craftId;
          });
          return {
            ...interview,
            regionName: region ? region.name : '',
            craftNames
          };
        });

        this.setData({
          interviewList: processedList,
          hasMore: res.data.hasMore,
          page: this.data.page + 1
        });
      } else {
        this.loadMockInterviews();
      }
    } catch (error) {
      console.error('[CollectionDetail] 加载访谈列表失败:', error);
      this.loadMockInterviews();
    } finally {
      this.setData({ loading: false });
    }
  },

  loadMockInterviews() {
    const interviews = interviewData.filterInterviews(
      interviewData.DEFAULT_INTERVIEWS,
      { collectionId: this.data.collectionId }
    );

    const processedList = interviews.map(interview => {
      const region = interviewData.REGIONS.find(r => r.id === interview.region);
      const craftNames = interview.crafts.map(craftId => {
        const craft = interviewData.CRAFT_TYPES.find(c => c.id === craftId);
        return craft ? craft.name : craftId;
      });
      return {
        ...interview,
        regionName: region ? region.name : '',
        craftNames
      };
    });

    this.setData({
      interviewList: processedList,
      hasMore: false
    });
  },

  async refreshData() {
    this.setData({ refreshing: true, page: 1, hasMore: true });
    try {
      await Promise.all([
        this.loadCollectionDetail(),
        this.loadInterviews()
      ]);
    } catch (error) {
      console.error('[CollectionDetail] 刷新失败:', error);
    } finally {
      this.setData({ refreshing: false });
    }
  },

  goToInterviewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/interview-detail/interview-detail?id=${id}`
    });
  },

  goToCreateInterview() {
    const app = getApp();
    if (!app.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/interview-create/interview-create'
    });
  },

  onShareAppMessage() {
    const { collection } = this.data;
    if (!collection) return {};
    return {
      title: `${collection.name} - 口述史专题`,
      path: `/pages/interview-collection-detail/interview-collection-detail?id=${collection.id}`
    };
  }
});
