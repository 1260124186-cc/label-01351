const api = require('../../utils/api');
const taskSystem = require('../../utils/task');
const { initStorage, defaultUser, loginAsUser } = require('../helpers');

initStorage();
loginAsUser('user_001', '测试用户');
api.resetTaskData && api.resetTaskData();
taskSystem.resetTaskData && taskSystem.resetTaskData();

console.log('=== 测试前 storage 状态 ===');
console.log('userInfo:', wx.getStorageSync('userInfo'));
console.log('COMPLETED_TASKS before:', wx.getStorageSync('completedTasks'));

console.log('\n=== 调用 recordTaskAction(view_article) ===');
const recordRes = await api.recordTaskAction('view_article', { articleId: 'article_001' });
console.log('recordRes:', JSON.stringify(recordRes, null, 2));

console.log('\n=== record 后 storage 状态 ===');
console.log('COMPLETED_TASKS after:', wx.getStorageSync('completedTasks'));
console.log('taskSystem.getTaskStats():', taskSystem.getTaskStats ? taskSystem.getTaskStats() : 'no method');

console.log('\n=== 调用 getSevenDayProgress ===');
const progressRes = await api.getSevenDayProgress();
console.log('progressRes.code:', progressRes.code);
if (progressRes.code === 200) {
  console.log('currentDay:', progressRes.data.currentDay);
  const day1 = progressRes.data.tasks.find(t => t.day === 1);
  console.log('Day1 task:', JSON.stringify(day1, null, 2));
  console.log('Day1 progress:', day1 ? day1.progress : 'not found');
  console.log('Day1 checkCondition:', day1 ? day1.checkCondition : 'not found');
}

console.log('\n=== 测试 favorite 5 次 ===');
for (let i = 1; i <= 5; i++) {
  await api.recordTaskAction('favorite_article', { articleId: 'article_' + i });
}
const badgesRes = await api.getUserBadges();
console.log('badges after 5 favorites:', badgesRes.data ? badgesRes.data.badges.map(b => b.id) : 'error');
