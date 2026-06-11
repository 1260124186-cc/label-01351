// utils/api.js
// API 接口封装 - 支持本地存储模式和网络请求模式
// 所有接口返回统一格式: { code: number, data: any, message: string }

const util = require('./util');
const figureData = require('./figure-data');

const config = {
  useRemote: false,
  baseUrl: '',
  timeout: 10000
};

const setConfig = (options = {}) => {
  Object.assign(config, options);
};

const getConfig = () => ({ ...config });

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const withErrorHandler = async (fn, errorMsg = '操作失败') => {
  try {
    return await fn();
  } catch (error) {
    console.error(`[API Error] ${errorMsg}:`, error);
    return {
      code: 500,
      data: null,
      message: errorMsg
    };
  }
};

const request = (options) => {
  return new Promise((resolve) => {
    const { url, method = 'GET', data = {}, header = {} } = options;

    if (!config.baseUrl) {
      resolve({
        code: 500,
        data: null,
        message: 'baseUrl 未配置'
      });
      return;
    }

    const fullUrl = config.baseUrl + url;

    wx.request({
      url: fullUrl,
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...header
      },
      timeout: config.timeout,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          resolve({
            code: res.statusCode,
            data: null,
            message: `请求失败: ${res.statusCode}`
          });
        }
      },
      fail: (err) => {
        console.error('[Network Error]', err);
        resolve({
          code: 500,
          data: null,
          message: '网络请求失败，请检查网络连接'
        });
      }
    });
  });
};

const checkLogin = () => {
  const isLoggedIn = wx.getStorageSync('isLoggedIn');
  const userInfo = wx.getStorageSync('userInfo');
  return !!(isLoggedIn && userInfo);
};

const requireLogin = () => {
  if (!checkLogin()) {
    return { code: 401, data: null, message: '请先登录' };
  }
  return null;
};

const getCurrentUserId = () => {
  const userInfo = wx.getStorageSync('userInfo');
  if (!userInfo) {
    return null;
  }
  return userInfo.id;
};

const storageApi = {
  getArticleList: async (params = {}) => {
    await delay(500);
    const { category = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    let articles = wx.getStorageSync('articles') || [];
    articles = articles.filter(item => item.status === 1);
    if (category && category !== 'all') {
      articles = articles.filter(item => item.category === category);
    }
    if (keyword && keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      articles = articles.filter(item =>
        item.title.toLowerCase().includes(kw) ||
        item.content.toLowerCase().includes(kw)
      );
    }
    articles.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    const total = articles.length;
    const start = (page - 1) * pageSize;
    const list = articles.slice(start, start + pageSize);
    return {
      code: 200,
      data: { list, total, page, pageSize, hasMore: start + pageSize < total },
      message: 'success'
    };
  },

  getArticleDetail: async (id) => {
    await delay(300);
    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const articles = wx.getStorageSync('articles') || [];
    const article = articles.find(item => item.id === id);
    if (!article) {
      return { code: 404, data: null, message: '文章不存在' };
    }
    article.viewCount = (article.viewCount || 0) + 1;
    wx.setStorageSync('articles', articles);
    return { code: 200, data: article, message: 'success' };
  },

  publishArticle: async (data) => {
    await delay(800);
    const authError = requireLogin();
    if (authError) return authError;
    if (!data.title || !data.title.trim()) {
      return { code: 400, data: null, message: '标题不能为空' };
    }
    if (!data.content || !data.content.trim()) {
      return { code: 400, data: null, message: '内容不能为空' };
    }
    if (!data.category) {
      return { code: 400, data: null, message: '请选择分类' };
    }
    const userInfo = wx.getStorageSync('userInfo');
    const articles = wx.getStorageSync('articles') || [];
    const newArticle = {
      id: util.generateId('article'),
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category,
      authorId: userInfo.id,
      authorName: userInfo.nickname,
      viewCount: 0,
      likeCount: 0,
      createTime: util.formatDate(new Date(), 'YYYY-MM-DD'),
      status: 1
    };
    if (data.figureId) {
      newArticle.figureId = data.figureId;
    }
    articles.unshift(newArticle);
    wx.setStorageSync('articles', articles);
    if (data.figureId) {
      const figures = wx.getStorageSync('figures') || [];
      const figureIndex = figures.findIndex(item => item.id === data.figureId);
      if (figureIndex > -1) {
        if (!figures[figureIndex].relatedArticles) {
          figures[figureIndex].relatedArticles = [];
        }
        if (!figures[figureIndex].relatedArticles.includes(newArticle.id)) {
          figures[figureIndex].relatedArticles.push(newArticle.id);
        }
        wx.setStorageSync('figures', figures);
      }
    }
    return { code: 200, data: newArticle, message: '发布成功' };
  },

  getMyArticles: async () => {
    await delay(400);
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    let articles = wx.getStorageSync('articles') || [];
    articles = articles.filter(item => item.authorId === userId);
    articles.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    return {
      code: 200,
      data: { list: articles, total: articles.length },
      message: 'success'
    };
  },

  getCategoryList: async () => {
    await delay(200);
    const categories = wx.getStorageSync('categories') || [];
    return { code: 200, data: categories, message: 'success' };
  },

  getUserInfo: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const userInfo = wx.getStorageSync('userInfo');
    return { code: 200, data: userInfo, message: 'success' };
  },

  updateUserInfo: async (data) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;
    if (data.nickname && (data.nickname.length < 2 || data.nickname.length > 20)) {
      return { code: 400, data: null, message: '昵称需要2-20个字符' };
    }
    const userInfo = wx.getStorageSync('userInfo');
    const updatedInfo = { ...userInfo, ...data };
    wx.setStorageSync('userInfo', updatedInfo);
    if (data.nickname) {
      const userId = getCurrentUserId();
      const articles = wx.getStorageSync('articles') || [];
      const updatedArticles = articles.map(item =>
        item.authorId === userId
          ? { ...item, authorName: data.nickname }
          : item
      );
      wx.setStorageSync('articles', updatedArticles);
    }
    return { code: 200, data: updatedInfo, message: '更新成功' };
  },

  getUserStats: async () => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    const articles = wx.getStorageSync('articles') || [];
    const myArticles = articles.filter(item => item.authorId === userId);
    const totalLikes = myArticles.reduce((sum, item) => sum + (item.likeCount || 0), 0);
    const totalViews = myArticles.reduce((sum, item) => sum + (item.viewCount || 0), 0);
    return {
      code: 200,
      data: { articleCount: myArticles.length, likeCount: totalLikes, viewCount: totalViews },
      message: 'success'
    };
  },

  likeArticle: async (id) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    const articles = wx.getStorageSync('articles') || [];
    const article = articles.find(item => item.id === id);
    if (!article) {
      return { code: 404, data: null, message: '文章不存在' };
    }
    const likes = wx.getStorageSync('likes') || {};
    const userLikes = likes[userId] || [];
    if (userLikes.includes(id)) {
      return { code: 200, data: { isLike: true, likeCount: article.likeCount }, message: '已点赞' };
    }
    article.likeCount = (article.likeCount || 0) + 1;
    wx.setStorageSync('articles', articles);
    userLikes.push(id);
    likes[userId] = userLikes;
    wx.setStorageSync('likes', likes);
    if (article.authorId && article.authorId !== userId) {
      const userInfo = wx.getStorageSync('userInfo');
      storageApi.createNotification({
        type: 'like',
        fromUserId: userId,
        fromUserName: userInfo ? userInfo.nickname : '',
        targetUserId: article.authorId,
        targetId: id,
        targetTitle: article.title,
        content: (userInfo ? userInfo.nickname : '有人') + ' 赞了你的文章',
        jumpType: 'article',
        jumpId: id
      });
    }
    return { code: 200, data: { isLike: true, likeCount: article.likeCount }, message: '点赞成功' };
  },

  unlikeArticle: async (id) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    const articles = wx.getStorageSync('articles') || [];
    const article = articles.find(item => item.id === id);
    if (!article) {
      return { code: 404, data: null, message: '文章不存在' };
    }
    article.likeCount = Math.max((article.likeCount || 0) - 1, 0);
    wx.setStorageSync('articles', articles);
    const likes = wx.getStorageSync('likes') || {};
    const userLikes = likes[userId] || [];
    const index = userLikes.indexOf(id);
    if (index > -1) {
      userLikes.splice(index, 1);
      likes[userId] = userLikes;
      wx.setStorageSync('likes', likes);
    }
    return { code: 200, data: { isLike: false, likeCount: article.likeCount }, message: '已取消点赞' };
  },

  checkLike: async (id) => {
    await delay(100);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    const likes = wx.getStorageSync('likes') || {};
    const userLikes = likes[userId] || [];
    const isLike = userLikes.includes(id);
    return { code: 200, data: { isLike }, message: 'success' };
  },

  favoriteArticle: async (id) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    const favorites = wx.getStorageSync('favorites') || {};
    const userFavorites = favorites[userId] || [];
    if (userFavorites.includes(id)) {
      return { code: 200, data: { isFavorite: true }, message: '已收藏' };
    }
    userFavorites.push(id);
    favorites[userId] = userFavorites;
    wx.setStorageSync('favorites', favorites);
    const articles = wx.getStorageSync('articles') || [];
    const article = articles.find(item => item.id === id);
    if (article && article.authorId && article.authorId !== userId) {
      const userInfo = wx.getStorageSync('userInfo');
      storageApi.createNotification({
        type: 'favorite',
        fromUserId: userId,
        fromUserName: userInfo ? userInfo.nickname : '',
        targetUserId: article.authorId,
        targetId: id,
        targetTitle: article.title,
        content: (userInfo ? userInfo.nickname : '有人') + ' 收藏了你的文章',
        jumpType: 'article',
        jumpId: id
      });
    }
    return { code: 200, data: { isFavorite: true }, message: '收藏成功' };
  },

  unfavoriteArticle: async (id) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    const favorites = wx.getStorageSync('favorites') || {};
    const userFavorites = favorites[userId] || [];
    const index = userFavorites.indexOf(id);
    if (index > -1) {
      userFavorites.splice(index, 1);
      favorites[userId] = userFavorites;
      wx.setStorageSync('favorites', favorites);
    }
    return { code: 200, data: { isFavorite: false }, message: '已取消收藏' };
  },

  checkFavorite: async (id) => {
    await delay(100);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    const favorites = wx.getStorageSync('favorites') || {};
    const userFavorites = favorites[userId] || [];
    const isFavorite = userFavorites.includes(id);
    return { code: 200, data: { isFavorite }, message: 'success' };
  },

  getFavoriteList: async (params = {}) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;
    const { category = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    const userId = getCurrentUserId();
    const favorites = wx.getStorageSync('favorites') || {};
    const userFavorites = favorites[userId] || [];
    if (userFavorites.length === 0) {
      return {
        code: 200,
        data: { list: [], total: 0, page, pageSize, hasMore: false },
        message: 'success'
      };
    }
    let articles = wx.getStorageSync('articles') || [];
    articles = articles.filter(item => userFavorites.includes(item.id));
    if (category && category !== 'all') {
      articles = articles.filter(item => item.category === category);
    }
    if (keyword && keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      articles = articles.filter(item =>
        item.title.toLowerCase().includes(kw) ||
        item.content.toLowerCase().includes(kw)
      );
    }
    articles.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    const total = articles.length;
    const start = (page - 1) * pageSize;
    const list = articles.slice(start, start + pageSize);
    return {
      code: 200,
      data: { list, total, page, pageSize, hasMore: start + pageSize < total },
      message: 'success'
    };
  },

  getFigureList: async (params = {}) => {
    await delay(500);
    const { identity = 'all', craft = 'all', region = 'all', era = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    let figures = wx.getStorageSync('figures') || [];
    figures = figures.filter(item => item.status === 1);

    figures = figureData.filterFigures(figures, { identity, craft, region, era, keyword });
    figures.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));

    const total = figures.length;
    const start = (page - 1) * pageSize;
    const list = figures.slice(start, start + pageSize).map(item => ({
      ...item,
      identityInfo: figureData.getIdentityInfo(item.identity),
      regionName: figureData.getRegionName(item.region),
      eraName: figureData.getEraName(item.era),
      craftNames: figureData.getCraftNames(item.crafts),
      lifespan: figureData.formatLifespan(item.birthYear, item.deathYear),
      age: figureData.getAge(item.birthYear, item.deathYear)
    }));

    return {
      code: 200,
      data: { list, total, page, pageSize, hasMore: start + pageSize < total },
      message: 'success'
    };
  },

  getFigureDetail: async (id) => {
    await delay(300);
    if (!id) {
      return { code: 400, data: null, message: '人物ID不能为空' };
    }
    const figures = wx.getStorageSync('figures') || [];
    const figure = figures.find(item => item.id === id);
    if (!figure) {
      return { code: 404, data: null, message: '人物不存在' };
    }

    figure.viewCount = (figure.viewCount || 0) + 1;
    wx.setStorageSync('figures', figures);

    const articles = wx.getStorageSync('articles') || [];
    const relatedArticleIds = new Set();
    if (figure.relatedArticles && Array.isArray(figure.relatedArticles)) {
      figure.relatedArticles.forEach(articleId => relatedArticleIds.add(articleId));
    }
    articles.forEach(item => {
      if (item.figureId === id && item.status === 1) {
        relatedArticleIds.add(item.id);
      }
    });
    const relatedArticles = articles
      .filter(item => relatedArticleIds.has(item.id) && item.status === 1)
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    const result = {
      ...figure,
      identityInfo: figureData.getIdentityInfo(figure.identity),
      regionName: figureData.getRegionName(figure.region),
      eraName: figureData.getEraName(figure.era),
      craftNames: figureData.getCraftNames(figure.crafts),
      lifespan: figureData.formatLifespan(figure.birthYear, figure.deathYear),
      age: figureData.getAge(figure.birthYear, figure.deathYear),
      relatedArticleList: relatedArticles
    };

    return { code: 200, data: result, message: 'success' };
  },

  getFigureOptions: async () => {
    await delay(200);
    let figures = wx.getStorageSync('figures') || [];
    figures = figures.filter(item => item.status === 1);
    const options = figures.map(item => ({
      id: item.id,
      name: item.name,
      identity: item.identity,
      identityInfo: figureData.getIdentityInfo(item.identity),
      briefIntroduction: item.briefIntroduction
    }));
    return { code: 200, data: options, message: 'success' };
  },

  createFigureDraft: async (data) => {
    await delay(800);
    const authError = requireLogin();
    if (authError) return authError;

    if (!data.name || !data.name.trim()) {
      return { code: 400, data: null, message: '人物姓名不能为空' };
    }
    if (!data.identity) {
      return { code: 400, data: null, message: '请选择人物身份' };
    }
    if (!data.briefIntroduction || !data.briefIntroduction.trim()) {
      return { code: 400, data: null, message: '请填写人物简介' };
    }

    const userInfo = wx.getStorageSync('userInfo');
    const drafts = wx.getStorageSync('figureDrafts') || [];

    const newDraft = {
      id: util.generateId('figure_draft'),
      name: data.name.trim(),
      avatar: data.avatar || '',
      birthYear: data.birthYear || null,
      deathYear: data.deathYear || null,
      identity: data.identity,
      region: data.region || '',
      era: data.era || '',
      crafts: data.crafts || [],
      briefIntroduction: data.briefIntroduction.trim(),
      detailedIntroduction: data.detailedIntroduction || '',
      timeline: data.timeline || [],
      works: data.works || [],
      submitterId: userInfo.id,
      submitterName: userInfo.nickname,
      createTime: util.formatDate(new Date(), 'YYYY-MM-DD'),
      status: 0,
      reviewStatus: 'pending'
    };

    drafts.unshift(newDraft);
    wx.setStorageSync('figureDrafts', drafts);

    return { code: 200, data: newDraft, message: '提交成功，等待审核' };
  },

  getMyFigureDrafts: async () => {
    await delay(400);
    const authError = requireLogin();
    if (authError) return authError;

    const userId = getCurrentUserId();
    let drafts = wx.getStorageSync('figureDrafts') || [];
    drafts = drafts.filter(item => item.submitterId === userId);
    drafts.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    const list = drafts.map(item => ({
      ...item,
      identityInfo: figureData.getIdentityInfo(item.identity),
      regionName: figureData.getRegionName(item.region),
      eraName: figureData.getEraName(item.era)
    }));

    return {
      code: 200,
      data: { list, total: list.length },
      message: 'success'
    };
  },

  getFilterOptions: async () => {
    await delay(100);
    const identityList = [{ id: 'all', name: '全部身份', icon: '👥' }, ...Object.values(figureData.IDENTITY_TYPES)];
    const craftList = [{ id: 'all', name: '全部技艺' }, ...figureData.CRAFTS];
    const regionList = [{ id: 'all', name: '全部地区' }, ...figureData.REGIONS];
    const eraList = [{ id: 'all', name: '全部年代' }, ...figureData.ERA_TYPES];

    return {
      code: 200,
      data: { identityList, craftList, regionList, eraList },
      message: 'success'
    };
  },

  likeFigure: async (id) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '人物ID不能为空' };
    }
    const userId = getCurrentUserId();
    const figures = wx.getStorageSync('figures') || [];
    const figure = figures.find(item => item.id === id);
    if (!figure) {
      return { code: 404, data: null, message: '人物不存在' };
    }
    const likes = wx.getStorageSync('figureLikes') || {};
    const userLikes = likes[userId] || [];
    if (userLikes.includes(id)) {
      return { code: 200, data: { isLike: true, likeCount: figure.likeCount }, message: '已点赞' };
    }
    figure.likeCount = (figure.likeCount || 0) + 1;
    wx.setStorageSync('figures', figures);
    userLikes.push(id);
    likes[userId] = userLikes;
    wx.setStorageSync('figureLikes', likes);
    return { code: 200, data: { isLike: true, likeCount: figure.likeCount }, message: '点赞成功' };
  },

  unlikeFigure: async (id) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '人物ID不能为空' };
    }
    const userId = getCurrentUserId();
    const figures = wx.getStorageSync('figures') || [];
    const figure = figures.find(item => item.id === id);
    if (!figure) {
      return { code: 404, data: null, message: '人物不存在' };
    }
    figure.likeCount = Math.max((figure.likeCount || 0) - 1, 0);
    wx.setStorageSync('figures', figures);
    const likes = wx.getStorageSync('figureLikes') || {};
    const userLikes = likes[userId] || [];
    const index = userLikes.indexOf(id);
    if (index > -1) {
      userLikes.splice(index, 1);
      likes[userId] = userLikes;
      wx.setStorageSync('figureLikes', likes);
    }
    return { code: 200, data: { isLike: false, likeCount: figure.likeCount }, message: '已取消点赞' };
  },

  checkFigureLike: async (id) => {
    await delay(100);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '人物ID不能为空' };
    }
    const userId = getCurrentUserId();
    const likes = wx.getStorageSync('figureLikes') || {};
    const userLikes = likes[userId] || [];
    const isLike = userLikes.includes(id);
    return { code: 200, data: { isLike }, message: 'success' };
  },

  getTopicList: async (params = {}) => {
    await delay(500);
    const { category = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    let topics = wx.getStorageSync('topics') || [];
    topics = topics.filter(item => item.status === 1);

    if (category && category !== 'all') {
      topics = topics.filter(item => item.category === category);
    }
    if (keyword && keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      topics = topics.filter(item =>
        item.title.toLowerCase().includes(kw) ||
        item.introduction.toLowerCase().includes(kw)
      );
    }
    topics.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    const total = topics.length;
    const start = (page - 1) * pageSize;
    const list = topics.slice(start, start + pageSize).map(item => ({
      ...item,
      articleCount: (item.articleIds || []).length
    }));
    return {
      code: 200,
      data: { list, total, page, pageSize, hasMore: start + pageSize < total },
      message: 'success'
    };
  },

  getTopicDetail: async (id) => {
    await delay(300);
    if (!id) {
      return { code: 400, data: null, message: '专题ID不能为空' };
    }
    const topics = wx.getStorageSync('topics') || [];
    const topic = topics.find(item => item.id === id);
    if (!topic) {
      return { code: 404, data: null, message: '专题不存在' };
    }

    topic.viewCount = (topic.viewCount || 0) + 1;
    wx.setStorageSync('topics', topics);

    const articles = wx.getStorageSync('articles') || [];
    const articleList = articles.filter(item =>
      (topic.articleIds || []).includes(item.id) && item.status === 1
    ).map(item => ({
      ...item,
      categoryName: util.getCategoryName(item.category),
      summary: util.truncateText(item.content, 100)
    }));

    const relatedTopics = (topic.relatedTopicIds && topic.relatedTopicIds.length > 0)
      ? topics
          .filter(item => topic.relatedTopicIds.includes(item.id) && item.status === 1)
          .map(item => ({
            id: item.id,
            title: item.title,
            cover: item.cover,
            articleCount: (item.articleIds || []).length
          }))
      : topics
          .filter(item => item.id !== id && item.status === 1 && item.category === topic.category)
          .slice(0, 4)
          .map(item => ({
            id: item.id,
            title: item.title,
            cover: item.cover,
            articleCount: (item.articleIds || []).length
          }));

    return {
      code: 200,
      data: { ...topic, articleList, relatedTopics, articleCount: articleList.length },
      message: 'success'
    };
  },

  createTopic: async (data) => {
    await delay(800);
    const authError = requireLogin();
    if (authError) return authError;
    if (!data.title || !data.title.trim()) {
      return { code: 400, data: null, message: '专题标题不能为空' };
    }
    if (!data.category || !data.category.trim()) {
      return { code: 400, data: null, message: '专题分类不能为空' };
    }
    if (!data.introduction || !data.introduction.trim()) {
      return { code: 400, data: null, message: '专题导语不能为空' };
    }
    if (data.introduction.trim().length < 10) {
      return { code: 400, data: null, message: '专题导语至少需要10个字符' };
    }
    const userInfo = wx.getStorageSync('userInfo');
    const topics = wx.getStorageSync('topics') || [];
    const newTopic = {
      id: util.generateId('topic'),
      title: data.title.trim(),
      cover: data.coverImage || data.cover || '',
      introduction: data.introduction.trim(),
      category: data.category || 'culture',
      articleIds: data.articleIds || [],
      extendedReading: data.extendedReading || [],
      relatedTopicIds: data.relatedTopicIds || [],
      tags: data.tags || [],
      authorId: userInfo.id,
      authorName: userInfo.nickname,
      viewCount: 0,
      likeCount: 0,
      createTime: util.formatDate(new Date(), 'YYYY-MM-DD'),
      status: 1
    };
    topics.unshift(newTopic);
    wx.setStorageSync('topics', topics);
    return { code: 200, data: newTopic, message: '创建成功' };
  },

  updateTopic: async (id, data) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '专题ID不能为空' };
    }
    const topics = wx.getStorageSync('topics') || [];
    const index = topics.findIndex(item => item.id === id);
    if (index === -1) {
      return { code: 404, data: null, message: '专题不存在' };
    }
    const updateData = { ...data };
    if (updateData.coverImage !== undefined) {
      updateData.cover = updateData.coverImage;
      delete updateData.coverImage;
    }
    topics[index] = { ...topics[index], ...updateData };
    wx.setStorageSync('topics', topics);
    return { code: 200, data: topics[index], message: '更新成功' };
  },

  deleteTopic: async (id) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '专题ID不能为空' };
    }
    const topics = wx.getStorageSync('topics') || [];
    const index = topics.findIndex(item => item.id === id);
    if (index === -1) {
      return { code: 404, data: null, message: '专题不存在' };
    }
    topics.splice(index, 1);
    wx.setStorageSync('topics', topics);
    return { code: 200, data: null, message: '删除成功' };
  },

  getEncyclopediaList: async (params = {}) => {
    await delay(500);
    const { category = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    let entries = wx.getStorageSync('encyclopedia') || [];
    entries = entries.filter(item => item.status === 1);

    if (category && category !== 'all') {
      entries = entries.filter(item => item.category === category);
    }
    if (keyword && keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      entries = entries.filter(item =>
        item.title.toLowerCase().includes(kw) ||
        item.summary.toLowerCase().includes(kw)
      );
    }
    entries.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    const total = entries.length;
    const start = (page - 1) * pageSize;
    const list = entries.slice(start, start + pageSize);
    return {
      code: 200,
      data: { list, total, page, pageSize, hasMore: start + pageSize < total },
      message: 'success'
    };
  },

  getEncyclopediaDetail: async (id) => {
    await delay(300);
    if (!id) {
      return { code: 400, data: null, message: '词条ID不能为空' };
    }
    const entries = wx.getStorageSync('encyclopedia') || [];
    const entry = entries.find(item => item.id === id);
    if (!entry) {
      return { code: 404, data: null, message: '词条不存在' };
    }

    entry.viewCount = (entry.viewCount || 0) + 1;
    wx.setStorageSync('encyclopedia', entries);

    const articles = wx.getStorageSync('articles') || [];
    const relatedArticles = articles.filter(item =>
      (entry.relatedArticleIds || []).includes(item.id) && item.status === 1
    ).map(item => ({
      ...item,
      categoryName: util.getCategoryName(item.category),
      summary: util.truncateText(item.content, 80)
    }));

    const topics = wx.getStorageSync('topics') || [];
    const relatedTopics = topics.filter(item =>
      (entry.relatedTopicIds || []).includes(item.id) && item.status === 1
    ).map(item => ({
      id: item.id,
      title: item.title,
      cover: item.cover,
      articleCount: (item.articleIds || []).length
    }));

    return {
      code: 200,
      data: { ...entry, relatedArticles, relatedTopics },
      message: 'success'
    };
  },

  createEncyclopedia: async (data) => {
    await delay(800);
    const authError = requireLogin();
    if (authError) return authError;
    if (!data.title || !data.title.trim()) {
      return { code: 400, data: null, message: '词条标题不能为空' };
    }
    if (!data.category || !data.category.trim()) {
      return { code: 400, data: null, message: '词条分类不能为空' };
    }
    if (!data.summary || !data.summary.trim()) {
      return { code: 400, data: null, message: '词条摘要不能为空' };
    }
    if (data.summary.trim().length < 10) {
      return { code: 400, data: null, message: '词条摘要至少需要10个字符' };
    }
    if (!data.content || !data.content.trim()) {
      return { code: 400, data: null, message: '词条内容不能为空' };
    }
    if (data.content.trim().length < 20) {
      return { code: 400, data: null, message: '词条内容至少需要20个字符' };
    }
    const userInfo = wx.getStorageSync('userInfo');
    const entries = wx.getStorageSync('encyclopedia') || [];
    const newEntry = {
      id: util.generateId('encyclopedia'),
      title: data.title.trim(),
      cover: data.cover || '',
      summary: data.summary.trim(),
      content: data.content.trim(),
      category: data.category || 'custom',
      catalog: data.catalog || [],
      relatedArticleIds: data.relatedArticleIds || [],
      relatedTopicIds: data.relatedTopicIds || [],
      tags: data.tags || [],
      authorId: userInfo.id,
      authorName: userInfo.nickname,
      viewCount: 0,
      likeCount: 0,
      createTime: util.formatDate(new Date(), 'YYYY-MM-DD'),
      status: 1
    };
    entries.unshift(newEntry);
    wx.setStorageSync('encyclopedia', entries);
    return { code: 200, data: newEntry, message: '创建成功' };
  },

  updateEncyclopedia: async (id, data) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '词条ID不能为空' };
    }
    const entries = wx.getStorageSync('encyclopedia') || [];
    const index = entries.findIndex(item => item.id === id);
    if (index === -1) {
      return { code: 404, data: null, message: '词条不存在' };
    }
    entries[index] = { ...entries[index], ...data };
    wx.setStorageSync('encyclopedia', entries);
    return { code: 200, data: entries[index], message: '更新成功' };
  },

  deleteEncyclopedia: async (id) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '词条ID不能为空' };
    }
    const entries = wx.getStorageSync('encyclopedia') || [];
    const index = entries.findIndex(item => item.id === id);
    if (index === -1) {
      return { code: 404, data: null, message: '词条不存在' };
    }
    entries.splice(index, 1);
    wx.setStorageSync('encyclopedia', entries);
    return { code: 200, data: null, message: '删除成功' };
  },

  getEncyclopediaCategories: async () => {
    await delay(200);
    const categories = [
      { id: 'all', name: '全部', icon: '📚' },
      { id: 'festival', name: '节气节日', icon: '🎋' },
      { id: 'craft', name: '传统技艺', icon: '🧵' },
      { id: 'custom', name: '民俗文化', icon: '🎭' },
      { id: 'history', name: '历史典故', icon: '📜' },
      { id: 'art', name: '艺术形式', icon: '🎨' }
    ];
    return { code: 200, data: categories, message: 'success' };
  },

  getTopicCategories: async () => {
    await delay(200);
    const categories = [
      { id: 'all', name: '全部', icon: '📚' },
      { id: 'festival', name: '节日专题', icon: '🎋' },
      { id: 'craft', name: '技艺专题', icon: '🧵' },
      { id: 'custom', name: '民俗专题', icon: '🎭' },
      { id: 'figure', name: '人物专题', icon: '👤' }
    ];
    return { code: 200, data: categories, message: 'success' };
  },

  getNotificationList: async (params = {}) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;
    const { type = 'all', readStatus = 'all', page = 1, pageSize = 10 } = params;
    const userId = getCurrentUserId();
    const notifications = wx.getStorageSync('notifications') || {};
    let list = notifications[userId] || [];
    if (type && type !== 'all') {
      list = list.filter(item => item.type === type);
    }
    if (readStatus === 'unread') {
      list = list.filter(item => !item.isRead);
    } else if (readStatus === 'read') {
      list = list.filter(item => item.isRead);
    }
    list.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    const allList = notifications[userId] || [];
    const unreadCount = allList.filter(item => !item.isRead).length;
    const total = list.length;
    const start = (page - 1) * pageSize;
    const pageList = list.slice(start, start + pageSize);
    return {
      code: 200,
      data: { list: pageList, total, page, pageSize, unreadCount },
      message: 'success'
    };
  },

  getUnreadCount: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    const notifications = wx.getStorageSync('notifications') || {};
    const list = notifications[userId] || [];
    const count = list.filter(item => !item.isRead).length;
    return { code: 200, data: { count }, message: 'success' };
  },

  markAsRead: async (id) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '通知ID不能为空' };
    }
    const userId = getCurrentUserId();
    const notifications = wx.getStorageSync('notifications') || {};
    const list = notifications[userId] || [];
    const notification = list.find(item => item.id === id);
    if (!notification) {
      return { code: 404, data: null, message: '通知不存在' };
    }
    notification.isRead = true;
    wx.setStorageSync('notifications', notifications);
    return { code: 200, data: null, message: 'success' };
  },

  markAllAsRead: async () => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    const notifications = wx.getStorageSync('notifications') || {};
    const list = notifications[userId] || [];
    list.forEach(item => { item.isRead = true; });
    wx.setStorageSync('notifications', notifications);
    return { code: 200, data: null, message: 'success' };
  },

  deleteNotification: async (id) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '通知ID不能为空' };
    }
    const userId = getCurrentUserId();
    const notifications = wx.getStorageSync('notifications') || {};
    const list = notifications[userId] || [];
    const index = list.findIndex(item => item.id === id);
    if (index === -1) {
      return { code: 404, data: null, message: '通知不存在' };
    }
    list.splice(index, 1);
    wx.setStorageSync('notifications', notifications);
    return { code: 200, data: null, message: '删除成功' };
  },

  createNotification: async (data) => {
    await delay(200);
    if (!data.targetUserId) {
      return { code: 400, data: null, message: '目标用户ID不能为空' };
    }
    const notifications = wx.getStorageSync('notifications') || {};
    const newNotification = {
      id: util.generateId('ntf'),
      type: data.type || 'system',
      fromUserId: data.fromUserId || '',
      fromUserName: data.fromUserName || '',
      targetUserId: data.targetUserId,
      targetId: data.targetId || '',
      targetTitle: data.targetTitle || '',
      content: data.content || '',
      isRead: false,
      createTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      jumpType: data.jumpType || 'none',
      jumpId: data.jumpId || ''
    };
    if (!notifications[data.targetUserId]) {
      notifications[data.targetUserId] = [];
    }
    notifications[data.targetUserId].push(newNotification);
    wx.setStorageSync('notifications', notifications);
    return { code: 200, data: newNotification, message: 'success' };
  },

  getActivityTypes: async () => {
    await delay(200);
    return { code: 200, data: util.getActivityTypes(), message: 'success' };
  },

  getActivityList: async (params = {}) => {
    await delay(500);
    const { type = 'all', status = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    let activities = wx.getStorageSync('activities') || [];
    activities = activities.filter(item => item.status === 1);

    if (type && type !== 'all') {
      activities = activities.filter(item => item.type === type);
    }

    if (keyword && keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      activities = activities.filter(item =>
        item.title.toLowerCase().includes(kw) ||
        item.description.toLowerCase().includes(kw) ||
        item.location.toLowerCase().includes(kw)
      );
    }

    if (status && status !== 'all') {
      activities = activities.filter(item => {
        const s = util.getActivityStatus(item);
        return s.id === status;
      });
    }

    activities.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    const total = activities.length;
    const start = (page - 1) * pageSize;
    const list = activities.slice(start, start + pageSize).map(item => ({
      ...item,
      typeName: util.getActivityTypeName(item.type),
      typeIcon: util.getActivityTypeIcon(item.type),
      statusInfo: util.getActivityStatus(item)
    }));

    return {
      code: 200,
      data: { list, total, page, pageSize, hasMore: start + pageSize < total },
      message: 'success'
    };
  },

  getActivityDetail: async (id) => {
    await delay(300);
    if (!id) {
      return { code: 400, data: null, message: '活动ID不能为空' };
    }
    const activities = wx.getStorageSync('activities') || [];
    const activity = activities.find(item => item.id === id);
    if (!activity) {
      return { code: 404, data: null, message: '活动不存在' };
    }

    activity.viewCount = (activity.viewCount || 0) + 1;
    wx.setStorageSync('activities', activities);

    const userId = getCurrentUserId();
    const registrations = wx.getStorageSync('activityRegistrations') || {};
    const userRegistrations = registrations[userId] || [];
    const isRegistered = userRegistrations.some(item => item.activityId === id);

    const articles = wx.getStorageSync('articles') || [];
    const reviewArticles = (activity.reviewArticleIds || [])
      .map(articleId => articles.find(a => a.id === articleId && a.status === 1))
      .filter(Boolean);

    const result = {
      ...activity,
      typeName: util.getActivityTypeName(activity.type),
      typeIcon: util.getActivityTypeIcon(activity.type),
      statusInfo: util.getActivityStatus(activity),
      isRegistered,
      canCancel: isRegistered && util.canCancelRegistration(activity),
      reviewArticles,
      reviewArticleList: reviewArticles
    };

    return { code: 200, data: result, message: 'success' };
  },

  createActivity: async (data) => {
    await delay(800);
    const authError = requireLogin();
    if (authError) return authError;

    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo.role || (userInfo.role !== 'admin' && userInfo.role !== 'verified')) {
      return { code: 403, data: null, message: '仅管理员或认证用户可发布活动' };
    }

    if (!data.title || !data.title.trim()) {
      return { code: 400, data: null, message: '活动标题不能为空' };
    }
    if (!data.startTime) {
      return { code: 400, data: null, message: '请选择活动开始时间' };
    }
    if (!data.endTime) {
      return { code: 400, data: null, message: '活动结束时间不能为空' };
    }
    if (!data.location || !data.location.trim()) {
      return { code: 400, data: null, message: '活动地点不能为空' };
    }
    if (!data.maxParticipants || data.maxParticipants <= 0) {
      return { code: 400, data: null, message: '请输入有效的人数上限' };
    }
    if (!data.type) {
      return { code: 400, data: null, message: '请选择活动类型' };
    }
    if (!data.description || !data.description.trim()) {
      return { code: 400, data: null, message: '活动详情不能为空' };
    }

    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (end <= start) {
      return { code: 400, data: null, message: '结束时间必须晚于开始时间' };
    }

    const activities = wx.getStorageSync('activities') || [];
    const newActivity = {
      id: util.generateId('activity'),
      title: data.title.trim(),
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location.trim(),
      maxParticipants: parseInt(data.maxParticipants),
      registeredCount: 0,
      type: data.type,
      description: data.description.trim(),
      cover: data.cover || '',
      reviewArticleIds: [],
      authorId: userInfo.id,
      authorName: userInfo.nickname,
      viewCount: 0,
      createTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      status: 1
    };
    activities.unshift(newActivity);
    wx.setStorageSync('activities', activities);
    return { code: 200, data: newActivity, message: '发布成功' };
  },

  registerActivity: async (id) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;

    if (!id) {
      return { code: 400, data: null, message: '活动ID不能为空' };
    }

    const userId = getCurrentUserId();
    const userInfo = wx.getStorageSync('userInfo');
    const activities = wx.getStorageSync('activities') || [];
    const activityIndex = activities.findIndex(item => item.id === id);
    if (activityIndex === -1) {
      return { code: 404, data: null, message: '活动不存在' };
    }

    const activity = activities[activityIndex];
    const statusInfo = util.getActivityStatus(activity);
    if (statusInfo.id === 'ended') {
      return { code: 400, data: null, message: '活动已结束，无法报名' };
    }
    if (statusInfo.id === 'full') {
      return { code: 400, data: null, message: '活动已满员' };
    }

    const registrations = wx.getStorageSync('activityRegistrations') || {};
    const userRegistrations = registrations[userId] || [];
    if (userRegistrations.some(item => item.activityId === id)) {
      return { code: 400, data: { isRegistered: true }, message: '您已报名该活动' };
    }

    activity.registeredCount = (activity.registeredCount || 0) + 1;
    activities[activityIndex] = activity;
    wx.setStorageSync('activities', activities);

    const newRegistration = {
      id: util.generateId('reg'),
      activityId: id,
      activityTitle: activity.title,
      registerTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
    };
    userRegistrations.unshift(newRegistration);
    registrations[userId] = userRegistrations;
    wx.setStorageSync('activityRegistrations', registrations);

    storageApi.createNotification({
      type: 'activity',
      fromUserId: userId,
      fromUserName: userInfo ? userInfo.nickname : '',
      targetUserId: activity.authorId,
      targetId: id,
      targetTitle: activity.title,
      content: (userInfo ? userInfo.nickname : '有人') + ' 报名了您发布的活动',
      jumpType: 'activity',
      jumpId: id
    });

    return { code: 200, data: { isRegistered: true, registeredCount: activity.registeredCount }, message: '报名成功' };
  },

  cancelRegistration: async (id) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;

    if (!id) {
      return { code: 400, data: null, message: '活动ID不能为空' };
    }

    const userId = getCurrentUserId();
    const activities = wx.getStorageSync('activities') || [];
    const activity = activities.find(item => item.id === id);
    if (!activity) {
      return { code: 404, data: null, message: '活动不存在' };
    }

    const registrations = wx.getStorageSync('activityRegistrations') || {};
    const userRegistrations = registrations[userId] || [];
    const index = userRegistrations.findIndex(item => item.activityId === id);
    if (index === -1) {
      return { code: 400, data: null, message: '您未报名该活动' };
    }

    if (!util.canCancelRegistration(activity)) {
      return { code: 400, data: null, message: '活动开始前24小时内不可取消报名' };
    }

    const activityIndex = activities.findIndex(item => item.id === id);
    activity.registeredCount = Math.max((activity.registeredCount || 1) - 1, 0);
    activities[activityIndex] = activity;
    wx.setStorageSync('activities', activities);

    userRegistrations.splice(index, 1);
    registrations[userId] = userRegistrations;
    wx.setStorageSync('activityRegistrations', registrations);

    return { code: 200, data: { isRegistered: false, registeredCount: activity.registeredCount }, message: '取消报名成功' };
  },

  getMyActivities: async () => {
    await delay(400);
    const authError = requireLogin();
    if (authError) return authError;

    const userId = getCurrentUserId();
    const registrations = wx.getStorageSync('activityRegistrations') || {};
    const userRegistrations = registrations[userId] || [];

    const activities = wx.getStorageSync('activities') || [];
    const registeredActivities = userRegistrations
      .map(reg => {
        const activity = activities.find(a => a.id === reg.activityId);
        if (!activity) return null;
        return {
          ...activity,
          ...reg,
          typeName: util.getActivityTypeName(activity.type),
          typeIcon: util.getActivityTypeIcon(activity.type),
          statusInfo: util.getActivityStatus(activity),
          canCancel: util.canCancelRegistration(activity)
        };
      })
      .filter(Boolean);

    registeredActivities.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    return {
      code: 200,
      data: { list: registeredActivities, total: registeredActivities.length },
      message: 'success'
    };
  },

  checkActivityRegistration: async (id) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;

    if (!id) {
      return { code: 400, data: null, message: '活动ID不能为空' };
    }

    const userId = getCurrentUserId();
    const registrations = wx.getStorageSync('activityRegistrations') || {};
    const userRegistrations = registrations[userId] || [];
    const isRegistered = userRegistrations.some(item => item.activityId === id);

    const activities = wx.getStorageSync('activities') || [];
    const activity = activities.find(item => item.id === id);
    const canCancel = isRegistered && activity && util.canCancelRegistration(activity);

    return { code: 200, data: { isRegistered, canCancel }, message: 'success' };
  },

  linkReviewArticle: async (activityId, articleId) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;

    if (!activityId) {
      return { code: 400, data: null, message: '活动ID不能为空' };
    }
    if (!articleId) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }

    const userId = getCurrentUserId();
    const activities = wx.getStorageSync('activities') || [];
    const activityIndex = activities.findIndex(item => item.id === activityId);
    if (activityIndex === -1) {
      return { code: 404, data: null, message: '活动不存在' };
    }

    const activity = activities[activityIndex];
    if (activity.authorId !== userId) {
      return { code: 403, data: null, message: '仅活动发布者可关联回顾文章' };
    }

    const statusInfo = util.getActivityStatus(activity);
    if (statusInfo.id !== 'ended') {
      return { code: 400, data: null, message: '活动结束后方可关联回顾文章' };
    }

    if (!activity.reviewArticleIds) {
      activity.reviewArticleIds = [];
    }
    if (!activity.reviewArticleIds.includes(articleId)) {
      activity.reviewArticleIds.push(articleId);
    }
    activities[activityIndex] = activity;
    wx.setStorageSync('activities', activities);

    return { code: 200, data: activity, message: '关联成功' };
  },

  unlinkReviewArticle: async (activityId, articleId) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;

    if (!activityId) {
      return { code: 400, data: null, message: '活动ID不能为空' };
    }
    if (!articleId) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }

    const userId = getCurrentUserId();
    const activities = wx.getStorageSync('activities') || [];
    const activityIndex = activities.findIndex(item => item.id === activityId);
    if (activityIndex === -1) {
      return { code: 404, data: null, message: '活动不存在' };
    }

    const activity = activities[activityIndex];
    if (activity.authorId !== userId) {
      return { code: 403, data: null, message: '仅活动发布者可取消关联回顾文章' };
    }

    if (activity.reviewArticleIds) {
      const idx = activity.reviewArticleIds.indexOf(articleId);
      if (idx > -1) {
        activity.reviewArticleIds.splice(idx, 1);
      }
    }
    activities[activityIndex] = activity;
    wx.setStorageSync('activities', activities);

    return { code: 200, data: activity, message: '取消关联成功' };
  },

  getMyPublishedActivities: async () => {
    await delay(400);
    const authError = requireLogin();
    if (authError) return authError;

    const userId = getCurrentUserId();
    let activities = wx.getStorageSync('activities') || [];
    activities = activities.filter(item => item.authorId === userId);
    activities.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    const list = activities.map(item => ({
      ...item,
      typeName: util.getActivityTypeName(item.type),
      typeIcon: util.getActivityTypeIcon(item.type),
      statusInfo: util.getActivityStatus(item)
    }));

    return {
      code: 200,
      data: { list, total: list.length },
      message: 'success'
    };
  },

  getLandmarkCategories: async () => {
    await delay(200);
    const categories = [
      { id: 'all', name: '全部', icon: '🗺️' },
      { id: 'folklore', name: '民俗遗址', icon: '🏛️' },
      { id: 'nature', name: '自然景观', icon: '🏞️' },
      { id: 'craft', name: '传统技艺传习地', icon: '🧶' },
      { id: 'history', name: '历史古迹', icon: '🏰' }
    ];
    return { code: 200, data: categories, message: 'success' };
  },

  getLandmarkList: async (params = {}) => {
    await delay(500);
    const { category = 'all', page = 1, pageSize = 20, keyword = '' } = params;
    let landmarks = wx.getStorageSync('landmarks') || [];
    landmarks = landmarks.filter(item => item.status === 'approved');

    if (category && category !== 'all') {
      landmarks = landmarks.filter(item => item.category === category);
    }
    if (keyword && keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      landmarks = landmarks.filter(item =>
        item.name.toLowerCase().includes(kw) ||
        item.description.toLowerCase().includes(kw)
      );
    }

    const total = landmarks.length;
    const start = (page - 1) * pageSize;
    const list = landmarks.slice(start, start + pageSize);

    return {
      code: 200,
      data: { list, total, page, pageSize, hasMore: start + pageSize < total },
      message: 'success'
    };
  },

  getLandmarkDetail: async (id) => {
    await delay(300);
    if (!id) {
      return { code: 400, data: null, message: '地标ID不能为空' };
    }
    const landmarks = wx.getStorageSync('landmarks') || [];
    const landmark = landmarks.find(item => item.id === id);
    if (!landmark) {
      return { code: 404, data: null, message: '地标不存在' };
    }
    return { code: 200, data: landmark, message: 'success' };
  },

  createLandmark: async (data) => {
    await delay(800);
    const authError = requireLogin();
    if (authError) return authError;

    if (!data.name || !data.name.trim()) {
      return { code: 400, data: null, message: '地标名称不能为空' };
    }
    if (!data.category) {
      return { code: 400, data: null, message: '请选择地标分类' };
    }
    if (!data.description || !data.description.trim()) {
      return { code: 400, data: null, message: '地标简介不能为空' };
    }
    if (!data.address || !data.address.trim()) {
      return { code: 400, data: null, message: '详细地址不能为空' };
    }
    if (!data.latitude || !data.longitude) {
      return { code: 400, data: null, message: '坐标不能为空' };
    }

    const userInfo = wx.getStorageSync('userInfo');
    const landmarks = wx.getStorageSync('landmarks') || [];

    const newLandmark = {
      id: util.generateId('landmark'),
      name: data.name.trim(),
      category: data.category,
      description: data.description.trim(),
      address: data.address.trim(),
      latitude: data.latitude,
      longitude: data.longitude,
      history: data.history || '',
      cover: data.cover || '',
      submitterId: userInfo.id,
      submitterName: userInfo.nickname,
      status: 'pending',
      createTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      viewCount: 0
    };

    landmarks.unshift(newLandmark);
    wx.setStorageSync('landmarks', landmarks);

    return { code: 200, data: newLandmark, message: '提交成功，等待审核' };
  },

  getRelatedArticles: async (landmarkId) => {
    await delay(300);
    const articles = wx.getStorageSync('articles') || [];
    const relatedArticles = articles.filter(item =>
      item.status === 1 && item.landmarkId === landmarkId
    ).map(item => ({
      id: item.id,
      title: item.title,
      authorName: item.authorName,
      createTime: item.createTime,
      viewCount: item.viewCount
    }));
    return { code: 200, data: relatedArticles, message: 'success' };
  },

  getPendingLandmarks: async () => {
    await delay(400);
    const authError = requireLogin();
    if (authError) return authError;

    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo.role !== 'admin') {
      return { code: 403, data: null, message: '仅管理员可查看待审核地标' };
    }

    let landmarks = wx.getStorageSync('landmarks') || [];
    landmarks = landmarks.filter(item => item.status === 'pending');
    landmarks.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    return {
      code: 200,
      data: { list: landmarks, total: landmarks.length },
      message: 'success'
    };
  },

  approveLandmark: async (id) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;

    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo.role !== 'admin') {
      return { code: 403, data: null, message: '仅管理员可审核地标' };
    }

    if (!id) {
      return { code: 400, data: null, message: '地标ID不能为空' };
    }

    const landmarks = wx.getStorageSync('landmarks') || [];
    const index = landmarks.findIndex(item => item.id === id);
    if (index === -1) {
      return { code: 404, data: null, message: '地标不存在' };
    }

    landmarks[index].status = 'approved';
    wx.setStorageSync('landmarks', landmarks);

    return { code: 200, data: landmarks[index], message: '审核通过' };
  },

  rejectLandmark: async (id) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;

    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo.role !== 'admin') {
      return { code: 403, data: null, message: '仅管理员可审核地标' };
    }

    if (!id) {
      return { code: 400, data: null, message: '地标ID不能为空' };
    }

    const landmarks = wx.getStorageSync('landmarks') || [];
    const index = landmarks.findIndex(item => item.id === id);
    if (index === -1) {
      return { code: 404, data: null, message: '地标不存在' };
    }

    landmarks[index].status = 'rejected';
    wx.setStorageSync('landmarks', landmarks);

    return { code: 200, data: landmarks[index], message: '已拒绝' };
  }
};

const remoteApi = {
  getArticleList: async (params = {}) => {
    const { category = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    return request({
      url: '/api/article/list',
      method: 'GET',
      data: { category, page, pageSize, keyword }
    });
  },

  getArticleDetail: async (id) => {
    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    return request({
      url: `/api/article/detail/${id}`,
      method: 'GET'
    });
  },

  publishArticle: async (data) => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/article/publish',
      method: 'POST',
      data: { ...data, authorId: userId }
    });
  },

  getMyArticles: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/article/my',
      method: 'GET',
      data: { authorId: userId }
    });
  },

  getCategoryList: async () => {
    return request({
      url: '/api/category/list',
      method: 'GET'
    });
  },

  getUserInfo: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/user/info',
      method: 'GET',
      data: { userId }
    });
  },

  updateUserInfo: async (data) => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/user/update',
      method: 'POST',
      data: { ...data, userId }
    });
  },

  getUserStats: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/user/stats',
      method: 'GET',
      data: { userId }
    });
  },

  likeArticle: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    return request({
      url: `/api/article/like/${id}`,
      method: 'POST',
      data: { userId }
    });
  },

  unlikeArticle: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    return request({
      url: `/api/article/unlike/${id}`,
      method: 'POST',
      data: { userId }
    });
  },

  checkLike: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    return request({
      url: `/api/article/like/${id}`,
      method: 'GET',
      data: { userId }
    });
  },

  favoriteArticle: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    return request({
      url: `/api/article/favorite/${id}`,
      method: 'POST',
      data: { userId }
    });
  },

  unfavoriteArticle: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    return request({
      url: `/api/article/unfavorite/${id}`,
      method: 'POST',
      data: { userId }
    });
  },

  checkFavorite: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    return request({
      url: `/api/article/favorite/${id}`,
      method: 'GET',
      data: { userId }
    });
  },

  getFavoriteList: async (params = {}) => {
    const authError = requireLogin();
    if (authError) return authError;
    const { category = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    const userId = getCurrentUserId();
    return request({
      url: '/api/article/favorites',
      method: 'GET',
      data: { userId, category, page, pageSize, keyword }
    });
  },

  getFigureList: async (params = {}) => {
    const { identity = 'all', craft = 'all', region = 'all', era = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    return request({
      url: '/api/figure/list',
      method: 'GET',
      data: { identity, craft, region, era, page, pageSize, keyword }
    });
  },

  getFigureDetail: async (id) => {
    if (!id) {
      return { code: 400, data: null, message: '人物ID不能为空' };
    }
    return request({
      url: `/api/figure/detail/${id}`,
      method: 'GET'
    });
  },

  getFigureOptions: async () => {
    return request({
      url: '/api/figure/options',
      method: 'GET'
    });
  },

  createFigureDraft: async (data) => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/figure/draft',
      method: 'POST',
      data: { ...data, submitterId: userId }
    });
  },

  getMyFigureDrafts: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/figure/drafts',
      method: 'GET',
      data: { submitterId: userId }
    });
  },

  getFilterOptions: async () => {
    return request({
      url: '/api/figure/filters',
      method: 'GET'
    });
  },

  likeFigure: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '人物ID不能为空' };
    }
    const userId = getCurrentUserId();
    return request({
      url: `/api/figure/like/${id}`,
      method: 'POST',
      data: { userId }
    });
  },

  unlikeFigure: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '人物ID不能为空' };
    }
    const userId = getCurrentUserId();
    return request({
      url: `/api/figure/unlike/${id}`,
      method: 'POST',
      data: { userId }
    });
  },

  checkFigureLike: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '人物ID不能为空' };
    }
    const userId = getCurrentUserId();
    return request({
      url: `/api/figure/like/${id}`,
      method: 'GET',
      data: { userId }
    });
  },

  getTopicList: async (params = {}) => {
    const { category = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    return request({
      url: '/api/topic/list',
      method: 'GET',
      data: { category, page, pageSize, keyword }
    });
  },

  getTopicDetail: async (id) => {
    if (!id) {
      return { code: 400, data: null, message: '专题ID不能为空' };
    }
    return request({
      url: `/api/topic/detail/${id}`,
      method: 'GET'
    });
  },

  createTopic: async (data) => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/topic/create',
      method: 'POST',
      data: { ...data, authorId: userId }
    });
  },

  updateTopic: async (id, data) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '专题ID不能为空' };
    }
    return request({
      url: `/api/topic/update/${id}`,
      method: 'POST',
      data
    });
  },

  deleteTopic: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '专题ID不能为空' };
    }
    return request({
      url: `/api/topic/delete/${id}`,
      method: 'POST'
    });
  },

  getEncyclopediaList: async (params = {}) => {
    const { category = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    return request({
      url: '/api/encyclopedia/list',
      method: 'GET',
      data: { category, page, pageSize, keyword }
    });
  },

  getEncyclopediaDetail: async (id) => {
    if (!id) {
      return { code: 400, data: null, message: '词条ID不能为空' };
    }
    return request({
      url: `/api/encyclopedia/detail/${id}`,
      method: 'GET'
    });
  },

  createEncyclopedia: async (data) => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/encyclopedia/create',
      method: 'POST',
      data: { ...data, authorId: userId }
    });
  },

  updateEncyclopedia: async (id, data) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '词条ID不能为空' };
    }
    return request({
      url: `/api/encyclopedia/update/${id}`,
      method: 'POST',
      data
    });
  },

  deleteEncyclopedia: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '词条ID不能为空' };
    }
    return request({
      url: `/api/encyclopedia/delete/${id}`,
      method: 'POST'
    });
  },

  getEncyclopediaCategories: async () => {
    return request({
      url: '/api/encyclopedia/categories',
      method: 'GET'
    });
  },

  getTopicCategories: async () => {
    return request({
      url: '/api/topic/categories',
      method: 'GET'
    });
  },

  getNotificationList: async (params = {}) => {
    const authError = requireLogin();
    if (authError) return authError;
    const { type = 'all', readStatus = 'all', page = 1, pageSize = 10 } = params;
    const userId = getCurrentUserId();
    return request({
      url: '/api/notification/list',
      method: 'GET',
      data: { type, readStatus, page, pageSize, userId }
    });
  },

  getUnreadCount: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/notification/unread-count',
      method: 'GET',
      data: { userId }
    });
  },

  markAsRead: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '通知ID不能为空' };
    }
    return request({
      url: `/api/notification/read/${id}`,
      method: 'POST'
    });
  },

  markAllAsRead: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/notification/read-all',
      method: 'POST'
    });
  },

  deleteNotification: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '通知ID不能为空' };
    }
    return request({
      url: `/api/notification/delete/${id}`,
      method: 'POST'
    });
  },

  createNotification: async (data) => {
    return request({
      url: '/api/notification/create',
      method: 'POST',
      data
    });
  },

  getActivityTypes: async () => {
    return request({
      url: '/api/activity/types',
      method: 'GET'
    });
  },

  getActivityList: async (params = {}) => {
    const { type = 'all', status = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    return request({
      url: '/api/activity/list',
      method: 'GET',
      data: { type, status, page, pageSize, keyword }
    });
  },

  getActivityDetail: async (id) => {
    if (!id) {
      return { code: 400, data: null, message: '活动ID不能为空' };
    }
    return request({
      url: `/api/activity/detail/${id}`,
      method: 'GET'
    });
  },

  createActivity: async (data) => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/activity/create',
      method: 'POST',
      data: { ...data, authorId: userId }
    });
  },

  registerActivity: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '活动ID不能为空' };
    }
    const userId = getCurrentUserId();
    return request({
      url: `/api/activity/register/${id}`,
      method: 'POST',
      data: { userId }
    });
  },

  cancelRegistration: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '活动ID不能为空' };
    }
    const userId = getCurrentUserId();
    return request({
      url: `/api/activity/cancel/${id}`,
      method: 'POST',
      data: { userId }
    });
  },

  getMyActivities: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/activity/my',
      method: 'GET',
      data: { userId }
    });
  },

  checkActivityRegistration: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '活动ID不能为空' };
    }
    const userId = getCurrentUserId();
    return request({
      url: `/api/activity/check/${id}`,
      method: 'GET',
      data: { userId }
    });
  },

  linkReviewArticle: async (activityId, articleId) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!activityId) {
      return { code: 400, data: null, message: '活动ID不能为空' };
    }
    if (!articleId) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    return request({
      url: '/api/activity/link-article',
      method: 'POST',
      data: { activityId, articleId }
    });
  },

  unlinkReviewArticle: async (activityId, articleId) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!activityId) {
      return { code: 400, data: null, message: '活动ID不能为空' };
    }
    if (!articleId) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    return request({
      url: '/api/activity/unlink-article',
      method: 'POST',
      data: { activityId, articleId }
    });
  },

  getMyPublishedActivities: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/activity/published',
      method: 'GET',
      data: { userId }
    });
  }
};

const createApi = () => {
  const api = {};
  const methodNames = Object.keys(storageApi);

  methodNames.forEach(name => {
    api[name] = async (...args) => {
      return withErrorHandler(async () => {
        if (config.useRemote && config.baseUrl) {
          try {
            const result = await remoteApi[name](...args);
            if (result && result.code === 200) {
              return result;
            }
            console.warn(`[API] 远程调用失败，降级到本地存储: ${name}`, result);
          } catch (e) {
            console.warn(`[API] 远程调用异常，降级到本地存储: ${name}`, e);
          }
        }
        return storageApi[name](...args);
      }, `${name} 失败`);
    };
  });

  return api;
};

const api = createApi();

module.exports = {
  ...api,
  setConfig,
  getConfig,
  storageApi,
  remoteApi
};
