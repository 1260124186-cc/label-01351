var {
  DIFFICULTY_LEVELS,
  CRAFT_CATEGORIES,
  TOOL_LIST,
  TIME_RANGES,
  DEFAULT_TUTORIALS,
  getDifficultyInfo,
  getCategoryInfo,
  getCategoryList,
  getDifficultyList,
  getTimeRangeInfo,
  formatTimeRequired,
  filterTutorials,
  getDefaultTutorials,
  convertArticleToTutorial
} = require('../../utils/craft-tutorial-data');

describe('工艺教程数据模块', function() {
  test('DIFFICULTY_LEVELS 包含三个难度', function() {
    expect(DIFFICULTY_LEVELS).toBeDefined();
    expect(Array.isArray(DIFFICULTY_LEVELS)).toBe(true);
    expect(DIFFICULTY_LEVELS.length).toBe(3);
  });

  test('三个难度分别为入门、进阶、精通', function() {
    var ids = DIFFICULTY_LEVELS.map(function(d) { return d.id; });
    expect(ids).toContain('beginner');
    expect(ids).toContain('intermediate');
    expect(ids).toContain('advanced');
  });

  test('每个难度结构完整', function() {
    DIFFICULTY_LEVELS.forEach(function(d) {
      expect(d).toHaveProperty('id');
      expect(d).toHaveProperty('name');
      expect(d).toHaveProperty('icon');
      expect(d).toHaveProperty('desc');
    });
  });

  test('CRAFT_CATEGORIES 包含十个工艺分类', function() {
    expect(CRAFT_CATEGORIES).toBeDefined();
    expect(Array.isArray(CRAFT_CATEGORIES)).toBe(true);
    expect(CRAFT_CATEGORIES.length).toBe(10);
  });

  test('每个分类结构完整', function() {
    CRAFT_CATEGORIES.forEach(function(c) {
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('name');
      expect(c).toHaveProperty('icon');
      expect(c).toHaveProperty('desc');
    });
  });

  test('TOOL_LIST 包含常用工具', function() {
    expect(TOOL_LIST).toBeDefined();
    expect(Array.isArray(TOOL_LIST)).toBe(true);
    expect(TOOL_LIST.length).toBeGreaterThan(10);
  });

  test('TIME_RANGES 包含5个时间范围', function() {
    expect(TIME_RANGES).toBeDefined();
    expect(Array.isArray(TIME_RANGES)).toBe(true);
    expect(TIME_RANGES.length).toBe(5);
  });

  test('DEFAULT_TUTORIALS 包含4篇默认教程', function() {
    expect(DEFAULT_TUTORIALS).toBeDefined();
    expect(Array.isArray(DEFAULT_TUTORIALS)).toBe(true);
    expect(DEFAULT_TUTORIALS.length).toBe(4);
  });

  test('每篇教程包含完整字段', function() {
    DEFAULT_TUTORIALS.forEach(function(item) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('difficulty');
      expect(item).toHaveProperty('timeRequired');
      expect(item).toHaveProperty('tools');
      expect(item).toHaveProperty('summary');
      expect(item).toHaveProperty('introduction');
      expect(item).toHaveProperty('materials');
      expect(item).toHaveProperty('steps');
      expect(item).toHaveProperty('commonMistakes');
      expect(item).toHaveProperty('furtherReading');
      expect(item).toHaveProperty('relatedFigureId');
      expect(item).toHaveProperty('relatedLandmarkId');
      expect(item).toHaveProperty('relatedEncyclopediaId');
      expect(item).toHaveProperty('tags');
      expect(item).toHaveProperty('viewCount');
      expect(item).toHaveProperty('likeCount');
      expect(item).toHaveProperty('checkInCount');
      expect(item).toHaveProperty('authorId');
      expect(item).toHaveProperty('createTime');
      expect(item).toHaveProperty('status');
    });
  });

  test('每篇教程步骤结构完整', function() {
    DEFAULT_TUTORIALS.forEach(function(item) {
      expect(Array.isArray(item.steps)).toBe(true);
      expect(item.steps.length).toBeGreaterThan(0);
      item.steps.forEach(function(step) {
        expect(step).toHaveProperty('step');
        expect(step).toHaveProperty('title');
        expect(step).toHaveProperty('keyPoint');
        expect(step).toHaveProperty('caution');
        expect(typeof step.step).toBe('number');
      });
    });
  });

  test('每篇教程材料清单结构完整', function() {
    DEFAULT_TUTORIALS.forEach(function(item) {
      expect(Array.isArray(item.materials)).toBe(true);
      expect(item.materials.length).toBeGreaterThan(0);
      item.materials.forEach(function(m) {
        expect(m).toHaveProperty('name');
        expect(m).toHaveProperty('quantity');
      });
    });
  });

  test('每篇教程常见误区结构完整', function() {
    DEFAULT_TUTORIALS.forEach(function(item) {
      expect(Array.isArray(item.commonMistakes)).toBe(true);
      item.commonMistakes.forEach(function(m) {
        expect(m).toHaveProperty('title');
        expect(m).toHaveProperty('desc');
      });
    });
  });
});

describe('getDifficultyInfo', function() {
  test('根据ID查找难度', function() {
    var info = getDifficultyInfo('beginner');
    expect(info).not.toBeNull();
    expect(info.name).toBe('入门');
  });

  test('找不到时返回null', function() {
    expect(getDifficultyInfo('nonexistent')).toBeNull();
  });
});

describe('getCategoryInfo', function() {
  test('根据ID查找分类', function() {
    var info = getCategoryInfo('weaving');
    expect(info).not.toBeNull();
    expect(info.name).toBe('编织');
  });

  test('找不到时返回null', function() {
    expect(getCategoryInfo('nonexistent')).toBeNull();
  });
});

describe('getCategoryList', function() {
  test('返回分类列表', function() {
    var list = getCategoryList();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(10);
    list.forEach(function(c) {
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('name');
      expect(c).toHaveProperty('icon');
    });
  });
});

describe('getDifficultyList', function() {
  test('返回难度列表', function() {
    var list = getDifficultyList();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(3);
  });
});

describe('getTimeRangeInfo', function() {
  test('根据ID查找时间范围', function() {
    var info = getTimeRangeInfo('lt1h');
    expect(info).not.toBeNull();
    expect(info.name).toBe('1小时以内');
  });

  test('找不到时返回null', function() {
    expect(getTimeRangeInfo('nonexistent')).toBeNull();
  });
});

describe('formatTimeRequired', function() {
  test('0分钟返回空', function() {
    expect(formatTimeRequired(0)).toBe('');
  });

  test('30分钟', function() {
    expect(formatTimeRequired(30)).toBe('30分钟');
  });

  test('3小时', function() {
    expect(formatTimeRequired(180)).toBe('3小时');
  });

  test('1小时30分钟', function() {
    expect(formatTimeRequired(90)).toBe('1小时30分钟');
  });

  test('1天', function() {
    expect(formatTimeRequired(1440)).toBe('1天');
  });

  test('2天3小时', function() {
    expect(formatTimeRequired(3060)).toBe('2天3小时');
  });
});

describe('filterTutorials', function() {
  var tutorials;

  beforeEach(function() {
    tutorials = getDefaultTutorials();
  });

  test('按分类筛选', function() {
    var result = filterTutorials(tutorials, { category: 'weaving' });
    expect(result.length).toBe(1);
    expect(result[0].category).toBe('weaving');
  });

  test('按难度筛选', function() {
    var result = filterTutorials(tutorials, { difficulty: 'beginner' });
    result.forEach(function(t) {
      expect(t.difficulty).toBe('beginner');
    });
  });

  test('按关键词筛选', function() {
    var result = filterTutorials(tutorials, { keyword: '竹编' });
    expect(result.length).toBe(1);
    expect(result[0].title).toContain('竹编');
  });

  test('全部筛选条件', function() {
    var result = filterTutorials(tutorials, { category: 'all', difficulty: 'all', keyword: '' });
    expect(result.length).toBe(tutorials.length);
  });
});

describe('getDefaultTutorials', function() {
  test('返回深拷贝数据', function() {
    var data1 = getDefaultTutorials();
    var data2 = getDefaultTutorials();
    expect(data1).toEqual(data2);
    expect(data1).not.toBe(data2);
  });
});

describe('convertArticleToTutorial', function() {
  test('从文章对象转换教程模板', function() {
    var article = {
      id: 'article_001',
      title: '传统竹编技艺',
      summary: '竹编是中国古老的编织工艺',
      content: '竹编有着数千年的历史，是中国最重要的传统手工艺之一...',
      tags: ['竹编', '传统工艺'],
      figureId: 'figure_001'
    };
    var template = convertArticleToTutorial(article);
    expect(template.title).toBe('传统竹编技艺');
    expect(template.summary).toBe('竹编是中国古老的编织工艺');
    expect(template.category).toBe('');
    expect(template.difficulty).toBe('beginner');
    expect(template.tags).toEqual(['竹编', '传统工艺']);
    expect(template.relatedFigureId).toBe('figure_001');
    expect(template.sourceArticleId).toBe('article_001');
    expect(template.steps).toEqual([]);
    expect(template.materials).toEqual([]);
    expect(template.commonMistakes).toEqual([]);
  });
});

describe('工艺教程API接口', function() {
  var api = require('../../utils/api');

  beforeEach(function() {
    wx._resetStorage();
    var data = require('../../utils/craft-tutorial-data');
    data.initCraftTutorialData();
    wx.setStorageSync('userInfo', { id: 'test_user', nickname: '测试用户', role: 'admin' });
    wx.setStorageSync('isLoggedIn', true);
  });

  test('getCraftTutorialCategories 返回分类列表', async function() {
    var res = await api.getCraftTutorialCategories();
    expect(res.code).toBe(200);
    expect(res.data.length).toBe(10);
  });

  test('getCraftTutorialDifficulties 返回难度列表', async function() {
    var res = await api.getCraftTutorialDifficulties();
    expect(res.code).toBe(200);
    expect(res.data.length).toBe(3);
  });

  test('getCraftTutorialList 返回教程列表', async function() {
    var res = await api.getCraftTutorialList({});
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.total).toBe(4);
  });

  test('getCraftTutorialList 按分类筛选', async function() {
    var res = await api.getCraftTutorialList({ category: 'weaving' });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBe(1);
    expect(res.data.list[0].category).toBe('weaving');
  });

  test('getCraftTutorialList 按难度筛选', async function() {
    var res = await api.getCraftTutorialList({ difficulty: 'intermediate' });
    expect(res.code).toBe(200);
    res.data.list.forEach(function(item) {
      expect(item.difficulty).toBe('intermediate');
    });
  });

  test('getCraftTutorialList 按关键词筛选', async function() {
    var res = await api.getCraftTutorialList({ keyword: '竹编' });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBe(1);
  });

  test('getCraftTutorialDetail 返回教程详情', async function() {
    var res = await api.getCraftTutorialDetail('tut_weaving_001');
    expect(res.code).toBe(200);
    expect(res.data.title).toBe('竹编果篮制作教程');
    expect(res.data.introduction).toBeDefined();
    expect(res.data.materials).toBeDefined();
    expect(res.data.steps).toBeDefined();
    expect(res.data.commonMistakes).toBeDefined();
    expect(res.data.furtherReading).toBeDefined();
    expect(res.data.hasCheckedIn).toBe(false);
    expect(res.data.reviews).toBeDefined();
  });

  test('getCraftTutorialDetail 增加浏览量', async function() {
    var before = await api.getCraftTutorialDetail('tut_weaving_001');
    var after = await api.getCraftTutorialDetail('tut_weaving_001');
    expect(after.data.viewCount).toBe(before.data.viewCount + 1);
  });

  test('getCraftTutorialDetail 不存在时返回404', async function() {
    var res = await api.getCraftTutorialDetail('nonexistent');
    expect(res.code).toBe(404);
  });

  test('createCraftTutorial 创建教程', async function() {
    var data = {
      title: '测试教程',
      category: 'weaving',
      difficulty: 'beginner',
      timeRequired: 60,
      tools: ['竹篾'],
      summary: '这是一个测试教程',
      introduction: '详细介绍内容...',
      steps: [{ title: '步骤1', keyPoint: '要点', caution: '注意' }],
      tags: ['测试']
    };
    var res = await api.createCraftTutorial(data);
    expect(res.code).toBe(200);
    expect(res.data.title).toBe('测试教程');
    expect(res.data.steps.length).toBe(1);
  });

  test('createCraftTutorial 非管理员禁止创建', async function() {
    wx.setStorageSync('userInfo', { id: 'test_user', nickname: '普通用户', role: 'user' });
    var res = await api.createCraftTutorial({ title: '测试', category: 'weaving', difficulty: 'beginner', summary: '简介', introduction: '介绍', steps: [{ title: '步骤1' }] });
    expect(res.code).toBe(403);
  });

  test('checkInCraftTutorial 打卡成功', async function() {
    var res = await api.checkInCraftTutorial('tut_weaving_001');
    expect(res.code).toBe(200);
    expect(res.data.hasCheckedIn).toBe(true);
  });

  test('checkInCraftTutorial 重复打卡', async function() {
    await api.checkInCraftTutorial('tut_weaving_001');
    var res = await api.checkInCraftTutorial('tut_weaving_001');
    expect(res.code).toBe(200);
    expect(res.data.hasCheckedIn).toBe(true);
  });

  test('addCraftTutorialReview 发表心得', async function() {
    var res = await api.addCraftTutorialReview('tut_weaving_001', { content: '很实用的教程', rating: 5 });
    expect(res.code).toBe(200);
    expect(res.data.content).toBe('很实用的教程');
  });

  test('addCraftTutorialReview 心得不能为空', async function() {
    var res = await api.addCraftTutorialReview('tut_weaving_001', { content: '' });
    expect(res.code).toBe(400);
  });

  test('addCraftTutorialReview 心得不超过200字', async function() {
    var longContent = 'a'.repeat(201);
    var res = await api.addCraftTutorialReview('tut_weaving_001', { content: longContent });
    expect(res.code).toBe(400);
  });

  test('likeCraftTutorial 点赞', async function() {
    var res = await api.likeCraftTutorial('tut_weaving_001');
    expect(res.code).toBe(200);
    expect(res.data.isLike).toBe(true);
  });

  test('unlikeCraftTutorial 取消点赞', async function() {
    await api.likeCraftTutorial('tut_weaving_001');
    var res = await api.unlikeCraftTutorial('tut_weaving_001');
    expect(res.code).toBe(200);
    expect(res.data.isLike).toBe(false);
  });

  test('checkCraftTutorialLike 检查点赞状态', async function() {
    var before = await api.checkCraftTutorialLike('tut_weaving_001');
    expect(before.data.isLike).toBe(false);

    await api.likeCraftTutorial('tut_weaving_001');
    var after = await api.checkCraftTutorialLike('tut_weaving_001');
    expect(after.data.isLike).toBe(true);
  });

  test('convertArticleToTutorial 赞数不足50不可转换', async function() {
    wx.setStorageSync('articles', [{ id: 'art_001', title: '测试', likeCount: 30, status: 1 }]);
    var res = await api.convertArticleToTutorial('art_001');
    expect(res.code).toBe(400);
  });

  test('convertArticleToTutorial 50赞以上可转换', async function() {
    wx.setStorageSync('articles', [{ id: 'art_001', title: '高赞文章', summary: '摘要', content: '内容内容内容内容', likeCount: 80, status: 1, tags: ['工艺'] }]);
    var res = await api.convertArticleToTutorial('art_001');
    expect(res.code).toBe(200);
    expect(res.data.title).toBe('高赞文章');
  });

  test('getCraftTutorialReviews 返回心得列表', async function() {
    await api.addCraftTutorialReview('tut_weaving_001', { content: '心得1', rating: 4 });
    await api.addCraftTutorialReview('tut_weaving_001', { content: '心得2', rating: 5 });
    var res = await api.getCraftTutorialReviews('tut_weaving_001', {});
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBe(2);
  });

  test('getCraftTutorialCheckins 返回打卡列表', async function() {
    await api.checkInCraftTutorial('tut_weaving_001');
    var res = await api.getCraftTutorialCheckins('tut_weaving_001', {});
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBe(1);
  });
});
