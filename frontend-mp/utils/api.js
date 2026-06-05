// utils/api.js
// API 接口封装 - 使用本地存储模拟后端服务
// 所有接口返回统一格式: { code: number, data: any, message: string }

const util = require('./util');

/**
 * 模拟网络延迟
 * @param {number} ms - 延迟毫秒数，默认300ms
 * @returns {Promise<void>}
 */
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 统一错误处理包装器
 * @param {Function} fn - 要执行的异步函数
 * @param {string} errorMsg - 错误提示信息
 * @returns {Promise<Object>} - 统一格式的响应
 */
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

/**
 * 获取文章列表
 * @param {Object} params - 查询参数
 * @param {string} params.category - 分类ID，'all'表示全部
 * @param {number} params.page - 页码，从1开始
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.keyword - 搜索关键词
 * @returns {Promise<Object>} - 文章列表数据
 */
const getArticleList = async (params = {}) => {
  return withErrorHandler(async () => {
    await delay(500);

    const { category = 'all', page = 1, pageSize = 10, keyword = '' } = params;

    let articles = wx.getStorageSync('articles') || [];

    // 只显示已发布的文章（status === 1）
    articles = articles.filter(item => item.status === 1);

    // 分类筛选
    if (category && category !== 'all') {
      articles = articles.filter(item => item.category === category);
    }

    // 关键词搜索（标题和内容）
    if (keyword && keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      articles = articles.filter(item =>
        item.title.toLowerCase().includes(kw) ||
        item.content.toLowerCase().includes(kw)
      );
    }

    // 按发布时间倒序排列
    articles.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    // 分页处理
    const total = articles.length;
    const start = (page - 1) * pageSize;
    const list = articles.slice(start, start + pageSize);

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
  }, '获取文章列表失败');
};

/**
 * 获取文章详情
 * @param {string} id - 文章ID
 * @returns {Promise<Object>} - 文章详情数据
 */
const getArticleDetail = async (id) => {
  return withErrorHandler(async () => {
    await delay(300);

    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }

    const articles = wx.getStorageSync('articles') || [];
    const article = articles.find(item => item.id === id);

    if (!article) {
      return { code: 404, data: null, message: '文章不存在' };
    }

    // 增加浏览量
    article.viewCount = (article.viewCount || 0) + 1;
    wx.setStorageSync('articles', articles);

    return {
      code: 200,
      data: article,
      message: 'success'
    };
  }, '获取文章详情失败');
};

/**
 * 发布文章
 * @param {Object} data - 文章数据
 * @param {string} data.title - 文章标题
 * @param {string} data.content - 文章内容
 * @param {string} data.category - 分类ID
 * @returns {Promise<Object>} - 发布结果
 */
const publishArticle = async (data) => {
  return withErrorHandler(async () => {
    await delay(800);

    // 参数校验
    if (!data.title || !data.title.trim()) {
      return { code: 400, data: null, message: '标题不能为空' };
    }
    if (!data.content || !data.content.trim()) {
      return { code: 400, data: null, message: '内容不能为空' };
    }
    if (!data.category) {
      return { code: 400, data: null, message: '请选择分类' };
    }

    // 获取用户信息
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      // 如果没有用户信息，使用默认用户
      userInfo = {
        id: 'user_001',
        nickname: '乡村文化爱好者'
      };
    }

    const articles = wx.getStorageSync('articles') || [];

    // 创建新文章
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
      status: 1  // 1: 已发布
    };

    // 添加到列表头部
    articles.unshift(newArticle);
    wx.setStorageSync('articles', articles);

    return {
      code: 200,
      data: newArticle,
      message: '发布成功'
    };
  }, '发布文章失败');
};

/**
 * 获取当前用户的文章列表
 * @returns {Promise<Object>} - 我的文章列表
 */
const getMyArticles = async () => {
  return withErrorHandler(async () => {
    await delay(400);

    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      userInfo = { id: 'user_001' };
    }

    let articles = wx.getStorageSync('articles') || [];

    // 筛选当前用户的文章
    articles = articles.filter(item => item.authorId === userInfo.id);

    // 按时间倒序排列
    articles.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    return {
      code: 200,
      data: {
        list: articles,
        total: articles.length
      },
      message: 'success'
    };
  }, '获取我的文章失败');
};

/**
 * 获取分类列表
 * @returns {Promise<Object>} - 分类列表数据
 */
const getCategoryList = async () => {
  return withErrorHandler(async () => {
    await delay(200);

    const categories = wx.getStorageSync('categories') || [];

    return {
      code: 200,
      data: categories,
      message: 'success'
    };
  }, '获取分类列表失败');
};

/**
 * 获取用户信息
 * @returns {Promise<Object>} - 用户信息数据
 */
const getUserInfo = async () => {
  return withErrorHandler(async () => {
    await delay(200);

    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      userInfo = {
        id: 'user_001',
        nickname: '乡村文化爱好者',
        avatar: '',
        phone: '138****8888',
        createTime: '2024-01-01'
      };
    }

    return {
      code: 200,
      data: userInfo,
      message: 'success'
    };
  }, '获取用户信息失败');
};

/**
 * 更新用户信息
 * @param {Object} data - 要更新的用户数据
 * @param {string} data.nickname - 昵称
 * @returns {Promise<Object>} - 更新结果
 */
const updateUserInfo = async (data) => {
  return withErrorHandler(async () => {
    await delay(500);

    if (data.nickname && (data.nickname.length < 2 || data.nickname.length > 20)) {
      return { code: 400, data: null, message: '昵称需要2-20个字符' };
    }

    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      userInfo = {
        id: 'user_001',
        nickname: '乡村文化爱好者',
        avatar: '',
        phone: '138****8888',
        createTime: '2024-01-01'
      };
    }

    const updatedInfo = {
      ...userInfo,
      ...data
    };

    wx.setStorageSync('userInfo', updatedInfo);

    return {
      code: 200,
      data: updatedInfo,
      message: '更新成功'
    };
  }, '更新用户信息失败');
};

/**
 * 获取用户统计数据
 * @returns {Promise<Object>} - 统计数据（投稿数、获赞数、阅读数）
 */
const getUserStats = async () => {
  return withErrorHandler(async () => {
    await delay(300);

    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      userInfo = { id: 'user_001' };
    }

    const articles = wx.getStorageSync('articles') || [];
    const myArticles = articles.filter(item => item.authorId === userInfo.id);

    // 计算总点赞数和总阅读数
    const totalLikes = myArticles.reduce((sum, item) => sum + (item.likeCount || 0), 0);
    const totalViews = myArticles.reduce((sum, item) => sum + (item.viewCount || 0), 0);

    return {
      code: 200,
      data: {
        articleCount: myArticles.length,
        likeCount: totalLikes,
        viewCount: totalViews
      },
      message: 'success'
    };
  }, '获取用户统计失败');
};

/**
 * 点赞文章
 * @param {string} id - 文章ID
 * @returns {Promise<Object>} - 点赞结果
 */
const likeArticle = async (id) => {
  return withErrorHandler(async () => {
    await delay(200);

    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }

    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      userInfo = { id: 'user_001' };
    }

    const articles = wx.getStorageSync('articles') || [];
    const article = articles.find(item => item.id === id);

    if (!article) {
      return { code: 404, data: null, message: '文章不存在' };
    }

    const likes = wx.getStorageSync('likes') || {};
    const userLikes = likes[userInfo.id] || [];

    if (userLikes.includes(id)) {
      return { code: 200, data: { isLike: true, likeCount: article.likeCount }, message: '已点赞' };
    }

    // 增加点赞数
    article.likeCount = (article.likeCount || 0) + 1;
    wx.setStorageSync('articles', articles);

    userLikes.push(id);
    likes[userInfo.id] = userLikes;
    wx.setStorageSync('likes', likes);

    return {
      code: 200,
      data: { isLike: true, likeCount: article.likeCount },
      message: '点赞成功'
    };
  }, '点赞失败');
};

/**
 * 取消点赞文章
 * @param {string} id - 文章ID
 * @returns {Promise<Object>} - 取消点赞结果
 */
const unlikeArticle = async (id) => {
  return withErrorHandler(async () => {
    await delay(200);

    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }

    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      userInfo = { id: 'user_001' };
    }

    const articles = wx.getStorageSync('articles') || [];
    const article = articles.find(item => item.id === id);

    if (!article) {
      return { code: 404, data: null, message: '文章不存在' };
    }

    // 减少点赞数，最小为0
    article.likeCount = Math.max((article.likeCount || 0) - 1, 0);
    wx.setStorageSync('articles', articles);

    const likes = wx.getStorageSync('likes') || {};
    const userLikes = likes[userInfo.id] || [];

    const index = userLikes.indexOf(id);
    if (index > -1) {
      userLikes.splice(index, 1);
      likes[userInfo.id] = userLikes;
      wx.setStorageSync('likes', likes);
    }

    return {
      code: 200,
      data: { isLike: false, likeCount: article.likeCount },
      message: '已取消点赞'
    };
  }, '取消点赞失败');
};

/**
 * 检查文章是否已点赞
 * @param {string} id - 文章ID
 * @returns {Promise<Object>} - 点赞状态
 */
const checkLike = async (id) => {
  return withErrorHandler(async () => {
    await delay(100);

    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }

    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      userInfo = { id: 'user_001' };
    }

    const likes = wx.getStorageSync('likes') || {};
    const userLikes = likes[userInfo.id] || [];
    const isLike = userLikes.includes(id);

    return {
      code: 200,
      data: { isLike },
      message: 'success'
    };
  }, '检查点赞状态失败');
};

/**
 * 收藏文章
 * @param {string} id - 文章ID
 * @returns {Promise<Object>} - 收藏结果
 */
const favoriteArticle = async (id) => {
  return withErrorHandler(async () => {
    await delay(200);

    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }

    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      userInfo = { id: 'user_001' };
    }

    const favorites = wx.getStorageSync('favorites') || {};
    const userFavorites = favorites[userInfo.id] || [];

    if (userFavorites.includes(id)) {
      return { code: 200, data: { isFavorite: true }, message: '已收藏' };
    }

    userFavorites.push(id);
    favorites[userInfo.id] = userFavorites;
    wx.setStorageSync('favorites', favorites);

    return {
      code: 200,
      data: { isFavorite: true },
      message: '收藏成功'
    };
  }, '收藏失败');
};

/**
 * 取消收藏文章
 * @param {string} id - 文章ID
 * @returns {Promise<Object>} - 取消收藏结果
 */
const unfavoriteArticle = async (id) => {
  return withErrorHandler(async () => {
    await delay(200);

    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }

    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      userInfo = { id: 'user_001' };
    }

    const favorites = wx.getStorageSync('favorites') || {};
    const userFavorites = favorites[userInfo.id] || [];

    const index = userFavorites.indexOf(id);
    if (index > -1) {
      userFavorites.splice(index, 1);
      favorites[userInfo.id] = userFavorites;
      wx.setStorageSync('favorites', favorites);
    }

    return {
      code: 200,
      data: { isFavorite: false },
      message: '已取消收藏'
    };
  }, '取消收藏失败');
};

/**
 * 检查文章是否已收藏
 * @param {string} id - 文章ID
 * @returns {Promise<Object>} - 收藏状态
 */
const checkFavorite = async (id) => {
  return withErrorHandler(async () => {
    await delay(100);

    if (!id) {
      return { code: 400, data: null, message: '文章ID不能为空' };
    }

    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      userInfo = { id: 'user_001' };
    }

    const favorites = wx.getStorageSync('favorites') || {};
    const userFavorites = favorites[userInfo.id] || [];
    const isFavorite = userFavorites.includes(id);

    return {
      code: 200,
      data: { isFavorite },
      message: 'success'
    };
  }, '检查收藏状态失败');
};

/**
 * 获取收藏文章列表
 * @param {Object} params - 查询参数
 * @param {string} params.category - 分类ID，'all'表示全部
 * @param {number} params.page - 页码，从1开始
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.keyword - 搜索关键词
 * @returns {Promise<Object>} - 收藏文章列表数据
 */
const getFavoriteList = async (params = {}) => {
  return withErrorHandler(async () => {
    await delay(500);

    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (!isLoggedIn) {
      return {
        code: 401,
        data: null,
        message: '请先登录'
      };
    }

    const { category = 'all', page = 1, pageSize = 10, keyword = '' } = params;

    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      return {
        code: 401,
        data: null,
        message: '请先登录'
      };
    }

    const favorites = wx.getStorageSync('favorites') || {};
    const userFavorites = favorites[userInfo.id] || [];

    if (userFavorites.length === 0) {
      return {
        code: 200,
        data: {
          list: [],
          total: 0,
          page,
          pageSize,
          hasMore: false
        },
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
      data: {
        list,
        total,
        page,
        pageSize,
        hasMore: start + pageSize < total
      },
      message: 'success'
    };
  }, '获取收藏列表失败');
};

module.exports = {
  getArticleList,
  getArticleDetail,
  publishArticle,
  getMyArticles,
  getCategoryList,
  getUserInfo,
  updateUserInfo,
  getUserStats,
  likeArticle,
  unlikeArticle,
  checkLike,
  favoriteArticle,
  unfavoriteArticle,
  checkFavorite,
  getFavoriteList
};
