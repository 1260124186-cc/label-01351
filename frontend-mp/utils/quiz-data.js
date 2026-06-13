// utils/quiz-data.js - 文化知识问答题库数据

const QUIZ_CATEGORIES = [
  { id: 'folklore', name: '民俗文化', icon: '🎭', desc: '传统节日、民间习俗、神话传说' },
  { id: 'farming', name: '农耕智慧', icon: '🌾', desc: '二十四节气、农谚、耕作技艺' },
  { id: 'craft', name: '传统技艺', icon: '🧵', desc: '刺绣、编织、木作、陶艺等' },
  { id: 'history', name: '历史典故', icon: '📜', desc: '历史事件、人物故事、成语典故' },
  { id: 'art', name: '文学艺术', icon: '🎨', desc: '诗词歌赋、书画戏曲、音乐舞蹈' },
  { id: 'custom', name: '饮食起居', icon: '🍜', desc: '传统饮食、建筑服饰、生活习俗' }
];

const DIFFICULTY_LEVELS = [
  { id: 'easy', name: '入门', score: 1, color: '#52C41A' },
  { id: 'medium', name: '进阶', score: 2, color: '#1890FF' },
  { id: 'hard', name: '挑战', score: 3, color: '#FA8C16' },
  { id: 'expert', name: '大师', score: 5, color: '#F5222D' }
];

const getCategoryInfo = (categoryId) => {
  return QUIZ_CATEGORIES.find(c => c.id === categoryId) || { id: categoryId, name: '未知分类', icon: '📚' };
};

const getDifficultyInfo = (difficultyId) => {
  return DIFFICULTY_LEVELS.find(d => d.id === difficultyId) || { id: difficultyId, name: '未知难度', score: 1 };
};

const DEFAULT_QUIZZES = [
  {
    id: 'quiz_001',
    question: '端午节是为了纪念哪位历史人物？',
    options: ['A. 岳飞', 'B. 屈原', 'C. 李白', 'D. 杜甫'],
    answer: 1,
    analysis: '端午节是中国传统节日，最初是祛病防疫的节日，后因纪念战国时期楚国诗人屈原而逐渐演变。屈原在五月初五投汨罗江自尽，百姓为了寄托哀思，荡舟江河之上，此后才逐渐发展成为龙舟竞赛；百姓又怕江河里的鱼吃掉他的身体，就纷纷回家拿来米团投入江中，以免鱼虾糟蹋屈原的尸体，后来就成了吃粽子的习俗。',
    category: 'folklore',
    difficulty: 'easy',
    relatedArticleIds: ['article_004']
  },
  {
    id: 'quiz_002',
    question: '二十四节气中，哪个节气表示春天的开始？',
    options: ['A. 雨水', 'B. 春分', 'C. 立春', 'D. 惊蛰'],
    answer: 2,
    analysis: '立春是二十四节气中的第一个节气，通常在每年的2月3日至5日之间。"立"是开始的意思，立春标志着春季的开始，意味着万物闭藏的冬季已过去，开始进入风和日暖、万物生长的春季。',
    category: 'farming',
    difficulty: 'easy',
    relatedArticleIds: ['article_005']
  },
  {
    id: 'quiz_003',
    question: '"春雨惊春清谷天"中的"清"指的是哪个节气？',
    options: ['A. 立夏', 'B. 清明', 'C. 大寒', 'D. 立秋'],
    answer: 1,
    analysis: '这是二十四节气歌的第一句：春雨惊春清谷天，夏满芒夏暑相连，秋处露秋寒霜降，冬雪雪冬小大寒。其中的"清"指的是清明节气，大约在每年4月4日至6日，是祭祖扫墓、踏青郊游的传统节日。',
    category: 'farming',
    difficulty: 'medium',
    relatedArticleIds: ['article_005']
  },
  {
    id: 'quiz_004',
    question: '苏绣的发源地是哪里？',
    options: ['A. 湖南长沙', 'B. 江苏苏州', 'C. 四川成都', 'D. 广东广州'],
    answer: 1,
    analysis: '苏绣是中国四大名绣之一，起源于江苏苏州，故名苏绣。苏绣以图案秀丽、色彩和谐、线条明快、针法活泼、绣工精细的地方风格著称，被誉为"东方明珠"。与湖南的湘绣、四川的蜀绣、广东的粤绣并称为中国四大名绣。',
    category: 'craft',
    difficulty: 'easy',
    relatedArticleIds: ['article_002']
  },
  {
    id: 'quiz_005',
    question: '成语"画蛇添足"出自以下哪部著作？',
    options: ['A. 《史记》', 'B. 《庄子》', 'C. 《战国策》', 'D. 《论语》'],
    answer: 2,
    analysis: '"画蛇添足"出自《战国策·齐策二》。故事讲述楚国一位贵族祭祀祖先后，赏给门客一壶酒。门客们商议比赛画蛇，先画成者喝酒。一人先画完，见其他人还在画，便给蛇添上脚，结果被后画完的人以"蛇本无足"为由夺去了酒。比喻做了多余的事，反而把事情弄坏。',
    category: 'history',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_006',
    question: '"但愿人长久，千里共婵娟"是谁的诗句？',
    options: ['A. 李清照', 'B. 苏轼', 'C. 辛弃疾', 'D. 陆游'],
    answer: 1,
    analysis: '这句词出自北宋文学家苏轼的《水调歌头·明月几时有》。这首词是苏轼在中秋佳节思念弟弟苏辙时所作，"婵娟"指月亮。全词借月抒怀，表达了对亲人的思念和美好的祝愿，是中国文学史上描写中秋节最著名的作品之一。',
    category: 'art',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_007',
    question: '榫卯结构是中国传统建筑和家具中的什么工艺？',
    options: ['A. 雕刻工艺', 'B. 连接工艺', 'C. 上漆工艺', 'D. 打磨工艺'],
    answer: 1,
    analysis: '榫卯（sǔn mǎo）是古代中国建筑、家具及其它器械的主要结构方式，是在两个构件上采用凹凸部位相结合的一种连接方式。凸出部分叫榫（或叫榫头），凹进部分叫卯（或叫榫眼、榫槽）。其特点是在物件上不使用钉子，利用榫卯加固物件，体现出中国古老的文化和智慧。',
    category: 'craft',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_008',
    question: '中国传统饮食中，饺子通常在哪两个节日食用？',
    options: ['A. 清明节和中秋节', 'B. 端午节和重阳节', 'C. 春节和冬至', 'D. 元宵节和腊八节'],
    answer: 2,
    analysis: '饺子是中国传统面食，通常在春节和冬至两个重要节日食用。除夕夜吃饺子取"更岁交子"之意，"子"为"子时"，交与"饺"谐音，有"喜庆团圆"和"吉祥如意"的意思。冬至吃饺子则相传与医圣张仲景有关，他在寒冬施舍"驱寒矫耳汤"（即饺子）救治冻伤百姓的耳朵，故有"冬至不端饺子碗，冻掉耳朵没人管"的民谚。',
    category: 'custom',
    difficulty: 'easy',
    relatedArticleIds: ['article_004']
  },
  {
    id: 'quiz_009',
    question: '京剧脸谱中，红色代表什么性格？',
    options: ['A. 奸诈多疑', 'B. 忠勇侠义', 'C. 粗豪暴躁', 'D. 刚烈正直'],
    answer: 1,
    analysis: '京剧脸谱是中国传统戏曲演员脸上的绘画，用于舞台演出时的化妆造型艺术。不同颜色的脸谱有不同的含义：红色象征忠勇侠义（如关羽）；白色象征奸诈多疑（如曹操）；黑色象征刚烈正直、勇猛鲁莽（如包拯、张飞）；黄色象征凶狠残暴（如典韦）；蓝色象征桀骜不驯（如窦尔敦）。',
    category: 'art',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_010',
    question: '"不惑之年"指的是多少岁？',
    options: ['A. 三十岁', 'B. 四十岁', 'C. 五十岁', 'D. 六十岁'],
    answer: 1,
    analysis: '"不惑之年"出自《论语·为政》："吾十有五而志于学，三十而立，四十而不惑，五十而知天命，六十而耳顺，七十而从心所欲，不逾矩。"因此三十岁为"而立之年"，四十岁为"不惑之年"，五十岁为"知天命"，六十岁为"耳顺之年"或"花甲之年"，七十岁为"古稀之年"。',
    category: 'history',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_011',
    question: '以下哪项不属于中国传统四大发明？',
    options: ['A. 造纸术', 'B. 地动仪', 'C. 火药', 'D. 印刷术'],
    answer: 1,
    analysis: '中国古代四大发明是指造纸术、指南针、火药和印刷术（一说为活字印刷术）。地动仪是东汉科学家张衡发明的用于测定地震方位的仪器，虽然也是伟大的发明创造，但不属于传统"四大发明"的范畴。',
    category: 'history',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_012',
    question: '客家人建造的传统民居建筑是？',
    options: ['A. 四合院', 'B. 吊脚楼', 'C. 土楼', 'D. 窑洞'],
    answer: 2,
    analysis: '土楼是客家人独特的传统民居建筑，主要分布在福建、广东、江西等地。土楼以生土为主要建筑材料，掺上石灰、细砂、糯米饭、红糖、竹片、木条等，经反复揉、舂、压建造而成。土楼一般高三至五层，一层为厨房，二层为仓库，三层以上为起居室，可居住数十人甚至上百人，具有聚族而居、防盗、防震、防兽、防火、防潮、通风采光、冬暖夏凉等特点。',
    category: 'custom',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_013',
    question: '"孟母三迁"的故事说明了什么道理？',
    options: ['A. 孝敬父母', 'B. 环境对人的成长很重要', 'C. 勤奋学习', 'D. 谦虚谨慎'],
    answer: 1,
    analysis: '"孟母三迁"出自西汉刘向的《列女传》，讲述了孟子的母亲为了给孟子选择良好的教育环境，三次迁居的故事。最初住在墓地旁边，孟子学了些祭拜之类的事；搬到集市旁，孟子又学了些做买卖和屠杀的东西；最后搬到学宫旁边，孟子开始学习礼节和读书。这个故事说明环境对一个人的成长和教育至关重要。',
    category: 'history',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_014',
    question: '传统手工艺"扎染"主要使用的防染材料是什么？',
    options: ['A. 蜡', 'B. 线绳', 'C. 胶水', 'D. 泥巴'],
    answer: 1,
    analysis: '扎染古称扎缬、绞缬，是中国民间传统而独特的染色工艺。织物在染色时部分结扎起来使之不能着色的一种染色方法。扎染工艺分为扎结和染色两部分，它是通过纱、线、绳等工具，对织物进行扎、缝、缚、缀、夹等多种形式组合后进行染色，从而使织物呈现出各种深浅变化的花纹图案。蜡染用的是蜡，与扎染不同。',
    category: 'craft',
    difficulty: 'hard',
    relatedArticleIds: ['article_002']
  },
  {
    id: 'quiz_015',
    question: '以下哪句农谚的意思是"清明前后适合种瓜种豆"？',
    options: ['A. 清明前后，点瓜种豆', 'B. 立春雨水到，早起晚睡觉', 'C. 春分有雨家家忙', 'D. 谷雨前后，种瓜点豆'],
    answer: 0,
    analysis: '"清明前后，点瓜种豆"是一句广为流传的农谚，意思是清明节（4月4日至6日）前后，气温升高，雨量增多，正是春耕春种的大好时节，适合种植瓜类、豆类等农作物。这体现了中国古代劳动人民根据二十四节气安排农业生产的智慧。"谷雨前后，种瓜点豆"也是类似说法，但一般认为清明时节更适合瓜豆播种。',
    category: 'farming',
    difficulty: 'medium',
    relatedArticleIds: ['article_001', 'article_005']
  },
  {
    id: 'quiz_016',
    question: '"卧薪尝胆"讲述的是哪位历史人物的故事？',
    options: ['A. 吴王夫差', 'B. 越王勾践', 'C. 齐桓公', 'D. 晋文公'],
    answer: 1,
    analysis: '"卧薪尝胆"出自《史记·越王勾践世家》，讲述了春秋时期越王勾践战败被吴国俘虏后，忍辱负重，回国后睡在柴草上（卧薪），每天尝一尝苦胆（尝胆），激励自己不忘耻辱，发愤图强，最终经过十年的积聚力量，终于灭掉吴国、报仇雪恨的故事。这个成语后用来形容人刻苦自励、发奋图强。',
    category: 'history',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_017',
    question: '中国传统乐器中，属于弹拨乐器的是？',
    options: ['A. 笛子', 'B. 古筝', 'C. 二胡', 'D. 鼓'],
    answer: 1,
    analysis: '中国民族乐器按演奏方式可分为四大类：吹管乐器（笛子、箫、笙、唢呐等）、拉弦乐器（二胡、板胡、京胡等）、弹拨乐器（古筝、琵琶、古琴、扬琴等）和打击乐器（鼓、锣、钹等）。古筝是弹拨乐器中的代表，有2500年以上的历史，音色优美，表现力丰富，被誉为"东方钢琴"。',
    category: 'art',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_018',
    question: '以下哪种传统食品与纪念介子推有关？',
    options: ['A. 粽子', 'B. 月饼', 'C. 寒食（禁火吃冷食）', 'D. 年糕'],
    answer: 2,
    analysis: '寒食节在清明节前一二日，禁烟火，只吃冷食，是为了纪念春秋时期晋国忠臣介子推。据《史记》记载，晋文公重耳流亡国外时，介子推曾割股充饥。后重耳归国为君，介子推不愿争功受赏，携母隐居绵山。晋文公为逼其出山下令焚山，介子推母子抱树而死。为悼念介子推，晋文公下令在其忌日禁火寒食。',
    category: 'folklore',
    difficulty: 'hard',
    relatedArticleIds: ['article_004']
  },
  {
    id: 'quiz_019',
    question: '中国书法字体演变的正确顺序是？',
    options: ['A. 篆书→隶书→楷书→行书', 'B. 隶书→篆书→行书→楷书', 'C. 楷书→隶书→篆书→行书', 'D. 行书→楷书→隶书→篆书'],
    answer: 0,
    analysis: '中国书法字体的演变大致经历了以下过程：甲骨文（商代）→金文（周代）→篆书（秦代，分为大篆、小篆）→隶书（汉代，古隶→今隶）→草书（汉代，章草→今草→狂草）→楷书（魏晋南北朝至唐代成熟）→行书（魏晋时期，介于楷书和草书之间）。因此篆书→隶书→楷书→行书是基本正确的演变顺序。',
    category: 'art',
    difficulty: 'hard',
    relatedArticleIds: []
  },
  {
    id: 'quiz_020',
    question: '"年年岁岁花相似，岁岁年年人不同"出自哪部作品？',
    options: ['A. 张若虚《春江花月夜》', 'B. 刘希夷《代悲白头翁》', 'C. 李白《将进酒》', 'D. 杜甫《春望》'],
    answer: 1,
    analysis: '这两句诗出自初唐诗人刘希夷的《代悲白头翁》（一作《代白头吟》）。此诗抒发了对青春易逝、人生无常的感慨，其中"年年岁岁花相似，岁岁年年人不同"是千古名句，以花之常新对比人之衰老，对仗工整，意境深远。相传刘希夷的舅舅宋之问因喜爱此句，欲据为己有，竟害死刘希夷，这也成了文学史上的一桩公案。',
    category: 'art',
    difficulty: 'expert',
    relatedArticleIds: []
  },
  {
    id: 'quiz_021',
    question: '京剧《贵妃醉酒》是哪位京剧大师的梅派代表剧目？',
    options: ['A. 程砚秋', 'B. 梅兰芳', 'C. 荀慧生', 'D. 尚小云'],
    answer: 1,
    analysis: '《贵妃醉酒》又名《百花亭》，是京剧梅派代表剧目之一，由京剧大师梅兰芳精心打磨、演绎而成。该剧取材于唐朝杨贵妃的故事，表演细腻，歌舞并重，是梅派艺术的经典之作。梅兰芳、程砚秋、荀慧生、尚小云被誉为京剧"四大名旦"，分别创立了梅、程、荀、尚四大流派。',
    category: 'art',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_022',
    question: '昆曲《牡丹亭》的作者是谁？',
    options: ['A. 关汉卿', 'B. 王实甫', 'C. 汤显祖', 'D. 孔尚任'],
    answer: 2,
    analysis: '《牡丹亭》是明代剧作家汤显祖的代表作，也是昆曲最经典的剧目之一。全剧描写了杜丽娘与柳梦梅的爱情故事，体现了青年男女对自由爱情的追求。汤显祖被誉为"东方莎士比亚"，其作品还有《紫钗记》《邯郸记》《南柯记》，与《牡丹亭》合称"临川四梦"。关汉卿代表作《窦娥冤》，王实甫代表作《西厢记》，孔尚任代表作《桃花扇》。',
    category: 'art',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_023',
    question: '"原来姹紫嫣红开遍，似这般都付与断井颓垣"出自哪部戏曲？',
    options: ['A. 《西厢记》', 'B. 《牡丹亭》', 'C. 《桃花扇》', 'D. 《长生殿》'],
    answer: 1,
    analysis: '这是昆曲《牡丹亭·惊梦》中杜丽娘的经典唱段，曲牌为【皂罗袍】。杜丽娘在丫环春香的怂恿下到后花园春游，看到满园春色却无人欣赏，感叹自己的青春就像这美景一样被辜负，唱出了这段脍炙人口的唱腔。原文是："原来姹紫嫣红开遍，似这般都付与断井颓垣。良辰美景奈何天，赏心乐事谁家院！"',
    category: 'art',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_024',
    question: '豫剧《穆桂英挂帅》属于哪个地方剧种？',
    options: ['A. 河南', 'B. 河北', 'C. 山东', 'D. 山西'],
    answer: 0,
    analysis: '豫剧是河南省的主要地方剧种，也是中国五大戏曲剧种之一（京剧、豫剧、越剧、评剧、黄梅戏）。豫剧旧称"河南梆子""河南高调"，流行于河南及周边省份。《穆桂英挂帅》是豫剧经典剧目，由豫剧大师马金凤等主演，讲述了杨家将之媳穆桂英在国家危难之际毅然挂帅出征的故事。',
    category: 'art',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_025',
    question: '越剧《红楼梦》中，"天上掉下个林妹妹"是哪个角色的唱段？',
    options: ['A. 林黛玉', 'B. 贾宝玉', 'C. 薛宝钗', 'D. 王熙凤'],
    answer: 1,
    analysis: '"天上掉下个林妹妹"是越剧《红楼梦》中贾宝玉初见林黛玉时的经典唱段，属于尺调腔。全段为贾宝玉与林黛玉的对唱：贾宝玉唱"天上掉下个林妹妹，似一朵轻云刚出岫"，林黛玉接唱"只道他腹内草莽人轻浮，却原来骨格清奇非俗流"。这段唱腔生动地表现了宝黛初见时彼此的印象和好感。',
    category: 'art',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_026',
    question: '黄梅戏《天仙配》中"夫妻双双把家还"的故事发生在哪个省份？',
    options: ['A. 安徽', 'B. 湖南', 'C. 湖北', 'D. 江西'],
    answer: 0,
    analysis: '黄梅戏是安徽省的主要地方剧种，发源于湖北黄梅县，发展壮大于安徽安庆一带，是中国五大戏曲剧种之一。《天仙配》是黄梅戏的代表剧目，改编自民间传说，讲述了七仙女私自下凡与董永结为夫妻的爱情故事。"夫妻双双把家还"是全剧最著名的唱段。',
    category: 'art',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_027',
    question: '京剧脸谱中，白色脸谱通常代表什么性格特征？',
    options: ['A. 忠勇侠义', 'B. 刚烈正直', 'C. 奸诈多疑', 'D. 粗豪暴躁'],
    answer: 2,
    analysis: '京剧脸谱是中国传统戏曲特有的化妆造型艺术。不同颜色的脸谱有不同的含义：红色象征忠勇侠义（如关羽）；白色象征奸诈多疑（如曹操）；黑色象征刚烈正直、勇猛鲁莽（如包拯、张飞）；黄色象征凶狠残暴（如典韦）；蓝色象征桀骜不驯（如窦尔敦）；绿色象征鲁莽暴躁（如程咬金）；金色、银色多用于神佛鬼怪（如孙悟空、二郎神）。',
    category: 'art',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_028',
    question: '川剧表演中最具代表性的特技是什么？',
    options: ['A. 水袖功', 'B. 变脸', 'C. 翎子功', 'D. 矮子功'],
    answer: 1,
    analysis: '变脸是川剧表演的特技之一，是川剧最具代表性的艺术符号。变脸用于揭示剧中人物的内心及思想感情的变化，把不可见、不可感的抽象情绪和心理状态变成可见、可感的具体形象——脸谱。相传"变脸"是古代人类为了生存，把脸部用不同方式画出不同形态，以吓退野兽，后来演变为川剧艺术中的独门绝技。',
    category: 'art',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_029',
    question: '评书、相声属于以下哪类传统艺术？',
    options: ['A. 戏曲', 'B. 曲艺', 'C. 杂技', 'D. 舞蹈'],
    answer: 1,
    analysis: '评书、相声都属于曲艺，是中国说唱艺术的重要组成部分。曲艺是中华民族各种"说唱艺术"的统称，是由民间口头文学和歌唱艺术经过长期发展演变形成的一种独特的艺术形式，包括评书、相声、快板、京韵大鼓、评弹、二人转等数十个曲种。戏曲则是以唱、念、做、打为综合表演手段的舞台艺术形式，如京剧、昆曲、越剧等。',
    category: 'art',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_030',
    question: '京剧"四大名旦"不包括以下哪位？',
    options: ['A. 梅兰芳', 'B. 程砚秋', 'C. 谭鑫培', 'D. 尚小云'],
    answer: 2,
    analysis: '京剧"四大名旦"指的是梅兰芳、程砚秋、荀慧生、尚小云四位杰出的旦角表演艺术家。1927年，北京《顺天时报》举办评选"首届京剧旦角最佳演员"活动，梅、程、荀、尚四人当选，被誉为京剧"四大名旦"。谭鑫培是京剧老生行当的一代宗师，创立了谭派老生艺术，是"同光十三绝"之一，并非旦角演员。',
    category: 'art',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_031',
    question: '秦腔主要流行于我国哪个地区？',
    options: ['A. 陕西及西北', 'B. 四川及西南', 'C. 广东及岭南', 'D. 江浙及东南'],
    answer: 0,
    analysis: '秦腔是中国西北地区最古老的剧种之一，主要流行于陕西、甘肃、宁夏、青海、新疆等西北省区。秦腔因源于古代秦地（陕西一带）而得名，其表演粗犷豪放，唱腔高亢激昂，具有浓郁的西部特色。代表剧目有《三滴血》《火焰驹》《铡美案》等。四川流行川剧，广东流行粤剧，江浙流行越剧、昆曲等。',
    category: 'art',
    difficulty: 'easy',
    relatedArticleIds: []
  },
  {
    id: 'quiz_032',
    question: '"唱、念、做、打"在戏曲中被称为什么？',
    options: ['A. 四功', 'B. 五法', 'C. 六艺', 'D. 八法'],
    answer: 0,
    analysis: '"唱、念、做、打"是戏曲表演的四种基本艺术手段，被称为"四功"。唱指唱功，念指念白（音乐性的念白），做指身段、表情、做工，打指武打、翻跌等武技。与之配套的还有"五法"：手（手势）、眼（眼神）、身（身段）、法（方法、规律）、步（步法）。"四功五法"是戏曲演员的基本功。',
    category: 'art',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_033',
    question: '评弹是以下哪个地区的曲艺形式？',
    options: ['A. 北京', 'B. 天津', 'C. 江苏苏州', 'D. 东北'],
    answer: 2,
    analysis: '评弹是苏州评话和苏州弹词的合称，是流行于江苏南部、浙江北部、上海等地的曲艺形式，用苏州方言演唱。评话通常一人登台开讲，内容多为金戈铁马的历史演义；弹词一般两人说唱，上手持三弦，下手抱琵琶，内容多为儿女情长的传奇小说。二人转流行于东北，京韵大鼓、评书主要流行于北京天津一带。',
    category: 'art',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_034',
    question: '京剧《铡美案》中的主人公包拯属于哪个行当？',
    options: ['A. 生', 'B. 旦', 'C. 净', 'D. 丑'],
    answer: 2,
    analysis: '京剧行当分为生、旦、净、丑四大类。包拯（包公）属于"净"行，俗称"花脸"，以面部化妆勾画脸谱为主要特征。净行又分为正净（大花脸，唱功为主，如包拯、曹操）、副净（二花脸，做工为主）、武净（武花脸，武打为主）等。包拯脸谱为整脸黑色，象征其铁面无私、刚正不阿的性格。生指男性角色，旦指女性角色，丑指滑稽角色。',
    category: 'art',
    difficulty: 'medium',
    relatedArticleIds: []
  },
  {
    id: 'quiz_035',
    question: '"树上的鸟儿成双对，绿水青山带笑颜"出自哪部作品？',
    options: ['A. 越剧《红楼梦》', 'B. 黄梅戏《天仙配》', 'C. 豫剧《穆桂英挂帅》', 'D. 京剧《贵妃醉酒》'],
    answer: 1,
    analysis: '这是黄梅戏《天仙配》中最著名的对唱《夫妻双双把家还》的开头，由董永和七仙女对唱。全曲描绘了二人从傅员外家做工期满，返家途中的欢快心情和对未来美好生活的憧憬。"你耕田来我织布，我挑水来你浇园"更是表达了传统农耕社会中男耕女织的理想生活图景，是黄梅戏最广为人知的唱段。',
    category: 'art',
    difficulty: 'easy',
    relatedArticleIds: []
  }
];

module.exports = {
  QUIZ_CATEGORIES,
  DIFFICULTY_LEVELS,
  DEFAULT_QUIZZES,
  getCategoryInfo,
  getDifficultyInfo
};
