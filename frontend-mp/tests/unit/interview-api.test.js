const api = require('../../utils/api');
const { initStorage, defaultUser, defaultInterviews } = require('../helpers');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('api.getInterviewList', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回已发布访谈列表', async () => {
    const res = await api.getInterviewList();
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.list.every(item => item.type === 'interview')).toBe(true);
    expect(res.data.list.every(item => item.status === 1)).toBe(true);
  });

  test('按地区筛选访谈', async () => {
    const res = await api.getInterviewList({ region: 'north' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(item => item.region === 'north')).toBe(true);
  });

  test('按年龄组筛选访谈', async () => {
    const res = await api.getInterviewList({ ageGroup: '80-89' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(item => item.age >= 80 && item.age <= 89)).toBe(true);
  });

  test('按技艺类型筛选访谈', async () => {
    const res = await api.getInterviewList({ craft: 'farming' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(item => item.crafts.includes('farming'))).toBe(true);
  });

  test('按合集ID筛选访谈', async () => {
    const res = await api.getInterviewList({ collectionId: 'collection_solar_terms' });
    expect(res.code).toBe(200);
    expect(res.data.list.every(item => item.collectionIds.includes('collection_solar_terms'))).toBe(true);
  });

  test('按关键词搜索（受访者姓名匹配）', async () => {
    const res = await api.getInterviewList({ keyword: '王德福' });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
    expect(res.data.list[0].intervieweeName).toBe('王德福');
  });

  test('按关键词搜索（摘要匹配）', async () => {
    const res = await api.getInterviewList({ keyword: '二十四节气' });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
  });

  test('搜索无结果时返回空列表', async () => {
    const res = await api.getInterviewList({ keyword: '不存在的关键词xyz' });
    expect(res.code).toBe(200);
    expect(res.data.list).toEqual([]);
    expect(res.data.total).toBe(0);
  });

  test('分页功能正常工作', async () => {
    const res1 = await api.getInterviewList({ page: 1, pageSize: 1 });
    expect(res1.code).toBe(200);
    expect(res1.data.list.length).toBe(1);
    expect(res1.data.page).toBe(1);

    const res2 = await api.getInterviewList({ page: 2, pageSize: 1 });
    expect(res2.code).toBe(200);
    expect(res2.data.list.length).toBe(1);
    expect(res2.data.page).toBe(2);
  });

  test('响应格式包含 list/total/page/pageSize/hasMore', async () => {
    const res = await api.getInterviewList({ page: 1, pageSize: 10 });
    expect(res).toHaveProperty('code');
    expect(res).toHaveProperty('data.list');
    expect(res).toHaveProperty('data.total');
    expect(res).toHaveProperty('data.page');
    expect(res).toHaveProperty('data.pageSize');
    expect(res).toHaveProperty('data.hasMore');
    expect(res).toHaveProperty('message');
  });
});

describe('api.getInterviewDetail', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回正确的访谈详情', async () => {
    const res = await api.getInterviewDetail('interview_001');
    expect(res.code).toBe(200);
    expect(res.data.id).toBe('interview_001');
    expect(res.data.intervieweeName).toBe('王德福');
    expect(res.data.type).toBe('interview');
  });

  test('详情包含所有必要字段', async () => {
    const res = await api.getInterviewDetail('interview_001');
    expect(res.data).toHaveProperty('intervieweeName');
    expect(res.data).toHaveProperty('age');
    expect(res.data).toHaveProperty('occupation');
    expect(res.data).toHaveProperty('interviewLocation');
    expect(res.data).toHaveProperty('interviewDate');
    expect(res.data).toHaveProperty('summary');
    expect(res.data).toHaveProperty('content');
    expect(res.data).toHaveProperty('crafts');
    expect(res.data).toHaveProperty('viewCount');
    expect(res.data).toHaveProperty('likeCount');
  });

  test('浏览量自增', async () => {
    const before = await api.getInterviewDetail('interview_001');
    const beforeCount = before.data.viewCount;
    
    const after = await api.getInterviewDetail('interview_001');
    expect(after.data.viewCount).toBe(beforeCount + 1);
  });

  test('访谈不存在时返回错误', async () => {
    const res = await api.getInterviewDetail('nonexistent_id');
    expect(res.code).toBe(404);
    expect(res.message).toBe('访谈不存在');
  });
});

describe('api.createInterview', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('成功创建访谈', async () => {
    const interviewData = {
      intervieweeName: '测试老人',
      gender: '男',
      age: 75,
      birthYear: 1949,
      occupation: '退休教师',
      region: 'north',
      address: '北京市朝阳区',
      interviewDate: '2024-01-01',
      interviewLocation: '老人家中',
      interviewer: '测试采访者',
      crafts: ['storytelling'],
      summary: '这是一个测试访谈的摘要内容，至少需要20个字。',
      content: '采访者：请您谈谈过去的事情？\n\n受访者：好的，我来给你们讲讲我年轻时的经历。那时候村里还没有通电，晚上大家都在院子里聊天，听老人们讲过去的故事。这些记忆至今还深深印在我的脑海里。',
      collectionIds: ['collection_village_history'],
      tags: ['测试', '乡村'],
      relatedFigureId: ''
    };

    const res = await api.createInterview(interviewData);
    expect(res.code).toBe(200);
    expect(res.data.id).toBeDefined();
    expect(res.data.type).toBe('interview');
    expect(res.data.intervieweeName).toBe('测试老人');
  });

  test('创建的访谈状态为待审核（status=0）', async () => {
    const interviewData = {
      intervieweeName: '测试老人',
      age: 75,
      occupation: '退休教师',
      interviewLocation: '老人家中',
      interviewDate: '2024-01-01',
      summary: '这是一个测试访谈的摘要内容，至少需要20个字。',
      content: '采访者：请您谈谈过去的事情？\n\n受访者：好的，我来给你们讲讲我年轻时的经历。那时候村里还没有通电，晚上大家都在院子里聊天，听老人们讲过去的故事。这些记忆至今还深深印在我的脑海里。'
    };

    const res = await api.createInterview(interviewData);
    expect(res.data.status).toBe(0);
  });

  test('必填字段校验', async () => {
    const res = await api.createInterview({});
    expect(res.code).toBe(400);
    expect(res.message).toBe('请填写受访者姓名');
  });

  test('设置作者信息', async () => {
    const interviewData = {
      intervieweeName: '测试老人',
      age: 75,
      occupation: '退休教师',
      interviewLocation: '老人家中',
      interviewDate: '2024-01-01',
      summary: '这是一个测试访谈的摘要内容，至少需要20个字。',
      content: '采访者：请您谈谈过去的事情？\n\n受访者：好的，我来给你们讲讲我年轻时的经历。那时候村里还没有通电，晚上大家都在院子里聊天，听老人们讲过去的故事。这些记忆至今还深深印在我的脑海里。'
    };

    const res = await api.createInterview(interviewData);
    expect(res.data.authorId).toBe(defaultUser.id);
    expect(res.data.authorName).toBe(defaultUser.nickname);
  });
});

describe('api.createInterviewDraft', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('成功保存草稿', async () => {
    const draftData = {
      intervieweeName: '草稿测试',
      summary: '这是一个草稿',
      content: '草稿内容'
    };

    const res = await api.createInterviewDraft(draftData);
    expect(res.code).toBe(200);
    expect(res.data.id).toBeDefined();
    expect(res.data.status).toBe(2);
  });

  test('草稿保存到独立存储', async () => {
    wx.setStorageSync('interviewDrafts', []);
    const beforeDrafts = wx.getStorageSync('interviewDrafts') || [];
    expect(beforeDrafts.length).toBe(0);
    
    const draftData = {
      intervieweeName: '草稿测试',
      content: '草稿内容'
    };

    await api.createInterviewDraft(draftData);
    
    const afterDrafts = wx.getStorageSync('interviewDrafts') || [];
    expect(afterDrafts.length).toBe(1);
  });
});

describe('api.getInterviewFilterOptions', () => {
  test('返回筛选选项', async () => {
    const res = await api.getInterviewFilterOptions();
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('regionList');
    expect(res.data).toHaveProperty('ageGroupList');
    expect(res.data).toHaveProperty('craftList');
  });

  test('地区列表包含全部选项', async () => {
    const res = await api.getInterviewFilterOptions();
    const hasAll = res.data.regionList.some(r => r.id === 'all');
    expect(hasAll).toBe(true);
  });

  test('年龄组列表正确', async () => {
    const res = await api.getInterviewFilterOptions();
    const ageGroups = res.data.ageGroupList;
    expect(ageGroups.length).toBeGreaterThan(0);
    expect(ageGroups.some(g => g.id === '60-69')).toBe(true);
    expect(ageGroups.some(g => g.id === '70-79')).toBe(true);
    expect(ageGroups.some(g => g.id === '80-89')).toBe(true);
    expect(ageGroups.some(g => g.id === '90+')).toBe(true);
  });
});

describe('访谈点赞功能', () => {
  beforeEach(() => {
    initStorage();
    wx.setStorageSync('userInfo', defaultUser);
    wx.setStorageSync('isLoggedIn', true);
  });

  test('成功点赞', async () => {
    const res = await api.likeInterview('interview_001');
    expect(res.code).toBe(200);
    expect(res.data.likeCount).toBe(128);
  });

  test('成功取消点赞', async () => {
    await api.likeInterview('interview_001');
    const res = await api.unlikeInterview('interview_001');
    expect(res.code).toBe(200);
    expect(res.data.likeCount).toBe(127);
  });

  test('检查点赞状态', async () => {
    await api.likeInterview('interview_001');
    const res = await api.checkInterviewLike('interview_001');
    expect(res.code).toBe(200);
    expect(res.data.isLike).toBe(true);
  });

  test('未点赞时返回 false', async () => {
    const res = await api.checkInterviewLike('interview_001');
    expect(res.code).toBe(200);
    expect(res.data.isLike).toBe(false);
  });
});
