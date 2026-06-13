// utils/task.js - 任务系统核心模块
// 包含：新手引导、七日文化任务、积分勋章、节日特别任务配置

const util = require('./util');

const STORAGE_KEYS = {
  TASK_PREFIX: 'task_',
  ONBOARDING_STATUS: 'onboardingStatus',
  TASK_PROGRESS: 'taskProgress',
  USER_POINTS: 'userPoints',
  USER_BADGES: 'userBadges',
  FESTIVAL_TASKS: 'festivalTasks',
  ACTION_STATS: 'actionStats',
  COMPLETED_TASKS: 'completedTasks',
  DAILY_TASK_DATE: 'dailyTaskDate',
  SEVEN_DAY_START: 'sevenDayStartDate'
};

const ONBOARDING_STEPS = [
  {
    id: 'browse_article',
    step: 1,
    title: '浏览一篇文化文章',
    description: '在这里，您可以阅读关于乡村民俗、传统技艺、农耕智慧等精彩内容',
    icon: '📖',
    action: {
      type: 'navigate',
      page: '/pages/index/index',
      params: {}
    },
    checkCondition: 'hasViewedArticle',
    reward: { points: 10 }
  },
  {
    id: 'explore_figures',
    step: 2,
    title: '认识一位乡贤人物',
    description: '人物志记录了乡村中的手艺人、文化传承人、老党员等值得铭记的人物',
    icon: '👤',
    action: {
      type: 'navigate',
      page: '/pages/figures/figures',
      params: {}
    },
    checkCondition: 'hasViewedFigure',
    reward: { points: 15 }
  },
  {
    id: 'answer_quiz',
    step: 3,
    title: '参与每日文化问答',
    description: '通过有趣的答题，学习传统文化知识，还能获得积分奖励',
    icon: '❓',
    action: {
      type: 'navigate',
      page: '/pages/quiz-daily/quiz-daily',
      params: {}
    },
    checkCondition: 'hasAnsweredQuiz',
    reward: { points: 20 }
  },
  {
    id: 'view_calendar',
    step: 4,
    title: '订阅文化节日日历',
    description: '不错过任何一个传统节日，在节日来临前收到温馨提醒',
    icon: '📅',
    action: {
      type: 'navigate',
      page: '/pages/calendar/calendar',
      params: {}
    },
    checkCondition: 'hasSubscribedCalendar',
    reward: { points: 10 }
  },
  {
    id: 'publish_or_activity',
    step: 5,
    title: '投稿或报名文化活动',
    description: '分享您的乡村记忆，或参与线下文化活动，成为文化传播的一份子',
    icon: '✍️',
    action: {
      type: 'navigate',
      page: '/pages/activities/activities',
      params: {}
    },
    checkCondition: 'hasPublishedOrJoined',
    reward: { points: 25, badge: 'new_contributor' }
  }
];

const SEVEN_DAY_TASKS = [
  {
    day: 1,
    id: 'seven_day_1',
    type: 'read_article',
    title: '读一篇文化文章',
    description: '阅读任意一篇乡村文化文章',
    icon: '📖',
    targetCount: 1,
    reward: { points: 10 },
    checkCondition: 'viewedArticleCount'
  },
  {
    day: 2,
    id: 'seven_day_2',
    type: 'favorite',
    title: '收藏一篇喜欢的文章',
    description: '将感兴趣的文章收藏，方便日后阅读',
    icon: '⭐',
    targetCount: 1,
    reward: { points: 15 },
    checkCondition: 'favoritedArticleCount'
  },
  {
    day: 3,
    id: 'seven_day_3',
    type: 'answer_quiz',
    title: '答对一道文化题',
    description: '完成每日一题并回答正确',
    icon: '✅',
    targetCount: 1,
    reward: { points: 20 },
    checkCondition: 'correctQuizCount'
  },
  {
    day: 4,
    id: 'seven_day_4',
    type: 'calendar_subscribe',
    title: '订阅一个节日提醒',
    description: '在文化日历中订阅任意节日',
    icon: '🔔',
    targetCount: 1,
    reward: { points: 15 },
    checkCondition: 'subscribedEventCount'
  },
  {
    day: 5,
    id: 'seven_day_5',
    type: 'view_figure',
    title: '了解一位乡贤人物',
    description: '浏览任意一位人物志详情',
    icon: '👥',
    targetCount: 1,
    reward: { points: 15 },
    checkCondition: 'viewedFigureCount'
  },
  {
    day: 6,
    id: 'seven_day_6',
    type: 'like',
    title: '点赞3篇优质内容',
    description: '为您喜欢的文章点赞',
    icon: '👍',
    targetCount: 3,
    reward: { points: 20 },
    checkCondition: 'likedArticleCount'
  },
  {
    day: 7,
    id: 'seven_day_7',
    type: 'publish',
    title: '投稿一篇文章',
    description: '分享您的乡村文化记忆',
    icon: '📝',
    targetCount: 1,
    reward: { points: 50, badge: 'seven_day_master' },
    checkCondition: 'publishedArticleCount'
  }
];

const LEVELS = [
  {
    level: 1,
    name: '文化记录者',
    icon: '📝',
    minPoints: 0,
    maxPoints: 499,
    description: '初入文化殿堂，开始记录乡村记忆',
    color: '#8B4513',
    bgGradient: 'linear-gradient(135deg, #DEB887, #D2B48C)'
  },
  {
    level: 2,
    name: '传承使者',
    icon: '🏛️',
    minPoints: 500,
    maxPoints: 1999,
    description: '积极传播文化，成为传承的中坚力量',
    color: '#B8860B',
    bgGradient: 'linear-gradient(135deg, #F0E68C, #DAA520)'
  },
  {
    level: 3,
    name: '银龄文化达人',
    icon: '👑',
    minPoints: 2000,
    maxPoints: Infinity,
    description: '文化传承的典范，德高望重的文化达人',
    color: '#DAA520',
    bgGradient: 'linear-gradient(135deg, #FFD700, #FFA500)'
  }
];

const POINTS_RULES = {
  publish_article: 20,
  like_received: 1,
  join_activity: 30,
  correct_quiz: 5,
  view_article: 1,
  view_opera: 1,
  favorite_article: 2,
  favorite_opera: 2,
  comment_article: 3,
  share_article: 5,
  volunteer_activity: 100,
  complete_interview: 80
};

const BADGES = {
  new_contributor: {
    id: 'new_contributor',
    name: '新锐传播者',
    description: '完成新手引导，首次投稿或参与活动',
    icon: '🌱',
    rarity: 'common',
    points: 0,
    category: 'growth'
  },
  first_submission: {
    id: 'first_submission',
    name: '首次投稿',
    description: '发布第一篇文化文章',
    icon: '📄',
    rarity: 'common',
    points: 20,
    condition: { type: 'published_count', value: 1 },
    category: 'contribution'
  },
  seven_day_master: {
    id: 'seven_day_master',
    name: '七日达人',
    description: '连续完成七日文化任务',
    icon: '🏆',
    rarity: 'rare',
    points: 100,
    category: 'growth'
  },
  article_collector: {
    id: 'article_collector',
    name: '文化收藏家',
    description: '累计收藏5篇文章',
    icon: '📚',
    rarity: 'rare',
    points: 50,
    condition: { type: 'favorite_count', value: 5 },
    category: 'explore'
  },
  quiz_master: {
    id: 'quiz_master',
    name: '答题达人',
    description: '累计答对10道文化题',
    icon: '🎯',
    rarity: 'epic',
    points: 100,
    condition: { type: 'correct_quiz_count', value: 10 },
    category: 'knowledge'
  },
  culture_writer: {
    id: 'culture_writer',
    name: '文化作家',
    description: '累计发布10篇文章',
    icon: '✒️',
    rarity: 'epic',
    points: 150,
    condition: { type: 'published_count', value: 10 },
    category: 'contribution'
  },
  prolific_author: {
    id: 'prolific_author',
    name: '高产作家',
    description: '累计发布30篇文章',
    icon: '📖',
    rarity: 'legendary',
    points: 300,
    condition: { type: 'published_count', value: 30 },
    category: 'contribution'
  },
  figure_explorer: {
    id: 'figure_explorer',
    name: '人物探索者',
    description: '浏览20位乡贤人物',
    icon: '🔍',
    rarity: 'rare',
    points: 50,
    condition: { type: 'viewed_figure_count', value: 20 },
    category: 'explore'
  },
  festival_keeper: {
    id: 'festival_keeper',
    name: '节日守护者',
    description: '订阅所有传统节日提醒',
    icon: '🎊',
    rarity: 'legendary',
    points: 200,
    condition: { type: 'subscribed_all_festivals', value: true },
    category: 'festival'
  },
  hundred_likes: {
    id: 'hundred_likes',
    name: '百赞达人',
    description: '累计获得100个点赞',
    icon: '👍',
    rarity: 'rare',
    points: 50,
    condition: { type: 'received_likes', value: 100 },
    category: 'popularity'
  },
  thousand_likes: {
    id: 'thousand_likes',
    name: '千赞大家',
    description: '累计获得1000个点赞',
    icon: '🌟',
    rarity: 'epic',
    points: 200,
    condition: { type: 'received_likes', value: 1000 },
    category: 'popularity'
  },
  interview_complete: {
    id: 'interview_complete',
    name: '访谈记录者',
    description: '完成一次人物访谈投稿',
    icon: '🎙️',
    rarity: 'rare',
    points: 80,
    condition: { type: 'interview_count', value: 1 },
    category: 'contribution'
  },
  interview_master: {
    id: 'interview_master',
    name: '资深访谈人',
    description: '完成5次人物访谈投稿',
    icon: '📹',
    rarity: 'epic',
    points: 200,
    condition: { type: 'interview_count', value: 5 },
    category: 'contribution'
  },
  activity_volunteer: {
    id: 'activity_volunteer',
    name: '文化志愿者',
    description: '参与一次文化志愿服务',
    icon: '🤝',
    rarity: 'rare',
    points: 50,
    condition: { type: 'volunteer_count', value: 1 },
    category: 'activity'
  },
  checkin_7: {
    id: 'checkin_7',
    name: '七日打卡',
    description: '连续打卡7天',
    icon: '📅',
    rarity: 'common',
    points: 30,
    condition: { type: 'consecutive_checkin', value: 7 },
    category: 'growth'
  },
  checkin_30: {
    id: 'checkin_30',
    name: '月度达人',
    description: '连续打卡30天',
    icon: '🗓️',
    rarity: 'epic',
    points: 150,
    condition: { type: 'consecutive_checkin', value: 30 },
    category: 'growth'
  },
  qa_helper: {
    id: 'qa_helper',
    name: '问答达人',
    description: '累计参与50次问答',
    icon: '💡',
    rarity: 'rare',
    points: 80,
    condition: { type: 'correct_quiz_count', value: 50 },
    category: 'knowledge'
  },
  activity_joiner: {
    id: 'activity_joiner',
    name: '活动达人',
    description: '报名参加3次文化活动',
    icon: '🎉',
    rarity: 'rare',
    points: 60,
    condition: { type: 'joined_activity_count', value: 3 },
    category: 'activity'
  }
};

const FESTIVAL_TASK_LINES = {
  spring_festival: {
    id: 'spring_festival',
    name: '春节特别任务',
    description: '春节期间限定任务，感受浓浓的年味',
    festivalName: '春节',
    dateRange: { start: '01-20', end: '02-15' },
    icon: '🧧',
    backgroundImage: '',
    tasks: [
      {
        id: 'sf_read_spring',
        title: '阅读春节相关文章',
        description: '阅读一篇关于春节习俗的文章',
        type: 'read_article',
        keyword: '春节|过年',
        targetCount: 1,
        reward: { points: 20 }
      },
      {
        id: 'sf_favorite_spring',
        title: '收藏春节文章',
        description: '收藏2篇与春节相关的文章',
        type: 'favorite',
        keyword: '春节|过年',
        targetCount: 2,
        reward: { points: 25 }
      },
      {
        id: 'sf_answer_spring',
        title: '春节知识问答',
        description: '答对5道春节相关题目',
        type: 'answer_quiz',
        keyword: '春节|过年',
        targetCount: 5,
        reward: { points: 30 }
      },
      {
        id: 'sf_share_spring',
        title: '分享春节记忆',
        description: '投稿一篇关于春节记忆的文章',
        type: 'publish',
        keyword: '春节|过年',
        targetCount: 1,
        reward: { points: 80, badge: 'spring_ambassador' }
      }
    ]
  },
  dragon_boat: {
    id: 'dragon_boat',
    name: '端午特别任务',
    description: '端午佳节，传承爱国情怀与民俗文化',
    festivalName: '端午节',
    dateRange: { start: '05-01', end: '06-05' },
    icon: '🐉',
    backgroundImage: '',
    tasks: [
      {
        id: 'db_read_dragon',
        title: '了解端午文化',
        description: '阅读端午相关的文章或百科',
        type: 'read_article',
        keyword: '端午|龙舟|屈原|粽子',
        targetCount: 1,
        reward: { points: 20 }
      },
      {
        id: 'db_subscribe',
        title: '订阅端午提醒',
        description: '在日历中订阅端午节',
        type: 'calendar_subscribe',
        festivalId: 'dragon_boat',
        targetCount: 1,
        reward: { points: 15 }
      },
      {
        id: 'db_answer',
        title: '端午知识挑战',
        description: '答对3道端午相关题目',
        type: 'answer_quiz',
        keyword: '端午|龙舟|屈原',
        targetCount: 3,
        reward: { points: 25 }
      },
      {
        id: 'db_contribute',
        title: '分享端午故事',
        description: '投稿一篇关于端午的记忆或习俗',
        type: 'publish',
        keyword: '端午|粽子|龙舟',
        targetCount: 1,
        reward: { points: 60, badge: 'dragon_boat_keeper' }
      }
    ]
  },
  mid_autumn: {
    id: 'mid_autumn',
    name: '中秋特别任务',
    description: '月圆中秋，传承团圆与思念的文化',
    festivalName: '中秋节',
    dateRange: { start: '08-01', end: '09-15' },
    icon: '🌕',
    backgroundImage: '',
    tasks: [
      {
        id: 'ma_read',
        title: '阅读中秋文化',
        description: '阅读中秋节相关文章',
        type: 'read_article',
        keyword: '中秋|月饼|团圆|月亮',
        targetCount: 1,
        reward: { points: 20 }
      },
      {
        id: 'ma_like',
        title: '点赞中秋内容',
        description: '点赞5篇中秋相关内容',
        type: 'like',
        keyword: '中秋|月饼|团圆',
        targetCount: 5,
        reward: { points: 25 }
      },
      {
        id: 'ma_share',
        title: '分享中秋记忆',
        description: '投稿一篇与中秋节相关的文章',
        type: 'publish',
        keyword: '中秋|月饼|团圆',
        targetCount: 1,
        reward: { points: 60, badge: 'mid_autumn_storyteller' }
      }
    ]
  }
};

const FESTIVAL_BADGES = {
  spring_ambassador: {
    id: 'spring_ambassador',
    name: '春节文化使者',
    description: '完成春节特别任务线',
    icon: '🧧',
    rarity: 'legendary',
    points: 200,
    festival: 'spring_festival'
  },
  dragon_boat_keeper: {
    id: 'dragon_boat_keeper',
    name: '端午文化传承人',
    description: '完成端午特别任务线',
    icon: '🐉',
    rarity: 'legendary',
    points: 200,
    festival: 'dragon_boat'
  },
  mid_autumn_storyteller: {
    id: 'mid_autumn_storyteller',
    name: '中秋故事讲述者',
    description: '完成中秋特别任务线',
    icon: '🌕',
    rarity: 'legendary',
    points: 200,
    festival: 'mid_autumn'
  }
};

const ALL_BADGES = { ...BADGES, ...FESTIVAL_BADGES };

const getTodayStr = () => util.formatDate(new Date(), 'YYYY-MM-DD');

const getCurrentUserId = () => {
  const userInfo = wx.getStorageSync('userInfo');
  return userInfo ? userInfo.id : null;
};

const safeGetStorage = (key, defaultValue = null) => {
  try {
    const value = wx.getStorageSync(key);
    if (value === '' || value === undefined || value === null) {
      return defaultValue;
    }
    return value;
  } catch (e) {
    return defaultValue;
  }
};

const safeSetStorage = (key, value) => {
  try {
    wx.setStorageSync(key, value);
  } catch (e) {
    console.error('[Task] Storage set error:', key, e);
  }
};

const getTaskStats = () => {
  const userId = getCurrentUserId();
  const allStats = safeGetStorage(STORAGE_KEYS.COMPLETED_TASKS, {});
  return userId ? (allStats[userId] || {}) : {};
};

const setTaskStats = (stats) => {
  const userId = getCurrentUserId();
  if (!userId) return;
  const allStats = safeGetStorage(STORAGE_KEYS.COMPLETED_TASKS, {});
  allStats[userId] = stats;
  safeSetStorage(STORAGE_KEYS.COMPLETED_TASKS, allStats);
};

const updateTaskStat = (key, increment = 1) => {
  const stats = getTaskStats();
  stats[key] = (stats[key] || 0) + increment;
  stats[`${key}_dates`] = stats[`${key}_dates`] || [];
  const today = getTodayStr();
  if (!stats[`${key}_dates`].includes(today)) {
    stats[`${key}_dates`].push(today);
  }
  setTaskStats(stats);
  return stats[key];
};

const getTaskStat = (key) => {
  const stats = getTaskStats();
  return stats[key] || 0;
};

const getUserPoints = () => {
  const userId = getCurrentUserId();
  const allPoints = safeGetStorage(STORAGE_KEYS.USER_POINTS, {});
  return userId ? (allPoints[userId] || 0) : 0;
};

const getUserLevel = (points) => {
  const userPoints = points !== undefined ? points : getUserPoints();
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (userPoints >= LEVELS[i].minPoints) {
      return { ...LEVELS[i] };
    }
  }
  return { ...LEVELS[0] };
};

const getLevelInfo = (levelNum) => {
  const level = LEVELS.find(l => l.level === levelNum);
  return level ? { ...level } : null;
};

const getAllLevels = () => LEVELS.map(l => ({ ...l }));

const getLevelProgress = (points) => {
  const userPoints = points !== undefined ? points : getUserPoints();
  const currentLevel = getUserLevel(userPoints);
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      progressPercent: 100,
      currentPoints: userPoints,
      pointsNeeded: 0,
      pointsToNext: 0
    };
  }

  const pointsInLevel = userPoints - currentLevel.minPoints;
  const pointsForLevel = nextLevel.minPoints - currentLevel.minPoints;
  const progressPercent = Math.min(Math.round((pointsInLevel / pointsForLevel) * 100), 100);
  const pointsToNext = nextLevel.minPoints - userPoints;

  return {
    currentLevel,
    nextLevel,
    progressPercent,
    currentPoints: userPoints,
    pointsNeeded: nextLevel.minPoints,
    pointsToNext
  };
};

const addUserPoints = (points) => {
  const userId = getCurrentUserId();
  if (!userId) return 0;
  const allPoints = safeGetStorage(STORAGE_KEYS.USER_POINTS, {});
  const current = allPoints[userId] || 0;
  allPoints[userId] = current + points;
  safeSetStorage(STORAGE_KEYS.USER_POINTS, allPoints);
  return allPoints[userId];
};

const getUserBadges = () => {
  const userId = getCurrentUserId();
  const allBadges = safeGetStorage(STORAGE_KEYS.USER_BADGES, {});
  const userBadgeIds = userId ? (allBadges[userId] || []) : [];
  return userBadgeIds.map(id => ALL_BADGES[id]).filter(Boolean);
};

const awardBadge = (badgeId) => {
  const userId = getCurrentUserId();
  if (!userId) return null;
  const badge = ALL_BADGES[badgeId];
  if (!badge) return null;

  const allBadges = safeGetStorage(STORAGE_KEYS.USER_BADGES, {});
  const userBadges = allBadges[userId] || [];
  if (userBadges.includes(badgeId)) {
    return null;
  }
  userBadges.push(badgeId);
  allBadges[userId] = userBadges;
  safeSetStorage(STORAGE_KEYS.USER_BADGES, allBadges);

  if (badge.points) {
    addUserPoints(badge.points);
  }
  return badge;
};

const grantReward = (reward) => {
  if (!reward) return { points: 0, badge: null };
  const result = { points: 0, badge: null };
  if (reward.points) {
    result.points = addUserPoints(reward.points);
  }
  if (reward.badge) {
    result.badge = awardBadge(reward.badge);
  }
  return result;
};

const getOnboardingRawStatus = () => {
  const userId = getCurrentUserId();
  const allStatus = safeGetStorage(STORAGE_KEYS.ONBOARDING_STATUS, {});
  return userId ? (allStatus[userId] || { completed: false, skipped: false, steps: [], completedDate: null }) : { completed: false, skipped: false, steps: [], completedDate: null };
};

const getOnboardingStatus = () => {
  const userStatus = getOnboardingRawStatus();
  const completedStepIds = userStatus.steps || [];
  const steps = ONBOARDING_STEPS.map((step, idx) => ({
    ...step,
    completed: completedStepIds.includes(step.id),
    isCompleted: completedStepIds.includes(step.id)
  }));
  const currentStepIndex = userStatus.completed ? -1 : steps.findIndex(s => !s.completed);
  return {
    ...userStatus,
    completedStepIds,
    steps,
    currentStepIndex
  };
};

const setOnboardingStatus = (status) => {
  const userId = getCurrentUserId();
  if (!userId) return;
  const allStatus = safeGetStorage(STORAGE_KEYS.ONBOARDING_STATUS, {});
  allStatus[userId] = {
    completed: !!status.completed,
    skipped: !!status.skipped,
    steps: status.steps || [],
    completedDate: status.completedDate || null
  };
  safeSetStorage(STORAGE_KEYS.ONBOARDING_STATUS, allStatus);
};

const isOnboardingCompleted = () => {
  const status = getOnboardingRawStatus();
  return status.completed === true;
};

const getCurrentOnboardingStep = () => {
  if (isOnboardingCompleted()) return null;
  const status = getOnboardingRawStatus();
  const completedStepIds = status.steps || [];
  const nextStep = ONBOARDING_STEPS.find(step => !completedStepIds.includes(step.id));
  return nextStep || null;
};

const checkOnboardingStepCondition = (stepId) => {
  const step = ONBOARDING_STEPS.find(s => s.id === stepId);
  if (!step) return false;
  const stats = getTaskStats();

  switch (step.checkCondition) {
    case 'hasViewedArticle':
      return (stats.viewedArticleCount || 0) >= 1;
    case 'hasViewedFigure':
      return (stats.viewedFigureCount || 0) >= 1;
    case 'hasAnsweredQuiz':
      return (stats.answeredQuizCount || 0) >= 1;
    case 'hasSubscribedCalendar':
      return (stats.subscribedEventCount || 0) >= 1;
    case 'hasPublishedOrJoined':
      return (stats.publishedArticleCount || 0) >= 1 || (stats.joinedActivityCount || 0) >= 1;
    default:
      return false;
  }
};

const completeOnboardingStep = (stepId) => {
  if (isOnboardingCompleted()) return { alreadyCompleted: true, success: true };

  const rawStatus = getOnboardingRawStatus();
  const completedStepIds = rawStatus.steps || [];

  if (completedStepIds.includes(stepId)) {
    return { alreadyCompleted: true, success: true };
  }

  const step = ONBOARDING_STEPS.find(s => s.id === stepId);
  if (!step) return { success: false, message: '步骤不存在' };

  if (!checkOnboardingStepCondition(stepId)) {
    switch (step.checkCondition) {
      case 'hasViewedArticle':
        recordAction('view_article', { articleId: 'onboarding_demo' });
        break;
      case 'hasViewedFigure':
        recordAction('view_figure', { figureId: 'onboarding_demo' });
        break;
      case 'hasAnsweredQuiz':
        recordAction('answer_quiz', { quizId: 'onboarding_demo', isCorrect: true });
        break;
      case 'hasSubscribedCalendar':
        recordAction('subscribe_event', { eventId: 'onboarding_demo' });
        break;
      case 'hasPublishedOrJoined':
        recordAction('publish_article', { articleId: 'onboarding_demo' });
        break;
    }
  }

  const newCompletedStepIds = [...completedStepIds, stepId];
  const rewardResult = grantReward(step.reward);

  const allStepsCompleted = ONBOARDING_STEPS.every(s => newCompletedStepIds.includes(s.id));

  const newStatus = {
    ...rawStatus,
    steps: newCompletedStepIds,
    completed: allStepsCompleted,
    completedDate: allStepsCompleted ? getTodayStr() : (rawStatus.completedDate || null)
  };

  setOnboardingStatus(newStatus);

  return {
    success: true,
    step,
    completedStep: stepId,
    reward: rewardResult,
    onboardingCompleted: newStatus.completed,
    nextStep: getCurrentOnboardingStep()
  };
};

const skipOnboarding = () => {
  const rawStatus = getOnboardingRawStatus();
  const newStatus = {
    ...rawStatus,
    completed: true,
    skipped: true,
    completedDate: getTodayStr()
  };
  setOnboardingStatus(newStatus);
  return true;
};

const getOnboardingProgress = () => {
  const status = getOnboardingStatus();
  const completedStepIds = status.completedStepIds || [];
  const total = ONBOARDING_STEPS.length;
  const completed = completedStepIds.length;
  return {
    total,
    completed,
    progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    steps: ONBOARDING_STEPS.map(step => ({
      ...step,
      completed: completedStepIds.includes(step.id),
      isCompleted: completedStepIds.includes(step.id)
    })),
    isCompleted: status.completed,
    skipped: !!status.skipped
  };
};

const getSevenDayStartDate = () => {
  const userId = getCurrentUserId();
  const allDates = safeGetStorage(STORAGE_KEYS.SEVEN_DAY_START, {});
  return userId ? (allDates[userId] || null) : null;
};

const initSevenDayTasks = () => {
  const userId = getCurrentUserId();
  if (!userId) return null;
  const existing = getSevenDayStartDate();
  if (existing) return existing;

  const today = getTodayStr();
  const allDates = safeGetStorage(STORAGE_KEYS.SEVEN_DAY_START, {});
  allDates[userId] = today;
  safeSetStorage(STORAGE_KEYS.SEVEN_DAY_START, allDates);
  return today;
};

const getSevenDayProgress = () => {
  const startDate = getSevenDayStartDate() || initSevenDayTasks();
  if (!startDate) return null;

  const userId = getCurrentUserId();
  const allProgress = safeGetStorage(STORAGE_KEYS.TASK_PROGRESS, {});
  const userProgress = userId ? (allProgress[userId] || {}) : {};
  const today = getTodayStr();
  const stats = getTaskStats();

  const start = new Date(startDate);
  const now = new Date(today);
  const daysDiff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = Math.min(Math.max(daysDiff + 1, 1), 7);

  const taskProgress = SEVEN_DAY_TASKS.map(task => {
    const progress = userProgress[task.id] || { completed: false, currentCount: 0, completedDate: null };
    const currentCount = stats[task.checkCondition] || 0;

    let effectiveCount = currentCount;
    if (!progress.completed) {
      effectiveCount = Math.min(currentCount, task.targetCount);
    }

    const isCompleted = progress.completed || effectiveCount >= task.targetCount;
    const progressPercent = task.targetCount > 0 ? Math.round((effectiveCount / task.targetCount) * 100) : 0;
    const isUnlocked = task.day <= currentDay;

    return {
      ...task,
      isCompleted,
      completed: isCompleted,
      currentCount: isCompleted ? task.targetCount : effectiveCount,
      progress: effectiveCount,
      progressPercent,
      targetCount: task.targetCount,
      canClaim: isUnlocked && !progress.completed && effectiveCount >= task.targetCount,
      claimable: isUnlocked && !progress.completed && effectiveCount >= task.targetCount,
      isUnlocked,
      isCurrentDay: task.day === currentDay,
      completedDate: progress.completedDate
    };
  });

  const completedCount = taskProgress.filter(t => t.isCompleted).length;

  return {
    startDate,
    currentDay,
    today,
    tasks: taskProgress,
    completedCount,
    totalTasks: SEVEN_DAY_TASKS.length,
    allCompleted: completedCount === SEVEN_DAY_TASKS.length,
    hasExpired: daysDiff >= 7 && !taskProgress[taskProgress.length - 1].isCompleted
  };
};

const claimSevenDayReward = (taskId) => {
  const progress = getSevenDayProgress();
  if (!progress) return { success: false, message: '系统异常' };

  const userId = getCurrentUserId();
  const allProgress = safeGetStorage(STORAGE_KEYS.TASK_PROGRESS, {});
  const userProgress = allProgress[userId] || {};
  const storedProgress = userProgress[taskId] || { completed: false };

  const task = progress.tasks.find(t => t.id === taskId);
  if (!task) return { success: false, message: '任务不存在' };
  if (!task.isUnlocked) return { success: false, message: '任务未解锁' };
  if (storedProgress.completed) return { success: false, alreadyClaimed: true, message: '奖励已领取' };
  if (!task.canClaim) return { success: false, message: '条件未达成' };

  userProgress[taskId] = {
    completed: true,
    currentCount: task.targetCount,
    completedDate: getTodayStr()
  };
  allProgress[userId] = userProgress;
  safeSetStorage(STORAGE_KEYS.TASK_PROGRESS, allProgress);

  const rewardResult = grantReward(task.reward);
  const newBadges = checkBadgeAutoUnlock();

  const latestProgress = safeGetStorage(STORAGE_KEYS.TASK_PROGRESS, {});
  const latestUserProgress = userId ? (latestProgress[userId] || {}) : {};
  const allCompleted = SEVEN_DAY_TASKS.every(t => {
    const p = latestUserProgress[t.id];
    return p && p.completed;
  });

  if (allCompleted) {
    awardBadge('seven_day_master');
  }

  return {
    success: true,
    claimed: true,
    task,
    reward: rewardResult,
    allCompleted,
    newBadges
  };
};

const isInFestivalDateRange = (festival) => {
  if (!festival || !festival.dateRange) return false;
  const now = new Date();
  const currentMD = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const { start, end } = festival.dateRange;
  return currentMD >= start && currentMD <= end;
};

const getActiveFestivalTaskLine = () => {
  for (const key of Object.keys(FESTIVAL_TASK_LINES)) {
    const festival = FESTIVAL_TASK_LINES[key];
    if (isInFestivalDateRange(festival)) {
      return {
        ...festival,
        active: true
      };
    }
  }
  return {
    active: false,
    festival: null
  };
};

const getFestivalProgress = (festivalId) => {
  const festival = FESTIVAL_TASK_LINES[festivalId];
  if (!festival) return null;

  const userId = getCurrentUserId();
  const allFestival = safeGetStorage(STORAGE_KEYS.FESTIVAL_TASKS, {});
  const userFestival = (userId ? (allFestival[userId] || {}) : {})[festivalId] || {};

  const stats = getTaskStats();

  const tasks = festival.tasks.map(task => {
    const taskProgress = userFestival[task.id] || { completed: false, claimed: false };

    let currentCount = 0;
    if (task.type === 'read_article') {
      currentCount = stats['festival_viewed_' + festivalId] || 0;
    } else if (task.type === 'favorite') {
      currentCount = stats['festival_favorite_' + festivalId] || 0;
    } else if (task.type === 'answer_quiz') {
      currentCount = stats['festival_quiz_' + festivalId] || 0;
    } else if (task.type === 'like') {
      currentCount = stats['festival_like_' + festivalId] || 0;
    } else if (task.type === 'publish') {
      currentCount = stats['festival_publish_' + festivalId] || 0;
    } else if (task.type === 'calendar_subscribe') {
      currentCount = stats['festival_subscribe_' + festivalId] || 0;
    }

    const effectiveCount = Math.min(currentCount, task.targetCount);
    const isCompleted = taskProgress.completed || effectiveCount >= task.targetCount;

    return {
      ...task,
      isCompleted,
      currentCount: isCompleted ? task.targetCount : effectiveCount,
      canClaim: !taskProgress.claimed && isCompleted,
      claimed: taskProgress.claimed
    };
  });

  return {
    festival,
    isActive: isInFestivalDateRange(festival),
    tasks,
    allCompleted: tasks.every(t => t.isCompleted),
    allClaimed: tasks.every(t => t.claimed)
  };
};

const claimFestivalReward = (festivalId, taskId) => {
  const progress = getFestivalProgress(festivalId);
  if (!progress) return { success: false, message: '节日不存在' };

  const task = progress.tasks.find(t => t.id === taskId);
  if (!task) return { success: false, message: '任务不存在' };
  if (task.claimed) return { success: false, alreadyClaimed: true, message: '奖励已领取' };
  if (!task.canClaim) return { success: false, message: '条件未达成' };

  const userId = getCurrentUserId();
  const allFestival = safeGetStorage(STORAGE_KEYS.FESTIVAL_TASKS, {});
  const userFestival = allFestival[userId] || {};
  userFestival[festivalId] = userFestival[festivalId] || {};
  userFestival[festivalId][taskId] = {
    completed: true,
    claimed: true,
    claimedDate: getTodayStr()
  };
  allFestival[userId] = userFestival;
  safeSetStorage(STORAGE_KEYS.FESTIVAL_TASKS, allFestival);

  const rewardResult = grantReward(task.reward);

  return {
    success: true,
    task,
    reward: rewardResult
  };
};

const getReceivedLikesCount = () => {
  const userId = getCurrentUserId();
  if (!userId) return 0;
  const articles = wx.getStorageSync('articles') || [];
  const userArticles = articles.filter(a => a.authorId === userId);
  return userArticles.reduce((sum, a) => sum + (a.likeCount || 0), 0);
};

const getInterviewCount = () => {
  const userId = getCurrentUserId();
  if (!userId) return 0;
  const interviews = wx.getStorageSync('interviews') || [];
  return interviews.filter(i => i.authorId === userId && i.status === 1).length;
};

const getVolunteerCount = () => {
  const stats = getTaskStats();
  return stats.volunteerActivityCount || 0;
};

const getConsecutiveCheckinDays = () => {
  const stats = getTaskStats();
  const checkinDates = stats.checkin_dates || [];
  if (checkinDates.length === 0) return 0;

  const today = getTodayStr();
  const sortedDates = [...checkinDates].sort().reverse();

  let consecutive = 0;
  let currentDate = new Date(today);

  for (let i = 0; i < sortedDates.length; i++) {
    const dateStr = sortedDates[i];
    const checkDate = new Date(dateStr);
    const diffDays = Math.floor((currentDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === consecutive) {
      consecutive++;
    } else if (diffDays > consecutive) {
      break;
    }
  }

  return consecutive;
};

const checkBadgeAutoUnlock = () => {
  const unlocked = [];
  const stats = getTaskStats();
  const userBadges = getUserBadges().map(b => b.id);

  for (const badgeId of Object.keys(ALL_BADGES)) {
    if (userBadges.includes(badgeId)) continue;
    const badge = ALL_BADGES[badgeId];
    if (!badge.condition) continue;

    let shouldUnlock = false;
    const { type, value } = badge.condition;

    switch (type) {
      case 'favorite_count':
        shouldUnlock = (stats.favoritedArticleCount || 0) >= value;
        break;
      case 'correct_quiz_count':
        shouldUnlock = (stats.correctQuizCount || 0) >= value;
        break;
      case 'published_count':
        shouldUnlock = (stats.publishedArticleCount || 0) >= value;
        break;
      case 'viewed_figure_count':
        shouldUnlock = (stats.viewedFigureCount || 0) >= value;
        break;
      case 'subscribed_all_festivals': {
        const calendarData = require('./calendar-data');
        const allFestivals = calendarData.getAllEventIds();
        const subscribed = calendarData.getSubscribedEventIds();
        shouldUnlock = allFestivals.every(id => subscribed.includes(id));
        break;
      }
      case 'received_likes':
        shouldUnlock = getReceivedLikesCount() >= value;
        break;
      case 'interview_count':
        shouldUnlock = getInterviewCount() >= value;
        break;
      case 'volunteer_count':
        shouldUnlock = getVolunteerCount() >= value;
        break;
      case 'consecutive_checkin':
        shouldUnlock = getConsecutiveCheckinDays() >= value;
        break;
      case 'joined_activity_count':
        shouldUnlock = (stats.joinedActivityCount || 0) >= value;
        break;
    }

    if (shouldUnlock) {
      const awarded = awardBadge(badgeId);
      if (awarded) {
        unlocked.push(awarded);
      }
    }
  }
  return unlocked;
};

const doDailyCheckin = () => {
  const userId = getCurrentUserId();
  if (!userId) return { success: false, message: '请先登录' };

  const today = getTodayStr();
  const stats = getTaskStats();
  const checkinDates = stats.checkin_dates || [];

  if (checkinDates.includes(today)) {
    return { success: false, alreadyChecked: true, message: '今日已打卡' };
  }

  checkinDates.push(today);
  const newStats = { ...stats, checkin_dates: checkinDates };
  setTaskStats(newStats);

  const consecutiveDays = getConsecutiveCheckinDays();
  const rewardPoints = consecutiveDays >= 7 ? 15 : (consecutiveDays >= 3 ? 10 : 5);
  addUserPoints(rewardPoints);

  const newBadges = checkBadgeAutoUnlock();

  return {
    success: true,
    consecutiveDays,
    rewardPoints,
    newBadges
  };
};

const hasCheckedInToday = () => {
  const stats = getTaskStats();
  const checkinDates = stats.checkin_dates || [];
  return checkinDates.includes(getTodayStr());
};

const recordAction = (actionType, data = {}) => {
  const statsUpdates = [];
  let pointsEarned = 0;

  switch (actionType) {
    case 'view_article':
      updateTaskStat('viewedArticleCount', 1);
      statsUpdates.push('viewedArticleCount');
      pointsEarned = POINTS_RULES.view_article;
      if (pointsEarned) addUserPoints(pointsEarned);
      if (data.keyword && data.festivalId) {
        updateTaskStat('festival_viewed_' + data.festivalId, 1);
      }
      break;
    case 'favorite_article':
      updateTaskStat('favoritedArticleCount', 1);
      statsUpdates.push('favoritedArticleCount');
      pointsEarned = POINTS_RULES.favorite_article;
      if (pointsEarned) addUserPoints(pointsEarned);
      if (data.festivalId) {
        updateTaskStat('festival_favorite_' + data.festivalId, 1);
      }
      break;
    case 'like_article':
      updateTaskStat('likedArticleCount', 1);
      statsUpdates.push('likedArticleCount');
      if (data.festivalId) {
        updateTaskStat('festival_like_' + data.festivalId, 1);
      }
      break;
    case 'receive_like':
      pointsEarned = POINTS_RULES.like_received;
      if (pointsEarned) addUserPoints(pointsEarned);
      break;
    case 'answer_quiz':
      updateTaskStat('answeredQuizCount', 1);
      statsUpdates.push('answeredQuizCount');
      if (data.isCorrect) {
        updateTaskStat('correctQuizCount', 1);
        statsUpdates.push('correctQuizCount');
        pointsEarned = POINTS_RULES.correct_quiz;
        if (pointsEarned) addUserPoints(pointsEarned);
      }
      if (data.festivalId) {
        updateTaskStat('festival_quiz_' + data.festivalId, data.isCorrect ? 1 : 0);
      }
      break;
    case 'view_figure':
      updateTaskStat('viewedFigureCount', 1);
      statsUpdates.push('viewedFigureCount');
      break;
    case 'view_opera':
      updateTaskStat('viewedOperaCount', 1);
      statsUpdates.push('viewedOperaCount');
      pointsEarned = POINTS_RULES.view_opera;
      if (pointsEarned) addUserPoints(pointsEarned);
      break;
    case 'favorite_opera':
      updateTaskStat('favoritedOperaCount', 1);
      statsUpdates.push('favoritedOperaCount');
      pointsEarned = POINTS_RULES.favorite_opera;
      if (pointsEarned) addUserPoints(pointsEarned);
      break;
    case 'publish_article':
      updateTaskStat('publishedArticleCount', 1);
      statsUpdates.push('publishedArticleCount');
      pointsEarned = POINTS_RULES.publish_article;
      if (pointsEarned) addUserPoints(pointsEarned);
      if (data.festivalId) {
        updateTaskStat('festival_publish_' + data.festivalId, 1);
      }
      break;
    case 'publish_interview':
      updateTaskStat('publishedInterviewCount', 1);
      statsUpdates.push('publishedInterviewCount');
      pointsEarned = POINTS_RULES.complete_interview;
      if (pointsEarned) addUserPoints(pointsEarned);
      break;
    case 'subscribe_event':
      updateTaskStat('subscribedEventCount', 1);
      statsUpdates.push('subscribedEventCount');
      if (data.festivalId) {
        updateTaskStat('festival_subscribe_' + data.festivalId, 1);
      }
      break;
    case 'join_activity':
      updateTaskStat('joinedActivityCount', 1);
      statsUpdates.push('joinedActivityCount');
      pointsEarned = POINTS_RULES.join_activity;
      if (pointsEarned) addUserPoints(pointsEarned);
      break;
    case 'volunteer_activity':
      updateTaskStat('volunteerActivityCount', 1);
      statsUpdates.push('volunteerActivityCount');
      pointsEarned = POINTS_RULES.volunteer_activity;
      if (pointsEarned) addUserPoints(pointsEarned);
      break;
    case 'comment_article':
      pointsEarned = POINTS_RULES.comment_article;
      if (pointsEarned) addUserPoints(pointsEarned);
      break;
    case 'share_article':
      pointsEarned = POINTS_RULES.share_article;
      if (pointsEarned) addUserPoints(pointsEarned);
      break;
  }

  const newBadges = checkBadgeAutoUnlock();
  return {
    statsUpdates,
    pointsEarned,
    newBadges
  };
};

const resetUserData = () => {
  const userId = getCurrentUserId();
  if (!userId) return;

  const keys = [
    STORAGE_KEYS.ONBOARDING_STATUS,
    STORAGE_KEYS.TASK_PROGRESS,
    STORAGE_KEYS.USER_POINTS,
    STORAGE_KEYS.USER_BADGES,
    STORAGE_KEYS.FESTIVAL_TASKS,
    STORAGE_KEYS.COMPLETED_TASKS,
    STORAGE_KEYS.SEVEN_DAY_START
  ];

  keys.forEach(key => {
    const data = safeGetStorage(key, {});
    if (data && typeof data === 'object') {
      delete data[userId];
      safeSetStorage(key, data);
    }
  });
};

const getUserPointsById = (userId) => {
  if (!userId) return 0;
  const allPoints = safeGetStorage(STORAGE_KEYS.USER_POINTS, {});
  return allPoints[userId] || 0;
};

const getUserBadgesById = (userId) => {
  if (!userId) return [];
  const allBadges = safeGetStorage(STORAGE_KEYS.USER_BADGES, {});
  const userBadgeIds = allBadges[userId] || [];
  return userBadgeIds.map(id => ALL_BADGES[id]).filter(Boolean);
};

const getUserLevelById = (userId) => {
  const points = getUserPointsById(userId);
  return getUserLevel(points);
};

const getLevelProgressById = (userId) => {
  const points = getUserPointsById(userId);
  return getLevelProgress(points);
};

module.exports = {
  STORAGE_KEYS,
  ONBOARDING_STEPS,
  SEVEN_DAY_TASKS,
  BADGES: ALL_BADGES,
  FESTIVAL_BADGES,
  FESTIVAL_TASK_LINES,
  LEVELS,
  POINTS_RULES,
  getOnboardingStatus,
  isOnboardingCompleted,
  getCurrentOnboardingStep,
  completeOnboardingStep,
  skipOnboarding,
  getOnboardingProgress,
  initSevenDayTasks,
  getSevenDayProgress,
  claimSevenDayReward,
  getActiveFestivalTaskLine,
  getFestivalProgress,
  claimFestivalReward,
  getUserPoints,
  addUserPoints,
  getUserBadges,
  awardBadge,
  getAllBadges: () => Object.values(ALL_BADGES),
  getBadgeById: (id) => ALL_BADGES[id] || null,
  recordAction,
  checkBadgeAutoUnlock,
  resetTaskData: resetUserData,
  resetUserData,
  getTodayStr,
  getUserLevel,
  getLevelInfo,
  getAllLevels,
  getLevelProgress,
  doDailyCheckin,
  hasCheckedInToday,
  getConsecutiveCheckinDays,
  getReceivedLikesCount,
  getInterviewCount,
  getVolunteerCount,
  getUserPointsById,
  getUserBadgesById,
  getUserLevelById,
  getLevelProgressById
};
