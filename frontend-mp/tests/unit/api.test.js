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

describe('api.createNotification', () => {
  beforeEach(() => {
    initStorage();
  });

  test('should create a notification successfully', async () => {
    const res = await api.createNotification({
      type: 'like',
      fromUserId: 'user_002',
      fromUserName: '李阿姨',
      targetUserId: 'user_001',
      targetId: 'article_001',
      targetTitle: '记忆中的农耕岁月',
      content: '李阿姨 赞了你的文章',
      jumpType: 'article',
      jumpId: 'article_001'
    });
    expect(res.code).toBe(200);
    expect(res.data.type).toBe('like');
    expect(res.data.fromUserId).toBe('user_002');
    expect(res.data.targetUserId).toBe('user_001');
    expect(res.data.content).toBe('李阿姨 赞了你的文章');
  });

  test('should return 400 if targetUserId is missing', async () => {
    const res = await api.createNotification({
      type: 'like',
      fromUserId: 'user_002',
      content: 'test'
    });
    expect(res.code).toBe(400);
    expect(res.data).toBeNull();
  });

  test('should set isRead to false by default', async () => {
    const res = await api.createNotification({
      type: 'system',
      targetUserId: 'user_001',
      content: 'system notification'
    });
    expect(res.code).toBe(200);
    expect(res.data.isRead).toBe(false);
  });

  test('should generate id and createTime', async () => {
    const res = await api.createNotification({
      type: 'like',
      targetUserId: 'user_001',
      content: 'test'
    });
    expect(res.code).toBe(200);
    expect(res.data.id).toBeDefined();
    expect(res.data.id).toMatch(/^ntf/);
    expect(res.data.createTime).toBeDefined();
    expect(typeof res.data.createTime).toBe('string');
    expect(res.data.createTime.length).toBeGreaterThan(0);
  });
});

describe('api.getNotificationList', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('should return 401 if not logged in', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.getNotificationList();
    expect(res.code).toBe(401);
    expect(res.message).toBe('请先登录');
  });

  test('should return notification list for current user', async () => {
    await api.createNotification({
      type: 'like',
      fromUserId: 'user_002',
      fromUserName: '李阿姨',
      targetUserId: 'user_001',
      targetId: 'article_001',
      targetTitle: '记忆中的农耕岁月',
      content: '李阿姨 赞了你的文章',
      jumpType: 'article',
      jumpId: 'article_001'
    });

    const res = await api.getNotificationList();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
  });

  test('should filter by type', async () => {
    await api.createNotification({
      type: 'like',
      fromUserId: 'user_002',
      fromUserName: '李阿姨',
      targetUserId: 'user_001',
      targetId: 'article_001',
      targetTitle: '记忆中的农耕岁月',
      content: '李阿姨 赞了你的文章',
      jumpType: 'article',
      jumpId: 'article_001'
    });
    await api.createNotification({
      type: 'system',
      targetUserId: 'user_001',
      content: '系统通知'
    });

    const res = await api.getNotificationList({ type: 'like' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(item => item.type === 'like')).toBe(true);
  });

  test('should filter by readStatus (unread/read)', async () => {
    await api.createNotification({
      type: 'like',
      fromUserId: 'user_002',
      fromUserName: '李阿姨',
      targetUserId: 'user_001',
      targetId: 'article_001',
      targetTitle: '记忆中的农耕岁月',
      content: '李阿姨 赞了你的文章',
      jumpType: 'article',
      jumpId: 'article_001'
    });
    await api.createNotification({
      type: 'system',
      targetUserId: 'user_001',
      content: '系统通知'
    });

    const resUnread = await api.getNotificationList({ readStatus: 'unread' });
    expect(resUnread.code).toBe(200);
    expect(resUnread.data.list.every(item => item.isRead === false)).toBe(true);

    const notifications = wx.getStorageSync('notifications') || {};
    const list = notifications['user_001'] || [];
    list[0].isRead = true;
    wx.setStorageSync('notifications', notifications);

    const resRead = await api.getNotificationList({ readStatus: 'read' });
    expect(resRead.code).toBe(200);
    expect(resRead.data.list.every(item => item.isRead === true)).toBe(true);
  });

  test('should return unreadCount', async () => {
    await api.createNotification({
      type: 'like',
      fromUserId: 'user_002',
      fromUserName: '李阿姨',
      targetUserId: 'user_001',
      targetId: 'article_001',
      targetTitle: '记忆中的农耕岁月',
      content: '李阿姨 赞了你的文章',
      jumpType: 'article',
      jumpId: 'article_001'
    });
    await api.createNotification({
      type: 'system',
      targetUserId: 'user_001',
      content: '系统通知'
    });

    const res = await api.getNotificationList();
    expect(res.code).toBe(200);
    expect(res.data.unreadCount).toBe(2);
  });

  test('should sort by createTime desc', async () => {
    await api.createNotification({
      type: 'like',
      fromUserId: 'user_002',
      fromUserName: '李阿姨',
      targetUserId: 'user_001',
      targetId: 'article_001',
      targetTitle: '记忆中的农耕岁月',
      content: 'first notification',
      jumpType: 'article',
      jumpId: 'article_001'
    });
    await new Promise(resolve => setTimeout(resolve, 100));
    await api.createNotification({
      type: 'system',
      targetUserId: 'user_001',
      content: 'second notification'
    });

    const res = await api.getNotificationList();
    expect(res.code).toBe(200);
    const list = res.data.list;
    for (let i = 0; i < list.length - 1; i++) {
      expect(new Date(list[i].createTime) >= new Date(list[i + 1].createTime)).toBe(true);
    }
  });

  test('should support pagination', async () => {
    for (let i = 0; i < 5; i++) {
      await api.createNotification({
        type: 'system',
        targetUserId: 'user_001',
        content: `notification ${i}`
      });
    }

    const res1 = await api.getNotificationList({ page: 1, pageSize: 2 });
    expect(res1.code).toBe(200);
    expect(res1.data.list.length).toBe(2);
    expect(res1.data.total).toBe(5);

    const res2 = await api.getNotificationList({ page: 2, pageSize: 2 });
    expect(res2.code).toBe(200);
    expect(res2.data.list.length).toBe(2);
  });
});

describe('api.getUnreadCount', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('should return 401 if not logged in', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.getUnreadCount();
    expect(res.code).toBe(401);
    expect(res.message).toBe('请先登录');
  });

  test('should return unread notification count', async () => {
    await api.createNotification({
      type: 'like',
      fromUserId: 'user_002',
      fromUserName: '李阿姨',
      targetUserId: 'user_001',
      targetId: 'article_001',
      targetTitle: '记忆中的农耕岁月',
      content: '李阿姨 赞了你的文章',
      jumpType: 'article',
      jumpId: 'article_001'
    });
    await api.createNotification({
      type: 'system',
      targetUserId: 'user_001',
      content: '系统通知'
    });

    const res = await api.getUnreadCount();
    expect(res.code).toBe(200);
    expect(res.data.count).toBe(2);
  });
});

describe('api.markAsRead', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('should return 401 if not logged in', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.markAsRead('ntf_001');
    expect(res.code).toBe(401);
    expect(res.message).toBe('请先登录');
  });

  test('should mark a notification as read', async () => {
    const createRes = await api.createNotification({
      type: 'like',
      fromUserId: 'user_002',
      fromUserName: '李阿姨',
      targetUserId: 'user_001',
      targetId: 'article_001',
      targetTitle: '记忆中的农耕岁月',
      content: '李阿姨 赞了你的文章',
      jumpType: 'article',
      jumpId: 'article_001'
    });
    const ntfId = createRes.data.id;
    expect(createRes.data.isRead).toBe(false);

    const res = await api.markAsRead(ntfId);
    expect(res.code).toBe(200);

    const notifications = wx.getStorageSync('notifications') || {};
    const notification = notifications['user_001'].find(item => item.id === ntfId);
    expect(notification.isRead).toBe(true);
  });

  test('should return 404 if notification not found', async () => {
    const res = await api.markAsRead('ntf_notexist');
    expect(res.code).toBe(404);
    expect(res.data).toBeNull();
  });
});

describe('api.markAllAsRead', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('should mark all notifications as read for current user', async () => {
    await api.createNotification({
      type: 'like',
      fromUserId: 'user_002',
      fromUserName: '李阿姨',
      targetUserId: 'user_001',
      targetId: 'article_001',
      targetTitle: '记忆中的农耕岁月',
      content: '李阿姨 赞了你的文章',
      jumpType: 'article',
      jumpId: 'article_001'
    });
    await api.createNotification({
      type: 'system',
      targetUserId: 'user_001',
      content: '系统通知'
    });

    const res = await api.markAllAsRead();
    expect(res.code).toBe(200);

    const notifications = wx.getStorageSync('notifications') || {};
    const list = notifications['user_001'] || [];
    list.forEach(item => {
      expect(item.isRead).toBe(true);
    });
  });
});

describe('api.deleteNotification', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('should delete a notification', async () => {
    const createRes = await api.createNotification({
      type: 'like',
      fromUserId: 'user_002',
      fromUserName: '李阿姨',
      targetUserId: 'user_001',
      targetId: 'article_001',
      targetTitle: '记忆中的农耕岁月',
      content: '李阿姨 赞了你的文章',
      jumpType: 'article',
      jumpId: 'article_001'
    });
    const ntfId = createRes.data.id;

    const res = await api.deleteNotification(ntfId);
    expect(res.code).toBe(200);

    const notifications = wx.getStorageSync('notifications') || {};
    const list = notifications['user_001'] || [];
    expect(list.find(item => item.id === ntfId)).toBeUndefined();
  });

  test('should return 404 if notification not found', async () => {
    const res = await api.deleteNotification('ntf_notexist');
    expect(res.code).toBe(404);
    expect(res.data).toBeNull();
  });
});

describe('api notification triggers', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', { id: 'user_002', nickname: '李阿姨' });
    wx.setStorageSync('isLoggedIn', true);
  });

  test('likeArticle should create notification for article author', async () => {
    await api.likeArticle('article_001');
    await new Promise(resolve => setTimeout(resolve, 300));

    const notifications = wx.getStorageSync('notifications') || {};
    const authorNotifications = notifications['user_001'] || [];
    expect(authorNotifications.length).toBeGreaterThan(0);
    const likeNotification = authorNotifications.find(item => item.type === 'like' && item.targetId === 'article_001');
    expect(likeNotification).toBeDefined();
    expect(likeNotification.fromUserId).toBe('user_002');
    expect(likeNotification.targetUserId).toBe('user_001');
  });

  test('likeArticle should NOT create notification for self-like', async () => {
    wx.setStorageSync('userInfo', { id: 'user_001', nickname: '张大爷' });
    wx.setStorageSync('isLoggedIn', true);

    await api.likeArticle('article_001');
    await new Promise(resolve => setTimeout(resolve, 300));

    const notifications = wx.getStorageSync('notifications') || {};
    const authorNotifications = notifications['user_001'] || [];
    const likeNotification = authorNotifications.find(item => item.type === 'like' && item.targetId === 'article_001');
    expect(likeNotification).toBeUndefined();
  });

  test('favoriteArticle should create notification for article author', async () => {
    await api.favoriteArticle('article_001');
    await new Promise(resolve => setTimeout(resolve, 300));

    const notifications = wx.getStorageSync('notifications') || {};
    const authorNotifications = notifications['user_001'] || [];
    expect(authorNotifications.length).toBeGreaterThan(0);
    const favNotification = authorNotifications.find(item => item.type === 'favorite' && item.targetId === 'article_001');
    expect(favNotification).toBeDefined();
    expect(favNotification.fromUserId).toBe('user_002');
    expect(favNotification.targetUserId).toBe('user_001');
  });
});

describe('api.getActivityTypes', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回活动类型列表', async () => {
    const res = await api.getActivityTypes();
    expect(res.code).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBe(3);
    expect(res.data[0]).toHaveProperty('id');
    expect(res.data[0]).toHaveProperty('name');
  });

  test('包含三种活动类型', async () => {
    const res = await api.getActivityTypes();
    const keys = res.data.map(t => t.id);
    expect(keys).toContain('lecture');
    expect(keys).toContain('study');
    expect(keys).toContain('craft');
  });
});

describe('api.getActivityList', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回活动列表', async () => {
    const res = await api.getActivityList();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.total).toBeGreaterThan(0);
  });

  test('按活动类型筛选', async () => {
    const res = await api.getActivityList({ type: 'lecture' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(item => item.type === 'lecture')).toBe(true);
  });

  test('type=all 返回所有活动', async () => {
    const res = await api.getActivityList({ type: 'all' });
    expect(res.code).toBe(200);
    const activities = wx.getStorageSync('activities').filter(a => a.status === 1);
    expect(res.data.total).toBe(activities.length);
  });

  test('按状态筛选 - 报名中', async () => {
    const res = await api.getActivityList({ status: 'open' });
    expect(res.code).toBe(200);
    res.data.list.forEach(item => {
      const now = new Date();
      const startTime = new Date(item.startTime);
      expect(startTime.getTime()).toBeGreaterThan(now.getTime());
      expect(item.registeredCount).toBeLessThan(item.maxParticipants);
    });
  });

  test('按状态筛选 - 已满', async () => {
    const res = await api.getActivityList({ status: 'full' });
    expect(res.code).toBe(200);
    res.data.list.forEach(item => {
      expect(item.registeredCount).toBeGreaterThanOrEqual(item.maxParticipants);
    });
  });

  test('按关键词搜索', async () => {
    const res = await api.getActivityList({ keyword: '讲座' });
    expect(res.code).toBe(200);
    res.data.list.forEach(item => {
      const match = item.title.includes('讲座') || item.description.includes('讲座');
      expect(match).toBe(true);
    });
  });

  test('分页功能正常工作', async () => {
    const res = await api.getActivityList({ page: 1, pageSize: 2 });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeLessThanOrEqual(2);
    expect(res.data.page).toBe(1);
    expect(res.data.pageSize).toBe(2);
  });

  test('按时间排序（最近的在前）', async () => {
    const res = await api.getActivityList();
    expect(res.code).toBe(200);
    if (res.data.list.length >= 2) {
      for (let i = 0; i < res.data.list.length - 1; i++) {
        const t1 = new Date(res.data.list[i].startTime).getTime();
        const t2 = new Date(res.data.list[i + 1].startTime).getTime();
        expect(t1).toBeLessThanOrEqual(t2);
      }
    }
  });
});

describe('api.getActivityDetail', () => {
  beforeEach(() => {
    initStorage();
  });

  test('获取活动详情成功', async () => {
    const res = await api.getActivityDetail('activity_001');
    expect(res.code).toBe(200);
    expect(res.data.id).toBe('activity_001');
    expect(res.data).toHaveProperty('title');
    expect(res.data).toHaveProperty('startTime');
    expect(res.data).toHaveProperty('location');
    expect(res.data).toHaveProperty('maxParticipants');
    expect(res.data).toHaveProperty('type');
    expect(res.data).toHaveProperty('description');
  });

  test('浏览量自动+1', async () => {
    const activities = wx.getStorageSync('activities');
    const target = activities.find(a => a.id === 'activity_001');
    const before = target.viewCount;

    await api.getActivityDetail('activity_001');

    const activitiesAfter = wx.getStorageSync('activities');
    const after = activitiesAfter.find(a => a.id === 'activity_001').viewCount;
    expect(after).toBe(before + 1);
  });

  test('包含已报名状态', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);

    const res = await api.getActivityDetail('activity_001');
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('isRegistered');
    expect(typeof res.data.isRegistered).toBe('boolean');
  });

  test('空 ID 返回 400', async () => {
    const res = await api.getActivityDetail('');
    expect(res.code).toBe(400);
  });

  test('活动不存在返回 404', async () => {
    const res = await api.getActivityDetail('not_exist_activity');
    expect(res.code).toBe(404);
  });
});

describe('api.createActivity', () => {
  beforeEach(() => {
    initStorage();
  });

  test('普通用户不能发布活动', async () => {
    wx.setStorageSync('userInfo', { id: 'user_999', nickname: '普通用户', role: 'user' });
    wx.setStorageSync('isLoggedIn', true);

    const res = await api.createActivity({
      title: '测试活动',
      startTime: '2030-01-01 09:00:00',
      endTime: '2030-01-01 11:00:00',
      location: '测试地点',
      maxParticipants: 10,
      type: 'lecture',
      description: '测试描述'
    });
    expect(res.code).toBe(403);
  });

  test('管理员可以发布活动', async () => {
    wx.setStorageSync('userInfo', { id: 'user_001', nickname: '管理员', role: 'admin' });
    wx.setStorageSync('isLoggedIn', true);

    const res = await api.createActivity({
      title: '管理员发布的测试活动',
      startTime: '2030-01-01 09:00:00',
      endTime: '2030-01-01 11:00:00',
      location: '村委会大礼堂',
      maxParticipants: 50,
      type: 'lecture',
      description: '这是管理员发布的活动'
    });
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('id');
  });

  test('认证用户可以发布活动', async () => {
    wx.setStorageSync('userInfo', { id: 'user_001', nickname: '认证用户', role: 'verified' });
    wx.setStorageSync('isLoggedIn', true);

    const res = await api.createActivity({
      title: '认证用户发布的测试活动',
      startTime: '2030-01-02 09:00:00',
      endTime: '2030-01-02 11:00:00',
      location: '文化活动中心',
      maxParticipants: 30,
      type: 'craft',
      description: '这是认证用户发布的活动'
    });
    expect(res.code).toBe(200);
  });

  test('未登录不能发布活动', async () => {
    wx.setStorageSync('isLoggedIn', false);

    const res = await api.createActivity({
      title: '测试活动',
      startTime: '2030-01-01 09:00:00',
      endTime: '2030-01-01 11:00:00',
      location: '测试地点',
      maxParticipants: 10,
      type: 'lecture',
      description: '测试描述'
    });
    expect(res.code).toBe(401);
  });

  test('缺少必填字段返回 400', async () => {
    wx.setStorageSync('userInfo', { id: 'user_001', nickname: '管理员', role: 'admin' });
    wx.setStorageSync('isLoggedIn', true);

    const res = await api.createActivity({
      title: '',
      startTime: '',
      endTime: '',
      location: '',
      maxParticipants: 0,
      type: '',
      description: ''
    });
    expect(res.code).toBe(400);
  });
});

describe('api.registerActivity', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('报名活动成功', async () => {
    const res = await api.registerActivity('activity_001');
    expect(res.code).toBe(200);
    expect(res.data.isRegistered).toBe(true);
    expect(res.data.registeredCount).toBeGreaterThan(0);
  });

  test('已报名不能重复报名', async () => {
    await api.registerActivity('activity_001');
    const res = await api.registerActivity('activity_001');
    expect(res.code).toBe(400);
    expect(res.message).toContain('已报名');
  });

  test('已满活动不能报名', async () => {
    const res = await api.registerActivity('activity_002');
    expect(res.code).toBe(400);
    expect(res.message).toContain('已满');
  });

  test('未登录不能报名', async () => {
    wx.setStorageSync('isLoggedIn', false);

    const res = await api.registerActivity('activity_001');
    expect(res.code).toBe(401);
  });

  test('空 ID 返回 400', async () => {
    const res = await api.registerActivity('');
    expect(res.code).toBe(400);
  });

  test('报名后已报名人数+1', async () => {
    const before = (await api.getActivityDetail('activity_001')).data.registeredCount;
    await api.registerActivity('activity_001');
    const after = (await api.getActivityDetail('activity_001')).data.registeredCount;
    expect(after).toBe(before + 1);
  });
});

describe('api.cancelRegistration', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('活动开始前超过24小时可以取消', async () => {
    await api.registerActivity('activity_001');
    const res = await api.cancelRegistration('activity_001');
    expect(res.code).toBe(200);
    expect(res.data.isRegistered).toBe(false);
  });

  test('未报名不能取消', async () => {
    const res = await api.cancelRegistration('activity_001');
    expect(res.code).toBe(400);
    expect(res.message).toContain('未报名');
  });

  test('取消后已报名人数-1', async () => {
    await api.registerActivity('activity_001');
    const before = (await api.getActivityDetail('activity_001')).data.registeredCount;
    await api.cancelRegistration('activity_001');
    const after = (await api.getActivityDetail('activity_001')).data.registeredCount;
    expect(after).toBe(before - 1);
  });

  test('未登录不能取消报名', async () => {
    wx.setStorageSync('isLoggedIn', false);

    const res = await api.cancelRegistration('activity_001');
    expect(res.code).toBe(401);
  });

  test('空 ID 返回 400', async () => {
    const res = await api.cancelRegistration('');
    expect(res.code).toBe(400);
  });
});

describe('api.getMyActivities', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('未登录返回 401', async () => {
    wx.setStorageSync('isLoggedIn', false);

    const res = await api.getMyActivities();
    expect(res.code).toBe(401);
  });

  test('未报名时返回空列表', async () => {
    const res = await api.getMyActivities();
    expect(res.code).toBe(200);
    expect(res.data.list).toEqual([]);
    expect(res.data.total).toBe(0);
  });

  test('返回已报名的活动列表', async () => {
    const registrations = wx.getStorageSync('activityRegistrations') || {};
    registrations['user_001'] = [
      { id: 'reg_test1', activityId: 'activity_001', activityTitle: '传统刺绣技艺体验课', registerTime: '2024-12-20 10:00:00' },
      { id: 'reg_test2', activityId: 'activity_003', activityTitle: '二十四节气文化讲座', registerTime: '2024-12-15 10:00:00' }
    ];
    wx.setStorageSync('activityRegistrations', registrations);

    const res = await api.getMyActivities();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBe(2);
    expect(res.data.total).toBe(2);
  });
});

describe('api.checkActivityRegistration', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('未报名时返回 false', async () => {
    const res = await api.checkActivityRegistration('activity_001');
    expect(res.code).toBe(200);
    expect(res.data.isRegistered).toBe(false);
  });

  test('已报名时返回 true', async () => {
    await api.registerActivity('activity_001');
    const res = await api.checkActivityRegistration('activity_001');
    expect(res.code).toBe(200);
    expect(res.data.isRegistered).toBe(true);
  });

  test('空 ID 返回 400', async () => {
    const res = await api.checkActivityRegistration('');
    expect(res.code).toBe(400);
  });
});

describe('api.getMyPublishedActivities', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('未登录返回 401', async () => {
    wx.setStorageSync('isLoggedIn', false);

    const res = await api.getMyPublishedActivities();
    expect(res.code).toBe(401);
  });

  test('返回我发布的活动列表', async () => {
    const res = await api.getMyPublishedActivities();
    expect(res.code).toBe(200);
    expect(Array.isArray(res.data.list)).toBe(true);
    res.data.list.forEach(item => {
      expect(item.authorId).toBe('user_001');
    });
  });
});

describe('api.linkReviewArticle', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('关联回顾文章成功', async () => {
    const res = await api.linkReviewArticle('activity_003', 'article_002');
    expect(res.code).toBe(200);
    expect(res.data.reviewArticleIds).toContain('article_002');
  });

  test('非发布者不能关联文章', async () => {
    wx.setStorageSync('userInfo', { id: 'user_999', nickname: '其他用户' });
    wx.setStorageSync('isLoggedIn', true);

    const res = await api.linkReviewArticle('activity_003', 'article_002');
    expect(res.code).toBe(403);
  });

  test('未结束的活动不能关联文章', async () => {
    const res = await api.linkReviewArticle('activity_001', 'article_002');
    expect(res.code).toBe(400);
    expect(res.message).toContain('活动结束后');
  });

  test('重复关联同篇文章不会重复添加', async () => {
    await api.linkReviewArticle('activity_003', 'article_002');
    await api.linkReviewArticle('activity_003', 'article_002');
    const detail = await api.getActivityDetail('activity_003');
    const count = detail.data.reviewArticleIds.filter(id => id === 'article_002').length;
    expect(count).toBe(1);
  });

  test('空参数返回 400', async () => {
    const res = await api.linkReviewArticle('', '');
    expect(res.code).toBe(400);
  });
});

describe('api.unlinkReviewArticle', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('取消关联回顾文章成功', async () => {
    const res = await api.unlinkReviewArticle('activity_003', 'article_005');
    expect(res.code).toBe(200);
    expect(res.data.reviewArticleIds).not.toContain('article_005');
  });

  test('非发布者不能取消关联', async () => {
    wx.setStorageSync('userInfo', { id: 'user_999', nickname: '其他用户' });
    wx.setStorageSync('isLoggedIn', true);

    const res = await api.unlinkReviewArticle('activity_003', 'article_005');
    expect(res.code).toBe(403);
  });

  test('空参数返回 400', async () => {
    const res = await api.unlinkReviewArticle('', '');
    expect(res.code).toBe(400);
  });
});

describe('api.getQuizCategories / getQuizDifficulties', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('获取分类列表', async () => {
    const res = await api.getQuizCategories();
    expect(res.code).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0]).toHaveProperty('id');
    expect(res.data[0]).toHaveProperty('name');
    expect(res.data[0]).toHaveProperty('icon');
  });

  test('获取难度列表', async () => {
    const res = await api.getQuizDifficulties();
    expect(res.code).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0]).toHaveProperty('id');
    expect(res.data[0]).toHaveProperty('name');
    expect(res.data[0]).toHaveProperty('score');
  });
});

describe('api.getQuizList / getQuizDetail', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('获取全部题库列表', async () => {
    const res = await api.getQuizList({});
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.total).toBeGreaterThan(0);
  });

  test('按分类筛选题库', async () => {
    const res = await api.getQuizList({ category: 'folklore' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(q => q.category === 'folklore')).toBe(true);
  });

  test('按难度筛选题库', async () => {
    const res = await api.getQuizList({ difficulty: 'easy' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(q => q.difficulty === 'easy')).toBe(true);
  });

  test('分页功能正常', async () => {
    const res = await api.getQuizList({ page: 1, pageSize: 5 });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBe(5);
    expect(res.data.hasMore).toBe(true);
  });

  test('获取题目详情包含分类和难度信息', async () => {
    const res = await api.getQuizDetail('quiz_001');
    expect(res.code).toBe(200);
    expect(res.data.id).toBe('quiz_001');
    expect(res.data).toHaveProperty('categoryInfo');
    expect(res.data).toHaveProperty('difficultyInfo');
  });

  test('获取题目详情包含相关文章', async () => {
    const res = await api.getQuizDetail('quiz_001');
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('relatedArticles');
  });

  test('不存在的题目ID返回404', async () => {
    const res = await api.getQuizDetail('quiz_notexist');
    expect(res.code).toBe(404);
  });
});

describe('api.getDailyQuiz / submitDailyQuiz', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
    const today = new Date().toISOString().split('T')[0];
    wx.removeStorageSync('dailyQuiz_' + today);
  });

  test('获取每日一题', async () => {
    const res = await api.getDailyQuiz();
    expect(res.code).toBe(200);
    expect(res.data.quiz).toHaveProperty('id');
    expect(res.data.quiz).toHaveProperty('question');
    expect(res.data.quiz).toHaveProperty('categoryInfo');
    expect(res.data.dailyInfo).toBeDefined();
  });

  test('每日一题同日内相同', async () => {
    const r1 = await api.getDailyQuiz();
    const r2 = await api.getDailyQuiz();
    expect(r1.data.quiz.id).toBe(r2.data.quiz.id);
  });

  test('提交每日一题-答对', async () => {
    const daily = await api.getDailyQuiz();
    const quiz = daily.data.quiz;
    const res = await api.submitDailyQuiz(quiz.answer);
    expect(res.code).toBe(200);
    expect(res.data.isCorrect).toBe(true);
  });

  test('提交每日一题-答错', async () => {
    const daily = await api.getDailyQuiz();
    const wrongAnswer = (daily.data.quiz.answer + 1) % 4;
    const res = await api.submitDailyQuiz(wrongAnswer);
    expect(res.code).toBe(200);
    expect(res.data.isCorrect).toBe(false);
  });

  test('重复提交每日一题返回400', async () => {
    const daily = await api.getDailyQuiz();
    await api.submitDailyQuiz(daily.data.quiz.answer);
    const res = await api.submitDailyQuiz(daily.data.quiz.answer);
    expect(res.code).toBe(400);
    expect(res.message).toContain('已作答');
  });

  test('答错后自动加入错题本', async () => {
    const daily = await api.getDailyQuiz();
    const wrongAnswer = (daily.data.quiz.answer + 1) % 4;
    await api.submitDailyQuiz(wrongAnswer);
    const wrong = wx.getStorageSync('wrongQuizzes') || {};
    const userWrong = wrong[defaultUser.id] || {};
    expect(userWrong[daily.data.quiz.id]).toBeDefined();
    expect(userWrong[daily.data.quiz.id].wrongCount).toBeGreaterThanOrEqual(1);
  });

  test('提交后成绩统计更新', async () => {
    const daily = await api.getDailyQuiz();
    await api.submitDailyQuiz(daily.data.quiz.answer);
    const stats = wx.getStorageSync('quizStats') || {};
    const userStats = stats[defaultUser.id];
    expect(userStats).toBeDefined();
    expect(userStats.totalQuestions).toBeGreaterThanOrEqual(1);
  });

  test('提交后连续打卡天数计算', async () => {
    const daily = await api.getDailyQuiz();
    await api.submitDailyQuiz(daily.data.quiz.answer);
    const stats = wx.getStorageSync('quizStats') || {};
    const userStats = stats[defaultUser.id];
    expect(userStats.streakDays).toBeGreaterThanOrEqual(1);
  });
});

describe('api.getChallengeQuiz / submitChallengeQuiz', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('获取分类挑战题目-综合', async () => {
    const res = await api.getChallengeQuiz('all');
    expect(res.code).toBe(200);
    expect(res.data.sessionId).toBeDefined();
    expect(res.data.questions.length).toBe(10);
    expect(res.data.totalCount).toBe(10);
  });

  test('获取分类挑战题目-指定分类', async () => {
    const res = await api.getChallengeQuiz('folklore');
    expect(res.code).toBe(200);
    expect(res.data.questions.length).toBeGreaterThan(0);
    expect(res.data.questions.every(q => q.category === 'folklore')).toBe(true);
  });

  test('提交挑战答卷', async () => {
    const start = await api.getChallengeQuiz('all');
    const sessionId = start.data.sessionId;
    const answers = start.data.questions.map(q => q.answer);
    const res = await api.submitChallengeQuiz(sessionId, answers);
    expect(res.code).toBe(200);
    expect(res.data.totalQuestions).toBe(10);
    expect(res.data.correctCount).toBe(10);
    expect(res.data.accuracy).toBe(100);
  });

  test('提交无效sessionId返回404', async () => {
    const res = await api.submitChallengeQuiz('invalid_session', [0, 1, 2]);
    expect(res.code).toBe(404);
  });

  test('提交后生成详细results', async () => {
    const start = await api.getChallengeQuiz('all');
    const answers = start.data.questions.map(q => q.answer);
    const res = await api.submitChallengeQuiz(start.data.sessionId, answers);
    expect(res.data.results.length).toBe(10);
    res.data.results.forEach(r => {
      expect(r).toHaveProperty('quizId');
      expect(r).toHaveProperty('isCorrect');
      expect(r).toHaveProperty('score');
      expect(r).toHaveProperty('analysis');
    });
  });

  test('提交后排行榜积分更新', async () => {
    const start = await api.getChallengeQuiz('all');
    const answers = start.data.questions.map(q => q.answer);
    await api.submitChallengeQuiz(start.data.sessionId, answers);
    const scores = wx.getStorageSync('quizScores') || {};
    expect(scores[defaultUser.id]).toBeDefined();
    expect(scores[defaultUser.id].totalScore).toBeGreaterThan(0);
  });
});

describe('api.getTimedQuiz / submitTimedQuiz', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('获取限时答题', async () => {
    const res = await api.getTimedQuiz(60);
    expect(res.code).toBe(200);
    expect(res.data.sessionId).toBeDefined();
    expect(res.data.duration).toBe(60);
    expect(res.data.questions.length).toBeGreaterThan(0);
    expect(res.data.endTime).toBeDefined();
  });

  test('提交限时答题', async () => {
    const start = await api.getTimedQuiz(60);
    const answers = start.data.questions.map(q => q.answer);
    const res = await api.submitTimedQuiz(start.data.sessionId, answers);
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('timeUsed');
    expect(res.data).toHaveProperty('timeBonus');
  });

  test('提交过期session返回400', async () => {
    const start = await api.getTimedQuiz(60);
    const session = wx.getStorageSync('timedSessions') || {};
    if (session[start.data.sessionId]) {
      session[start.data.sessionId].endTime = Date.now() - 100000;
      wx.setStorageSync('timedSessions', session);
    }
    const answers = start.data.questions.map(q => q.answer);
    const res = await api.submitTimedQuiz(start.data.sessionId, answers);
    expect(res.code).toBe(400);
  });
});

describe('api.getQuizStats', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('未答题时返回默认统计', async () => {
    const res = await api.getQuizStats();
    expect(res.code).toBe(200);
    expect(res.data.totalAnswers).toBe(0);
    expect(res.data.accuracy).toBe(0);
    expect(res.data.streakDays).toBe(0);
  });

  test('答题后统计正确', async () => {
    const start = await api.getChallengeQuiz('all');
    const answers = start.data.questions.map((q, i) => i % 2 === 0 ? q.answer : (q.answer + 1) % 4);
    await api.submitChallengeQuiz(start.data.sessionId, answers);
    const res = await api.getQuizStats();
    expect(res.code).toBe(200);
    expect(res.data.totalAnswers).toBe(10);
    expect(res.data.correctCount).toBe(5);
    expect(res.data.accuracy).toBe(50);
    expect(res.data.totalScore).toBeGreaterThan(0);
  });

  test('统计包含各分类得分', async () => {
    const start = await api.getChallengeQuiz('all');
    const answers = start.data.questions.map(q => q.answer);
    await api.submitChallengeQuiz(start.data.sessionId, answers);
    const res = await api.getQuizStats();
    expect(res.data.categoryDetails).toBeDefined();
    expect(Array.isArray(res.data.categoryDetails)).toBe(true);
  });
});

describe('api.getQuizRankings', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('获取周榜', async () => {
    const res = await api.getQuizRankings('weekly');
    expect(res.code).toBe(200);
    expect(Array.isArray(res.data.list)).toBe(true);
    expect(res.data.myRank).toBeDefined();
  });

  test('获取总榜', async () => {
    const res = await api.getQuizRankings('total');
    expect(res.code).toBe(200);
    expect(Array.isArray(res.data.list)).toBe(true);
  });

  test('多用户排序正确', async () => {
    const users = [
      { id: 'u1', name: '用户1' },
      { id: 'u2', name: '用户2' },
      { id: 'u3', name: '用户3' }
    ];
    const expectedOrder = [200, 150, 100];
    const scores = {};
    users.forEach((u, i) => {
      scores[u.id] = {
        userId: u.id,
        nickname: u.name,
        totalScore: expectedOrder[i],
        weeklyScore: expectedOrder[i],
        history: [{ date: new Date().toISOString().split('T')[0], score: expectedOrder[i] }]
      };
    });
    wx.setStorageSync('quizScores', scores);
    const res = await api.getQuizRankings('total');
    expect(res.data.list[0].score).toBe(200);
    expect(res.data.list[1].score).toBe(150);
    expect(res.data.list[2].score).toBe(100);
  });
});

describe('api错题本功能', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('答错题目自动加入错题本', async () => {
    const daily = await api.getDailyQuiz();
    const wrong = (daily.data.answer + 1) % 4;
    await api.submitDailyQuiz(wrong);
    const list = await api.getWrongQuizList({});
    expect(list.data.total).toBeGreaterThan(0);
    expect(list.data.list.length).toBeGreaterThan(0);
  });

  test('标记错题已复习', async () => {
    const daily = await api.getDailyQuiz();
    const wrong = (daily.data.answer + 1) % 4;
    await api.submitDailyQuiz(wrong);
    const listRes = await api.getWrongQuizList({});
    const firstId = listRes.data.list[0].id;
    const res = await api.markWrongQuizReviewed(firstId);
    expect(res.code).toBe(200);
    expect(res.data.isReviewed).toBe(true);
  });

  test('移除错题', async () => {
    const daily = await api.getDailyQuiz();
    const wrong = (daily.data.answer + 1) % 4;
    await api.submitDailyQuiz(wrong);
    const listRes = await api.getWrongQuizList({});
    const firstId = listRes.data.list[0].id;
    const beforeTotal = listRes.data.total;
    const res = await api.removeWrongQuiz(firstId);
    expect(res.code).toBe(200);
    const after = await api.getWrongQuizList({});
    expect(after.data.total).toBe(beforeTotal - 1);
  });

  test('错题本筛选全部/未复习/已复习', async () => {
    const quizzes = wx.getStorageSync('quizzes');
    const wrong1 = { ...quizzes[0] };
    const wrong2 = { ...quizzes[1] };
    wx.setStorageSync('wrongQuizzes', {
      [defaultUser.id]: {
        [wrong1.id]: { quizId: wrong1.id, quiz: wrong1, userAnswer: 0, wrongCount: 2, reviewed: false, firstWrongTime: '2024-01-01', lastWrongTime: '2024-01-02' },
        [wrong2.id]: { quizId: wrong2.id, quiz: wrong2, userAnswer: 0, wrongCount: 1, reviewed: true, firstWrongTime: '2024-01-01', lastWrongTime: '2024-01-01' }
      }
    });

    const all = await api.getWrongQuizList({});
    expect(all.data.total).toBe(2);

    const unreviewed = await api.getWrongQuizList({ reviewed: 'no' });
    expect(unreviewed.data.total).toBe(1);

    const reviewed = await api.getWrongQuizList({ reviewed: 'yes' });
    expect(reviewed.data.total).toBe(1);
  });

  test('获取智能复习推荐', async () => {
    const quizzes = wx.getStorageSync('quizzes');
    const records = {};
    quizzes.slice(0, 5).forEach((q, i) => {
      records[q.id] = {
        quizId: q.id,
        quiz: q,
        userAnswer: (q.answer + 1) % 4,
        wrongCount: 5 - i,
        isReviewed: false,
        firstWrongTime: '2024-01-01',
        lastWrongTime: '2024-01-02'
      };
    });
    wx.setStorageSync('wrongQuizzes', { [defaultUser.id]: records });
    const res = await api.getWrongQuizForReview();
    expect(res.code).toBe(200);
    expect(res.data.quizzes.length).toBeLessThanOrEqual(10);
  });
});

describe('api 日历功能', () => {
  beforeEach(() => {
    initStorage();
  });

  describe('getCalendarEvents', () => {
    test('获取当月节气节日事件', async () => {
      const res = await api.getCalendarEvents({ year: 2025, month: 1 });
      expect(res.code).toBe(200);
      expect(res.data).toBeTruthy();
    });

    test('缺少参数返回400', async () => {
      const res = await api.getCalendarEvents({});
      expect(res.code).toBe(400);
    });
  });

  describe('getCalendarDateDetail', () => {
    test('获取节气日期详情', async () => {
      const res = await api.getCalendarDateDetail({ year: 2025, month: 1, day: 5 });
      expect(res.code).toBe(200);
      expect(res.data.events.length).toBeGreaterThan(0);
      expect(res.data.events[0].name).toBe('小寒');
    });

    test('无事件日期返回空数组', async () => {
      const res = await api.getCalendarDateDetail({ year: 2025, month: 3, day: 15 });
      expect(res.code).toBe(200);
      expect(res.data.events).toEqual([]);
    });

    test('缺少参数返回400', async () => {
      const res = await api.getCalendarDateDetail({});
      expect(res.code).toBe(400);
    });
  });

  describe('subscribeCalendarEvent / unsubscribeCalendarEvent', () => {
    test('订阅节气节日', async () => {
      wx.setStorageSync('userInfo', defaultUser);
      wx.setStorageSync('isLoggedIn', true);
      const res = await api.subscribeCalendarEvent('lichun');
      expect(res.code).toBe(200);
      expect(res.data.isSubscribed).toBe(true);
    });

    test('未登录时订阅返回401', async () => {
      const res = await api.subscribeCalendarEvent('lichun');
      expect(res.code).toBe(401);
    });

    test('取消订阅', async () => {
      wx.setStorageSync('userInfo', defaultUser);
      wx.setStorageSync('isLoggedIn', true);
      await api.subscribeCalendarEvent('lichun');
      const res = await api.unsubscribeCalendarEvent('lichun');
      expect(res.code).toBe(200);
      expect(res.data.isSubscribed).toBe(false);
    });

    test('缺少事件ID返回400', async () => {
      wx.setStorageSync('userInfo', defaultUser);
      wx.setStorageSync('isLoggedIn', true);
      const res = await api.subscribeCalendarEvent('');
      expect(res.code).toBe(400);
    });
  });

  describe('checkCalendarSubscription', () => {
    test('检查订阅状态', async () => {
      const res = await api.checkCalendarSubscription('lichun');
      expect(res.code).toBe(200);
      expect(res.data.isSubscribed).toBe(false);
    });

    test('订阅后检查返回true', async () => {
      wx.setStorageSync('userInfo', defaultUser);
      wx.setStorageSync('isLoggedIn', true);
      await api.subscribeCalendarEvent('lichun');
      const res = await api.checkCalendarSubscription('lichun');
      expect(res.code).toBe(200);
      expect(res.data.isSubscribed).toBe(true);
    });
  });

  describe('getMyCalendarSubscriptions', () => {
    test('获取我的订阅列表', async () => {
      wx.setStorageSync('userInfo', defaultUser);
      wx.setStorageSync('isLoggedIn', true);
      await api.subscribeCalendarEvent('lichun');
      await api.subscribeCalendarEvent('chunjie');
      const res = await api.getMyCalendarSubscriptions();
      expect(res.code).toBe(200);
      expect(res.data.total).toBe(2);
    });

    test('未登录时返回401', async () => {
      const res = await api.getMyCalendarSubscriptions();
      expect(res.code).toBe(401);
    });
  });
});
