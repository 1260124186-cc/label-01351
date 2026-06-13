// utils/api.js
// API 接口封装 - 支持本地存储模式和网络请求模式
// 所有接口返回统一格式: { code: number, data: any, message: string }

const util = require('./util');
const figureData = require('./figure-data');
const quizData = require('./quiz-data');
const interviewData = require('./interview-data');
const calendarData = require('./calendar-data');
const certificateData = require('./certificate-data');
const taskSystem = require('./task');

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

    const authHeader = { ...header };
    const token = wx.getStorageSync('token');
    if (token) {
      authHeader['Authorization'] = 'Bearer ' + token;
    }

    wx.request({
      url: fullUrl,
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...authHeader
      },
      timeout: config.timeout,
      success: (res) => {
        if (res.statusCode === 401) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('isLoggedIn');
          wx.removeStorageSync('userInfo');
          resolve({
            code: 401,
            data: null,
            message: '登录已过期，请重新登录'
          });
          return;
        }
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

const generateMockToken = (userId) => {
  return util.generateToken(userId);
};

const storageApi = {
  wechatLogin: async (data = {}) => {
    await delay(500);
    const { code = 'mock_code_' + Date.now(), avatar = '', nickname = '微信用户' } = data;
    const openid = 'mock_openid_' + code;
    const userId = 'wx_' + Date.now();
    const token = generateMockToken(userId);
    const userInfo = {
      id: userId,
      openid,
      nickname,
      avatar,
      phone: '',
      loginType: 'wechat',
      createTime: new Date().toISOString().split('T')[0],
      role: 'user'
    };
    return {
      code: 200,
      data: { token, userInfo },
      message: '微信登录成功'
    };
  },

  nicknameLogin: async (data = {}) => {
    await delay(500);
    const { nickname } = data;
    if (!nickname || nickname.trim().length < 2) {
      return { code: 400, data: null, message: '昵称需要至少2个字符' };
    }
    const userId = 'user_' + Date.now();
    const token = generateMockToken(userId);
    const userInfo = {
      id: userId,
      openid: '',
      nickname: nickname.trim(),
      avatar: '',
      phone: '',
      loginType: 'nickname',
      createTime: new Date().toISOString().split('T')[0],
      role: 'user'
    };
    return {
      code: 200,
      data: { token, userInfo },
      message: '登录成功'
    };
  },

  authLogout: async () => {
    await delay(200);
    return { code: 200, data: null, message: '退出成功' };
  },

  checkSensitiveWords: async (data = {}) => {
    await delay(100);
    const { title = '', summary = '', content = '', tags = [] } = data;
    const text = [title, summary, content, ...tags].join(' ');
    const result = util.checkSensitiveWords(text);
    return {
      code: 200,
      data: result,
      message: 'success'
    };
  },

  getArticleList: async (params = {}) => {
    await delay(500);
    const { category = 'all', page = 1, pageSize = 10, keyword = '', tag = '', sort = 'latest' } = params;
    let articles = wx.getStorageSync('articles') || [];
    articles = articles.filter(item => item.status === 1);
    if (category && category !== 'all') {
      articles = articles.filter(item => item.category === category);
    }
    if (tag && tag.trim()) {
      const tagKw = tag.trim();
      articles = articles.filter(item =>
        Array.isArray(item.tags) && item.tags.some(t => t === tagKw)
      );
    }
    if (keyword && keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      articles = articles.filter(item =>
        item.title.toLowerCase().includes(kw) ||
        item.content.toLowerCase().includes(kw) ||
        (Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(kw)))
      );
    }
    if (sort === 'views') {
      articles.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sort === 'likes') {
      articles.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    } else {
      articles.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    }
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
    const title = data.title.trim();
    const content = data.content.trim();
    const summaryInput = data.summary ? data.summary.trim() : '';
    const summary = summaryInput || util.truncateText(content, 100);
    const sensitiveCheck = util.checkSensitiveWords(title + ' ' + summary + ' ' + content);
    if (sensitiveCheck.hasSensitive) {
      return {
        code: 400,
        data: { matchedWords: sensitiveCheck.matchedWords },
        message: '内容包含敏感词：' + sensitiveCheck.matchedWords.join('、') + '，请修改后重试'
      };
    }
    if (data.tags !== undefined && data.tags !== null) {
      if (!Array.isArray(data.tags)) {
        return { code: 400, data: null, message: '标签格式错误' };
      }
      if (data.tags.length > 3) {
        return { code: 400, data: null, message: '标签数量最多3个' };
      }
    }
    const userInfo = wx.getStorageSync('userInfo');
    const articles = wx.getStorageSync('articles') || [];
    const newArticle = {
      id: util.generateId('article'),
      title,
      summary,
      content,
      category: data.category,
      tags: data.tags || [],
      authorId: userInfo.id,
      authorName: userInfo.nickname,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
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
    articles = articles.filter(item => item.authorId === userId && item.status === 1);
    articles.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    return {
      code: 200,
      data: { list: articles, total: articles.length },
      message: 'success'
    };
  },

  updateArticle: async (id, data) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;

    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }

    const userId = getCurrentUserId();
    const articles = wx.getStorageSync('articles') || [];
    const index = articles.findIndex(item => item.id === id && item.authorId === userId && item.status === 1);

    if (index === -1) {
      return { code: 404, data: null, message: '文章不存在或无权编辑' };
    }

    const oldArticle = articles[index];

    if (data.title !== undefined) {
      const titleTrimmed = data.title.trim();
      if (titleTrimmed.length < 2) {
        return { code: 400, data: null, message: '标题至少2个字符' };
      }
    }
    if (data.content !== undefined) {
      const contentTrimmed = data.content.trim();
      if (contentTrimmed.length < 10) {
        return { code: 400, data: null, message: '内容至少10个字符' };
      }
    }
    if (data.category !== undefined && !data.category) {
      return { code: 400, data: null, message: '请选择分类' };
    }

    const title = data.title !== undefined ? data.title.trim() : oldArticle.title;
    const content = data.content !== undefined ? data.content.trim() : oldArticle.content;
    const summaryInput = data.summary !== undefined ? data.summary.trim() : oldArticle.summary;
    const summary = summaryInput || util.truncateText(content, 100);

    const sensitiveCheck = util.checkSensitiveWords(
      title + ' ' + summary + ' ' + content + ' ' + ((data.tags || oldArticle.tags) || []).join(' ')
    );
    if (sensitiveCheck.hasSensitive) {
      return {
        code: 400,
        data: { matchedWords: sensitiveCheck.matchedWords },
        message: '内容包含敏感词：' + sensitiveCheck.matchedWords.join('、') + '，请修改后重试'
      };
    }

    if (data.tags !== undefined) {
      if (!Array.isArray(data.tags)) {
        return { code: 400, data: null, message: '标签格式错误' };
      }
      if (data.tags.length > 3) {
        return { code: 400, data: null, message: '标签数量最多3个' };
      }
    }

    const updateData = {};
    if (data.title !== undefined) updateData.title = title;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.summary !== undefined) updateData.summary = summary;
    if (data.content !== undefined) updateData.content = content;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.figureId !== undefined) updateData.figureId = data.figureId;
    updateData.updateTime = util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');

    const oldFigureId = oldArticle.figureId;
    const newFigureId = data.figureId !== undefined ? data.figureId : oldFigureId;

    articles[index] = { ...oldArticle, ...updateData };
    wx.setStorageSync('articles', articles);

    if (oldFigureId !== newFigureId) {
      const figures = wx.getStorageSync('figures') || [];
      if (oldFigureId) {
        const oldFigureIndex = figures.findIndex(f => f.id === oldFigureId);
        if (oldFigureIndex > -1 && figures[oldFigureIndex].relatedArticles) {
          figures[oldFigureIndex].relatedArticles = figures[oldFigureIndex].relatedArticles.filter(aid => aid !== id);
        }
      }
      if (newFigureId) {
        const newFigureIndex = figures.findIndex(f => f.id === newFigureId);
        if (newFigureIndex > -1) {
          if (!figures[newFigureIndex].relatedArticles) {
            figures[newFigureIndex].relatedArticles = [];
          }
          if (!figures[newFigureIndex].relatedArticles.includes(id)) {
            figures[newFigureIndex].relatedArticles.push(id);
          }
        }
      }
      wx.setStorageSync('figures', figures);
    }

    return { code: 200, data: articles[index], message: '更新成功' };
  },

  deleteArticle: async (id) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;

    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }

    const userId = getCurrentUserId();
    const articles = wx.getStorageSync('articles') || [];
    const index = articles.findIndex(item => item.id === id && item.authorId === userId && item.status === 1);

    if (index === -1) {
      return { code: 404, data: null, message: '文章不存在或无权删除' };
    }

    const article = articles[index];

    articles.splice(index, 1);
    wx.setStorageSync('articles', articles);

    const figureId = article.figureId;
    if (figureId) {
      const figures = wx.getStorageSync('figures') || [];
      const figureIndex = figures.findIndex(f => f.id === figureId);
      if (figureIndex > -1 && figures[figureIndex].relatedArticles) {
        figures[figureIndex].relatedArticles = figures[figureIndex].relatedArticles.filter(aid => aid !== id);
        wx.setStorageSync('figures', figures);
      }
    }

    const favorites = wx.getStorageSync('favorites') || {};
    Object.keys(favorites).forEach(uid => {
      const userFavorites = favorites[uid] || [];
      const favIndex = userFavorites.indexOf(id);
      if (favIndex > -1) {
        userFavorites.splice(favIndex, 1);
        favorites[uid] = userFavorites;
      }
    });
    wx.setStorageSync('favorites', favorites);

    const likes = wx.getStorageSync('likes') || {};
    Object.keys(likes).forEach(uid => {
      const userLikes = likes[uid] || [];
      const likeIndex = userLikes.indexOf(id);
      if (likeIndex > -1) {
        userLikes.splice(likeIndex, 1);
        likes[uid] = userLikes;
      }
    });
    wx.setStorageSync('likes', likes);

    const history = wx.getStorageSync('history') || {};
    Object.keys(history).forEach(uid => {
      const userHistory = history[uid] || [];
      history[uid] = userHistory.filter(item => item.articleId !== id);
    });
    wx.setStorageSync('history', history);

    return { code: 200, data: null, message: '删除成功' };
  },

  saveArticleDraft: async (data) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;

    const userInfo = wx.getStorageSync('userInfo');
    const articles = wx.getStorageSync('articles') || [];

    const title = data.title ? data.title.trim() : '';
    const content = data.content ? data.content.trim() : '';

    if (!title && !content) {
      return { code: 400, data: null, message: '请至少输入标题或内容' };
    }

    const category = data.category || '';
    const summaryInput = data.summary ? data.summary.trim() : '';
    const summary = summaryInput || (content ? util.truncateText(content, 100) : '');
    const id = data.id;

    if (id) {
      const existingIndex = articles.findIndex(item => item.id === id);
      if (existingIndex === -1) {
        return { code: 404, data: null, message: '草稿不存在' };
      }
      if (articles[existingIndex].authorId !== userInfo.id) {
        return { code: 403, data: null, message: '无权限修改此草稿' };
      }
      const index = existingIndex;
      articles[index] = {
        ...articles[index],
        title: title || articles[index].title || '无标题',
        category: category || articles[index].category || '',
        summary: summary || articles[index].summary || '',
        content: content || articles[index].content || '',
        tags: data.tags || articles[index].tags || [],
        figureId: data.figureId || articles[index].figureId || '',
        updateTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        status: 0
      };
      wx.setStorageSync('articles', articles);
      return { code: 200, data: articles[index], message: '保存成功' };
    }

    const newDraft = {
      id: util.generateId('draft'),
      title: title || '无标题',
      category: category || '',
      summary: summary || '',
      content: content || '',
      tags: data.tags || [],
      figureId: data.figureId || '',
      authorId: userInfo.id,
      authorName: userInfo.nickname,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      createTime: '',
      updateTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      status: 0
    };
    articles.unshift(newDraft);
    wx.setStorageSync('articles', articles);
    return { code: 200, data: newDraft, message: '保存成功' };
  },

  getArticleDraftList: async () => {
    await delay(400);
    const authError = requireLogin();
    if (authError) return authError;

    const userId = getCurrentUserId();
    let articles = wx.getStorageSync('articles') || [];
    const drafts = articles.filter(item => item.authorId === userId && item.status === 0);
    drafts.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime));

    const list = drafts.map(item => ({
      ...item,
      categoryName: util.getCategoryName(item.category)
    }));

    return {
      code: 200,
      data: { list, total: list.length },
      message: 'success'
    };
  },

  getArticleDraftDetail: async (id) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;

    if (!id) {
      return { code: 400, data: null, message: '草稿ID不能为空' };
    }

    const userId = getCurrentUserId();
    const articles = wx.getStorageSync('articles') || [];
    const draft = articles.find(item => item.id === id);

    if (!draft) {
      return { code: 404, data: null, message: '草稿不存在' };
    }
    if (draft.authorId !== userId) {
      return { code: 403, data: null, message: '无权限查看此草稿' };
    }
    if (draft.status !== 0) {
      return { code: 404, data: null, message: '草稿不存在' };
    }

    return { code: 200, data: draft, message: 'success' };
  },

  updateArticleDraft: async (id, data) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;

    if (!id) {
      return { code: 400, data: null, message: '草稿ID不能为空' };
    }

    const userId = getCurrentUserId();
    const articles = wx.getStorageSync('articles') || [];
    const index = articles.findIndex(item => item.id === id);

    if (index === -1) {
      return { code: 404, data: null, message: '草稿不存在' };
    }
    if (articles[index].authorId !== userId) {
      return { code: 403, data: null, message: '无权限修改此草稿' };
    }
    if (articles[index].status !== 0) {
      return { code: 404, data: null, message: '草稿不存在' };
    }

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.category !== undefined) updateData.category = data.category;
    if (data.summary !== undefined) updateData.summary = data.summary.trim();
    if (data.content !== undefined) updateData.content = data.content.trim();
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.figureId !== undefined) updateData.figureId = data.figureId;
    updateData.updateTime = util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');

    articles[index] = { ...articles[index], ...updateData };
    wx.setStorageSync('articles', articles);

    return { code: 200, data: articles[index], message: '更新成功' };
  },

  publishArticleDraft: async (id) => {
    await delay(800);
    const authError = requireLogin();
    if (authError) return authError;

    if (!id) {
      return { code: 400, data: null, message: '草稿ID不能为空' };
    }

    const userId = getCurrentUserId();
    const articles = wx.getStorageSync('articles') || [];
    const index = articles.findIndex(item => item.id === id);

    if (index === -1) {
      return { code: 404, data: null, message: '草稿不存在' };
    }
    if (articles[index].authorId !== userId) {
      return { code: 403, data: null, message: '无权限发布此草稿' };
    }
    if (articles[index].status !== 0) {
      return { code: 404, data: null, message: '草稿不存在' };
    }

    const draft = articles[index];
    if (!draft.title || draft.title.trim().length < 2) {
      return { code: 400, data: null, message: '请输入文章标题（至少2字）' };
    }
    if (!draft.category) {
      return { code: 400, data: null, message: '请选择文章分类' };
    }
    if (!draft.content || draft.content.trim().length < 10) {
      return { code: 400, data: null, message: '请输入文章内容（至少10字）' };
    }

    const contentTrimmed = draft.content.trim();
    const autoSummary = (draft.summary || '').trim() || util.truncateText(contentTrimmed, 100);
    const sensitiveCheck = util.checkSensitiveWords(
      draft.title + ' ' + autoSummary + ' ' + contentTrimmed + ' ' + (draft.tags || []).join(' ')
    );
    if (sensitiveCheck.hasSensitive) {
      return {
        code: 400,
        data: { matchedWords: sensitiveCheck.matchedWords },
        message: '内容包含敏感词：' + sensitiveCheck.matchedWords.join('、') + '，请修改后重试'
      };
    }

    articles[index] = {
      ...draft,
      title: draft.title.trim(),
      summary: autoSummary,
      content: contentTrimmed,
      createTime: util.formatDate(new Date(), 'YYYY-MM-DD'),
      updateTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      status: 1
    };
    wx.setStorageSync('articles', articles);

    const figureId = articles[index].figureId;
    if (figureId) {
      const figures = wx.getStorageSync('figures') || [];
      const figureIndex = figures.findIndex(item => item.id === figureId);
      if (figureIndex > -1) {
        if (!figures[figureIndex].relatedArticles) {
          figures[figureIndex].relatedArticles = [];
        }
        if (!figures[figureIndex].relatedArticles.includes(id)) {
          figures[figureIndex].relatedArticles.push(id);
        }
        wx.setStorageSync('figures', figures);
      }
    }

    return { code: 200, data: articles[index], message: '发布成功' };
  },

  deleteArticleDraft: async (id) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;

    if (!id) {
      return { code: 400, data: null, message: '草稿ID不能为空' };
    }

    const userId = getCurrentUserId();
    const articles = wx.getStorageSync('articles') || [];
    const index = articles.findIndex(item => item.id === id);

    if (index === -1) {
      return { code: 404, data: null, message: '草稿不存在' };
    }
    if (articles[index].authorId !== userId) {
      return { code: 403, data: null, message: '无权限删除此草稿' };
    }
    if (articles[index].status !== 0) {
      return { code: 404, data: null, message: '草稿不存在' };
    }

    articles.splice(index, 1);
    wx.setStorageSync('articles', articles);

    return { code: 200, data: null, message: '删除成功' };
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
    if (data.signature !== undefined && data.signature.length > 100) {
      return { code: 400, data: null, message: '个性签名不能超过100字' };
    }
    if (data.location !== undefined && data.location.length > 30) {
      return { code: 400, data: null, message: '地区不能超过30字' };
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

  getAuthorProfile: async (authorId) => {
    await delay(300);
    if (!authorId) {
      return { code: 400, data: null, message: '作者ID不能为空' };
    }
    const articles = wx.getStorageSync('articles') || [];
    const authorArticles = articles.filter(item => item.authorId === authorId && item.status === 1);

    let authorName = '';
    let authorAvatar = '';

    if (authorArticles.length > 0) {
      authorName = authorArticles[0].authorName;
    } else {
      const users = wx.getStorageSync('users') || [];
      const author = users.find(u => u.id === authorId);
      if (author) {
        authorName = author.nickname;
        authorAvatar = author.avatar || '';
      } else {
        return { code: 404, data: null, message: '作者不存在' };
      }
    }

    const totalLikes = authorArticles.reduce((sum, item) => sum + (item.likeCount || 0), 0);
    const totalViews = authorArticles.reduce((sum, item) => sum + (item.viewCount || 0), 0);

    authorArticles.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    const articlesWithCategory = authorArticles.map(item => ({
      ...item,
      categoryName: util.getCategoryName(item.category)
    }));

    const userPoints = taskSystem.getUserPointsById(authorId);
    const userLevel = taskSystem.getUserLevelById(authorId);
    const levelProgress = taskSystem.getLevelProgressById(authorId);
    const userBadges = taskSystem.getUserBadgesById(authorId);

    return {
      code: 200,
      data: {
        authorId,
        authorName,
        authorAvatar: authorAvatar || '',
        articleCount: authorArticles.length,
        likeCount: totalLikes,
        viewCount: totalViews,
        articles: articlesWithCategory,
        points: userPoints,
        level: userLevel,
        levelProgress,
        badges: userBadges,
        badgeCount: userBadges.length
      },
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
    const { category = 'all', page = 1, pageSize = 10, keyword = '', sort = 'latest' } = params;
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
    if (sort === 'views') {
      articles.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sort === 'likes') {
      articles.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    } else {
      articles.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    }
    const total = articles.length;
    const start = (page - 1) * pageSize;
    const list = articles.slice(start, start + pageSize);
    return {
      code: 200,
      data: { list, total, page, pageSize, hasMore: start + pageSize < total },
      message: 'success'
    };
  },

  getLikeList: async (params = {}) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;
    const { category = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    const userId = getCurrentUserId();
    const likes = wx.getStorageSync('likes') || {};
    const userLikes = likes[userId] || [];
    if (userLikes.length === 0) {
      return {
        code: 200,
        data: { list: [], total: 0, page, pageSize, hasMore: false },
        message: 'success'
      };
    }
    let articles = wx.getStorageSync('articles') || [];
    articles = articles.filter(item => userLikes.includes(item.id));
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
    const currentVillageId = wx.getStorageSync('currentVillageId') || '';

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
      reviewStatus: 'pending',
      villageId: data.villageId || currentVillageId
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
    const { category = 'all', page = 1, pageSize = 20, keyword = '', villageId = '' } = params;
    let landmarks = wx.getStorageSync('landmarks') || [];
    landmarks = landmarks.filter(item => item.status === 'approved');

    if (villageId && villageId !== 'all') {
      const villageIds = villageData.getVillageAndChildrenIds(villageId);
      if (villageIds.length > 0) {
        landmarks = landmarks.filter(item => villageIds.includes(item.villageId));
      }
    } else if (!villageId) {
      const currentVillageId = wx.getStorageSync('currentVillageId');
      if (currentVillageId) {
        const villageIds = villageData.getVillageAndChildrenIds(currentVillageId);
        if (villageIds.length > 0) {
          landmarks = landmarks.filter(item => villageIds.includes(item.villageId));
        }
      }
    }

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
    const currentVillageId = wx.getStorageSync('currentVillageId') || '';

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
      viewCount: 0,
      villageId: data.villageId || currentVillageId
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
  },

  getQuizCategories: async () => {
    await delay(200);
    const categories = quizData.QUIZ_CATEGORIES.map(c => ({
      ...c,
      questionCount: (wx.getStorageSync('quizzes') || quizData.DEFAULT_QUIZZES)
        .filter(q => q.category === c.id).length
    }));
    return { code: 200, data: categories, message: 'success' };
  },

  getQuizDifficulties: async () => {
    await delay(100);
    return { code: 200, data: quizData.DIFFICULTY_LEVELS, message: 'success' };
  },

  initQuizData: async () => {
    const existing = wx.getStorageSync('quizzes');
    if (!existing || existing.length === 0) {
      wx.setStorageSync('quizzes', JSON.parse(JSON.stringify(quizData.DEFAULT_QUIZZES)));
    }
    return { code: 200, data: null, message: 'success' };
  },

  getQuizList: async (params = {}) => {
    await delay(300);
    await storageApi.initQuizData();
    const { category = 'all', difficulty = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    let quizzes = wx.getStorageSync('quizzes') || [];
    if (category && category !== 'all') {
      quizzes = quizzes.filter(item => item.category === category);
    }
    if (difficulty && difficulty !== 'all') {
      quizzes = quizzes.filter(item => item.difficulty === difficulty);
    }
    if (keyword && keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      quizzes = quizzes.filter(item =>
        item.question.toLowerCase().includes(kw) ||
        item.analysis.toLowerCase().includes(kw)
      );
    }
    const total = quizzes.length;
    const start = (page - 1) * pageSize;
    const list = quizzes.slice(start, start + pageSize).map(item => ({
      ...item,
      categoryInfo: quizData.getCategoryInfo(item.category),
      difficultyInfo: quizData.getDifficultyInfo(item.difficulty)
    }));
    return {
      code: 200,
      data: { list, total, page, pageSize, hasMore: start + pageSize < total },
      message: 'success'
    };
  },

  getQuizDetail: async (id) => {
    await delay(200);
    await storageApi.initQuizData();
    if (!id) {
      return { code: 400, data: null, message: '题目ID不能为空' };
    }
    const quizzes = wx.getStorageSync('quizzes') || [];
    const quiz = quizzes.find(item => item.id === id);
    if (!quiz) {
      return { code: 404, data: null, message: '题目不存在' };
    }
    const articles = wx.getStorageSync('articles') || [];
    const relatedArticles = (quiz.relatedArticleIds || [])
      .map(aid => articles.find(a => a.id === aid && a.status === 1))
      .filter(Boolean)
      .map(a => ({
        id: a.id,
        title: a.title,
        categoryName: util.getCategoryName(a.category)
      }));
    return {
      code: 200,
      data: {
        ...quiz,
        categoryInfo: quizData.getCategoryInfo(quiz.category),
        difficultyInfo: quizData.getDifficultyInfo(quiz.difficulty),
        relatedArticles
      },
      message: 'success'
    };
  },

  getDailyQuiz: async () => {
    await delay(300);
    await storageApi.initQuizData();
    const today = util.formatDate(new Date(), 'YYYY-MM-DD');
    const userId = getCurrentUserId() || 'guest';
    const storageKey = 'dailyQuiz_' + today;
    let dailyQuiz = wx.getStorageSync(storageKey);
    const quizzes = wx.getStorageSync('quizzes') || [];
    if (!dailyQuiz) {
      const seed = (today + userId).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const idx = seed % quizzes.length;
      dailyQuiz = {
        quizId: quizzes[idx].id,
        date: today,
        answered: false,
        isCorrect: null,
        userAnswer: null,
        submitTime: null
      };
      wx.setStorageSync(storageKey, dailyQuiz);
    }
    const quiz = quizzes.find(q => q.id === dailyQuiz.quizId) || quizzes[0];
    if (quiz) {
      return {
        code: 200,
        data: {
          dailyInfo: dailyQuiz,
          quiz: {
            ...quiz,
            categoryInfo: quizData.getCategoryInfo(quiz.category),
            difficultyInfo: quizData.getDifficultyInfo(quiz.difficulty)
          }
        },
        message: 'success'
      };
    }
    return { code: 404, data: null, message: '题库为空' };
  },

  submitDailyQuiz: async (answer) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    if (typeof answer !== 'number') {
      return { code: 400, data: null, message: '答案格式不正确' };
    }
    const today = util.formatDate(new Date(), 'YYYY-MM-DD');
    const storageKey = 'dailyQuiz_' + today;
    let dailyQuiz = wx.getStorageSync(storageKey);
    if (!dailyQuiz) {
      return { code: 400, data: null, message: '今日题目未加载' };
    }
    if (dailyQuiz.answered) {
      return { code: 400, data: null, message: '今日题目已作答' };
    }
    await storageApi.initQuizData();
    const quizzes = wx.getStorageSync('quizzes') || [];
    const quiz = quizzes.find(q => q.id === dailyQuiz.quizId);
    if (!quiz) {
      return { code: 404, data: null, message: '题目不存在' };
    }
    const isCorrect = answer === quiz.answer;
    dailyQuiz = {
      ...dailyQuiz,
      answered: true,
      isCorrect,
      userAnswer: answer,
      submitTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
    };
    wx.setStorageSync(storageKey, dailyQuiz);

    const userId = getCurrentUserId();
    const userInfo = wx.getStorageSync('userInfo');
    await storageApi.updateQuizStats({
      userId,
      nickname: userInfo ? userInfo.nickname : '匿名用户',
      category: quiz.category,
      difficulty: quiz.difficulty,
      isCorrect,
      totalQuestions: 1,
      correctCount: isCorrect ? 1 : 0,
      mode: 'daily'
    });
    if (!isCorrect) {
      await storageApi.addWrongQuiz({
        quizId: quiz.id,
        userAnswer: answer,
        mode: 'daily'
      });
    }
    const articles = wx.getStorageSync('articles') || [];
    const relatedArticles = (quiz.relatedArticleIds || [])
      .map(aid => articles.find(a => a.id === aid && a.status === 1))
      .filter(Boolean)
      .map(a => ({ id: a.id, title: a.title }));
    return {
      code: 200,
      data: {
        isCorrect,
        correctAnswer: quiz.answer,
        analysis: quiz.analysis,
        relatedArticles,
        score: isCorrect ? quizData.getDifficultyInfo(quiz.difficulty).score : 0
      },
      message: isCorrect ? '回答正确！' : '回答错误'
    };
  },

  getChallengeQuiz: async (categoryId) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    await storageApi.initQuizData();
    let quizzes = wx.getStorageSync('quizzes') || [];
    if (categoryId && categoryId !== 'all') {
      quizzes = quizzes.filter(q => q.category === categoryId);
    }
    if (quizzes.length === 0) {
      return { code: 404, data: null, message: '该分类暂无题目' };
    }
    const shuffled = quizzes.sort(() => Math.random() - 0.5);
    const count = Math.min(10, shuffled.length);
    const list = shuffled.slice(0, count).map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      answer: q.answer,
      analysis: q.analysis,
      category: q.category,
      difficulty: q.difficulty,
      relatedArticleIds: q.relatedArticleIds || [],
      categoryInfo: quizData.getCategoryInfo(q.category),
      difficultyInfo: quizData.getDifficultyInfo(q.difficulty)
    }));
    const sessionId = util.generateId('challenge');
    const sessions = wx.getStorageSync('challengeSessions') || {};
    sessions[sessionId] = {
      id: sessionId,
      quizIds: list.map(q => q.id),
      category: categoryId || 'all',
      startTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      userAnswers: [],
      completed: false
    };
    wx.setStorageSync('challengeSessions', sessions);
    return {
      code: 200,
      data: {
        sessionId,
        category: categoryId || 'all',
        categoryInfo: categoryId && categoryId !== 'all' ? quizData.getCategoryInfo(categoryId) : null,
        totalCount: count,
        questions: list
      },
      message: 'success'
    };
  },

  submitChallengeQuiz: async (sessionId, answers) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;
    if (!sessionId) {
      return { code: 400, data: null, message: '答题会话ID不能为空' };
    }
    if (!Array.isArray(answers)) {
      return { code: 400, data: null, message: '答案格式不正确' };
    }
    const sessions = wx.getStorageSync('challengeSessions') || {};
    const session = sessions[sessionId];
    if (!session) {
      return { code: 404, data: null, message: '答题会话不存在' };
    }
    if (session.completed) {
      return { code: 400, data: null, message: '本次答题已提交' };
    }
    await storageApi.initQuizData();
    const quizzes = wx.getStorageSync('quizzes') || [];
    let correctCount = 0;
    let totalScore = 0;
    const results = session.quizIds.map(async (qid, idx) => {
      const quiz = quizzes.find(q => q.id === qid);
      const userAnswer = answers[idx];
      const isCorrect = quiz && userAnswer === quiz.answer;
      if (isCorrect) {
        correctCount++;
        totalScore += quizData.getDifficultyInfo(quiz.difficulty).score;
      } else {
        await storageApi.addWrongQuiz({
          quizId: qid,
          userAnswer,
          mode: 'challenge'
        });
      }
      return {
        quizId: qid,
        userAnswer,
        isCorrect,
        correctAnswer: quiz ? quiz.answer : null,
        analysis: quiz ? quiz.analysis : '',
        score: isCorrect ? quizData.getDifficultyInfo(quiz ? quiz.difficulty : 'easy').score : 0
      };
    });
    const resolvedResults = await Promise.all(results);
    const userId = getCurrentUserId();
    const userInfo = wx.getStorageSync('userInfo');
    const categoryScores = {};
    session.quizIds.forEach((qid, idx) => {
      const quiz = quizzes.find(q => q.id === qid);
      if (quiz && resolvedResults[idx].isCorrect) {
        if (!categoryScores[quiz.category]) categoryScores[quiz.category] = 0;
        categoryScores[quiz.category] += quizData.getDifficultyInfo(quiz.difficulty).score;
      }
    });
    for (const cat of Object.keys(categoryScores)) {
      await storageApi.updateQuizStats({
        userId,
        nickname: userInfo ? userInfo.nickname : '匿名用户',
        category: cat,
        categoryScore: categoryScores[cat],
        isCorrect: false,
        totalQuestions: 0,
        correctCount: 0,
        mode: 'challenge'
      });
    }
    await storageApi.updateQuizStats({
      userId,
      nickname: userInfo ? userInfo.nickname : '匿名用户',
      category: session.category === 'all' ? null : session.category,
      difficulty: null,
      isCorrect: false,
      totalQuestions: session.quizIds.length,
      correctCount,
      mode: 'challenge',
      totalScore
    });
    session.completed = true;
    session.endTime = util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
    session.userAnswers = answers;
    session.results = resolvedResults;
    session.score = totalScore;
    session.correctCount = correctCount;
    sessions[sessionId] = session;
    wx.setStorageSync('challengeSessions', sessions);
    return {
      code: 200,
      data: {
        sessionId,
        categoryId: session.category,
        totalQuestions: session.quizIds.length,
        correctCount,
        wrongCount: session.quizIds.length - correctCount,
        accuracy: Math.round((correctCount / session.quizIds.length) * 100),
        totalScore,
        results: resolvedResults
      },
      message: '提交成功'
    };
  },

  getTimedQuiz: async (duration = 60) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    await storageApi.initQuizData();
    let quizzes = wx.getStorageSync('quizzes') || [];
    const shuffled = quizzes.sort(() => Math.random() - 0.5);
    const count = Math.min(20, shuffled.length);
    const list = shuffled.slice(0, count).map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      answer: q.answer,
      analysis: q.analysis,
      category: q.category,
      difficulty: q.difficulty,
      relatedArticleIds: q.relatedArticleIds || [],
      categoryInfo: quizData.getCategoryInfo(q.category),
      difficultyInfo: quizData.getDifficultyInfo(q.difficulty)
    }));
    const sessionId = util.generateId('timed');
    const sessions = wx.getStorageSync('timedSessions') || {};
    sessions[sessionId] = {
      id: sessionId,
      quizIds: list.map(q => q.id),
      duration,
      startTime: Date.now(),
      endTime: Date.now() + duration * 1000,
      userAnswers: [],
      completed: false
    };
    wx.setStorageSync('timedSessions', sessions);
    return {
      code: 200,
      data: {
        sessionId,
        duration,
        endTime: sessions[sessionId].endTime,
        totalCount: count,
        questions: list
      },
      message: 'success'
    };
  },

  submitTimedQuiz: async (sessionId, answers) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;
    if (!sessionId) {
      return { code: 400, data: null, message: '答题会话ID不能为空' };
    }
    if (!Array.isArray(answers)) {
      return { code: 400, data: null, message: '答案格式不正确' };
    }
    const sessions = wx.getStorageSync('timedSessions') || {};
    const session = sessions[sessionId];
    if (!session) {
      return { code: 404, data: null, message: '答题会话不存在' };
    }
    if (session.completed) {
      return { code: 400, data: null, message: '本次答题已提交' };
    }
    if (Date.now() > session.endTime) {
      return { code: 400, data: null, message: '答题已超时' };
    }
    await storageApi.initQuizData();
    const quizzes = wx.getStorageSync('quizzes') || [];
    const timeUsed = Math.max(0, Math.round((Date.now() - session.startTime) / 1000));
    let correctCount = 0;
    let totalScore = 0;
    const results = session.quizIds.map(async (qid, idx) => {
      const quiz = quizzes.find(q => q.id === qid);
      const userAnswer = answers[idx];
      const isCorrect = quiz && userAnswer === quiz.answer;
      if (isCorrect) {
        correctCount++;
        totalScore += quizData.getDifficultyInfo(quiz.difficulty).score;
      } else {
        await storageApi.addWrongQuiz({
          quizId: qid,
          userAnswer,
          mode: 'timed'
        });
      }
      return {
        quizId: qid,
        userAnswer,
        isCorrect,
        correctAnswer: quiz ? quiz.answer : null,
        analysis: quiz ? quiz.analysis : '',
        score: isCorrect ? quizData.getDifficultyInfo(quiz ? quiz.difficulty : 'easy').score : 0
      };
    });
    const resolvedResults = await Promise.all(results);
    const timeBonus = Math.max(0, session.duration - timeUsed);
    totalScore += Math.floor(timeBonus / 5);
    const userId = getCurrentUserId();
    const userInfo = wx.getStorageSync('userInfo');
    await storageApi.updateQuizStats({
      userId,
      nickname: userInfo ? userInfo.nickname : '匿名用户',
      category: null,
      difficulty: null,
      isCorrect: false,
      totalQuestions: session.quizIds.length,
      correctCount,
      mode: 'timed',
      totalScore
    });
    session.completed = true;
    session.submitTime = Date.now();
    session.timeUsed = timeUsed;
    session.userAnswers = answers;
    session.results = resolvedResults;
    session.score = totalScore;
    session.correctCount = correctCount;
    sessions[sessionId] = session;
    wx.setStorageSync('timedSessions', sessions);
    return {
      code: 200,
      data: {
        sessionId,
        totalQuestions: session.quizIds.length,
        answeredCount: answers.filter(a => typeof a === 'number').length,
        correctCount,
        wrongCount: session.quizIds.length - correctCount,
        accuracy: session.quizIds.length > 0
          ? Math.round((correctCount / session.quizIds.length) * 100)
          : 0,
        timeUsed,
        timeBonus: Math.floor(timeBonus / 5),
        totalScore,
        results: resolvedResults
      },
      message: '提交成功'
    };
  },

  updateQuizStats: async (options) => {
    const { userId, nickname, category, difficulty, isCorrect, totalQuestions = 0, correctCount = 0, mode, totalScore = 0, categoryScore = 0 } = options;
    if (!userId) return;
    const statsAll = wx.getStorageSync('quizStats') || {};
    let userStats = statsAll[userId] || {
      userId,
      nickname: nickname || '匿名用户',
      totalQuestions: 0,
      correctCount: 0,
      totalScore: 0,
      streakDays: 0,
      lastActiveDate: null,
      categoryScores: {},
      dailyHistory: []
    };
    userStats.nickname = nickname || userStats.nickname;
    userStats.totalQuestions += totalQuestions;
    userStats.correctCount += correctCount;
    userStats.totalScore += totalScore;
    const today = util.formatDate(new Date(), 'YYYY-MM-DD');
    if (userStats.lastActiveDate !== today) {
      if (userStats.lastActiveDate) {
        const last = new Date(userStats.lastActiveDate);
        const cur = new Date(today);
        const diffDays = Math.floor((cur - last) / (24 * 60 * 60 * 1000));
        if (diffDays === 1) {
          userStats.streakDays = (userStats.streakDays || 0) + 1;
        } else if (diffDays > 1) {
          userStats.streakDays = 1;
        }
      } else {
        userStats.streakDays = 1;
      }
      userStats.lastActiveDate = today;
      userStats.dailyHistory = userStats.dailyHistory || [];
      userStats.dailyHistory.push({
        date: today,
        mode,
        totalQuestions,
        correctCount,
        score: totalScore
      });
      if (userStats.dailyHistory.length > 365) {
        userStats.dailyHistory = userStats.dailyHistory.slice(-365);
      }
    }
    if (category && categoryScore > 0) {
      if (!userStats.categoryScores[category]) userStats.categoryScores[category] = 0;
      userStats.categoryScores[category] += categoryScore;
    }
    if (isCorrect && category) {
      if (!userStats.categoryScores[category]) userStats.categoryScores[category] = 0;
      const difScore = difficulty ? quizData.getDifficultyInfo(difficulty).score : 1;
      userStats.categoryScores[category] += difScore;
    }
    statsAll[userId] = userStats;
    wx.setStorageSync('quizStats', statsAll);
    const scores = wx.getStorageSync('quizScores') || {};
    if (!scores[userId]) {
      scores[userId] = {
        userId,
        nickname: userStats.nickname,
        totalScore: 0,
        weeklyScore: 0,
        history: []
      };
    }
    scores[userId].nickname = userStats.nickname;
    scores[userId].totalScore += totalScore;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    scores[userId].history = (scores[userId].history || []).filter(h => new Date(h.date) >= weekStart);
    if (totalScore > 0 || correctCount > 0) {
      scores[userId].history.push({
        date: util.formatDate(now, 'YYYY-MM-DD'),
        score: totalScore
      });
    }
    scores[userId].weeklyScore = scores[userId].history.reduce((sum, h) => sum + h.score, 0);
    wx.setStorageSync('quizScores', scores);
    return { code: 200, data: userStats, message: 'success' };
  },

  getQuizStats: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    const statsAll = wx.getStorageSync('quizStats') || {};
    const userStats = statsAll[userId] || {
      totalQuestions: 0,
      correctCount: 0,
      totalScore: 0,
      streakDays: 0,
      lastActiveDate: null,
      categoryScores: {},
      dailyHistory: []
    };
    const accuracy = userStats.totalQuestions > 0
      ? Math.round((userStats.correctCount / userStats.totalQuestions) * 100)
      : 0;
    const categoryDetails = Object.keys(userStats.categoryScores || {}).map(cid => ({
      categoryId: cid,
      ...quizData.getCategoryInfo(cid),
      score: userStats.categoryScores[cid]
    })).sort((a, b) => b.score - a.score);
    return {
      code: 200,
      data: {
        ...userStats,
        totalAnswers: userStats.totalQuestions || 0,
        accuracy,
        categoryDetails
      },
      message: 'success'
    };
  },

  getQuizRankings: async (type = 'weekly') => {
    await delay(300);
    const scores = wx.getStorageSync('quizScores') || {};
    const statsAll = wx.getStorageSync('quizStats') || {};
    const userId = getCurrentUserId();
    const list = Object.values(scores).map(s => {
      const userStat = statsAll[s.userId] || {};
      const answerCount = userStat.totalQuestions || 0;
      const correctCount = userStat.correctCount || 0;
      const accuracy = answerCount > 0 ? Math.round((correctCount / answerCount) * 100) : 0;
      return {
        id: s.userId,
        userId: s.userId,
        nickname: s.nickname,
        score: type === 'weekly' ? (s.weeklyScore || 0) : (s.totalScore || 0),
        totalScore: s.totalScore || 0,
        weeklyScore: s.weeklyScore || 0,
        answerCount,
        correctCount,
        accuracy
      };
    });
    if (type === 'weekly') {
      list.sort((a, b) => b.weeklyScore - a.weeklyScore || b.totalScore - a.totalScore);
    } else {
      list.sort((a, b) => b.totalScore - a.totalScore);
    }
    const rankedList = list.map((item, idx) => ({ ...item, rank: idx + 1 }));
    let myRank = null;
    if (userId) {
      const found = rankedList.find(x => x.userId === userId);
      myRank = found || null;
    }
    return {
      code: 200,
      data: {
        type,
        list: rankedList,
        myRank
      },
      message: 'success'
    };
  },

  addWrongQuiz: async (options) => {
    const { quizId, userAnswer, mode } = options;
    const userId = getCurrentUserId();
    if (!userId || !quizId) return;
    const wrongAll = wx.getStorageSync('wrongQuizzes') || {};
    const userWrong = wrongAll[userId] || {};
    const today = util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
    const existing = userWrong[quizId];
    if (existing) {
      existing.wrongCount = (existing.wrongCount || 1) + 1;
      existing.lastWrongTime = today;
      existing.userAnswer = userAnswer;
      existing.mode = mode || existing.mode;
    } else {
      userWrong[quizId] = {
        quizId,
        userAnswer,
        wrongCount: 1,
        firstWrongTime: today,
        lastWrongTime: today,
        mode: mode || 'unknown',
        reviewed: false
      };
    }
    wrongAll[userId] = userWrong;
    wx.setStorageSync('wrongQuizzes', wrongAll);
    return { code: 200, data: null, message: 'success' };
  },

  getWrongQuizList: async (params = {}) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    const { page = 1, pageSize = 10, reviewed = 'all', category = 'all' } = params;
    const userId = getCurrentUserId();
    await storageApi.initQuizData();
    const quizzes = wx.getStorageSync('quizzes') || [];
    const wrongAll = wx.getStorageSync('wrongQuizzes') || {};
    const userWrong = wrongAll[userId] || {};
    let list = Object.values(userWrong);
    if (reviewed === 'yes') {
      list = list.filter(w => w.reviewed);
    } else if (reviewed === 'no') {
      list = list.filter(w => !w.reviewed);
    }
    if (category && category !== 'all') {
      list = list.filter(w => {
        const q = quizzes.find(qq => qq.id === w.quizId);
        return q && q.category === category;
      });
    }
    list.sort((a, b) => new Date(b.lastWrongTime) - new Date(a.lastWrongTime));
    const total = list.length;
    const start = (page - 1) * pageSize;
    const pageList = list.slice(start, start + pageSize).map(w => {
      const quiz = quizzes.find(q => q.id === w.quizId);
      if (!quiz) return null;
      return {
        id: w.quizId,
        quizId: w.quizId,
        ...w,
        isReviewed: !!w.reviewed,
        quiz: {
          ...quiz,
          categoryInfo: quizData.getCategoryInfo(quiz.category),
          difficultyInfo: quizData.getDifficultyInfo(quiz.difficulty)
        },
        question: quiz.question,
        options: quiz.options,
        correctAnswer: quiz.answer,
        analysis: quiz.analysis,
        category: quiz.category,
        difficulty: quiz.difficulty,
        relatedArticleIds: quiz.relatedArticleIds || [],
        categoryInfo: quizData.getCategoryInfo(quiz.category),
        difficultyInfo: quizData.getDifficultyInfo(quiz.difficulty)
      };
    }).filter(Boolean);
    return {
      code: 200,
      data: {
        list: pageList,
        total,
        page,
        pageSize,
        hasMore: start + pageSize < total
      },
      message: 'success'
    };
  },

  markWrongQuizReviewed: async (quizId) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!quizId) {
      return { code: 400, data: null, message: '题目ID不能为空' };
    }
    const userId = getCurrentUserId();
    const wrongAll = wx.getStorageSync('wrongQuizzes') || {};
    const userWrong = wrongAll[userId] || {};
    if (!userWrong[quizId]) {
      return { code: 404, data: null, message: '错题记录不存在' };
    }
    userWrong[quizId].reviewed = true;
    userWrong[quizId].reviewTime = util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
    wrongAll[userId] = userWrong;
    wx.setStorageSync('wrongQuizzes', wrongAll);
    return { code: 200, data: { isReviewed: true, reviewTime: userWrong[quizId].reviewTime }, message: '已标记为已复习' };
  },

  removeWrongQuiz: async (quizId) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!quizId) {
      return { code: 400, data: null, message: '题目ID不能为空' };
    }
    const userId = getCurrentUserId();
    const wrongAll = wx.getStorageSync('wrongQuizzes') || {};
    const userWrong = wrongAll[userId] || {};
    if (!userWrong[quizId]) {
      return { code: 404, data: null, message: '错题记录不存在' };
    }
    delete userWrong[quizId];
    wrongAll[userId] = userWrong;
    wx.setStorageSync('wrongQuizzes', wrongAll);
    return { code: 200, data: null, message: '已从错题本移除' };
  },

  getWrongQuizForReview: async () => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    await storageApi.initQuizData();
    const quizzes = wx.getStorageSync('quizzes') || [];
    const wrongAll = wx.getStorageSync('wrongQuizzes') || {};
    const userWrong = wrongAll[userId] || {};
    const list = Object.values(userWrong)
      .filter(w => !w.reviewed)
      .sort((a, b) => (b.wrongCount || 1) - (a.wrongCount || 1));
    if (list.length === 0) {
      return { code: 200, data: { list: [], totalCount: 0 }, message: '暂无待复习错题' };
    }
    const count = Math.min(10, list.length);
    const reviewList = list.slice(0, count).map(w => {
      const quiz = quizzes.find(q => q.id === w.quizId);
      if (!quiz) return null;
      return {
        ...w,
        question: quiz.question,
        options: quiz.options,
        correctAnswer: quiz.answer,
        analysis: quiz.analysis,
        category: quiz.category,
        difficulty: quiz.difficulty,
        relatedArticleIds: quiz.relatedArticleIds || [],
        categoryInfo: quizData.getCategoryInfo(quiz.category),
        difficultyInfo: quizData.getDifficultyInfo(quiz.difficulty)
      };
    }).filter(Boolean);
    return {
      code: 200,
      data: {
        list: reviewList,
        quizzes: reviewList,
        totalCount: reviewList.length,
        remainingCount: list.length
      },
      message: 'success'
    };
  },

  initInterviewData: async () => {
    interviewData.initInterviewData();
    return { code: 200, data: null, message: 'success' };
  },

  getInterviewFilterOptions: async () => {
    await delay(100);
    const regionList = interviewData.REGIONS;
    const ageGroupList = interviewData.AGE_GROUPS;
    const craftList = interviewData.CRAFT_TYPES;

    return {
      code: 200,
      data: { regionList, ageGroupList, craftList },
      message: 'success'
    };
  },

  getInterviewList: async (params = {}) => {
    await delay(500);
    interviewData.initInterviewData();
    const { region = 'all', ageGroup = 'all', craft = 'all', page = 1, pageSize = 10, keyword = '', collectionId = '' } = params;
    let interviews = wx.getStorageSync('interviews') || [];
    interviews = interviews.filter(item => item.status === 1);

    if (collectionId && collectionId.trim()) {
      const collections = wx.getStorageSync('interviewCollections') || [];
      const collection = collections.find(c => c.id === collectionId);
      interviews = interviews.filter(item => {
        const inCollectionIds = collection && collection.interviewIds
          ? collection.interviewIds.includes(item.id)
          : false;
        const inItemIds = item.collectionIds && item.collectionIds.includes(collectionId);
        return inCollectionIds || inItemIds;
      });
    }

    interviews = interviewData.filterInterviews(interviews, { region, ageGroup, craft, keyword });
    interviews.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    const total = interviews.length;
    const start = (page - 1) * pageSize;
    const list = interviews.slice(start, start + pageSize).map(item => ({
      ...item,
      regionName: interviewData.getRegionName(item.region),
      craftNames: interviewData.getCraftNames(item.crafts),
      collectionNames: interviewData.getCollectionNames(item.collectionIds)
    }));

    return {
      code: 200,
      data: { list, total, page, pageSize, hasMore: start + pageSize < total },
      message: 'success'
    };
  },

  getInterviewDetail: async (id) => {
    await delay(300);
    interviewData.initInterviewData();
    if (!id) {
      return { code: 400, data: null, message: '访谈ID不能为空' };
    }
    const interviews = wx.getStorageSync('interviews') || [];
    const interview = interviews.find(item => item.id === id);
    if (!interview) {
      return { code: 404, data: null, message: '访谈不存在' };
    }

    interview.viewCount = (interview.viewCount || 0) + 1;
    wx.setStorageSync('interviews', interviews);

    let relatedFigure = null;
    if (interview.relatedFigureId) {
      const figures = wx.getStorageSync('figures') || [];
      relatedFigure = figures.find(f => f.id === interview.relatedFigureId) || null;
      if (relatedFigure) {
        relatedFigure.identityInfo = figureData.getIdentityInfo(relatedFigure.identity);
      }
    }

    const collections = wx.getStorageSync('interviewCollections') || [];
    const relatedCollections = (interview.collectionIds || [])
      .map(cid => collections.find(c => c.id === cid))
      .filter(Boolean)
      .map(c => ({
        id: c.id,
        title: c.title,
        icon: c.icon,
        coverImage: c.coverImage,
        interviewCount: (c.interviewIds || []).length
      }));

    const result = {
      ...interview,
      regionName: interviewData.getRegionName(interview.region),
      craftNames: interviewData.getCraftNames(interview.crafts),
      relatedFigure,
      relatedCollections
    };

    return { code: 200, data: result, message: 'success' };
  },

  createInterview: async (data) => {
    await delay(800);
    const authError = requireLogin();
    if (authError) return authError;

    if (!data.intervieweeName || !data.intervieweeName.trim()) {
      return { code: 400, data: null, message: '请填写受访者姓名' };
    }
    if (!data.age || data.age < 0) {
      return { code: 400, data: null, message: '请输入有效的年龄' };
    }
    if (!data.occupation || !data.occupation.trim()) {
      return { code: 400, data: null, message: '请填写受访者职业' };
    }
    if (!data.interviewLocation || !data.interviewLocation.trim()) {
      return { code: 400, data: null, message: '请填写采访地点' };
    }
    if (!data.interviewDate) {
      return { code: 400, data: null, message: '请选择采访日期' };
    }
    if (!data.summary || !data.summary.trim()) {
      return { code: 400, data: null, message: '请填写访谈摘要' };
    }
    if (data.summary.trim().length < 10) {
      return { code: 400, data: null, message: '访谈摘要至少需要10个字符' };
    }
    if (!data.content || !data.content.trim()) {
      return { code: 400, data: null, message: '请填写访谈正文' };
    }
    if (data.content.trim().length < 50) {
      return { code: 400, data: null, message: '访谈正文至少需要50个字符' };
    }

    const userInfo = wx.getStorageSync('userInfo');
    interviewData.initInterviewData();
    const interviews = wx.getStorageSync('interviews') || [];

    const newInterview = {
      id: util.generateId('interview'),
      type: 'interview',
      intervieweeName: data.intervieweeName.trim(),
      gender: data.gender || '',
      age: parseInt(data.age),
      birthYear: data.birthYear || null,
      occupation: data.occupation.trim(),
      region: data.region || '',
      address: data.address || '',
      interviewLocation: data.interviewLocation.trim(),
      interviewDate: data.interviewDate,
      interviewer: data.interviewer || (userInfo ? userInfo.nickname : ''),
      crafts: data.crafts || [],
      summary: data.summary.trim(),
      content: data.content.trim(),
      tags: data.tags || [],
      collectionIds: data.collectionIds || [],
      relatedFigureId: data.relatedFigureId || '',
      viewCount: 0,
      likeCount: 0,
      status: 0,
      authorId: userInfo.id,
      authorName: userInfo.nickname,
      createTime: util.formatDate(new Date(), 'YYYY-MM-DD')
    };

    interviews.unshift(newInterview);
    wx.setStorageSync('interviews', interviews);

    return { code: 200, data: newInterview, message: '发布成功' };
  },

  createInterviewDraft: async (data) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;

    const userInfo = wx.getStorageSync('userInfo');
    interviewData.initInterviewData();
    const drafts = wx.getStorageSync('interviewDrafts') || [];

    const newDraft = {
      id: util.generateId('interview_draft'),
      ...data,
      submitterId: userInfo.id,
      submitterName: userInfo.nickname,
      createTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      status: 2,
      reviewStatus: 'pending'
    };

    drafts.unshift(newDraft);
    wx.setStorageSync('interviewDrafts', drafts);

    return { code: 200, data: newDraft, message: '保存成功，等待审核' };
  },

  getMyInterviews: async () => {
    await delay(400);
    const authError = requireLogin();
    if (authError) return authError;

    const userId = getCurrentUserId();
    interviewData.initInterviewData();
    let interviews = wx.getStorageSync('interviews') || [];
    interviews = interviews.filter(item => item.authorId === userId);
    interviews.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    const list = interviews.map(item => ({
      ...item,
      regionName: interviewData.getRegionName(item.region),
      craftNames: interviewData.getCraftNames(item.crafts)
    }));

    return {
      code: 200,
      data: { list, total: list.length },
      message: 'success'
    };
  },

  getMyInterviewDrafts: async () => {
    await delay(400);
    const authError = requireLogin();
    if (authError) return authError;

    const userId = getCurrentUserId();
    interviewData.initInterviewData();
    let drafts = wx.getStorageSync('interviewDrafts') || [];
    drafts = drafts.filter(item => item.submitterId === userId);
    drafts.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    const list = drafts.map(item => ({
      ...item,
      regionName: interviewData.getRegionName(item.region),
      craftNames: interviewData.getCraftNames(item.crafts)
    }));

    return {
      code: 200,
      data: { list, total: list.length },
      message: 'success'
    };
  },

  likeInterview: async (id) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '访谈ID不能为空' };
    }
    const userId = getCurrentUserId();
    interviewData.initInterviewData();
    const interviews = wx.getStorageSync('interviews') || [];
    const interview = interviews.find(item => item.id === id);
    if (!interview) {
      return { code: 404, data: null, message: '访谈不存在' };
    }
    const likes = wx.getStorageSync('interviewLikes') || {};
    const userLikes = likes[userId] || [];
    if (userLikes.includes(id)) {
      return { code: 200, data: { isLike: true, likeCount: interview.likeCount }, message: '已点赞' };
    }
    interview.likeCount = (interview.likeCount || 0) + 1;
    wx.setStorageSync('interviews', interviews);
    userLikes.push(id);
    likes[userId] = userLikes;
    wx.setStorageSync('interviewLikes', likes);

    if (interview.authorId && interview.authorId !== userId) {
      const userInfo = wx.getStorageSync('userInfo');
      storageApi.createNotification({
        type: 'like',
        fromUserId: userId,
        fromUserName: userInfo ? userInfo.nickname : '',
        targetUserId: interview.authorId,
        targetId: id,
        targetTitle: interview.intervieweeName + '访谈',
        content: (userInfo ? userInfo.nickname : '有人') + ' 赞了您的访谈',
        jumpType: 'interview',
        jumpId: id
      });
    }

    return { code: 200, data: { isLike: true, likeCount: interview.likeCount }, message: '点赞成功' };
  },

  unlikeInterview: async (id) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '访谈ID不能为空' };
    }
    const userId = getCurrentUserId();
    interviewData.initInterviewData();
    const interviews = wx.getStorageSync('interviews') || [];
    const interview = interviews.find(item => item.id === id);
    if (!interview) {
      return { code: 404, data: null, message: '访谈不存在' };
    }
    interview.likeCount = Math.max((interview.likeCount || 0) - 1, 0);
    wx.setStorageSync('interviews', interviews);
    const likes = wx.getStorageSync('interviewLikes') || {};
    const userLikes = likes[userId] || [];
    const index = userLikes.indexOf(id);
    if (index > -1) {
      userLikes.splice(index, 1);
      likes[userId] = userLikes;
      wx.setStorageSync('interviewLikes', likes);
    }
    return { code: 200, data: { isLike: false, likeCount: interview.likeCount }, message: '已取消点赞' };
  },

  checkInterviewLike: async (id) => {
    await delay(100);
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) {
      return { code: 400, data: null, message: '访谈ID不能为空' };
    }
    const userId = getCurrentUserId();
    const likes = wx.getStorageSync('interviewLikes') || {};
    const userLikes = likes[userId] || [];
    const isLike = userLikes.includes(id);
    return { code: 200, data: { isLike }, message: 'success' };
  },

  getInterviewCollectionList: async (params = {}) => {
    await delay(500);
    interviewData.initInterviewData();
    const { page = 1, pageSize = 10, keyword = '' } = params;
    let collections = wx.getStorageSync('interviewCollections') || [];
    collections = collections.filter(item => item.status === 1);

    if (keyword && keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      collections = collections.filter(item =>
        item.title.toLowerCase().includes(kw) ||
        item.description.toLowerCase().includes(kw)
      );
    }

    collections.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    const total = collections.length;
    const start = (page - 1) * pageSize;
    const list = collections.slice(start, start + pageSize).map(item => ({
      ...item,
      interviewCount: (item.interviewIds || []).length
    }));

    return {
      code: 200,
      data: { list, total, page, pageSize, hasMore: start + pageSize < total },
      message: 'success'
    };
  },

  getInterviewCollectionDetail: async (id) => {
    await delay(300);
    interviewData.initInterviewData();
    if (!id) {
      return { code: 400, data: null, message: '合集ID不能为空' };
    }
    const collections = wx.getStorageSync('interviewCollections') || [];
    const collection = collections.find(item => item.id === id);
    if (!collection) {
      return { code: 404, data: null, message: '合集不存在' };
    }

    collection.viewCount = (collection.viewCount || 0) + 1;
    wx.setStorageSync('interviewCollections', collections);

    const interviews = wx.getStorageSync('interviews') || [];
    const interviewList = interviews.filter(item =>
      (collection.interviewIds || []).includes(item.id) && item.status === 1
    ).map(item => ({
      ...item,
      regionName: interviewData.getRegionName(item.region),
      craftNames: interviewData.getCraftNames(item.crafts)
    }));

    const relatedCollections = collections
      .filter(item => item.id !== id && item.status === 1)
      .slice(0, 4)
      .map(item => ({
        id: item.id,
        title: item.title,
        icon: item.icon,
        coverImage: item.coverImage,
        interviewCount: (item.interviewIds || []).length
      }));

    return {
      code: 200,
      data: { ...collection, interviewList, relatedCollections, interviewCount: interviewList.length },
      message: 'success'
    };
  },

  getCalendarEvents: async (params = {}) => {
    await delay(200);
    const { year, month } = params;
    if (!year || !month) {
      return { code: 400, data: null, message: '年份和月份不能为空' };
    }
    const eventMap = calendarData.getEventsForMonth(year, month);
    return { code: 200, data: eventMap, message: 'success' };
  },

  getCalendarDateDetail: async (params = {}) => {
    await delay(200);
    const { year, month, day } = params;
    if (!year || !month || !day) {
      return { code: 400, data: null, message: '日期参数不完整' };
    }
    const events = calendarData.getEventsForDate(year, month, day);
    let relatedArticles = [];
    if (events.length > 0) {
      const articles = wx.getStorageSync('articles') || [];
      relatedArticles = calendarData.matchArticlesByKeywords(events[0], articles).slice(0, 5);
    }
    return {
      code: 200,
      data: { events, relatedArticles },
      message: 'success'
    };
  },

  subscribeCalendarEvent: async (eventId) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!eventId) {
      return { code: 400, data: null, message: '事件ID不能为空' };
    }
    calendarData.subscribeEvent(eventId);
    return { code: 200, data: { isSubscribed: true }, message: '订阅成功' };
  },

  unsubscribeCalendarEvent: async (eventId) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!eventId) {
      return { code: 400, data: null, message: '事件ID不能为空' };
    }
    calendarData.unsubscribeEvent(eventId);
    return { code: 200, data: { isSubscribed: false }, message: '已取消订阅' };
  },

  checkCalendarSubscription: async (eventId) => {
    await delay(100);
    if (!eventId) {
      return { code: 400, data: null, message: '事件ID不能为空' };
    }
    const isSubscribed = calendarData.isSubscribed(eventId);
    return { code: 200, data: { isSubscribed }, message: 'success' };
  },

  getMyCalendarSubscriptions: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const subs = calendarData.getSubscriptions();
    const list = Object.keys(subs).filter(k => subs[k].subscribed).map(k => ({
      eventId: k,
      subscribeTime: subs[k].subscribeTime
    }));
    return { code: 200, data: { list, total: list.length }, message: 'success' };
  },

  createComment: async (data) => {
    await delay(400);
    const authError = requireLogin();
    if (authError) return authError;

    const { articleId, content, replyToId = null, replyToUserId = null, replyToUserName = '' } = data;

    if (!articleId) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    if (!content || !content.trim()) {
      return { code: 400, data: null, message: '评论内容不能为空' };
    }
    const trimmedContent = content.trim();
    if (trimmedContent.length < 2) {
      return { code: 400, data: null, message: '评论内容至少需要2个字符' };
    }
    if (trimmedContent.length > 500) {
      return { code: 400, data: null, message: '评论内容不能超过500个字符' };
    }

    const articles = wx.getStorageSync('articles') || [];
    const articleIndex = articles.findIndex(item => item.id === articleId);
    if (articleIndex === -1) {
      return { code: 404, data: null, message: '文章不存在' };
    }

    if (replyToId) {
      const comments = wx.getStorageSync('comments') || [];
      const parentComment = comments.find(c => c.id === replyToId);
      if (!parentComment) {
        return { code: 404, data: null, message: '被回复的评论不存在' };
      }
      if (parentComment.articleId !== articleId) {
        return { code: 400, data: null, message: '被回复的评论不属于该文章' };
      }
      if (parentComment.replyToId) {
        return { code: 400, data: null, message: '仅支持二级评论，不能对回复进行回复' };
      }
    }

    const userInfo = wx.getStorageSync('userInfo');
    const comments = wx.getStorageSync('comments') || [];

    const newComment = {
      id: util.generateId('comment'),
      articleId,
      authorId: userInfo.id,
      authorName: userInfo.nickname,
      content: trimmedContent,
      likeCount: 0,
      replyToId: replyToId || null,
      replyToUserId: replyToUserId || null,
      replyToUserName: replyToUserName || '',
      createTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      status: 1
    };

    comments.unshift(newComment);
    wx.setStorageSync('comments', comments);

    articles[articleIndex].commentCount = (articles[articleIndex].commentCount || 0) + 1;
    wx.setStorageSync('articles', articles);

    const article = articles[articleIndex];
    if (article.authorId && article.authorId !== userInfo.id) {
      storageApi.createNotification({
        type: 'comment',
        fromUserId: userInfo.id,
        fromUserName: userInfo.nickname,
        targetUserId: article.authorId,
        targetId: articleId,
        targetTitle: article.title,
        content: `${userInfo.nickname} 评论了你的文章`,
        jumpType: 'article',
        jumpId: articleId
      });
    }

    if (replyToUserId && replyToUserId !== userInfo.id && replyToUserId !== article.authorId) {
      storageApi.createNotification({
        type: 'reply',
        fromUserId: userInfo.id,
        fromUserName: userInfo.nickname,
        targetUserId: replyToUserId,
        targetId: articleId,
        targetTitle: article.title,
        content: `${userInfo.nickname} 回复了你的评论`,
        jumpType: 'article',
        jumpId: articleId
      });
    }

    return { code: 200, data: newComment, message: '评论发布成功' };
  },

  getCommentList: async (params = {}) => {
    await delay(300);
    const { articleId, page = 1, pageSize = 10 } = params;

    if (!articleId) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }

    const userId = getCurrentUserId();
    const allComments = wx.getStorageSync('comments') || [];
    const commentLikes = wx.getStorageSync('commentLikes') || {};
    const userLikedIds = (commentLikes[userId] || []) || [];

    const articles = wx.getStorageSync('articles') || [];
    const article = articles.find(a => a.id === articleId);
    const articleAuthorId = article ? article.authorId : null;

    const articleComments = allComments.filter(c => c.articleId === articleId && c.status === 1);

    const parentComments = articleComments
      .filter(c => !c.replyToId)
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    const total = parentComments.length;
    const start = (page - 1) * pageSize;
    const pagedParents = parentComments.slice(start, start + pageSize);

    const list = pagedParents.map(parent => {
      const replies = articleComments
        .filter(c => c.replyToId === parent.id)
        .sort((a, b) => new Date(a.createTime) - new Date(b.createTime))
        .map(reply => ({
          ...reply,
          isLiked: userLikedIds.includes(reply.id),
          isAuthor: reply.authorId === articleAuthorId,
          canDelete: reply.authorId === userId || articleAuthorId === userId,
          relativeTime: util.formatRelativeTime(reply.createTime)
        }));

      return {
        ...parent,
        isLiked: userLikedIds.includes(parent.id),
        isAuthor: parent.authorId === articleAuthorId,
        canDelete: parent.authorId === userId || articleAuthorId === userId,
        relativeTime: util.formatRelativeTime(parent.createTime),
        replyCount: replies.length,
        replies
      };
    });

    return {
      code: 200,
      data: { list, total, page, pageSize, hasMore: start + pageSize < total },
      message: 'success'
    };
  },

  likeComment: async (commentId) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;

    if (!commentId) {
      return { code: 400, data: null, message: '评论ID不能为空' };
    }

    const userId = getCurrentUserId();
    const comments = wx.getStorageSync('comments') || [];
    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      return { code: 404, data: null, message: '评论不存在' };
    }

    const commentLikes = wx.getStorageSync('commentLikes') || {};
    const userLikes = commentLikes[userId] || [];

    if (userLikes.includes(commentId)) {
      return { code: 200, data: { isLike: true, likeCount: comments[commentIndex].likeCount }, message: '已点赞' };
    }

    comments[commentIndex].likeCount = (comments[commentIndex].likeCount || 0) + 1;
    wx.setStorageSync('comments', comments);

    userLikes.push(commentId);
    commentLikes[userId] = userLikes;
    wx.setStorageSync('commentLikes', commentLikes);

    const comment = comments[commentIndex];
    if (comment.authorId && comment.authorId !== userId) {
      const userInfo = wx.getStorageSync('userInfo');
      const articles = wx.getStorageSync('articles') || [];
      const article = articles.find(a => a.id === comment.articleId);
      storageApi.createNotification({
        type: 'like',
        fromUserId: userId,
        fromUserName: userInfo ? userInfo.nickname : '',
        targetUserId: comment.authorId,
        targetId: comment.articleId,
        targetTitle: article ? article.title : '',
        content: `${userInfo ? userInfo.nickname : '有人'} 赞了你的评论`,
        jumpType: 'article',
        jumpId: comment.articleId
      });
    }

    return { code: 200, data: { isLike: true, likeCount: comments[commentIndex].likeCount }, message: '点赞成功' };
  },

  unlikeComment: async (commentId) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;

    if (!commentId) {
      return { code: 400, data: null, message: '评论ID不能为空' };
    }

    const userId = getCurrentUserId();
    const comments = wx.getStorageSync('comments') || [];
    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      return { code: 404, data: null, message: '评论不存在' };
    }

    comments[commentIndex].likeCount = Math.max((comments[commentIndex].likeCount || 0) - 1, 0);
    wx.setStorageSync('comments', comments);

    const commentLikes = wx.getStorageSync('commentLikes') || {};
    const userLikes = commentLikes[userId] || [];
    const idx = userLikes.indexOf(commentId);
    if (idx > -1) {
      userLikes.splice(idx, 1);
      commentLikes[userId] = userLikes;
      wx.setStorageSync('commentLikes', commentLikes);
    }

    return { code: 200, data: { isLike: false, likeCount: comments[commentIndex].likeCount }, message: '已取消点赞' };
  },

  deleteComment: async (commentId) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;

    if (!commentId) {
      return { code: 400, data: null, message: '评论ID不能为空' };
    }

    const userId = getCurrentUserId();
    const comments = wx.getStorageSync('comments') || [];
    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      return { code: 404, data: null, message: '评论不存在' };
    }

    const comment = comments[commentIndex];
    const articles = wx.getStorageSync('articles') || [];
    const article = articles.find(a => a.id === comment.articleId);
    const isArticleAuthor = article && article.authorId === userId;
    const isCommentAuthor = comment.authorId === userId;

    if (!isArticleAuthor && !isCommentAuthor) {
      return { code: 403, data: null, message: '无权限删除该评论' };
    }

    let deletedCount = 1;
    const idsToDelete = [commentId];
    if (!comment.replyToId) {
      const replies = comments.filter(c => c.replyToId === commentId);
      replies.forEach(r => idsToDelete.push(r.id));
      deletedCount += replies.length;
    }

    const filteredComments = comments.filter(c => !idsToDelete.includes(c.id));
    wx.setStorageSync('comments', filteredComments);

    if (article) {
      const articleIndex = articles.findIndex(a => a.id === comment.articleId);
      articles[articleIndex].commentCount = Math.max((article.commentCount || 0) - deletedCount, 0);
      wx.setStorageSync('articles', articles);
    }

    return { code: 200, data: null, message: '删除成功' };
  },

  getCommentCount: async (articleId) => {
    await delay(100);
    if (!articleId) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const comments = wx.getStorageSync('comments') || [];
    const count = comments.filter(c => c.articleId === articleId && c.status === 1).length;
    return { code: 200, data: { count }, message: 'success' };
  },

  submitReport: async (data) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;

    if (!data.articleId) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    if (!data.reason) {
      return { code: 400, data: null, message: '请选择举报原因' };
    }

    const validReasons = ['illegal', 'false', 'infringement', 'other'];
    if (!validReasons.includes(data.reason)) {
      return { code: 400, data: null, message: '举报原因不合法' };
    }

    const userId = getCurrentUserId();
    const reports = wx.getStorageSync('reports') || [];

    const duplicate = reports.find(r =>
      r.articleId === data.articleId && r.userId === userId && r.status === 'pending'
    );
    if (duplicate) {
      return { code: 400, data: null, message: '您已举报过该文章，请等待处理' };
    }

    const newReport = {
      id: util.generateId('report'),
      articleId: data.articleId,
      userId,
      reason: data.reason,
      description: data.description || '',
      createTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      status: 'pending'
    };

    reports.unshift(newReport);
    wx.setStorageSync('reports', reports);

    return { code: 200, data: newReport, message: '举报成功，我们会尽快处理' };
  },

  submitFeedback: async (data) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;

    if (!data.content || !data.content.trim()) {
      return { code: 400, data: null, message: '请输入反馈内容' };
    }
    if (data.content.trim().length < 5) {
      return { code: 400, data: null, message: '反馈内容至少5个字符' };
    }
    if (data.content.trim().length > 500) {
      return { code: 400, data: null, message: '反馈内容不能超过500字符' };
    }

    const userId = getCurrentUserId();
    const feedbacks = wx.getStorageSync('feedbacks') || [];

    const newFeedback = {
      id: util.generateId('feedback'),
      userId,
      content: data.content.trim(),
      contact: data.contact ? data.contact.trim() : '',
      createTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      status: 'pending'
    };

    feedbacks.unshift(newFeedback);
    wx.setStorageSync('feedbacks', feedbacks);

    return { code: 200, data: newFeedback, message: '感谢您的反馈，我们会认真处理' };
  },

  addHistory: async (articleId) => {
    await delay(100);
    const authError = requireLogin();
    if (authError) return authError;
    if (!articleId) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    const history = wx.getStorageSync('history') || {};
    const userHistory = history[userId] || [];

    const existingIndex = userHistory.findIndex(item => item.articleId === articleId);
    if (existingIndex > -1) {
      userHistory.splice(existingIndex, 1);
    }

    userHistory.unshift({
      articleId,
      readTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
    });

    if (userHistory.length > 50) {
      userHistory.splice(50);
    }

    history[userId] = userHistory;
    wx.setStorageSync('history', history);

    return { code: 200, data: { success: true }, message: '已记录阅读历史' };
  },

  getHistoryList: async (params = {}) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;
    const { category = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    const userId = getCurrentUserId();
    const history = wx.getStorageSync('history') || {};
    const userHistory = history[userId] || [];

    if (userHistory.length === 0) {
      return {
        code: 200,
        data: { list: [], total: 0, page, pageSize, hasMore: false },
        message: 'success'
      };
    }

    const articleIdMap = {};
    userHistory.forEach((item, index) => {
      articleIdMap[item.articleId] = item.readTime;
    });

    let articles = wx.getStorageSync('articles') || [];
    articles = articles.filter(item => articleIdMap[item.id]);

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

    articles.sort((a, b) => {
      const timeA = new Date(articleIdMap[a.id]).getTime();
      const timeB = new Date(articleIdMap[b.id]).getTime();
      return timeB - timeA;
    });

    articles = articles.map(item => ({
      ...item,
      readTime: articleIdMap[item.id]
    }));

    const total = articles.length;
    const start = (page - 1) * pageSize;
    const list = articles.slice(start, start + pageSize);

    return {
      code: 200,
      data: { list, total, page, pageSize, hasMore: start + pageSize < total },
      message: 'success'
    };
  },

  deleteHistory: async (articleId) => {
    await delay(100);
    const authError = requireLogin();
    if (authError) return authError;
    if (!articleId) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    const history = wx.getStorageSync('history') || {};
    const userHistory = history[userId] || [];

    const index = userHistory.findIndex(item => item.articleId === articleId);
    if (index > -1) {
      userHistory.splice(index, 1);
      history[userId] = userHistory;
      wx.setStorageSync('history', history);
    }

    return { code: 200, data: { success: true }, message: '删除成功' };
  },

  clearHistory: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    const history = wx.getStorageSync('history') || {};
    history[userId] = [];
    wx.setStorageSync('history', history);

    return { code: 200, data: { success: true }, message: '已清空阅读历史' };
  },

  initCertificates: async () => {
    await delay(200);
    let certificates = wx.getStorageSync('certificates');
    if (!certificates || certificates.length === 0) {
      certificates = JSON.parse(JSON.stringify(certificateData.DEFAULT_CERTIFICATES));
      wx.setStorageSync('certificates', certificates);
    }
    return {
      code: 200,
      data: null,
      message: 'success'
    };
  },

  getMyCertificates: async (params = {}) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;

    const userId = getCurrentUserId();
    const { page = 1, pageSize = 10, typeId = '', keyword = '' } = params;

    await storageApi.initCertificates();
    let certificates = wx.getStorageSync('certificates') || [];

    certificates = certificates.filter(cert => cert.userId === userId && cert.status === 'issued');

    if (typeId && typeId !== 'all') {
      certificates = certificates.filter(cert => cert.typeId === typeId);
    }

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      certificates = certificates.filter(cert =>
        cert.title.toLowerCase().includes(lowerKeyword) ||
        cert.reason.toLowerCase().includes(lowerKeyword) ||
        cert.certificateNumber.toLowerCase().includes(lowerKeyword) ||
        cert.issuingUnitName.toLowerCase().includes(lowerKeyword)
      );
    }

    certificates.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

    const total = certificates.length;
    const start = (page - 1) * pageSize;
    const list = certificates.slice(start, start + pageSize).map(cert => ({
      ...cert,
      typeInfo: certificateData.getCertificateTypeInfo(cert.typeId),
      statusInfo: certificateData.getCertificateStatusInfo(cert.status),
      formattedDate: certificateData.formatCertificateDate(cert.issueDate)
    }));

    return {
      code: 200,
      data: {
        list,
        total,
        page,
        pageSize,
        hasMore: start + pageSize < total
      },
      message: 'success'
    };
  },

  getCertificateDetail: async (certificateId) => {
    await delay(500);
    if (!certificateId) {
      return { code: 400, data: null, message: '证书ID不能为空' };
    }

    await storageApi.initCertificates();
    const certificates = wx.getStorageSync('certificates') || [];
    const certificate = certificates.find(cert => cert.id === certificateId);

    if (!certificate) {
      return { code: 404, data: null, message: '证书不存在' };
    }

    const certIndex = certificates.findIndex(cert => cert.id === certificateId);
    if (certIndex !== -1) {
      certificates[certIndex].viewCount = (certificates[certIndex].viewCount || 0) + 1;
      wx.setStorageSync('certificates', certificates);
    }

    const verifyResult = certificateData.verifyCertificateHash(certificate);
    const typeInfo = certificateData.getCertificateTypeInfo(certificate.typeId);
    const statusInfo = certificateData.getCertificateStatusInfo(certificate.status);
    const isRevoked = certificate.status === 'revoked';

    const fullVerifyResult = {
      ...verifyResult,
      hashValid: verifyResult.valid,
      revoked: isRevoked
    };

    if (isRevoked) {
      fullVerifyResult.valid = false;
      fullVerifyResult.message = '证书已被撤销';
    }

    return {
      code: 200,
      data: {
        ...certificate,
        viewCount: certificates[certIndex].viewCount,
        typeInfo,
        statusInfo,
        formattedDate: certificateData.formatCertificateDate(certificate.issueDate),
        verifyResult: fullVerifyResult
      },
      message: 'success'
    };
  },

  verifyCertificate: async (params = {}) => {
    await delay(500);
    const { certificateNumber = '', verificationCode = '' } = params;

    if (!certificateNumber) {
      return { code: 400, data: null, message: '请输入证书编号' };
    }

    await storageApi.initCertificates();
    const certificates = wx.getStorageSync('certificates') || [];
    const certificate = certificates.find(cert => cert.certificateNumber === certificateNumber);

    if (!certificate) {
      return {
        code: 404,
        data: null,
        message: '证书不存在，请检查编号是否正确'
      };
    }

    if (verificationCode && certificate.verificationCode !== verificationCode) {
      return {
        code: 400,
        data: {
          certificateNumber: certificate.certificateNumber,
          userName: certificate.userName,
          title: certificate.title
        },
        message: '验证码错误，请重新输入'
      };
    }

    const verifyResult = certificateData.verifyCertificateHash(certificate);
    const typeInfo = certificateData.getCertificateTypeInfo(certificate.typeId);
    const isRevoked = certificate.status === 'revoked';
    const codeValid = !verificationCode || certificate.verificationCode === verificationCode;

    const fullVerifyResult = {
      ...verifyResult,
      hashValid: verifyResult.valid,
      codeValid,
      revoked: isRevoked
    };

    if (isRevoked) {
      fullVerifyResult.valid = false;
      fullVerifyResult.message = '证书已被撤销';
    }

    return {
      code: 200,
      data: {
        certificate: {
          ...certificate,
          typeInfo,
          formattedDate: certificateData.formatCertificateDate(certificate.issueDate)
        },
        verifyResult: fullVerifyResult,
        isVerified: !isRevoked && verifyResult.valid
      },
      message: fullVerifyResult.valid ? '证书验证通过' : fullVerifyResult.message
    };
  },

  getCertificateTypes: async () => {
    await delay(200);
    return {
      code: 200,
      data: certificateData.getCertificateTypes(),
      message: 'success'
    };
  },

  getIssuingUnits: async () => {
    await delay(200);
    return {
      code: 200,
      data: certificateData.getIssuingUnits(),
      message: 'success'
    };
  },

  issueCertificate: async (data = {}) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;

    const currentUser = wx.getStorageSync('userInfo');
    if (currentUser.role !== 'admin') {
      return { code: 403, data: null, message: '无权限颁发证书' };
    }

    const {
      userId,
      userName,
      typeId,
      title,
      reason,
      issuingUnit,
      issuingUnitId,
      issueDate,
      relatedType,
      relatedId,
      relatedTitle
    } = data;
    const unitId = issuingUnitId || issuingUnit;

    if (!userId || !userName) {
      return { code: 400, data: null, message: '用户信息不完整' };
    }
    if (!typeId) {
      return { code: 400, data: null, message: '请选择证书类型' };
    }

    await storageApi.initCertificates();
    const certificate = certificateData.createCertificateData({
      userId,
      userName,
      typeId,
      title,
      reason,
      issuingUnit: unitId,
      issueDate,
      relatedType,
      relatedId,
      relatedTitle,
      issuerId: currentUser.id,
      issuerName: currentUser.nickname
    });

    const certificates = wx.getStorageSync('certificates') || [];
    certificates.unshift(certificate);
    wx.setStorageSync('certificates', certificates);

    return {
      code: 200,
      data: { certificate },
      message: '证书颁发成功'
    };
  },

  batchIssueCertificates: async (data = {}) => {
    await delay(1000);
    const authError = requireLogin();
    if (authError) return authError;

    const currentUser = wx.getStorageSync('userInfo');
    if (currentUser.role !== 'admin') {
      return { code: 403, data: null, message: '无权限颁发证书' };
    }

    const { recipients, users, typeId, title, reason, issuingUnit, issuingUnitId, issueDate, relatedType, relatedId, relatedTitle } = data;
    const userList = (recipients && recipients.length > 0) ? recipients : users;
    const unitId = issuingUnitId || issuingUnit;

    if (!userList || userList.length === 0) {
      return { code: 400, data: null, message: '请选择要颁发证书的用户' };
    }
    if (!typeId) {
      return { code: 400, data: null, message: '请选择证书类型' };
    }

    await storageApi.initCertificates();
    const certificates = wx.getStorageSync('certificates') || [];
    const issuedCertificates = [];
    const failedUsers = [];

    for (const user of userList) {
      try {
        const certificate = certificateData.createCertificateData({
          userId: user.userId || user.id,
          userName: user.userName || user.name,
          userAvatar: user.avatar || '',
          typeId,
          title,
          reason,
          issuingUnit: unitId,
          issueDate,
          relatedType,
          relatedId,
          relatedTitle,
          issuerId: currentUser.id,
          issuerName: currentUser.nickname
        });
        certificates.unshift(certificate);
        issuedCertificates.push(certificate);
      } catch (e) {
        failedUsers.push({ user, error: e.message });
      }
    }

    wx.setStorageSync('certificates', certificates);

    return {
      code: 200,
      data: {
        count: issuedCertificates.length,
        certificates: issuedCertificates,
        successCount: issuedCertificates.length,
        failedCount: failedUsers.length,
        issuedCertificates,
        failedUsers
      },
      message: `成功颁发 ${issuedCertificates.length} 张证书，失败 ${failedUsers.length} 张`
    };
  },

  revokeCertificate: async (certificateId, reason) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;

    const currentUser = wx.getStorageSync('userInfo');
    if (currentUser.role !== 'admin') {
      return { code: 403, data: null, message: '无权限撤销证书' };
    }

    if (!certificateId) {
      return { code: 400, data: null, message: '证书ID不能为空' };
    }

    await storageApi.initCertificates();
    const certificates = wx.getStorageSync('certificates') || [];
    const certIndex = certificates.findIndex(cert => cert.id === certificateId);

    if (certIndex === -1) {
      return { code: 404, data: null, message: '证书不存在' };
    }

    certificates[certIndex].status = 'revoked';
    certificates[certIndex].revokeTime = new Date().toISOString();
    certificates[certIndex].revokerId = currentUser.id;
    certificates[certIndex].revokerName = currentUser.nickname;
    if (reason) {
      certificates[certIndex].revokeReason = reason;
    }

    wx.setStorageSync('certificates', certificates);

    return {
      code: 200,
      data: certificates[certIndex],
      message: '证书已撤销'
    };
  },

  getAllCertificates: async (params = {}) => {
    await delay(500);
    const authError = requireLogin();
    if (authError) return authError;

    const currentUser = wx.getStorageSync('userInfo');
    if (currentUser.role !== 'admin') {
      return { code: 403, data: null, message: '无权限查看所有证书' };
    }

    const { page = 1, pageSize = 10, userId = '', typeId = '', status = '', keyword = '' } = params;

    await storageApi.initCertificates();
    let certificates = wx.getStorageSync('certificates') || [];

    if (userId) {
      certificates = certificates.filter(cert => cert.userId === userId);
    }
    if (typeId && typeId !== 'all') {
      certificates = certificates.filter(cert => cert.typeId === typeId);
    }
    if (status && status !== 'all') {
      certificates = certificates.filter(cert => cert.status === status);
    }
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      certificates = certificates.filter(cert =>
        cert.userName.toLowerCase().includes(lowerKeyword) ||
        cert.title.toLowerCase().includes(lowerKeyword) ||
        cert.certificateNumber.toLowerCase().includes(lowerKeyword)
      );
    }

    certificates.sort((a, b) => new Date(b.issueTime) - new Date(a.issueTime));

    const total = certificates.length;
    const start = (page - 1) * pageSize;
    const list = certificates.slice(start, start + pageSize).map(cert => ({
      ...cert,
      typeInfo: certificateData.getCertificateTypeInfo(cert.typeId),
      statusInfo: certificateData.getCertificateStatusInfo(cert.status),
      formattedDate: certificateData.formatCertificateDate(cert.issueDate)
    }));

    return {
      code: 200,
      data: {
        list,
        total,
        page,
        pageSize,
        hasMore: start + pageSize < total
      },
      message: 'success'
    };
  },

  issueCertificatesForActivity: async (activityId) => {
    await delay(800);
    const authError = requireLogin();
    if (authError) return authError;

    const currentUser = wx.getStorageSync('userInfo');
    if (currentUser.role !== 'admin') {
      return { code: 403, data: null, message: '无权限操作' };
    }

    if (!activityId) {
      return { code: 400, data: null, message: '活动ID不能为空' };
    }

    const activities = wx.getStorageSync('activities') || [];
    const activity = activities.find(a => a.id === activityId);
    if (!activity) {
      return { code: 404, data: null, message: '活动不存在' };
    }

    const registrations = wx.getStorageSync('activityRegistrations') || {};
    const activityRegistrations = registrations[activityId] || [];

    if (activityRegistrations.length === 0) {
      return { code: 400, data: null, message: '该活动没有报名用户' };
    }

    const users = activityRegistrations.map(reg => ({
      id: reg.userId,
      name: reg.userName,
      avatar: reg.userAvatar || ''
    }));

    return await storageApi.batchIssueCertificates({
      users,
      typeId: 'activity_completion',
      title: '活动结业证书',
      reason: `已完成"${activity.title}"全部课程学习，成绩合格，准予结业。`,
      issuingUnit: 'education_base',
      issueDate: new Date().toISOString().split('T')[0],
      relatedType: 'activity',
      relatedId: activityId,
      relatedTitle: activity.title
    });
  },

  issueCertificateForArticle: async (articleId) => {
    await delay(600);
    const authError = requireLogin();
    if (authError) return authError;

    const currentUser = wx.getStorageSync('userInfo');
    if (currentUser.role !== 'admin') {
      return { code: 403, data: null, message: '无权限操作' };
    }

    if (!articleId) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }

    const articles = wx.getStorageSync('articles') || [];
    const article = articles.find(a => a.id === articleId);
    if (!article) {
      return { code: 404, data: null, message: '文章不存在' };
    }

    const result = await storageApi.issueCertificate({
      userId: article.authorId,
      userName: article.authorName,
      typeId: 'collection_completion',
      title: '文化贡献证书',
      reason: `您的作品《${article.title}》已被收录至乡村文化库，感谢您为乡村文化传承做出的宝贵贡献。`,
      issuingUnit: 'heritage_center',
      issueDate: new Date().toISOString().split('T')[0],
      relatedType: 'article',
      relatedId: articleId,
      relatedTitle: article.title
    });
    return result;
  },

  shareCertificate: async (certificateId) => {
    await delay(300);
    if (!certificateId) {
      return { code: 400, data: null, message: '证书ID不能为空' };
    }

    await storageApi.initCertificates();
    const certificates = wx.getStorageSync('certificates') || [];
    const certIndex = certificates.findIndex(cert => cert.id === certificateId);

    if (certIndex === -1) {
      return { code: 404, data: null, message: '证书不存在' };
    }

    certificates[certIndex].shareCount = (certificates[certIndex].shareCount || 0) + 1;
    wx.setStorageSync('certificates', certificates);

    return {
      code: 200,
      data: {
        shareCount: certificates[certIndex].shareCount,
        shareUrl: `/pages/certificate-detail/certificate-detail?id=${certificateId}`,
        shareTitle: `${certificates[certIndex].userName}的${certificates[certIndex].title}`
      },
      message: 'success'
    };
  },

  getCertificateStats: async () => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;

    const userId = getCurrentUserId();
    await storageApi.initCertificates();
    const certificates = wx.getStorageSync('certificates') || [];

    const myCertificates = certificates.filter(cert => cert.userId === userId && cert.status === 'issued');

    const typeStats = {};
    myCertificates.forEach(cert => {
      if (!typeStats[cert.typeId]) {
        const typeInfo = certificateData.getCertificateTypeInfo(cert.typeId);
        typeStats[cert.typeId] = {
          typeId: cert.typeId,
          typeName: typeInfo.name,
          icon: typeInfo.icon,
          color: typeInfo.color,
          count: 0
        };
      }
      typeStats[cert.typeId].count++;
    });

    return {
      code: 200,
      data: {
        totalCount: myCertificates.length,
        typeStats: Object.values(typeStats),
        recentCertificates: myCertificates.slice(0, 3).map(cert => ({
          ...cert,
          typeInfo: certificateData.getCertificateTypeInfo(cert.typeId),
          formattedDate: certificateData.formatCertificateDate(cert.issueDate)
        }))
      },
      message: 'success'
    };
  },

  getAllUsers: async () => {
    await delay(200);
    const users = wx.getStorageSync('users') || [];
    return {
      code: 200,
      data: users,
      message: 'success'
    };
  },

  getAllArticles: async () => {
    await delay(200);
    const articles = wx.getStorageSync('articles') || [];
    const publishedArticles = articles.filter(a => a.status === 1);
    return {
      code: 200,
      data: publishedArticles,
      message: 'success'
    };
  },

  getOnboardingStatus: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const status = taskSystem.getOnboardingStatus();
    return { code: 200, data: status, message: 'success' };
  },

  getOnboardingProgress: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const progress = taskSystem.getOnboardingProgress();
    return { code: 200, data: progress, message: 'success' };
  },

  completeOnboardingStep: async (stepId) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!stepId) {
      return { code: 400, data: null, message: '步骤ID不能为空' };
    }
    const result = taskSystem.completeOnboardingStep(stepId);
    if (result.success) {
      return { code: 200, data: result, message: '步骤完成成功' };
    }
    return { code: 400, data: null, message: result.message || '步骤完成失败' };
  },

  skipOnboarding: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const result = taskSystem.skipOnboarding();
    return { code: 200, data: result, message: 'success' };
  },

  getSevenDayProgress: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const progress = taskSystem.getSevenDayProgress();
    return { code: 200, data: progress, message: 'success' };
  },

  claimSevenDayReward: async (day) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!day) {
      return { code: 400, data: null, message: '天数不能为空' };
    }
    const result = taskSystem.claimSevenDayReward(day);
    if (result.success) {
      return { code: 200, data: result, message: '奖励领取成功' };
    }
    return { code: 400, data: null, message: result.message || '奖励领取失败' };
  },

  getActiveFestivalTaskLine: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const festivalTask = taskSystem.getActiveFestivalTaskLine();
    return { code: 200, data: festivalTask, message: 'success' };
  },

  getFestivalProgress: async (festivalId) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!festivalId) {
      return { code: 400, data: null, message: '节日ID不能为空' };
    }
    const progress = taskSystem.getFestivalProgress(festivalId);
    return { code: 200, data: progress, message: 'success' };
  },

  claimFestivalReward: async (festivalId, taskId) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!festivalId) {
      return { code: 400, data: null, message: '节日ID不能为空' };
    }
    if (!taskId) {
      return { code: 400, data: null, message: '任务ID不能为空' };
    }
    const result = taskSystem.claimFestivalReward(festivalId, taskId);
    if (result.success) {
      return { code: 200, data: result, message: '节日奖励领取成功' };
    }
    return { code: 400, data: null, message: result.message || '奖励领取失败' };
  },

  getUserPoints: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const points = taskSystem.getUserPoints();
    return { code: 200, data: { points }, message: 'success' };
  },

  getUserBadges: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const badges = taskSystem.getUserBadges();
    return { code: 200, data: { badges }, message: 'success' };
  },

  getAllBadges: async () => {
    await delay(200);
    const badges = taskSystem.getAllBadges();
    return { code: 200, data: { badges }, message: 'success' };
  },

  getBadgeById: async (badgeId) => {
    await delay(200);
    if (!badgeId) {
      return { code: 400, data: null, message: '勋章ID不能为空' };
    }
    const badge = taskSystem.getBadgeById(badgeId);
    if (badge) {
      return { code: 200, data: badge, message: 'success' };
    }
    return { code: 404, data: null, message: '勋章不存在' };
  },

  recordTaskAction: async (actionType, data = {}) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!actionType) {
      return { code: 400, data: null, message: '动作类型不能为空' };
    }
    const result = taskSystem.recordAction(actionType, data);
    return { code: 200, data: result, message: 'success' };
  },

  getUserLevel: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const level = taskSystem.getUserLevel();
    return { code: 200, data: level, message: 'success' };
  },

  getLevelInfo: async (levelId) => {
    await delay(200);
    if (!levelId) {
      return { code: 400, data: null, message: '等级ID不能为空' };
    }
    const info = taskSystem.getLevelInfo(levelId);
    if (info) {
      return { code: 200, data: info, message: 'success' };
    }
    return { code: 404, data: null, message: '等级不存在' };
  },

  getAllLevels: async () => {
    await delay(200);
    const levels = taskSystem.getAllLevels();
    return { code: 200, data: { levels }, message: 'success' };
  },

  getLevelProgress: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const progress = taskSystem.getLevelProgress();
    return { code: 200, data: progress, message: 'success' };
  },

  doDailyCheckin: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const result = taskSystem.doDailyCheckin();
    if (result.success) {
      return { code: 200, data: result, message: '打卡成功' };
    }
    return { code: 400, data: null, message: result.message || '打卡失败' };
  },

  hasCheckedInToday: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const checked = taskSystem.hasCheckedInToday();
    return { code: 200, data: { checked }, message: 'success' };
  },

  getConsecutiveCheckinDays: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    const days = taskSystem.getConsecutiveCheckinDays();
    return { code: 200, data: { days }, message: 'success' };
  },

  getTaskCenterData: async () => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;

    const points = taskSystem.getUserPoints();
    const level = taskSystem.getUserLevel();
    const levelProgress = taskSystem.getLevelProgress();
    const userBadges = taskSystem.getUserBadges();
    const allBadges = taskSystem.getAllBadges();
    const onboarding = taskSystem.getOnboardingProgress();
    const sevenDay = taskSystem.getSevenDayProgress();
    const festival = taskSystem.getActiveFestivalTaskLine();
    const checkedIn = taskSystem.hasCheckedInToday();
    const consecutiveDays = taskSystem.getConsecutiveCheckinDays();

    const badgeList = userBadges.badges || userBadges;

    return {
      code: 200,
      data: {
        points,
        level,
        levelProgress,
        badges: badgeList,
        userBadges: badgeList,
        allBadges: allBadges.badges || allBadges,
        onboarding,
        sevenDay,
        festival,
        checkedIn,
        consecutiveDays
      },
      message: 'success'
    };
  },

  resetTaskData: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    taskSystem.resetTaskData();
    return { code: 200, data: null, message: '任务数据已重置' };
  },

  getAchievementCard: async (badgeId) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    if (!badgeId) {
      return { code: 400, data: null, message: '勋章ID不能为空' };
    }
    const badge = taskSystem.getBadgeById(badgeId);
    if (!badge) {
      return { code: 404, data: null, message: '勋章不存在' };
    }
    const userInfo = wx.getStorageSync('userInfo') || {};
    const points = taskSystem.getUserPoints();
    const level = taskSystem.getUserLevel();

    return {
      code: 200,
      data: {
        badge,
        user: {
          nickname: userInfo.nickname || '匿名用户',
          avatar: userInfo.avatar || ''
        },
        points,
        level,
        shareTitle: `我在乡村文化库获得了「${badge.name}」勋章！`,
        shareImage: badge.icon || ''
      },
      message: 'success'
    };
  },

  getConversationList: async (params = {}) => {
    await delay(400);
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    const conversations = wx.getStorageSync('conversations') || {};
    const userConversations = conversations[userId] || [];
    const blockedUsers = storageApi._getBlockedUsers(userId);
    const blockedIds = blockedUsers.map(b => b.userId);
    const filtered = userConversations.filter(c => !blockedIds.includes(c.peerUserId));
    filtered.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    const totalUnread = filtered.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    return {
      code: 200,
      data: { list: filtered, total: filtered.length, totalUnread },
      message: 'success'
    };
  },

  _getOrCreateConversationObj: (userId, peerUserId, peerUserName, peerAvatar, source) => {
    const conversations = wx.getStorageSync('conversations') || {};
    if (!conversations[userId]) conversations[userId] = [];
    let conv = conversations[userId].find(c => c.peerUserId === peerUserId);
    if (!conv) {
      conv = {
        id: util.generateId('conv'),
        peerUserId,
        peerUserName: peerUserName || ('用户' + peerUserId.slice(-4)),
        peerAvatar: peerAvatar || '',
        unreadCount: 0,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        status: 'active',
        acceptStatus: 'pending',
        source: source || 'direct',
        createTime: new Date().toISOString()
      };
      conversations[userId].unshift(conv);
    } else {
      conv.peerUserName = peerUserName || conv.peerUserName;
      conv.peerAvatar = peerAvatar || conv.peerAvatar;
    }
    wx.setStorageSync('conversations', conversations);
    return conv;
  },

  _saveConversationObj: (userId, conv) => {
    const conversations = wx.getStorageSync('conversations') || {};
    if (!conversations[userId]) conversations[userId] = [];
    const idx = conversations[userId].findIndex(c => c.id === conv.id || c.peerUserId === conv.peerUserId);
    if (idx > -1) {
      conversations[userId][idx] = conv;
    } else {
      conversations[userId].unshift(conv);
    }
    wx.setStorageSync('conversations', conversations);
  },

  getOrCreateConversation: async (peerUserId, extra = {}) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    if (!peerUserId) return { code: 400, data: null, message: '对方用户ID不能为空' };
    const userId = getCurrentUserId();
    if (peerUserId === userId) return { code: 400, data: null, message: '不能与自己发起会话' };
    if (storageApi._isBlocked(userId, peerUserId)) {
      return { code: 403, data: null, message: '您已拉黑该用户，无法发起会话' };
    }
    if (storageApi._isBlockedBy(userId, peerUserId)) {
      return { code: 403, data: null, message: '对方已将您拉黑，无法发起会话' };
    }
    const { peerUserName, peerAvatar, source, sourceId, sourceTitle } = extra;
    const myConv = storageApi._getOrCreateConversationObj(userId, peerUserId, peerUserName, peerAvatar, source);
    const peerConv = storageApi._getOrCreateConversationObj(peerUserId, userId, '', '', source);
    if (source && sourceId) {
      myConv.sourceId = sourceId;
      myConv.sourceTitle = sourceTitle || '';
      peerConv.sourceId = sourceId;
      peerConv.sourceTitle = sourceTitle || '';
      storageApi._saveConversationObj(userId, myConv);
      storageApi._saveConversationObj(peerUserId, peerConv);
    }
    const messages = storageApi._getMessageListOfConv(userId, peerUserId);
    return {
      code: 200,
      data: { conversation: myConv, messages },
      message: 'success'
    };
  },

  acceptConversationRequest: async (peerUserId) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    if (!peerUserId) return { code: 400, data: null, message: '对方用户ID不能为空' };
    const userId = getCurrentUserId();
    const myConv = storageApi._getConversationObj(userId, peerUserId);
    if (!myConv) return { code: 404, data: null, message: '会话不存在' };
    myConv.acceptStatus = 'accepted';
    myConv.status = 'active';
    storageApi._saveConversationObj(userId, myConv);
    const peerConv = storageApi._getConversationObj(peerUserId, userId);
    if (peerConv) {
      peerConv.acceptStatus = 'accepted';
      peerConv.status = 'active';
      storageApi._saveConversationObj(peerUserId, peerConv);
    }
    return { code: 200, data: myConv, message: '已接受会话' };
  },

  rejectConversationRequest: async (peerUserId) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    if (!peerUserId) return { code: 400, data: null, message: '对方用户ID不能为空' };
    const userId = getCurrentUserId();
    const myConv = storageApi._getConversationObj(userId, peerUserId);
    if (!myConv) return { code: 404, data: null, message: '会话不存在' };
    myConv.acceptStatus = 'rejected';
    myConv.status = 'rejected';
    storageApi._saveConversationObj(userId, myConv);
    const peerConv = storageApi._getConversationObj(peerUserId, userId);
    if (peerConv) {
      peerConv.acceptStatus = 'rejected';
      peerConv.status = 'rejected';
      storageApi._saveConversationObj(peerUserId, peerConv);
    }
    const conversations = wx.getStorageSync('conversations') || {};
    if (conversations[userId]) {
      conversations[userId] = conversations[userId].filter(c => c.peerUserId !== peerUserId);
      wx.setStorageSync('conversations', conversations);
    }
    return { code: 200, data: myConv, message: '已拒绝会话' };
  },

  markConversationAsRead: async (peerUserId) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!peerUserId) return { code: 400, data: null, message: '对方用户ID不能为空' };
    const userId = getCurrentUserId();
    const conv = storageApi._getConversationObj(userId, peerUserId);
    if (conv) {
      conv.unreadCount = 0;
      storageApi._saveConversationObj(userId, conv);
    }
    const messages = wx.getStorageSync('messages') || {};
    const key = storageApi._convKey(userId, peerUserId);
    if (messages[key]) {
      messages[key] = messages[key].map(m => ({ ...m, isRead: true }));
      wx.setStorageSync('messages', messages);
    }
    return { code: 200, data: null, message: 'success' };
  },

  deleteConversation: async (peerUserId) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    if (!peerUserId) return { code: 400, data: null, message: '对方用户ID不能为空' };
    const userId = getCurrentUserId();
    const conversations = wx.getStorageSync('conversations') || {};
    if (conversations[userId]) {
      conversations[userId] = conversations[userId].filter(c => c.peerUserId !== peerUserId);
      wx.setStorageSync('conversations', conversations);
    }
    const messages = wx.getStorageSync('messages') || {};
    delete messages[storageApi._convKey(userId, peerUserId)];
    wx.setStorageSync('messages', messages);
    return { code: 200, data: null, message: '已删除会话' };
  },

  getMessageList: async (peerUserId, params = {}) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    if (!peerUserId) return { code: 400, data: null, message: '对方用户ID不能为空' };
    const userId = getCurrentUserId();
    const all = storageApi._getMessageListOfConv(userId, peerUserId);
    const { page = 1, pageSize = 50 } = params;
    const total = all.length;
    const reversed = [...all].reverse();
    const start = (page - 1) * pageSize;
    const pageList = reversed.slice(start, start + pageSize).reverse();
    return {
      code: 200,
      data: { list: pageList, total, page, pageSize, hasMore: start + pageSize < total },
      message: 'success'
    };
  },

  _convKey: (uid1, uid2) => [uid1, uid2].sort().join('__'),

  _getMessageListOfConv: (userId, peerUserId) => {
    const messages = wx.getStorageSync('messages') || {};
    const key = storageApi._convKey(userId, peerUserId);
    return messages[key] || [];
  },

  _appendMessage: (userId, peerUserId, message) => {
    const messages = wx.getStorageSync('messages') || {};
    const key = storageApi._convKey(userId, peerUserId);
    if (!messages[key]) messages[key] = [];
    messages[key].push(message);
    wx.setStorageSync('messages', messages);
  },

  _getConversationObj: (userId, peerUserId) => {
    const conversations = wx.getStorageSync('conversations') || {};
    const list = conversations[userId] || [];
    return list.find(c => c.peerUserId === peerUserId);
  },

  _isStranger: (userId, peerUserId) => {
    const myConv = storageApi._getConversationObj(userId, peerUserId);
    if (!myConv) return true;
    const msgs = storageApi._getMessageListOfConv(userId, peerUserId);
    const peerSent = msgs.filter(m => m.fromUserId === peerUserId);
    return peerSent.length === 0 && myConv.acceptStatus !== 'accepted';
  },

  sendMessage: async (peerUserId, content, extra = {}) => {
    await delay(400);
    const authError = requireLogin();
    if (authError) return authError;
    if (!peerUserId) return { code: 400, data: null, message: '对方用户ID不能为空' };
    const userId = getCurrentUserId();
    if (peerUserId === userId) return { code: 400, data: null, message: '不能给自己发消息' };
    if (storageApi._isBlocked(userId, peerUserId)) {
      return { code: 403, data: null, message: '您已拉黑该用户，无法发送消息' };
    }
    if (storageApi._isBlockedBy(userId, peerUserId)) {
      return { code: 403, data: null, message: '对方已将您拉黑，无法发送消息' };
    }
    const text = (content || '').trim();
    if (text.length < 2) return { code: 400, data: null, message: '消息内容至少需要2个字符' };
    if (text.length > 500) return { code: 400, data: null, message: '消息内容不能超过500个字符' };
    const sensitive = util.checkSensitiveWords(text);
    if (sensitive.hasSensitive) {
      return {
        code: 400,
        data: { matchedWords: sensitive.matchedWords },
        message: '消息包含敏感词：' + sensitive.matchedWords.join('、')
      };
    }
    const myConv = storageApi._getConversationObj(userId, peerUserId);
    if (myConv && myConv.acceptStatus === 'rejected') {
      return { code: 403, data: null, message: '对方已拒绝您的会话请求' };
    }
    const peerConv = storageApi._getConversationObj(peerUserId, userId);
    const peerRejected = peerConv && peerConv.acceptStatus === 'rejected';
    if (peerRejected) {
      return { code: 403, data: null, message: '对方已拒绝您的会话请求' };
    }
    const isFirstContact = storageApi._isStranger(peerUserId, userId);
    if (myConv && myConv.acceptStatus === 'sent_pending' && !isFirstContact) {
      return { code: 403, data: null, message: '消息已送达，请等待对方接受会话请求后再发送' };
    }
    if (isFirstContact && (!peerConv || peerConv.acceptStatus === 'pending')) {
      if (peerConv) {
        peerConv.acceptStatus = 'pending';
        peerConv.status = 'active';
      }
    } else if (myConv && myConv.acceptStatus === 'pending') {
      myConv.acceptStatus = 'accepted';
    }
    const userInfo = wx.getStorageSync('userInfo') || {};
    const { peerUserName, peerAvatar, source, sourceId, sourceTitle } = extra;
    const nowStr = new Date().toISOString();
    const message = {
      id: util.generateId('msg'),
      fromUserId: userId,
      fromUserName: userInfo.nickname || '我',
      fromUserAvatar: userInfo.avatar || '',
      toUserId: peerUserId,
      content: text,
      type: 'text',
      createTime: nowStr,
      isRead: false,
      isFirstStrangerMessage: isFirstContact
    };
    storageApi._appendMessage(userId, peerUserId, message);
    const mySaved = storageApi._getConversationObj(userId, peerUserId)
      || storageApi._getOrCreateConversationObj(userId, peerUserId, peerUserName, peerAvatar, source);
    mySaved.lastMessage = text;
    mySaved.lastMessageTime = nowStr;
    mySaved.unreadCount = 0;
    if (source) mySaved.source = source;
    if (sourceId) mySaved.sourceId = sourceId;
    if (sourceTitle) mySaved.sourceTitle = sourceTitle;
    if (isFirstContact && mySaved.acceptStatus === 'pending') {
      mySaved.acceptStatus = 'sent_pending';
    } else if (mySaved.acceptStatus === 'pending' || mySaved.acceptStatus === 'sent_pending') {
      mySaved.acceptStatus = 'accepted';
    }
    storageApi._saveConversationObj(userId, mySaved);
    const peerSaved = storageApi._getConversationObj(peerUserId, userId)
      || storageApi._getOrCreateConversationObj(peerUserId, userId, userInfo.nickname, userInfo.avatar, source);
    peerSaved.lastMessage = text;
    peerSaved.lastMessageTime = nowStr;
    peerSaved.unreadCount = (peerSaved.unreadCount || 0) + 1;
    if (source) peerSaved.source = source;
    if (sourceId) peerSaved.sourceId = sourceId;
    if (sourceTitle) peerSaved.sourceTitle = sourceTitle;
    if (isFirstContact) {
      peerSaved.acceptStatus = 'pending';
    } else if (peerSaved.acceptStatus === 'pending' || peerSaved.acceptStatus === 'sent_pending') {
      peerSaved.acceptStatus = 'accepted';
    }
    storageApi._saveConversationObj(peerUserId, peerSaved);
    storageApi.createNotification({
      type: isFirstContact ? 'message_request' : 'message',
      fromUserId: userId,
      fromUserName: userInfo.nickname || '',
      targetUserId: peerUserId,
      targetId: message.id,
      targetTitle: '',
      content: isFirstContact
        ? `${userInfo.nickname || '有人'} 向您发起会话请求：${util.truncateText(text, 30)}`
        : `${userInfo.nickname || '有人'}：${util.truncateText(text, 30)}`,
      jumpType: 'chat',
      jumpId: userId,
      extraData: { peerUserId: userId, peerUserName: userInfo.nickname || '' }
    });
    return { code: 200, data: message, message: '发送成功' };
  },

  deleteMessage: async (messageId, peerUserId) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!messageId) return { code: 400, data: null, message: '消息ID不能为空' };
    const userId = getCurrentUserId();
    const messages = wx.getStorageSync('messages') || {};
    const key = storageApi._convKey(userId, peerUserId || '');
    if (!messages[key]) return { code: 404, data: null, message: '消息不存在' };
    const before = messages[key].length;
    messages[key] = messages[key].filter(m => m.id !== messageId);
    if (messages[key].length === before) return { code: 404, data: null, message: '消息不存在' };
    wx.setStorageSync('messages', messages);
    return { code: 200, data: null, message: '已删除' };
  },

  getMessageUnreadCount: async () => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return { code: 200, data: { unreadCount: 0, count: 0 }, message: 'success' };
    const userId = getCurrentUserId();
    const conversations = wx.getStorageSync('conversations') || {};
    const list = conversations[userId] || [];
    const count = list.reduce((s, c) => s + (c.unreadCount || 0), 0);
    return { code: 200, data: { unreadCount: count, count }, message: 'success' };
  },

  _getBlockedUsers: (userId) => {
    const blocked = wx.getStorageSync('blockedUsers') || {};
    return blocked[userId] || [];
  },

  _saveBlockedUsers: (userId, list) => {
    const blocked = wx.getStorageSync('blockedUsers') || {};
    blocked[userId] = list;
    wx.setStorageSync('blockedUsers', blocked);
  },

  _isBlocked: (blockerUserId, targetUserId) => {
    return storageApi._getBlockedUsers(blockerUserId).some(b => b.userId === targetUserId);
  },

  _isBlockedBy: (targetUserId, blockerUserId) => {
    return storageApi._isBlocked(blockerUserId, targetUserId);
  },

  blockUser: async (targetUserId, reason) => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    if (!targetUserId) return { code: 400, data: null, message: '用户ID不能为空' };
    const userId = getCurrentUserId();
    if (targetUserId === userId) return { code: 400, data: null, message: '不能拉黑自己' };
    const list = storageApi._getBlockedUsers(userId);
    if (list.some(b => b.userId === targetUserId)) {
      return { code: 200, data: null, message: '已拉黑该用户' };
    }
    const userInfo = wx.getStorageSync('userInfo') || {};
    list.unshift({
      userId: targetUserId,
      userName: reason ? '' : '',
      reason: reason || '',
      operatorId: userId,
      operatorName: userInfo.nickname || '',
      createTime: new Date().toISOString()
    });
    storageApi._saveBlockedUsers(userId, list);
    const conversations = wx.getStorageSync('conversations') || {};
    if (conversations[userId]) {
      conversations[userId] = conversations[userId].filter(c => c.peerUserId !== targetUserId);
      wx.setStorageSync('conversations', conversations);
    }
    return { code: 200, data: null, message: '已拉黑该用户' };
  },

  unblockUser: async (targetUserId) => {
    await delay(200);
    const authError = requireLogin();
    if (authError) return authError;
    if (!targetUserId) return { code: 400, data: null, message: '用户ID不能为空' };
    const userId = getCurrentUserId();
    const list = storageApi._getBlockedUsers(userId);
    const next = list.filter(b => b.userId !== targetUserId);
    storageApi._saveBlockedUsers(userId, next);
    return { code: 200, data: null, message: '已解除拉黑' };
  },

  getBlockedList: async () => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    const list = storageApi._getBlockedUsers(userId);
    return {
      code: 200,
      data: { blockedUsers: list, total: list.length },
      message: 'success'
    };
  },

  checkBlocked: async (targetUserId) => {
    await delay(100);
    const authError = requireLogin();
    if (authError) return authError;
    if (!targetUserId) return { code: 400, data: null, message: '用户ID不能为空' };
    const userId = getCurrentUserId();
    const iBlocked = storageApi._isBlocked(userId, targetUserId);
    const blockedBy = storageApi._isBlockedBy(userId, targetUserId);
    return {
      code: 200,
      data: { iBlocked, blockedBy, isBlockedEither: iBlocked || blockedBy },
      message: 'success'
    };
  },

  reportUser: async (data) => {
    await delay(400);
    const authError = requireLogin();
    if (authError) return authError;
    const { targetUserId, reasonType, description, messageId, conversationId } = data || {};
    if (!targetUserId) return { code: 400, data: null, message: '被举报用户ID不能为空' };
    if (!reasonType) return { code: 400, data: null, message: '请选择举报原因' };
    if (description && description.length > 500) return { code: 400, data: null, message: '详细描述不能超过500字' };
    const userId = getCurrentUserId();
    if (targetUserId === userId) return { code: 400, data: null, message: '不能举报自己' };
    const userInfo = wx.getStorageSync('userInfo') || {};
    const report = {
      id: util.generateId('rpt'),
      reporterId: userId,
      reporterName: userInfo.nickname || '',
      targetUserId,
      reasonType,
      description: (description || '').trim(),
      messageId: messageId || '',
      conversationId: conversationId || '',
      status: 'pending',
      createTime: new Date().toISOString()
    };
    const reports = wx.getStorageSync('reports') || [];
    reports.unshift(report);
    wx.setStorageSync('reports', reports);
    return { code: 200, data: report, message: '举报已提交，我们会尽快处理' };
  },

  getMyReports: async () => {
    await delay(300);
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    const reports = wx.getStorageSync('reports') || [];
    const mine = reports.filter(r => r.reporterId === userId);
    return {
      code: 200,
      data: { list: mine, total: mine.length },
      message: 'success'
    };
  },

  getReportReasons: async () => {
    await delay(100);
    return {
      code: 200,
      data: [
        { id: 'harassment', name: '骚扰/不当言论', icon: '🚫' },
        { id: 'fraud', name: '欺诈/诈骗', icon: '⚠️' },
        { id: 'porn', name: '色情低俗内容', icon: '🔞' },
        { id: 'violence', name: '暴力/恐怖内容', icon: '💢' },
        { id: 'sensitive', name: '敏感政治言论', icon: '🚨' },
        { id: 'other', name: '其他违规', icon: '📋' }
      ],
      message: 'success'
    };
  }
};

const remoteApi = {
  wechatLogin: async (data = {}) => {
    return request({
      url: '/api/auth/wechat-login',
      method: 'POST',
      data
    });
  },

  nicknameLogin: async (data = {}) => {
    return request({
      url: '/api/auth/nickname-login',
      method: 'POST',
      data
    });
  },

  authLogout: async () => {
    return request({
      url: '/api/auth/logout',
      method: 'POST'
    });
  },

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

  updateArticle: async (id, data) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) return { code: 400, data: null, message: '文章ID不能为空' };
    return request({
      url: `/api/article/update/${id}`,
      method: 'POST',
      data
    });
  },

  deleteArticle: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) return { code: 400, data: null, message: '文章ID不能为空' };
    return request({
      url: `/api/article/delete/${id}`,
      method: 'POST'
    });
  },

  saveArticleDraft: async (data) => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/article/draft/save',
      method: 'POST',
      data: { ...data, authorId: userId }
    });
  },

  getArticleDraftList: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/article/drafts',
      method: 'GET',
      data: { authorId: userId }
    });
  },

  getArticleDraftDetail: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) return { code: 400, data: null, message: '草稿ID不能为空' };
    return request({
      url: `/api/article/draft/${id}`,
      method: 'GET'
    });
  },

  updateArticleDraft: async (id, data) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) return { code: 400, data: null, message: '草稿ID不能为空' };
    return request({
      url: `/api/article/draft/update/${id}`,
      method: 'POST',
      data
    });
  },

  publishArticleDraft: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) return { code: 400, data: null, message: '草稿ID不能为空' };
    return request({
      url: `/api/article/draft/publish/${id}`,
      method: 'POST'
    });
  },

  deleteArticleDraft: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) return { code: 400, data: null, message: '草稿ID不能为空' };
    return request({
      url: `/api/article/draft/delete/${id}`,
      method: 'POST'
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

  getAuthorProfile: async (authorId) => {
    if (!authorId) {
      return { code: 400, data: null, message: '作者ID不能为空' };
    }
    return request({
      url: '/api/author/profile',
      method: 'GET',
      data: { authorId }
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

  addHistory: async (articleId) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!articleId) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    return request({
      url: '/api/article/history/add',
      method: 'POST',
      data: { userId, articleId }
    });
  },

  getHistoryList: async (params = {}) => {
    const authError = requireLogin();
    if (authError) return authError;
    const { category = 'all', page = 1, pageSize = 10, keyword = '' } = params;
    const userId = getCurrentUserId();
    return request({
      url: '/api/article/history',
      method: 'GET',
      data: { userId, category, page, pageSize, keyword }
    });
  },

  deleteHistory: async (articleId) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!articleId) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    const userId = getCurrentUserId();
    return request({
      url: `/api/article/history/${articleId}`,
      method: 'DELETE',
      data: { userId }
    });
  },

  clearHistory: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/article/history/clear',
      method: 'POST',
      data: { userId }
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
  },

  getQuizCategories: async () => {
    return request({ url: '/api/quiz/categories', method: 'GET' });
  },

  getQuizDifficulties: async () => {
    return request({ url: '/api/quiz/difficulties', method: 'GET' });
  },

  getQuizList: async (params = {}) => {
    return request({ url: '/api/quiz/list', method: 'GET', data: params });
  },

  getQuizDetail: async (id) => {
    if (!id) return { code: 400, data: null, message: '题目ID不能为空' };
    return request({ url: `/api/quiz/detail/${id}`, method: 'GET' });
  },

  getDailyQuiz: async () => {
    return request({ url: '/api/quiz/daily', method: 'GET' });
  },

  submitDailyQuiz: async (answer) => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({ url: '/api/quiz/daily/submit', method: 'POST', data: { answer } });
  },

  getChallengeQuiz: async (categoryId) => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({ url: '/api/quiz/challenge', method: 'GET', data: { category: categoryId || 'all' } });
  },

  submitChallengeQuiz: async (sessionId, answers) => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({ url: '/api/quiz/challenge/submit', method: 'POST', data: { sessionId, answers } });
  },

  getTimedQuiz: async (duration) => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({ url: '/api/quiz/timed', method: 'GET', data: { duration } });
  },

  submitTimedQuiz: async (sessionId, answers) => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({ url: '/api/quiz/timed/submit', method: 'POST', data: { sessionId, answers } });
  },

  getQuizStats: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({ url: '/api/quiz/stats', method: 'GET' });
  },

  getQuizRankings: async (type) => {
    return request({ url: '/api/quiz/rankings', method: 'GET', data: { type: type || 'weekly' } });
  },

  getWrongQuizList: async (params = {}) => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({ url: '/api/quiz/wrong/list', method: 'GET', data: params });
  },

  markWrongQuizReviewed: async (quizId) => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({ url: '/api/quiz/wrong/reviewed', method: 'POST', data: { quizId } });
  },

  removeWrongQuiz: async (quizId) => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({ url: '/api/quiz/wrong/remove', method: 'POST', data: { quizId } });
  },

  getWrongQuizForReview: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({ url: '/api/quiz/wrong/review', method: 'GET' });
  },

  getInterviewFilterOptions: async () => {
    return request({ url: '/api/interview/filters', method: 'GET' });
  },

  getInterviewList: async (params = {}) => {
    const { region = 'all', ageGroup = 'all', craft = 'all', page = 1, pageSize = 10, keyword = '', collectionId = '' } = params;
    return request({
      url: '/api/interview/list',
      method: 'GET',
      data: { region, ageGroup, craft, page, pageSize, keyword, collectionId }
    });
  },

  getInterviewDetail: async (id) => {
    if (!id) return { code: 400, data: null, message: '访谈ID不能为空' };
    return request({ url: `/api/interview/detail/${id}`, method: 'GET' });
  },

  createInterview: async (data) => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/interview/create',
      method: 'POST',
      data: { ...data, authorId: userId }
    });
  },

  createInterviewDraft: async (data) => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/interview/draft',
      method: 'POST',
      data: { ...data, submitterId: userId }
    });
  },

  getMyInterviews: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/interview/my',
      method: 'GET',
      data: { authorId: userId }
    });
  },

  getMyInterviewDrafts: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/interview/drafts',
      method: 'GET',
      data: { submitterId: userId }
    });
  },

  likeInterview: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) return { code: 400, data: null, message: '访谈ID不能为空' };
    const userId = getCurrentUserId();
    return request({
      url: `/api/interview/like/${id}`,
      method: 'POST',
      data: { userId }
    });
  },

  unlikeInterview: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) return { code: 400, data: null, message: '访谈ID不能为空' };
    const userId = getCurrentUserId();
    return request({
      url: `/api/interview/unlike/${id}`,
      method: 'POST',
      data: { userId }
    });
  },

  checkInterviewLike: async (id) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!id) return { code: 400, data: null, message: '访谈ID不能为空' };
    const userId = getCurrentUserId();
    return request({
      url: `/api/interview/like/${id}`,
      method: 'GET',
      data: { userId }
    });
  },

  getInterviewCollectionList: async (params = {}) => {
    const { page = 1, pageSize = 10, keyword = '' } = params;
    return request({
      url: '/api/interview/collection/list',
      method: 'GET',
      data: { page, pageSize, keyword }
    });
  },

  getInterviewCollectionDetail: async (id) => {
    if (!id) return { code: 400, data: null, message: '合集ID不能为空' };
    return request({ url: `/api/interview/collection/detail/${id}`, method: 'GET' });
  },

  getCalendarEvents: async (params = {}) => {
    const { year, month } = params;
    return request({ url: '/api/calendar/events', method: 'GET', data: { year, month } });
  },

  getCalendarDateDetail: async (params = {}) => {
    const { year, month, day } = params;
    return request({ url: '/api/calendar/date-detail', method: 'GET', data: { year, month, day } });
  },

  subscribeCalendarEvent: async (eventId) => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({ url: '/api/calendar/subscribe', method: 'POST', data: { eventId } });
  },

  unsubscribeCalendarEvent: async (eventId) => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({ url: '/api/calendar/unsubscribe', method: 'POST', data: { eventId } });
  },

  checkCalendarSubscription: async (eventId) => {
    return request({ url: '/api/calendar/subscription-check', method: 'GET', data: { eventId } });
  },

  getMyCalendarSubscriptions: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({ url: '/api/calendar/my-subscriptions', method: 'GET' });
  },

  createComment: async (data) => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/comment/create',
      method: 'POST',
      data: { ...data, userId }
    });
  },

  getCommentList: async (params = {}) => {
    const { articleId, page = 1, pageSize = 10 } = params;
    return request({
      url: '/api/comment/list',
      method: 'GET',
      data: { articleId, page, pageSize }
    });
  },

  likeComment: async (commentId) => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: `/api/comment/like/${commentId}`,
      method: 'POST',
      data: { userId }
    });
  },

  unlikeComment: async (commentId) => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: `/api/comment/unlike/${commentId}`,
      method: 'POST',
      data: { userId }
    });
  },

  deleteComment: async (commentId) => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: `/api/comment/delete/${commentId}`,
      method: 'POST',
      data: { userId }
    });
  },

  getCommentCount: async (articleId) => {
    return request({
      url: `/api/comment/count/${articleId}`,
      method: 'GET'
    });
  },

  submitReport: async (data) => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/report/submit',
      method: 'POST',
      data: { ...data, userId }
    });
  },

  submitFeedback: async (data) => {
    const authError = requireLogin();
    if (authError) return authError;
    const userId = getCurrentUserId();
    return request({
      url: '/api/feedback/submit',
      method: 'POST',
      data: { ...data, userId }
    });
  },

  initCertificates: async () => {
    return request({
      url: '/api/certificates/init',
      method: 'GET'
    });
  },

  getMyCertificates: async (params = {}) => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/certificates/my',
      method: 'GET',
      data: params
    });
  },

  getCertificateDetail: async (certificateId) => {
    if (!certificateId) {
      return { code: 400, data: null, message: '证书ID不能为空' };
    }
    return request({
      url: `/api/certificates/${certificateId}`,
      method: 'GET'
    });
  },

  verifyCertificate: async (params = {}) => {
    return request({
      url: '/api/certificates/verify',
      method: 'POST',
      data: params
    });
  },

  getCertificateTypes: async () => {
    return request({
      url: '/api/certificates/types',
      method: 'GET'
    });
  },

  getIssuingUnits: async () => {
    return request({
      url: '/api/certificates/issuing-units',
      method: 'GET'
    });
  },

  issueCertificate: async (data = {}) => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/certificates/issue',
      method: 'POST',
      data
    });
  },

  batchIssueCertificates: async (data = {}) => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/certificates/batch-issue',
      method: 'POST',
      data
    });
  },

  revokeCertificate: async (certificateId) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!certificateId) {
      return { code: 400, data: null, message: '证书ID不能为空' };
    }
    return request({
      url: `/api/certificates/${certificateId}/revoke`,
      method: 'POST'
    });
  },

  getAllCertificates: async (params = {}) => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/certificates/all',
      method: 'GET',
      data: params
    });
  },

  issueCertificatesForActivity: async (activityId) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!activityId) {
      return { code: 400, data: null, message: '活动ID不能为空' };
    }
    return request({
      url: '/api/certificates/issue-for-activity',
      method: 'POST',
      data: { activityId }
    });
  },

  issueCertificateForArticle: async (articleId) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!articleId) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }
    return request({
      url: '/api/certificates/issue-for-article',
      method: 'POST',
      data: { articleId }
    });
  },

  shareCertificate: async (certificateId) => {
    if (!certificateId) {
      return { code: 400, data: null, message: '证书ID不能为空' };
    }
    return request({
      url: `/api/certificates/${certificateId}/share`,
      method: 'POST'
    });
  },

  getCertificateStats: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/certificates/stats',
      method: 'GET'
    });
  },

  getAllUsers: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/users/all',
      method: 'GET'
    });
  },

  getAllArticles: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/articles/all',
      method: 'GET'
    });
  },

  getOnboardingStatus: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/task/onboarding/status',
      method: 'GET'
    });
  },

  getOnboardingProgress: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/task/onboarding/progress',
      method: 'GET'
    });
  },

  completeOnboardingStep: async (stepId) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!stepId) return { code: 400, data: null, message: '步骤ID不能为空' };
    return request({
      url: '/api/task/onboarding/complete',
      method: 'POST',
      data: { stepId }
    });
  },

  skipOnboarding: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/task/onboarding/skip',
      method: 'POST'
    });
  },

  getSevenDayProgress: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/task/seven-day/progress',
      method: 'GET'
    });
  },

  claimSevenDayReward: async (day) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!day) return { code: 400, data: null, message: '天数不能为空' };
    return request({
      url: '/api/task/seven-day/claim',
      method: 'POST',
      data: { day }
    });
  },

  getActiveFestivalTaskLine: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/task/festival/active',
      method: 'GET'
    });
  },

  getFestivalProgress: async (festivalId) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!festivalId) return { code: 400, data: null, message: '节日ID不能为空' };
    return request({
      url: `/api/task/festival/${festivalId}/progress`,
      method: 'GET'
    });
  },

  claimFestivalReward: async (festivalId) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!festivalId) return { code: 400, data: null, message: '节日ID不能为空' };
    return request({
      url: `/api/task/festival/${festivalId}/claim`,
      method: 'POST'
    });
  },

  getUserPoints: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/task/points',
      method: 'GET'
    });
  },

  getUserBadges: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/task/badges',
      method: 'GET'
    });
  },

  getAllBadges: async () => {
    return request({
      url: '/api/task/badges/all',
      method: 'GET'
    });
  },

  getBadgeById: async (badgeId) => {
    if (!badgeId) return { code: 400, data: null, message: '勋章ID不能为空' };
    return request({
      url: `/api/task/badges/${badgeId}`,
      method: 'GET'
    });
  },

  recordTaskAction: async (actionType, data = {}) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!actionType) return { code: 400, data: null, message: '动作类型不能为空' };
    return request({
      url: '/api/task/action',
      method: 'POST',
      data: { actionType, ...data }
    });
  },

  getUserLevel: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/task/level',
      method: 'GET'
    });
  },

  getLevelInfo: async (levelId) => {
    if (!levelId) return { code: 400, data: null, message: '等级ID不能为空' };
    return request({
      url: `/api/task/levels/${levelId}`,
      method: 'GET'
    });
  },

  getAllLevels: async () => {
    return request({
      url: '/api/task/levels',
      method: 'GET'
    });
  },

  getLevelProgress: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/task/level/progress',
      method: 'GET'
    });
  },

  doDailyCheckin: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/task/checkin',
      method: 'POST'
    });
  },

  hasCheckedInToday: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/task/checkin/today',
      method: 'GET'
    });
  },

  getConsecutiveCheckinDays: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/task/checkin/consecutive',
      method: 'GET'
    });
  },

  getTaskCenterData: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/task/center',
      method: 'GET'
    });
  },

  resetTaskData: async () => {
    const authError = requireLogin();
    if (authError) return authError;
    return request({
      url: '/api/task/reset',
      method: 'POST'
    });
  },

  getAchievementCard: async (badgeId) => {
    const authError = requireLogin();
    if (authError) return authError;
    if (!badgeId) return { code: 400, data: null, message: '勋章ID不能为空' };
    return request({
      url: `/api/task/achievement-card/${badgeId}`,
      method: 'GET'
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
