const COLLECTION_STATUS = {
  ongoing: { id: 'ongoing', name: '征集中', color: '#52C41A', icon: '📢' },
  achieved: { id: 'achieved', name: '已达成', color: '#1890FF', icon: '🎯' },
  ended: { id: 'ended', name: '已结束', color: '#999999', icon: '⏹️' }
};

const getCollectionStatus = (collection) => {
  const now = new Date().getTime();
  const endTime = new Date(collection.endTime).getTime();
  const targetCount = collection.targetCount || 0;
  const respondedCount = collection.respondedCount || 0;

  if (now > endTime) {
    return COLLECTION_STATUS.ended;
  }
  if (targetCount > 0 && respondedCount >= targetCount) {
    return COLLECTION_STATUS.achieved;
  }
  return COLLECTION_STATUS.ongoing;
};

const getCollectionStatusName = (statusId) => {
  const status = COLLECTION_STATUS[statusId];
  return status ? status.name : '未知';
};

const getCollectionStatusInfo = (statusId) => {
  return COLLECTION_STATUS[statusId] || { id: 'unknown', name: '未知', color: '#999999', icon: '❓' };
};

const getRemainingDays = (endTime) => {
  if (!endTime) return 0;
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const diff = end - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
};

const getProgressPercent = (collection) => {
  const target = collection.targetCount || 0;
  const responded = collection.respondedCount || 0;
  if (target <= 0) return 0;
  return Math.min(Math.round((responded / target) * 100), 100);
};

const getCollectionTypeInfo = (typeId) => {
  const typeMap = {
    figure: { id: 'figure', name: '寻找人物', icon: '👤', category: 'memory', defaultTags: ['人物寻访'] },
    memory: { id: 'memory', name: '收集记忆', icon: '📸', category: 'memory', defaultTags: ['记忆收集'] },
    craft: { id: 'craft', name: '传统技艺', icon: '🎨', category: 'craft', defaultTags: ['传统技艺'] },
    folklore: { id: 'folklore', name: '民俗故事', icon: '🎭', category: 'folklore', defaultTags: ['民俗故事'] },
    farming: { id: 'farming', name: '农耕文化', icon: '🌾', category: 'farming', defaultTags: ['农耕文化'] },
    other: { id: 'other', name: '其他征集', icon: '📋', category: 'memory', defaultTags: ['文化征集'] }
  };
  return typeMap[typeId] || typeMap.other;
};

const getCollectionTypes = () => {
  return [
    { id: 'figure', name: '寻找人物', icon: '👤', description: '寻找会传统技艺的老人、非遗传承人等' },
    { id: 'memory', name: '收集记忆', icon: '📸', description: '收集老照片、老物件、口述历史等' },
    { id: 'craft', name: '传统技艺', icon: '🎨', description: '征集传统手工艺作品、技艺展示等' },
    { id: 'folklore', name: '民俗故事', icon: '🎭', description: '收集民间传说、节日习俗、方言俚语等' },
    { id: 'farming', name: '农耕文化', icon: '🌾', description: '征集农耕工具、节气知识、农事经验等' },
    { id: 'other', name: '其他征集', icon: '📋', description: '其他文化相关的征集活动' }
  ];
};

const formatCollectionDeadline = (endTime) => {
  if (!endTime) return '';
  const remaining = getRemainingDays(endTime);
  if (remaining <= 0) return '已截止';
  if (remaining === 1) return '仅剩1天';
  if (remaining <= 3) return `紧急！仅剩${remaining}天`;
  if (remaining <= 7) return `还剩${remaining}天`;
  return `截止${formatDateShort(endTime)}`;
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}月${day}日`;
};

const isUrgent = (collection) => {
  return getRemainingDays(collection.endTime) <= 3 && getCollectionStatus(collection).id === 'ongoing';
};

const isAchieved = (collection) => {
  return getCollectionStatus(collection).id === 'achieved';
};

const DEFAULT_COLLECTIONS = [
  {
    id: 'collection_001',
    title: '寻找会编竹筐的老人',
    description: '我们正在寻找会传统竹编技艺的老人，希望能够记录和传承这项即将消失的手艺。\n\n如果您身边有这样的老人，或者您本人就是竹编手艺人，欢迎与我们联系。',
    type: 'figure',
    category: 'craft',
    tags: ['竹编', '传统技艺', '寻找手艺人'],
    targetCount: 10,
    respondedCount: 3,
    endTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    cover: '',
    articleIds: [],
    resultTopicId: '',
    authorId: 'user_001',
    authorName: '文化志愿者小张',
    viewCount: 256,
    likeCount: 45,
    createTime: '2024-12-10',
    status: 1
  },
  {
    id: 'collection_002',
    title: '收集80年代村口广播记忆',
    description: '还记得小时候村口大喇叭里播放的声音吗？\n\n我们正在收集80年代村口广播的相关记忆，包括：\n• 广播里播放过的歌曲、戏曲\n• 播报过的重要通知\n• 与广播有关的故事\n\n让我们一起重温那个年代的声音记忆。',
    type: 'memory',
    category: 'memory',
    tags: ['广播', '80年代', '怀旧', '口述历史'],
    targetCount: 20,
    respondedCount: 8,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    cover: '',
    articleIds: [],
    resultTopicId: '',
    authorId: 'user_001',
    authorName: '乡村文化保护中心',
    viewCount: 589,
    likeCount: 128,
    createTime: '2024-12-05',
    status: 1
  },
  {
    id: 'collection_003',
    title: '征集老农具照片和故事',
    description: '犁、耙、锄、镰...这些老农具承载着几代人的农耕记忆。\n\n如果您家里还保存着老农具，或者有与农具有关的故事，欢迎分享给我们。让更多人了解传统农耕文化。',
    type: 'farming',
    category: 'farming',
    tags: ['农具', '农耕', '老物件', '照片征集'],
    targetCount: 30,
    respondedCount: 35,
    endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    cover: '',
    articleIds: [],
    resultTopicId: 'topic_002',
    authorId: 'user_002',
    authorName: '农业文化研究小组',
    viewCount: 1024,
    likeCount: 256,
    createTime: '2024-11-20',
    status: 1
  }
];

module.exports = {
  COLLECTION_STATUS,
  getCollectionStatus,
  getCollectionStatusName,
  getCollectionStatusInfo,
  getRemainingDays,
  getProgressPercent,
  getCollectionTypeInfo,
  getCollectionTypes,
  formatCollectionDeadline,
  isUrgent,
  isAchieved,
  DEFAULT_COLLECTIONS
};
