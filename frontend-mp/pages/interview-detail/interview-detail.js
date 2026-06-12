// pages/interview-detail/interview-detail.js
// 访谈详情页

const api = require('../../utils/api');
const interviewData = require('../../utils/interview-data');
const dialect = require('../../utils/dialect-dictionary');

Page({
  data: {
    interviewId: '',
    interview: null,
    relatedFigure: null,
    collections: [],
    loading: true,
    isLike: false,
    likeCount: 0,
    craftNames: [],
    regionName: '',
    regionPinyin: '',
    intervieweePinyin: '',
    interviewLocationPinyin: '',
    contentParagraphs: []
  },

  async onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ interviewId: id });
      await this.loadInterviewDetail();
      await this.checkLikeStatus();
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' });
    }
  },

  async loadInterviewDetail() {
    this.setData({ loading: true });
    try {
      const res = await api.getInterviewDetail(this.data.interviewId);
      if (res.code === 200) {
        const interview = res.data;
        
        const craftNames = interview.crafts.map(craftId => {
          const craft = interviewData.CRAFT_TYPES.find(c => c.id === craftId);
          return craft ? craft.name : craftId;
        });

        const region = interviewData.REGIONS.find(r => r.id === interview.region);
        const regionName = region ? region.name : '';
        const regionInfo = dialect.getPlaceNamePinyin(regionName);
        const regionPinyin = regionInfo.pinyin || '';

        const nameInfo = dialect.getInterviewNamePinyin(interview.intervieweeName);
        const intervieweePinyin = nameInfo.pinyin || '';

        const locationInfo = dialect.getPlaceNamePinyin(interview.interviewLocation);
        const interviewLocationPinyin = locationInfo.pinyin || '';

        const contentParagraphs = interview.content
          .split('\n\n')
          .filter(p => p.trim())
          .map(p => {
            const [speaker, ...textParts] = p.split('：');
            const speakerName = speaker ? speaker.trim() : '';
            const speakerPinyinInfo = dialect.getInterviewNamePinyin(speakerName);
            return {
              speaker: speakerName,
              speakerPinyin: speakerPinyinInfo.pinyin || '',
              text: textParts.join('：').trim()
            };
          });

        const collections = interview.collectionIds.map(collectionId => {
          const collection = interviewData.COLLECTION_TYPES.find(c => c.id === collectionId);
          return collection ? collection : { id: collectionId, name: collectionId, icon: '📚' };
        });

        this.setData({
          interview,
          craftNames,
          regionName,
          regionPinyin,
          intervieweePinyin,
          interviewLocationPinyin,
          contentParagraphs,
          collections,
          likeCount: interview.likeCount || 0
        });

        wx.setNavigationBarTitle({ title: `${interview.intervieweeName}访谈录` });

        if (interview.relatedFigureId) {
          this.loadRelatedFigure(interview.relatedFigureId);
        }
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[InterviewDetail] 加载详情失败:', error);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadRelatedFigure(figureId) {
    try {
      const res = await api.getFigureDetail(figureId);
      if (res.code === 200) {
        this.setData({ relatedFigure: res.data });
      }
    } catch (error) {
      console.error('[InterviewDetail] 加载关联人物失败:', error);
    }
  },

  async checkLikeStatus() {
    try {
      const res = await api.checkInterviewLike(this.data.interviewId);
      if (res.code === 200) {
        this.setData({ isLike: res.data.isLike });
      }
    } catch (error) {
      console.error('[InterviewDetail] 检查点赞状态失败:', error);
    }
  },

  async toggleLike() {
    const app = getApp();
    if (!app.checkLogin()) return;

    if (this.data.isLike) {
      await this.doUnlike();
    } else {
      await this.doLike();
    }
  },

  async doLike() {
    try {
      const res = await api.likeInterview(this.data.interviewId);
      if (res.code === 200) {
        this.setData({
          isLike: true,
          likeCount: res.data.likeCount
        });
        wx.showToast({ title: '点赞成功', icon: 'success' });
      }
    } catch (error) {
      console.error('[InterviewDetail] 点赞失败:', error);
      wx.showToast({ title: '点赞失败，请重试', icon: 'none' });
    }
  },

  async doUnlike() {
    try {
      const res = await api.unlikeInterview(this.data.interviewId);
      if (res.code === 200) {
        this.setData({
          isLike: false,
          likeCount: res.data.likeCount
        });
        wx.showToast({ title: '已取消点赞', icon: 'none' });
      }
    } catch (error) {
      console.error('[InterviewDetail] 取消点赞失败:', error);
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  },

  goToFigureDetail() {
    const { relatedFigure } = this.data;
    if (!relatedFigure) return;
    wx.navigateTo({
      url: `/pages/figure-detail/figure-detail?id=${relatedFigure.id}`
    });
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
  },

  onShareAppMessage() {
    const { interview } = this.data;
    if (!interview) return {};
    return {
      title: `${interview.intervieweeName} - 口述史访谈录`,
      path: `/pages/interview-detail/interview-detail?id=${interview.id}`
    };
  },

  onShareTimeline() {
    const { interview } = this.data;
    if (!interview) return {};
    return {
      title: `${interview.intervieweeName}的口述史访谈`,
      query: `id=${interview.id}`
    };
  }
});
