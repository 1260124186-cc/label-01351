// utils/figure-data.js
// 人物志数据和工具函数

const util = require('./util');

const IDENTITY_TYPES = {
  farmer: { id: 'farmer', name: '老农', icon: '🌾', color: '#8B4513' },
  craftsman: { id: 'craftsman', name: '匠人', icon: '🔨', color: '#DAA520' },
  teacher: { id: 'teacher', name: '教师', icon: '📚', color: '#4682B4' },
  artist: { id: 'artist', name: '民间艺人', icon: '🎭', color: '#CD5C5C' },
  doctor: { id: 'doctor', name: '乡村医生', icon: '💊', color: '#228B22' }
};

const ERA_TYPES = [
  { id: '1930s', name: '1930年代', start: 1930, end: 1939 },
  { id: '1940s', name: '1940年代', start: 1940, end: 1949 },
  { id: '1950s', name: '1950年代', start: 1950, end: 1959 },
  { id: '1960s', name: '1960年代', start: 1960, end: 1969 },
  { id: '1970s', name: '1970年代', start: 1970, end: 1979 },
  { id: '1980s', name: '1980年代', start: 1980, end: 1989 }
];

const REGIONS = [
  { id: 'north', name: '华北地区' },
  { id: 'east', name: '华东地区' },
  { id: 'south', name: '华南地区' },
  { id: 'central', name: '华中地区' },
  { id: 'southwest', name: '西南地区' },
  { id: 'northwest', name: '西北地区' },
  { id: 'northeast', name: '东北地区' }
];

const CRAFTS = [
  { id: 'weaving', name: '纺织技艺' },
  { id: 'pottery', name: '陶瓷制作' },
  { id: 'woodcarving', name: '木雕工艺' },
  { id: 'papercut', name: '剪纸艺术' },
  { id: 'embroidery', name: '刺绣技艺' },
  { id: 'farming', name: '传统农耕' },
  { id: 'herbal', name: '中草药知识' },
  { id: 'cooking', name: '传统烹饪' },
  { id: 'storytelling', name: '民间故事' },
  { id: 'calligraphy', name: '书法艺术' }
];

const DEFAULT_FIGURES = [
  {
    id: 'figure_001',
    name: '王德福',
    avatar: 'https://picsum.photos/id/64/200/200',
    birthYear: 1938,
    deathYear: null,
    identity: 'farmer',
    region: 'north',
    era: '1930s',
    crafts: ['farming', 'herbal'],
    briefIntroduction: '土生土长的老农民，种了一辈子地，对二十四节气和传统农耕技艺了如指掌。',
    detailedIntroduction: '王德福老人出生在一个普通农民家庭，从小跟着父亲在地里摸爬滚打。他常说："土地是有灵性的，你对它好，它就对你好。" 七十多年的农耕生涯让他总结出了许多宝贵的经验，比如"清明前后，种瓜点豆"、"头伏萝卜二伏菜"等等。除了种地，他还懂得不少中草药知识，村里谁家有人感冒上火了，都来找他讨个方子。',
    timeline: [
      { year: 1938, event: '出生于河北省一个普通农民家庭' },
      { year: 1950, event: '开始跟着父亲学习种地，认识各种农作物' },
      { year: 1965, event: '成为生产队队长，带领乡亲们科学种田' },
      { year: 1978, event: '包产到户后，精心耕作自家责任田，年年丰收' },
      { year: 1995, event: '开始向年轻人传授传统农耕技艺' },
      { year: 2018, event: '被评为"乡村农耕文化传承人"' }
    ],
    works: [
      { id: 'work_001', title: '我的种地经', type: 'story', content: '根据多年经验总结的耕作要点，包含选种、播种、施肥、收割等各个环节的诀窍。' },
      { id: 'work_002', title: '二十四节气农谚歌', type: 'article', content: '将二十四节气与农业生产相结合编成的歌谣，朗朗上口，便于记忆。' }
    ],
    relatedArticles: ['article_005'],
    viewCount: 568,
    likeCount: 127,
    createTime: '2024-12-01',
    status: 1
  },
  {
    id: 'figure_002',
    name: '李陈氏',
    avatar: 'https://picsum.photos/id/91/200/200',
    birthYear: 1935,
    deathYear: 2022,
    identity: 'craftsman',
    region: 'east',
    era: '1930s',
    crafts: ['weaving', 'embroidery'],
    briefIntroduction: '苏绣传承人，从艺七十余年，作品曾被选为国礼。',
    detailedIntroduction: '李陈氏闺名陈秀兰，嫁到李家后大家都叫她李陈氏。她八岁开始跟着母亲学习刺绣，十二岁就能独立完成绣品。她的刺绣作品针法细腻，色彩和谐，尤以花鸟和山水见长。她常说："刺绣要心静，心不静，针就乱了。" 她把一生都献给了刺绣艺术，培养了三十多名徒弟。',
    timeline: [
      { year: 1935, event: '出生于苏州一个刺绣世家' },
      { year: 1943, event: '开始跟随母亲学习苏绣基本功' },
      { year: 1955, event: '进入苏州刺绣合作社工作' },
      { year: 1972, event: '作品《春燕图》被选为国礼赠送外宾' },
      { year: 1985, event: '创办刺绣工作室，开始招收徒弟' },
      { year: 2005, event: '被评为"国家级非物质文化遗产传承人"' },
      { year: 2022, event: '安详离世，享年87岁' }
    ],
    works: [
      { id: 'work_003', title: '春燕图', type: 'work', content: '代表作品，两只春燕在桃花间飞舞，栩栩如生。' },
      { id: 'work_004', title: '苏绣针法入门', type: 'article', content: '详细介绍苏绣的基本针法和技巧，适合初学者学习。' }
    ],
    relatedArticles: ['article_002'],
    viewCount: 892,
    likeCount: 256,
    createTime: '2024-12-05',
    status: 1
  },
  {
    id: 'figure_003',
    name: '张树人',
    avatar: 'https://picsum.photos/id/177/200/200',
    birthYear: 1945,
    deathYear: null,
    identity: 'teacher',
    region: 'central',
    era: '1940s',
    crafts: ['storytelling', 'calligraphy'],
    briefIntroduction: '乡村教师，执教四十余年，退休后仍在村里免费教孩子们读书写字。',
    detailedIntroduction: '张树人老师是村里的第一个大学生，1968年毕业后毅然回到家乡当起了民办教师。四十多年来，他教过的学生超过两千人，其中不少人考上了大学，走出了大山。退休后，他把自家的堂屋改成了"留守儿童之家"，免费给孩子们辅导功课，还给他们讲历史故事。',
    timeline: [
      { year: 1945, event: '出生于湖南省一个偏远山村' },
      { year: 1964, event: '考上湖南师范大学，成为村里第一个大学生' },
      { year: 1968, event: '大学毕业后回到家乡当民办教师' },
      { year: 1985, event: '被评为"全国优秀教师"' },
      { year: 2005, event: '正式退休，创办"留守儿童之家"' },
      { year: 2020, event: '获得"最美乡村教师"荣誉称号' }
    ],
    works: [
      { id: 'work_005', title: '村里的孩子们', type: 'story', content: '记录了四十多年教学生涯中令人难忘的故事。' },
      { id: 'work_006', title: '楷书入门教程', type: 'article', content: '专为乡村孩子编写的书法入门教材，通俗易懂。' }
    ],
    relatedArticles: [],
    viewCount: 423,
    likeCount: 98,
    createTime: '2024-12-08',
    status: 1
  },
  {
    id: 'figure_004',
    name: '赵天工',
    avatar: 'https://picsum.photos/id/338/200/200',
    birthYear: 1952,
    deathYear: null,
    identity: 'craftsman',
    region: 'southwest',
    era: '1950s',
    crafts: ['woodcarving', 'pottery'],
    briefIntroduction: '木雕大师，祖上三代都是木匠，他的木雕作品远销海外。',
    detailedIntroduction: '赵天工出生在一个木匠世家，祖父和父亲都是当地有名的木匠。他从小就在父亲的木工房里长大，耳濡目染，对木工产生了浓厚的兴趣。十六岁开始正式学艺，二十五岁就能独立设计和制作大型木雕作品。他的作品既有传统工艺的精髓，又融入了现代设计理念。',
    timeline: [
      { year: 1952, event: '出生于四川省一个木匠世家' },
      { year: 1968, event: '初中毕业后正式跟随父亲学习木工' },
      { year: 1977, event: '独立完成第一件大型木雕作品《龙凤呈祥》' },
      { year: 1992, event: '创办木雕工艺厂，带领乡亲们致富' },
      { year: 2008, event: '作品《山水情》获得中国工艺美术百花奖' },
      { year: 2019, event: '被评为"中国工艺美术大师"' }
    ],
    works: [
      { id: 'work_007', title: '龙凤呈祥', type: 'work', content: '大型木雕作品，采用传统浮雕技法，刻工精细。' },
      { id: 'work_008', title: '山水情', type: 'work', content: '融合传统与现代的木雕精品，展现祖国大好河山。' }
    ],
    relatedArticles: [],
    viewCount: 634,
    likeCount: 156,
    createTime: '2024-12-10',
    status: 1
  },
  {
    id: 'figure_005',
    name: '刘杏林',
    avatar: 'https://picsum.photos/id/1027/200/200',
    birthYear: 1942,
    deathYear: null,
    identity: 'doctor',
    region: 'south',
    era: '1940s',
    crafts: ['herbal', 'cooking'],
    briefIntroduction: '乡村医生，行医六十余载，免费为贫困村民看病，被称为"当代华佗"。',
    detailedIntroduction: '刘杏林医生年轻时曾在县医院工作，后来看到乡村医疗条件落后，很多村民看不起病，毅然回到村里当起了赤脚医生。他不但精通中医，还自学了西医知识。六十多年来，他走遍了方圆几十里的山山水水，为村民们送医送药。',
    timeline: [
      { year: 1942, event: '出生于广东省一个中医世家' },
      { year: 1962, event: '从县卫生学校毕业，进入县医院工作' },
      { year: 1968, event: '主动申请回到家乡当赤脚医生' },
      { year: 1985, event: '自费修建村卫生室，改善村民就医条件' },
      { year: 2003, event: '被评为"全国乡村医生先进个人"' },
      { year: 2022, event: '八十高龄仍坚持坐诊，服务乡亲' }
    ],
    works: [
      { id: 'work_009', title: '乡村常见疾病防治手册', type: 'article', content: '专为乡村编写的常见病防治指南，简单实用。' },
      { id: 'work_010', title: '岭南草药图谱', type: 'work', content: '图文并茂地介绍了岭南地区常见的中草药及其功效。' }
    ],
    relatedArticles: [],
    viewCount: 512,
    likeCount: 189,
    createTime: '2024-12-12',
    status: 1
  },
  {
    id: 'figure_006',
    name: '孙巧娘',
    avatar: 'https://picsum.photos/id/64/200/200',
    birthYear: 1955,
    deathYear: null,
    identity: 'artist',
    region: 'northwest',
    era: '1950s',
    crafts: ['papercut', 'cooking'],
    briefIntroduction: '剪纸艺术家，她的剪纸作品把黄土高原的风土人情表现得淋漓尽致。',
    detailedIntroduction: '孙巧娘是陕西省延安人，从小跟着奶奶学习剪纸。她的剪纸作品题材广泛，既有传统的窗花、喜字，也有反映农村生活的场景。她的作品线条流畅，造型生动，充满了浓郁的黄土高原气息。她曾多次代表中国民间艺术家出国访问演出。',
    timeline: [
      { year: 1955, event: '出生于陕西省延安市一个农民家庭' },
      { year: 1962, event: '开始跟随奶奶学习剪纸' },
      { year: 1978, event: '剪纸作品《丰收》获得陕西省民间艺术展一等奖' },
      { year: 1995, event: '应邀赴法国参加中国文化节，现场表演剪纸' },
      { year: 2010, event: '被评为"国家级非物质文化遗产（剪纸）传承人"' }
    ],
    works: [
      { id: 'work_011', title: '丰收', type: 'work', content: '表现农民丰收喜悦场景的剪纸作品。' },
      { id: 'work_012', title: '黄土高原风情系列', type: 'work', content: '共12幅，展现黄土高原的四季风光和民俗风情。' }
    ],
    relatedArticles: [],
    viewCount: 445,
    likeCount: 134,
    createTime: '2024-12-15',
    status: 1
  },
  {
    id: 'figure_007',
    name: '周德声',
    avatar: 'https://picsum.photos/id/91/200/200',
    birthYear: 1932,
    deathYear: null,
    identity: 'artist',
    region: 'northeast',
    era: '1930s',
    crafts: ['storytelling', 'calligraphy'],
    briefIntroduction: '评书艺人，从艺八十余年，能说一百多部传统评书，被誉为"活化石"。',
    detailedIntroduction: '周德声老先生出生在一个曲艺世家，祖父和父亲都是评书艺人。他六岁开始学艺，九岁就能登台表演。他的说书声音洪亮，表情丰富，擅长刻画人物。文革期间，评书被当作"四旧"禁止，他偷偷地把评书词记在心里。改革开放后，他重新登台，把传统评书又带给了听众。',
    timeline: [
      { year: 1932, event: '出生于辽宁省沈阳市一个曲艺世家' },
      { year: 1938, event: '开始跟随父亲学习评书' },
      { year: 1941, event: '首次登台表演《三国演义》片段，获得好评' },
      { year: 1956, event: '加入沈阳市曲艺团，成为专业评书演员' },
      { year: 1985, event: '开始在电台播讲评书，听众达数百万人' },
      { year: 2012, event: '被评为"国家级非物质文化遗产（评书）传承人"' }
    ],
    works: [
      { id: 'work_013', title: '评书表演艺术', type: 'article', content: '总结了一生评书表演的经验和技巧。' },
      { id: 'work_014', title: '传统评书汇编', type: 'work', content: '整理了50部传统评书的脚本，共计500余万字。' }
    ],
    relatedArticles: [],
    viewCount: 378,
    likeCount: 112,
    createTime: '2024-12-18',
    status: 1
  },
  {
    id: 'figure_008',
    name: '吴桂兰',
    avatar: 'https://picsum.photos/id/177/200/200',
    birthYear: 1948,
    deathYear: null,
    identity: 'craftsman',
    region: 'east',
    era: '1940s',
    crafts: ['pottery', 'cooking'],
    briefIntroduction: '紫砂壶制作大师，她制作的紫砂壶既有实用性又有收藏价值。',
    detailedIntroduction: '吴桂兰是江苏宜兴人，从小在紫砂作坊里长大。她十八岁开始正式学习紫砂壶制作，师从著名紫砂工艺大师顾景舟。她的作品造型典雅，做工精细，尤以"筋纹器"见长。她常说："做壶如做人，要方方正正，一丝不苟。"',
    timeline: [
      { year: 1948, event: '出生于江苏省宜兴市一个紫砂世家' },
      { year: 1966, event: '进入宜兴紫砂工艺厂工作' },
      { year: 1972, event: '拜著名紫砂工艺大师顾景舟为师' },
      { year: 1990, event: '作品《如意壶》获得全国陶瓷艺术展金奖' },
      { year: 2005, event: '被评为"中国陶瓷艺术大师"' },
      { year: 2018, event: '创立紫砂艺术馆，免费向公众开放' }
    ],
    works: [
      { id: 'work_015', title: '如意壶', type: 'work', content: '经典作品，造型优雅，线条流畅。' },
      { id: 'work_016', title: '紫砂制作技艺', type: 'article', content: '详细介绍了紫砂壶的制作工艺和技巧。' }
    ],
    relatedArticles: [],
    viewCount: 567,
    likeCount: 145,
    createTime: '2024-12-20',
    status: 1
  }
];

const getIdentityInfo = (identityId) => {
  return IDENTITY_TYPES[identityId] || { name: '未知', icon: '👤', color: '#999999' };
};

const getRegionName = (regionId) => {
  const region = REGIONS.find(r => r.id === regionId);
  return region ? region.name : '未知';
};

const getEraName = (eraId) => {
  const era = ERA_TYPES.find(e => e.id === eraId);
  return era ? era.name : '未知';
};

const getCraftName = (craftId) => {
  const craft = CRAFTS.find(c => c.id === craftId);
  return craft ? craft.name : '未知';
};

const getCraftNames = (craftIds) => {
  if (!craftIds || !Array.isArray(craftIds)) return [];
  return craftIds.map(id => getCraftName(id)).filter(name => name !== '未知');
};

const getAge = (birthYear, deathYear) => {
  if (!birthYear) return null;
  const endYear = deathYear || new Date().getFullYear();
  return endYear - birthYear;
};

const formatLifespan = (birthYear, deathYear) => {
  if (!birthYear) return '';
  if (deathYear) {
    return `${birthYear} - ${deathYear}`;
  }
  return `${birthYear} - 至今`;
};

const initFigureData = () => {
  const figures = wx.getStorageSync('figures');
  if (!figures || figures.length === 0) {
    wx.setStorageSync('figures', DEFAULT_FIGURES);
    console.log('[FigureData] 初始化人物数据完成');
  }

  const figureDrafts = wx.getStorageSync('figureDrafts');
  if (!figureDrafts) {
    wx.setStorageSync('figureDrafts', []);
    console.log('[FigureData] 初始化人物草稿数据完成');
  }
};

const filterFigures = (figures, filters = {}) => {
  let result = [...figures];
  const { identity, craft, region, era, keyword } = filters;

  if (identity && identity !== 'all') {
    result = result.filter(item => item.identity === identity);
  }

  if (craft && craft !== 'all') {
    result = result.filter(item => item.crafts && item.crafts.includes(craft));
  }

  if (region && region !== 'all') {
    result = result.filter(item => item.region === region);
  }

  if (era && era !== 'all') {
    result = result.filter(item => item.era === era);
  }

  if (keyword && keyword.trim()) {
    const kw = keyword.toLowerCase().trim();
    result = result.filter(item =>
      item.name.toLowerCase().includes(kw) ||
      item.briefIntroduction.toLowerCase().includes(kw) ||
      getCraftNames(item.crafts).some(name => name.toLowerCase().includes(kw))
    );
  }

  return result;
};

module.exports = {
  IDENTITY_TYPES,
  ERA_TYPES,
  REGIONS,
  CRAFTS,
  DEFAULT_FIGURES,
  getIdentityInfo,
  getRegionName,
  getEraName,
  getCraftName,
  getCraftNames,
  getAge,
  formatLifespan,
  initFigureData,
  filterFigures
};
