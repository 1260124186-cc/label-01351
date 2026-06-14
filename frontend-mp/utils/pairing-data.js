var util = require('./util');
var figureData = require('./figure-data');

var TEACHING_METHODS = [
  { id: 'offline', name: '线下传授', icon: '🏫', desc: '面对面、手把手教学' },
  { id: 'online_text', name: '线上文字指导', icon: '💬', desc: '通过私信远程指导' },
  { id: 'both', name: '线下+线上', icon: '🔄', desc: '线下为主，线上辅助' }
];

var SKILL_TAGS = [
  { id: 'weaving', name: '纺织技艺', icon: '🧶' },
  { id: 'pottery', name: '陶瓷制作', icon: '🏺' },
  { id: 'woodcarving', name: '木雕工艺', icon: '🪵' },
  { id: 'papercut', name: '剪纸艺术', icon: '✂️' },
  { id: 'embroidery', name: '刺绣技艺', icon: '🧵' },
  { id: 'farming', name: '传统农耕', icon: '🌾' },
  { id: 'herbal', name: '中草药知识', icon: '🌿' },
  { id: 'cooking', name: '传统烹饪', icon: '🍜' },
  { id: 'storytelling', name: '民间故事', icon: '📖' },
  { id: 'calligraphy', name: '书法艺术', icon: '🖊️' },
  { id: 'dyeing', name: '印染技艺', icon: '🎨' },
  { id: 'lacquer', name: '漆艺', icon: '🖌️' },
  { id: 'bamboo', name: '竹编工艺', icon: '🎋' },
  { id: 'tea', name: '茶艺', icon: '🍵' },
  { id: 'other', name: '其他技艺', icon: '✨' }
];

var TIME_COMMITMENTS = [
  { id: 'weekend', name: '周末', icon: '📅', desc: '每周周末' },
  { id: 'weekly', name: '每周固定', icon: '📆', desc: '每周固定时间' },
  { id: 'intensive', name: '集中学习', icon: '⚡', desc: '短期集中学习' },
  { id: 'flexible', name: '灵活安排', icon: '🔄', desc: '时间灵活协商' }
];

var PAIRING_STATUS = {
  pending: { id: 'pending', name: '待确认', icon: '⏳', color: '#DAA520' },
  active: { id: 'active', name: '进行中', icon: '✅', color: '#228B22' },
  completing: { id: 'completing', name: '待结业', icon: '📝', color: '#4682B4' },
  completed: { id: 'completed', name: '已结业', icon: '🎓', color: '#8B4513' },
  cancelled: { id: 'cancelled', name: '已取消', icon: '❌', color: '#999999' }
};

var DEFAULT_TEACHINGS = [
  {
    id: 'teach_001',
    masterId: 'figure_002',
    masterName: '李陈氏',
    masterAvatar: 'https://picsum.photos/id/91/200/200',
    skillType: 'embroidery',
    title: '苏绣基础技法传授',
    description: '从选线、配色到基本针法，系统教授苏绣入门技艺。适合零基础学员，每周六下午在传习所面授。',
    method: 'offline',
    region: 'east',
    regionName: '华东地区',
    location: '苏州市刺绣传习所',
    maxStudents: 5,
    currentStudents: 2,
    timeCommitment: 'weekly',
    relatedFigureId: 'figure_002',
    relatedLandmarkId: '',
    relatedActivityId: '',
    tags: ['苏绣', '刺绣', '非遗'],
    viewCount: 456,
    likeCount: 89,
    createTime: '2024-12-05',
    status: 1
  },
  {
    id: 'teach_002',
    masterId: 'figure_004',
    masterName: '赵天工',
    masterAvatar: 'https://picsum.photos/id/338/200/200',
    skillType: 'woodcarving',
    title: '木雕工艺入门教学',
    description: '祖上三代木匠，传授传统木雕基本刀法和设计构思。线上文字指导为主，可线下答疑。',
    method: 'both',
    region: 'southwest',
    regionName: '西南地区',
    location: '四川省木雕工作室',
    maxStudents: 3,
    currentStudents: 1,
    timeCommitment: 'flexible',
    relatedFigureId: 'figure_004',
    relatedLandmarkId: '',
    relatedActivityId: '',
    tags: ['木雕', '工艺', '传统'],
    viewCount: 328,
    likeCount: 67,
    createTime: '2024-12-10',
    status: 1
  },
  {
    id: 'teach_003',
    masterId: 'figure_006',
    masterName: '孙巧娘',
    masterAvatar: 'https://picsum.photos/id/64/200/200',
    skillType: 'papercut',
    title: '陕北剪纸传承教学',
    description: '传授黄土高原特色剪纸技法，从折剪到刻剪，循序渐进。线上指导为主，可邮寄材料。',
    method: 'online_text',
    region: 'northwest',
    regionName: '西北地区',
    location: '陕西省延安市',
    maxStudents: 10,
    currentStudents: 4,
    timeCommitment: 'flexible',
    relatedFigureId: 'figure_006',
    relatedLandmarkId: '',
    relatedActivityId: '',
    tags: ['剪纸', '陕北', '民俗'],
    viewCount: 289,
    likeCount: 56,
    createTime: '2024-12-15',
    status: 1
  },
  {
    id: 'teach_004',
    masterId: 'figure_008',
    masterName: '吴桂兰',
    masterAvatar: 'https://picsum.photos/id/177/200/200',
    skillType: 'pottery',
    title: '紫砂壶制作技艺',
    description: '传授紫砂壶从选泥到烧制的完整流程，需有一定陶艺基础。线下小班教学。',
    method: 'offline',
    region: 'east',
    regionName: '华东地区',
    location: '宜兴市紫砂艺术馆',
    maxStudents: 3,
    currentStudents: 2,
    timeCommitment: 'intensive',
    relatedFigureId: 'figure_008',
    relatedLandmarkId: '',
    relatedActivityId: '',
    tags: ['紫砂', '陶艺', '非遗'],
    viewCount: 567,
    likeCount: 134,
    createTime: '2024-12-20',
    status: 1
  }
];

var DEFAULT_LEARNINGS = [
  {
    id: 'learn_001',
    learnerId: 'user_001',
    learnerName: '张大爷',
    learnerAvatar: '',
    skillType: 'papercut',
    title: '想学剪纸艺术',
    description: '对剪纸很感兴趣，希望找到老师学习基本技法，时间灵活。',
    region: 'north',
    regionName: '华北地区',
    timeCommitment: 'flexible',
    relatedFigureId: '',
    tags: ['剪纸', '民间艺术'],
    viewCount: 123,
    createTime: '2024-12-08',
    status: 1
  },
  {
    id: 'learn_002',
    learnerId: 'user_003',
    learnerName: '王老师',
    learnerAvatar: '',
    skillType: 'embroidery',
    title: '学习刺绣技法',
    description: '退休教师，想学刺绣修身养性，周末时间充裕，可线下学习。',
    region: 'east',
    regionName: '华东地区',
    timeCommitment: 'weekend',
    relatedFigureId: '',
    tags: ['刺绣', '苏绣'],
    viewCount: 89,
    createTime: '2024-12-12',
    status: 1
  },
  {
    id: 'learn_003',
    learnerId: 'user_005',
    learnerName: '刘大伯',
    learnerAvatar: '',
    skillType: 'woodcarving',
    title: '求教木雕工艺',
    description: '对木工有兴趣，想学习传统木雕技法，可以通过线上指导学习。',
    region: 'southwest',
    regionName: '西南地区',
    timeCommitment: 'flexible',
    relatedFigureId: '',
    tags: ['木雕', '传统工艺'],
    viewCount: 67,
    createTime: '2024-12-18',
    status: 1
  }
];

var DEFAULT_PAIRINGS = [
  {
    id: 'pair_001',
    teachingId: 'teach_001',
    learningId: 'learn_002',
    masterId: 'figure_002',
    masterName: '李陈氏',
    masterAvatar: 'https://picsum.photos/id/91/200/200',
    learnerId: 'user_003',
    learnerName: '王老师',
    learnerAvatar: '',
    skillType: 'embroidery',
    skillName: '刺绣技艺',
    status: 'active',
    totalHours: 24,
    checkins: [
      { id: 'ck_001', date: '2024-12-14', hours: 3, content: '学习基本平针绣法，完成了一朵小花', createTime: '2024-12-14 17:00:00' },
      { id: 'ck_002', date: '2024-12-21', hours: 3, content: '学习乱针绣法，练习色彩过渡', createTime: '2024-12-21 17:00:00' },
      { id: 'ck_003', date: '2025-01-04', hours: 3, content: '独立完成小件作品，老师指导修改', createTime: '2025-01-04 17:00:00' },
      { id: 'ck_004', date: '2025-01-11', hours: 3, content: '学习双面绣基本技法', createTime: '2025-01-11 17:00:00' },
      { id: 'ck_005', date: '2025-01-18', hours: 3, content: '练习双面绣，尝试不同题材', createTime: '2025-01-18 17:00:00' },
      { id: 'ck_006', date: '2025-02-01', hours: 3, content: '学期中段考核，完成指定作品', createTime: '2025-02-01 17:00:00' },
      { id: 'ck_007', date: '2025-02-08', hours: 3, content: '学习山水绣法', createTime: '2025-02-08 17:00:00' },
      { id: 'ck_008', date: '2025-02-15', hours: 3, content: '完成山水小景作品', createTime: '2025-02-15 17:00:00' }
    ],
    startTime: '2024-12-14',
    messageEnabled: true,
    commemorativeCardGenerated: false,
    createTime: '2024-12-13',
    villageId: 'village_002'
  }
];

var getSkillTagInfo = function(id) {
  return SKILL_TAGS.find(function(s) { return s.id === id; }) || { id: id, name: '其他', icon: '✨' };
};

var getTeachingMethodInfo = function(id) {
  return TEACHING_METHODS.find(function(m) { return m.id === id; }) || { id: id, name: '未知', icon: '❓' };
};

var getTimeCommitmentInfo = function(id) {
  return TIME_COMMITMENTS.find(function(t) { return t.id === id; }) || { id: id, name: '未知', icon: '❓' };
};

var getPairingStatusInfo = function(id) {
  return PAIRING_STATUS[id] || { id: id, name: '未知', icon: '❓', color: '#999999' };
};

var getRegionName = function(id) {
  return figureData.getRegionName(id);
};

var matchScore = function(teaching, learning) {
  var score = 0;

  if (teaching.skillType === learning.skillType) {
    score += 50;
  }

  if (teaching.region === learning.region) {
    score += 30;
  }

  if (teaching.timeCommitment === learning.timeCommitment) {
    score += 10;
  }

  var teachingTags = teaching.tags || [];
  var learningTags = learning.tags || [];
  var overlap = 0;
  teachingTags.forEach(function(tag) {
    if (learningTags.indexOf(tag) !== -1) {
      overlap++;
    }
  });
  score += Math.min(overlap * 5, 10);

  return score;
};

var findMatches = function(learning, teachings, options) {
  var minScore = (options && options.minScore) || 30;
  var limit = (options && options.limit) || 10;

  var scored = teachings
    .filter(function(t) {
      return t.status === 1 && t.currentStudents < t.maxStudents && t.masterId !== learning.learnerId;
    })
    .map(function(t) {
      return { teaching: t, score: matchScore(t, learning) };
    })
    .filter(function(item) {
      return item.score >= minScore;
    })
    .sort(function(a, b) {
      return b.score - a.score;
    })
    .slice(0, limit);

  return scored;
};

var findMatchesForTeaching = function(teaching, learnings, options) {
  var minScore = (options && options.minScore) || 30;
  var limit = (options && options.limit) || 10;

  var scored = learnings
    .filter(function(l) {
      return l.status === 1 && l.learnerId !== teaching.masterId;
    })
    .map(function(l) {
      return { learning: l, score: matchScore(teaching, l) };
    })
    .filter(function(item) {
      return item.score >= minScore;
    })
    .sort(function(a, b) {
      return b.score - a.score;
    })
    .slice(0, limit);

  return scored;
};

var filterTeachings = function(teachings, filters) {
  var skillType = filters.skillType || 'all';
  var region = filters.region || 'all';
  var method = filters.method || 'all';
  var keyword = filters.keyword || '';

  var result = teachings;

  if (skillType && skillType !== 'all') {
    result = result.filter(function(t) { return t.skillType === skillType; });
  }
  if (region && region !== 'all') {
    result = result.filter(function(t) { return t.region === region; });
  }
  if (method && method !== 'all') {
    result = result.filter(function(t) { return t.method === method; });
  }
  if (keyword && keyword.trim()) {
    var kw = keyword.toLowerCase().trim();
    result = result.filter(function(t) {
      return t.title.toLowerCase().includes(kw) ||
        t.description.toLowerCase().includes(kw) ||
        (t.tags && t.tags.some(function(tag) { return tag.toLowerCase().includes(kw); }));
    });
  }

  return result;
};

var filterLearnings = function(learnings, filters) {
  var skillType = filters.skillType || 'all';
  var region = filters.region || 'all';
  var keyword = filters.keyword || '';

  var result = learnings;

  if (skillType && skillType !== 'all') {
    result = result.filter(function(l) { return l.skillType === skillType; });
  }
  if (region && region !== 'all') {
    result = result.filter(function(l) { return l.region === region; });
  }
  if (keyword && keyword.trim()) {
    var kw = keyword.toLowerCase().trim();
    result = result.filter(function(l) {
      return l.title.toLowerCase().includes(kw) ||
        l.description.toLowerCase().includes(kw) ||
        (l.tags && l.tags.some(function(tag) { return tag.toLowerCase().includes(kw); }));
    });
  }

  return result;
};

var generateCardData = function(pairing) {
  var statusInfo = getPairingStatusInfo('completed');
  var skillInfo = getSkillTagInfo(pairing.skillType);
  var totalHours = pairing.totalHours || 0;
  var checkinCount = (pairing.checkins || []).length;

  return {
    pairingId: pairing.id,
    masterName: pairing.masterName,
    learnerName: pairing.learnerName,
    skillName: pairing.skillName || skillInfo.name,
    skillIcon: skillInfo.icon,
    totalHours: totalHours,
    checkinCount: checkinCount,
    startTime: pairing.startTime,
    completeTime: util.formatDate(new Date(), 'YYYY-MM-DD'),
    masterAvatar: pairing.masterAvatar || '',
    learnerAvatar: pairing.learnerAvatar || '',
    cardId: 'card_' + pairing.id,
    cardType: 'commemorative',
    generateTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
  };
};

var initPairingData = function() {
  var teachings = wx.getStorageSync('teachings');
  if (!teachings || teachings.length === 0) {
    wx.setStorageSync('teachings', JSON.parse(JSON.stringify(DEFAULT_TEACHINGS)));
  }

  var learnings = wx.getStorageSync('learnings');
  if (!learnings || learnings.length === 0) {
    wx.setStorageSync('learnings', JSON.parse(JSON.stringify(DEFAULT_LEARNINGS)));
  }

  var pairings = wx.getStorageSync('pairings');
  if (!pairings || pairings.length === 0) {
    wx.setStorageSync('pairings', JSON.parse(JSON.stringify(DEFAULT_PAIRINGS)));
  }

  var studyCheckins = wx.getStorageSync('studyCheckins');
  if (!studyCheckins) {
    wx.setStorageSync('studyCheckins', {});
  }

  var commemorativeCards = wx.getStorageSync('commemorativeCards');
  if (!commemorativeCards) {
    wx.setStorageSync('commemorativeCards', {});
  }
};

var getTeachingsByMasterId = function(masterId) {
  var teachings = wx.getStorageSync('teachings') || [];
  return teachings.filter(function(t) { return t.masterId === masterId && t.status === 1; });
};

var getLearningsByLearnerId = function(learnerId) {
  var learnings = wx.getStorageSync('learnings') || [];
  return learnings.filter(function(l) { return l.learnerId === learnerId && l.status === 1; });
};

var getPairingsByUserId = function(userId) {
  var pairings = wx.getStorageSync('pairings') || [];
  return pairings.filter(function(p) {
    return (p.masterId === userId || p.learnerId === userId) && p.status !== 'cancelled';
  });
};

var getPairingsByStatus = function(status) {
  var pairings = wx.getStorageSync('pairings') || [];
  return pairings.filter(function(p) { return p.status === status; });
};

module.exports = {
  TEACHING_METHODS: TEACHING_METHODS,
  SKILL_TAGS: SKILL_TAGS,
  TIME_COMMITMENTS: TIME_COMMITMENTS,
  PAIRING_STATUS: PAIRING_STATUS,
  DEFAULT_TEACHINGS: DEFAULT_TEACHINGS,
  DEFAULT_LEARNINGS: DEFAULT_LEARNINGS,
  DEFAULT_PAIRINGS: DEFAULT_PAIRINGS,
  getSkillTagInfo: getSkillTagInfo,
  getTeachingMethodInfo: getTeachingMethodInfo,
  getTimeCommitmentInfo: getTimeCommitmentInfo,
  getPairingStatusInfo: getPairingStatusInfo,
  getRegionName: getRegionName,
  matchScore: matchScore,
  findMatches: findMatches,
  findMatchesForTeaching: findMatchesForTeaching,
  filterTeachings: filterTeachings,
  filterLearnings: filterLearnings,
  generateCardData: generateCardData,
  initPairingData: initPairingData,
  getTeachingsByMasterId: getTeachingsByMasterId,
  getLearningsByLearnerId: getLearningsByLearnerId,
  getPairingsByUserId: getPairingsByUserId,
  getPairingsByStatus: getPairingsByStatus
};
