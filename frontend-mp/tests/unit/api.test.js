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

  test('标题为空返回 400', async () => {
    const res = await api.publishArticle({ title: '', content: '内容内容内容', category: 'folklore' });
    expect(res.code).toBe(400);
  });

  test('标题为空白字符串返回 400', async () => {
    const res = await api.publishArticle({ title: '   ', content: '内容内容内容', category: 'folklore' });
    expect(res.code).toBe(400);
  });

  test('内容为空返回 400', async () => {
    const res = await api.publishArticle({ title: '标题', content: '', category: 'folklore' });
    expect(res.code).toBe(400);
  });

  test('分类为空返回 400', async () => {
    const res = await api.publishArticle({ title: '标题', content: '内容内容内容', category: '' });
    expect(res.code).toBe(400);
  });

  test('无用户信息时使用默认用户', async () => {
    wx.removeStorageSync('userInfo');
    const res = await api.publishArticle({
      title: '无用户投稿',
      content: '无用户投稿内容，长度超过十个字符',
      category: 'farming'
    });
    expect(res.code).toBe(200);
    expect(res.data.authorId).toBe('user_001');
  });

  test('标题和内容自动 trim', async () => {
    wx.setStorageSync('userInfo', defaultUser);
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
    const res = await api.getMyArticles();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    res.data.list.forEach(item => {
      expect(item.authorId).toBe('user_001');
    });
  });

  test('用户没有文章时返回空列表', async () => {
    wx.setStorageSync('userInfo', { id: 'user_new', nickname: '新用户' });
    const res = await api.getMyArticles();
    expect(res.code).toBe(200);
    expect(res.data.list).toEqual([]);
    expect(res.data.total).toBe(0);
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
    const res = await api.getUserInfo();
    expect(res.code).toBe(200);
    expect(res.data.id).toBe('user_001');
    expect(res.data.nickname).toBe('测试用户');
  });

  test('未存储用户信息时返回默认用户', async () => {
    wx.removeStorageSync('userInfo');
    const res = await api.getUserInfo();
    expect(res.code).toBe(200);
    expect(res.data.id).toBe('user_001');
  });
});

describe('api.updateUserInfo', () => {
  beforeEach(() => {
    initStorage();
  });

  test('更新用户昵称', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    const res = await api.updateUserInfo({ nickname: '新昵称' });
    expect(res.code).toBe(200);
    expect(res.data.nickname).toBe('新昵称');
    const stored = wx.getStorageSync('userInfo');
    expect(stored.nickname).toBe('新昵称');
  });

  test('昵称少于2个字符返回 400', async () => {
    const res = await api.updateUserInfo({ nickname: '一' });
    expect(res.code).toBe(400);
  });

  test('昵称超过20个字符返回 400', async () => {
    const res = await api.updateUserInfo({ nickname: 'a'.repeat(21) });
    expect(res.code).toBe(400);
  });

  test('昵称在2~20个字符之间更新成功', async () => {
    wx.setStorageSync('userInfo', defaultUser);
    const res = await api.updateUserInfo({ nickname: '合法昵称' });
    expect(res.code).toBe(200);
  });
});

describe('api.getUserStats', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回用户统计数据', async () => {
    wx.setStorageSync('userInfo', { id: 'user_001', nickname: '张大爷' });
    const res = await api.getUserStats();
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('articleCount');
    expect(res.data).toHaveProperty('likeCount');
    expect(res.data).toHaveProperty('viewCount');
  });

  test('统计数据计算正确', async () => {
    wx.setStorageSync('userInfo', { id: 'user_001', nickname: '张大爷' });
    const res = await api.getUserStats();
    const articles = wx.getStorageSync('articles').filter(a => a.authorId === 'user_001');
    expect(res.data.articleCount).toBe(articles.length);
    const expectedLikes = articles.reduce((sum, a) => sum + (a.likeCount || 0), 0);
    const expectedViews = articles.reduce((sum, a) => sum + (a.viewCount || 0), 0);
    expect(res.data.likeCount).toBe(expectedLikes);
    expect(res.data.viewCount).toBe(expectedViews);
  });
});

describe('api.likeArticle / unlikeArticle', () => {
  beforeEach(() => {
    initStorage();
  });

  test('点赞文章增加 likeCount', async () => {
    const before = wx.getStorageSync('articles').find(a => a.id === 'article_001');
    const likeBefore = before.likeCount;

    const res = await api.likeArticle('article_001');
    expect(res.code).toBe(200);
    expect(res.data.likeCount).toBe(likeBefore + 1);

    const after = wx.getStorageSync('articles').find(a => a.id === 'article_001');
    expect(after.likeCount).toBe(likeBefore + 1);
  });

  test('取消点赞减少 likeCount', async () => {
    const before = wx.getStorageSync('articles').find(a => a.id === 'article_001');
    const likeBefore = before.likeCount;

    await api.likeArticle('article_001');
    const afterLike = wx.getStorageSync('articles').find(a => a.id === 'article_001');
    expect(afterLike.likeCount).toBe(likeBefore + 1);

    await api.unlikeArticle('article_001');
    const afterUnlike = wx.getStorageSync('articles').find(a => a.id === 'article_001');
    expect(afterUnlike.likeCount).toBe(likeBefore);
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
});

describe('api.favoriteArticle / unfavoriteArticle / checkFavorite', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
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
    await api.favoriteArticle('article_001');

    wx.setStorageSync('userInfo', { id: 'user_002', nickname: '另一个用户' });
    const res = await api.checkFavorite('article_001');
    expect(res.data.isFavorite).toBe(false);
  });
});

describe('api.getFavoriteList', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
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
