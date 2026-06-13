const util = require('./util');

const OPERA_CATEGORIES = [
  { id: 'opera', name: '戏曲', icon: '🎭', desc: '京剧、昆曲、豫剧、越剧等传统戏曲' },
  { id: 'quyi', name: '曲艺', icon: '🎤', desc: '评书、相声、快板、大鼓等说唱艺术' }
];

const OPERA_GENRES = [
  { id: 'beijing', name: '京剧', region: '北京', icon: '🎭', category: 'opera' },
  { id: 'kunqu', name: '昆曲', region: '江苏', icon: '🌸', category: 'opera' },
  { id: 'yuju', name: '豫剧', region: '河南', icon: '🎪', category: 'opera' },
  { id: 'yueju', name: '越剧', region: '浙江', icon: '🎐', category: 'opera' },
  { id: 'huangmeixi', name: '黄梅戏', region: '安徽', icon: '🌺', category: 'opera' },
  { id: 'pingju', name: '评剧', region: '河北', icon: '🎬', category: 'opera' },
  { id: 'qinqiang', name: '秦腔', region: '陕西', icon: '🏔️', category: 'opera' },
  { id: 'chuanju', name: '川剧', region: '四川', icon: '🐼', category: 'opera' },
  { id: 'yueju_guangdong', name: '粤剧', region: '广东', icon: '🌴', category: 'opera' },
  { id: 'pingshu', name: '评书', region: '北方', icon: '📖', category: 'quyi' },
  { id: 'xiangsheng', name: '相声', region: '北京', icon: '🎙️', category: 'quyi' },
  { id: 'kuaiban', name: '快板', region: '天津', icon: '🎵', category: 'quyi' },
  { id: 'dagu', name: '京韵大鼓', region: '北京', icon: '🥁', category: 'quyi' },
  { id: 'pingtan', name: '评弹', region: '江苏', icon: '🎸', category: 'quyi' },
  { id: 'errenzhuan', name: '二人转', region: '东北', icon: '💃', category: 'quyi' }
];

const REGIONS = [
  { id: 'beijing', name: '北京' },
  { id: 'tianjin', name: '天津' },
  { id: 'hebei', name: '河北' },
  { id: 'shanxi', name: '山西' },
  { id: 'neimenggu', name: '内蒙古' },
  { id: 'liaoning', name: '辽宁' },
  { id: 'jilin', name: '吉林' },
  { id: 'heilongjiang', name: '黑龙江' },
  { id: 'shanghai', name: '上海' },
  { id: 'jiangsu', name: '江苏' },
  { id: 'zhejiang', name: '浙江' },
  { id: 'anhui', name: '安徽' },
  { id: 'fujian', name: '福建' },
  { id: 'jiangxi', name: '江西' },
  { id: 'shandong', name: '山东' },
  { id: 'henan', name: '河南' },
  { id: 'hubei', name: '湖北' },
  { id: 'hunan', name: '湖南' },
  { id: 'guangdong', name: '广东' },
  { id: 'guangxi', name: '广西' },
  { id: 'hainan', name: '海南' },
  { id: 'chongqing', name: '重庆' },
  { id: 'sichuan', name: '四川' },
  { id: 'guizhou', name: '贵州' },
  { id: 'yunnan', name: '云南' },
  { id: 'xizang', name: '西藏' },
  { id: 'shaanxi', name: '陕西' },
  { id: 'gansu', name: '甘肃' },
  { id: 'qinghai', name: '青海' },
  { id: 'ningxia', name: '宁夏' },
  { id: 'xinjiang', name: '新疆' },
  { id: 'hongkong', name: '香港' },
  { id: 'macao', name: '澳门' },
  { id: 'taiwan', name: '台湾' }
];

const DEFAULT_OPERAS = [
  {
    id: 'opera_001',
    title: '贵妃醉酒',
    category: 'opera',
    genre: 'beijing',
    alias: ['百花亭'],
    introduction: '《贵妃醉酒》又名《百花亭》，是京剧梅派代表剧目之一。该剧取材于唐朝历史人物杨贵妃的故事，描写杨贵妃醉后自赏怀春的心态，表演细腻，歌舞并重，是梅派艺术的经典之作。',
    plotSummary: '唐玄宗先一日与杨贵妃约，命其设宴百花亭，同往赏花饮酒。至次日，杨贵妃遂先赴百花亭，备齐御筵候驾，孰意迟待移时，唐玄宗车驾竟不至。迟之久，迟之又久。乃忽报皇帝已幸江妃宫，杨贵妃闻讯，懊恼欲死。杨贵妃性本褊狭善妒，尤媚浪，且妇女于怨望之余，本最易生反应力。遂使万种情怀，一时竟难排遣，加以酒入愁肠，三杯亦醉，春情顿炽，忍俊不禁。于是竟忘其所以，放浪形骸，频频与高力士、裴力士二太监，作种种醉态，乃始倦极回宫。',
    representativeArias: [
      {
        id: 'aria_001',
        name: '海岛冰轮初转腾',
        role: '杨玉环（旦角）',
        text: '【四平调】海岛冰轮初转腾，见玉兔，玉兔又早东升。那冰轮离海岛，乾坤分外明。皓月当空，恰便似嫦娥离月宫，奴似嫦娥离月宫。',
        tune: '四平调'
      },
      {
        id: 'aria_002',
        name: '杨玉环在殿前深深拜定',
        role: '杨玉环（旦角）',
        text: '【二黄平板】杨玉环在殿前深深拜定，秉虔诚一件件祝告双星。一愿那钗与盒情缘永定，二愿那仁德君福寿康宁。三愿那海宇内风调雨顺，四愿那七巧缕乞天孙，在那支机石上，今日里借与奴身。',
        tune: '二黄平板'
      }
    ],
    heritageRegions: ['beijing', 'shanghai', 'tianjin'],
    inheritors: ['figure_007'],
    relatedTopics: [],
    relatedFigureIds: [],
    tags: ['梅派', '旦角', '经典剧目'],
    cover: '',
    viewCount: 1567,
    favoriteCount: 234,
    createTime: '2024-12-20',
    status: 1,
    isRare: false
  },
  {
    id: 'opera_002',
    title: '牡丹亭',
    category: 'opera',
    genre: 'kunqu',
    alias: ['还魂记'],
    introduction: '《牡丹亭》是明代剧作家汤显祖的代表作，也是昆曲最经典的剧目之一。全剧描写了杜丽娘与柳梦梅的爱情故事，体现了青年男女对自由爱情的追求，具有深刻的思想内涵和极高的艺术价值。',
    plotSummary: '贫寒书生柳梦梅梦见在一座花园的梅树下立着一位佳人，说同他有姻缘之分，从此经常思念她。南安太守杜宝之女名丽娘，才貌端妍，从师陈最良读书。她由《诗经·关雎》章而伤春寻春，从花园回来后在昏昏睡梦中见一书生持半枝垂柳前来求爱，两人在牡丹亭畔幽会。杜丽娘从此愁闷消瘦，一病不起。她在弥留之际要求母亲把她葬在花园的梅树下，嘱咐丫环春香将其自画像藏在太湖石底。其父升任淮阳安抚使，委托陈最良葬女并修建"梅花庵观"。三年后，柳梦梅赴京应试，借宿梅花庵观中，在太湖石下拾得杜丽娘画像，发现杜丽娘就是他梦中见到的佳人。杜丽娘魂游后园，和柳梦梅再度幽会。柳梦梅掘墓开棺，杜丽娘起死回生，两人结为夫妻，前往临安。',
    representativeArias: [
      {
        id: 'aria_003',
        name: '原来姹紫嫣红开遍',
        role: '杜丽娘（旦角）',
        text: '【皂罗袍】原来姹紫嫣红开遍，似这般都付与断井颓垣。良辰美景奈何天，赏心乐事谁家院！恁般景致，我老爷和奶奶再不提起。朝飞暮卷，云霞翠轩；雨丝风片，烟波画船——锦屏人忒看的这韶光贱！',
        tune: '南曲·仙吕宫'
      },
      {
        id: 'aria_004',
        name: '情不知所起',
        role: '杜丽娘（旦角）',
        text: '【山桃红】则为你如花美眷，似水流年，是答儿闲寻遍。在幽闺自怜。转过这芍药栏前，紧靠着湖山石边。和你把领扣松，衣带宽，袖梢儿揾着牙儿苫也，则待你忍耐温存一晌眠。',
        tune: '南曲·越调'
      }
    ],
    heritageRegions: ['jiangsu', 'shanghai', 'zhejiang'],
    inheritors: [],
    relatedTopics: [],
    relatedFigureIds: [],
    tags: ['昆曲', '汤显祖', '爱情', '经典'],
    cover: '',
    viewCount: 2345,
    favoriteCount: 567,
    createTime: '2024-12-18',
    status: 1,
    isRare: false
  },
  {
    id: 'opera_003',
    title: '穆桂英挂帅',
    category: 'opera',
    genre: 'yuju',
    alias: [],
    introduction: '《穆桂英挂帅》是豫剧经典剧目，由豫剧大师马金凤等主演。该剧讲述了北宋时期，杨家将之媳穆桂英在国家危难之际，毅然挂帅出征，保家卫国的故事，展现了巾帼英雄的豪迈气概。',
    plotSummary: '北宋时，西夏犯境。辞朝隐居的佘太君闻讯，遣曾孙杨文广、曾孙女杨金花去汴京探听。杨文广在校场比武，刀劈兵部尚书王强之子王伦，夺得帅印归来。穆桂英深感朝廷刻薄寡恩，不愿再为它效力。佘太君劝她以抵御西夏侵扰为重，穆桂英乃挂帅出征。',
    representativeArias: [
      {
        id: 'aria_005',
        name: '辕门外三声炮如同雷震',
        role: '穆桂英（旦角）',
        text: '【二八板】辕门外三声炮如同雷震，天波府里走出来我保国臣。头戴金冠压双鬓，当年的铁甲我又披上了身。帅字旗，飘入云，斗大的"穆"字震乾坤。上啊上写着，浑啊浑天侯，穆氏桂英，谁料想我五十三岁又管三军。',
        tune: '二八板'
      }
    ],
    heritageRegions: ['henan', 'shandong', 'hebei'],
    inheritors: [],
    relatedTopics: [],
    relatedFigureIds: [],
    tags: ['豫剧', '杨家将', '巾帼英雄'],
    cover: '',
    viewCount: 1890,
    favoriteCount: 345,
    createTime: '2024-12-15',
    status: 1,
    isRare: false
  },
  {
    id: 'opera_004',
    title: '红楼梦',
    category: 'opera',
    genre: 'yueju',
    alias: [],
    introduction: '越剧《红楼梦》根据曹雪芹同名小说改编，是越剧的经典保留剧目。该剧以贾宝玉与林黛玉的爱情悲剧为主线，展现了贾、史、王、薛四大家族的兴衰，具有极高的艺术成就。',
    plotSummary: '林黛玉幼失双亲，寄居外祖母家，与表兄贾宝玉心心相印，志趣相投。薛宝钗也寄居贾府，端庄贤淑，深得贾府上下欢心。宝玉与黛玉虽情深意重，但黛玉性格孤高多疑，常与宝玉发生误会。后宝玉失玉疯癫，贾母等人设计"掉包计"，让宝玉娶宝钗。黛玉闻知此事，病势沉重，焚稿断痴情，含恨而终。宝玉成亲后发现被骗，悲痛欲绝，最终看破红尘，出家为僧。',
    representativeArias: [
      {
        id: 'aria_006',
        name: '天上掉下个林妹妹',
        role: '贾宝玉（小生）、林黛玉（旦角）',
        text: '【尺调腔】贾宝玉：天上掉下个林妹妹，似一朵轻云刚出岫。林黛玉：只道他腹内草莽人轻浮，却原来骨格清奇非俗流。贾宝玉：娴静犹如花照水，行动好比风扶柳。林黛玉：眉梢眼角藏秀气，声音笑貌露温柔。贾宝玉：眼前分明外来客，心底却似旧时友。',
        tune: '尺调腔'
      },
      {
        id: 'aria_007',
        name: '黛玉葬花',
        role: '林黛玉（旦角）',
        text: '【弦下调】花谢花飞飞满天，红消香断有谁怜？游丝软系飘春榭，落絮轻沾扑绣帘。一年三百六十日，风刀霜剑严相逼。明媚鲜妍能几时，一朝漂泊难寻觅。花开易见落难寻，阶前愁煞葬花人。独把花锄偷洒泪，洒上空枝见血痕。',
        tune: '弦下调'
      }
    ],
    heritageRegions: ['zhejiang', 'shanghai', 'jiangsu'],
    inheritors: [],
    relatedTopics: [],
    relatedFigureIds: [],
    tags: ['越剧', '红楼梦', '经典'],
    cover: '',
    viewCount: 2567,
    favoriteCount: 678,
    createTime: '2024-12-12',
    status: 1,
    isRare: false
  },
  {
    id: 'opera_005',
    title: '天仙配',
    category: 'opera',
    genre: 'huangmeixi',
    alias: [],
    introduction: '《天仙配》是黄梅戏的代表剧目，改编自民间传说。该剧讲述了七仙女不顾天规，私自下凡与董永结为夫妻的爱情故事，是黄梅戏最经典的作品之一。',
    plotSummary: '玉帝的第七个女儿——七仙女，在天宫寂寞难耐。一日，她与众姐游鹊桥，窥见人间的董永卖身葬父，深受感动，便不顾天规森严，私下凡间，与董永在槐树下结为夫妻。婚后，七仙女为帮董永赎身，同到傅员外家做工。百日期满，二人返家途中，玉帝降旨，命七仙女立返天宫。七仙女忍痛与董永诀别，在槐荫树上留下"来年春暖花开日，槐荫树下把子交"的誓言，返回天庭。',
    representativeArias: [
      {
        id: 'aria_008',
        name: '夫妻双双把家还',
        role: '董永（小生）、七仙女（旦角）',
        text: '【平词】七仙女：树上的鸟儿成双对，董永：绿水青山带笑颜。七仙女：从今不再受那奴役苦，董永：夫妻双双把家还。七仙女：你耕田来我织布，董永：我挑水来你浇园。七仙女：寒窑虽破能避风雨，董永：夫妻恩爱苦也甜。合：你我好比鸳鸯鸟，比翼双飞在人间。',
        tune: '平词'
      }
    ],
    heritageRegions: ['anhui', 'hubei', 'jiangxi'],
    inheritors: [],
    relatedTopics: [],
    relatedFigureIds: [],
    tags: ['黄梅戏', '神话', '爱情'],
    cover: '',
    viewCount: 2134,
    favoriteCount: 456,
    createTime: '2024-12-10',
    status: 1,
    isRare: false
  },
  {
    id: 'opera_006',
    title: '三国演义（评书）',
    category: 'quyi',
    genre: 'pingshu',
    alias: [],
    introduction: '评书《三国演义》是袁阔成、单田芳等评书大师的经典之作。评书以三国时期的历史为背景，讲述了魏、蜀、吴三国之间的政治斗争和军事冲突，塑造了诸葛亮、关羽、曹操等众多栩栩如生的人物形象。',
    plotSummary: '东汉末年，朝政腐败，民不聊生。黄巾起义爆发后，各地军阀拥兵自重，逐鹿中原。刘备、关羽、张飞桃园三结义，立志匡扶汉室。刘备三顾茅庐，请出诸葛亮辅佐。诸葛亮舌战群儒，促成孙刘联盟，赤壁之战大败曹操，奠定三国鼎立的基础。此后，刘备取西川，建蜀汉；曹丕废汉立魏；孙权建东吴。三国之间征战不休，诸葛亮六出祁山北伐中原，病逝五丈原。最终司马懿掌权，三国归晋。',
    representativeArias: [
      {
        id: 'aria_009',
        name: '开篇',
        role: '评书艺人',
        text: '滚滚长江东逝水，浪花淘尽英雄。是非成败转头空，青山依旧在，几度夕阳红。白发渔樵江渚上，惯看秋月春风。一壶浊酒喜相逢，古今多少事，都付笑谈中。话说天下大势，分久必合，合久必分。',
        tune: '评书定场诗'
      },
      {
        id: 'aria_010',
        name: '三顾茅庐',
        role: '评书艺人',
        text: '话说刘备带着关羽、张飞，二番前往隆中请诸葛亮出山。谁知先生又不在家，三人只能败兴而归。这一日，刘备选了个黄道吉日，斋戒三日，沐浴更衣，第三次来至卧龙岗。这一去，才引出一段"隆中对"，定下天下三分的大计。',
        tune: '评书散白'
      }
    ],
    heritageRegions: ['beijing', 'tianjin', 'liaoning'],
    inheritors: ['figure_007'],
    relatedTopics: [],
    relatedFigureIds: ['figure_007'],
    tags: ['评书', '历史', '经典'],
    cover: '',
    viewCount: 3456,
    favoriteCount: 789,
    createTime: '2024-12-08',
    status: 1,
    isRare: false
  },
  {
    id: 'opera_007',
    title: '变脸',
    category: 'opera',
    genre: 'chuanju',
    alias: [],
    introduction: '川剧变脸是川剧表演的特技之一，用于揭示剧中人物的内心及思想感情的变化。《变脸》是川剧的代表剧目，讲述了老艺人"水上漂"与狗娃之间的感人故事。',
    plotSummary: '在江湖上闯荡多年的老艺人"水上漂"身怀变脸绝技，却因没有传人而深感忧虑。他花重金买下了被人贩子拐卖的男孩狗娃，准备将变脸绝技传给他。不料狗娃竟是女孩，这让一心要传男不传女的水上漂陷入了痛苦和矛盾之中。最终，狗娃用她的真诚和勇敢打动了水上漂，水上漂打破了陈规陋习，将变脸绝技传给了狗娃。',
    representativeArias: [
      {
        id: 'aria_011',
        name: '变脸绝技',
        role: '水上漂（丑角）',
        text: '【昆腔】祖传绝技数变脸，一张脸谱一片天。红橙黄绿青蓝紫，喜怒哀乐瞬息间。莫道戏法皆虚妄，人生如戏亦如幻。',
        tune: '昆腔'
      }
    ],
    heritageRegions: ['sichuan', 'chongqing'],
    inheritors: [],
    relatedTopics: [],
    relatedFigureIds: [],
    tags: ['川剧', '变脸', '非遗'],
    cover: '',
    viewCount: 1789,
    favoriteCount: 321,
    createTime: '2024-12-05',
    status: 1,
    isRare: false
  },
  {
    id: 'opera_008',
    title: '铡美案',
    category: 'opera',
    genre: 'beijing',
    alias: ['秦香莲'],
    introduction: '《铡美案》又名《秦香莲》，是京剧传统经典剧目。该剧讲述了北宋年间，陈世美中状元后抛妻弃子，招为驸马，原配秦香莲进京寻夫，包拯秉公执法，铡死陈世美的故事。',
    plotSummary: '北宋年间，陈世美进京应试，考中状元，被招驸马。其家乡连年荒旱，父母去世，前妻秦香莲携儿女进京寻夫。陈世美不仅不认，反而派韩琪追杀灭口。韩琪不忍，自刎身亡。秦香莲愤而告状，包拯不顾皇姑、太后阻拦，秉公执法，将陈世美用龙头铡铡死。',
    representativeArias: [
      {
        id: 'aria_012',
        name: '包龙图打坐在开封府',
        role: '包拯（净角）',
        text: '【西皮导板】包龙图打坐在开封府，【原板】尊一声驸马爷细听端的：曾记得端午日朝贺天子，我与你在朝房曾把话提。说起了招赘事你神色不定，我料你在家中定有前妻。到如今果不然内中有弊，将驸马莫当做小儿嬉戏。',
        tune: '西皮导板转原板'
      },
      {
        id: 'aria_013',
        name: '秦香莲住均州',
        role: '秦香莲（旦角）',
        text: '【二黄慢板】秦香莲住均州广湖地界，离城十里陈家村上住。我公爹名叫陈宗远，婆母娘康氏年迈之人。所生我夫陈世美，大比之年去求名。他得中高魁招驸马，一去三载不回程。',
        tune: '二黄慢板'
      }
    ],
    heritageRegions: ['beijing', 'tianjin', 'shanghai'],
    inheritors: [],
    relatedTopics: [],
    relatedFigureIds: [],
    tags: ['京剧', '包拯', '公案戏'],
    cover: '',
    viewCount: 1654,
    favoriteCount: 289,
    createTime: '2024-12-03',
    status: 1,
    isRare: false
  },
  {
    id: 'opera_009',
    title: '白蛇传',
    category: 'opera',
    genre: 'beijing',
    alias: [],
    introduction: '《白蛇传》是京剧、昆曲等多个剧种的经典剧目。该剧讲述了白娘子与许仙的爱情故事，是中国四大民间传说之一。',
    plotSummary: '峨眉山千年蛇妖白素贞与侍女小青下山游春，在西湖断桥遇书生许仙，两人一见钟情，结为夫妻。金山寺法海禅师认定白素贞为妖，几次三番拆散二人。端午节白素贞误饮雄黄酒，现出蛇形，吓死许仙。白素贞盗仙草救夫，与仙童大战。后法海将许仙诓至金山寺，白素贞水漫金山，与法海斗法。断桥重逢，夫妻和好。最终白素贞被法海压在雷峰塔下。',
    representativeArias: [
      {
        id: 'aria_014',
        name: '青妹慢举龙泉宝剑',
        role: '白素贞（旦角）',
        text: '【西皮散板】青妹慢举龙泉宝剑，妻把真情对你言。你妻不是凡间女，妻本是峨眉山一蛇仙。只为思凡把山下，与青儿来到西湖边。风雨途中识郎面，多蒙借伞结良缘。',
        tune: '西皮散板'
      },
      {
        id: 'aria_015',
        name: '水漫金山',
        role: '白素贞（旦角）',
        text: '【二黄导板】为救许郎金山走，【回龙】恨法海，做事歹，恶狠狠，要把夫妻两分开。【反二黄慢板】我本是白府千金女，峨眉山前把道修。千年修行成正果，只为思凡下山丘。',
        tune: '二黄导板回龙转反二黄'
      }
    ],
    heritageRegions: ['beijing', 'shanghai', 'jiangsu'],
    inheritors: [],
    relatedTopics: [],
    relatedFigureIds: [],
    tags: ['京剧', '神话', '爱情'],
    cover: '',
    viewCount: 1987,
    favoriteCount: 432,
    createTime: '2024-12-01',
    status: 1,
    isRare: false
  },
  {
    id: 'opera_010',
    title: '秦腔·三滴血',
    category: 'opera',
    genre: 'qinqiang',
    alias: [],
    introduction: '《三滴血》是秦腔的经典剧目，由陕西易俗社创作。该剧通过三个滴血认亲的故事，批判了封建迷信，歌颂了实事求是精神。',
    plotSummary: '山西人周仁瑞在陕西经商，妻一胎产二子，不幸病故。因无力抚养，将次子卖于李三娘，取名李遇春。长子周天佑由乳母抚养。后周仁瑞带天佑回归故里。贾氏告周仁瑞买子，县令晋信书以滴血认亲之法断案，判天佑非周仁瑞亲生。天佑被逐，遇猛虎，为樵女贾莲香所救。李遇春与表姐李晚春相爱，但因滴血认亲被认为是亲姐弟，不能成婚。最终真相大白，姐弟团圆。',
    representativeArias: [
      {
        id: 'aria_016',
        name: '祖籍陕西韩城县',
        role: '周天佑（小生）',
        text: '【二六板】祖籍陕西韩城县，杏花村中有家园。姐弟姻缘生了变，堂上滴血蒙屈冤。姐入牢笼她又逃窜，大料她逃难到此间。为寻亲哪顾得路途遥远，登山涉水到蒲关。',
        tune: '二六板'
      }
    ],
    heritageRegions: ['shaanxi', 'gansu', 'ningxia'],
    inheritors: [],
    relatedTopics: [],
    relatedFigureIds: [],
    tags: ['秦腔', '经典', '易俗社'],
    cover: '',
    viewCount: 876,
    favoriteCount: 156,
    createTime: '2024-11-28',
    status: 1,
    isRare: true
  }
];

const getCategoryInfo = (categoryId) => {
  return OPERA_CATEGORIES.find(c => c.id === categoryId) || { id: categoryId, name: '未知分类', icon: '📚' };
};

const getGenreInfo = (genreId) => {
  return OPERA_GENRES.find(g => g.id === genreId) || { id: genreId, name: '未知', icon: '🎭' };
};

const getGenreName = (genreId) => {
  const genre = OPERA_GENRES.find(g => g.id === genreId);
  return genre ? genre.name : '未知';
};

const getGenreNames = (genreIds) => {
  if (!genreIds || !Array.isArray(genreIds)) return [];
  return genreIds.map(id => getGenreName(id)).filter(name => name !== '未知');
};

const getRegionName = (regionId) => {
  const region = REGIONS.find(r => r.id === regionId);
  return region ? region.name : '未知';
};

const getRegionNames = (regionIds) => {
  if (!regionIds || !Array.isArray(regionIds)) return [];
  return regionIds.map(id => getRegionName(id)).filter(name => name !== '未知');
};

const getGenresByCategory = (categoryId) => {
  if (!categoryId || categoryId === 'all') return OPERA_GENRES;
  return OPERA_GENRES.filter(g => g.category === categoryId);
};

const initOperaData = () => {
  const operas = wx.getStorageSync('operas');
  if (!operas || operas.length === 0) {
    wx.setStorageSync('operas', DEFAULT_OPERAS);
    console.log('[OperaData] 初始化戏曲数据完成，共 ' + DEFAULT_OPERAS.length + ' 条');
  }

  const operaDrafts = wx.getStorageSync('operaDrafts');
  if (!operaDrafts) {
    wx.setStorageSync('operaDrafts', []);
    console.log('[OperaData] 初始化戏曲草稿数据完成');
  }

  const operaFavorites = wx.getStorageSync('operaFavorites');
  if (!operaFavorites) {
    wx.setStorageSync('operaFavorites', {});
    console.log('[OperaData] 初始化戏曲收藏数据完成');
  }

  const ariaFavorites = wx.getStorageSync('ariaFavorites');
  if (!ariaFavorites) {
    wx.setStorageSync('ariaFavorites', {});
    console.log('[OperaData] 初始化唱段收藏数据完成');
  }
};

const filterOperas = (operas, filters = {}) => {
  let result = [...operas];
  const { category, genre, region, keyword, isRare } = filters;

  result = result.filter(item => item.status === 1);

  if (category && category !== 'all') {
    result = result.filter(item => item.category === category);
  }

  if (genre && genre !== 'all') {
    result = result.filter(item => item.genre === genre);
  }

  if (region && region !== 'all') {
    result = result.filter(item =>
      Array.isArray(item.heritageRegions) && item.heritageRegions.includes(region)
    );
  }

  if (isRare === true) {
    result = result.filter(item => item.isRare === true);
  }

  if (keyword && keyword.trim()) {
    const kw = keyword.toLowerCase().trim();
    result = result.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(kw);
      const introMatch = (item.introduction || '').toLowerCase().includes(kw);
      const aliasMatch = Array.isArray(item.alias) && item.alias.some(a => a.toLowerCase().includes(kw));
      const tagsMatch = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(kw));
      const genreMatch = getGenreName(item.genre).toLowerCase().includes(kw);
      const ariaMatch = Array.isArray(item.representativeArias) &&
        item.representativeArias.some(aria =>
          aria.name.toLowerCase().includes(kw) ||
          aria.text.toLowerCase().includes(kw)
        );
      return titleMatch || introMatch || aliasMatch || tagsMatch || genreMatch || ariaMatch;
    });
  }

  return result;
};

const getDailyOpera = () => {
  const operas = wx.getStorageSync('operas') || [];
  const validOperas = operas.filter(item => item.status === 1);
  if (validOperas.length === 0) return null;

  const today = util.formatDate(new Date(), 'YYYY-MM-DD');
  const dailyKey = 'dailyOpera_' + today;
  const cached = wx.getStorageSync(dailyKey);

  if (cached) return cached;

  const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);
  const index = seed % validOperas.length;
  const dailyOpera = validOperas[index];

  wx.setStorageSync(dailyKey, dailyOpera);
  return dailyOpera;
};

const getDailyAria = () => {
  const operas = wx.getStorageSync('operas') || [];
  const validOperas = operas.filter(item => item.status === 1 && Array.isArray(item.representativeArias) && item.representativeArias.length > 0);
  if (validOperas.length === 0) return null;

  const today = util.formatDate(new Date(), 'YYYY-MM-DD');
  const dailyKey = 'dailyAria_' + today;
  const cached = wx.getStorageSync(dailyKey);

  if (cached) return cached;

  const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);
  const operaIndex = seed % validOperas.length;
  const opera = validOperas[operaIndex];
  const ariaIndex = seed % opera.representativeArias.length;
  const dailyAria = {
    ...opera.representativeArias[ariaIndex],
    operaId: opera.id,
    operaTitle: opera.title,
    genre: opera.genre,
    genreName: getGenreName(opera.genre)
  };

  wx.setStorageSync(dailyKey, dailyAria);
  return dailyAria;
};

const getOperaById = (id) => {
  if (!id) return null;
  const operas = wx.getStorageSync('operas') || [];
  return operas.find(item => item.id === id) || null;
};

const getAriaById = (operaId, ariaId) => {
  const opera = getOperaById(operaId);
  if (!opera || !Array.isArray(opera.representativeArias)) return null;
  return opera.representativeArias.find(a => a.id === ariaId) || null;
};

const searchOperasFullText = (operas, keyword) => {
  if (!keyword || !keyword.trim()) return operas || [];
  return filterOperas(operas, { keyword });
};

const highlightKeyword = (text, keyword) => {
  if (!text || !keyword) return text || '';
  const kw = keyword.trim();
  if (!kw) return text;
  const regex = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '{{{$1}}}');
};

const getRelatedOperasByFigure = (figureId, limit = 5) => {
  if (!figureId) return [];
  const operas = wx.getStorageSync('operas') || [];
  const related = operas.filter(item =>
    item.status === 1 &&
    (
      (Array.isArray(item.inheritors) && item.inheritors.includes(figureId)) ||
      (Array.isArray(item.relatedFigureIds) && item.relatedFigureIds.includes(figureId))
    )
  );
  return related.slice(0, limit);
};

const getRelatedOperasByTopic = (topicId, limit = 5) => {
  if (!topicId) return [];
  const operas = wx.getStorageSync('operas') || [];
  const related = operas.filter(item =>
    item.status === 1 &&
    Array.isArray(item.relatedTopics) &&
    item.relatedTopics.includes(topicId)
  );
  return related.slice(0, limit);
};

const getOperasByGenre = (genreId, limit = 10) => {
  if (!genreId) return [];
  const operas = wx.getStorageSync('operas') || [];
  return operas.filter(item => item.status === 1 && item.genre === genreId).slice(0, limit);
};

const getRareOperas = (limit = 10) => {
  const operas = wx.getStorageSync('operas') || [];
  return operas.filter(item => item.status === 1 && item.isRare === true).slice(0, limit);
};

module.exports = {
  OPERA_CATEGORIES,
  OPERA_GENRES,
  REGIONS,
  DEFAULT_OPERAS,
  getCategoryInfo,
  getGenreInfo,
  getGenreName,
  getGenreNames,
  getRegionName,
  getRegionNames,
  getGenresByCategory,
  initOperaData,
  filterOperas,
  getDailyOpera,
  getDailyAria,
  getOperaById,
  getAriaById,
  searchOperasFullText,
  highlightKeyword,
  getRelatedOperasByFigure,
  getRelatedOperasByTopic,
  getOperasByGenre,
  getRareOperas
};
