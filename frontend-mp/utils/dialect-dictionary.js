const DIALECT_DICTIONARY = {
  '耙田': {
    word: '耙田',
    pinyin: 'bà tián',
    phonetic: '',
    meaning: '用耙子平整田地，使土壤细碎均匀，为播种做准备。耙是一种传统农具，有钉齿或铁齿。',
    category: '农耕',
    region: '全国通用',
    example: '春耕时节，天不亮就要起床耙田。',
    relatedWords: ['犁田', '耖田', '整田']
  },
  '锄头': {
    word: '锄头',
    pinyin: 'chú tou',
    phonetic: '',
    meaning: '一种长柄农具，前端有铁制锄刃，用于翻土、除草、挖坑等农活。',
    category: '农具',
    region: '全国通用',
    example: '父亲扛着锄头走向田间。',
    relatedWords: ['犁', '耙', '镰刀']
  },
  '老把式': {
    word: '老把式',
    pinyin: 'lǎo bǎ shi',
    phonetic: '',
    meaning: '方言中对经验丰富、技艺娴熟的老手的称呼，尤指精通农活的老农。',
    category: '称谓',
    region: '北方方言',
    example: '爷爷是村里有名的老把式，种了一辈子地。',
    relatedWords: ['老行家', '老把细', '老师傅']
  },
  '二十四节气': {
    word: '二十四节气',
    pinyin: 'èr shí sì jié qì',
    phonetic: 'The 24 Solar Terms',
    meaning: '中国古代订立的指导农事的补充历法，根据太阳在黄道上的位置划分，始于立春，终于大寒。2016年入选联合国教科文组织人类非物质文化遗产代表作名录。',
    category: '历法',
    region: '全国通用',
    example: '二十四节气被誉为"中国的第五大发明"。',
    relatedWords: ['立春', '清明', '冬至']
  },
  '榫卯': {
    word: '榫卯',
    pinyin: 'sǔn mǎo',
    phonetic: 'Mortise and Tenon',
    meaning: '古代中国建筑、家具的主要结构方式，凸出部分叫榫（榫头），凹进部分叫卯（榫眼、榫槽），两部分凹凸结合实现连接。',
    category: '工艺',
    region: '全国通用',
    example: '北京故宫的建筑大量采用榫卯结构，历经千年而不倒。',
    relatedWords: ['斗拱', '木构架', '传统工艺']
  },
  '土布': {
    word: '土布',
    pinyin: 'tǔ bù',
    phonetic: 'Handwoven Cloth',
    meaning: '又称"老粗布"、"家织布"，劳动人民以纯棉为原料，用原始纺车、木织布机手工编织而成的布料。',
    category: '纺织',
    region: '全国通用',
    example: '外婆的织布手艺在村里是出了名的，织出来的土布厚实耐穿。',
    relatedWords: ['老粗布', '家织布', '织布机']
  },
  '织布机': {
    word: '织布机',
    pinyin: 'zhī bù jī',
    phonetic: 'Loom',
    meaning: '用于织布的机器，传统织布机多为木制，通过脚踏和手工操作，将经纬纱线交织成布。',
    category: '工具',
    region: '全国通用',
    example: '外婆家的堂屋里就摆着一台老式织布机，那是外公年轻时亲手做的。',
    relatedWords: ['纺车', '经纱', '纬纱']
  },
  '粽子': {
    word: '粽子',
    pinyin: 'zòng zi',
    phonetic: 'Zongzi / Rice Dumpling',
    meaning: '端午节传统食品，以箬叶、芦苇叶等包裹糯米蒸制而成，形状多样，有角粽、锥粽等。传说与纪念屈原有关。',
    category: '饮食',
    region: '全国通用',
    example: '端午节前夕，家家户户都忙着包粽子。',
    relatedWords: ['端午节', '箬叶', '龙舟']
  },
  '龙舟': {
    word: '龙舟',
    pinyin: 'lóng zhōu',
    phonetic: 'Dragon Boat',
    meaning: '端午节竞渡用的龙形船，船头船尾装饰成龙的形状。龙舟竞渡是端午节的重要习俗活动。',
    category: '民俗',
    region: '南方地区',
    example: '端午节扒龙舟活动在中国南方沿海一带十分盛行。',
    relatedWords: ['端午节', '竞渡', '屈原']
  },
  '艾草': {
    word: '艾草',
    pinyin: 'ài cǎo',
    phonetic: 'Mugwort / Wormwood',
    meaning: '一种多年生草本植物，有浓烈香气。端午节有挂艾草、菖蒲于门楣的习俗，用以驱虫辟邪。',
    category: '植物/民俗',
    region: '全国通用',
    example: '每到端午节，奶奶都会在门口挂上一把艾草。',
    relatedWords: ['菖蒲', '香囊', '端午节']
  },
  '香囊': {
    word: '香囊',
    pinyin: 'xiāng náng',
    phonetic: 'Sachet / Perfume Pouch',
    meaning: '又称香袋、香包，用彩色丝绸缝制，内装香料、中草药等。端午节佩戴香囊有驱虫、避邪、祈福的寓意。',
    category: '民俗',
    region: '全国通用',
    example: '端午节小孩佩戴香囊，既清香又好看。',
    relatedWords: ['艾草', '五彩绳', '端午节']
  },
  '老槐树': {
    word: '老槐树',
    pinyin: 'lǎo huái shù',
    phonetic: 'Old Pagoda Tree',
    meaning: '树龄很长的槐树，常见于中国北方乡村。槐树生命力强，常被视为村庄的象征，承载着村民的集体记忆。',
    category: '植物/记忆',
    region: '北方地区',
    example: '我们村口有一棵老槐树，听村里最年长的王爷爷说，这棵树少说也有三百年了。',
    relatedWords: ['古树', '乡村记忆', '村标']
  },
  '剪纸': {
    word: '剪纸',
    pinyin: 'jiǎn zhǐ',
    phonetic: 'Paper Cutting',
    meaning: '中国最古老的民间艺术之一，用剪刀或刻刀在纸上剪刻花纹，用于装点生活或配合民俗活动。2009年入选人类非物质文化遗产代表作名录。',
    category: '艺术',
    region: '全国通用',
    example: '窗花是剪纸艺术中最常见的形式，逢年过节人们都会在窗户上贴上喜庆的剪纸。',
    relatedWords: ['窗花', '刻纸', '民间艺术']
  },
  '纺车': {
    word: '纺车',
    pinyin: 'fǎng chē',
    phonetic: 'Spinning Wheel',
    meaning: '用于纺纱的传统工具，通过手摇或脚踏使锭子旋转，将棉花、麻等纤维捻成纱线。',
    category: '工具',
    region: '全国通用',
    example: '黄道婆改进了纺织技术，让纺车的效率大大提高。',
    relatedWords: ['织布机', '棉纱', '黄道婆']
  },
  '石磨': {
    word: '石磨',
    pinyin: 'shí mò',
    phonetic: 'Stone Mill',
    meaning: '用两块圆石制成的传统磨具，用于将谷物磨成粉或浆。靠人力、畜力或水力推动上扇转动。',
    category: '农具',
    region: '全国通用',
    example: '奶奶家用石磨磨出来的豆浆特别香浓。',
    relatedWords: ['碾子', '舂米', '老物件']
  },
  '煤油灯': {
    word: '煤油灯',
    pinyin: 'méi yóu dēng',
    phonetic: 'Kerosene Lamp',
    meaning: '以煤油为燃料的照明灯具，在电力普及前广泛使用。灯芯点燃后发出黄色光芒，灯罩可防风。',
    category: '老物件',
    region: '全国通用',
    example: '小时候没有电，晚上写作业全靠桌上那盏煤油灯。',
    relatedWords: ['马灯', '油灯', '老物件']
  },
  '庙会': {
    word: '庙会',
    pinyin: 'miào huì',
    phonetic: 'Temple Fair',
    meaning: '在寺庙附近举行的集祭祀、娱乐、商贸为一体的民俗活动，多在节日或特定日期举办，有各种小吃、表演和手工艺品。',
    category: '民俗',
    region: '全国通用',
    example: '春节期间逛庙会是很多地方的传统习俗。',
    relatedWords: ['赶集', '社戏', '民俗活动']
  },
  '皮影戏': {
    word: '皮影戏',
    pinyin: 'pí yǐng xì',
    phonetic: 'Shadow Puppetry',
    meaning: '又称"影子戏"或"灯影戏"，用兽皮或纸板剪成人物剪影，艺人在白色幕布后面操纵影人、演唱故事，是中国古老的民间艺术。',
    category: '戏曲',
    region: '全国通用',
    example: '皮影戏是中国民间古老的传统艺术，2011年入选人类非物质文化遗产代表作名录。',
    relatedWords: ['木偶戏', '戏曲', '民间艺术']
  },
  '年画': {
    word: '年画',
    pinyin: 'nián huà',
    phonetic: 'New Year Picture',
    meaning: '中国特有的一种绘画体裁，春节时张贴，用于装饰环境、祝福新年。内容多含吉祥寓意，著名的有杨柳青年画、桃花坞年画等。',
    category: '美术',
    region: '全国通用',
    example: '过年贴年画是中国人的传统习俗。',
    relatedWords: ['春联', '窗花', '春节']
  },
  '竹编': {
    word: '竹编',
    pinyin: 'zhú biān',
    phonetic: 'Bamboo Weaving',
    meaning: '以竹子为原料编织各种器具和工艺品的传统手工艺，可编篮、筐、席、篓等日常用品，也可制作精美的艺术品。',
    category: '工艺',
    region: '南方地区',
    example: '浙江东阳竹编技艺精湛，是国家级非物质文化遗产。',
    relatedWords: ['草编', '藤编', '传统工艺']
  },
  '木雕': {
    word: '木雕',
    pinyin: 'mù diāo',
    phonetic: 'Wood Carving',
    meaning: '以木材为材料进行雕刻的传统工艺，品种繁多，有东阳木雕、黄杨木雕、龙眼木雕等流派，广泛用于建筑装饰、家具和艺术品。',
    category: '工艺',
    region: '全国通用',
    example: '潮州木雕以其多层镂雕技法著称于世。',
    relatedWords: ['根雕', '石雕', '传统工艺']
  },
  '陶艺': {
    word: '陶艺',
    pinyin: 'táo yì',
    phonetic: 'Ceramic Art / Pottery',
    meaning: '陶瓷制作的艺术和工艺，包括制坯、装饰、施釉、烧制等工序。中国陶瓷历史悠久，景德镇、宜兴、钧窑、汝窑等都是著名的陶瓷产地。',
    category: '工艺',
    region: '全国通用',
    example: '宜兴紫砂壶是中国陶艺中的精品。',
    relatedWords: ['瓷器', '紫砂', '景德镇']
  },
  '晌午': {
    word: '晌午',
    pinyin: 'shǎng wǔ',
    phonetic: 'Noon / Midday',
    meaning: '方言中表示中午、正午的意思，指太阳当头的时段，大约是上午十一点到下午一点之间。',
    category: '生活',
    region: '北方方言',
    example: '天太热了，晌午就别出门干活了，在家歇会儿。',
    relatedWords: ['歇晌', '正午', '大中午']
  },
  '歇晌': {
    word: '歇晌',
    pinyin: 'xiē shǎng',
    phonetic: 'Midday Rest',
    meaning: '方言中指中午休息、午睡的意思。农忙时节，农民在午饭后会短暂休息以恢复体力。',
    category: '生活',
    region: '北方方言',
    example: '干了一上午的农活，大家都到老槐树下歇晌。',
    relatedWords: ['晌午', '午休', '午睡']
  },
  '唠唠': {
    word: '唠唠',
    pinyin: 'láo lao',
    phonetic: 'Chat / Gossip',
    meaning: '方言中表示聊天、闲谈的意思，通常指亲朋好友聚在一起拉家常、说闲话。',
    category: '生活',
    region: '北方方言',
    example: '好久不见了，有空来家里坐坐，咱们唠唠家常。',
    relatedWords: ['拉家常', '闲聊', '扯闲话']
  },
  '旱烟': {
    word: '旱烟',
    pinyin: 'hàn yān',
    phonetic: 'Tobacco Pipe',
    meaning: '指用烟袋锅装的烟叶丝，区别于纸烟。传统旱烟袋由烟袋锅、烟袋杆、烟袋嘴三部分组成。',
    category: '生活',
    region: '全国通用',
    example: '爷爷干完农活回来，总要抽一袋旱烟解解乏。',
    relatedWords: ['烟袋锅', '烟叶', '老烟枪']
  },
  '烟袋锅子': {
    word: '烟袋锅子',
    pinyin: 'yān dài guō zi',
    phonetic: 'Pipe Bowl',
    meaning: '旱烟袋的一部分，指烟袋一端装烟叶的碗状金属部分，通常用铜或铁制成。',
    category: '生活',
    region: '北方方言',
    example: '大爷拿着烟袋锅子，在鞋底上磕了磕烟灰。',
    relatedWords: ['旱烟', '烟袋杆', '烟袋嘴']
  },
  '纳鞋底': {
    word: '纳鞋底',
    pinyin: 'nà xié dǐ',
    phonetic: 'Sew Shoe Soles',
    meaning: '传统手工做布鞋的工序之一，用粗麻绳将多层袼褙（用碎布裱糊而成的厚衬料）密密地缝合在一起，做成结实的布鞋鞋底。',
    category: '生活',
    region: '全国通用',
    example: '昏暗的油灯下，母亲一针一线地为我们纳鞋底。',
    relatedWords: ['千层底', '布鞋', '袼褙']
  },
  '乡愁': {
    word: '乡愁',
    pinyin: 'xiāng chóu',
    phonetic: 'Homesickness / Nostalgia',
    meaning: '指思乡的忧愁与惆怅，对家乡的深切思念之情。是中国文学中常见的主题。',
    category: '情感',
    region: '全国通用',
    example: '离家多年，那口乡音、那缕炊烟，都是挥之不去的乡愁。',
    relatedWords: ['思乡', '乡情', '故土']
  },
  '经心': {
    word: '经心',
    pinyin: 'jīng xīn',
    phonetic: 'Careful / Attentive',
    meaning: '方言中表示留心、用心、在意的意思，指做事情认真仔细，不马虎。',
    category: '生活',
    region: '全国通用',
    example: '这孩子做事情不经心，总是丢三落四的。',
    relatedWords: ['留心', '用心', '在意']
  },
  '梭子': {
    word: '梭子',
    pinyin: 'suō zi',
    phonetic: 'Shuttle',
    meaning: '织布机上用来引导纬纱的工具，形状像枣核，中间中空装纬线，在经纱之间来回穿行织布。',
    category: '工具',
    region: '全国通用',
    example: '织布机上的梭子飞快地穿梭，不一会儿就织出了一大片布。',
    relatedWords: ['织布机', '经纱', '纬纱']
  },
  '咯吱': {
    word: '咯吱',
    pinyin: 'gē zhī',
    phonetic: 'Creak / Groan',
    meaning: '象声词，形容竹木等器物受挤压发出的声音，也可写作"咯吱咯吱"，形容持续的摩擦声。',
    category: '生活',
    region: '全国通用',
    example: '一踩上去，木地板就发出咯吱咯吱的响声。',
    relatedWords: ['嘎吱', '吱呀', '嘎嘎']
  },
  '袼褙': {
    word: '袼褙',
    pinyin: 'gē bèi',
    phonetic: 'Cloth Paste Layer',
    meaning: '用碎布或旧布加衬纸裱糊成的厚片，是传统手工制作布鞋鞋底的材料。',
    category: '材料',
    region: '北方方言',
    example: '奶奶用攒了半年的碎布打袼褙，准备给全家做新鞋。',
    relatedWords: ['纳鞋底', '千层底', '布鞋']
  },
  '老粗布': {
    word: '老粗布',
    pinyin: 'lǎo cū bù',
    phonetic: 'Coarse Homespun Cloth',
    meaning: '即土布，用手工纺线、手工织布机织出的布料，因纱线较粗、布面有明显纹理而得名，厚实耐用，透气舒适。',
    category: '纺织',
    region: '全国通用',
    example: '一床老粗布床单，铺着格外舒坦，是妈妈亲手织的。',
    relatedWords: ['土布', '家织布', '织布机']
  },
  '家织布': {
    word: '家织布',
    pinyin: 'jiā zhī bù',
    phonetic: 'Home-woven Cloth',
    meaning: '农家自己用纺车纺线、用织布机织的布，区别于工厂机器生产的"洋布"。',
    category: '纺织',
    region: '全国通用',
    example: '家里的老被面是用家织布做的，虽然朴素但格外结实。',
    relatedWords: ['土布', '老粗布', '洋布']
  },
  '洋布': {
    word: '洋布',
    pinyin: 'yáng bù',
    phonetic: 'Machine-made Cloth',
    meaning: '旧时对机器纺织的平纹棉布的称呼，与手工纺织的"土布"相对，因最初从国外传入而得名。',
    category: '纺织',
    region: '全国通用',
    example: '那时候谁家能穿上一件洋布做的新衣服，可神气了。',
    relatedWords: ['土布', '家织布', '老粗布']
  },
  '雄黄酒': {
    word: '雄黄酒',
    pinyin: 'xióng huáng jiǔ',
    phonetic: 'Realgar Wine',
    meaning: '用研磨成粉末的雄黄泡制的白酒或黄酒，端午节传统饮品，古人认为能驱虫解毒。',
    category: '饮食/民俗',
    region: '全国通用',
    example: '端午节中午，大人喝雄黄酒，小孩就在额头上用雄黄点个"王"字。',
    relatedWords: ['端午节', '艾草', '菖蒲']
  },
  '菖蒲': {
    word: '菖蒲',
    pinyin: 'chāng pú',
    phonetic: 'Calamus / Sweet Flag',
    meaning: '一种水生草本植物，叶片狭长如剑。端午节有悬挂艾草和菖蒲于门楣的习俗，寓意驱邪避疫。',
    category: '植物/民俗',
    region: '全国通用',
    example: '门前挂着艾草和菖蒲，屋子里飘着淡淡的药香味。',
    relatedWords: ['艾草', '端午节', '香囊']
  },
  '五彩绳': {
    word: '五彩绳',
    pinyin: 'wǔ cǎi shéng',
    phonetic: 'Five-color String',
    meaning: '用红、黄、蓝、白、黑五种颜色的丝线编的绳子，端午节系在小孩手腕、脚腕或脖子上，寓意驱邪纳福。',
    category: '民俗',
    region: '全国通用',
    example: '奶奶给我系上五彩绳，说要等下一场雨的时候扔到水里，能带走坏运气。',
    relatedWords: ['端午节', '香囊', '艾草']
  },
  '箬叶': {
    word: '箬叶',
    pinyin: 'ruò yè',
    phonetic: 'Bamboo Leaves',
    meaning: '箬竹的叶子，叶片宽大柔韧，常用于包粽子。南方也有用芦苇叶包粽子的习俗。',
    category: '植物/饮食',
    region: '南方地区',
    example: '新鲜的箬叶带着清香味，用它包出来的粽子格外好吃。',
    relatedWords: ['粽子', '端午节', '芦苇叶']
  },
  '斗拱': {
    word: '斗拱',
    pinyin: 'dǒu gǒng',
    phonetic: 'Dougong (Bracket Set)',
    meaning: '中国古代建筑特有的构件，在立柱和横梁交接处，由弓形的拱和方形的斗层层叠加而成，具有承重和装饰双重作用。',
    category: '工艺/建筑',
    region: '全国通用',
    example: '应县木塔全靠斗拱结构支撑，不用一根铁钉，历经千年不倒。',
    relatedWords: ['榫卯', '木构架', '古建筑']
  },
  '碾子': {
    word: '碾子',
    pinyin: 'niǎn zi',
    phonetic: 'Stone Roller',
    meaning: '一种传统碾压加工工具，由碾盘（圆形石盘）和碾砣（圆柱形石磙）组成，用于碾压谷物脱壳或压碎粮食。',
    category: '农具',
    region: '全国通用',
    example: '村口的老碾子旁，总有人排队等着碾米。',
    relatedWords: ['石磨', '舂米', '老物件']
  },
  '舂米': {
    word: '舂米',
    pinyin: 'chōng mǐ',
    phonetic: 'Pounding Rice',
    meaning: '把谷物放在石臼里用杵捣去皮壳的传统加工方法，是稻谷脱壳的古老方式。',
    category: '生活',
    region: '全国通用',
    example: '以前没有打米机，家家户户都要靠人力舂米。',
    relatedWords: ['石磨', '碾子', '石臼']
  },
  '马灯': {
    word: '马灯',
    pinyin: 'mǎ dēng',
    phonetic: 'Hurricane Lamp',
    meaning: '一种可以手提的防风雨煤油灯，灯罩周围有金属丝网保护，过去骑马夜行时挂在马身上使用，故名。',
    category: '老物件',
    region: '全国通用',
    example: '爷爷夜晚出诊，总忘不了带上那盏马灯。',
    relatedWords: ['煤油灯', '油灯', '老物件']
  },
  '赶集': {
    word: '赶集',
    pinyin: 'gǎn jí',
    phonetic: 'Go to Market',
    meaning: '旧时乡村按照固定日期到集市进行买卖交易的活动，不同乡镇的集日错开，便于村民轮流前往。',
    category: '民俗/生活',
    region: '全国通用',
    example: '每逢农历二、五、八，四邻八乡的人都来镇上赶集，热闹得很。',
    relatedWords: ['庙会', '集市', '社戏']
  },
  '社戏': {
    word: '社戏',
    pinyin: 'shè xì',
    phonetic: 'Village Opera',
    meaning: '旧时农村在春秋祭祀社神（土地神）时所演的戏，是乡村重要的文化娱乐活动，多在庙台或临时搭的戏台上演出。',
    category: '戏曲/民俗',
    region: '江南地区',
    example: '小时候最盼望村里演社戏，小伙伴们早早就搬着板凳去占位置。',
    relatedWords: ['庙会', '戏曲', '民俗活动']
  },
  '春联': {
    word: '春联',
    pinyin: 'chūn lián',
    phonetic: 'Spring Festival Couplets',
    meaning: '春节时贴在门上的对联，用红纸书写，分上下联和横批，内容多为辞旧迎新、祈福纳祥的吉祥话语。',
    category: '美术/民俗',
    region: '全国通用',
    example: '腊月二十八，家家户户贴春联、贴福字，年味就浓了。',
    relatedWords: ['年画', '春节', '窗花']
  },
  '草编': {
    word: '草编',
    pinyin: 'cǎo biān',
    phonetic: 'Straw Weaving',
    meaning: '以各种草本植物的茎、叶、皮为原料编织器物的传统工艺，可编草帽、草席、草鞋、草筐等。',
    category: '工艺',
    region: '全国通用',
    example: '奶奶编的草编篮子结实又好看，赶集的时候总能卖个好价钱。',
    relatedWords: ['竹编', '藤编', '传统工艺']
  },
  '藤编': {
    word: '藤编',
    pinyin: 'téng biān',
    phonetic: 'Rattan Weaving',
    meaning: '以藤条为材料编织家具和器物的传统工艺，藤编家具轻便透气、结实耐用，适合炎热地区使用。',
    category: '工艺',
    region: '南方地区',
    example: '一把藤编的老椅子，坐了几十年依然完好无损。',
    relatedWords: ['竹编', '草编', '传统工艺']
  },
  '根雕': {
    word: '根雕',
    pinyin: 'gēn diāo',
    phonetic: 'Root Carving',
    meaning: '以树木的根部为材料，利用其天然形态进行艺术创作的雕刻工艺，讲究"三分人工，七分天成"。',
    category: '工艺',
    region: '全国通用',
    example: '这件根雕作品巧妙地利用了树根的天然形态，堪称巧夺天工。',
    relatedWords: ['木雕', '石雕', '传统工艺']
  },
  '石雕': {
    word: '石雕',
    pinyin: 'shí diāo',
    phonetic: 'Stone Carving',
    meaning: '以石材为材料进行雕刻的传统工艺，广泛用于建筑装饰、碑刻、石像等，著名的有汉白玉石雕、青田石雕等。',
    category: '工艺',
    region: '全国通用',
    example: '卢沟桥上的石狮子姿态各异，是中国古代石雕艺术的杰作。',
    relatedWords: ['木雕', '根雕', '传统工艺']
  },
  '瓷器': {
    word: '瓷器',
    pinyin: 'cí qì',
    phonetic: 'Porcelain / China',
    meaning: '以瓷土（高岭土）为原料，经成型、施釉、高温烧制而成的器物，是中国古代的伟大发明之一，英文"China"即源于此。',
    category: '工艺',
    region: '全国通用',
    example: '景德镇的瓷器以"白如玉、明如镜、薄如纸、声如磬"著称于世。',
    relatedWords: ['陶艺', '紫砂', '景德镇']
  },
  '紫砂': {
    word: '紫砂',
    pinyin: 'zǐ shā',
    phonetic: 'Purple Clay / Zisha',
    meaning: '一种产于江苏宜兴的特殊陶土，呈紫褐色，用其制作的紫砂壶透气性能好，泡茶不失原味，是中国传统茶具的珍品。',
    category: '工艺',
    region: '江苏宜兴',
    example: '一把上好的紫砂壶，需要经过几十道工序才能制成。',
    relatedWords: ['陶艺', '瓷器', '宜兴']
  },
  '景德镇': {
    word: '景德镇',
    pinyin: 'jǐng dé zhèn',
    phonetic: 'Jingdezhen',
    meaning: '江西省下辖设区的市，是世界著名的瓷都，制瓷历史悠久，所产青花瓷、粉彩瓷、玲珑瓷、颜色釉瓷被誉为四大传统名瓷。',
    category: '地名',
    region: '江西省',
    example: '景德镇瓷器远销海内外，被誉为"千年瓷都"。',
    relatedWords: ['瓷器', '陶艺', '青花瓷']
  },
  '青花瓷': {
    word: '青花瓷',
    pinyin: 'qīng huā cí',
    phonetic: 'Blue and White Porcelain',
    meaning: '中国传统瓷器的主流品种之一，用含氧化钴的钴矿为原料，在瓷胎上描绘纹饰，再罩上一层透明釉，经高温烧成。',
    category: '工艺',
    region: '全国通用',
    example: '元代青花瓷"鬼谷子下山图罐"曾创下中国艺术品拍卖的最高纪录。',
    relatedWords: ['景德镇', '瓷器', '粉彩瓷']
  },
  '木偶戏': {
    word: '木偶戏',
    pinyin: 'mù ǒu xì',
    phonetic: 'Puppet Show',
    meaning: '用木偶来表演故事的戏剧形式，演员在幕后操纵木偶并演唱，是中国古老的民间艺术，有提线木偶、布袋木偶、杖头木偶等种类。',
    category: '戏曲',
    region: '全国通用',
    example: '泉州提线木偶戏是国家级非物质文化遗产，表演技艺精妙绝伦。',
    relatedWords: ['皮影戏', '戏曲', '民间艺术']
  },
  '窗花': {
    word: '窗花',
    pinyin: 'chuāng huā',
    phonetic: 'Window Paper-cut',
    meaning: '贴在窗户上作装饰的剪纸，是中国剪纸艺术中最常见、最普及的一种形式，逢年过节家家户户都要贴窗花增添喜庆气氛。',
    category: '美术',
    region: '全国通用',
    example: '腊月二十八，奶奶坐在炕上剪窗花，不一会儿就剪出了一幅"喜鹊登梅"。',
    relatedWords: ['剪纸', '春联', '春节']
  },
  '刻纸': {
    word: '刻纸',
    pinyin: 'kè zhǐ',
    phonetic: 'Paper Cutting with Knife',
    meaning: '剪纸艺术的一种，不用剪刀剪，而是用刻刀在纸上刻出花纹图案，可以一次刻多张，效率更高，适合制作精细复杂的作品。',
    category: '美术',
    region: '全国通用',
    example: '乐清细纹刻纸以其精细入微的刀法闻名，被誉为"中国剪纸的一绝"。',
    relatedWords: ['剪纸', '窗花', '民间艺术']
  },
  '民间艺术': {
    word: '民间艺术',
    pinyin: 'mín jiān yì shù',
    phonetic: 'Folk Art',
    meaning: '由劳动人民直接创造并在民间广泛流传的艺术形式，包括剪纸、年画、皮影、泥塑、刺绣、编织等，具有浓郁的乡土气息和民族特色。',
    category: '艺术',
    region: '全国通用',
    example: '许多民间艺术正面临传承断层的困境，亟需保护和扶持。',
    relatedWords: ['剪纸', '皮影戏', '年画']
  }
};

const INTERVIEW_NAME_PINYIN = {
  '张大爷': { name: '张大爷', pinyin: 'Zhāng dà ye', region: '华北地区' },
  '李阿姨': { name: '李阿姨', pinyin: 'Lǐ ā yí', region: '华东地区' },
  '王爷爷': { name: '王爷爷', pinyin: 'Wáng yé ye', region: '北方地区' },
  '王老师': { name: '王老师', pinyin: 'Wáng lǎo shī', region: '' },
  '陈奶奶': { name: '陈奶奶', pinyin: 'Chén nǎi nai', region: '华南地区' },
  '刘大伯': { name: '刘大伯', pinyin: 'Liú dà bó', region: '华中地区' },
  '赵大叔': { name: '赵大叔', pinyin: 'Zhào dà shū', region: '西北地区' },
  '孙大娘': { name: '孙大娘', pinyin: 'Sūn dà niáng', region: '东北地区' },
  '采访者': { name: '采访者', pinyin: 'Cǎi fǎng zhě', region: '' },
  '管理员': { name: '管理员', pinyin: 'Guǎn lǐ yuán', region: '' }
};

const PLACE_NAME_PINYIN = {
  '乌镇': { name: '乌镇', pinyin: 'Wū Zhèn', description: '浙江省嘉兴市桐乡市下辖镇，江南六大古镇之一，以水乡风貌著称。' },
  '周庄': { name: '周庄', pinyin: 'Zhōu Zhuāng', description: '江苏省苏州市昆山市下辖镇，江南六大古镇之一，被誉为"中国第一水乡"。' },
  '周庄古镇': { name: '周庄古镇', pinyin: 'Zhōu Zhuāng Gǔ Zhèn', description: '江苏省苏州市昆山市下辖镇，江南六大古镇之一，被誉为"中国第一水乡"。' },
  '平遥': { name: '平遥', pinyin: 'Píng Yáo', description: '山西省晋中市下辖县，国家历史文化名城，平遥古城是世界文化遗产。' },
  '平遥古城': { name: '平遥古城', pinyin: 'Píng Yáo Gǔ Chéng', description: '山西省晋中市平遥县，世界文化遗产，保存最完整的古代县城之一。' },
  '婺源': { name: '婺源', pinyin: 'Wù Yuán', description: '江西省上饶市下辖县，以徽派建筑和油菜花田闻名，被誉为"中国最美乡村"。' },
  '凤凰古城': { name: '凤凰古城', pinyin: 'Fèng Huáng Gǔ Chéng', description: '湖南省湘西土家族苗族自治州下辖县级市，国家历史文化名城，苗族土家族聚居地。' },
  '西塘': { name: '西塘', pinyin: 'Xī Táng', description: '浙江省嘉兴市嘉善县下辖镇，江南六大古镇之一，以廊棚和古弄著称。' },
  '同里': { name: '同里', pinyin: 'Tóng Lǐ', description: '江苏省苏州市吴江区下辖镇，江南六大古镇之一，以"小桥、流水、人家"著称。' },
  '南浔': { name: '南浔', pinyin: 'Nán Xún', description: '浙江省湖州市南浔区下辖镇，江南六大古镇之一，中西合璧建筑风格独特。' },
  '甪直': { name: '甪直', pinyin: 'Lù Zhí', description: '江苏省苏州市吴中区下辖镇，江南六大古镇之一，被誉为"神州水乡第一镇"。' },
  '宏村': { name: '宏村', pinyin: 'Hóng Cūn', description: '安徽省黄山市黟县下辖村，世界文化遗产，徽派古村落代表，被誉为"画里乡村"。' },
  '西递': { name: '西递', pinyin: 'Xī Dì', description: '安徽省黄山市黟县下辖村，世界文化遗产，徽派古村落代表。' },
  '丽江': { name: '丽江', pinyin: 'Lì Jiāng', description: '云南省丽江市，世界文化遗产，以纳西族文化和古城风貌闻名。' },
  '阳朔': { name: '阳朔', pinyin: 'Yáng Shuò', description: '广西壮族自治区桂林市下辖县，以喀斯特地貌和漓江风光闻名，"桂林山水甲天下，阳朔山水甲桂林"。' }
};

function findDialectWord(word) {
  return DIALECT_DICTIONARY[word] || null;
}

function searchDialectWords(text) {
  if (!text || typeof text !== 'string') return [];
  const found = [];
  for (const word in DIALECT_DICTIONARY) {
    if (text.includes(word)) {
      found.push({
        word: word,
        ...DIALECT_DICTIONARY[word],
        index: text.indexOf(word)
      });
    }
  }
  found.sort((a, b) => a.index - b.index);
  return found;
}

function parseContentWithDialect(text) {
  if (!text || typeof text !== 'string') {
    return [{ type: 'text', content: text }];
  }
  const dialectWords = Object.keys(DIALECT_DICTIONARY).sort((a, b) => b.length - a.length);
  const segments = [];
  let remaining = text;
  while (remaining.length > 0) {
    let found = null;
    for (const word of dialectWords) {
      if (remaining.startsWith(word)) {
        found = word;
        break;
      }
    }
    if (found) {
      segments.push({ type: 'dialect', content: found, info: DIALECT_DICTIONARY[found] });
      remaining = remaining.slice(found.length);
    } else {
      if (segments.length > 0 && segments[segments.length - 1].type === 'text') {
        segments[segments.length - 1].content += remaining[0];
      } else {
        segments.push({ type: 'text', content: remaining[0] });
      }
      remaining = remaining.slice(1);
    }
  }
  return segments;
}

function getInterviewNamePinyin(name) {
  return INTERVIEW_NAME_PINYIN[name] || { name, pinyin: '', region: '' };
}

function getPlaceNamePinyin(place) {
  return PLACE_NAME_PINYIN[place] || { name: place, pinyin: '', description: '' };
}

function getAllDialectWords() {
  return Object.keys(DIALECT_DICTIONARY).map(k => DIALECT_DICTIONARY[k]);
}

function getDialectByCategory(category) {
  return Object.values(DIALECT_DICTIONARY).filter(d => d.category === category);
}

module.exports = {
  DIALECT_DICTIONARY,
  INTERVIEW_NAME_PINYIN,
  PLACE_NAME_PINYIN,
  findDialectWord,
  searchDialectWords,
  parseContentWithDialect,
  getInterviewNamePinyin,
  getPlaceNamePinyin,
  getAllDialectWords,
  getDialectByCategory
};
