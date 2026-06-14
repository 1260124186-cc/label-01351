var api = require('../../utils/api');
var pairingData = require('../../utils/pairing-data');
var { initStorage, defaultUser } = require('../helpers');

beforeEach(function() {
  jest.clearAllMocks();
  initStorage();
});

describe('pairing-data.matchScore', function() {
  test('skillType匹配加50分', function() {
    var teaching = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [] };
    var learning = { skillType: 'embroidery', region: 'south', timeCommitment: 'weekend', tags: [] };
    expect(pairingData.matchScore(teaching, learning)).toBe(50);
  });

  test('skillType和region都匹配加80分', function() {
    var teaching = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [] };
    var learning = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekend', tags: [] };
    expect(pairingData.matchScore(teaching, learning)).toBe(80);
  });

  test('全部匹配加90分', function() {
    var teaching = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [] };
    var learning = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [] };
    expect(pairingData.matchScore(teaching, learning)).toBe(90);
  });

  test('标签重叠加分最多10分', function() {
    var teaching = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: ['苏绣', '刺绣', '非遗'] };
    var learning = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: ['苏绣', '刺绣', '非遗'] };
    var score = pairingData.matchScore(teaching, learning);
    expect(score).toBe(100);
  });

  test('标签重叠超过2个最多只加10分', function() {
    var teaching = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: ['a', 'b', 'c', 'd'] };
    var learning = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: ['a', 'b', 'c', 'd'] };
    var score = pairingData.matchScore(teaching, learning);
    expect(score).toBe(100);
  });

  test('完全不匹配得0分', function() {
    var teaching = { skillType: 'weaving', region: 'east', timeCommitment: 'weekly', tags: ['a'] };
    var learning = { skillType: 'pottery', region: 'south', timeCommitment: 'weekend', tags: ['b'] };
    expect(pairingData.matchScore(teaching, learning)).toBe(0);
  });
});

describe('pairing-data.findMatches', function() {
  test('返回分数大于等于阈值的匹配', function() {
    var teachings = [
      { id: 't1', skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [], status: 1, currentStudents: 0, maxStudents: 5, masterId: 'm1' },
      { id: 't2', skillType: 'pottery', region: 'south', timeCommitment: 'weekend', tags: [], status: 1, currentStudents: 0, maxStudents: 5, masterId: 'm1' }
    ];
    var learning = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [], learnerId: 'l1' };
    var matches = pairingData.findMatches(learning, teachings, { minScore: 30 });
    expect(matches.length).toBe(1);
    expect(matches[0].teaching.id).toBe('t1');
    expect(matches[0].score).toBe(90);
  });

  test('按分数降序排列', function() {
    var teachings = [
      { id: 't1', skillType: 'embroidery', region: 'south', timeCommitment: 'weekend', tags: [], status: 1, currentStudents: 0, maxStudents: 5, masterId: 'm1' },
      { id: 't2', skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [], status: 1, currentStudents: 0, maxStudents: 5, masterId: 'm2' }
    ];
    var learning = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [], learnerId: 'l1' };
    var matches = pairingData.findMatches(learning, teachings, { minScore: 0 });
    expect(matches[0].score).toBeGreaterThanOrEqual(matches[1].score);
  });

  test('过滤已满员的教学', function() {
    var teachings = [
      { id: 't1', skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [], status: 1, currentStudents: 5, maxStudents: 5, masterId: 'm1' }
    ];
    var learning = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [], learnerId: 'l1' };
    var matches = pairingData.findMatches(learning, teachings, { minScore: 0 });
    expect(matches.length).toBe(0);
  });

  test('过滤自己的教学', function() {
    var teachings = [
      { id: 't1', skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [], status: 1, currentStudents: 0, maxStudents: 5, masterId: 'same_user' }
    ];
    var learning = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [], learnerId: 'same_user' };
    var matches = pairingData.findMatches(learning, teachings, { minScore: 0 });
    expect(matches.length).toBe(0);
  });

  test('limit参数限制返回数量', function() {
    var teachings = [
      { id: 't1', skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [], status: 1, currentStudents: 0, maxStudents: 5, masterId: 'm1' },
      { id: 't2', skillType: 'embroidery', region: 'east', timeCommitment: 'weekend', tags: [], status: 1, currentStudents: 0, maxStudents: 5, masterId: 'm2' }
    ];
    var learning = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [], learnerId: 'l1' };
    var matches = pairingData.findMatches(learning, teachings, { minScore: 0, limit: 1 });
    expect(matches.length).toBe(1);
  });
});

describe('pairing-data.findMatchesForTeaching', function() {
  test('为教学返回匹配的学习需求', function() {
    var learnings = [
      { id: 'l1', skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [], status: 1, learnerId: 'user1' },
      { id: 'l2', skillType: 'pottery', region: 'south', timeCommitment: 'weekend', tags: [], status: 1, learnerId: 'user2' }
    ];
    var teaching = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [], masterId: 'master1' };
    var matches = pairingData.findMatchesForTeaching(teaching, learnings, { minScore: 30 });
    expect(matches.length).toBe(1);
    expect(matches[0].learning.id).toBe('l1');
  });

  test('过滤自己的学习需求', function() {
    var learnings = [
      { id: 'l1', skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [], status: 1, learnerId: 'same_user' }
    ];
    var teaching = { skillType: 'embroidery', region: 'east', timeCommitment: 'weekly', tags: [], masterId: 'same_user' };
    var matches = pairingData.findMatchesForTeaching(teaching, learnings, { minScore: 0 });
    expect(matches.length).toBe(0);
  });
});

describe('pairing-data.filterTeachings', function() {
  var teachings;

  beforeEach(function() {
    teachings = [
      { id: 't1', skillType: 'embroidery', region: 'east', method: 'offline', title: '苏绣教学', description: '刺绣入门', tags: ['苏绣'] },
      { id: 't2', skillType: 'woodcarving', region: 'southwest', method: 'both', title: '木雕教学', description: '木雕入门', tags: ['木雕'] },
      { id: 't3', skillType: 'papercut', region: 'northwest', method: 'online_text', title: '剪纸教学', description: '剪纸入门', tags: ['剪纸'] }
    ];
  });

  test('按skillType筛选', function() {
    var result = pairingData.filterTeachings(teachings, { skillType: 'embroidery' });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('t1');
  });

  test('按region筛选', function() {
    var result = pairingData.filterTeachings(teachings, { region: 'east' });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('t1');
  });

  test('按method筛选', function() {
    var result = pairingData.filterTeachings(teachings, { method: 'both' });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('t2');
  });

  test('按关键词筛选', function() {
    var result = pairingData.filterTeachings(teachings, { keyword: '苏绣' });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('t1');
  });

  test('skillType=all返回全部', function() {
    var result = pairingData.filterTeachings(teachings, { skillType: 'all' });
    expect(result.length).toBe(3);
  });

  test('组合筛选', function() {
    var result = pairingData.filterTeachings(teachings, { skillType: 'embroidery', region: 'east' });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('t1');
  });
});

describe('pairing-data.filterLearnings', function() {
  var learnings;

  beforeEach(function() {
    learnings = [
      { id: 'l1', skillType: 'embroidery', region: 'east', title: '想学刺绣', description: '刺绣入门', tags: ['刺绣'] },
      { id: 'l2', skillType: 'woodcarving', region: 'southwest', title: '想学木雕', description: '木雕入门', tags: ['木雕'] }
    ];
  });

  test('按skillType筛选', function() {
    var result = pairingData.filterLearnings(learnings, { skillType: 'embroidery' });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('l1');
  });

  test('按region筛选', function() {
    var result = pairingData.filterLearnings(learnings, { region: 'southwest' });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('l2');
  });

  test('按关键词筛选', function() {
    var result = pairingData.filterLearnings(learnings, { keyword: '木雕' });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('l2');
  });

  test('skillType=all返回全部', function() {
    var result = pairingData.filterLearnings(learnings, { skillType: 'all' });
    expect(result.length).toBe(2);
  });
});

describe('pairing-data.getInfo方法', function() {
  test('getSkillTagInfo返回正确信息', function() {
    var info = pairingData.getSkillTagInfo('embroidery');
    expect(info.id).toBe('embroidery');
    expect(info.name).toBe('刺绣技艺');
    expect(info.icon).toBe('🧵');
  });

  test('getSkillTagInfo未知id返回默认', function() {
    var info = pairingData.getSkillTagInfo('unknown');
    expect(info.name).toBe('其他');
  });

  test('getTeachingMethodInfo返回正确信息', function() {
    var info = pairingData.getTeachingMethodInfo('offline');
    expect(info.id).toBe('offline');
    expect(info.name).toBe('线下传授');
  });

  test('getTeachingMethodInfo未知id返回默认', function() {
    var info = pairingData.getTeachingMethodInfo('unknown');
    expect(info.name).toBe('未知');
  });

  test('getTimeCommitmentInfo返回正确信息', function() {
    var info = pairingData.getTimeCommitmentInfo('weekend');
    expect(info.id).toBe('weekend');
    expect(info.name).toBe('周末');
  });

  test('getTimeCommitmentInfo未知id返回默认', function() {
    var info = pairingData.getTimeCommitmentInfo('unknown');
    expect(info.name).toBe('未知');
  });

  test('getPairingStatusInfo返回正确信息', function() {
    var info = pairingData.getPairingStatusInfo('pending');
    expect(info.id).toBe('pending');
    expect(info.name).toBe('待确认');
  });

  test('getPairingStatusInfo未知id返回默认', function() {
    var info = pairingData.getPairingStatusInfo('unknown');
    expect(info.name).toBe('未知');
    expect(info.color).toBe('#999999');
  });

  test('getRegionName返回正确名称', function() {
    var name = pairingData.getRegionName('east');
    expect(name).toBe('华东地区');
  });
});

describe('pairing-data.initPairingData', function() {
  test('空storage时初始化默认数据', function() {
    wx.removeStorageSync('teachings');
    wx.removeStorageSync('learnings');
    wx.removeStorageSync('pairings');
    wx.removeStorageSync('studyCheckins');
    wx.removeStorageSync('commemorativeCards');

    pairingData.initPairingData();

    var teachings = wx.getStorageSync('teachings');
    var learnings = wx.getStorageSync('learnings');
    var pairings = wx.getStorageSync('pairings');
    var studyCheckins = wx.getStorageSync('studyCheckins');
    var cards = wx.getStorageSync('commemorativeCards');

    expect(teachings.length).toBeGreaterThan(0);
    expect(learnings.length).toBeGreaterThan(0);
    expect(pairings.length).toBeGreaterThan(0);
    expect(studyCheckins).toEqual({});
    expect(cards).toEqual({});
  });

  test('已有数据时不覆盖', function() {
    wx.setStorageSync('teachings', [{ id: 'custom_teach' }]);
    pairingData.initPairingData();
    var teachings = wx.getStorageSync('teachings');
    expect(teachings.length).toBe(1);
    expect(teachings[0].id).toBe('custom_teach');
  });
});

describe('api.remoteApi.getTeachingList', function() {
  test('返回教学列表带分页', async function() {
    var res = await api.remoteApi.getTeachingList({ page: 1, pageSize: 2 });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeLessThanOrEqual(2);
    expect(res.data).toHaveProperty('total');
    expect(res.data).toHaveProperty('page');
    expect(res.data).toHaveProperty('pageSize');
    expect(res.data).toHaveProperty('hasMore');
  });

  test('按skillType筛选', async function() {
    var res = await api.remoteApi.getTeachingList({ skillType: 'embroidery' });
    expect(res.code).toBe(200);
    res.data.list.forEach(function(item) {
      expect(item.skillType).toBe('embroidery');
    });
  });

  test('按region筛选', async function() {
    var res = await api.remoteApi.getTeachingList({ region: 'east' });
    expect(res.code).toBe(200);
    res.data.list.forEach(function(item) {
      expect(item.region).toBe('east');
    });
  });

  test('按method筛选', async function() {
    var res = await api.remoteApi.getTeachingList({ method: 'offline' });
    expect(res.code).toBe(200);
    res.data.list.forEach(function(item) {
      expect(item.method).toBe('offline');
    });
  });

  test('列表项包含skillInfo和methodInfo', async function() {
    var res = await api.remoteApi.getTeachingList();
    expect(res.code).toBe(200);
    if (res.data.list.length > 0) {
      expect(res.data.list[0]).toHaveProperty('skillInfo');
      expect(res.data.list[0]).toHaveProperty('methodInfo');
      expect(res.data.list[0]).toHaveProperty('regionName');
      expect(res.data.list[0]).toHaveProperty('timeCommitmentInfo');
    }
  });
});

describe('api.remoteApi.getTeachingDetail', function() {
  test('返回教学详情', async function() {
    var res = await api.remoteApi.getTeachingDetail('teach_001');
    expect(res.code).toBe(200);
    expect(res.data.id).toBe('teach_001');
    expect(res.data.title).toBe('苏绣基础技法传授');
  });

  test('每次获取详情viewCount递增', async function() {
    var before = wx.getStorageSync('teachings').find(function(t) { return t.id === 'teach_001'; });
    var viewCountBefore = before.viewCount;
    await api.remoteApi.getTeachingDetail('teach_001');
    var after = wx.getStorageSync('teachings').find(function(t) { return t.id === 'teach_001'; });
    expect(after.viewCount).toBe(viewCountBefore + 1);
  });

  test('不存在的ID返回404', async function() {
    var res = await api.remoteApi.getTeachingDetail('not_exist');
    expect(res.code).toBe(404);
  });

  test('空ID返回400', async function() {
    var res = await api.remoteApi.getTeachingDetail('');
    expect(res.code).toBe(400);
  });
});

describe('api.remoteApi.publishTeaching', function() {
  test('创建教学成功', async function() {
    var res = await api.remoteApi.publishTeaching({
      skillType: 'weaving',
      title: '织布教学',
      description: '传授织布技艺',
      method: 'offline',
      region: 'east'
    });
    expect(res.code).toBe(200);
    expect(res.data.skillType).toBe('weaving');
    expect(res.data.title).toBe('织布教学');
    expect(res.data.status).toBe(1);
    expect(res.data.currentStudents).toBe(0);
    expect(res.data.masterId).toBe(defaultUser.id);
  });

  test('缺少skillType返回400', async function() {
    var res = await api.remoteApi.publishTeaching({ title: 'test', description: 'desc', method: 'offline', region: 'east' });
    expect(res.code).toBe(400);
  });

  test('缺少title返回400', async function() {
    var res = await api.remoteApi.publishTeaching({ skillType: 'weaving', description: 'desc', method: 'offline', region: 'east' });
    expect(res.code).toBe(400);
  });

  test('缺少description返回400', async function() {
    var res = await api.remoteApi.publishTeaching({ skillType: 'weaving', title: 'test', method: 'offline', region: 'east' });
    expect(res.code).toBe(400);
  });

  test('缺少method返回400', async function() {
    var res = await api.remoteApi.publishTeaching({ skillType: 'weaving', title: 'test', description: 'desc', region: 'east' });
    expect(res.code).toBe(400);
  });

  test('缺少region返回400', async function() {
    var res = await api.remoteApi.publishTeaching({ skillType: 'weaving', title: 'test', description: 'desc', method: 'offline' });
    expect(res.code).toBe(400);
  });
});

describe('api.remoteApi.updateTeaching', function() {
  test('更新自己的教学', async function() {
    var teachings = wx.getStorageSync('teachings');
    teachings[0].masterId = defaultUser.id;
    wx.setStorageSync('teachings', teachings);

    var res = await api.remoteApi.updateTeaching('teach_001', { title: '更新后标题' });
    expect(res.code).toBe(200);
    expect(res.data.title).toBe('更新后标题');
  });

  test('更新不存在的教学返回404', async function() {
    var res = await api.remoteApi.updateTeaching('not_exist', { title: 'test' });
    expect(res.code).toBe(404);
  });
});

describe('api.remoteApi.deleteTeaching', function() {
  test('删除自己的教学', async function() {
    var teachings = wx.getStorageSync('teachings');
    teachings[0].masterId = defaultUser.id;
    wx.setStorageSync('teachings', teachings);

    var res = await api.remoteApi.deleteTeaching('teach_001');
    expect(res.code).toBe(200);
    var remaining = wx.getStorageSync('teachings');
    expect(remaining.find(function(t) { return t.id === 'teach_001'; })).toBeUndefined();
  });

  test('删除别人的教学返回404', async function() {
    var res = await api.remoteApi.deleteTeaching('teach_001');
    expect(res.code).toBe(404);
  });
});

describe('api.remoteApi.getLearningList', function() {
  test('返回学习需求列表带分页', async function() {
    var res = await api.remoteApi.getLearningList({ page: 1, pageSize: 2 });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeLessThanOrEqual(2);
    expect(res.data).toHaveProperty('total');
    expect(res.data).toHaveProperty('hasMore');
  });

  test('按skillType筛选', async function() {
    var res = await api.remoteApi.getLearningList({ skillType: 'papercut' });
    expect(res.code).toBe(200);
    res.data.list.forEach(function(item) {
      expect(item.skillType).toBe('papercut');
    });
  });

  test('列表项包含skillInfo', async function() {
    var res = await api.remoteApi.getLearningList();
    expect(res.code).toBe(200);
    if (res.data.list.length > 0) {
      expect(res.data.list[0]).toHaveProperty('skillInfo');
      expect(res.data.list[0]).toHaveProperty('regionName');
    }
  });
});

describe('api.remoteApi.getLearningDetail', function() {
  test('返回学习需求详情', async function() {
    var res = await api.remoteApi.getLearningDetail('learn_001');
    expect(res.code).toBe(200);
    expect(res.data.id).toBe('learn_001');
  });

  test('不存在的ID返回404', async function() {
    var res = await api.remoteApi.getLearningDetail('not_exist');
    expect(res.code).toBe(404);
  });
});

describe('api.remoteApi.publishLearning', function() {
  test('创建学习需求成功', async function() {
    var res = await api.remoteApi.publishLearning({
      skillType: 'weaving',
      title: '想学织布',
      description: '学习织布技艺',
      region: 'east'
    });
    expect(res.code).toBe(200);
    expect(res.data.skillType).toBe('weaving');
    expect(res.data.learnerId).toBe(defaultUser.id);
    expect(res.data.status).toBe(1);
  });

  test('缺少skillType返回400', async function() {
    var res = await api.remoteApi.publishLearning({ title: 'test', description: 'desc', region: 'east' });
    expect(res.code).toBe(400);
  });

  test('缺少title返回400', async function() {
    var res = await api.remoteApi.publishLearning({ skillType: 'weaving', description: 'desc', region: 'east' });
    expect(res.code).toBe(400);
  });

  test('缺少region返回400', async function() {
    var res = await api.remoteApi.publishLearning({ skillType: 'weaving', title: 'test', description: 'desc' });
    expect(res.code).toBe(400);
  });
});

describe('api.remoteApi.updateLearning', function() {
  test('更新自己的学习需求', async function() {
    var learnings = wx.getStorageSync('learnings');
    learnings[0].learnerId = defaultUser.id;
    wx.setStorageSync('learnings', learnings);

    var res = await api.remoteApi.updateLearning('learn_001', { title: '更新后标题' });
    expect(res.code).toBe(200);
    expect(res.data.title).toBe('更新后标题');
  });
});

describe('api.remoteApi.deleteLearning', function() {
  test('删除自己的学习需求', async function() {
    var learnings = wx.getStorageSync('learnings');
    learnings[0].learnerId = defaultUser.id;
    wx.setStorageSync('learnings', learnings);

    var res = await api.remoteApi.deleteLearning('learn_001');
    expect(res.code).toBe(200);
    var remaining = wx.getStorageSync('learnings');
    expect(remaining.find(function(l) { return l.id === 'learn_001'; })).toBeUndefined();
  });
});

describe('api.remoteApi.getPairingMatches', function() {
  test('为学习需求返回匹配的教学', async function() {
    var res = await api.remoteApi.getPairingMatches({ type: 'learning', id: 'learn_002' });
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('list');
    expect(res.data).toHaveProperty('total');
  });

  test('为教学返回匹配的学习需求', async function() {
    var res = await api.remoteApi.getPairingMatches({ type: 'teaching', id: 'teach_001' });
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('list');
  });

  test('空ID返回400', async function() {
    var res = await api.remoteApi.getPairingMatches({ type: 'learning', id: '' });
    expect(res.code).toBe(400);
  });

  test('不存在ID返回404', async function() {
    var res = await api.remoteApi.getPairingMatches({ type: 'learning', id: 'not_exist' });
    expect(res.code).toBe(404);
  });
});

describe('api.remoteApi.createPairing', function() {
  test('创建结对成功', async function() {
    var res = await api.remoteApi.createPairing({ teachingId: 'teach_002', learningId: 'learn_001' });
    expect(res.code).toBe(200);
    expect(res.data.status).toBe('pending');
    expect(res.data.messageEnabled).toBe(false);
    expect(res.data.teachingId).toBe('teach_002');
    expect(res.data.learnerId).toBe(defaultUser.id);
  });

  test('缺少teachingId返回400', async function() {
    var res = await api.remoteApi.createPairing({ learningId: 'learn_001' });
    expect(res.code).toBe(400);
  });

  test('缺少learningId返回400', async function() {
    var res = await api.remoteApi.createPairing({ teachingId: 'teach_001' });
    expect(res.code).toBe(400);
  });

  test('重复结对返回400', async function() {
    await api.remoteApi.createPairing({ teachingId: 'teach_002', learningId: 'learn_001' });
    var res = await api.remoteApi.createPairing({ teachingId: 'teach_002', learningId: 'learn_001' });
    expect(res.code).toBe(400);
  });

  test('已满员教学返回400', async function() {
    var teachings = wx.getStorageSync('teachings');
    var t = teachings.find(function(item) { return item.id === 'teach_002'; });
    t.currentStudents = t.maxStudents;
    wx.setStorageSync('teachings', teachings);
    var res = await api.remoteApi.createPairing({ teachingId: 'teach_002', learningId: 'learn_001' });
    expect(res.code).toBe(400);
  });
});

describe('api.remoteApi.getPairingList', function() {
  test('返回当前用户的结对列表', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].learnerId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.getPairingList();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
  });

  test('按status筛选', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].learnerId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.getPairingList({ status: 'active' });
    expect(res.code).toBe(200);
    res.data.list.forEach(function(item) {
      expect(item.status).toBe('active');
    });
  });

  test('按role=master筛选', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].masterId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.getPairingList({ role: 'master' });
    expect(res.code).toBe(200);
    res.data.list.forEach(function(item) {
      expect(item.masterId).toBe(defaultUser.id);
    });
  });

  test('按role=learner筛选', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].learnerId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.getPairingList({ role: 'learner' });
    expect(res.code).toBe(200);
    res.data.list.forEach(function(item) {
      expect(item.learnerId).toBe(defaultUser.id);
    });
  });
});

describe('api.remoteApi.getPairingDetail', function() {
  test('返回结对详情', async function() {
    var res = await api.remoteApi.getPairingDetail('pair_001');
    expect(res.code).toBe(200);
    expect(res.data.id).toBe('pair_001');
    expect(res.data).toHaveProperty('statusInfo');
    expect(res.data).toHaveProperty('skillInfo');
    expect(res.data).toHaveProperty('checkinCount');
  });

  test('空ID返回400', async function() {
    var res = await api.remoteApi.getPairingDetail('');
    expect(res.code).toBe(400);
  });

  test('不存在返回404', async function() {
    var res = await api.remoteApi.getPairingDetail('not_exist');
    expect(res.code).toBe(404);
  });
});

describe('api.remoteApi.acceptPairing', function() {
  test('师傅确认结对，状态变为active', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'pending';
    pairings[0].masterId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.acceptPairing('pair_001');
    expect(res.code).toBe(200);
    expect(res.data.status).toBe('active');
    expect(res.data.messageEnabled).toBe(true);
  });

  test('确认结对后currentStudents递增', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'pending';
    pairings[0].masterId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var teachings = wx.getStorageSync('teachings');
    var beforeCount = teachings.find(function(t) { return t.id === 'teach_001'; }).currentStudents;

    await api.remoteApi.acceptPairing('pair_001');

    var updatedTeachings = wx.getStorageSync('teachings');
    var afterCount = updatedTeachings.find(function(t) { return t.id === 'teach_001'; }).currentStudents;
    expect(afterCount).toBe(beforeCount + 1);
  });

  test('非师傅确认返回403', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'pending';
    pairings[0].masterId = 'other_user';
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.acceptPairing('pair_001');
    expect(res.code).toBe(403);
  });

  test('非pending状态返回400', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'active';
    pairings[0].masterId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.acceptPairing('pair_001');
    expect(res.code).toBe(400);
  });
});

describe('api.remoteApi.rejectPairing', function() {
  test('师傅拒绝结对，状态变为cancelled', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'pending';
    pairings[0].masterId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.rejectPairing('pair_001');
    expect(res.code).toBe(200);
    var updated = wx.getStorageSync('pairings').find(function(p) { return p.id === 'pair_001'; });
    expect(updated.status).toBe('cancelled');
  });

  test('非师傅拒绝返回403', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'pending';
    pairings[0].masterId = 'other_user';
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.rejectPairing('pair_001');
    expect(res.code).toBe(403);
  });
});

describe('api.remoteApi.cancelPairing', function() {
  test('学员取消结对', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'pending';
    pairings[0].learnerId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.cancelPairing('pair_001');
    expect(res.code).toBe(200);
    var updated = wx.getStorageSync('pairings').find(function(p) { return p.id === 'pair_001'; });
    expect(updated.status).toBe('cancelled');
    expect(updated.messageEnabled).toBe(false);
  });

  test('无权取消返回403', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'pending';
    pairings[0].masterId = 'other_user';
    pairings[0].learnerId = 'other_user2';
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.cancelPairing('pair_001');
    expect(res.code).toBe(403);
  });

  test('completed状态无法取消', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'completed';
    pairings[0].learnerId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.cancelPairing('pair_001');
    expect(res.code).toBe(400);
  });
});

describe('api.remoteApi.completePairing', function() {
  test('师傅结业结对，状态变为completed', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'active';
    pairings[0].masterId = defaultUser.id;
    pairings[0].checkins = [{ hours: 3 }, { hours: 2 }];
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.completePairing('pair_001');
    expect(res.code).toBe(200);
    expect(res.data.status).toBe('completed');
    expect(res.data.totalHours).toBe(5);
    expect(res.data).toHaveProperty('completeTime');
  });

  test('非师傅结业返回403', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'active';
    pairings[0].masterId = 'other_user';
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.completePairing('pair_001');
    expect(res.code).toBe(403);
  });

  test('非active状态返回400', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'pending';
    pairings[0].masterId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.completePairing('pair_001');
    expect(res.code).toBe(400);
  });
});

describe('api.remoteApi.studyCheckin', function() {
  test('学员打卡成功', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'active';
    pairings[0].learnerId = defaultUser.id;
    pairings[0].checkins = [];
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.studyCheckin('pair_001', { hours: 2, content: '学习了基础针法' });
    expect(res.code).toBe(200);
    expect(res.data.hours).toBe(2);
    expect(res.data.content).toBe('学习了基础针法');

    var updated = wx.getStorageSync('pairings').find(function(p) { return p.id === 'pair_001'; });
    expect(updated.checkins.length).toBe(1);
    expect(updated.totalHours).toBe(2);
  });

  test('学时必须大于0', async function() {
    var res = await api.remoteApi.studyCheckin('pair_001', { hours: 0, content: 'test' });
    expect(res.code).toBe(400);
  });

  test('单次学时不能超过12', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'active';
    pairings[0].learnerId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.studyCheckin('pair_001', { hours: 13, content: 'test' });
    expect(res.code).toBe(400);
  });

  test('非学员打卡返回403', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'active';
    pairings[0].learnerId = 'other_user';
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.studyCheckin('pair_001', { hours: 2, content: 'test' });
    expect(res.code).toBe(403);
  });

  test('非active状态不能打卡', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'pending';
    pairings[0].learnerId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.studyCheckin('pair_001', { hours: 2, content: 'test' });
    expect(res.code).toBe(400);
  });
});

describe('api.remoteApi.getStudyCheckins', function() {
  test('返回打卡记录列表', async function() {
    var res = await api.remoteApi.getStudyCheckins('pair_001');
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('checkins');
    expect(res.data).toHaveProperty('totalHours');
    expect(res.data).toHaveProperty('checkinCount');
  });

  test('空ID返回400', async function() {
    var res = await api.remoteApi.getStudyCheckins('');
    expect(res.code).toBe(400);
  });

  test('不存在返回404', async function() {
    var res = await api.remoteApi.getStudyCheckins('not_exist');
    expect(res.code).toBe(404);
  });
});

describe('api.remoteApi.generateCommemorativeCard', function() {
  test('为已结业结对生成纪念卡', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'completed';
    pairings[0].checkins = [{ hours: 3 }, { hours: 2 }];
    pairings[0].totalHours = 5;
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.generateCommemorativeCard('pair_001');
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('cardId');
    expect(res.data).toHaveProperty('masterName');
    expect(res.data).toHaveProperty('learnerName');
    expect(res.data).toHaveProperty('skillName');
    expect(res.data.totalHours).toBe(5);
    expect(res.data.checkinCount).toBe(2);

    var cards = wx.getStorageSync('commemorativeCards');
    expect(cards['pair_001']).toBeDefined();
  });

  test('未结业结对返回400', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'active';
    wx.setStorageSync('pairings', pairings);

    var res = await api.remoteApi.generateCommemorativeCard('pair_001');
    expect(res.code).toBe(400);
  });

  test('空ID返回400', async function() {
    var res = await api.remoteApi.generateCommemorativeCard('');
    expect(res.code).toBe(400);
  });
});

describe('api.remoteApi.getCommemorativeCard', function() {
  test('获取已生成的纪念卡', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'completed';
    pairings[0].checkins = [];
    wx.setStorageSync('pairings', pairings);

    await api.remoteApi.generateCommemorativeCard('pair_001');

    var res = await api.remoteApi.getCommemorativeCard('pair_001');
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('cardId');
  });

  test('自动为已结业结对生成纪念卡', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'completed';
    pairings[0].commemorativeCardGenerated = false;
    wx.setStorageSync('pairings', pairings);
    wx.removeStorageSync('commemorativeCards');
    wx.setStorageSync('commemorativeCards', {});

    var res = await api.remoteApi.getCommemorativeCard('pair_001');
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('cardId');

    var cards = wx.getStorageSync('commemorativeCards');
    expect(cards['pair_001']).toBeDefined();
  });

  test('未结业结对返回400', async function() {
    var pairings = wx.getStorageSync('pairings');
    pairings[0].status = 'active';
    wx.setStorageSync('pairings', pairings);
    wx.setStorageSync('commemorativeCards', {});

    var res = await api.remoteApi.getCommemorativeCard('pair_001');
    expect(res.code).toBe(400);
  });
});

describe('师徒结对完整流程', function() {
  test('发布教学→发布学习需求→匹配→创建结对→确认→打卡→结业→生成纪念卡', async function() {
    var learnRes = await api.remoteApi.publishLearning({
      skillType: 'embroidery',
      title: '想学刺绣',
      description: '学习刺绣技艺',
      region: 'east',
      timeCommitment: 'weekly',
      tags: ['刺绣']
    });
    expect(learnRes.code).toBe(200);
    var learningId = learnRes.data.id;

    var matchRes = await api.remoteApi.getPairingMatches({ type: 'learning', id: learningId });
    expect(matchRes.code).toBe(200);
    expect(matchRes.data.total).toBeGreaterThan(0);
    var teachingId = matchRes.data.list[0].teaching.id;

    var pairRes = await api.remoteApi.createPairing({ teachingId: teachingId, learningId: learningId });
    expect(pairRes.code).toBe(200);
    expect(pairRes.data.status).toBe('pending');
    expect(pairRes.data.messageEnabled).toBe(false);
    var pairingId = pairRes.data.id;

    var teachings = wx.getStorageSync('teachings');
    var teachObj = teachings.find(function(t) { return t.id === teachingId; });
    var beforeStudents = teachObj.currentStudents;
    var pairings = wx.getStorageSync('pairings');
    var pairIndex = pairings.findIndex(function(p) { return p.id === pairingId; });
    pairings[pairIndex].masterId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var acceptRes = await api.remoteApi.acceptPairing(pairingId);
    expect(acceptRes.code).toBe(200);
    expect(acceptRes.data.status).toBe('active');
    expect(acceptRes.data.messageEnabled).toBe(true);

    var updatedTeachings = wx.getStorageSync('teachings');
    var updatedTeach = updatedTeachings.find(function(t) { return t.id === teachingId; });
    expect(updatedTeach.currentStudents).toBe(beforeStudents + 1);

    pairings = wx.getStorageSync('pairings');
    pairIndex = pairings.findIndex(function(p) { return p.id === pairingId; });
    pairings[pairIndex].learnerId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var checkinRes = await api.remoteApi.studyCheckin(pairingId, { hours: 3, content: '第一次学习' });
    expect(checkinRes.code).toBe(200);
    expect(checkinRes.data.hours).toBe(3);

    var checkinsRes = await api.remoteApi.getStudyCheckins(pairingId);
    expect(checkinsRes.code).toBe(200);
    expect(checkinsRes.data.checkinCount).toBe(1);
    expect(checkinsRes.data.totalHours).toBe(3);

    pairings = wx.getStorageSync('pairings');
    pairIndex = pairings.findIndex(function(p) { return p.id === pairingId; });
    pairings[pairIndex].masterId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var completeRes = await api.remoteApi.completePairing(pairingId);
    expect(completeRes.code).toBe(200);
    expect(completeRes.data.status).toBe('completed');
    expect(completeRes.data.totalHours).toBe(3);

    var cardRes = await api.remoteApi.generateCommemorativeCard(pairingId);
    expect(cardRes.code).toBe(200);
    expect(cardRes.data).toHaveProperty('cardId');
    expect(cardRes.data.totalHours).toBe(3);
    expect(cardRes.data.checkinCount).toBe(1);

    var getCardRes = await api.remoteApi.getCommemorativeCard(pairingId);
    expect(getCardRes.code).toBe(200);
    expect(getCardRes.data.cardId).toBe(cardRes.data.cardId);
  });

  test('acceptPairing启用messageEnabled并递增currentStudents', async function() {
    var teachRes = await api.remoteApi.publishTeaching({
      skillType: 'pottery',
      title: '陶艺教学',
      description: '传授陶艺',
      method: 'offline',
      region: 'east'
    });
    var teachingId = teachRes.data.id;

    var learnRes = await api.remoteApi.publishLearning({
      skillType: 'pottery',
      title: '想学陶艺',
      description: '学习陶艺',
      region: 'east'
    });
    var learningId = learnRes.data.id;

    var pairRes = await api.remoteApi.createPairing({ teachingId: teachingId, learningId: learningId });
    var pairingId = pairRes.data.id;
    expect(pairRes.data.messageEnabled).toBe(false);

    var pairings = wx.getStorageSync('pairings');
    var pairIndex = pairings.findIndex(function(p) { return p.id === pairingId; });
    pairings[pairIndex].masterId = defaultUser.id;
    wx.setStorageSync('pairings', pairings);

    var teachings = wx.getStorageSync('teachings');
    var teachIndex = teachings.findIndex(function(t) { return t.id === teachingId; });
    var beforeStudents = teachings[teachIndex].currentStudents;

    var acceptRes = await api.remoteApi.acceptPairing(pairingId);
    expect(acceptRes.data.messageEnabled).toBe(true);
    expect(acceptRes.data.status).toBe('active');

    var updatedTeachings = wx.getStorageSync('teachings');
    var afterStudents = updatedTeachings.find(function(t) { return t.id === teachingId; }).currentStudents;
    expect(afterStudents).toBe(beforeStudents + 1);
  });
});
