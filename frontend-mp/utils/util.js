// utils/util.js - 工具函数

/**
 * 格式化日期
 * @param {Date|string} date 日期对象或字符串
 * @param {string} format 格式化模板
 * @returns {string} 格式化后的日期字符串
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 格式化相对时间
 * @param {Date|string} date 日期
 * @returns {string} 相对时间描述
 */
const formatRelativeTime = (date) => {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else if (diff < month) {
    return Math.floor(diff / day) + '天前';
  } else {
    return formatDate(d, 'YYYY-MM-DD');
  }
};

/**
 * 生成唯一ID
 * @param {string} prefix 前缀
 * @returns {string} 唯一ID
 */
const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
};

/**
 * 防抖函数
 * @param {Function} fn 要执行的函数
 * @param {number} delay 延迟时间
 * @returns {Function} 防抖后的函数
 */
const debounce = (fn, delay = 300) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

/**
 * 节流函数
 * @param {Function} fn 要执行的函数
 * @param {number} interval 间隔时间
 * @returns {Function} 节流后的函数
 */
const throttle = (fn, interval = 300) => {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
};

/**
 * 截取文本
 * @param {string} text 文本
 * @param {number} length 长度
 * @returns {string} 截取后的文本
 */
const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * 校验表单
 * @param {Object} data 表单数据
 * @param {Array} rules 校验规则
 * @returns {Object} { valid: boolean, message: string }
 */
const validateForm = (data, rules) => {
  for (const rule of rules) {
    const value = data[rule.field];

    // 必填校验
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return { valid: false, message: rule.message || `${rule.field}不能为空` };
    }

    // 最小长度校验
    if (rule.minLength && value && value.length < rule.minLength) {
      return { valid: false, message: rule.message || `${rule.field}长度不能少于${rule.minLength}个字符` };
    }

    // 最大长度校验
    if (rule.maxLength && value && value.length > rule.maxLength) {
      return { valid: false, message: rule.message || `${rule.field}长度不能超过${rule.maxLength}个字符` };
    }
  }

  return { valid: true, message: '' };
};

/**
 * 获取分类名称
 * @param {string} categoryId 分类ID
 * @returns {string} 分类名称
 */
const getCategoryName = (categoryId) => {
  const categoryMap = {
    'all': '全部',
    'folklore': '民俗故事',
    'farming': '农耕智慧',
    'craft': '传统技艺',
    'memory': '乡土记忆'
  };
  return categoryMap[categoryId] || '未知分类';
};

const ACTIVITY_TYPES = {
  lecture: { id: 'lecture', name: '讲座', icon: '🎤' },
  study: { id: 'study', name: '研学', icon: '📚' },
  craft: { id: 'craft', name: '技艺体验', icon: '🎨' }
};

const getActivityTypes = () => Object.values(ACTIVITY_TYPES);

const getActivityTypeName = (typeId) => {
  return ACTIVITY_TYPES[typeId] ? ACTIVITY_TYPES[typeId].name : '未知类型';
};

const getActivityTypeIcon = (typeId) => {
  return ACTIVITY_TYPES[typeId] ? ACTIVITY_TYPES[typeId].icon : '📌';
};

const getActivityStatus = (activity) => {
  const now = new Date().getTime();
  const startTime = new Date(activity.startTime).getTime();
  const endTime = new Date(activity.endTime).getTime();
  const registeredCount = activity.registeredCount || 0;
  const maxParticipants = activity.maxParticipants || 0;

  if (now > endTime) {
    return { id: 'ended', name: '已结束', color: '#999999' };
  }
  if (registeredCount >= maxParticipants) {
    return { id: 'full', name: '已满', color: '#FF6B6B' };
  }
  return { id: 'open', name: '报名中', color: '#52C41A' };
};

const canCancelRegistration = (activity) => {
  const now = new Date().getTime();
  const startTime = new Date(activity.startTime).getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return startTime - now >= twentyFourHours;
};

const formatActivityTime = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const startStr = formatDate(start, 'YYYY-MM-DD HH:mm');
  const endStr = formatDate(end, 'HH:mm');
  const sameDay = formatDate(start, 'YYYY-MM-DD') === formatDate(end, 'YYYY-MM-DD');
  if (sameDay) {
    return `${startStr}-${endStr}`;
  }
  return `${startStr} 至 ${formatDate(end, 'YYYY-MM-DD HH:mm')}`;
};

const SENSITIVE_WORDS = [
  '虚假宣传', '包治百病', '代购走私', '刷单返利', '赌博下注',
  '低俗擦边', '投资理财稳赚', '枪支交易', '虚假中奖', '封建迷信',
  '毒品', '色情', '暴力', '诈骗', '传销'
];

const checkSensitiveWords = (text) => {
  if (!text || typeof text !== 'string') {
    return { hasSensitive: false, matchedWords: [] };
  }
  const matched = [];
  const lowerText = text.toLowerCase();
  SENSITIVE_WORDS.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      matched.push(word);
    }
  });
  return {
    hasSensitive: matched.length > 0,
    matchedWords: matched
  };
};

const SUGGESTED_TAGS = [
  '端午节', '织布', '刺绣', '剪纸', '年画', '皮影', '陶艺',
  '竹编', '木雕', '制茶', '酿酒', '养蚕', '农耕', '节日',
  '婚俗', '丧礼', '庙会', '戏曲', '山歌', '民谣'
];

const base64Encode = (str) => {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const utf8Bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) {
      utf8Bytes.push(code);
    } else if (code < 0x800) {
      utf8Bytes.push(0xc0 | (code >> 6));
      utf8Bytes.push(0x80 | (code & 0x3f));
    } else if (code < 0xd800 || code >= 0xe000) {
      utf8Bytes.push(0xe0 | (code >> 12));
      utf8Bytes.push(0x80 | ((code >> 6) & 0x3f));
      utf8Bytes.push(0x80 | (code & 0x3f));
    } else {
      i++;
      const code2 = str.charCodeAt(i);
      const full = 0x10000 + (((code & 0x3ff) << 10) | (code2 & 0x3ff));
      utf8Bytes.push(0xf0 | (full >> 18));
      utf8Bytes.push(0x80 | ((full >> 12) & 0x3f));
      utf8Bytes.push(0x80 | ((full >> 6) & 0x3f));
      utf8Bytes.push(0x80 | (full & 0x3f));
    }
  }
  let out = '';
  let i = 0;
  const len = utf8Bytes.length;
  while (i < len) {
    const c1 = utf8Bytes[i++];
    if (i === len) {
      out += CHARS.charAt(c1 >> 2);
      out += CHARS.charAt((c1 & 0x3) << 4);
      out += '==';
      break;
    }
    const c2 = utf8Bytes[i++];
    if (i === len) {
      out += CHARS.charAt(c1 >> 2);
      out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
      out += CHARS.charAt((c2 & 0xf) << 2);
      out += '=';
      break;
    }
    const c3 = utf8Bytes[i++];
    out += CHARS.charAt(c1 >> 2);
    out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
    out += CHARS.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
    out += CHARS.charAt(c3 & 0x3f);
  }
  return out;
};

const base64Decode = (str) => {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = {};
  for (let i = 0; i < CHARS.length; i++) {
    lookup[CHARS.charAt(i)] = i;
  }
  const bytes = [];
  for (let i = 0; i < str.length; i += 4) {
    const c1 = lookup[str.charAt(i)] || 0;
    const c2 = lookup[str.charAt(i + 1)] || 0;
    const c3 = str.charAt(i + 2) !== '=' ? (lookup[str.charAt(i + 2)] || 0) : 0;
    const c4 = str.charAt(i + 3) !== '=' ? (lookup[str.charAt(i + 3)] || 0) : 0;
    bytes.push((c1 << 2) | (c2 >> 4));
    if (str.charAt(i + 2) !== '=') {
      bytes.push(((c2 & 0xf) << 4) | (c3 >> 2));
    }
    if (str.charAt(i + 3) !== '=') {
      bytes.push(((c3 & 0x3) << 6) | c4);
    }
  }
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const b1 = bytes[i++];
    if (b1 < 0x80) {
      out += String.fromCharCode(b1);
    } else if (b1 < 0xe0) {
      const b2 = bytes[i++];
      out += String.fromCharCode(((b1 & 0x1f) << 6) | (b2 & 0x3f));
    } else if (b1 < 0xf0) {
      const b2 = bytes[i++];
      const b3 = bytes[i++];
      out += String.fromCharCode(((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f));
    } else {
      const b2 = bytes[i++];
      const b3 = bytes[i++];
      const b4 = bytes[i++];
      const full = ((b1 & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f);
      const offset = full - 0x10000;
      out += String.fromCharCode(0xd800 + (offset >> 10), 0xdc00 + (offset & 0x3ff));
    }
  }
  return out;
};

const generateToken = (userId) => {
  const header = base64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Encode(JSON.stringify({
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  }));
  const signature = base64Encode(header + '.' + payload + '.secret');
  return header + '.' + payload + '.' + signature;
};

const COLLECTION_TYPES = {
  figure: { id: 'figure', name: '寻找人物', icon: '👤', description: '寻找会某项技艺的传承人或文化见证者' },
  memory: { id: 'memory', name: '记忆征集', icon: '📸', description: '收集特定年代、特定地点的文化记忆' },
  object: { id: 'object', name: '实物征集', icon: '🏺', description: '收集老物件、老照片、老书籍等实物' },
  story: { id: 'story', name: '故事征集', icon: '📖', description: '征集口述故事、民间传说、家族历史' },
  custom: { id: 'custom', name: '其他征集', icon: '📝', description: '其他类型的文化征集活动' }
};

const COLLECTION_STATUS = {
  recruiting: { id: 'recruiting', name: '征集中', color: '#52C41A', icon: '📥' },
  achieving: { id: 'achieving', name: '即将达成', color: '#FA8C16', icon: '🎯' },
  achieved: { id: 'achieved', name: '已达成', color: '#1890FF', icon: '✅' },
  ended: { id: 'ended', name: '已结束', color: '#999999', icon: '⏹️' }
};

const getCollectionTypes = () => Object.values(COLLECTION_TYPES);
const getCollectionTypeName = (typeId) => COLLECTION_TYPES[typeId] ? COLLECTION_TYPES[typeId].name : '未知类型';
const getCollectionTypeIcon = (typeId) => COLLECTION_TYPES[typeId] ? COLLECTION_TYPES[typeId].icon : '📋';
const getCollectionTypeDescription = (typeId) => COLLECTION_TYPES[typeId] ? COLLECTION_TYPES[typeId].description : '';

const getCollectionStatus = (collection) => {
  const now = new Date().getTime();
  const endTime = new Date(collection.endTime).getTime();
  const targetCount = collection.targetCount || 0;
  const responseCount = collection.responseCount || 0;
  const completionThreshold = collection.completionThreshold || 80;
  const progress = targetCount > 0 ? (responseCount / targetCount) * 100 : 0;

  if (now > endTime || collection.status === 'ended') {
    return COLLECTION_STATUS.ended;
  }
  if (progress >= 100) {
    return COLLECTION_STATUS.achieved;
  }
  if (progress >= completionThreshold) {
    return COLLECTION_STATUS.achieving;
  }
  return COLLECTION_STATUS.recruiting;
};

const getCollectionProgress = (collection) => {
  const targetCount = collection.targetCount || 0;
  const responseCount = collection.responseCount || 0;
  const progress = targetCount > 0 ? Math.min((responseCount / targetCount) * 100, 100) : 0;
  return {
    targetCount,
    responseCount,
    remainingCount: Math.max(targetCount - responseCount, 0),
    progress,
    progressText: progress.toFixed(0) + '%'
  };
};

const getCollectionRemainingDays = (collection) => {
  if (!collection || !collection.endTime) return 0;
  const now = new Date().getTime();
  const endTime = new Date(collection.endTime).getTime();
  if (isNaN(endTime)) return 0;
  const diff = endTime - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
};

const getCollectionStatusInfo = (statusId) => {
  return COLLECTION_STATUS[statusId] || { id: 'unknown', name: '未知', color: '#999', icon: '❓' };
};

const isCollectionUrgent = (collection) => {
  if (!collection) return false;
  const remainingDays = getCollectionRemainingDays(collection);
  const progress = getCollectionProgress(collection).progress;
  return remainingDays > 0 && remainingDays <= 3 && progress < 80;
};

module.exports = {
  formatDate,
  formatRelativeTime,
  generateId,
  debounce,
  throttle,
  truncateText,
  validateForm,
  getCategoryName,
  ACTIVITY_TYPES,
  getActivityTypes,
  getActivityTypeName,
  getActivityTypeIcon,
  getActivityStatus,
  canCancelRegistration,
  formatActivityTime,
  SENSITIVE_WORDS,
  checkSensitiveWords,
  SUGGESTED_TAGS,
  base64Encode,
  base64Decode,
  generateToken,
  COLLECTION_TYPES,
  COLLECTION_STATUS,
  getCollectionTypes,
  getCollectionTypeName,
  getCollectionTypeIcon,
  getCollectionTypeDescription,
  getCollectionStatus,
  getCollectionProgress,
  getCollectionRemainingDays,
  getCollectionStatusInfo,
  isCollectionUrgent,

  FUND_STATUS: {
    ongoing: { id: 'ongoing', name: '进行中', color: '#52c41a', icon: '🟢' },
    achieved: { id: 'achieved', name: '已达成', color: '#1890ff', icon: '🎯' },
    ended: { id: 'ended', name: '已结束', color: '#999999', icon: '⏹️' }
  },

  getFundStatusName: (statusId) => {
    const statusMap = {
      ongoing: '进行中',
      achieved: '已达成',
      ended: '已结束'
    };
    return statusMap[statusId] || '未知';
  },

  getFundStatusInfo: (statusId) => {
    const statusMap = {
      ongoing: { id: 'ongoing', name: '进行中', color: '#52c41a', icon: '🟢' },
      achieved: { id: 'achieved', name: '已达成', color: '#1890ff', icon: '🎯' },
      ended: { id: 'ended', name: '已结束', color: '#999999', icon: '⏹️' }
    };
    return statusMap[statusId] || { id: 'unknown', name: '未知', color: '#999', icon: '❓' };
  },

  getFundTimelineTypeInfo: (type) => {
    const typeMap = {
      milestone: { name: '里程碑', color: '#1890ff', icon: '🎯' },
      funding: { name: '资金拨付', color: '#52c41a', icon: '💰' },
      event: { name: '活动', color: '#fa8c16', icon: '📅' },
      report: { name: '公示', color: '#722ed1', icon: '📋' },
      other: { name: '其他', color: '#999', icon: '📌' }
    };
    return typeMap[type] || typeMap.other;
  },

  formatAmount: (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0 元';
    }
    const num = Number(amount);
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + ' 万';
    }
    return num.toLocaleString() + ' 元';
  },

  DONATION_METHODS: [
    { id: 'offline_bank', name: '银行转账', icon: '🏦' },
    { id: 'offline_wechat', name: '微信转账', icon: '💚' },
    { id: 'offline_alipay', name: '支付宝', icon: '💙' },
    { id: 'offline_cash', name: '现金捐赠', icon: '💵' },
    { id: 'offline_other', name: '其他方式', icon: '📦' }
  ],

  getDonationMethodName: (methodId) => {
    const methodMap = {
      offline_bank: '银行转账',
      offline_wechat: '微信转账',
      offline_alipay: '支付宝',
      offline_cash: '现金捐赠',
      offline_other: '其他方式'
    };
    return methodMap[methodId] || '线下捐赠';
  },

  getDonationMethods: () => {
    return [
      { id: 'offline_bank', name: '银行转账', icon: '🏦' },
      { id: 'offline_wechat', name: '微信转账', icon: '💚' },
      { id: 'offline_alipay', name: '支付宝', icon: '💙' },
      { id: 'offline_cash', name: '现金捐赠', icon: '💵' },
      { id: 'offline_other', name: '其他方式', icon: '📦' }
    ];
  }
};
