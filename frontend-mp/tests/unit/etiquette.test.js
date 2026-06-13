const {
  SCENES,
  REGIONS,
  DEFAULT_ETIQUETTE,
  getSceneList,
  getSceneById,
  getRegionList,
  findRegionByProvince,
  getDefaultEtiquette,
  initEtiquetteData
} = require('../../utils/etiquette-data');

describe('礼仪数据模块', () => {
  test('SCENES 包含五大场景', () => {
    expect(SCENES).toBeDefined();
    expect(Array.isArray(SCENES)).toBe(true);
    expect(SCENES.length).toBe(5);
  });

  test('五大场景分别为婚礼、丧葬、寿宴、节日待客、走亲访友', () => {
    var ids = SCENES.map(function(s) { return s.id; });
    expect(ids).toContain('wedding');
    expect(ids).toContain('funeral');
    expect(ids).toContain('birthday');
    expect(ids).toContain('festival');
    expect(ids).toContain('visiting');
  });

  test('每个场景结构完整', () => {
    SCENES.forEach(function(scene) {
      expect(scene).toHaveProperty('id');
      expect(scene).toHaveProperty('name');
      expect(scene).toHaveProperty('icon');
      expect(scene).toHaveProperty('desc');
      expect(typeof scene.id).toBe('string');
      expect(typeof scene.name).toBe('string');
      expect(scene.name.length).toBeGreaterThan(0);
    });
  });

  test('REGIONS 包含七大地区', () => {
    expect(REGIONS).toBeDefined();
    expect(Array.isArray(REGIONS)).toBe(true);
    expect(REGIONS.length).toBe(7);
  });

  test('每个地区包含省份列表', () => {
    REGIONS.forEach(function(region) {
      expect(region).toHaveProperty('id');
      expect(region).toHaveProperty('name');
      expect(region).toHaveProperty('provinces');
      expect(Array.isArray(region.provinces)).toBe(true);
      expect(region.provinces.length).toBeGreaterThan(0);
    });
  });

  test('DEFAULT_ETIQUETTE 包含5篇礼仪指南', () => {
    expect(DEFAULT_ETIQUETTE).toBeDefined();
    expect(Array.isArray(DEFAULT_ETIQUETTE)).toBe(true);
    expect(DEFAULT_ETIQUETTE.length).toBe(5);
  });

  test('每篇礼仪指南包含必要字段', () => {
    DEFAULT_ETIQUETTE.forEach(function(item) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('scene');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('summary');
      expect(item).toHaveProperty('process');
      expect(item).toHaveProperty('taboos');
      expect(item).toHaveProperty('regionalDiffs');
      expect(item).toHaveProperty('modernTips');
      expect(item).toHaveProperty('tags');
      expect(item).toHaveProperty('viewCount');
      expect(item).toHaveProperty('status');
    });
  });

  test('每篇礼仪指南的流程概述为步骤数组', () => {
    DEFAULT_ETIQUETTE.forEach(function(item) {
      expect(Array.isArray(item.process)).toBe(true);
      expect(item.process.length).toBeGreaterThan(0);
      item.process.forEach(function(step) {
        expect(step).toHaveProperty('step');
        expect(step).toHaveProperty('title');
        expect(step).toHaveProperty('desc');
        expect(typeof step.step).toBe('number');
      });
    });
  });

  test('每篇礼仪指南的禁忌为非空数组', () => {
    DEFAULT_ETIQUETTE.forEach(function(item) {
      expect(Array.isArray(item.taboos)).toBe(true);
      expect(item.taboos.length).toBeGreaterThan(0);
      item.taboos.forEach(function(taboo) {
        expect(taboo).toHaveProperty('title');
        expect(taboo).toHaveProperty('desc');
      });
    });
  });

  test('每篇礼仪指南的地域差异为非空数组', () => {
    DEFAULT_ETIQUETTE.forEach(function(item) {
      expect(Array.isArray(item.regionalDiffs)).toBe(true);
      expect(item.regionalDiffs.length).toBeGreaterThan(0);
      item.regionalDiffs.forEach(function(diff) {
        expect(diff).toHaveProperty('region');
        expect(diff).toHaveProperty('province');
        expect(diff).toHaveProperty('content');
      });
    });
  });

  test('每篇礼仪指南的现代建议为非空数组', () => {
    DEFAULT_ETIQUETTE.forEach(function(item) {
      expect(Array.isArray(item.modernTips)).toBe(true);
      expect(item.modernTips.length).toBeGreaterThan(0);
      item.modernTips.forEach(function(tip) {
        expect(tip).toHaveProperty('title');
        expect(tip).toHaveProperty('desc');
      });
    });
  });
});

describe('getSceneList', () => {
  test('返回场景列表', () => {
    var list = getSceneList();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(5);
    list.forEach(function(s) {
      expect(s).toHaveProperty('id');
      expect(s).toHaveProperty('name');
      expect(s).toHaveProperty('icon');
      expect(s).toHaveProperty('desc');
    });
  });
});

describe('getSceneById', () => {
  test('根据ID查找场景', () => {
    var wedding = getSceneById('wedding');
    expect(wedding).not.toBeNull();
    expect(wedding.name).toBe('婚礼');
  });

  test('找不到时返回null', () => {
    var result = getSceneById('nonexistent');
    expect(result).toBeNull();
  });
});

describe('getRegionList', () => {
  test('返回地区列表', () => {
    var list = getRegionList();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(7);
  });
});

describe('findRegionByProvince', () => {
  test('根据省份查找所属地区', () => {
    var region = findRegionByProvince('浙江');
    expect(region).not.toBeNull();
    expect(region.id).toBe('huadong');
    expect(region.name).toBe('华东');
  });

  test('根据广东省查找华南', () => {
    var region = findRegionByProvince('广东');
    expect(region).not.toBeNull();
    expect(region.id).toBe('huanan');
  });

  test('根据四川省查找西南', () => {
    var region = findRegionByProvince('四川');
    expect(region).not.toBeNull();
    expect(region.id).toBe('xinan');
  });

  test('找不到时返回null', () => {
    var result = findRegionByProvince('');
    expect(result).toBeNull();
  });

  test('省份名部分匹配', () => {
    var region = findRegionByProvince('山东省');
    expect(region).not.toBeNull();
    expect(region.id).toBe('huadong');
  });
});

describe('getDefaultEtiquette', () => {
  test('返回深拷贝数据', () => {
    var data1 = getDefaultEtiquette();
    var data2 = getDefaultEtiquette();
    expect(data1).toEqual(data2);
    expect(data1).not.toBe(data2);
  });
});

describe('initEtiquetteData', () => {
  test('初始化礼仪数据到存储', () => {
    wx._resetStorage();
    initEtiquetteData();
    var stored = wx.getStorageSync('etiquette');
    expect(Array.isArray(stored)).toBe(true);
    expect(stored.length).toBe(5);
  });

  test('初始化收藏存储', () => {
    wx._resetStorage();
    initEtiquetteData();
    var favs = wx.getStorageSync('etiquetteFavorites');
    expect(favs).toBeDefined();
  });

  test('已有数据时不覆盖', () => {
    wx._resetStorage();
    var customData = [{ id: 'custom_001', title: '自定义' }];
    wx.setStorageSync('etiquette', customData);
    initEtiquetteData();
    var stored = wx.getStorageSync('etiquette');
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe('custom_001');
  });
});

describe('礼仪API接口', () => {
  var api = require('../../utils/api');

  beforeEach(function() {
    wx._resetStorage();
    initEtiquetteData();
    wx.setStorageSync('userInfo', { id: 'test_user', nickname: '测试用户', role: 'user' });
    wx.setStorageSync('isLoggedIn', true);
  });

  test('getEtiquetteList 返回列表', async function() {
    var res = await api.getEtiquetteList();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.total).toBe(5);
  });

  test('getEtiquetteList 按场景筛选', async function() {
    var res = await api.getEtiquetteList({ scene: 'wedding' });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBe(1);
    expect(res.data.list[0].scene).toBe('wedding');
  });

  test('getEtiquetteList 按地区筛选', async function() {
    var res = await api.getEtiquetteList({ region: '华东' });
    expect(res.code).toBe(200);
    res.data.list.forEach(function(item) {
      var hasRegion = item.regionalDiffs.some(function(rd) { return rd.region === '华东'; });
      expect(hasRegion).toBe(true);
    });
  });

  test('getEtiquetteDetail 返回详情', async function() {
    var res = await api.getEtiquetteDetail('etq_wedding_001');
    expect(res.code).toBe(200);
    expect(res.data.title).toBe('传统婚礼礼仪');
    expect(res.data.process).toBeDefined();
    expect(res.data.taboos).toBeDefined();
    expect(res.data.regionalDiffs).toBeDefined();
    expect(res.data.modernTips).toBeDefined();
  });

  test('getEtiquetteDetail 增加浏览量', async function() {
    var before = await api.getEtiquetteDetail('etq_wedding_001');
    var after = await api.getEtiquetteDetail('etq_wedding_001');
    expect(after.data.viewCount).toBe(before.data.viewCount + 1);
  });

  test('favoriteEtiquette 收藏成功', async function() {
    var res = await api.favoriteEtiquette('etq_wedding_001');
    expect(res.code).toBe(200);
    expect(res.data.isFavorite).toBe(true);
  });

  test('unfavoriteEtiquette 取消收藏', async function() {
    await api.favoriteEtiquette('etq_wedding_001');
    var res = await api.unfavoriteEtiquette('etq_wedding_001');
    expect(res.code).toBe(200);
    expect(res.data.isFavorite).toBe(false);
  });

  test('checkEtiquetteFavorite 检查收藏状态', async function() {
    var beforeFav = await api.checkEtiquetteFavorite('etq_wedding_001');
    expect(beforeFav.data.isFavorite).toBe(false);

    await api.favoriteEtiquette('etq_wedding_001');
    var afterFav = await api.checkEtiquetteFavorite('etq_wedding_001');
    expect(afterFav.data.isFavorite).toBe(true);
  });

  test('getEtiquetteScenes 返回场景列表', async function() {
    var res = await api.getEtiquetteScenes();
    expect(res.code).toBe(200);
    expect(res.data.length).toBe(5);
  });

  test('getEtiquetteRegions 返回地区列表', async function() {
    var res = await api.getEtiquetteRegions();
    expect(res.code).toBe(200);
    expect(res.data.length).toBe(7);
  });

  test('getEtiquetteRecommendRegion 根据用户位置推荐', async function() {
    wx.setStorageSync('userInfo', Object.assign({}, wx.getStorageSync('userInfo'), { location: '浙江' }));
    var res = await api.getEtiquetteRecommendRegion();
    expect(res.code).toBe(200);
    expect(res.data.region).not.toBeNull();
    expect(res.data.region.id).toBe('huadong');
  });

  test('getEtiquetteFavorites 返回收藏列表', async function() {
    await api.favoriteEtiquette('etq_wedding_001');
    await api.favoriteEtiquette('etq_funeral_001');
    var res = await api.getEtiquetteFavorites();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBe(2);
  });
});
