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
    articles.unshift(newArticle);
    wx.setStorageSync('articles', articles);
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
    const relatedArticles = articles.filter(item =>
      figure.relatedArticles && figure.relatedArticles.includes(item.id)
    );

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
