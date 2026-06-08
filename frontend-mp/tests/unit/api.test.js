const api = require('../../utils/api');
const { initStorage, defaultUser } = require('../helpers');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('api.getArticleList', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回已发布文章列表', async () => {
    const res = await api.getArticleList();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.list.every(item => item.status === 1)).toBe(true);
  });

  test('按分类筛选文章', async () => {
    const res = await api.getArticleList({ category: 'farming' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(item => item.category === 'farming')).toBe(true);
  });

  test('category=all 返回所有文章', async () => {
    const res = await api.getArticleList({ category: 'all' });
    expect(res.code).toBe(200);
    const articles = wx.getStorageSync('articles').filter(a => a.status === 1);
    expect(res.data.total).toBe(articles.length);
  });

  test('按关键词搜索（标题匹配）', async () => {
    const res = await api.getArticleList({ keyword: '农耕' });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    res.data.list.forEach(item => {
      const match = item.title.includes('农耕') || item.content.includes('农耕');
      expect(match).toBe(true);
    });
  });

  test('按关键词搜索（内容匹配）', async () => {
    const res = await api.getArticleList({ keyword: '织布' });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
  });

  test('搜索无结果时返回空列表', async () => {
    const res = await api.getArticleList({ keyword: '不存在的关键词xyz' });
    expect(res.code).toBe(200);
    expect(res.data.list).toEqual([]);
    expect(res.data.total).toBe(0);
  });

  test('分页功能正常工作', async () => {
    const res1 = await api.getArticleList({ page: 1, pageSize: 2 });
    expect(res1.code).toBe(200);
    expect(res1.data.list.length).toBe(2);
    expect(res1.data.page).toBe(1);
    expect(res1.data.hasMore).toBe(true);

    const res2 = await api.getArticleList({ page: 2, pageSize: 2 });
    expect(res2.code).toBe(200);
    expect(res2.data.list.length).toBeGreaterThan(0);
    expect(res2.data.page).toBe(2);
  });

  test('文章按发布时间倒序排列', async () => {
    const res = await api.getArticleList();
    const list = res.data.list;
    for (let i = 0; i < list.length - 1; i++) {
      expect(new Date(list[i].createTime) >= new Date(list[i + 1].createTime)).toBe(true);
    }
  });

  test('不显示未发布文章（status !== 1）', async () => {
    const articles = wx.getStorageSync('articles');
    articles.push({ id: 'article_draft', title: '草稿', content: '草稿内容', category: 'farming', authorId: 'user_001', authorName: '张三', viewCount: 0, likeCount: 0, createTime: '2024-12-20', status: 0 });
    wx.setStorageSync('articles', articles);

    const res = await api.getArticleList();
    expect(res.data.list.find(item => item.id === 'article_draft')).toBeUndefined();
  });

  test('响应格式包含 list/total/page/pageSize/hasMore', async () => {
    const res = await api.getArticleList({ page: 1, pageSize: 10 });
    expect(res).toHaveProperty('code');
    expect(res).toHaveProperty('data.list');
    expect(res).toHaveProperty('data.total');
    expect(res).toHaveProperty('data.page');
    expect(res).toHaveProperty('data.pageSize');
    expect(res).toHaveProperty('data.hasMore');
    expect(res).toHaveProperty('message');
  });
});

describe('api.getArticleDetail', () => {
  beforeEach(() => {
    initStorage();
  });

  test('根据 ID 获取文章详情', async () => {
    const res = await api.getArticleDetail('article_001');
    expect(res.code).toBe(200);
    expect(res.data.id).toBe('article_001');
    expect(res.data.title).toBe('记忆中的农耕岁月');
  });

  test('每次获取详情阅读量自动递增', async () => {
    const before = wx.getStorageSync('articles').find(a => a.id === 'article_001');
    const viewCountBefore = before.viewCount;

    await api.getArticleDetail('article_001');

    const after = wx.getStorageSync('articles').find(a => a.id === 'article_001');
    expect(after.viewCount).toBe(viewCountBefore + 1);
  });

  test('文章 ID 为空返回 400 错误', async () => {
    const res = await api.getArticleDetail('');
    expect(res.code).toBe(400);
    expect(res.data).toBeNull();
  });

  test('文章 ID 为 null 返回 400 错误', async () => {
    const res = await api.getArticleDetail(null);
    expect(res.code).toBe(400);
  });

  test('不存在的文章 ID 返回 404', async () => {
    const res = await api.getArticleDetail('article_notexist');
    expect(res.code).toBe(404);
    expect(res.data).toBeNull();
  });
});

describe('api.publishArticle', () => {
  beforeEach(() => {
    initStorage();
  });

  test('成功发布文章', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.publishArticle({
      title: '测试投稿标题',
      content: '这是一篇测试投稿的内容，长度超过十个字符',
      category: 'folklore'
    });
    expect(res.code).toBe(200);
    expect(res.data.title).toBe('测试投稿标题');
    expect(res.data.category).toBe('folklore');
    expect(res.data.status).toBe(1);
    expect(res.data.likeCount).toBe(0);
    expect(res.data.viewCount).toBe(0);
  });

  test('新文章被添加到列表头部', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    const before = wx.getStorageSync('articles');
    const beforeLen = before.length;

    await api.publishArticle({
      title: '新投稿',
      content: '新投稿的内容，长度超过十个字符',
      category: 'memory'
    });

    const after = wx.getStorageSync('articles');
    expect(after.length).toBe(beforeLen + 1);
    expect(after[0].title).toBe('新投稿');
  });

  test('未登录时发布文章返回 401', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.publishArticle({
      title: '无用户投稿',
      content: '无用户投稿内容，长度超过十个字符',
      category: 'farming'
    });
    expect(res.code).toBe(401);
    expect(res.message).toBe('请先登录');
  });

  test('标题为空返回 400', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.publishArticle({ title: '', content: '内容内容内容', category: 'folklore' });
    expect(res.code).toBe(400);
  });

  test('标题为空白字符串返回 400', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.publishArticle({ title: '   ', content: '内容内容内容', category: 'folklore' });
    expect(res.code).toBe(400);
  });

  test('内容为空返回 400', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.publishArticle({ title: '标题', content: '', category: 'folklore' });
    expect(res.code).toBe(400);
  });

  test('分类为空返回 400', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.publishArticle({ title: '标题', content: '内容内容内容', category: '' });
    expect(res.code).toBe(400);
  });

  test('标题和内容自动 trim', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.publishArticle({
      title: '  带空格标题  ',
      content: '  带空格内容，长度超过十个字符  ',
      category: 'craft'
    });
    expect(res.code).toBe(200);
    expect(res.data.title).toBe('带空格标题');
    expect(res.data.content).toBe('带空格内容，长度超过十个字符');
  });
});

describe('api.getMyArticles', () => {
  beforeEach(() => {
    initStorage();
  });

  test('获取当前用户的文章列表', async () => {
    wx.setStorageSync('userInfo', { id: 'user_001', nickname: '张大爷' });
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.getMyArticles();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    res.data.list.forEach(item => {
      expect(item.authorId).toBe('user_001');
    });
  });

  test('用户没有文章时返回空列表', async () => {
    wx.setStorageSync('userInfo', { id: 'user_new', nickname: '新用户' });
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.getMyArticles();
    expect(res.code).toBe(200);
    expect(res.data.list).toEqual([]);
    expect(res.data.total).toBe(0);
  });

  test('未登录时获取我的文章返回 401', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.getMyArticles();
    expect(res.code).toBe(401);
    expect(res.message).toBe('请先登录');
  });
});

describe('api.getCategoryList', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回分类列表', async () => {
    const res = await api.getCategoryList();
    expect(res.code).toBe(200);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0]).toHaveProperty('id');
    expect(res.data[0]).toHaveProperty('name');
  });

  test('分类包含"全部"选项', async () => {
    const res = await api.getCategoryList();
    const allCat = res.data.find(c => c.id === 'all');
    expect(allCat).toBeDefined();
    expect(allCat.name).toBe('全部');
  });
});

describe('api.getUserInfo', () => {
  beforeEach(() => {
    initStorage();
  });

  test('已存储用户信息时返回该信息', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.getUserInfo();
    expect(res.code).toBe(200);
    expect(res.data.id).toBe('user_001');
    expect(res.data.nickname).toBe('测试用户');
  });

  test('未登录时获取用户信息返回 401', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.getUserInfo();
    expect(res.code).toBe(401);
    expect(res.message).toBe('请先登录');
  });
});

describe('api.updateUserInfo', () => {
  beforeEach(() => {
    initStorage();
  });

  test('更新用户昵称', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.updateUserInfo({ nickname: '新昵称' });
    expect(res.code).toBe(200);
    expect(res.data.nickname).toBe('新昵称');
    const stored = wx.getStorageSync('userInfo');
    expect(stored.nickname).toBe('新昵称');
  });

  test('昵称少于2个字符返回 400', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.updateUserInfo({ nickname: '一' });
    expect(res.code).toBe(400);
  });

  test('昵称超过20个字符返回 400', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.updateUserInfo({ nickname: 'a'.repeat(21) });
    expect(res.code).toBe(400);
  });

  test('昵称在2~20个字符之间更新成功', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.updateUserInfo({ nickname: '合法昵称' });
    expect(res.code).toBe(200);
  });

  test('未登录时更新用户信息返回 401', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.updateUserInfo({ nickname: '测试' });
    expect(res.code).toBe(401);
    expect(res.message).toBe('请先登录');
  });

  test('修改昵称后历史文章作者名同步更新', async () => {
    wx.setStorageSync('userInfo', { id: 'user_001', nickname: '张大爷' });
    wx.setStorageSync('isLoggedIn', true);
    const articlesBefore = wx.getStorageSync('articles');
    const userArticlesBefore = articlesBefore.filter(a => a.authorId === 'user_001');
    expect(userArticlesBefore.length).toBeGreaterThan(0);
    userArticlesBefore.forEach(a => {
      expect(a.authorName).toBe('张大爷');
    });

    const res = await api.updateUserInfo({ nickname: '张大爷新昵称' });
    expect(res.code).toBe(200);

    const articlesAfter = wx.getStorageSync('articles');
    const userArticlesAfter = articlesAfter.filter(a => a.authorId === 'user_001');
    userArticlesAfter.forEach(a => {
      expect(a.authorName).toBe('张大爷新昵称');
    });

    const otherArticles = articlesAfter.filter(a => a.authorId !== 'user_001');
    otherArticles.forEach(a => {
      expect(a.authorName).not.toBe('张大爷新昵称');
    });
  });
});

describe('api.getUserStats', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回用户统计数据', async () => {
    wx.setStorageSync('userInfo', { id: 'user_001', nickname: '张大爷' });
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.getUserStats();
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('articleCount');
    expect(res.data).toHaveProperty('likeCount');
    expect(res.data).toHaveProperty('viewCount');
  });

  test('统计数据计算正确', async () => {
    wx.setStorageSync('userInfo', { id: 'user_001', nickname: '张大爷' });
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.getUserStats();
    const articles = wx.getStorageSync('articles').filter(a => a.authorId === 'user_001');
    expect(res.data.articleCount).toBe(articles.length);
    const expectedLikes = articles.reduce((sum, a) => sum + (a.likeCount || 0), 0);
    const expectedViews = articles.reduce((sum, a) => sum + (a.viewCount || 0), 0);
    expect(res.data.likeCount).toBe(expectedLikes);
    expect(res.data.viewCount).toBe(expectedViews);
  });

  test('未登录时获取用户统计返回 401', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.getUserStats();
    expect(res.code).toBe(401);
    expect(res.message).toBe('请先登录');
  });
});

describe('api.likeArticle / unlikeArticle / checkLike', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('未登录时点赞返回 401', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.likeArticle('article_001');
    expect(res.code).toBe(401);
    expect(res.message).toBe('请先登录');
  });

  test('未登录时取消点赞返回 401', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.unlikeArticle('article_001');
    expect(res.code).toBe(401);
    expect(res.message).toBe('请先登录');
  });

  test('未登录时检查点赞状态返回 401', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.checkLike('article_001');
    expect(res.code).toBe(401);
    expect(res.message).toBe('请先登录');
  });

  test('点赞文章增加 likeCount', async () => {
    const before = wx.getStorageSync('articles').find(a => a.id === 'article_001');
    const likeBefore = before.likeCount;

    const res = await api.likeArticle('article_001');
    expect(res.code).toBe(200);
    expect(res.data.likeCount).toBe(likeBefore + 1);
    expect(res.data.isLike).toBe(true);

    const after = wx.getStorageSync('articles').find(a => a.id === 'article_001');
    expect(after.likeCount).toBe(likeBefore + 1);
  });

  test('点赞文章存储到 likes', async () => {
    const res = await api.likeArticle('article_001');
    expect(res.code).toBe(200);

    const likes = wx.getStorageSync('likes');
    expect(likes['user_001']).toContain('article_001');
  });

  test('重复点赞返回已点赞状态', async () => {
    await api.likeArticle('article_001');
    const before = wx.getStorageSync('articles').find(a => a.id === 'article_001');
    const likeBefore = before.likeCount;

    const res = await api.likeArticle('article_001');
    expect(res.code).toBe(200);
    expect(res.data.isLike).toBe(true);
    expect(res.data.likeCount).toBe(likeBefore);

    const likes = wx.getStorageSync('likes');
    const count = likes['user_001'].filter(id => id === 'article_001').length;
    expect(count).toBe(1);
  });

  test('取消点赞减少 likeCount', async () => {
    const before = wx.getStorageSync('articles').find(a => a.id === 'article_001');
    const likeBefore = before.likeCount;

    await api.likeArticle('article_001');
    const afterLike = wx.getStorageSync('articles').find(a => a.id === 'article_001');
    expect(afterLike.likeCount).toBe(likeBefore + 1);

    const res = await api.unlikeArticle('article_001');
    expect(res.data.isLike).toBe(false);
    const afterUnlike = wx.getStorageSync('articles').find(a => a.id === 'article_001');
    expect(afterUnlike.likeCount).toBe(likeBefore);
  });

  test('取消点赞从 likes 移除', async () => {
    await api.likeArticle('article_001');
    let likes = wx.getStorageSync('likes');
    expect(likes['user_001']).toContain('article_001');

    await api.unlikeArticle('article_001');
    likes = wx.getStorageSync('likes');
    expect(likes['user_001']).not.toContain('article_001');
  });

  test('取消点赞 likeCount 最小为 0', async () => {
    wx.setStorageSync('articles', [{ id: 'article_zero', title: '零赞文章', content: '内容', category: 'farming', authorId: 'u1', authorName: 'a', viewCount: 0, likeCount: 0, createTime: '2024-01-01', status: 1 }]);
    const res = await api.unlikeArticle('article_zero');
    expect(res.code).toBe(200);
    expect(res.data.likeCount).toBe(0);
  });

  test('点赞空 ID 返回 400', async () => {
    const res = await api.likeArticle('');
    expect(res.code).toBe(400);
  });

  test('点赞不存在的文章返回 404', async () => {
    const res = await api.likeArticle('article_notexist');
    expect(res.code).toBe(404);
  });

  test('取消点赞空 ID 返回 400', async () => {
    const res = await api.unlikeArticle('');
    expect(res.code).toBe(400);
  });

  test('检查点赞状态 - 已点赞', async () => {
    await api.likeArticle('article_001');
    const res = await api.checkLike('article_001');
    expect(res.code).toBe(200);
    expect(res.data.isLike).toBe(true);
  });

  test('检查点赞状态 - 未点赞', async () => {
    const res = await api.checkLike('article_001');
    expect(res.code).toBe(200);
    expect(res.data.isLike).toBe(false);
  });

  test('检查点赞空 ID 返回 400', async () => {
    const res = await api.checkLike('');
    expect(res.code).toBe(400);
  });

  test('不同用户点赞互不影响', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    await api.likeArticle('article_001');

    wx.setStorageSync('userInfo', { id: 'user_002', nickname: '另一个用户' });
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.checkLike('article_001');
    expect(res.data.isLike).toBe(false);
  });
});

describe('api.favoriteArticle / unfavoriteArticle / checkFavorite', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('未登录时收藏返回 401', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.favoriteArticle('article_001');
    expect(res.code).toBe(401);
    expect(res.message).toBe('请先登录');
  });

  test('未登录时取消收藏返回 401', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.unfavoriteArticle('article_001');
    expect(res.code).toBe(401);
    expect(res.message).toBe('请先登录');
  });

  test('未登录时检查收藏状态返回 401', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.checkFavorite('article_001');
    expect(res.code).toBe(401);
    expect(res.message).toBe('请先登录');
  });

  test('收藏文章', async () => {
    const res = await api.favoriteArticle('article_001');
    expect(res.code).toBe(200);
    expect(res.data.isFavorite).toBe(true);

    const favorites = wx.getStorageSync('favorites');
    expect(favorites['user_001']).toContain('article_001');
  });

  test('重复收藏返回已收藏状态', async () => {
    await api.favoriteArticle('article_001');
    const res = await api.favoriteArticle('article_001');
    expect(res.code).toBe(200);
    expect(res.data.isFavorite).toBe(true);

    const favorites = wx.getStorageSync('favorites');
    const count = favorites['user_001'].filter(id => id === 'article_001').length;
    expect(count).toBe(1);
  });

  test('取消收藏', async () => {
    await api.favoriteArticle('article_001');
    const res = await api.unfavoriteArticle('article_001');
    expect(res.code).toBe(200);
    expect(res.data.isFavorite).toBe(false);

    const favorites = wx.getStorageSync('favorites');
    expect(favorites['user_001']).not.toContain('article_001');
  });

  test('取消不存在的收藏不影响数据', async () => {
    const res = await api.unfavoriteArticle('article_002');
    expect(res.code).toBe(200);
  });

  test('检查收藏状态 - 已收藏', async () => {
    await api.favoriteArticle('article_001');
    const res = await api.checkFavorite('article_001');
    expect(res.code).toBe(200);
    expect(res.data.isFavorite).toBe(true);
  });

  test('检查收藏状态 - 未收藏', async () => {
    const res = await api.checkFavorite('article_001');
    expect(res.code).toBe(200);
    expect(res.data.isFavorite).toBe(false);
  });

  test('收藏空 ID 返回 400', async () => {
    const res = await api.favoriteArticle('');
    expect(res.code).toBe(400);
  });

  test('检查收藏空 ID 返回 400', async () => {
    const res = await api.checkFavorite('');
    expect(res.code).toBe(400);
  });

  test('不同用户收藏互不影响', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    await api.favoriteArticle('article_001');

    wx.setStorageSync('userInfo', { id: 'user_002', nickname: '另一个用户' });
    wx.setStorageSync('isLoggedIn', true);
    const res = await api.checkFavorite('article_001');
    expect(res.data.isFavorite).toBe(false);
  });
});

describe('api.getFavoriteList', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('无收藏时返回空列表', async () => {
    const res = await api.getFavoriteList();
    expect(res.code).toBe(200);
    expect(res.data.list).toEqual([]);
    expect(res.data.total).toBe(0);
  });

  test('返回已收藏的文章列表', async () => {
    await api.favoriteArticle('article_001');
    await api.favoriteArticle('article_002');

    const res = await api.getFavoriteList();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBe(2);
    expect(res.data.total).toBe(2);
  });

  test('按分类筛选收藏', async () => {
    await api.favoriteArticle('article_001');
    await api.favoriteArticle('article_002');

    const res = await api.getFavoriteList({ category: 'craft' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(item => item.category === 'craft')).toBe(true);
  });

  test('按关键词搜索收藏', async () => {
    await api.favoriteArticle('article_001');

    const res = await api.getFavoriteList({ keyword: '农耕' });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
  });

  test('分页功能正常工作', async () => {
    await api.favoriteArticle('article_001');
    await api.favoriteArticle('article_002');

    const res = await api.getFavoriteList({ page: 1, pageSize: 1 });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBe(1);
    expect(res.data.hasMore).toBe(true);
  });
});

describe('api.withErrorHandler 异常捕获', () => {
  test('Storage 读取异常时返回 500', async () => {
    const original = wx.getStorageSync;
    wx.getStorageSync = jest.fn(() => { throw new Error('Storage error'); });

    const res = await api.getArticleList();
    expect(res.code).toBe(500);
    expect(res.data).toBeNull();

    wx.getStorageSync = original;
  });
});

describe('api.publishArticle 关联人物', () => {
  beforeEach(() => {
    initStorage({
      userInfo: defaultUser,
      isLoggedIn: true
    });
  });

  test('投稿时关联人物，文章应保存 figureId', async () => {
    const articleData = {
      title: '我与王德福老人的对话',
      content: '今天有幸采访了王德福老人，他讲述了很多关于传统农耕的故事...',
      category: 'memory',
      figureId: 'figure_001'
    };

    const res = await api.publishArticle(articleData);
    expect(res.code).toBe(200);
    expect(res.data.figureId).toBe('figure_001');

    const articles = wx.getStorageSync('articles');
    const newArticle = articles.find(item => item.id === res.data.id);
    expect(newArticle).toBeDefined();
    expect(newArticle.figureId).toBe('figure_001');
  });

  test('投稿时关联人物，人物的 relatedArticles 应更新', async () => {
    const articleData = {
      title: '李陈氏的刺绣人生',
      content: '李陈氏老人的刺绣技艺精湛，每一件作品都倾注了她的心血...',
      category: 'craft',
      figureId: 'figure_002'
    };

    const res = await api.publishArticle(articleData);
    expect(res.code).toBe(200);

    const figures = wx.getStorageSync('figures');
    const figure = figures.find(item => item.id === 'figure_002');
    expect(figure).toBeDefined();
    expect(figure.relatedArticles).toContain(res.data.id);
  });

  test('投稿时不关联人物，文章不应有 figureId', async () => {
    const articleData = {
      title: '乡村的春天',
      content: '春天来了，乡村里一派生机勃勃的景象...',
      category: 'folklore'
    };

    const res = await api.publishArticle(articleData);
    expect(res.code).toBe(200);
    expect(res.data.figureId).toBeUndefined();
  });

  test('关联无效人物ID时，不会报错', async () => {
    const articleData = {
      title: '测试文章',
      content: '测试内容...',
      category: 'memory',
      figureId: 'invalid_figure_id'
    };

    const res = await api.publishArticle(articleData);
    expect(res.code).toBe(200);
    expect(res.data.figureId).toBe('invalid_figure_id');
  });

  test('同一人物关联多篇文章', async () => {
    const article1 = {
      title: '王德福的农耕智慧（上）',
      content: '内容...',
      category: 'farming',
      figureId: 'figure_001'
    };
    const article2 = {
      title: '王德福的农耕智慧（下）',
      content: '内容...',
      category: 'farming',
      figureId: 'figure_001'
    };

    const res1 = await api.publishArticle(article1);
    const res2 = await api.publishArticle(article2);

    expect(res1.code).toBe(200);
    expect(res2.code).toBe(200);

    const figures = wx.getStorageSync('figures');
    const figure = figures.find(item => item.id === 'figure_001');
    expect(figure.relatedArticles).toContain(res1.data.id);
    expect(figure.relatedArticles).toContain(res2.data.id);
    expect(figure.relatedArticles.length).toBeGreaterThanOrEqual(3);
  });
});

describe('api.getFigureDetail 相关文章', () => {
  beforeEach(() => {
    initStorage({
      userInfo: defaultUser,
      isLoggedIn: true
    });
  });

  test('应返回人物预设的 relatedArticles', async () => {
    const res = await api.getFigureDetail('figure_001');
    expect(res.code).toBe(200);
    expect(res.data.relatedArticleList.length).toBeGreaterThan(0);
    const articleIds = res.data.relatedArticleList.map(item => item.id);
    expect(articleIds).toContain('article_005');
  });

  test('新投稿关联人物后，应出现在相关文章中', async () => {
    const articleData = {
      title: '新采访的王德福老人',
      content: '最新的采访内容...',
      category: 'memory',
      figureId: 'figure_001'
    };

    const publishRes = await api.publishArticle(articleData);
    expect(publishRes.code).toBe(200);

    const detailRes = await api.getFigureDetail('figure_001');
    expect(detailRes.code).toBe(200);

    const articleIds = detailRes.data.relatedArticleList.map(item => item.id);
    expect(articleIds).toContain(publishRes.data.id);
  });

  test('相关文章应按时间倒序排列', async () => {
    const article1 = {
      title: '旧文章',
      content: '旧内容...',
      category: 'memory',
      figureId: 'figure_001'
    };
    const article2 = {
      title: '新文章',
      content: '新内容...',
      category: 'memory',
      figureId: 'figure_001'
    };

    await api.publishArticle(article1);
    await new Promise(resolve => setTimeout(resolve, 100));
    await api.publishArticle(article2);

    const res = await api.getFigureDetail('figure_001');
    expect(res.code).toBe(200);

    const articles = res.data.relatedArticleList;
    for (let i = 0; i < articles.length - 1; i++) {
      const date1 = new Date(articles[i].createTime);
      const date2 = new Date(articles[i + 1].createTime);
      expect(date1 >= date2).toBe(true);
    }
  });

  test('双向关联：通过 figureId 关联的文章也应显示', async () => {
    const articles = wx.getStorageSync('articles');
    articles[0].figureId = 'figure_001';
    wx.setStorageSync('articles', articles);

    const res = await api.getFigureDetail('figure_001');
    expect(res.code).toBe(200);

    const articleIds = res.data.relatedArticleList.map(item => item.id);
    expect(articleIds).toContain(articles[0].id);
  });

  test('去重：两种关联方式都有时不重复显示', async () => {
    const articles = wx.getStorageSync('articles');
    articles[4].figureId = 'figure_001';
    wx.setStorageSync('articles', articles);

    const res = await api.getFigureDetail('figure_001');
    expect(res.code).toBe(200);

    const articleIds = res.data.relatedArticleList.map(item => item.id);
    const uniqueIds = [...new Set(articleIds)];
    expect(articleIds.length).toBe(uniqueIds.length);
  });

  test('未发布的文章（status !== 1）不应显示', async () => {
    const articles = wx.getStorageSync('articles');
    articles.push({
      id: 'article_draft',
      title: '草稿文章',
      content: '草稿内容',
      category: 'memory',
      figureId: 'figure_001',
      status: 0,
      createTime: '2024-12-20'
    });
    wx.setStorageSync('articles', articles);

    const res = await api.getFigureDetail('figure_001');
    expect(res.code).toBe(200);

    const articleIds = res.data.relatedArticleList.map(item => item.id);
    expect(articleIds).not.toContain('article_draft');
  });

  test('人物不存在时返回 404', async () => {
    const res = await api.getFigureDetail('invalid_id');
    expect(res.code).toBe(404);
    expect(res.data).toBeNull();
  });

  test('人物ID为空时返回 400', async () => {
    const res = await api.getFigureDetail('');
    expect(res.code).toBe(400);
    expect(res.data).toBeNull();
  });

  test('应增加人物浏览量', async () => {
    const figuresBefore = wx.getStorageSync('figures');
    const figureBefore = figuresBefore.find(item => item.id === 'figure_001');
    const viewCountBefore = figureBefore.viewCount;

    await api.getFigureDetail('figure_001');

    const figuresAfter = wx.getStorageSync('figures');
    const figureAfter = figuresAfter.find(item => item.id === 'figure_001');
    expect(figureAfter.viewCount).toBe(viewCountBefore + 1);
  });
});

describe('api.getFigureList 人物列表', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回已审核人物列表', async () => {
    const res = await api.getFigureList();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.list.every(item => item.status === 1)).toBe(true);
  });

  test('按身份筛选人物', async () => {
    const res = await api.getFigureList({ identity: 'farmer' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(item => item.identity === 'farmer')).toBe(true);
  });

  test('按技艺筛选人物', async () => {
    const res = await api.getFigureList({ craft: 'weaving' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(item => item.crafts.includes('weaving'))).toBe(true);
  });

  test('按地区筛选人物', async () => {
    const res = await api.getFigureList({ region: 'north' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(item => item.region === 'north')).toBe(true);
  });

  test('按年代筛选人物', async () => {
    const res = await api.getFigureList({ era: '1930s' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(item => item.era === '1930s')).toBe(true);
  });

  test('按关键词搜索人物', async () => {
    const res = await api.getFigureList({ keyword: '王德福' });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.list[0].name).toBe('王德福');
  });

  test('返回格式化的人物信息', async () => {
    const res = await api.getFigureList();
    expect(res.code).toBe(200);
    const figure = res.data.list[0];
    expect(figure).toHaveProperty('identityInfo');
    expect(figure).toHaveProperty('regionName');
    expect(figure).toHaveProperty('eraName');
    expect(figure).toHaveProperty('craftNames');
    expect(figure).toHaveProperty('lifespan');
    expect(figure).toHaveProperty('age');
  });
});

describe('api.createFigureDraft 新建人物草稿', () => {
  beforeEach(() => {
    initStorage({
      userInfo: defaultUser,
      isLoggedIn: true
    });
  });

  test('成功创建人物草稿', async () => {
    const draftData = {
      name: '张匠人',
      identity: 'craftsman',
      briefIntroduction: '木工技艺传承人，从事木工工作50余年。',
      birthYear: 1950,
      region: 'north',
      era: '1950s',
      crafts: ['woodcarving']
    };

    const res = await api.createFigureDraft(draftData);
    expect(res.code).toBe(200);
    expect(res.data.status).toBe(0);
    expect(res.data.reviewStatus).toBe('pending');
    expect(res.data.submitterId).toBe(defaultUser.id);
  });

  test('姓名为空时返回 400', async () => {
    const draftData = {
      name: '',
      identity: 'craftsman',
      briefIntroduction: '简介...'
    };

    const res = await api.createFigureDraft(draftData);
    expect(res.code).toBe(400);
  });

  test('未选择身份时返回 400', async () => {
    const draftData = {
      name: '张匠人',
      identity: '',
      briefIntroduction: '简介...'
    };

    const res = await api.createFigureDraft(draftData);
    expect(res.code).toBe(400);
  });

  test('简介为空时返回 400', async () => {
    const draftData = {
      name: '张匠人',
      identity: 'craftsman',
      briefIntroduction: ''
    };

    const res = await api.createFigureDraft(draftData);
    expect(res.code).toBe(400);
  });

  test('未登录时返回 401', async () => {
    initStorage({ isLoggedIn: false });

    const draftData = {
      name: '张匠人',
      identity: 'craftsman',
      briefIntroduction: '简介...'
    };

    const res = await api.createFigureDraft(draftData);
    expect(res.code).toBe(401);
  });
});

describe('api.likeFigure 人物点赞', () => {
  beforeEach(() => {
    initStorage({
      userInfo: defaultUser,
      isLoggedIn: true
    });
  });

  test('成功点赞人物', async () => {
    const res = await api.likeFigure('figure_001');
    expect(res.code).toBe(200);
    expect(res.data.isLike).toBe(true);
    expect(res.data.likeCount).toBeGreaterThan(0);
  });

  test('重复点赞不重复计数', async () => {
    await api.likeFigure('figure_001');
    const res = await api.likeFigure('figure_001');
    expect(res.code).toBe(200);
    expect(res.data.isLike).toBe(true);

    const figures = wx.getStorageSync('figures');
    const figure = figures.find(item => item.id === 'figure_001');
    const initialCount = 127;
    expect(figure.likeCount).toBe(initialCount + 1);
  });

  test('取消点赞', async () => {
    await api.likeFigure('figure_001');
    const res = await api.unlikeFigure('figure_001');
    expect(res.code).toBe(200);
    expect(res.data.isLike).toBe(false);
  });

  test('检查点赞状态', async () => {
    await api.likeFigure('figure_001');
    const res = await api.checkFigureLike('figure_001');
    expect(res.code).toBe(200);
    expect(res.data.isLike).toBe(true);
  });
});

describe('api.getTopicList 专题列表', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回专题列表', async () => {
    const res = await api.getTopicList();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.list.every(item => item.status === 1)).toBe(true);
  });

  test('按分类筛选专题', async () => {
    const res = await api.getTopicList({ category: 'folklore' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(item => item.category === 'folklore')).toBe(true);
  });

  test('按关键词搜索专题', async () => {
    const res = await api.getTopicList({ keyword: '端午' });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.list[0].title).toContain('端午');
  });

  test('分页功能正常工作', async () => {
    const res1 = await api.getTopicList({ page: 1, pageSize: 1 });
    expect(res1.code).toBe(200);
    expect(res1.data.list.length).toBe(1);
    expect(res1.data.hasMore).toBe(true);
  });

  test('响应格式正确', async () => {
    const res = await api.getTopicList();
    expect(res).toHaveProperty('code');
    expect(res).toHaveProperty('data.list');
    expect(res).toHaveProperty('data.total');
    expect(res).toHaveProperty('data.hasMore');
  });
});

describe('api.getTopicDetail 专题详情', () => {
  beforeEach(() => {
    initStorage();
  });

  test('根据ID获取专题详情', async () => {
    const res = await api.getTopicDetail('topic_001');
    expect(res.code).toBe(200);
    expect(res.data.id).toBe('topic_001');
    expect(res.data.title).toBe('端午民俗专题');
  });

  test('每次获取详情浏览量自动递增', async () => {
    const before = wx.getStorageSync('topics').find(t => t.id === 'topic_001');
    const viewCountBefore = before.viewCount;

    await api.getTopicDetail('topic_001');

    const after = wx.getStorageSync('topics').find(t => t.id === 'topic_001');
    expect(after.viewCount).toBe(viewCountBefore + 1);
  });

  test('专题ID为空返回400', async () => {
    const res = await api.getTopicDetail('');
    expect(res.code).toBe(400);
  });

  test('不存在的专题ID返回404', async () => {
    const res = await api.getTopicDetail('topic_notexist');
    expect(res.code).toBe(404);
  });

  test('返回文章列表数据', async () => {
    const res = await api.getTopicDetail('topic_001');
    expect(res.data.articleList).toBeDefined();
    expect(Array.isArray(res.data.articleList)).toBe(true);
  });
});

describe('api.createTopic 创建专题', () => {
  beforeEach(() => {
    initStorage({
      userInfo: defaultUser,
      isLoggedIn: true
    });
  });

  test('成功创建专题', async () => {
    const res = await api.createTopic({
      title: '测试专题',
      category: 'farming',
      introduction: '这是一个测试专题的介绍内容，长度超过十个字符',
      tags: ['测试', '专题'],
      articleIds: [],
      relatedTopicIds: []
    });
    expect(res.code).toBe(200);
    expect(res.data.title).toBe('测试专题');
    expect(res.data.status).toBe(1);
  });

  test('新专题被添加到列表头部', async () => {
    const before = wx.getStorageSync('topics');
    const beforeLen = before.length;

    await api.createTopic({
      title: '新专题',
      category: 'memory',
      introduction: '新专题的介绍内容，长度超过十个字符',
      tags: [],
      articleIds: [],
      relatedTopicIds: []
    });

    const after = wx.getStorageSync('topics');
    expect(after.length).toBe(beforeLen + 1);
    expect(after[0].title).toBe('新专题');
  });

  test('未登录时创建专题返回401', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.createTopic({
      title: '无用户专题',
      category: 'folklore',
      introduction: '内容内容内容内容内容内容内容内容内容内容'
    });
    expect(res.code).toBe(401);
  });

  test('标题为空返回400', async () => {
    const res = await api.createTopic({
      title: '',
      category: 'folklore',
      introduction: '内容内容内容内容内容内容内容内容内容内容'
    });
    expect(res.code).toBe(400);
  });

  test('分类为空返回400', async () => {
    const res = await api.createTopic({
      title: '测试专题',
      category: '',
      introduction: '内容内容内容内容内容内容内容内容内容内容'
    });
    expect(res.code).toBe(400);
  });

  test('导语少于10字返回400', async () => {
    const res = await api.createTopic({
      title: '测试专题',
      category: 'folklore',
      introduction: '太短'
    });
    expect(res.code).toBe(400);
  });
});

describe('api.updateTopic 更新专题', () => {
  beforeEach(() => {
    initStorage({
      userInfo: defaultUser,
      isLoggedIn: true
    });
  });

  test('成功更新专题', async () => {
    const res = await api.updateTopic('topic_001', {
      title: '更新后的端午民俗',
      category: 'folklore',
      introduction: '更新后的介绍内容，长度超过十个字符',
      tags: ['更新', '测试'],
      articleIds: [],
      relatedTopicIds: []
    });
    expect(res.code).toBe(200);
    expect(res.data.title).toBe('更新后的端午民俗');

    const topics = wx.getStorageSync('topics');
    const updated = topics.find(t => t.id === 'topic_001');
    expect(updated.title).toBe('更新后的端午民俗');
  });

  test('专题ID为空返回400', async () => {
    const res = await api.updateTopic('', {
      title: '测试',
      category: 'folklore',
      introduction: '内容内容内容内容内容内容内容内容内容内容'
    });
    expect(res.code).toBe(400);
  });

  test('不存在的专题ID返回404', async () => {
    const res = await api.updateTopic('topic_notexist', {
      title: '测试',
      category: 'folklore',
      introduction: '内容内容内容内容内容内容内容内容内容内容'
    });
    expect(res.code).toBe(404);
  });
});

describe('api.deleteTopic 删除专题', () => {
  beforeEach(() => {
    initStorage({
      userInfo: defaultUser,
      isLoggedIn: true
    });
  });

  test('成功删除专题', async () => {
    const before = wx.getStorageSync('topics');
    const beforeLen = before.length;

    const res = await api.deleteTopic('topic_001');
    expect(res.code).toBe(200);

    const after = wx.getStorageSync('topics');
    expect(after.length).toBe(beforeLen - 1);
    expect(after.find(t => t.id === 'topic_001')).toBeUndefined();
  });

  test('专题ID为空返回400', async () => {
    const res = await api.deleteTopic('');
    expect(res.code).toBe(400);
  });

  test('不存在的专题ID返回404', async () => {
    const res = await api.deleteTopic('topic_notexist');
    expect(res.code).toBe(404);
  });
});

describe('api.getEncyclopediaList 百科列表', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回百科词条列表', async () => {
    const res = await api.getEncyclopediaList();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.list.every(item => item.status === 1)).toBe(true);
  });

  test('按分类筛选词条', async () => {
    const res = await api.getEncyclopediaList({ category: 'craft' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(item => item.category === 'craft')).toBe(true);
  });

  test('按关键词搜索词条', async () => {
    const res = await api.getEncyclopediaList({ keyword: '节气' });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.list[0].title).toContain('节气');
  });

  test('分页功能正常工作', async () => {
    const res1 = await api.getEncyclopediaList({ page: 1, pageSize: 1 });
    expect(res1.code).toBe(200);
    expect(res1.data.list.length).toBe(1);
    expect(res1.data.hasMore).toBe(true);
  });

  test('响应格式正确', async () => {
    const res = await api.getEncyclopediaList();
    expect(res).toHaveProperty('code');
    expect(res).toHaveProperty('data.list');
    expect(res).toHaveProperty('data.total');
    expect(res).toHaveProperty('data.hasMore');
  });
});

describe('api.getEncyclopediaDetail 百科详情', () => {
  beforeEach(() => {
    initStorage();
  });

  test('根据ID获取词条详情', async () => {
    const res = await api.getEncyclopediaDetail('encyclopedia_001');
    expect(res.code).toBe(200);
    expect(res.data.id).toBe('encyclopedia_001');
    expect(res.data.title).toBe('二十四节气');
  });

  test('每次获取详情浏览量自动递增', async () => {
    const before = wx.getStorageSync('encyclopedia').find(e => e.id === 'encyclopedia_001');
    const viewCountBefore = before.viewCount;

    await api.getEncyclopediaDetail('encyclopedia_001');

    const after = wx.getStorageSync('encyclopedia').find(e => e.id === 'encyclopedia_001');
    expect(after.viewCount).toBe(viewCountBefore + 1);
  });

  test('词条ID为空返回400', async () => {
    const res = await api.getEncyclopediaDetail('');
    expect(res.code).toBe(400);
  });

  test('不存在的词条ID返回404', async () => {
    const res = await api.getEncyclopediaDetail('encyclopedia_notexist');
    expect(res.code).toBe(404);
  });

  test('返回目录数据', async () => {
    const res = await api.getEncyclopediaDetail('encyclopedia_001');
    expect(res.data.catalog).toBeDefined();
    expect(Array.isArray(res.data.catalog)).toBe(true);
    expect(res.data.catalog.length).toBeGreaterThan(0);
  });

  test('返回相关文章列表', async () => {
    const res = await api.getEncyclopediaDetail('encyclopedia_001');
    expect(res.data.relatedArticles).toBeDefined();
    expect(Array.isArray(res.data.relatedArticles)).toBe(true);
  });

  test('返回相关专题列表', async () => {
    const res = await api.getEncyclopediaDetail('encyclopedia_002');
    expect(res.data.relatedTopics).toBeDefined();
    expect(Array.isArray(res.data.relatedTopics)).toBe(true);
  });
});

describe('api.createEncyclopedia 创建百科', () => {
  beforeEach(() => {
    initStorage({
      userInfo: defaultUser,
      isLoggedIn: true
    });
  });

  test('成功创建百科词条', async () => {
    const res = await api.createEncyclopedia({
      title: '测试词条',
      category: 'folklore',
      summary: '这是测试词条的摘要内容，长度超过十个字符',
      content: '这是测试词条的详细内容，长度需要超过二十个字符才可以通过验证',
      catalog: [{ id: 'cat_1', level: 1, title: '测试目录' }],
      tags: ['测试', '百科'],
      relatedArticleIds: [],
      relatedTopicIds: []
    });
    expect(res.code).toBe(200);
    expect(res.data.title).toBe('测试词条');
    expect(res.data.status).toBe(1);
  });

  test('新词条被添加到列表头部', async () => {
    const before = wx.getStorageSync('encyclopedia');
    const beforeLen = before.length;

    await api.createEncyclopedia({
      title: '新词条',
      category: 'memory',
      summary: '新词条的摘要内容，长度超过十个字符',
      content: '新词条的详细内容，长度需要超过二十个字符才可以通过验证',
      catalog: [],
      tags: [],
      relatedArticleIds: [],
      relatedTopicIds: []
    });

    const after = wx.getStorageSync('encyclopedia');
    expect(after.length).toBe(beforeLen + 1);
    expect(after[0].title).toBe('新词条');
  });

  test('未登录时创建词条返回401', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.createEncyclopedia({
      title: '无用户词条',
      category: 'folklore',
      summary: '内容内容内容内容内容内容内容内容内容内容',
      content: '内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容'
    });
    expect(res.code).toBe(401);
  });

  test('标题为空返回400', async () => {
    const res = await api.createEncyclopedia({
      title: '',
      category: 'folklore',
      summary: '内容内容内容内容内容内容内容内容内容内容',
      content: '内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容'
    });
    expect(res.code).toBe(400);
  });

  test('分类为空返回400', async () => {
    const res = await api.createEncyclopedia({
      title: '测试词条',
      category: '',
      summary: '内容内容内容内容内容内容内容内容内容内容',
      content: '内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容'
    });
    expect(res.code).toBe(400);
  });

  test('摘要少于10字返回400', async () => {
    const res = await api.createEncyclopedia({
      title: '测试词条',
      category: 'folklore',
      summary: '太短',
      content: '内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容'
    });
    expect(res.code).toBe(400);
  });

  test('内容少于20字返回400', async () => {
    const res = await api.createEncyclopedia({
      title: '测试词条',
      category: 'folklore',
      summary: '内容内容内容内容内容内容内容内容内容内容',
      content: '太短了不够二十字'
    });
    expect(res.code).toBe(400);
  });
});

describe('api.updateEncyclopedia 更新百科', () => {
  beforeEach(() => {
    initStorage({
      userInfo: defaultUser,
      isLoggedIn: true
    });
  });

  test('成功更新百科词条', async () => {
    const res = await api.updateEncyclopedia('encyclopedia_001', {
      title: '更新后的二十四节气',
      category: 'farming',
      summary: '更新后的摘要内容，长度超过十个字符',
      content: '更新后的详细内容，长度需要超过二十个字符才可以通过验证',
      catalog: [{ id: 'cat_1', level: 1, title: '更新目录' }],
      tags: ['更新', '测试'],
      relatedArticleIds: [],
      relatedTopicIds: []
    });
    expect(res.code).toBe(200);
    expect(res.data.title).toBe('更新后的二十四节气');

    const encyclopedias = wx.getStorageSync('encyclopedia');
    const updated = encyclopedias.find(e => e.id === 'encyclopedia_001');
    expect(updated.title).toBe('更新后的二十四节气');
  });

  test('词条ID为空返回400', async () => {
    const res = await api.updateEncyclopedia('', {
      title: '测试',
      category: 'folklore',
      summary: '内容内容内容内容内容内容内容内容内容内容',
      content: '内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容'
    });
    expect(res.code).toBe(400);
  });

  test('不存在的词条ID返回404', async () => {
    const res = await api.updateEncyclopedia('encyclopedia_notexist', {
      title: '测试',
      category: 'folklore',
      summary: '内容内容内容内容内容内容内容内容内容内容',
      content: '内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容'
    });
    expect(res.code).toBe(404);
  });
});

describe('api.deleteEncyclopedia 删除百科', () => {
  beforeEach(() => {
    initStorage({
      userInfo: defaultUser,
      isLoggedIn: true
    });
  });

  test('成功删除百科词条', async () => {
    const before = wx.getStorageSync('encyclopedia');
    const beforeLen = before.length;

    const res = await api.deleteEncyclopedia('encyclopedia_001');
    expect(res.code).toBe(200);

    const after = wx.getStorageSync('encyclopedia');
    expect(after.length).toBe(beforeLen - 1);
    expect(after.find(e => e.id === 'encyclopedia_001')).toBeUndefined();
  });

  test('词条ID为空返回400', async () => {
    const res = await api.deleteEncyclopedia('');
    expect(res.code).toBe(400);
  });

  test('不存在的词条ID返回404', async () => {
    const res = await api.deleteEncyclopedia('encyclopedia_notexist');
    expect(res.code).toBe(404);
  });
});
