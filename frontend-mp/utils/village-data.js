// utils/village-data.js
// 村庄数据模块 - 村庄信息、层级管理、跨村精选

const DEFAULT_VILLAGES = [
  {
    id: 'village_001',
    name: '桃花村',
    logo: '',
    banner: '',
    introduction: '桃花村位于青山脚下，因村前百亩桃林而得名。建村至今已有三百余年历史，民风淳朴，传统文化底蕴深厚。村内保留着完整的明清古建筑群，以及世代传承的桃雕、土布织造等非遗技艺。',
    level: 'village',
    parentId: 'county_001',
    adminId: '',
    adminName: '张村长',
    location: {
      province: '浙江省',
      city: '杭州市',
      county: '淳安县',
      address: '千岛湖镇桃花村'
    },
    latitude: 29.6098,
    longitude: 119.0233,
    cultureFeatures: ['桃雕技艺', '土布织造', '竹马灯'],
    population: 1280,
    createTime: '2024-01-01',
    status: 1,
    sort: 1
  },
  {
    id: 'village_002',
    name: '龙井村',
    logo: '',
    banner: '',
    introduction: '龙井村坐落于西子湖畔的群山之中，是著名的龙井茶原产地。全村以茶为生，茶文化源远流长。村内有千年古茶树群、传统茶作坊，以及代代相传的龙井炒制技艺。',
    level: 'village',
    parentId: 'county_001',
    adminId: '',
    adminName: '李支书',
    location: {
      province: '浙江省',
      city: '杭州市',
      county: '西湖区',
      address: '西湖街道龙井村'
    },
    latitude: 30.2345,
    longitude: 120.1321,
    cultureFeatures: ['龙井茶炒制', '茶俗文化', '山水生态'],
    population: 860,
    createTime: '2024-01-01',
    status: 1,
    sort: 2
  },
  {
    id: 'village_003',
    name: '古堰村',
    logo: '',
    banner: '',
    introduction: '古堰村因村旁千年古堰而得名，始建于唐代，是江南水利工程的活化石。村内古民居依山傍水，石板路蜿蜒曲折，保留着完整的江南水乡风貌。',
    level: 'village',
    parentId: 'county_002',
    adminId: '',
    adminName: '王主任',
    location: {
      province: '浙江省',
      city: '丽水市',
      county: '莲都区',
      address: '碧湖镇古堰村'
    },
    latitude: 28.4567,
    longitude: 119.7890,
    cultureFeatures: ['古堰文化', '水乡民俗', '农耕传统'],
    population: 1520,
    createTime: '2024-01-01',
    status: 1,
    sort: 3
  },
  {
    id: 'village_004',
    name: '竹海村',
    logo: '',
    banner: '',
    introduction: '竹海村位于浙西山区，全村被万亩竹林环抱，素有"竹海人家"的美誉。竹编工艺世代相传，竹文化深深融入村民的日常生活。',
    level: 'village',
    parentId: 'county_002',
    adminId: '',
    adminName: '陈村长',
    location: {
      province: '浙江省',
      city: '湖州市',
      county: '安吉县',
      address: '天荒坪镇竹海村'
    },
    latitude: 30.5432,
    longitude: 119.6789,
    cultureFeatures: ['竹编工艺', '竹文化', '生态旅游'],
    population: 980,
    createTime: '2024-01-01',
    status: 1,
    sort: 4
  },
  {
    id: 'county_001',
    name: '淳安县',
    logo: '',
    banner: '',
    introduction: '淳安县位于杭州市西南部，是浙江省面积最大的县。境内千岛湖风光秀丽，历史文化悠久，拥有丰富的非物质文化遗产和传统村落资源。',
    level: 'county',
    parentId: 'city_001',
    adminId: '',
    adminName: '淳安县文旅局',
    location: {
      province: '浙江省',
      city: '杭州市',
      county: '淳安县',
      address: '千岛湖镇新安大街'
    },
    latitude: 29.6098,
    longitude: 119.0233,
    cultureFeatures: ['睦剧', '竹马', '三雕'],
    population: 450000,
    createTime: '2024-01-01',
    status: 1,
    sort: 10,
    isFeaturedChannel: true,
    channelSlogan: '山水古韵·文化淳安'
  },
  {
    id: 'county_002',
    name: '安吉县',
    logo: '',
    banner: '',
    introduction: '安吉县位于湖州市南部，是"中国竹乡"和"白茶之乡"。境内竹林如海，生态环境优美，拥有丰富的竹文化和茶文化资源。',
    level: 'county',
    parentId: 'city_002',
    adminId: '',
    adminName: '安吉县文旅局',
    location: {
      province: '浙江省',
      city: '湖州市',
      county: '安吉县',
      address: '递铺镇灵芝西路'
    },
    latitude: 30.6234,
    longitude: 119.6876,
    cultureFeatures: ['竹文化', '白茶文化', '生态文化'],
    population: 480000,
    createTime: '2024-01-01',
    status: 1,
    sort: 11,
    isFeaturedChannel: true,
    channelSlogan: '竹海茶乡·大美安吉'
  },
  {
    id: 'city_001',
    name: '杭州市',
    logo: '',
    banner: '',
    introduction: '杭州市是浙江省省会，素有"人间天堂"的美誉。杭州历史悠久，文化底蕴深厚，拥有西湖、京杭大运河等世界文化遗产，以及众多非物质文化遗产项目。',
    level: 'city',
    parentId: 'province_001',
    adminId: '',
    adminName: '杭州市文旅局',
    location: {
      province: '浙江省',
      city: '杭州市',
      county: '',
      address: '上城区解放东路'
    },
    latitude: 30.2741,
    longitude: 120.1551,
    cultureFeatures: ['西湖文化', '越剧', '杭扇', '杭绣'],
    population: 12370000,
    createTime: '2024-01-01',
    status: 1,
    sort: 20,
    isFeaturedChannel: true,
    channelSlogan: '人间天堂·文化杭州'
  }
];

const LEVEL_NAMES = {
  village: { name: '村级', icon: '🏘️' },
  county: { name: '县级', icon: '🏛️' },
  city: { name: '市级', icon: '🏙️' },
  province: { name: '省级', icon: '🗺️' }
};

function initVillageData() {
  try {
    const villages = wx.getStorageSync('villages');
    if (!villages || villages.length === 0) {
      wx.setStorageSync('villages', JSON.parse(JSON.stringify(DEFAULT_VILLAGES)));
      console.log('[VillageData] 村庄数据已初始化，共 ' + DEFAULT_VILLAGES.length + ' 个村庄/频道');
    }
  } catch (error) {
    console.error('[VillageData] 初始化村庄数据失败:', error);
  }
}

function getVillageById(id) {
  const villages = wx.getStorageSync('villages') || [];
  return villages.find(v => v.id === id) || null;
}

function getVillageList(params = {}) {
  const { level = 'all', parentId = '', keyword = '', status = 1 } = params;
  let villages = wx.getStorageSync('villages') || [];

  if (status !== 'all') {
    villages = villages.filter(v => v.status === status);
  }

  if (level && level !== 'all') {
    villages = villages.filter(v => v.level === level);
  }

  if (parentId) {
    villages = villages.filter(v => v.parentId === parentId);
  }

  if (keyword && keyword.trim()) {
    const kw = keyword.toLowerCase().trim();
    villages = villages.filter(v =>
      v.name.toLowerCase().includes(kw) ||
      (v.introduction && v.introduction.toLowerCase().includes(kw))
    );
  }

  villages.sort((a, b) => a.sort - b.sort);

  return villages;
}

function getChildVillages(parentId) {
  return getVillageList({ parentId });
}

function getVillageTree(rootLevel = 'city') {
  const allVillages = getVillageList({ status: 1 });
  const buildTree = (parentId, level) => {
    const nodes = allVillages.filter(v => v.parentId === parentId && v.level === level);
    return nodes.map(node => {
      const children = buildTree(node.id, getChildLevel(node.level));
      return { ...node, children };
    });
  };

  const roots = allVillages.filter(v => v.level === rootLevel);
  return roots.map(root => {
    const children = buildTree(root.id, getChildLevel(root.level));
    return { ...root, children };
  });
}

function getChildLevel(level) {
  const levelOrder = ['province', 'city', 'county', 'village'];
  const idx = levelOrder.indexOf(level);
  return idx < levelOrder.length - 1 ? levelOrder[idx + 1] : null;
}

function getParentVillage(villageId) {
  const village = getVillageById(villageId);
  if (!village || !village.parentId) return null;
  return getVillageById(village.parentId);
}

function getVillagePath(villageId) {
  const path = [];
  let current = getVillageById(villageId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? getVillageById(current.parentId) : null;
  }
  return path;
}

function getAllChildVillageIds(parentId) {
  const villages = wx.getStorageSync('villages') || [];
  const result = [];
  
  function findChildren(pid) {
    const children = villages.filter(v => v.parentId === pid && v.status === 1);
    children.forEach(child => {
      result.push(child.id);
      findChildren(child.id);
    });
  }
  
  findChildren(parentId);
  return result;
}

function getVillageAndChildrenIds(villageId) {
  const village = getVillageById(villageId);
  if (!village) return [];
  if (village.level === 'village') return [villageId];
  return [villageId, ...getAllChildVillageIds(villageId)];
}

function getLevelInfo(level) {
  return LEVEL_NAMES[level] || { name: level, icon: '📍' };
}

function getFeaturedChannels() {
  const villages = wx.getStorageSync('villages') || [];
  return villages.filter(v => v.isFeaturedChannel && v.status === 1)
    .sort((a, b) => a.sort - b.sort);
}

function getVillageBreadcrumb(villageId) {
  return getVillagePath(villageId).map(v => ({
    id: v.id,
    name: v.name,
    level: v.level
  }));
}

module.exports = {
  DEFAULT_VILLAGES,
  LEVEL_NAMES,
  initVillageData,
  getVillageById,
  getVillageList,
  getChildVillages,
  getVillageTree,
  getParentVillage,
  getVillagePath,
  getAllChildVillageIds,
  getVillageAndChildrenIds,
  getLevelInfo,
  getFeaturedChannels,
  getVillageBreadcrumb
};
