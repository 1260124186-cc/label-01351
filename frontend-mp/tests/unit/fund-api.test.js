const api = require('../../utils/api');
const { initStorage, loginAsUser } = require('../helpers');

function loginAsAdmin() {
  const adminUser = {
    id: 'admin_001',
    nickname: '管理员',
    avatar: '',
    phone: '13900000000',
    role: 'admin',
    createTime: '2024-01-01'
  };

  const users = wx.getStorageSync('users') || [];
  const existingIndex = users.findIndex(u => u.id === 'admin_001');
  if (existingIndex >= 0) {
    users[existingIndex] = adminUser;
  } else {
    users.push(adminUser);
  }
  wx.setStorageSync('users', users);
  wx.setStorageSync('isLoggedIn', true);
  wx.setStorageSync('userInfo', adminUser);
  return adminUser;
}

beforeEach(() => {
  jest.clearAllMocks();
  initStorage();
});

describe('api.getFundProjectList', () => {
  beforeEach(() => {
    initStorage();
  });

  test('返回基金项目列表', async () => {
    const res = await api.getFundProjectList();
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('list');
    expect(Array.isArray(res.data.list)).toBe(true);
    expect(res.data.list.length).toBeGreaterThan(0);
  });

  test('每个项目包含必要字段', async () => {
    const res = await api.getFundProjectList();
    const project = res.data.list[0];
    expect(project).toHaveProperty('id');
    expect(project).toHaveProperty('name');
    expect(project).toHaveProperty('targetAmount');
    expect(project).toHaveProperty('raisedAmount');
    expect(project).toHaveProperty('usedAmount');
    expect(project).toHaveProperty('progress');
    expect(project).toHaveProperty('beneficiaryDesc');
    expect(project).toHaveProperty('statusInfo');
  });

  test('按状态筛选项目', async () => {
    const res = await api.getFundProjectList({ status: 'ongoing' });
    expect(res.code).toBe(200);
    const allOngoing = res.data.list.every(item => item.projectStatus === 'ongoing');
    expect(allOngoing).toBe(true);
  });

  test('按关键词搜索项目（项目名称匹配）', async () => {
    const allRes = await api.getFundProjectList();
    const firstProject = allRes.data.list[0];
    const keyword = firstProject.name.substring(0, 2);

    const res = await api.getFundProjectList({ keyword });
    expect(res.code).toBe(200);
    expect(res.data.list.length).toBeGreaterThan(0);
  });

  test('分页功能正常工作', async () => {
    const res1 = await api.getFundProjectList({ page: 1, pageSize: 2 });
    expect(res1.code).toBe(200);
    expect(res1.data.page).toBe(1);
    expect(res1.data).toHaveProperty('hasMore');
  });

  test('项目带有状态信息', async () => {
    const res = await api.getFundProjectList();
    const project = res.data.list[0];
    expect(project.statusInfo).toHaveProperty('id');
    expect(project.statusInfo).toHaveProperty('name');
    expect(project.statusInfo).toHaveProperty('color');
    expect(project.statusInfo).toHaveProperty('icon');
  });

  test('进度值在0-100之间', async () => {
    const res = await api.getFundProjectList();
    res.data.list.forEach(item => {
      expect(item.progress).toBeGreaterThanOrEqual(0);
      expect(item.progress).toBeLessThanOrEqual(100);
    });
  });
});

describe('api.getFundProjectDetail', () => {
  let projectId;

  beforeEach(async () => {
    initStorage();
    const listRes = await api.getFundProjectList();
    projectId = listRes.data.list[0].id;
  });

  test('返回项目详情', async () => {
    const res = await api.getFundProjectDetail(projectId);
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('id');
    expect(res.data.id).toBe(projectId);
  });

  test('详情包含时间线', async () => {
    const res = await api.getFundProjectDetail(projectId);
    expect(res.data).toHaveProperty('timeline');
    expect(Array.isArray(res.data.timeline)).toBe(true);
  });

  test('详情包含评论', async () => {
    const res = await api.getFundProjectDetail(projectId);
    expect(res.data).toHaveProperty('comments');
    expect(Array.isArray(res.data.comments)).toBe(true);
  });

  test('详情包含捐赠记录', async () => {
    const res = await api.getFundProjectDetail(projectId);
    expect(res.data).toHaveProperty('donations');
    expect(Array.isArray(res.data.donations)).toBe(true);
  });

  test('详情包含关联文章', async () => {
    const res = await api.getFundProjectDetail(projectId);
    expect(res.data).toHaveProperty('relatedArticles');
    expect(Array.isArray(res.data.relatedArticles)).toBe(true);
  });

  test('详情包含关联活动', async () => {
    const res = await api.getFundProjectDetail(projectId);
    expect(res.data).toHaveProperty('relatedActivities');
    expect(Array.isArray(res.data.relatedActivities)).toBe(true);
  });

  test('浏览量和留言数', async () => {
    const res = await api.getFundProjectDetail(projectId);
    expect(res.data).toHaveProperty('viewCount');
    expect(res.data).toHaveProperty('commentCount');
    expect(typeof res.data.viewCount).toBe('number');
  });

  test('不存在的项目返回错误', async () => {
    const res = await api.getFundProjectDetail('non_existent_id');
    expect(res.code).not.toBe(200);
  });
});

describe('api.createFundProject（管理员）', () => {
  beforeEach(() => {
    initStorage();
    loginAsAdmin();
  });

  test('创建新项目成功', async () => {
    const projectData = {
      name: '测试公益项目',
      targetAmount: 100000,
      description: '这是一个测试项目的详细描述',
      beneficiaryDesc: '受益群体说明'
    };

    const res = await api.createFundProject(projectData);
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('id');
    expect(res.data.name).toBe(projectData.name);
    expect(res.data.targetAmount).toBe(projectData.targetAmount);
  });

  test('新项目默认为进行中状态', async () => {
    const projectData = {
      name: '测试状态项目',
      targetAmount: 50000,
      description: '测试描述',
      beneficiaryDesc: '受益说明'
    };

    const res = await api.createFundProject(projectData);
    expect(res.code).toBe(200);
    expect(res.data.projectStatus).toBe('ongoing');
  });

  test('新项目筹款和使用金额初始为0', async () => {
    const projectData = {
      name: '初始金额测试',
      targetAmount: 20000,
      description: '测试',
      beneficiaryDesc: '测试'
    };

    const res = await api.createFundProject(projectData);
    expect(res.data.raisedAmount).toBe(0);
    expect(res.data.usedAmount).toBe(0);
    expect(res.data.progress).toBe(0);
  });

  test('非管理员创建项目返回403', async () => {
    loginAsUser('user_002', '普通用户');
    const res = await api.createFundProject({
      name: '测试',
      targetAmount: 1000,
      description: '测试',
      beneficiaryDesc: '测试'
    });
    expect(res.code).toBe(403);
  });
});

describe('api.updateFundProject（管理员）', () => {
  let projectId;

  beforeEach(async () => {
    initStorage();
    loginAsAdmin();
    const createRes = await api.createFundProject({
      name: '待更新项目',
      targetAmount: 10000,
      description: '原描述',
      beneficiaryDesc: '原受益说明'
    });
    projectId = createRes.data.id;
  });

  test('更新项目信息成功', async () => {
    const updateData = {
      name: '更新后的项目名称',
      description: '更新后的描述'
    };

    const res = await api.updateFundProject(projectId, updateData);
    expect(res.code).toBe(200);
    expect(res.data.name).toBe('更新后的项目名称');
    expect(res.data.description).toBe('更新后的描述');
  });

  test('更新项目状态', async () => {
    const res = await api.updateFundProject(projectId, { projectStatus: 'ended' });
    expect(res.code).toBe(200);
    expect(res.data.projectStatus).toBe('ended');
  });

  test('更新不存在的项目返回错误', async () => {
    const res = await api.updateFundProject('non_existent', { name: 'test' });
    expect(res.code).not.toBe(200);
  });
});

describe('api.addFundComment', () => {
  let projectId;

  beforeEach(async () => {
    initStorage();
    loginAsUser('user_001', '测试用户');
    const listRes = await api.getFundProjectList();
    projectId = listRes.data.list[0].id;
  });

  test('添加留言成功', async () => {
    const res = await api.addFundComment(projectId, '这是一条支持留言');
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('id');
    expect(res.data.content).toBe('这是一条支持留言');
  });

  test('新留言默认为待审核状态', async () => {
    const res = await api.addFundComment(projectId, '待审核留言');
    expect(res.code).toBe(200);
    expect(res.data.reviewStatus).toBe('pending');
  });

  test('空内容留言返回错误', async () => {
    const res = await api.addFundComment(projectId, '');
    expect(res.code).not.toBe(200);
  });

  test('留言内容长度限制', async () => {
    const longContent = 'a'.repeat(201);
    const res = await api.addFundComment(projectId, longContent);
    expect(res.code).toBe(400);
  });
});

describe('api.getPendingFundComments（管理员）', () => {
  beforeEach(async () => {
    initStorage();
    loginAsUser('user_001', '测试用户');
    const listRes = await api.getFundProjectList();
    const projectId = listRes.data.list[0].id;
    await api.addFundComment(projectId, '待审核留言1');
    await api.addFundComment(projectId, '待审核留言2');
    loginAsAdmin();
  });

  test('返回待审核留言列表', async () => {
    const res = await api.getPendingFundComments();
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('list');
    expect(Array.isArray(res.data.list)).toBe(true);
    expect(res.data.list.length).toBeGreaterThan(0);
  });

  test('待审核留言状态为pending', async () => {
    const res = await api.getPendingFundComments();
    if (res.data.list.length > 0) {
      const allPending = res.data.list.every(item => item.reviewStatus === 'pending');
      expect(allPending).toBe(true);
    }
  });

  test('非管理员返回403', async () => {
    loginAsUser('user_002', '普通用户');
    const res = await api.getPendingFundComments();
    expect(res.code).toBe(403);
  });
});

describe('api.approveFundComment（管理员）', () => {
  let commentId;

  beforeEach(async () => {
    initStorage();
    loginAsUser('user_001', '测试用户');
    const listRes = await api.getFundProjectList();
    const projectId = listRes.data.list[0].id;
    const commentRes = await api.addFundComment(projectId, '测试留言');
    commentId = commentRes.data.id;
    loginAsAdmin();
  });

  test('审核通过留言成功', async () => {
    const res = await api.approveFundComment(commentId);
    expect(res.code).toBe(200);
  });

  test('非管理员返回403', async () => {
    loginAsUser('user_002', '普通用户');
    const res = await api.approveFundComment(commentId);
    expect(res.code).toBe(403);
  });
});

describe('api.rejectFundComment（管理员）', () => {
  let commentId;

  beforeEach(async () => {
    initStorage();
    loginAsUser('user_001', '测试用户');
    const listRes = await api.getFundProjectList();
    const projectId = listRes.data.list[0].id;
    const commentRes = await api.addFundComment(projectId, '测试驳回留言');
    commentId = commentRes.data.id;
    loginAsAdmin();
  });

  test('驳回留言成功', async () => {
    const res = await api.rejectFundComment(commentId, '内容不符合要求');
    expect(res.code).toBe(200);
  });

  test('驳回原因为空返回错误', async () => {
    const res = await api.rejectFundComment(commentId, '');
    expect(res.code).not.toBe(200);
  });

  test('非管理员返回403', async () => {
    loginAsUser('user_002', '普通用户');
    const res = await api.rejectFundComment(commentId, '原因');
    expect(res.code).toBe(403);
  });
});

describe('api.addFundDonation（管理员）', () => {
  let projectId;

  beforeEach(async () => {
    initStorage();
    loginAsAdmin();
    const createRes = await api.createFundProject({
      name: '捐赠测试项目',
      targetAmount: 100000,
      description: '测试',
      beneficiaryDesc: '测试'
    });
    projectId = createRes.data.id;
  });

  test('添加捐赠记录成功', async () => {
    const donationData = {
      donorName: '张三',
      amount: 1000,
      method: 'offline_bank',
      remark: '支持公益事业'
    };

    const res = await api.addFundDonation(projectId, donationData);
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('id');
    expect(res.data.amount).toBe(1000);
    expect(res.data.donorName).toBe('张三');
  });

  test('捐赠后项目已筹金额增加', async () => {
    const beforeRes = await api.getFundProjectDetail(projectId);
    const beforeAmount = beforeRes.data.raisedAmount;

    await api.addFundDonation(projectId, {
      donorName: '李四',
      amount: 500,
      method: 'offline_wechat'
    });

    const afterRes = await api.getFundProjectDetail(projectId);
    expect(afterRes.data.raisedAmount).toBe(beforeAmount + 500);
  });

  test('金额为0或负数返回错误', async () => {
    const res = await api.addFundDonation(projectId, {
      donorName: '测试',
      amount: 0,
      method: 'offline_bank'
    });
    expect(res.code).not.toBe(200);
  });

  test('匿名捐赠显示匿名人士', async () => {
    const res = await api.addFundDonation(projectId, {
      donorName: '王五',
      amount: 200,
      method: 'offline_alipay',
      isAnonymous: true
    });
    expect(res.data.donorName).toBe('匿名人士');
    expect(res.data.isAnonymous).toBe(true);
  });

  test('非管理员返回403', async () => {
    loginAsUser('user_002', '普通用户');
    const res = await api.addFundDonation(projectId, {
      donorName: '测试',
      amount: 100,
      method: 'offline_bank'
    });
    expect(res.code).toBe(403);
  });
});

describe('api.addFundTimeline（管理员）', () => {
  let projectId;

  beforeEach(async () => {
    initStorage();
    loginAsAdmin();
    const createRes = await api.createFundProject({
      name: '时间线测试项目',
      targetAmount: 50000,
      description: '测试',
      beneficiaryDesc: '测试'
    });
    projectId = createRes.data.id;
  });

  test('添加时间线成功', async () => {
    const timelineData = {
      title: '项目启动',
      date: '2024-01-01',
      content: '项目正式启动',
      type: 'milestone'
    };

    const res = await api.addFundTimeline(projectId, timelineData);
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('id');
    expect(res.data.title).toBe('项目启动');
  });

  test('时间线标题为空返回错误', async () => {
    const res = await api.addFundTimeline(projectId, {
      title: '',
      date: '2024-01-01'
    });
    expect(res.code).not.toBe(200);
  });

  test('默认类型为milestone', async () => {
    const res = await api.addFundTimeline(projectId, {
      title: '测试时间线',
      date: '2024-01-01'
    });
    expect(res.data.type).toBe('milestone');
  });

  test('非管理员返回403', async () => {
    loginAsUser('user_002', '普通用户');
    const res = await api.addFundTimeline(projectId, {
      title: '测试',
      date: '2024-01-01'
    });
    expect(res.code).toBe(403);
  });
});

describe('api.getFundProjectAdminList（管理员）', () => {
  beforeEach(async () => {
    initStorage();
    loginAsAdmin();
    await api.getFundProjectList();
  });

  test('返回管理员项目列表', async () => {
    const res = await api.getFundProjectAdminList();
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('list');
    expect(Array.isArray(res.data.list)).toBe(true);
    expect(res.data.list.length).toBeGreaterThan(0);
  });

  test('按状态筛选项目', async () => {
    const res = await api.getFundProjectAdminList({ status: 'ended' });
    expect(res.code).toBe(200);
    if (res.data.list.length > 0) {
      const allEnded = res.data.list.every(item => item.projectStatus === 'ended');
      expect(allEnded).toBe(true);
    }
  });

  test('分页功能', async () => {
    const res = await api.getFundProjectAdminList({ page: 1, pageSize: 5 });
    expect(res.code).toBe(200);
    expect(res.data.page).toBe(1);
    expect(res.data).toHaveProperty('hasMore');
  });

  test('非管理员返回403', async () => {
    loginAsUser('user_002', '普通用户');
    const res = await api.getFundProjectAdminList();
    expect(res.code).toBe(403);
  });
});
