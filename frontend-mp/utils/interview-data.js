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
    summary: '王德福老人种了一辈子地，对二十四节气和传统农耕技艺了如指掌。他常说："土地是有灵性的，你对它好，它就对你好。"',
    content: '采访者：王大爷，您能给我们讲讲过去种地的事吗？\n\n王德福：哎呀，这说来可就话长了。我从十几岁就跟着我爹在地里摸爬滚打，那时候哪有什么机械化啊，全靠人力和畜力。\n\n采访者：那时候种地都讲究什么呢？\n\n王德福：最讲究的就是节气！老祖宗说的"清明前后，种瓜点豆"，那是千真万确的。惊蛰一过，地气上升，就该翻地了。春分播种，谷雨插秧，每个节气都有每个节气的活计。\n\n采访者：您还记得哪些农谚吗？\n\n王德福：那可太多了！"朝霞不出门，晚霞行千里"、"蚂蚁搬家蛇过道，大雨不久就来到"，这些都是我们祖辈观察自然总结出来的经验。还有"头伏萝卜二伏菜，三伏种荞麦"，什么时候种什么，那是一点都错不得的。\n\n采访者：现在年轻人都不太懂这些了，您觉得可惜吗？\n\n王德福：可惜啊！不过这也是时代发展的结果。只是有些东西，我觉得还是应该传下去。比如对土地的敬畏，对自然的尊重。土地养活了我们祖祖辈辈，我们不能亏待它。',
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
    summary: '李陈氏从艺七十余年，作品曾被选为国礼。她八岁学刺绣，十二岁就能独立完成绣品，培养了三十多名徒弟。',
    content: '采访者：陈奶奶，您是怎么开始学刺绣的？\n\n李陈氏：我娘就是做刺绣的，我从小就在她旁边看。八岁那年，娘说"女孩子家，学个手艺防身"，就正式教我了。\n\n采访者：学刺绣难吗？\n\n李陈氏：难啊！光练基本功就练了三年。坐不住不行，心不静不行，眼神不好也不行。那时候我娘对我可严了，一根线绣错了，整幅都得拆了重绣。\n\n采访者：您最满意的作品是哪一件？\n\n李陈氏：应该是《春燕图》吧。那是我四十岁那年绣的，前前后后绣了半年。后来这幅作品被选为国礼，送给了外宾。想想也值了。\n\n采访者：您对想学刺绣的年轻人有什么建议吗？\n\n李陈氏：首先要坐得住冷板凳。刺绣这门手艺，没有捷径可走，就是一针一线地练。其次要用心，要把感情绣进去。你看我绣的燕子，每一根羽毛都带着劲儿，那是因为我喜欢燕子，把它们当朋友看。',
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
    intervieweeName: '张树人',
    gender: '男',
    age: 79,
    birthYear: 1945,
    occupation: '退休教师',
    region: 'central',
    address: '湖南省长沙市某村',
    interviewLocation: '留守儿童之家',
    interviewDate: '2024-04-05',
    interviewer: '大学生志愿者小王',
    crafts: ['storytelling', 'calligraphy'],
    summary: '张树人老师是村里第一个大学生，执教四十余年，退休后仍在村里免费教孩子们读书写字。',
    content: '采访者：张老师，您当年为什么选择回到村里当老师？\n\n张树人：我是村里第一个考上大学的，那时候全村人都来送我。我爹说"娃啊，你是村里的骄傲，学成了别忘了回来帮衬乡亲们"。这句话我记了一辈子。\n\n采访者：您觉得这些年村里最大的变化是什么？\n\n张树人：最大的变化就是通路了。我小时候上学，要走二十里山路，天不亮就得起床。现在好了，水泥路修到了家门口，孩子们坐校车就能上学。\n\n采访者：您退休后为什么还要办"留守儿童之家"？\n\n张树人：现在年轻人都出去打工了，留下老人和孩子。孩子们放学了没人辅导功课，也没人给他们讲故事。我虽然退休了，但身子骨还硬朗，能帮一把是一把。\n\n采访者：您对孩子们有什么期望？\n\n张树人：我就希望他们好好读书，将来有出息。但不管走到哪里，都不能忘了自己的根，不能忘了这片生养他们的土地。',
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
    intervieweeName: '赵天工',
    gender: '男',
    age: 72,
    birthYear: 1952,
    occupation: '木雕大师',
    region: 'southwest',
    address: '四川省成都市某镇',
    interviewLocation: '天工木雕艺术馆',
    interviewDate: '2024-03-28',
    interviewer: '文化局老刘',
    crafts: ['woodcarving', 'pottery'],
    summary: '赵天工出生在木匠世家，祖上三代都是木匠。他的木雕作品既有传统工艺的精髓，又融入了现代设计理念。',
    content: '采访者：赵老师，您家三代都是木匠，这门手艺是怎么传下来的？\n\n赵天工：我爷爷那辈就是木匠，我爹也是。我从小就在我爹的木工房里长大，耳濡目染，自然而然就喜欢上了。\n\n采访者：传统木雕和现代设计怎么结合呢？\n\n赵天工：传统的东西不能丢，但也要与时俱进。比如传统木雕讲究"龙凤呈祥"、"松鹤延年"这些吉祥图案，现代人可能觉得太繁复了。我就把这些元素简化，用更现代的手法表现出来。\n\n采访者：您最满意的作品是什么？\n\n赵天工：应该是《山水情》吧。那是我五十岁那年创作的，用了一整棵金丝楠木，前后雕了三年。这幅作品后来获得了中国工艺美术百花奖。\n\n采访者：您对木雕行业的未来怎么看？\n\n赵天工：我是乐观的。现在国家重视非遗，年轻人也开始喜欢传统工艺了。关键是要创新，要让传统工艺走进现代人的生活，而不是摆在博物馆里落灰。',
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
    intervieweeName: '刘杏林',
    gender: '男',
    age: 82,
    birthYear: 1942,
    occupation: '乡村医生',
    region: 'south',
    address: '广东省广州市某村',
    interviewLocation: '村卫生室',
    interviewDate: '2024-05-10',
    interviewer: '卫生院小周',
    crafts: ['herbal', 'cooking'],
    summary: '刘杏林医生行医六十余载，免费为贫困村民看病，被村民们亲切地称为"当代华佗"。',
    content: '采访者：刘医生，您当年为什么选择回村里当医生？\n\n刘杏林：我年轻时在县医院工作，每次回村里，看到乡亲们看病难，心里就不是滋味。那时候村里没有医生，看个病要走几十里山路。我就想，我是村里长大的，应该回来为乡亲们做点事。\n\n采访者：这么多年行医，印象最深的事是什么？\n\n刘杏林：有一年冬天，下着大雪，邻村有个产妇难产。我背着药箱，走了两个多小时山路才到。幸好及时，最后母子平安。后来那孩子认我做了干爹，现在都上大学了。\n\n采访者：您懂中医又懂西医，这在乡村医生里不多见吧？\n\n刘杏林：我爹是中医，从小就教我认识草药。后来我又自学了西医。在村里看病，不能拘泥于中医还是西医，什么办法能治好病就用什么办法。\n\n采访者：您八十多岁了还坚持坐诊，不累吗？\n\n刘杏林：累是累，但看到乡亲们健健康康的，我心里就高兴。再说，我这把老骨头，能多为乡亲们服务一天是一天。',
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
    intervieweeName: '孙巧娘',
    gender: '女',
    age: 69,
    birthYear: 1955,
    occupation: '剪纸艺术家',
    region: 'northwest',
    address: '陕西省延安市某村',
    interviewLocation: '巧娘剪纸工作室',
    interviewDate: '2024-04-18',
    interviewer: '文化馆小陈',
    crafts: ['papercut', 'cooking'],
    summary: '孙巧娘的剪纸作品把黄土高原的风土人情表现得淋漓尽致，曾多次代表中国民间艺术家出国访问。',
    content: '采访者：孙阿姨，您是怎么开始学剪纸的？\n\n孙巧娘：我奶奶剪得一手好窗花，我从小就跟着她学。那时候过年，家家户户都要贴窗花，我剪的窗花最受大家欢迎。\n\n采访者：您的剪纸作品都有些什么题材？\n\n孙巧娘：什么都有！传统的龙凤呈祥、喜鹊登梅，还有我们黄土高原的风土人情——放羊的老汉、纳鞋底的婆姨、摘红枣的娃娃。我觉得，剪纸就是要表现生活。\n\n采访者：听说您还出国表演过剪纸？\n\n孙巧娘：是啊！去过法国、日本、美国。外国人看我拿着一把小剪刀，三下两下就剪出一幅活灵活现的图案，都惊呆了。他们说这是"神奇的东方艺术"。\n\n采访者：您觉得剪纸艺术的魅力在哪里？\n\n孙巧娘：剪纸是老百姓的艺术。一张红纸，一把剪刀，就能剪出心中的美好。它不像别的艺术那么复杂，人人都能学，人人都能玩。这就是它的魅力所在。',
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
    intervieweeName: '周德声',
    gender: '男',
    age: 92,
    birthYear: 1932,
    occupation: '评书艺人',
    region: 'northeast',
    address: '辽宁省沈阳市某社区',
    interviewLocation: '社区文化站',
    interviewDate: '2024-05-25',
    interviewer: '曲艺协会小吴',
    crafts: ['storytelling', 'calligraphy'],
    summary: '周德声老先生从艺八十余年，能说一百多部传统评书，被誉为评书艺术的"活化石"。',
    content: '采访者：周先生，您是怎么开始学说书的？\n\n周德声：我爹就是说书的，我六岁开始学艺，九岁就能登台。那时候说书是个体力活，走南闯北，风餐露宿，但我就是喜欢。\n\n采访者：文革期间评书被禁，您是怎么坚持下来的？\n\n周德声：那时候不让公开说，我就偷偷地把评书词记在心里。晚上躺在床上，一遍一遍地背。我就不信，这么好的东西，就这么没了。\n\n采访者：您最拿手的段子是什么？\n\n周德声：《三国演义》、《水浒传》、《岳飞传》，这些都是我的看家本领。说《三国演义》，我能说三百六十五天不重样。\n\n采访者：您对评书艺术的未来有什么看法？\n\n周德声：现在的年轻人喜欢听相声、看短视频，听评书的少了。但我相信，只要我们这些老家伙还在，只要还有人愿意学，评书这门艺术就不会绝。',
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
    intervieweeName: '吴桂兰',
    gender: '女',
    age: 76,
    birthYear: 1948,
    occupation: '紫砂壶制作大师',
    region: 'east',
    address: '江苏省宜兴市某村',
    interviewLocation: '桂兰紫砂艺术馆',
    interviewDate: '2024-06-08',
    interviewer: '工艺美术协会小郑',
    crafts: ['pottery', 'cooking'],
    summary: '吴桂兰师从紫砂大师顾景舟，她制作的紫砂壶造型典雅，做工精细，既有实用性又有收藏价值。',
    content: '采访者：吴老师，您是怎么进入紫砂行业的？\n\n吴桂兰：我家就在宜兴，从小就在紫砂作坊里长大。十八岁那年，我正式拜顾景舟大师为师，开始学习紫砂壶制作。\n\n采访者：顾景舟大师对您最大的影响是什么？\n\n吴桂兰：我师父常说"做壶如做人，要方方正正，一丝不苟"。这句话我记了一辈子。做紫砂壶，每一个细节都不能马虎。\n\n采访者：您做一把壶要多长时间？\n\n吴桂兰：从选泥、炼泥、打身筒到最后烧制，前前后后要一个多月。光是打身筒这一道工序，我就练了三年。\n\n采访者：您觉得紫砂壶的灵魂是什么？\n\n吴桂兰：是"雅"。紫砂壶不张扬，不炫技，就那样安安静静地待在茶桌上，陪着你喝茶、聊天、读书。它是有温度的，用得越久，越有感情。',
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
    intervieweeName: '黄冬至',
    gender: '男',
    age: 78,
    birthYear: 1946,
    occupation: '老农民',
    region: 'central',
    address: '河南省周口市某村',
    interviewLocation: '黄大爷家的打谷场',
    interviewDate: '2023-12-22',
    interviewer: '节气文化志愿者小韩',
    crafts: ['farming', 'cooking'],
    summary: '黄大爷对二十四节气有着深刻的理解，每个节气该干什么农活，该吃什么传统食物，他都能说得头头是道。',
    content: '采访者：黄大爷，今天是冬至，你们这里有什么习俗？\n\n黄冬至：冬至大如年啊！今天家家户户都要吃饺子。俗话说"冬至不端饺子碗，冻掉耳朵没人管"。\n\n采访者：您能给我们讲讲冬至这个节气吗？\n\n黄冬至：冬至是一年中白天最短、黑夜最长的一天。过了冬至，白天就一天天变长了。民间有"吃了冬至面，一天长一线"的说法。\n\n采访者：冬至在农业生产上有什么讲究？\n\n黄冬至：冬至前后，要给小麦浇冻水，这样麦子才能安全过冬。还要把农具收拾好，该修的修，该换的换，为明年春耕做准备。\n\n采访者：您记得哪些和冬至有关的谚语？\n\n黄冬至："冬至晴，正月雨；冬至雨，正月晴"，这是说冬至的天气能预测过年的天气。还有"冬至在月头，要冷在年兜；冬至在月尾，要冷在正月"，这些都是老祖宗总结的经验。',
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
    intervieweeName: '陈立秋',
    gender: '女',
    age: 71,
    birthYear: 1953,
    occupation: '农家乐经营者',
    region: 'east',
    address: '浙江省杭州市某村',
    interviewLocation: '立秋农家乐',
    interviewDate: '2023-08-08',
    interviewer: '美食文化记者小冯',
    crafts: ['cooking', 'herbal'],
    summary: '陈阿姨的农家乐以"节气菜"闻名，她做的"立秋咬秋宴"吸引了众多食客慕名而来。',
    content: '采访者：陈阿姨，今天是立秋，您准备了什么特别的菜？\n\n陈立秋：今天是立秋，我们这里讲究"贴秋膘"。我准备了红烧肉、酱肘子，还有我们南方人爱吃的"立秋咬秋"——吃西瓜。\n\n采访者：什么是"咬秋"？\n\n陈立秋："咬秋"也叫"啃秋"，就是立秋这天吃西瓜。据说可以不生秋痱子，整个秋天都不拉肚子。老人们常说"立秋啃西瓜，冬天不生病"。\n\n采访者：您的农家乐为什么主打节气菜？\n\n陈立秋：我觉得，什么季节吃什么东西，这是老祖宗的智慧。春天吃春笋，夏天吃莲藕，秋天吃板栗，冬天吃萝卜，顺应天时，身体才会健康。\n\n采访者：您最拿手的节气菜是什么？\n\n陈立秋：应该是"清明团子"和"重阳糕"吧。这些都是我们这里的传统节令食品，我做的方法是从我婆婆那里传下来的，已经有一百多年历史了。',
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
