// utils/interview-data.js
// 口述史/银龄访谈数据和工具函数

const util = require('./util');
const figureData = require('./figure-data');

const AGE_GROUPS = [
  { id: 'all', name: '全部年龄', min: 0, max: 150 },
  { id: '60-69', name: '60-69岁', min: 60, max: 69 },
  { id: '70-79', name: '70-79岁', min: 70, max: 79 },
  { id: '80-89', name: '80-89岁', min: 80, max: 89 },
  { id: '90+', name: '90岁以上', min: 90, max: 150 }
];

const CRAFT_TYPES = [
  { id: 'all', name: '全部技艺' },
  { id: 'farming', name: '传统农耕' },
  { id: 'weaving', name: '纺织技艺' },
  { id: 'embroidery', name: '刺绣技艺' },
  { id: 'pottery', name: '陶瓷制作' },
  { id: 'woodcarving', name: '木雕工艺' },
  { id: 'papercut', name: '剪纸艺术' },
  { id: 'herbal', name: '中草药知识' },
  { id: 'cooking', name: '传统烹饪' },
  { id: 'storytelling', name: '民间故事' },
  { id: 'calligraphy', name: '书法艺术' },
  { id: 'other', name: '其他' }
];

const REGIONS = [
  { id: 'all', name: '全部地区' },
  { id: 'north', name: '华北地区' },
  { id: 'east', name: '华东地区' },
  { id: 'south', name: '华南地区' },
  { id: 'central', name: '华中地区' },
  { id: 'southwest', name: '西南地区' },
  { id: 'northwest', name: '西北地区' },
  { id: 'northeast', name: '东北地区' }
];

const COLLECTION_TYPES = [
  { id: 'craftsman', name: '村里的老匠人', icon: '🔨' },
  { id: 'solar_terms', name: '节气里的老人', icon: '🌾' },
  { id: 'village_history', name: '村庄记忆', icon: '🏘️' },
  { id: 'red_story', name: '红色记忆', icon: '🇨🇳' },
  { id: 'food_culture', name: '舌尖上的记忆', icon: '🍜' },
  { id: 'traditional_medicine', name: '杏林春暖', icon: '💊' }
];

const DEFAULT_INTERVIEWS = [
  {
    id: 'interview_001',
    type: 'interview',
    intervieweeName: '张大爷',
    gender: '男',
    age: 86,
    birthYear: 1938,
    occupation: '农民',
    region: 'north',
    address: '河北省衡水市某村',
    interviewLocation: '平遥古城',
    interviewDate: '2024-03-15',
    interviewer: '文化志愿者小张',
    crafts: ['farming', 'herbal'],
    summary: '张大爷种了一辈子地，对二十四节气和传统农耕技艺了如指掌。他常说："土地是有灵性的，你对它好，它就对你好。"',
    content: '采访者：张大爷，您能给我们讲讲过去种地的事吗？\n\n张大爷：哎呀，这说来可就话长了。我从十几岁就跟着我爹在地里摸爬滚打，那时候哪有什么机械化啊，全靠人力和畜力。\n\n采访者：那时候种地都讲究什么呢？\n\n张大爷：最讲究的就是节气！老祖宗说的"清明前后，种瓜点豆"，那是千真万确的。惊蛰一过，地气上升，就该翻地了。春分播种，谷雨插秧，每个节气都有每个节气的活计。',
    tags: ['农耕文化', '二十四节气', '传统智慧'],
    collectionIds: ['collection_solar_terms'],
    relatedFigureId: 'figure_001',
    viewCount: 568,
    likeCount: 127,
    status: 1,
    authorId: 'user_001',
    authorName: '文化志愿者小张',
    createTime: '2024-03-16'
  },
  {
    id: 'interview_002',
    type: 'interview',
    intervieweeName: '李阿姨',
    gender: '女',
    age: 89,
    birthYear: 1935,
    occupation: '苏绣传承人',
    region: 'east',
    address: '江苏省苏州市某镇',
    interviewLocation: '周庄古镇',
    interviewDate: '2024-02-20',
    interviewer: '非遗保护中心小李',
    crafts: ['weaving', 'embroidery'],
    summary: '李阿姨从艺七十余年，作品曾被选为国礼。她八岁学刺绣，十二岁就能独立完成绣品，培养了三十多名徒弟。',
    content: '采访者：李阿姨，您是怎么开始学刺绣的？\n\n李阿姨：我娘就是做刺绣的，我从小就在她旁边看。八岁那年，娘说"女孩子家，学个手艺防身"，就正式教我了。\n\n采访者：学刺绣难吗？\n\n李阿姨：难啊！光练基本功就练了三年。坐不住不行，心不静不行，眼神不好也不行。那时候我娘对我可严了，一根线绣错了，整幅都得拆了重绣。',
    tags: ['苏绣', '非遗', '工艺美术'],
    collectionIds: ['collection_craftsman'],
    relatedFigureId: 'figure_002',
    viewCount: 892,
    likeCount: 256,
    status: 1,
    authorId: 'user_002',
    authorName: '非遗保护中心小李',
    createTime: '2024-02-22'
  },
  {
    id: 'interview_003',
    type: 'interview',
    intervieweeName: '王爷爷',
    gender: '男',
    age: 79,
    birthYear: 1945,
    occupation: '退休教师',
    region: 'central',
    address: '湖南省长沙市某村',
    interviewLocation: '凤凰古城',
    interviewDate: '2024-04-05',
    interviewer: '大学生志愿者小王',
    crafts: ['storytelling', 'calligraphy'],
    summary: '王爷爷是村里第一个大学生，执教四十余年，退休后仍在村里免费教孩子们读书写字。',
    content: '采访者：王爷爷，您当年为什么选择回到村里当老师？\n\n王爷爷：我是村里第一个考上大学的，那时候全村人都来送我。我爹说"娃啊，你是村里的骄傲，学成了别忘了回来帮衬乡亲们"。这句话我记了一辈子。',
    tags: ['乡村教育', '留守儿童', '师者仁心'],
    collectionIds: ['collection_village_history'],
    relatedFigureId: 'figure_003',
    viewCount: 423,
    likeCount: 98,
    status: 1,
    authorId: 'user_003',
    authorName: '大学生志愿者小王',
    createTime: '2024-04-06'
  },
  {
    id: 'interview_004',
    type: 'interview',
    intervieweeName: '陈奶奶',
    gender: '女',
    age: 72,
    birthYear: 1952,
    occupation: '木雕大师',
    region: 'southwest',
    address: '四川省成都市某镇',
    interviewLocation: '乌镇',
    interviewDate: '2024-03-28',
    interviewer: '文化局老刘',
    crafts: ['woodcarving', 'pottery'],
    summary: '陈奶奶出生在木匠世家，祖上三代都是木匠。她的木雕作品既有传统工艺的精髓，又融入了现代设计理念。',
    content: '采访者：陈奶奶，您家三代都是木匠，这门手艺是怎么传下来的？\n\n陈奶奶：我爷爷那辈就是木匠，我爹也是。我从小就在我爹的木工房里长大，耳濡目染，自然而然就喜欢上了。',
    tags: ['木雕', '非遗传承', '工艺美术'],
    collectionIds: ['collection_craftsman'],
    relatedFigureId: 'figure_004',
    viewCount: 634,
    likeCount: 156,
    status: 1,
    authorId: 'user_004',
    authorName: '文化局老刘',
    createTime: '2024-03-29'
  },
  {
    id: 'interview_005',
    type: 'interview',
    intervieweeName: '刘大伯',
    gender: '男',
    age: 82,
    birthYear: 1942,
    occupation: '乡村医生',
    region: 'south',
    address: '广东省广州市某村',
    interviewLocation: '婺源',
    interviewDate: '2024-05-10',
    interviewer: '卫生院小周',
    crafts: ['herbal', 'cooking'],
    summary: '刘大伯行医六十余载，免费为贫困村民看病，被村民们亲切地称为"当代华佗"。',
    content: '采访者：刘大伯，您当年为什么选择回村里当医生？\n\n刘大伯：我年轻时在县医院工作，每次回村里，看到乡亲们看病难，心里就不是滋味。那时候村里没有医生，看个病要走几十里山路。我就想，我是村里长大的，应该回来为乡亲们做点事。',
    tags: ['乡村医疗', '中医', '医者仁心'],
    collectionIds: ['collection_traditional_medicine'],
    relatedFigureId: 'figure_005',
    viewCount: 512,
    likeCount: 189,
    status: 1,
    authorId: 'user_005',
    authorName: '卫生院小周',
    createTime: '2024-05-11'
  },
  {
    id: 'interview_006',
    type: 'interview',
    intervieweeName: '赵大叔',
    gender: '男',
    age: 69,
    birthYear: 1955,
    occupation: '剪纸艺术家',
    region: 'northwest',
    address: '陕西省延安市某村',
    interviewLocation: '宏村',
    interviewDate: '2024-04-18',
    interviewer: '文化馆小陈',
    crafts: ['papercut', 'cooking'],
    summary: '赵大叔的剪纸作品把黄土高原的风土人情表现得淋漓尽致，曾多次代表中国民间艺术家出国访问。',
    content: '采访者：赵大叔，您是怎么开始学剪纸的？\n\n赵大叔：我奶奶剪得一手好窗花，我从小就跟着她学。那时候过年，家家户户都要贴窗花，我剪的窗花最受大家欢迎。',
    tags: ['剪纸', '黄土风情', '民间艺术'],
    collectionIds: ['collection_craftsman'],
    relatedFigureId: 'figure_006',
    viewCount: 445,
    likeCount: 134,
    status: 1,
    authorId: 'user_006',
    authorName: '文化馆小陈',
    createTime: '2024-04-19'
  },
  {
    id: 'interview_007',
    type: 'interview',
    intervieweeName: '孙大娘',
    gender: '女',
    age: 92,
    birthYear: 1932,
    occupation: '评书艺人',
    region: 'northeast',
    address: '辽宁省沈阳市某社区',
    interviewLocation: '西递',
    interviewDate: '2024-05-25',
    interviewer: '曲艺协会小吴',
    crafts: ['storytelling', 'calligraphy'],
    summary: '孙大娘从艺八十余年，能说一百多部传统评书，被誉为评书艺术的"活化石"。',
    content: '采访者：孙大娘，您是怎么开始学说书的？\n\n孙大娘：我爹就是说书的，我六岁开始学艺，九岁就能登台。那时候说书是个体力活，走南闯北，风餐露宿，但我就是喜欢。',
    tags: ['评书', '曲艺', '非物质文化遗产'],
    collectionIds: ['collection_village_history'],
    relatedFigureId: 'figure_007',
    viewCount: 378,
    likeCount: 112,
    status: 1,
    authorId: 'user_007',
    authorName: '曲艺协会小吴',
    createTime: '2024-05-26'
  },
  {
    id: 'interview_008',
    type: 'interview',
    intervieweeName: '孙大娘',
    gender: '女',
    age: 76,
    birthYear: 1948,
    occupation: '紫砂壶制作大师',
    region: 'east',
    address: '江苏省宜兴市某村',
    interviewLocation: '丽江',
    interviewDate: '2024-06-08',
    interviewer: '工艺美术协会小郑',
    crafts: ['pottery', 'cooking'],
    summary: '孙大娘师从紫砂大师顾景舟，她制作的紫砂壶造型典雅，做工精细，既有实用性又有收藏价值。',
    content: '采访者：孙大娘，您是怎么进入紫砂行业的？\n\n孙大娘：我家就在宜兴，从小就在紫砂作坊里长大。十八岁那年，我正式拜顾景舟大师为师，开始学习紫砂壶制作。',
    tags: ['紫砂壶', '宜兴紫砂', '工艺美术'],
    collectionIds: ['collection_craftsman'],
    relatedFigureId: 'figure_008',
    viewCount: 567,
    likeCount: 145,
    status: 1,
    authorId: 'user_008',
    authorName: '工艺美术协会小郑',
    createTime: '2024-06-09'
  },
  {
    id: 'interview_009',
    type: 'interview',
    intervieweeName: '张大爷',
    gender: '男',
    age: 78,
    birthYear: 1946,
    occupation: '老农民',
    region: 'central',
    address: '河南省周口市某村',
    interviewLocation: '阳朔',
    interviewDate: '2023-12-22',
    interviewer: '节气文化志愿者小韩',
    crafts: ['farming', 'cooking'],
    summary: '张大爷对二十四节气有着深刻的理解，每个节气该干什么农活，该吃什么传统食物，他都能说得头头是道。',
    content: '采访者：张大爷，今天是冬至，你们这里有什么习俗？\n\n张大爷：冬至大如年啊！今天家家户户都要吃饺子。俗话说"冬至不端饺子碗，冻掉耳朵没人管"。',
    tags: ['冬至', '二十四节气', '北方习俗'],
    collectionIds: ['collection_solar_terms'],
    relatedFigureId: '',
    viewCount: 298,
    likeCount: 87,
    status: 1,
    authorId: 'user_009',
    authorName: '节气文化志愿者小韩',
    createTime: '2023-12-23'
  },
  {
    id: 'interview_010',
    type: 'interview',
    intervieweeName: '李阿姨',
    gender: '女',
    age: 71,
    birthYear: 1953,
    occupation: '农家乐经营者',
    region: 'east',
    address: '浙江省杭州市某村',
    interviewLocation: '宏村',
    interviewDate: '2023-08-08',
    interviewer: '美食文化记者小冯',
    crafts: ['cooking', 'herbal'],
    summary: '李阿姨的农家乐以"节气菜"闻名，她做的"立秋咬秋宴"吸引了众多食客慕名而来。',
    content: '采访者：李阿姨，今天是立秋，您准备了什么特别的菜？\n\n李阿姨：今天是立秋，我们这里讲究"贴秋膘"。我准备了红烧肉、酱肘子，还有我们南方人爱吃的"立秋咬秋"——吃西瓜。',
    tags: ['立秋', '节气美食', '农家乐'],
    collectionIds: ['collection_solar_terms', 'collection_food_culture'],
    relatedFigureId: '',
    viewCount: 412,
    likeCount: 136,
    status: 1,
    authorId: 'user_010',
    authorName: '美食文化记者小冯',
    createTime: '2023-08-09'
  }
];

const getAgeGroupInfo = (ageGroupId) => {
  return AGE_GROUPS.find(g => g.id === ageGroupId) || AGE_GROUPS[0];
};

const getCraftName = (craftId) => {
  const craft = CRAFT_TYPES.find(c => c.id === craftId);
  return craft ? craft.name : '未知';
};

const getCraftNames = (craftIds) => {
  if (!craftIds || !Array.isArray(craftIds)) return [];
  return craftIds.map(id => getCraftName(id)).filter(name => name !== '未知');
};

const getRegionName = (regionId) => {
  const region = REGIONS.find(r => r.id === regionId);
  return region ? region.name : '未知';
};

const getCollectionInfo = (collectionId) => {
  return COLLECTION_TYPES.find(c => c.id === collectionId) || null;
};

const getCollectionName = (collectionId) => {
  const collection = getCollectionInfo(collectionId);
  return collection ? collection.name : '未知';
};

const getCollectionNames = (collectionIds) => {
  if (!collectionIds || !Array.isArray(collectionIds)) return [];
  return collectionIds.map(id => getCollectionName(id)).filter(name => name !== '未知');
};

const filterInterviews = (interviews, filters = {}) => {
  let result = [...interviews];
  const { region, ageGroup, craft, keyword } = filters;

  if (region && region !== 'all') {
    result = result.filter(item => item.region === region);
  }

  if (ageGroup && ageGroup !== 'all') {
    const groupInfo = getAgeGroupInfo(ageGroup);
    result = result.filter(item => item.age >= groupInfo.min && item.age <= groupInfo.max);
  }

  if (craft && craft !== 'all') {
    result = result.filter(item => item.crafts && item.crafts.includes(craft));
  }

  if (keyword && keyword.trim()) {
    const kw = keyword.toLowerCase().trim();
    result = result.filter(item =>
      item.intervieweeName.toLowerCase().includes(kw) ||
      item.summary.toLowerCase().includes(kw) ||
      item.content.toLowerCase().includes(kw) ||
      item.occupation.toLowerCase().includes(kw) ||
      getCraftNames(item.crafts).some(name => name.toLowerCase().includes(kw))
    );
  }

  return result;
};

const initInterviewData = () => {
  const interviews = wx.getStorageSync('interviews');
  if (!interviews || interviews.length === 0) {
    wx.setStorageSync('interviews', DEFAULT_INTERVIEWS);
    console.log('[InterviewData] 初始化访谈数据完成');
  }

  const interviewDrafts = wx.getStorageSync('interviewDrafts');
  if (!interviewDrafts) {
    wx.setStorageSync('interviewDrafts', []);
    console.log('[InterviewData] 初始化访谈草稿数据完成');
  }

  const interviewCollections = wx.getStorageSync('interviewCollections');
  if (!interviewCollections || interviewCollections.length === 0) {
    const defaultCollections = [
      {
        id: 'collection_craftsman',
        type: 'interview_collection',
        title: '村里的老匠人',
        icon: '🔨',
        coverImage: 'https://picsum.photos/id/225/750/400',
        description: '他们用双手创造了无数精美的艺术品，用一生守护着传统技艺。让我们走近这些老匠人，聆听他们的故事。',
        interviewIds: ['interview_002', 'interview_004', 'interview_006', 'interview_008'],
        viewCount: 1256,
        status: 1,
        createTime: '2024-01-01'
      },
      {
        id: 'collection_solar_terms',
        type: 'interview_collection',
        title: '节气里的老人',
        icon: '🌾',
        coverImage: 'https://picsum.photos/id/292/750/400',
        description: '二十四节气是中国古代劳动人民智慧的结晶。让我们听听老人们讲述那些与节气有关的故事和习俗。',
        interviewIds: ['interview_001', 'interview_009', 'interview_010'],
        viewCount: 892,
        status: 1,
        createTime: '2024-01-15'
      },
      {
        id: 'collection_village_history',
        type: 'interview_collection',
        title: '村庄记忆',
        icon: '🏘️',
        coverImage: 'https://picsum.photos/id/1082/750/400',
        description: '每一个村庄都有自己的历史和故事。让我们通过老人们的口述，找回那些正在消逝的村庄记忆。',
        interviewIds: ['interview_003', 'interview_007'],
        viewCount: 678,
        status: 1,
        createTime: '2024-02-01'
      },
      {
        id: 'collection_traditional_medicine',
        type: 'interview_collection',
        title: '杏林春暖',
        icon: '💊',
        coverImage: 'https://picsum.photos/id/237/750/400',
        description: '他们是乡村的健康守护者，用中医的智慧为乡亲们解除病痛。让我们听听他们的故事。',
        interviewIds: ['interview_005'],
        viewCount: 543,
        status: 1,
        createTime: '2024-02-15'
      },
      {
        id: 'collection_food_culture',
        type: 'interview_collection',
        title: '舌尖上的记忆',
        icon: '🍜',
        coverImage: 'https://picsum.photos/id/431/750/400',
        description: '每一道传统美食背后都有一个故事。让我们跟着老人们的口述，品味舌尖上的文化记忆。',
        interviewIds: ['interview_010'],
        viewCount: 723,
        status: 1,
        createTime: '2024-03-01'
      }
    ];
    wx.setStorageSync('interviewCollections', defaultCollections);
    console.log('[InterviewData] 初始化访谈合集数据完成');
  }
};

module.exports = {
  AGE_GROUPS,
  CRAFT_TYPES,
  REGIONS,
  COLLECTION_TYPES,
  DEFAULT_INTERVIEWS,
  getAgeGroupInfo,
  getCraftName,
  getCraftNames,
  getRegionName,
  getCollectionInfo,
  getCollectionName,
  getCollectionNames,
  filterInterviews,
  initInterviewData
};
