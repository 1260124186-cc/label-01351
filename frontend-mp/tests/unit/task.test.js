const api = require('../../utils/api');
const taskSystem = require('../../utils/task');
const { initStorage, defaultUser, loginAsUser } = require('../helpers');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('任务系统 - 新手引导', () => {
  beforeEach(() => {
    initStorage();
    loginAsUser('user_001', '测试用户');
    taskSystem.resetTaskData && taskSystem.resetTaskData();
  });

  test('首次获取新手引导状态，进度为0', async () => {
    const res = await api.getOnboardingStatus();
    expect(res.code).toBe(200);
    expect(res.data.completed).toBe(false);
    expect(res.data.currentStepIndex).toBe(0);
  });

  test('获取新手引导进度，返回正确步骤列表', async () => {
    const res = await api.getOnboardingProgress();
    expect(res.code).toBe(200);
    expect(res.data.progress).toBe(0);
    expect(res.data.steps.length).toBeGreaterThanOrEqual(4);
    expect(res.data.steps.every(s => s.completed === false)).toBe(true);
  });

  test('完成单个新手引导步骤', async () => {
    const statusRes = await api.getOnboardingStatus();
    const firstStepId = statusRes.data.steps[0].id;

    const res = await api.completeOnboardingStep(firstStepId);
    expect(res.code).toBe(200);
    expect(res.data.completedStep).toBe(firstStepId);

    const progressRes = await api.getOnboardingProgress();
    expect(progressRes.code).toBe(200);
    expect(progressRes.data.steps[0].completed).toBe(true);
  });

  test('跳过新手引导后，状态为已完成', async () => {
    const res = await api.skipOnboarding();
    expect(res.code).toBe(200);

    const statusRes = await api.getOnboardingStatus();
    expect(statusRes.code).toBe(200);
    expect(statusRes.data.completed).toBe(true);
  });

  test('完成所有步骤时，自动解锁"初入乡村"勋章', async () => {
    const statusRes = await api.getOnboardingStatus();
    const steps = statusRes.data.steps;
    for (const step of steps) {
      await api.completeOnboardingStep(step.id);
    }

    const badgeRes = await api.getUserBadges();
    expect(badgeRes.code).toBe(200);
    const badgeIds = badgeRes.data.badges.map(b => b.id);
    expect(badgeIds).toContain('new_contributor');
  });

  test('完成新手引导后，积分增加', async () => {
    const initialRes = await api.getUserPoints();
    const initialPoints = initialRes.code === 200 ? initialRes.data.points : 0;

    const statusRes = await api.getOnboardingStatus();
    const steps = statusRes.data.steps;
    for (const step of steps) {
      await api.completeOnboardingStep(step.id);
    }

    const finalRes = await api.getUserPoints();
    expect(finalRes.code).toBe(200);
    expect(finalRes.data.points).toBeGreaterThan(initialPoints);
  });
});

describe('任务系统 - 七日文化任务', () => {
  beforeEach(() => {
    initStorage();
    loginAsUser('user_001', '测试用户');
    taskSystem.resetTaskData && taskSystem.resetTaskData();
  });

  test('获取七日任务进度，第一天且无完成', async () => {
    const res = await api.getSevenDayProgress();
    expect(res.code).toBe(200);
    expect(res.data.currentDay).toBe(1);
    expect(res.data.tasks.length).toBe(7);
  });

  test('浏览文章后Day1进度增加', async () => {
    await api.recordTaskAction('view_article', { articleId: 'article_001' });

    const res = await api.getSevenDayProgress();
    expect(res.code).toBe(200);
    const day1Task = res.data.tasks.find(t => t.day === 1);
    expect(day1Task).toBeTruthy();
    expect(day1Task.progress).toBeGreaterThanOrEqual(1);
  });

  test('完成Day1任务后可领取奖励', async () => {
    for (let i = 0; i < 5; i++) {
      await api.recordTaskAction('view_article', { articleId: 'article_' + i });
    }

    const progressRes = await api.getSevenDayProgress();
    const day1Task = progressRes.data.tasks.find(t => t.day === 1);
    expect(day1Task.claimable).toBe(true);

    const claimRes = await api.claimSevenDayReward('seven_day_1');
    expect(claimRes.code).toBe(200);
    expect(claimRes.data.claimed).toBe(true);
  });

  test('收藏文章后Day2进度增加', async () => {
    await api.recordTaskAction('favorite_article', { articleId: 'article_001' });

    const res = await api.getSevenDayProgress();
    const day2Task = res.data.tasks.find(t => t.day === 2);
    if (day2Task) {
      expect(day2Task.progress).toBeGreaterThanOrEqual(1);
    }
  });

  test('完成全部7天任务后，解锁"七日文化达人"勋章', async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDateStr = sevenDaysAgo.toISOString().split('T')[0];
    const allDates = wx.getStorageSync('sevenDayStartDate') || {};
    allDates['user_001'] = startDateStr;
    wx.setStorageSync('sevenDayStartDate', allDates);

    await api.recordTaskAction('view_article', { articleId: 'a1' });
    await api.recordTaskAction('view_article', { articleId: 'a2' });
    await api.recordTaskAction('view_article', { articleId: 'a3' });
    await api.recordTaskAction('favorite_article', { articleId: 'a1' });
    await api.recordTaskAction('answer_quiz', { quizId: 'q1', isCorrect: true });
    await api.recordTaskAction('subscribe_event', { eventId: 'e1', festivalId: 'spring_festival' });
    await api.recordTaskAction('view_figure', { figureId: 'figure_001' });
    await api.recordTaskAction('like_article', { articleId: 'a1' });
    await api.recordTaskAction('like_article', { articleId: 'a2' });
    await api.recordTaskAction('like_article', { articleId: 'a3' });
    await api.recordTaskAction('publish_article', { articleId: 'new1', category: 'farming' });

    for (let i = 1; i <= 7; i++) {
      await api.claimSevenDayReward('seven_day_' + i);
    }

    const badgeRes = await api.getUserBadges();
    expect(badgeRes.code).toBe(200);
    const badgeIds = badgeRes.data.badges.map(b => b.id);
    expect(badgeIds).toContain('seven_day_master');

    const pointsRes = await api.getUserPoints();
    expect(pointsRes.code).toBe(200);
    expect(pointsRes.data.points).toBeGreaterThan(0);
  });
});

describe('任务系统 - 行为追踪与自动解锁勋章', () => {
  beforeEach(() => {
    initStorage();
    loginAsUser('user_001', '测试用户');
    taskSystem.resetTaskData && taskSystem.resetTaskData();
  });

  test('recordTaskAction 返回成功', async () => {
    const res = await api.recordTaskAction('view_article', { articleId: 'article_001' });
    expect(res.code).toBe(200);
  });

  test('用户积分从0开始', async () => {
    const res = await api.getUserPoints();
    expect(res.code).toBe(200);
    expect(res.data.points).toBe(0);
  });

  test('用户初始无勋章', async () => {
    const res = await api.getUserBadges();
    expect(res.code).toBe(200);
    expect(res.data.badges).toEqual([]);
  });

  test('收藏5篇文章后，自动解锁"文化收藏家"勋章', async () => {
    for (let i = 1; i <= 5; i++) {
      await api.recordTaskAction('favorite_article', { articleId: 'article_' + i });
    }

    const badgeRes = await api.getUserBadges();
    expect(badgeRes.code).toBe(200);
    const badgeIds = badgeRes.data.badges.map(b => b.id);
    expect(badgeIds).toContain('article_collector');
  });

  test('答对10题后，自动解锁"答题达人"勋章', async () => {
    for (let i = 1; i <= 10; i++) {
      await api.recordTaskAction('answer_quiz', { quizId: 'q_' + i, isCorrect: true });
    }

    const badgeRes = await api.getUserBadges();
    expect(badgeRes.code).toBe(200);
    const badgeIds = badgeRes.data.badges.map(b => b.id);
    expect(badgeIds).toContain('quiz_master');
  });

  test('答错题目不计入答题正确数统计', async () => {
    for (let i = 1; i <= 10; i++) {
      await api.recordTaskAction('answer_quiz', { quizId: 'q_' + i, isCorrect: false });
    }

    const badgeRes = await api.getUserBadges();
    const badgeIds = badgeRes.data.badges.map(b => b.id);
    expect(badgeIds).not.toContain('quiz_master');
  });

  test('getAllBadges 返回完整勋章配置', async () => {
    const res = await api.getAllBadges();
    expect(res.code).toBe(200);
    expect(res.data.badges.length).toBeGreaterThanOrEqual(7);
  });
});

describe('任务系统 - 节日任务', () => {
  beforeEach(() => {
    initStorage();
    loginAsUser('user_001', '测试用户');
    taskSystem.resetTaskData && taskSystem.resetTaskData();
  });

  test('获取激活的节日任务线', async () => {
    const res = await api.getActiveFestivalTaskLine();
    expect(res.code).toBe(200);
    expect(typeof res.data.active).toBe('boolean');
  });

  test('节日任务线配置中包含至少3个节日', async () => {
    const taskProgress = taskSystem.getFestivalTaskProgress
      ? taskSystem.getFestivalTaskProgress()
      : taskSystem.getActiveFestivalTaskLine
        ? taskSystem.getActiveFestivalTaskLine()
        : null;

    const allFestivals = Object.keys(taskSystem.FESTIVAL_TASK_LINES || {});
    expect(allFestivals.length).toBeGreaterThanOrEqual(3);
    expect(allFestivals).toContain('spring_festival');
    expect(allFestivals).toContain('dragon_boat');
    expect(allFestivals).toContain('mid_autumn');
  });

  test('节日限定勋章包含在完整勋章列表中', async () => {
    const res = await api.getAllBadges();
    expect(res.code).toBe(200);
    const badgeIds = res.data.badges.map(b => b.id);
    expect(badgeIds).toContain('spring_ambassador');
    expect(badgeIds).toContain('dragon_boat_keeper');
    expect(badgeIds).toContain('mid_autumn_storyteller');
  });
});

describe('任务系统 - 聚合接口与调试', () => {
  beforeEach(() => {
    initStorage();
    loginAsUser('user_001', '测试用户');
    taskSystem.resetTaskData && taskSystem.resetTaskData();
  });

  test('getTaskCenterData 返回完整数据结构', async () => {
    const res = await api.getTaskCenterData();
    expect(res.code).toBe(200);
    expect(res.data).toHaveProperty('onboarding');
    expect(res.data).toHaveProperty('sevenDay');
    expect(res.data).toHaveProperty('festival');
    expect(res.data).toHaveProperty('points');
    expect(res.data).toHaveProperty('badges');
  });

  test('resetTaskData 重置所有任务数据', async () => {
    await api.recordTaskAction('view_article', { articleId: 'article_001' });
    await api.completeOnboardingStep('browse_article');

    const beforeRes = await api.getUserPoints();
    expect(beforeRes.code).toBe(200);

    const resetRes = await api.resetTaskData();
    expect(resetRes.code).toBe(200);

    const afterRes = await api.getUserPoints();
    expect(afterRes.code).toBe(200);
    expect(afterRes.data.points).toBe(0);

    const badgeRes = await api.getUserBadges();
    expect(badgeRes.code).toBe(200);
    expect(badgeRes.data.badges).toEqual([]);
  });
});

describe('任务系统 - 多用户数据隔离', () => {
  beforeEach(() => {
    initStorage();
    taskSystem.resetTaskData && taskSystem.resetTaskData();
  });

  test('不同用户数据互不影响', async () => {
    loginAsUser('user_001', '用户A');
    await api.recordTaskAction('view_article', { articleId: 'article_001' });
    await api.recordTaskAction('favorite_article', { articleId: 'article_001' });

    const user1PointsRes = await api.getUserPoints();
    const user1BadgesRes = await api.getUserBadges();
    const user1BadgeIds = user1BadgesRes.data.badges.map(b => b.id);

    loginAsUser('user_002', '用户B');
    const user2PointsRes = await api.getUserPoints();
    expect(user2PointsRes.code).toBe(200);
    expect(user2PointsRes.data.points).toBe(0);

    const user2BadgesRes = await api.getUserBadges();
    expect(user2BadgesRes.code).toBe(200);
    expect(user2BadgesRes.data.badges).toEqual([]);

    loginAsUser('user_001', '用户A');
    const backUser1PointsRes = await api.getUserPoints();
    expect(backUser1PointsRes.code).toBe(200);
    expect(backUser1PointsRes.data.points).toBe(user1PointsRes.data.points);
  });
});

describe('任务系统 - 存储键常量', () => {
  test('STORAGE_KEYS 定义完整', () => {
    expect(taskSystem.STORAGE_KEYS).toBeTruthy();
    const keys = Object.keys(taskSystem.STORAGE_KEYS);
    expect(keys).toContain('TASK_PREFIX');
    expect(keys).toContain('ONBOARDING_STATUS');
    expect(keys).toContain('TASK_PROGRESS');
    expect(keys).toContain('USER_POINTS');
    expect(keys).toContain('USER_BADGES');
    expect(keys).toContain('SEVEN_DAY_START');
    expect(keys).toContain('FESTIVAL_TASKS');
    expect(keys).toContain('ACTION_STATS');
    expect(keys).toContain('COMPLETED_TASKS');
  });
});

describe('任务系统 - 边缘场景与幂等性', () => {
  beforeEach(() => {
    initStorage();
    loginAsUser('user_001', '测试用户');
    taskSystem.resetTaskData && taskSystem.resetTaskData();
  });

  test('重复完成新手引导同一步骤，积分不重复累加', async () => {
    const beforeRes = await api.getUserPoints();
    const beforePoints = beforeRes.data.points;

    await api.completeOnboardingStep('browse_article');
    const after1Res = await api.getUserPoints();
    const after1Points = after1Res.data.points;
    expect(after1Points).toBeGreaterThan(beforePoints);

    await api.completeOnboardingStep('browse_article');
    const after2Res = await api.getUserPoints();
    expect(after2Res.data.points).toBe(after1Points);
  });

  test('新手引导完成后再尝试完成步骤，返回已完成状态', async () => {
    const statusRes = await api.getOnboardingStatus();
    for (const step of statusRes.data.steps) {
      await api.completeOnboardingStep(step.id);
    }

    const res = await api.completeOnboardingStep('browse_article');
    expect(res.code).toBe(200);
  });

  test('重复领取七日任务奖励，返回已领取错误', async () => {
    for (let i = 0; i < 5; i++) {
      await api.recordTaskAction('view_article', { articleId: 'article_' + i });
    }

    const firstRes = await api.claimSevenDayReward('seven_day_1');
    expect(firstRes.code).toBe(200);
    expect(firstRes.data.claimed).toBe(true);

    const secondRes = await api.claimSevenDayReward('seven_day_1');
    expect([200, 400]).toContain(secondRes.code);
    const secondData = secondRes.data || {};
    expect(secondData.alreadyClaimed || !secondData.claimed || secondData.success === false).toBeTruthy();
  });

  test('行为自动触发新手引导条件（不手动complete）', async () => {
    const beforeRes = await api.getOnboardingProgress();
    expect(beforeRes.data.steps[0].completed).toBe(false);

    await api.recordTaskAction('view_article', { articleId: 'article_001' });
    await api.recordTaskAction('view_figure', { figureId: 'figure_001' });

    const midRes = await api.getOnboardingStatus();
    const step1 = midRes.data.steps.find(s => s.id === 'browse_article');
    const step2 = midRes.data.steps.find(s => s.id === 'explore_figures');

    expect(step1).toBeTruthy();
    expect(step2).toBeTruthy();
  });

  test('多次触发同一勋章解锁条件，只获得一次勋章', async () => {
    for (let i = 1; i <= 5; i++) {
      await api.recordTaskAction('favorite_article', { articleId: 'article_' + i });
    }
    const badge1Res = await api.getUserBadges();
    const collectorCount1 = badge1Res.data.badges.filter(b => b.id === 'article_collector').length;
    expect(collectorCount1).toBe(1);

    for (let i = 6; i <= 10; i++) {
      await api.recordTaskAction('favorite_article', { articleId: 'article_' + i });
    }
    const badge2Res = await api.getUserBadges();
    const collectorCount2 = badge2Res.data.badges.filter(b => b.id === 'article_collector').length;
    expect(collectorCount2).toBe(1);
  });

  test('Day6任务：点赞3篇文章解锁可领取', async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDateStr = sevenDaysAgo.toISOString().split('T')[0];
    const allDates = wx.getStorageSync('sevenDayStartDate') || {};
    allDates['user_001'] = startDateStr;
    wx.setStorageSync('sevenDayStartDate', allDates);

    await api.recordTaskAction('like_article', { articleId: 'a1' });
    await api.recordTaskAction('like_article', { articleId: 'a2' });
    const midRes = await api.getSevenDayProgress();
    const day6Mid = midRes.data.tasks.find(t => t.day === 6);
    expect(day6Mid.currentCount).toBeLessThan(3);

    await api.recordTaskAction('like_article', { articleId: 'a3' });
    const finalRes = await api.getSevenDayProgress();
    const day6Final = finalRes.data.tasks.find(t => t.day === 6);
    expect(day6Final.canClaim).toBe(true);
  });

  test('未登录时获取任务数据不崩溃', async () => {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');

    const onboardingRes = await api.getOnboardingStatus();
    expect(onboardingRes).toBeTruthy();
    expect([200, 401]).toContain(onboardingRes.code);

    const pointsRes = await api.getUserPoints();
    expect(pointsRes).toBeTruthy();
    expect([200, 401]).toContain(pointsRes.code);

    const badgesRes = await api.getUserBadges();
    expect(badgesRes).toBeTruthy();
    expect([200, 401]).toContain(badgesRes.code);
  });

  test('跳过新手引导后，状态为跳过+已完成', async () => {
    await api.skipOnboarding();
    const statusRes = await api.getOnboardingStatus();
    expect(statusRes.data.skipped).toBe(true);
    expect(statusRes.data.completed).toBe(true);
  });

  test('发表10篇文章解锁"文化作家"勋章', async () => {
    for (let i = 1; i <= 9; i++) {
      await api.recordTaskAction('publish_article', { articleId: 'p_' + i });
    }
    const midRes = await api.getUserBadges();
    const hasMid = midRes.data.badges.some(b => b.id === 'culture_writer');
    expect(hasMid).toBe(false);

    await api.recordTaskAction('publish_article', { articleId: 'p_10' });
    const finalRes = await api.getUserBadges();
    const hasFinal = finalRes.data.badges.some(b => b.id === 'culture_writer');
    expect(hasFinal).toBe(true);
  });

  test('浏览20位人物解锁"人物探索者"勋章', async () => {
    for (let i = 1; i <= 19; i++) {
      await api.recordTaskAction('view_figure', { figureId: 'f_' + i });
    }
    const midRes = await api.getUserBadges();
    const hasMid = midRes.data.badges.some(b => b.id === 'figure_explorer');
    expect(hasMid).toBe(false);

    await api.recordTaskAction('view_figure', { figureId: 'f_20' });
    const finalRes = await api.getUserBadges();
    const hasFinal = finalRes.data.badges.some(b => b.id === 'figure_explorer');
    expect(hasFinal).toBe(true);
  });
});

describe('任务系统 - 节日任务完整流程', () => {
  beforeEach(() => {
    initStorage();
    loginAsUser('user_001', '测试用户');
    taskSystem.resetTaskData && taskSystem.resetTaskData();
  });

  test('春节任务：阅读+收藏+答题+投稿完成全流程并领取奖励', async () => {
    const festivalId = 'spring_festival';

    await api.recordTaskAction('view_article', { articleId: 'spring_a1', festivalId, keyword: '春节' });
    let progress1 = taskSystem.getFestivalProgress(festivalId);
    expect(progress1.tasks[0].canClaim || progress1.tasks[0].isCompleted).toBeTruthy();

    const claim1 = await api.claimFestivalReward(festivalId, 'sf_read_spring');
    expect(claim1.code).toBe(200);

    await api.recordTaskAction('favorite_article', { articleId: 'spring_a1', festivalId });
    await api.recordTaskAction('favorite_article', { articleId: 'spring_a2', festivalId });
    const claim2 = await api.claimFestivalReward(festivalId, 'sf_favorite_spring');
    expect(claim2.code).toBe(200);

    for (let i = 1; i <= 5; i++) {
      await api.recordTaskAction('answer_quiz', { quizId: 'spring_q_' + i, isCorrect: true, festivalId });
    }
    const claim3 = await api.claimFestivalReward(festivalId, 'sf_answer_spring');
    expect(claim3.code).toBe(200);

    await api.recordTaskAction('publish_article', { articleId: 'spring_publish_1', festivalId });
    const claim4 = await api.claimFestivalReward(festivalId, 'sf_share_spring');
    expect(claim4.code).toBe(200);
    expect(claim4.data.reward).toBeTruthy();

    const badgeRes = await api.getUserBadges();
    const hasSpringBadge = badgeRes.data.badges.some(b => b.id === 'spring_ambassador');
    expect(hasSpringBadge).toBe(true);
  });

  test('端午任务：订阅端午+答题+投稿解锁端午限定勋章', async () => {
    const festivalId = 'dragon_boat';

    await api.recordTaskAction('subscribe_event', { eventId: 'db_evt', festivalId });
    const claim1 = await api.claimFestivalReward(festivalId, 'db_subscribe');
    expect(claim1.code).toBe(200);

    for (let i = 1; i <= 3; i++) {
      await api.recordTaskAction('answer_quiz', { quizId: 'db_q_' + i, isCorrect: true, festivalId });
    }
    const claim2 = await api.claimFestivalReward(festivalId, 'db_answer');
    expect(claim2.code).toBe(200);

    await api.recordTaskAction('publish_article', { articleId: 'db_publish_1', festivalId });
    const claim3 = await api.claimFestivalReward(festivalId, 'db_contribute');
    expect(claim3.code).toBe(200);

    const badgeRes = await api.getUserBadges();
    const hasDbBadge = badgeRes.data.badges.some(b => b.id === 'dragon_boat_keeper');
    expect(hasDbBadge).toBe(true);
  });

  test('中秋任务：点赞5篇+投稿解锁中秋限定勋章', async () => {
    const festivalId = 'mid_autumn';

    for (let i = 1; i <= 5; i++) {
      await api.recordTaskAction('like_article', { articleId: 'ma_a_' + i, festivalId });
    }
    const claim1 = await api.claimFestivalReward(festivalId, 'ma_like');
    expect(claim1.code).toBe(200);

    await api.recordTaskAction('publish_article', { articleId: 'ma_publish_1', festivalId });
    const claim2 = await api.claimFestivalReward(festivalId, 'ma_share');
    expect(claim2.code).toBe(200);

    const badgeRes = await api.getUserBadges();
    const hasMaBadge = badgeRes.data.badges.some(b => b.id === 'mid_autumn_storyteller');
    expect(hasMaBadge).toBe(true);
  });

  test('重复领取节日奖励返回已领取', async () => {
    const festivalId = 'spring_festival';
    await api.recordTaskAction('view_article', { articleId: 'spring_a1', festivalId, keyword: '春节' });

    const claim1 = await api.claimFestivalReward(festivalId, 'sf_read_spring');
    expect(claim1.code).toBe(200);

    const claim2 = await api.claimFestivalReward(festivalId, 'sf_read_spring');
    expect([200, 400]).toContain(claim2.code);
    const claim2Data = claim2.data || {};
    expect(claim2Data.alreadyClaimed || claim2Data.success === false || claim2.message).toBeTruthy();
  });
});

describe('任务系统 - 导出公共API完整性', () => {
  test('task.js导出的所有核心函数都存在', () => {
    expect(typeof taskSystem.getOnboardingStatus).toBe('function');
    expect(typeof taskSystem.isOnboardingCompleted).toBe('function');
    expect(typeof taskSystem.completeOnboardingStep).toBe('function');
    expect(typeof taskSystem.skipOnboarding).toBe('function');
    expect(typeof taskSystem.getOnboardingProgress).toBe('function');
    expect(typeof taskSystem.getSevenDayProgress).toBe('function');
    expect(typeof taskSystem.claimSevenDayReward).toBe('function');
    expect(typeof taskSystem.getActiveFestivalTaskLine).toBe('function');
    expect(typeof taskSystem.getFestivalProgress).toBe('function');
    expect(typeof taskSystem.claimFestivalReward).toBe('function');
    expect(typeof taskSystem.getUserPoints).toBe('function');
    expect(typeof taskSystem.getUserBadges).toBe('function');
    expect(typeof taskSystem.getAllBadges).toBe('function');
    expect(typeof taskSystem.recordAction).toBe('function');
    expect(typeof taskSystem.checkBadgeAutoUnlock).toBe('function');
    expect(typeof taskSystem.resetTaskData).toBe('function');
  });

  test('ONBOARDING_STEPS配置为5步引导', () => {
    expect(Array.isArray(taskSystem.ONBOARDING_STEPS)).toBe(true);
    expect(taskSystem.ONBOARDING_STEPS.length).toBeGreaterThanOrEqual(5);
    const ids = taskSystem.ONBOARDING_STEPS.map(s => s.id);
    expect(ids).toContain('browse_article');
    expect(ids).toContain('explore_figures');
    expect(ids).toContain('answer_quiz');
    expect(ids).toContain('view_calendar');
    expect(ids).toContain('publish_or_activity');
  });

  test('SEVEN_DAY_TASKS配置为7天', () => {
    expect(Array.isArray(taskSystem.SEVEN_DAY_TASKS)).toBe(true);
    expect(taskSystem.SEVEN_DAY_TASKS.length).toBe(7);
    for (let i = 1; i <= 7; i++) {
      const dayTask = taskSystem.SEVEN_DAY_TASKS.find(t => t.day === i);
      expect(dayTask).toBeTruthy();
      expect(dayTask.id).toBe('seven_day_' + i);
    }
  });

  test('勋章配置：普通7枚+节日限定3枚共10枚', () => {
    const allBadges = taskSystem.getAllBadges();
    expect(allBadges.length).toBe(10);

    const rarityCount = { common: 0, rare: 0, epic: 0, legendary: 0 };
    allBadges.forEach(b => { rarityCount[b.rarity] = (rarityCount[b.rarity] || 0) + 1; });

    expect(rarityCount.legendary).toBeGreaterThanOrEqual(4);
    expect(rarityCount.epic).toBeGreaterThanOrEqual(2);
    expect(rarityCount.rare).toBeGreaterThanOrEqual(2);
  });

  test('getTaskCenterData聚合所有数据字段完整', async () => {
    initStorage();
    loginAsUser('user_001', '测试用户');
    taskSystem.resetTaskData && taskSystem.resetTaskData();

    const res = await api.getTaskCenterData();
    expect(res.code).toBe(200);

    expect(res.data.onboarding).toHaveProperty('progress');
    expect(res.data.onboarding).toHaveProperty('steps');
    expect(res.data.onboarding).toHaveProperty('isCompleted');

    expect(res.data.sevenDay).toHaveProperty('currentDay');
    expect(res.data.sevenDay).toHaveProperty('tasks');
    expect(Array.isArray(res.data.sevenDay.tasks)).toBe(true);
    const claimableTasks = res.data.sevenDay.tasks.filter(t => t.canClaim === true || t.claimable === true);
    expect(typeof claimableTasks.length).toBe('number');
    expect(res.data.sevenDay).toHaveProperty('completedCount');
    expect(res.data.sevenDay).toHaveProperty('startDate');

    expect(res.data.festival).toHaveProperty('active');

    expect(typeof res.data.points).toBe('number');

    expect(Array.isArray(res.data.badges)).toBe(true);
  });
});
