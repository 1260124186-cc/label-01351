const defaultFigures = [
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
    briefIntroduction: '土生土长的老农民，种了一辈子地。',
    detailedIntroduction: '王德福老人出生在一个普通农民家庭。',
    timeline: [
      { year: 1938, event: '出生于河北省一个普通农民家庭' },
      { year: 1950, event: '开始跟着父亲学习种地' }
    ],
    works: [
      { id: 'work_001', title: '我的种地经', type: 'story', content: '根据多年经验总结的耕作要点。' }
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
    briefIntroduction: '苏绣传承人，从艺七十余年。',
    detailedIntroduction: '李陈氏闺名陈秀兰，嫁到李家后大家都叫她李陈氏。',
    timeline: [
      { year: 1935, event: '出生于苏州一个刺绣世家' }
    ],
    works: [
      { id: 'work_003', title: '春燕图', type: 'work', content: '代表作品，两只春燕在桃花间飞舞。' }
    ],
    relatedArticles: ['article_002'],
    viewCount: 892,
    likeCount: 256,
    createTime: '2024-12-05',
    status: 1
  }
];

const defaultArticles = [
  {
    id: 'article_001',
    title: '记忆中的农耕岁月',
    content: '在我的记忆里，每年春耕时节，父亲总是天不亮就起床，扛着锄头走向田间。那时候没有机械化，全靠人力和牛力。父亲说，种地要看天时，要懂得节气。',
    category: 'farming',
    authorId: 'user_001',
    authorName: '张大爷',
    viewCount: 328,
    likeCount: 56,
    createTime: '2024-12-15',
    status: 1
  },
  {
    id: 'article_002',
    title: '外婆的织布手艺',
    content: '外婆今年八十五岁了，她的织布手艺在村里是出了名的。从我记事起，外婆家的堂屋里就摆着一台老式织布机，那是外公年轻时亲手做的。',
    category: 'craft',
    authorId: 'user_002',
    authorName: '李阿姨',
    viewCount: 256,
    likeCount: 89,
    createTime: '2024-12-10',
    status: 1
  },
  {
    id: 'article_003',
    title: '村口老槐树的故事',
    content: '我们村口有一棵老槐树，听村里最年长的王爷爷说，这棵树少说也有三百年了。树干粗得要三个大人才能合抱，树冠像一把巨大的绿伞。',
    category: 'memory',
    authorId: 'user_003',
    authorName: '王老师',
    viewCount: 412,
    likeCount: 127,
    createTime: '2024-12-08',
    status: 1
  },
  {
    id: 'article_004',
    title: '端午节的老习俗',
    content: '在我们村，端午节是一年中最热闹的节日之一。从五月初一开始，家家户户就忙活起来了。首先是包粽子，奶奶会提前一天把糯米泡好。',
    category: 'folklore',
    authorId: 'user_004',
    authorName: '陈奶奶',
    viewCount: 567,
    likeCount: 203,
    createTime: '2024-12-05',
    status: 1
  },
  {
    id: 'article_005',
    title: '爷爷的二十四节气歌',
    content: '爷爷是村里有名的"老把式"，种了一辈子地，对节气了如指掌。他常念叨的二十四节气歌，我到现在还记得。',
    category: 'farming',
    authorId: 'user_005',
    authorName: '刘大伯',
    viewCount: 389,
    likeCount: 145,
    createTime: '2024-12-01',
    status: 1
  }
];

const defaultCategories = [
  { id: 'all', name: '全部', icon: 'all', sort: 0 },
  { id: 'folklore', name: '民俗故事', icon: 'folklore', sort: 1 },
  { id: 'farming', name: '农耕智慧', icon: 'farming', sort: 2 },
  { id: 'craft', name: '传统技艺', icon: 'craft', sort: 3 },
  { id: 'memory', name: '乡土记忆', icon: 'memory', sort: 4 }
];

const defaultUser = {
  id: 'user_001',
  nickname: '测试用户',
  avatar: '',
  phone: '',
  createTime: '2024-01-01'
};

const defaultTopics = [
  {
    id: 'topic_001',
    title: '端午民俗专题',
    coverImage: '',
    category: 'folklore',
    categoryName: '民俗故事',
    introduction: '端午节是中国传统节日之一，有着丰富的民俗文化内涵。本专题将带您深入了解端午节的起源、习俗和文化意义。',
    tags: ['端午节', '传统节日', '民俗'],
    articleIds: ['article_004'],
    relatedTopicIds: ['topic_002'],
    articleCount: 1,
    viewCount: 256,
    likeCount: 45,
    createTime: '2024-12-10',
    status: 1
  },
  {
    id: 'topic_002',
    title: '传统织布技艺',
    coverImage: '',
    category: 'craft',
    categoryName: '传统技艺',
    introduction: '传统织布技艺是中国非物质文化遗产的重要组成部分，承载着千年的文化传承。',
    tags: ['织布', '非遗', '传统技艺'],
    articleIds: ['article_002'],
    relatedTopicIds: [],
    articleCount: 1,
    viewCount: 189,
    likeCount: 32,
    createTime: '2024-12-08',
    status: 1
  }
];

const defaultInterviews = [
  {
    id: 'interview_001',
    type: 'interview',
    intervieweeName: '王德福',
    gender: '男',
    age: 86,
    birthYear: 1938,
    occupation: '农民',
    region: 'north',
    address: '河北省衡水市某村',
    interviewLocation: '王德福老人家中',
    interviewDate: '2024-03-15',
    interviewer: '文化志愿者小张',
    crafts: ['farming', 'herbal'],
    summary: '王德福老人种了一辈子地，对二十四节气和传统农耕技艺了如指掌。',
    content: '采访者：王大爷，您能给我们讲讲过去种地的事吗？\n\n王德福：哎呀，这说来可就话长了。我从十几岁就跟着我爹在地里摸爬滚打。',
    tags: ['农耕文化', '二十四节气'],
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
    intervieweeName: '李陈氏',
    gender: '女',
    age: 89,
    birthYear: 1935,
    occupation: '苏绣传承人',
    region: 'east',
    address: '江苏省苏州市某镇',
    interviewLocation: '陈氏刺绣工作室',
    interviewDate: '2024-02-20',
    interviewer: '非遗保护中心小李',
    crafts: ['weaving', 'embroidery'],
    summary: '李陈氏从艺七十余年，作品曾被选为国礼。',
    content: '采访者：陈奶奶，您是怎么开始学刺绣的？\n\n李陈氏：我娘就是做刺绣的，我从小就在她旁边看。',
    tags: ['苏绣', '非遗'],
    collectionIds: ['collection_craftsman'],
    relatedFigureId: 'figure_002',
    viewCount: 892,
    likeCount: 256,
    status: 1,
    authorId: 'user_002',
    authorName: '非遗保护中心小李',
    createTime: '2024-02-22'
  }
];

const defaultQuizzes = [
  {
    id: 'quiz_001',
    question: '端午节是为了纪念哪位历史人物？',
    options: ['伍子胥', '屈原', '李白', '孔子'],
    answer: 1,
    analysis: '端午节最广泛的传说是纪念楚国诗人屈原。屈原在五月初五投汨罗江自尽，百姓为了防止鱼虾伤害他的身体，便划船寻找、投放粽子，逐渐演变为今天的端午习俗。',
    category: 'folklore',
    difficulty: 'easy',
    relatedArticleIds: ['article_004']
  },
  {
    id: 'quiz_002',
    question: '"春雨惊春清谷天"一句中，"清"指的是哪个节气？',
    options: ['清凉', '清明', '清澈', '清秋'],
    answer: 1,
    analysis: '二十四节气中，"春雨惊春清谷天"指立春、雨水、惊蛰、春分、清明、谷雨。其中"清"即清明节，是祭祖扫墓和踏青的重要节日。',
    category: 'agriculture',
    difficulty: 'easy',
    relatedArticleIds: ['article_005']
  },
  {
    id: 'quiz_003',
    question: '传统苏绣中，最具代表性的针法是？',
    options: ['平针绣', '打籽绣', '乱针绣', '滚针绣'],
    answer: 0,
    analysis: '平针绣是苏绣最基础也是最具代表性的针法，以针脚排列整齐、色彩过渡自然著称。苏绣讲究"平、光、齐、匀、和、顺、细、密"八字特点。',
    category: 'craft',
    difficulty: 'medium',
    relatedArticleIds: ['article_002']
  },
  {
    id: 'quiz_004',
    question: '"三顾茅庐"讲述的是哪位历史人物的故事？',
    options: ['项羽请范增', '刘备请诸葛亮', '曹操请郭嘉', '孙权请周瑜'],
    answer: 1,
    analysis: '三顾茅庐讲的是东汉末年刘备三次前往隆中拜访诸葛亮，请其出山辅佐的故事。出自《三国志》，后成为尊重人才、诚心求贤的典故。',
    category: 'history',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_005',
    question: '中国古典四大名著中，以宋代农民起义为题材的是？',
    options: ['西游记', '红楼梦', '水浒传', '三国演义'],
    answer: 2,
    analysis: '《水浒传》是元末明初施耐庵所著，以北宋末年宋江领导的农民起义为题材，塑造了林冲、武松、鲁智深等108位梁山好汉的形象。',
    category: 'literature',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_006',
    question: '以下哪种传统食物是北方春节必备的？',
    options: ['月饼', '饺子', '汤圆', '粽子'],
    answer: 1,
    analysis: '饺子是北方春节必备的传统食物，取"更岁交子"之意，象征新旧交替、团圆美满。除夕夜吃饺子，寓意招财进宝、吉祥如意。',
    category: 'food',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_007',
    question: '"爆竹声中一岁除"描写的是哪个节日的场景？',
    options: ['元宵节', '端午节', '春节', '中秋节'],
    answer: 2,
    analysis: '这是北宋王安石《元日》中的名句，全诗为"爆竹声中一岁除，春风送暖入屠苏。千门万户曈曈日，总把新桃换旧符。"生动描绘了宋代春节的热闹景象。',
    category: 'folklore',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_008',
    question: '"小满"节气在农业生产中主要指？',
    options: ['小麦等夏熟作物籽粒开始饱满', '雨水充足江河满溢', '播种的最佳时节', '收获的季节'],
    answer: 0,
    analysis: '小满是夏季第二个节气，此时北方麦类等夏熟作物的籽粒开始灌浆饱满，但尚未成熟，所以叫小满。农谚有"小满不满，麦有一险"之说。',
    category: 'agriculture',
    difficulty: 'medium',
    relatedArticleIds: ['article_005']
  },
  {
    id: 'quiz_009',
    question: '榫卯结构主要应用于传统的什么工艺？',
    options: ['陶瓷制作', '木作建筑', '丝绸纺织', '金属锻造'],
    answer: 1,
    analysis: '榫卯是古代中国木结构建筑、家具和器械的主要结构方式，通过凹凸部分的咬合实现连接，不用一颗钉子却能做到极其牢固，体现了中华智慧。',
    category: 'craft',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_010',
    question: '"破釜沉舟"与下列哪场战役有关？',
    options: ['赤壁之战', '巨鹿之战', '官渡之战', '淝水之战'],
    answer: 1,
    analysis: '破釜沉舟出自《史记·项羽本纪》，讲的是项羽在巨鹿之战中，下令打破做饭的锅、凿沉渡河的船，以示决一死战的决心，最终大败秦军。',
    category: 'history',
    difficulty: 'hard',
    relatedArticleIds: []
  },
  {
    id: 'quiz_011',
    question: '"春蚕到死丝方尽"的下一句是？',
    options: ['蜡炬成灰泪始干', '何当共剪西窗烛', '身无彩凤双飞翼', '心有灵犀一点通'],
    answer: 0,
    analysis: '这是晚唐诗人李商隐《无题·相见时难别亦难》中的名句。全诗表达了深沉缠绵的爱情与离别之苦，"春蚕到死丝方尽，蜡炬成灰泪始干"常被用来比喻无私奉献的精神。',
    category: 'literature',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_012',
    question: '中国传统饮茶方式中，功夫茶起源于？',
    options: ['四川', '福建广东', '浙江', '云南'],
    answer: 1,
    analysis: '功夫茶起源于宋代，盛行于广东潮汕和福建闽南地区，讲究器具精良、泡茶程序精细，是中国茶艺的代表之一，尤以乌龙茶类的冲泡最为讲究。',
    category: 'food',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_013',
    question: '舞龙舞狮主要在哪个节日表演最盛行？',
    options: ['重阳节', '中秋节', '春节', '端午节'],
    answer: 2,
    analysis: '舞龙舞狮是春节期间最盛行的民间表演，象征吉祥如意、驱邪纳福。龙代表祥瑞，狮象征威武，祈求新的一年风调雨顺、国泰民安。',
    category: 'folklore',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_014',
    question: '梯田耕作主要是为了解决什么问题？',
    options: ['美化风景', '蓄水保土', '便于灌溉', '提高温度'],
    answer: 1,
    analysis: '梯田是在丘陵山坡地上沿等高线修筑的阶梯式农田，主要作用是蓄水保土，防止水土流失，同时扩大耕地面积，是山区农民智慧的结晶。著名的有广西龙脊梯田、云南元阳梯田等。',
    category: 'agriculture',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_015',
    question: '景德镇最为著名的传统工艺是？',
    options: ['刺绣', '瓷器', '剪纸', '木雕'],
    answer: 1,
    analysis: '景德镇是中国四大名镇之一，被誉为"瓷都"，有2000多年的制瓷历史。青花瓷、粉彩瓷、玲珑瓷、颜色釉瓷是景德镇四大传统名瓷。',
    category: 'craft',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_016',
    question: '"卧薪尝胆"讲述的是谁的故事？',
    options: ['吴王夫差', '越王勾践', '齐桓公', '晋文公'],
    answer: 1,
    analysis: '卧薪尝胆讲的是春秋时期越王勾践被吴王夫差打败后，睡在柴草上，每天尝一尝苦胆，立志发愤图强，最终复国成功的故事，体现了坚韧不拔的精神。',
    category: 'history',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_017',
    question: '我国古代最早的诗歌总集是？',
    options: ['楚辞', '诗经', '乐府诗集', '唐诗三百首'],
    answer: 1,
    analysis: '《诗经》是中国古代最早的诗歌总集，收录了西周初年至春秋中叶约500年间的诗歌305篇，分为风、雅、颂三大部分，奠定了中国古典诗歌的基础。',
    category: 'literature',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_018',
    question: '北京烤鸭使用的传统烤炉是？',
    options: ['挂炉', '焖炉', '铁板炉', '石炉'],
    answer: 0,
    analysis: '北京烤鸭最传统的是挂炉烤鸭，以果木为燃料，明火炙烤，皮脆肉嫩，油而不腻。全聚德以挂炉著称，便宜坊则以焖炉闻名，两者各具特色。',
    category: 'food',
    difficulty: 'hard',
    relatedArticleIds: []
  },
  {
    id: 'quiz_019',
    question: '重阳节的主要习俗不包括？',
    options: ['登高远眺', '插茱萸', '赏菊花', '赛龙舟'],
    answer: 3,
    analysis: '重阳节在农历九月初九，习俗包括登高远眺、插茱萸、赏菊花、饮菊花酒、吃重阳糕等。赛龙舟是端午节的主要习俗，不是重阳节的。',
    category: 'folklore',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_020',
    question: '"稻花香里说丰年，听取蛙声一片"出自哪位词人？',
    options: ['苏轼', '辛弃疾', '李清照', '陆游'],
    answer: 1,
    analysis: '这句出自南宋词人辛弃疾的《西江月·夜行黄沙道中》，描写了乡村夏夜的幽美景色和丰收的喜悦，全词洋溢着浓郁的乡土气息。',
    category: 'literature',
    difficulty: 'hard',
    relatedArticleIds: []
  }
];

const defaultEncyclopedias = [
  {
    id: 'encyclopedia_001',
    title: '二十四节气',
    category: 'farming',
    categoryName: '农耕智慧',
    summary: '二十四节气是中国古代订立的一种用来指导农事的补充历法，是中华民族劳动人民长期经验的积累和智慧的结晶。',
    content: '二十四节气，是干支历中表示自然节律变化以及确立"十二月建"的特定节令。\n\n最初是依据斗转星移制定，北斗七星循环旋转，斗柄绕东、南、西、北旋转一圈，为一周期，谓之一"岁"。',
    catalog: [
      { id: 'cat_001', level: 1, title: '节气起源' },
      { id: 'cat_002', level: 1, title: '二十四节气详解' },
      { id: 'cat_003', level: 2, title: '春季节气' },
      { id: 'cat_004', level: 2, title: '夏季节气' }
    ],
    tags: ['节气', '农耕', '传统文化'],
    relatedArticleIds: ['article_005'],
    relatedTopicIds: [],
    viewCount: 567,
    likeCount: 89,
    createTime: '2024-12-05',
    status: 1
  },
  {
    id: 'encyclopedia_002',
    title: '榫卯',
    category: 'craft',
    categoryName: '传统技艺',
    summary: '榫卯是古代中国建筑、家具及其它器械的主要结构方式，是在两个构件上采用凹凸部位相结合的一种连接方式。',
    content: '榫卯是极为精巧的发明，这种构件连接方式，使得中国传统的木结构成为超越了当代建筑排架、框架或者刚架的特殊柔性结构体。\n\n不但可以承受较大的荷载，而且允许产生一定的变形，在地震荷载下通过变形抵消一定的地震能量，减小结构的地震响应。',
    catalog: [
      { id: 'cat_005', level: 1, title: '榫卯的定义' },
      { id: 'cat_006', level: 1, title: '榫卯的历史' }
    ],
    tags: ['榫卯', '建筑', '传统技艺'],
    relatedArticleIds: [],
    relatedTopicIds: ['topic_002'],
    viewCount: 423,
    likeCount: 76,
    createTime: '2024-12-03',
    status: 1
  }
];

const getFutureDate = (days, hours = 9) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:00:00`;
};

const defaultActivities = [
  {
    id: 'activity_001',
    title: '传统刺绣技艺体验课',
    startTime: getFutureDate(7, 9),
    endTime: getFutureDate(7, 11),
    location: '村文化活动中心',
    maxParticipants: 20,
    registeredCount: 8,
    type: 'craft',
    description: '邀请非遗传承人李陈氏老师现场教学，体验传统苏绣的基本针法。\n\n适合所有年龄段，材料由主办方提供，欢迎大家踊跃报名参加。',
    cover: '',
    reviewArticleIds: [],
    authorId: 'user_001',
    authorName: '测试用户',
    viewCount: 156,
    createTime: '2024-12-15 10:00:00',
    status: 1
  },
  {
    id: 'activity_002',
    title: '农耕文化研学活动',
    startTime: getFutureDate(3, 8),
    endTime: getFutureDate(3, 16),
    location: '生态农业示范园',
    maxParticipants: 30,
    registeredCount: 30,
    type: 'study',
    description: '走进田间地头，了解传统农耕文化，体验播种、收割等农事活动。\n\n午餐提供农家特色饭菜，让大家体验真实的乡村生活。',
    cover: '',
    reviewArticleIds: [],
    authorId: 'user_001',
    authorName: '测试用户',
    viewCount: 289,
    createTime: '2024-12-10 14:00:00',
    status: 1
  },
  {
    id: 'activity_003',
    title: '二十四节气文化讲座',
    startTime: getFutureDate(-2, 14),
    endTime: getFutureDate(-2, 16),
    location: '村委会大礼堂',
    maxParticipants: 50,
    registeredCount: 35,
    type: 'lecture',
    description: '邀请农业大学王教授为大家讲解二十四节气的由来、习俗以及与农业生产的关系。\n\n现场有互动问答环节，精美礼品等你来拿。',
    cover: '',
    reviewArticleIds: ['article_005'],
    authorId: 'user_001',
    authorName: '测试用户',
    viewCount: 412,
    createTime: '2024-12-01 09:00:00',
    status: 1
  }
];

function initStorage(overrides = {}) {
  wx._resetStorage();
  wx.setStorageSync('articles', overrides.articles || JSON.parse(JSON.stringify(defaultArticles)));
  wx.setStorageSync('categories', overrides.categories || JSON.parse(JSON.stringify(defaultCategories)));
  wx.setStorageSync('figures', overrides.figures || JSON.parse(JSON.stringify(defaultFigures)));
  if (overrides.userInfo) {
    wx.setStorageSync('userInfo', overrides.userInfo);
  }
  if (overrides.isLoggedIn) {
    wx.setStorageSync('isLoggedIn', overrides.isLoggedIn);
  }
  if (overrides.favorites) {
    wx.setStorageSync('favorites', overrides.favorites);
  }
  if (overrides.likes) {
    wx.setStorageSync('likes', overrides.likes);
  }
  if (overrides.figureLikes) {
    wx.setStorageSync('figureLikes', overrides.figureLikes);
  }
  if (overrides.figureDrafts) {
    wx.setStorageSync('figureDrafts', overrides.figureDrafts);
  }
  if (overrides.topics) {
    wx.setStorageSync('topics', overrides.topics);
  } else {
    wx.setStorageSync('topics', JSON.parse(JSON.stringify(defaultTopics)));
  }
  if (overrides.encyclopedias) {
    wx.setStorageSync('encyclopedia', overrides.encyclopedias);
  } else {
    wx.setStorageSync('encyclopedia', JSON.parse(JSON.stringify(defaultEncyclopedias)));
  }
  if (overrides.activities) {
    wx.setStorageSync('activities', overrides.activities);
  } else {
    wx.setStorageSync('activities', JSON.parse(JSON.stringify(defaultActivities)));
  }
  if (overrides.activityRegistrations) {
    wx.setStorageSync('activityRegistrations', overrides.activityRegistrations);
  } else {
    wx.setStorageSync('activityRegistrations', {});
  }
  if (overrides.quizzes) {
    wx.setStorageSync('quizzes', overrides.quizzes);
  } else {
    wx.setStorageSync('quizzes', JSON.parse(JSON.stringify(defaultQuizzes)));
  }
  if (overrides.quizStats) {
    wx.setStorageSync('quizStats', overrides.quizStats);
  } else {
    wx.setStorageSync('quizStats', {});
  }
  if (overrides.quizScores) {
    wx.setStorageSync('quizScores', overrides.quizScores);
  } else {
    wx.setStorageSync('quizScores', {});
  }
  if (overrides.wrongQuizzes) {
    wx.setStorageSync('wrongQuizzes', overrides.wrongQuizzes);
  } else {
    wx.setStorageSync('wrongQuizzes', {});
  }
  if (overrides.interviews) {
    wx.setStorageSync('interviews', overrides.interviews);
  } else {
    wx.setStorageSync('interviews', JSON.parse(JSON.stringify(defaultInterviews)));
  }
  if (overrides.interviewLikes) {
    wx.setStorageSync('interviewLikes', overrides.interviewLikes);
  } else {
    wx.setStorageSync('interviewLikes', {});
  }
  if (overrides.interviewDrafts) {
    wx.setStorageSync('interviewDrafts', overrides.interviewDrafts);
  } else {
    wx.setStorageSync('interviewDrafts', []);
  }
}

function mergeBehaviors(pageDef) {
  if (!pageDef.behaviors || !pageDef.behaviors.length) return pageDef;

  let mergedData = {};
  let mergedMethods = {};
  const lifecycleHooks = ['created', 'attached', 'ready', 'moved', 'detached'];
  let mergedLifecycles = {};

  for (const behavior of pageDef.behaviors) {
    if (behavior.data) {
      mergedData = { ...mergedData, ...behavior.data };
    }
    if (behavior.methods) {
      Object.keys(behavior.methods).forEach(key => {
        if (typeof behavior.methods[key] === 'function') {
          mergedMethods[key] = behavior.methods[key];
        }
      });
    }
    lifecycleHooks.forEach(hook => {
      if (typeof behavior[hook] === 'function') {
        if (!mergedLifecycles[hook]) {
          mergedLifecycles[hook] = [];
        }
        mergedLifecycles[hook].push(behavior[hook]);
      }
    });
  }

  mergedData = { ...mergedData, ...pageDef.data };

  const pageMethods = Object.keys(pageDef).filter(
    key => typeof pageDef[key] === 'function' && key !== 'behaviors' && !lifecycleHooks.includes(key)
  );
  pageMethods.forEach(method => {
    mergedMethods[method] = pageDef[method];
  });

  lifecycleHooks.forEach(hook => {
    if (typeof pageDef[hook] === 'function') {
      if (!mergedLifecycles[hook]) {
        mergedLifecycles[hook] = [];
      }
      mergedLifecycles[hook].push(pageDef[hook]);
    }
  });

  const result = { data: mergedData, ...mergedMethods };

  Object.keys(mergedLifecycles).forEach(hook => {
    const fns = mergedLifecycles[hook];
    result[hook] = function(...args) {
      fns.forEach(fn => fn.apply(this, args));
    };
  });

  return result;
}

function createPageInstance(pageDef, dataOverrides = {}) {
  const merged = mergeBehaviors(pageDef);

  const instance = {
    data: { ...merged.data, ...dataOverrides },
    setData(updates) {
      Object.keys(updates).forEach(key => {
        const parts = key.split('.');
        let target = this.data;
        for (let i = 0; i < parts.length - 1; i++) {
          if (target[parts[i]] === undefined) target[parts[i]] = {};
          target = target[parts[i]];
        }
        target[parts[parts.length - 1]] = updates[key];
      });
    },
  };

  const methods = Object.keys(merged).filter(
    key => typeof merged[key] === 'function'
  );
  methods.forEach(method => {
    instance[method] = merged[method].bind(instance);
  });

  if (typeof instance.created === 'function') {
    instance.created();
  }

  return instance;
}

module.exports = {
  defaultArticles,
  defaultCategories,
  defaultFigures,
  defaultUser,
  defaultTopics,
  defaultEncyclopedias,
  defaultActivities,
  defaultQuizzes,
  defaultInterviews,
  initStorage,
  createPageInstance
};
