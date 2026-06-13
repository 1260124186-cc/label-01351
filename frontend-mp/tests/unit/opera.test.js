const api = require('../../utils/api');
const { initStorage, defaultUser } = require('../helpers');
const {
  OPERA_CATEGORIES,
  OPERA_GENRES,
  REGIONS,
  DEFAULT_OPERAS,
  getCategoryInfo,
  getGenreInfo,
  getGenreName,
  getGenreNames,
  getRegionName,
  getRegionNames,
  getGenresByCategory,
  filterOperas,
  getDailyOpera,
  getDailyAria,
  getOperaById,
  getAriaById,
  searchOperasFullText,
  highlightKeyword,
  getRelatedOperasByFigure,
  getRelatedOperasByTopic,
  getOperasByGenre,
  getRareOperas
} = require('../../utils/opera-data');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('opera-data 基础数据完整性', () => {
  test('OPERA_CATEGORIES 包含戏曲和曲艺', () => {
    expect(OPERA_CATEGORIES.length).toBe(2);
    const ids = OPERA_CATEGORIES.map(c => c.id);
    expect(ids).toContain('opera');
    expect(ids).toContain('quyi');
  });

  test('每个分类有 id/name/icon/desc', () => {
    OPERA_CATEGORIES.forEach(c => {
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('name');
      expect(c).toHaveProperty('icon');
      expect(c).toHaveProperty('desc');
    });
  });

  test('OPERA_GENRES 包含 15 个剧种/曲种', () => {
    expect(OPERA_GENRES.length).toBe(15);
  });

  test('每个剧种/曲种有 id/name/region/icon/category', () => {
    OPERA_GENRES.forEach(g => {
      expect(g).toHaveProperty('id');
      expect(g).toHaveProperty('name');
      expect(g).toHaveProperty('region');
      expect(g).toHaveProperty('icon');
      expect(g).toHaveProperty('category');
      expect(['opera', 'quyi']).toContain(g.category);
    });
  });

  test('REGIONS 包含 34 个地区', () => {
    expect(REGIONS.length).toBe(34);
  });

  test('每个地区有 id/name', () => {
    REGIONS.forEach(r => {
      expect(r).toHaveProperty('id');
      expect(r).toHaveProperty('name');
    });
  });

  test('DEFAULT_OPERAS 包含 10 条种子数据', () => {
    expect(DEFAULT_OPERAS.length).toBe(10);
  });

  test('每条种子数据结构完整', () => {
    DEFAULT_OPERAS.forEach(opera => {
      expect(opera).toHaveProperty('id');
      expect(opera).toHaveProperty('title');
      expect(opera).toHaveProperty('category');
      expect(opera).toHaveProperty('genre');
      expect(opera).toHaveProperty('introduction');
      expect(opera).toHaveProperty('heritageRegions');
      expect(opera).toHaveProperty('representativeArias');
      expect(opera).toHaveProperty('tags');
      expect(opera).toHaveProperty('viewCount');
      expect(opera).toHaveProperty('status');
      expect(opera.status).toBe(1);
    });
  });
});

describe('opera-data 工具函数', () => {
  test('getCategoryInfo 返回正确分类', () => {
    const info = getCategoryInfo('opera');
    expect(info.name).toBe('戏曲');
  });

  test('getCategoryInfo 未知分类返回默认', () => {
    const info = getCategoryInfo('unknown');
    expect(info.name).toBe('未知分类');
  });

  test('getGenreInfo 返回正确剧种', () => {
    const info = getGenreInfo('beijing');
    expect(info.name).toBe('京剧');
  });

  test('getGenreName 返回正确名称', () => {
    expect(getGenreName('kunqu')).toBe('昆曲');
    expect(getGenreName('yuju')).toBe('豫剧');
    expect(getGenreName('unknown')).toBe('未知');
  });

  test('getGenreNames 批量返回名称', () => {
    const names = getGenreNames(['beijing', 'kunqu', 'yuju']);
    expect(names).toEqual(['京剧', '昆曲', '豫剧']);
  });

  test('getGenreNames 过滤未知剧种', () => {
    const names = getGenreNames(['beijing', 'nonexistent']);
    expect(names).toEqual(['京剧']);
  });

  test('getGenreNames 空输入返回空数组', () => {
    expect(getGenreNames(null)).toEqual([]);
    expect(getGenreNames(undefined)).toEqual([]);
    expect(getGenreNames([])).toEqual([]);
  });

  test('getRegionName 返回正确地区', () => {
    expect(getRegionName('beijing')).toBe('北京');
    expect(getRegionName('sichuan')).toBe('四川');
    expect(getRegionName('unknown')).toBe('未知');
  });

  test('getRegionNames 批量返回', () => {
    const names = getRegionNames(['beijing', 'jiangsu']);
    expect(names).toEqual(['北京', '江苏']);
  });

  test('getGenresByCategory 返回戏曲分类剧种', () => {
    const operaGenres = getGenresByCategory('opera');
    expect(operaGenres.length).toBeGreaterThan(0);
    operaGenres.forEach(g => {
      expect(g.category).toBe('opera');
    });
  });

  test('getGenresByCategory all 返回全部', () => {
    const all = getGenresByCategory('all');
    expect(all.length).toBe(OPERA_GENRES.length);
  });

  test('getGenresByCategory 空值返回全部', () => {
    const all = getGenresByCategory('');
    expect(all.length).toBe(OPERA_GENRES.length);
  });
});

describe('filterOperas 筛选功能', () => {
  let operas;

  beforeEach(() => {
    initStorage();
    operas = wx.getStorageSync('operas');
  });

  test('无筛选条件返回所有 status=1 的剧目', () => {
    const result = filterOperas(operas);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(item => {
      expect(item.status).toBe(1);
    });
  });

  test('按分类筛选：戏曲', () => {
    const result = filterOperas(operas, { category: 'opera' });
    expect(result.length).toBeGreaterThan(0);
    result.forEach(item => {
      expect(item.category).toBe('opera');
    });
  });

  test('按分类筛选：曲艺', () => {
    const result = filterOperas(operas, { category: 'quyi' });
    expect(result.length).toBeGreaterThan(0);
    result.forEach(item => {
      expect(item.category).toBe('quyi');
    });
  });

  test('按剧种筛选', () => {
    const result = filterOperas(operas, { genre: 'beijing' });
    expect(result.length).toBeGreaterThan(0);
    result.forEach(item => {
      expect(item.genre).toBe('beijing');
    });
  });

  test('按地区筛选', () => {
    const result = filterOperas(operas, { region: 'beijing' });
    expect(result.length).toBeGreaterThan(0);
    result.forEach(item => {
      expect(item.heritageRegions).toContain('beijing');
    });
  });

  test('按稀有剧目筛选', () => {
    const result = filterOperas(operas, { isRare: true });
    expect(result.length).toBeGreaterThan(0);
    result.forEach(item => {
      expect(item.isRare).toBe(true);
    });
  });

  test('关键词搜索匹配剧名', () => {
    const result = filterOperas(operas, { keyword: '贵妃' });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].title).toContain('贵妃');
  });

  test('关键词搜索匹配简介', () => {
    const result = filterOperas(operas, { keyword: '汤显祖' });
    expect(result.length).toBeGreaterThan(0);
  });

  test('关键词搜索匹配唱段', () => {
    const result = filterOperas(operas, { keyword: '海岛冰轮' });
    expect(result.length).toBeGreaterThan(0);
  });

  test('关键词搜索匹配标签', () => {
    const result = filterOperas(operas, { keyword: '梅派' });
    expect(result.length).toBeGreaterThan(0);
  });

  test('关键词搜索匹配别名', () => {
    const result = filterOperas(operas, { keyword: '百花亭' });
    expect(result.length).toBeGreaterThan(0);
  });

  test('关键词搜索无结果返回空数组', () => {
    const result = filterOperas(operas, { keyword: '不存在的关键词xyz123' });
    expect(result).toEqual([]);
  });

  test('组合筛选：分类+剧种', () => {
    const result = filterOperas(operas, { category: 'opera', genre: 'beijing' });
    result.forEach(item => {
      expect(item.category).toBe('opera');
      expect(item.genre).toBe('beijing');
    });
  });

  test('category=all 不筛选分类', () => {
    const all = filterOperas(operas);
    const withAll = filterOperas(operas, { category: 'all' });
    expect(all.length).toBe(withAll.length);
  });
});

describe('getDailyOpera / getDailyAria 每日推荐', () => {
  beforeEach(() => {
    initStorage();
  });

  test('getDailyOpera 返回有效剧目', () => {
    const daily = getDailyOpera();
    expect(daily).not.toBeNull();
    expect(daily).toHaveProperty('id');
    expect(daily).toHaveProperty('title');
    expect(daily.status).toBe(1);
  });

  test('getDailyOpera 同日返回相同结果（缓存）', () => {
    const first = getDailyOpera();
    const second = getDailyOpera();
    expect(first.id).toBe(second.id);
  });

  test('getDailyAria 返回有效唱段', () => {
    const daily = getDailyAria();
    expect(daily).not.toBeNull();
    expect(daily).toHaveProperty('id');
    expect(daily).toHaveProperty('name');
    expect(daily).toHaveProperty('text');
    expect(daily).toHaveProperty('operaId');
    expect(daily).toHaveProperty('operaTitle');
    expect(daily).toHaveProperty('genreName');
  });

  test('getDailyAria 同日返回相同结果（缓存）', () => {
    const first = getDailyAria();
    const second = getDailyAria();
    expect(first.id).toBe(second.id);
  });
});

describe('getOperaById / getAriaById', () => {
  beforeEach(() => {
    initStorage();
  });

  test('getOperaById 返回正确剧目', () => {
    const opera = getOperaById('opera_001');
    expect(opera).not.toBeNull();
    expect(opera.title).toBe('贵妃醉酒');
  });

  test('getOperaById 不存在返回 null', () => {
    expect(getOperaById('nonexistent')).toBeNull();
  });

  test('getOperaById 空值返回 null', () => {
    expect(getOperaById('')).toBeNull();
    expect(getOperaById(null)).toBeNull();
  });

  test('getAriaById 返回正确唱段', () => {
    const aria = getAriaById('opera_001', 'aria_001');
    expect(aria).not.toBeNull();
    expect(aria.name).toBe('海岛冰轮初转腾');
  });

  test('getAriaById 不存在返回 null', () => {
    expect(getAriaById('opera_001', 'nonexistent')).toBeNull();
    expect(getAriaById('nonexistent', 'aria_001')).toBeNull();
  });
});

describe('searchOperasFullText 全文搜索', () => {
  let operas;

  beforeEach(() => {
    initStorage();
    operas = wx.getStorageSync('operas');
  });

  test('空关键词返回全部', () => {
    const result = searchOperasFullText(operas, '');
    expect(result.length).toBe(operas.filter(o => o.status === 1).length);
  });

  test('有效关键词返回匹配结果', () => {
    const result = searchOperasFullText(operas, '京剧');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('highlightKeyword 关键词高亮', () => {
  test('正常高亮', () => {
    const result = highlightKeyword('贵妃醉酒是京剧经典', '京剧');
    expect(result).toContain('{{{京剧}}}');
    expect(result).toContain('贵妃醉酒是');
  });

  test('空文本返回原值', () => {
    expect(highlightKeyword('', 'test')).toBe('');
    expect(highlightKeyword(null, 'test')).toBe('');
  });

  test('空关键词返回原文本', () => {
    expect(highlightKeyword('文本', '')).toBe('文本');
    expect(highlightKeyword('文本', null)).toBe('文本');
  });

  test('特殊正则字符安全处理', () => {
    const result = highlightKeyword('价格是$50', '$');
    expect(result).toContain('{{{$}}}');
  });
});

describe('getRelatedOperasByFigure 人物关联剧目', () => {
  beforeEach(() => {
    initStorage();
  });

  test('通过 inheritors 关联', () => {
    const result = getRelatedOperasByFigure('figure_007');
    expect(result.length).toBeGreaterThan(0);
  });

  test('通过 relatedFigureIds 关联', () => {
    const operas = wx.getStorageSync('operas');
    operas[0].relatedFigureIds = ['figure_test'];
    wx.setStorageSync('operas', operas);

    const result = getRelatedOperasByFigure('figure_test');
    expect(result.length).toBeGreaterThan(0);
  });

  test('无关联返回空数组', () => {
    const result = getRelatedOperasByFigure('figure_no_relation');
    expect(result).toEqual([]);
  });

  test('空值返回空数组', () => {
    expect(getRelatedOperasByFigure('')).toEqual([]);
    expect(getRelatedOperasByFigure(null)).toEqual([]);
  });

  test('limit 参数生效', () => {
    const operas = wx.getStorageSync('operas');
    operas[0].relatedFigureIds = ['figure_limit'];
    operas[1].relatedFigureIds = ['figure_limit'];
    operas[2].relatedFigureIds = ['figure_limit'];
    wx.setStorageSync('operas', operas);

    const result = getRelatedOperasByFigure('figure_limit', 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });
});

describe('getRelatedOperasByTopic 专题关联剧目', () => {
  beforeEach(() => {
    initStorage();
  });

  test('关联专题的剧目', () => {
    const operas = wx.getStorageSync('operas');
    operas[0].relatedTopics = ['topic_test'];
    wx.setStorageSync('operas', operas);

    const result = getRelatedOperasByTopic('topic_test');
    expect(result.length).toBeGreaterThan(0);
  });

  test('无关联返回空数组', () => {
    const result = getRelatedOperasByTopic('topic_no_relation');
    expect(result).toEqual([]);
  });

  test('空值返回空数组', () => {
    expect(getRelatedOperasByTopic('')).toEqual([]);
    expect(getRelatedOperasByTopic(null)).toEqual([]);
  });
});

describe('getOperasByGenre 按剧种获取', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回指定剧种剧目', () => {
    const result = getOperasByGenre('beijing');
    expect(result.length).toBeGreaterThan(0);
    result.forEach(o => {
      expect(o.genre).toBe('beijing');
    });
  });

  test('不存在的剧种返回空数组', () => {
    expect(getOperasByGenre('nonexistent')).toEqual([]);
  });

  test('空值返回空数组', () => {
    expect(getOperasByGenre('')).toEqual([]);
    expect(getOperasByGenre(null)).toEqual([]);
  });

  test('limit 参数生效', () => {
    const result = getOperasByGenre('beijing', 1);
    expect(result.length).toBeLessThanOrEqual(1);
  });
});

describe('getRareOperas 稀有剧目', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回稀有剧目', () => {
    const result = getRareOperas();
    expect(result.length).toBeGreaterThan(0);
    result.forEach(o => {
      expect(o.isRare).toBe(true);
    });
  });

  test('limit 参数生效', () => {
    const result = getRareOperas(1);
    expect(result.length).toBeLessThanOrEqual(1);
  });
});

describe('api.getOperaList 戏曲列表', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回戏曲列表', async () => {
    const res = await api.getOperaList();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data).toHaveProperty('total');
    expect(res.data).toHaveProperty('page');
    expect(res.data).toHaveProperty('pageSize');
  });

  test('按分类筛选：戏曲', async () => {
    const res = await api.getOperaList({ category: 'opera' });
    expect(res.code).toBe(200);
    res.data.list.forEach(item => {
      expect(item.category).toBe('opera');
    });
  });

  test('按分类筛选：曲艺', async () => {
    const res = await api.getOperaList({ category: 'quyi' });
    expect(res.code).toBe(200);
    res.data.list.forEach(item => {
      expect(item.category).toBe('quyi');
    });
  });

  test('按剧种筛选', async () => {
    const res = await api.getOperaList({ genre: 'beijing' });
    expect(res.code).toBe(200);
    res.data.list.forEach(item => {
      expect(item.genre).toBe('beijing');
    });
  });

  test('按地区筛选', async () => {
    const res = await api.getOperaList({ region: 'beijing' });
    expect(res.code).toBe(200);
    res.data.list.forEach(item => {
      expect(item.heritageRegions).toContain('beijing');
    });
  });

  test('按稀有剧目筛选', async () => {
    const res = await api.getOperaList({ isRare: true });
    expect(res.code).toBe(200);
    res.data.list.forEach(item => {
      expect(item.isRare).toBe(true);
    });
  });

  test('关键词搜索', async () => {
    const res = await api.getOperaList({ keyword: '贵妃' });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
  });

  test('关键词搜索无结果', async () => {
    const res = await api.getOperaList({ keyword: '不存在的关键词xyz123' });
    expect(res.code).toBe(200);
    expect(res.data.list).toEqual([]);
    expect(res.data.total).toBe(0);
  });

  test('分页功能', async () => {
    const res = await api.getOperaList({ page: 1, pageSize: 2 });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeLessThanOrEqual(2);
  });

  test('列表项包含 genreName 和 genreInfo', async () => {
    const res = await api.getOperaList({ pageSize: 1 });
    expect(res.code).toBe(200);
    if (res.data.list.length > 0) {
      const item = res.data.list[0];
      expect(item).toHaveProperty('genreName');
      expect(item).toHaveProperty('genreInfo');
    }
  });
});

describe('api.getOperaDetail 戏曲详情', () => {
  beforeEach(() => {
    initStorage();
  });

  test('根据 ID 获取详情', async () => {
    const res = await api.getOperaDetail('opera_001');
    expect(res.code).toBe(200);
    expect(res.data.id).toBe('opera_001');
    expect(res.data.title).toBe('贵妃醉酒');
  });

  test('详情包含完整字段', async () => {
    const res = await api.getOperaDetail('opera_001');
    expect(res.code).toBe(200);
    const opera = res.data;
    expect(opera).toHaveProperty('genreName');
    expect(opera).toHaveProperty('categoryInfo');
    expect(opera).toHaveProperty('regionNames');
    expect(opera).toHaveProperty('isFavorite');
  });

  test('获取详情增加浏览量', async () => {
    const before = wx.getStorageSync('operas').find(o => o.id === 'opera_001');
    const viewBefore = before.viewCount;

    await api.getOperaDetail('opera_001');

    const after = wx.getStorageSync('operas').find(o => o.id === 'opera_001');
    expect(after.viewCount).toBe(viewBefore + 1);
  });

  test('空 ID 返回 400', async () => {
    const res = await api.getOperaDetail('');
    expect(res.code).toBe(400);
  });

  test('不存在 ID 返回 404', async () => {
    const res = await api.getOperaDetail('opera_notexist');
    expect(res.code).toBe(404);
  });
});

describe('api.getOperaFilterOptions 筛选项', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回筛选项数据', async () => {
    const res = await api.getOperaFilterOptions();
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('categoryList');
    expect(res.data).toHaveProperty('genreList');
    expect(res.data).toHaveProperty('regionList');
    expect(res.data.categoryList.length).toBeGreaterThan(0);
    expect(res.data.genreList.length).toBeGreaterThan(0);
    expect(res.data.regionList.length).toBeGreaterThan(0);
  });
});

describe('api.getDailyOpera / getDailyAria 每日推荐 API', () => {
  beforeEach(() => {
    initStorage();
  });

  test('getDailyOpera 返回数据', async () => {
    const res = await api.getDailyOpera();
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('id');
    expect(res.data).toHaveProperty('title');
  });

  test('getDailyAria 返回数据', async () => {
    const res = await api.getDailyAria();
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('id');
    expect(res.data).toHaveProperty('operaTitle');
  });
});

describe('api 戏曲收藏', () => {
  beforeEach(() => {
    initStorage({
      userInfo: defaultUser,
      isLoggedIn: true
    });
  });

  test('收藏剧目', async () => {
    const res = await api.favoriteOpera('opera_001');
    expect(res.code).toBe(200);
    expect(res.data.isFavorite).toBe(true);

    const favorites = wx.getStorageSync('operaFavorites');
    expect(favorites['user_001']).toHaveProperty('opera_001');
  });

  test('重复收藏不重复', async () => {
    await api.favoriteOpera('opera_001');
    const res = await api.favoriteOpera('opera_001');
    expect(res.code).toBe(200);
    expect(res.data.isFavorite).toBe(true);

    const favorites = wx.getStorageSync('operaFavorites');
    const keys = Object.keys(favorites['user_001']);
    const count = keys.filter(id => id === 'opera_001').length;
    expect(count).toBe(1);
  });

  test('取消收藏', async () => {
    await api.favoriteOpera('opera_001');
    const res = await api.unfavoriteOpera('opera_001');
    expect(res.code).toBe(200);
    expect(res.data.isFavorite).toBe(false);

    const favorites = wx.getStorageSync('operaFavorites');
    expect(favorites['user_001']).not.toHaveProperty('opera_001');
  });

  test('检查收藏状态', async () => {
    await api.favoriteOpera('opera_001');
    const res = await api.checkOperaFavorite('opera_001');
    expect(res.code).toBe(200);
    expect(res.data.isFavorite).toBe(true);
  });

  test('未登录收藏返回 401', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.favoriteOpera('opera_001');
    expect(res.code).toBe(401);
  });

  test('空 ID 收藏返回 400', async () => {
    const res = await api.favoriteOpera('');
    expect(res.code).toBe(400);
  });

  test('不存在的剧目收藏返回成功（仅记录收藏关系）', async () => {
    const res = await api.favoriteOpera('opera_notexist');
    expect(res.code).toBe(200);
  });

  test('收藏唱段', async () => {
    const res = await api.favoriteAria('opera_001', 'aria_001');
    expect(res.code).toBe(200);
    expect(res.data.isFavorite).toBe(true);

    const favorites = wx.getStorageSync('ariaFavorites');
    expect(favorites['user_001']).toHaveProperty('opera_001_aria_001');
  });

  test('取消收藏唱段', async () => {
    await api.favoriteAria('opera_001', 'aria_001');
    const res = await api.unfavoriteAria('opera_001', 'aria_001');
    expect(res.code).toBe(200);
    expect(res.data.isFavorite).toBe(false);

    const favorites = wx.getStorageSync('ariaFavorites');
    expect(favorites['user_001']).not.toHaveProperty('opera_001_aria_001');
  });

  test('不同用户收藏互不影响', async () => {
    await api.favoriteOpera('opera_001');

    wx.setStorageSync('userInfo', { id: 'user_002', nickname: '另一个用户' });
    wx.setStorageSync('isLoggedIn', true);

    const res = await api.checkOperaFavorite('opera_001');
    expect(res.data.isFavorite).toBe(false);
  });
});

describe('api.getOperaFavoriteList / getAriaFavoriteList 收藏列表', () => {
  beforeEach(() => {
    initStorage({
      userInfo: defaultUser,
      isLoggedIn: true
    });
  });

  test('无收藏时返回空列表', async () => {
    const res = await api.getOperaFavoriteList();
    expect(res.code).toBe(200);
    expect(res.data.list).toEqual([]);
    expect(res.data.total).toBe(0);
  });

  test('返回已收藏的剧目列表', async () => {
    await api.favoriteOpera('opera_001');
    await api.favoriteOpera('opera_002');

    const res = await api.getOperaFavoriteList();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBe(2);
    expect(res.data.total).toBe(2);
  });

  test('唱段收藏列表', async () => {
    await api.favoriteAria('opera_001', 'aria_001');

    const res = await api.getAriaFavoriteList();
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('list');
    expect(res.data).toHaveProperty('total');
    if (res.data.list.length > 0) {
      expect(res.data.list[0]).toHaveProperty('id');
      expect(res.data.list[0]).toHaveProperty('operaId');
      expect(res.data.list[0]).toHaveProperty('operaTitle');
    }
  });
});

describe('api.submitOperaDraft 提交剧目草稿', () => {
  beforeEach(() => {
    initStorage({
      userInfo: defaultUser,
      isLoggedIn: true
    });
  });

  test('成功提交草稿', async () => {
    const res = await api.submitOperaDraft({
      title: '测试稀有剧目',
      category: 'opera',
      genre: 'beijing',
      introduction: '这是一个测试稀有剧目的简介内容，长度超过十个字'
    });
    expect(res.code).toBe(200);
    expect(res.data.reviewStatus).toBe('pending');
    expect(res.data.submitterId).toBe(defaultUser.id);
  });

  test('未登录提交返回 401', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    const res = await api.submitOperaDraft({
      title: '测试',
      category: 'opera',
      genre: 'beijing',
      introduction: '简介内容'
    });
    expect(res.code).toBe(401);
  });

  test('剧名为空返回 400', async () => {
    const res = await api.submitOperaDraft({
      title: '',
      category: 'opera',
      genre: 'beijing',
      introduction: '简介'
    });
    expect(res.code).toBe(400);
  });

  test('分类为空返回 400', async () => {
    const res = await api.submitOperaDraft({
      title: '测试剧目',
      category: '',
      genre: 'beijing',
      introduction: '简介'
    });
    expect(res.code).toBe(400);
  });

  test('剧种为空返回 400', async () => {
    const res = await api.submitOperaDraft({
      title: '测试剧目',
      category: 'opera',
      genre: '',
      introduction: '简介'
    });
    expect(res.code).toBe(400);
  });

  test('简介为空返回 400', async () => {
    const res = await api.submitOperaDraft({
      title: '测试剧目',
      category: 'opera',
      genre: 'beijing',
      introduction: ''
    });
    expect(res.code).toBe(400);
  });

  test('提交后草稿出现在我的投稿中', async () => {
    await api.submitOperaDraft({
      title: '我的稀有剧目',
      category: 'opera',
      genre: 'beijing',
      introduction: '简介内容长度足够了'
    });

    const res = await api.getMyOperaDrafts();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.list[0].title).toBe('我的稀有剧目');
  });
});

describe('api 审核流程', () => {
  beforeEach(() => {
    initStorage({
      userInfo: defaultUser,
      isLoggedIn: true
    });
  });

  test('审核列表返回待审核草稿', async () => {
    await api.submitOperaDraft({
      title: '待审核剧目',
      category: 'opera',
      genre: 'beijing',
      introduction: '简介内容长度足够了'
    });

    const res = await api.getOperaReviewList();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    const pending = res.data.list.find(d => d.reviewStatus === 'pending');
    expect(pending).toBeDefined();
  });

  test('审核通过：草稿变为正式剧目', async () => {
    const submitRes = await api.submitOperaDraft({
      title: '将通过的剧目',
      category: 'opera',
      genre: 'beijing',
      introduction: '简介内容长度足够了'
    });
    const draftId = submitRes.data.id;

    const res = await api.reviewOperaDraft(draftId, 'approved');
    expect(res.code).toBe(200);

    const drafts = wx.getStorageSync('operaDrafts');
    const draft = drafts.find(d => d.id === draftId);
    expect(draft.reviewStatus).toBe('approved');

    const operas = wx.getStorageSync('operas');
    const newOpera = operas.find(o => o.title === '将通过的剧目');
    expect(newOpera).toBeDefined();
    expect(newOpera.viewCount).toBe(0);
    expect(newOpera.favoriteCount).toBe(0);
    expect(newOpera.status).toBe(1);
  });

  test('审核驳回', async () => {
    const submitRes = await api.submitOperaDraft({
      title: '将被驳回的剧目',
      category: 'opera',
      genre: 'beijing',
      introduction: '简介内容长度足够了'
    });
    const draftId = submitRes.data.id;

    const res = await api.reviewOperaDraft(draftId, 'rejected');
    expect(res.code).toBe(200);

    const drafts = wx.getStorageSync('operaDrafts');
    const draft = drafts.find(d => d.id === draftId);
    expect(draft.reviewStatus).toBe('rejected');
  });

  test('审核不存在的草稿返回 404', async () => {
    const res = await api.reviewOperaDraft('nonexistent', 'approved');
    expect(res.code).toBe(404);
  });
});

describe('api.getRelatedOperasByFigure / getRelatedOperasByTopic 关联 API', () => {
  beforeEach(() => {
    initStorage();
  });

  test('getRelatedOperasByFigure 返回关联剧目', async () => {
    const res = await api.getRelatedOperasByFigure('figure_007');
    expect(res.code).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  test('getRelatedOperasByTopic 返回关联剧目', async () => {
    const operas = wx.getStorageSync('operas');
    operas[0].relatedTopics = ['topic_001'];
    wx.setStorageSync('operas', operas);

    const res = await api.getRelatedOperasByTopic('topic_001');
    expect(res.code).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });
});

describe('api.getVillageList / getFeaturedChannels 村庄 API', () => {
  beforeEach(() => {
    initStorage();
  });

  test('getVillageList 返回列表', async () => {
    const res = await api.getVillageList();
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('list');
    expect(res.data).toHaveProperty('total');
  });

  test('getFeaturedChannels 返回列表', async () => {
    const res = await api.getFeaturedChannels();
    expect(res.code).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });
});
