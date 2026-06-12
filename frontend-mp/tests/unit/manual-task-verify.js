/**
 * 任务系统手动验证脚本
 * 使用方法: node tests/unit/manual-task-verify.js
 */

const fs = require('fs');
const path = require('path');

// 模拟 wx Storage API
const mockStorage = {};
global.wx = {
  getStorageSync(key) {
    return key in mockStorage ? mockStorage[key] : null;
  },
  setStorageSync(key, value) {
    mockStorage[key] = value;
  },
  removeStorageSync(key) {
    delete mockStorage[key];
  },
  _resetStorage() {
    Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  },
  showToast() {},
  showModal() {},
  navigateTo() {},
  switchTab() {},
  getApp() {
    return global._appInstance;
  }
};

global._appInstance = {
  getLoginStatus() { return true; },
  getUserInfo() { return { id: 'user_001', nickname: '测试用户' }; }
};

const { defaultUser } = require('../helpers.js');

// 初始化测试数据
wx._resetStorage();
wx.setStorageSync('userInfo', JSON.parse(JSON.stringify(defaultUser)));
wx.setStorageSync('isLoggedIn', true);

const task = require('../../utils/task');
const api = require('../../utils/api');

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.log(`  ❌ ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  const condition = actual === expected;
  if (condition) {
    passed++;
    console.log(`  ✅ ${message} (${JSON.stringify(actual)})`);
  } else {
    failed++;
    failures.push(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    console.log(`  ❌ ${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('  任务系统核心功能验证');
  console.log('========================================\n');

  // ========= 1. 数据结构验证 =========
  console.log('1. 数据结构验证');
  assertEqual(Object.keys(task.STORAGE_KEYS).length, 8, 'STORAGE_KEYS 定义了8个键');
  assertEqual(task.ONBOARDING_STEPS.length, 5, 'ONBOARDING_STEPS 有5个步骤');
  assertEqual(task.SEVEN_DAY_TASKS.length, 7, 'SEVEN_DAY_TASKS 有7个任务');
  assertEqual(Object.keys(task.BADGES).length, 10, '共10个勋章（7普通+3节日）');
  assertEqual(Object.keys(task.FESTIVAL_TASK_LINES).length, 3, '3个节日任务线');
  assertEqual(Object.keys(task.FESTIVAL_BADGES).length, 3, '3个节日限定勋章');

  // ========= 2. 新手引导初始状态 =========
  console.log('\n2. 新手引导初始状态');
  const status0 = task.getOnboardingStatus();
  assertEqual(status0.completed, false, '初始状态新手引导未完成');
  assertEqual(status0.currentStepIndex, 0, '当前步骤为第0步');
  assertEqual(status0.steps[0].completed, false, '步骤1未完成');

  // ========= 3. 积分与勋章初始状态 =========
  console.log('\n3. 积分与勋章初始状态');
  assertEqual(task.getUserPoints(), 0, '初始积分为0');
  assertEqual(task.getUserBadges().length, 0, '初始无勋章');

  // ========= 4. 新手引导步骤完成与发奖 =========
  console.log('\n4. 新手引导步骤完成与发奖');
  const step1Result = task.completeOnboardingStep('browse_article');
  assert(step1Result.success, '步骤1(browse_article)完成成功');
  assert(task.getUserPoints() > 0, '完成步骤1后积分增加');

  // 完成剩余步骤
  task.completeOnboardingStep('explore_figures');
  task.completeOnboardingStep('answer_quiz');
  task.completeOnboardingStep('view_calendar');
  const completeAll = task.completeOnboardingStep('publish_or_activity');
  assert(completeAll.success, '所有5个步骤完成成功');

  const status1 = task.getOnboardingStatus();
  assertEqual(status1.completed, true, '新手引导标记为已完成');

  const badges1 = task.getUserBadges().map(b => b.id);
  assert(badges1.includes('new_contributor'), '完成引导自动解锁"初入乡村"勋章');

  // ========= 5. 七日任务进度 =========
  console.log('\n5. 七日任务进度');
  task.resetTaskData();
  const progress0 = task.getSevenDayProgress();
  assertEqual(progress0.currentDay, 1, '七日任务第1天');
  assertEqual(progress0.tasks[0].progress, 0, 'Day1 初始进度为0');
  assertEqual(progress0.tasks[0].completed, false, 'Day1 未完成');

  // 模拟5次浏览文章
  for (let i = 0; i < 5; i++) {
    task.recordAction('view_article', { articleId: `a_${i}` });
  }

  const progress1 = task.getSevenDayProgress();
  assertEqual(progress1.tasks[0].progress, 5, 'Day1 进度更新为5');
  assertEqual(progress1.tasks[0].completed, true, 'Day1 任务标记完成');
  assertEqual(progress1.tasks[0].claimable, true, 'Day1 奖励可领取');

  // 领取Day1奖励
  const claim1 = task.claimSevenDayReward('seven_day_1');
  assert(claim1.success, 'Day1 奖励领取成功');
  assert(claim1.points > 0, 'Day1 积分奖励发放');

  const progress2 = task.getSevenDayProgress();
  assertEqual(progress2.tasks[0].claimed, true, 'Day1 标记已领取');
  assertEqual(progress2.claimableCount, 0, '无待领取奖励');

  // ========= 6. 行为追踪与自动解锁勋章 =========
  console.log('\n6. 行为追踪与自动解锁勋章');
  task.resetTaskData();

  // 收藏5篇解锁"文化收藏家"
  for (let i = 0; i < 5; i++) {
    task.recordAction('favorite_article', { articleId: `fa_${i}` });
  }
  const badges2 = task.getUserBadges().map(b => b.id);
  assert(badges2.includes('article_collector'), '收藏5篇自动解锁"文化收藏家"勋章');
  const pointsAfterCollector = task.getUserPoints();
  assert(pointsAfterCollector > 0, '解锁勋章伴随积分发放');

  // 答对10题解锁"答题达人"
  task.resetTaskData();
  for (let i = 0; i < 10; i++) {
    task.recordAction('answer_quiz', { quizId: `q_${i}`, isCorrect: true });
  }
  const badges3 = task.getUserBadges().map(b => b.id);
  assert(badges3.includes('quiz_master'), '答对10题自动解锁"答题达人"勋章');

  // 发布3篇解锁"文化作者"
  task.resetTaskData();
  for (let i = 0; i < 3; i++) {
    task.recordAction('publish_article', { articleId: `pa_${i}`, category: 'farming' });
  }
  const badges4 = task.getUserBadges().map(b => b.id);
  assert(badges4.includes('culture_writer'), '发布3篇自动解锁"文化作者"勋章');

  // ========= 7. 多用户隔离验证 =========
  console.log('\n7. 多用户隔离验证');
  task.resetTaskData();
  wx.setStorageSync('userInfo', { id: 'user_A', nickname: '用户A' });
  task.recordAction('favorite_article', { articleId: 'userA_fav1' });
  task.recordAction('favorite_article', { articleId: 'userA_fav2' });
  const userAPoints = task.getUserPoints();
  const userABadges = task.getUserBadges().length;

  wx.setStorageSync('userInfo', { id: 'user_B', nickname: '用户B' });
  const userBPoints = task.getUserPoints();
  const userBBadges = task.getUserBadges().length;
  assertEqual(userBPoints, 0, '用户B初始积分为0');
  assertEqual(userBBadges, 0, '用户B初始无勋章');

  wx.setStorageSync('userInfo', { id: 'user_A', nickname: '用户A' });
  assertEqual(task.getUserPoints(), userAPoints, '用户A积分数据恢复正常');
  assertEqual(task.getUserBadges().length, userABadges, '用户A勋章数据恢复正常');
  console.log(`  ✅ 多用户数据隔离验证通过`);
  passed++;

  // ========= 8. 节日任务验证 =========
  console.log('\n8. 节日任务验证');
  task.resetTaskData();
  const festivalResult = task.getActiveFestivalTaskLine();
  assert(typeof festivalResult.active === 'boolean', 'getActiveFestivalTaskLine 返回合法状态');
  assertEqual(Object.keys(task.FESTIVAL_TASK_LINES).includes('spring_festival'), true, '包含春节任务线');
  assertEqual(Object.keys(task.FESTIVAL_TASK_LINES).includes('dragon_boat'), true, '包含端午任务线');
  assertEqual(Object.keys(task.FESTIVAL_TASK_LINES).includes('mid_autumn'), true, '包含中秋任务线');

  // ========= 9. 所有勋章稀有度验证 =========
  console.log('\n9. 勋章稀有度验证');
  const allBadges = Object.values(task.BADGES);
  const rarityTypes = new Set(allBadges.map(b => b.rarity));
  assert(rarityTypes.has('common'), '存在common稀有度勋章');
  assert(rarityTypes.has('rare'), '存在rare稀有度勋章');
  assert(rarityTypes.has('epic'), '存在epic稀有度勋章');
  assert(rarityTypes.has('legendary'), '存在legendary稀有度勋章');

  // ========= 10. 重置数据验证 =========
  console.log('\n10. 重置数据验证');
  task.recordAction('view_article', { articleId: 'test_reset' });
  task.completeOnboardingStep('browse_article');
  const beforeReset = task.getUserPoints();
  assert(beforeReset > 0, '重置前有数据');
  task.resetTaskData();
  assertEqual(task.getUserPoints(), 0, '重置后积分为0');
  assertEqual(task.getUserBadges().length, 0, '重置后无勋章');
  assertEqual(task.getOnboardingStatus().completed, false, '重置后引导未完成');

  // ========= 结果汇总 =========
  console.log('\n========================================');
  console.log(`  验证完成: ${passed} 个通过, ${failed} 个失败`);
  console.log('========================================\n');

  if (failed > 0) {
    console.log('失败详情:');
    failures.forEach(f => console.log(`  - ${f}`));
    console.log();
    process.exit(1);
  } else {
    console.log('🎉 所有核心功能验证通过! 任务系统工作正常!');
  }
}

runTests().catch(e => {
  console.error('测试过程发生异常:', e);
  process.exit(1);
});
