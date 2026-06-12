const SOLAR_TERMS = [
  {
    id: 'xiaohan',
    name: '小寒',
    month: 1,
    dayRange: [5, 7],
    type: 'solar_term',
    season: 'winter',
    summary: '小寒，是二十四节气中的第23个节气，标志着一年中最寒冷日子的开始。',
    content: '小寒，是二十四节气中的第23个节气，冬季的第5个节气。小寒时节，标志着一年中最寒冷日子的开始。此时，大部分地区已进入严寒时期，土壤冻结，河流封冻，被称为"数九寒天"。\n\n小寒节气期间，北方地区平均气温一般在-15℃至-30℃之间，南方地区也降至0℃左右。农事活动主要以积肥、修水利、防冻为主。\n\n民间有"小寒大寒，冷成冰团"的说法。小寒时节的传统习俗包括吃腊八粥、画九九消寒图等。',
    keywords: ['小寒', '节气', '寒冬', '腊八粥', '数九'],
    category: 'farming',
    customs: ['喝腊八粥', '画九九消寒图', '吃糯米饭'],
    farming: '积肥、修水利、防冻、检查农具'
  },
  {
    id: 'dahan',
    name: '大寒',
    month: 1,
    dayRange: [19, 21],
    type: 'solar_term',
    season: 'winter',
    summary: '大寒是二十四节气中最后一个节气，此时天气寒冷到极点。',
    content: '大寒，是二十四节气中的最后一个节气。每年公历1月20日前后，太阳到达黄经300°时为大寒。大寒节气时，寒潮南下频繁，是中国大部分地区一年中最冷的时期。\n\n"大寒小寒，冷成一团"，大寒节气虽然寒冷，但已接近春天，隐隐中已可感受到大地回春的迹象。在农耕上，大寒时节要做好春耕的准备。\n\n大寒节气有除尘、糊窗、蒸供、赶婚等习俗。民间有"过了大寒，又是一年"的说法。',
    keywords: ['大寒', '节气', '严寒', '迎春', '除尘'],
    category: 'farming',
    customs: ['除尘', '糊窗', '蒸供', '赶婚'],
    farming: '准备春耕、检修农具、积肥'
  },
  {
    id: 'lichun',
    name: '立春',
    month: 2,
    dayRange: [3, 5],
    type: 'solar_term',
    season: 'spring',
    summary: '立春，为二十四节气之首，标志着万物闭藏的冬季过去，开始进入风和日暖的春天。',
    content: '立春，为二十四节气之首。立，是"开始"之意；春，代表着温暖、生长。立春标志着万物闭藏的冬季已过去，开始进入风和日暖、万物生长的春天。\n\n立春时节，自然界最显著的特点就是万物开始有复苏的迹象。时至立春，在北回归线及其附近地区，可明显感觉到早春的气息。\n\n立春有"咬春"的习俗，即吃春饼、春卷、萝卜等。还有"打春牛"的传统活动，寓意祈求丰收。民间有"立春一年端，种地早盘算"的农谚。',
    keywords: ['立春', '节气', '春天', '咬春', '春饼', '春牛'],
    category: 'farming',
    customs: ['咬春', '吃春饼', '打春牛', '贴春胜'],
    farming: '备耕、检修农具、选种'
  },
  {
    id: 'yushui',
    name: '雨水',
    month: 2,
    dayRange: [18, 20],
    type: 'solar_term',
    season: 'spring',
    summary: '雨水节气标示着降雨开始，适宜的降水对农作物的生长很重要。',
    content: '雨水，是二十四节气中的第2个节气。雨水节气标示着降雨开始、雨量渐增。雨水节气含义是"东风解冻，冰雪皆散而为水，化而为雨，故名雨水"。\n\n雨水时节，气温回升、冰雪融化、降水增多。此时，中国大部分地区气温回升到0℃以上，黄淮平原日平均气温已达3℃左右。\n\n雨水节气的习俗有"回娘屋"、"接寿"等。农谚说"雨水有雨庄稼好，大春小春一片宝"。',
    keywords: ['雨水', '节气', '春雨', '降雨', '农事'],
    category: 'farming',
    customs: ['回娘屋', '接寿', '拉保保'],
    farming: '准备春播、耙地保墒'
  },
  {
    id: 'jingzhe',
    name: '惊蛰',
    month: 3,
    dayRange: [5, 7],
    type: 'solar_term',
    season: 'spring',
    summary: '惊蛰反映自然物候现象，此时春雷始鸣，惊醒蛰伏的昆虫。',
    content: '惊蛰，是二十四节气中的第3个节气。惊蛰反映自然物候现象，此时春雷始鸣，惊醒蛰伏于地下冬眠的昆虫，故曰惊蛰。\n\n惊蛰时节，气温回升较快，渐有春雷萌动。中国大部分地区进入春耕大忙季节。桃花红、梨花白，黄莺鸣叫、燕飞来的时节到了。\n\n惊蛰有吃梨的习俗，寓意与害虫"离别"。还有"祭白虎"化解是非的民间传统。',
    keywords: ['惊蛰', '节气', '春雷', '昆虫', '春耕'],
    category: 'farming',
    customs: ['吃梨', '祭白虎', '打小人'],
    farming: '春耕开始、防治病虫害'
  },
  {
    id: 'chunfen',
    name: '春分',
    month: 3,
    dayRange: [20, 22],
    type: 'solar_term',
    season: 'spring',
    summary: '春分时节，昼夜平分，太阳直射赤道，此后北半球白天越来越长。',
    content: '春分，是二十四节气中的第4个节气。春分这天，太阳直射赤道，全球昼夜等长。春分之后，太阳直射点北移，北半球白天越来越长。\n\n春分时节，中国除青藏高原、东北、西北和华北北部地区外，都进入明媚的春天。辽阔的大地上，岸柳青青，莺飞草长，小麦拔节，油菜花香。\n\n春分的习俗有"竖蛋"、"吃春菜"、"送春牛"等。民间有"春分麦起身，一刻值千金"的农谚。',
    keywords: ['春分', '节气', '昼夜平分', '竖蛋', '春菜'],
    category: 'farming',
    customs: ['竖蛋', '吃春菜', '送春牛', '春祭'],
    farming: '春播大忙、灌溉施肥'
  },
  {
    id: 'qingming',
    name: '清明',
    month: 4,
    dayRange: [4, 6],
    type: 'solar_term',
    season: 'spring',
    summary: '清明既是节气又是传统节日，有祭祖扫墓、踏青郊游的习俗。',
    content: '清明，是二十四节气中的第5个节气，也是中国传统节日。清明时节，气温变暖，降雨增多，正是春耕春种的大好时节。\n\n清明节与春节、端午节、中秋节并称为中国四大传统节日。清明节的习俗主要有扫墓祭祖、踏青、插柳、放风筝等。\n\n清明扫墓祭祖的习俗已延续数千年。唐代诗人杜牧的"清明时节雨纷纷，路上行人欲断魂"是清明最著名的诗句。清明还是重要的农事节气，有"清明前后，种瓜点豆"的农谚。',
    keywords: ['清明', '节气', '节日', '扫墓', '踏青', '祭祖'],
    category: 'folklore',
    customs: ['扫墓祭祖', '踏青', '插柳', '放风筝', '吃青团'],
    farming: '播种、植树、春耕大忙'
  },
  {
    id: 'guyu',
    name: '谷雨',
    month: 4,
    dayRange: [19, 21],
    type: 'solar_term',
    season: 'spring',
    summary: '谷雨取自"雨生百谷"之意，此时降水明显增加，利于谷物生长。',
    content: '谷雨，是二十四节气中的第6个节气，春季的最后一个节气。谷雨取自"雨生百谷"之意，此时降水明显增加，田中的秧苗初插、作物新种，最需要雨水的滋润，降雨量充足而及时，谷类作物能茁壮成长。\n\n谷雨时节，南方地区"杨花落尽子规啼"，柳絮飞落，杜鹃夜啼，牡丹吐蕊，樱桃红熟，自然景物告示人们：时至暮春了。\n\n谷雨有"采谷雨茶"、"食香椿"、"祭海"等习俗。民间有"谷雨前后，种瓜种豆"的农谚。',
    keywords: ['谷雨', '节气', '春雨', '谷物', '采茶'],
    category: 'farming',
    customs: ['采谷雨茶', '食香椿', '祭海', '赏牡丹'],
    farming: '播种移苗、种瓜点豆、病虫害防治'
  },
  {
    id: 'lixia',
    name: '立夏',
    month: 5,
    dayRange: [5, 7],
    type: 'solar_term',
    season: 'summer',
    summary: '立夏表示告别春天，夏天开始，万物进入旺盛生长期。',
    content: '立夏，是二十四节气中的第7个节气，夏季的第一个节气。立夏表示告别春天，是夏天的开始。立夏后，日照增加，气温升高，雷雨增多，农作物进入旺盛生长期。\n\n立夏时节，万物繁茂。明人《遵生八笺》写道："孟夏之日，天地始交，万物并秀。"此时，江南正式进入雨季，雨量和雨日均明显增多。\n\n立夏有"称人"、"吃蛋"、"尝新"等习俗。民间有"立夏吃蛋，石头都踩烂"的说法，认为立夏吃蛋可以增强体质。',
    keywords: ['立夏', '节气', '夏天', '称人', '吃蛋'],
    category: 'farming',
    customs: ['称人', '吃蛋', '尝新', '喝冷饮'],
    farming: '田间管理、防虫害、抢晴收割'
  },
  {
    id: 'xiaoman',
    name: '小满',
    month: 5,
    dayRange: [20, 22],
    type: 'solar_term',
    season: 'summer',
    summary: '小满指麦类等夏熟作物籽粒开始饱满，但还未完全成熟。',
    content: '小满，是二十四节气中的第8个节气。小满节气意味着进入了大幅降水的雨季，雨水开始增多，往往会出现持续大范围的强降水。\n\n"小满"之名，有两层含义。第一，与气候降水有关，小满节气期间南方的暴雨开始增多，降水频繁。第二，与农业小麦有关，在北方地区小满节气期间小麦等夏熟作物籽粒已开始饱满，但还没有成熟，约相当乳熟后期，所以叫"小满"。\n\n小满有"祭车神"、"食苦菜"等习俗。农谚说"小满小满，麦粒渐满"。',
    keywords: ['小满', '节气', '麦子', '夏熟', '雨水'],
    category: 'farming',
    customs: ['祭车神', '食苦菜', '抢水'],
    farming: '夏收作物准备、防治虫害'
  },
  {
    id: 'mangzhong',
    name: '芒种',
    month: 6,
    dayRange: [5, 7],
    type: 'solar_term',
    season: 'summer',
    summary: '芒种是有芒之谷类作物可种的意思，是农事最为繁忙的时期。',
    content: '芒种，是二十四节气中的第9个节气。芒种的含义是"有芒之谷类作物可种，过此即失效"。此时气温显著升高，雨量充沛，是农业生产最繁忙的时期。\n\n芒种时节，中国南方的华南地区东南季风雨带稳定，是一年降水量最多的时节。长江中下游地区先后进入梅雨季节，雨日多，雨量大。\n\n芒种有"送花神"、"煮梅"、"吃君踏菜"等习俗。民间有"芒种忙种，一刻不让"的说法。',
    keywords: ['芒种', '节气', '种地', '农忙', '梅雨'],
    category: 'farming',
    customs: ['送花神', '煮梅', '安苗'],
    farming: '收麦种稻、最繁忙的农事期'
  },
  {
    id: 'xiazhi',
    name: '夏至',
    month: 6,
    dayRange: [21, 22],
    type: 'solar_term',
    season: 'summer',
    summary: '夏至是北半球一年中白昼最长的一天，之后白天渐短。',
    content: '夏至，是二十四节气中的第10个节气。夏至这天，太阳直射北回归线，北半球各地的白昼时间达到全年最长。夏至之后，太阳直射点南移，北半球白天渐短。\n\n夏至时节，气温较高，日照充足，作物生长旺盛。此时正是江淮地区的"梅雨"季节，空气非常潮湿。\n\n夏至有"吃面条"的习俗，民间有"冬至饺子夏至面"的说法。还有"夏至日吃馄饨"的传统。古人有"夏至一阴生"的观念，认为从夏至开始，阳气开始衰退。',
    keywords: ['夏至', '节气', '最长昼', '吃面', '梅雨'],
    category: 'farming',
    customs: ['吃面条', '吃馄饨', '称人'],
    farming: '抢收抢种、防汛排涝'
  },
  {
    id: 'xiaoshu',
    name: '小暑',
    month: 7,
    dayRange: [6, 8],
    type: 'solar_term',
    season: 'summer',
    summary: '小暑即"小热"，意指天气开始炎热但还没到最热。',
    content: '小暑，是二十四节气中的第11个节气。小暑即"小热"，意指天气开始炎热但还没到最热。此时，全国大部分地区基本符合这一气候特征。\n\n小暑时节，江淮流域梅雨先后结束，长江中下游地区进入伏旱期。而北方地区则进入多雨季节，热带气旋活动频繁。\n\n小暑有"食新"、"吃藕"等习俗。民间有"小暑大暑，上蒸下煮"的说法，形象地描述了小暑时节的闷热感。',
    keywords: ['小暑', '节气', '炎热', '伏天', '食新'],
    category: 'farming',
    customs: ['食新', '吃藕', '晒书画'],
    farming: '防旱防涝、田间管理'
  },
  {
    id: 'dashu',
    name: '大暑',
    month: 7,
    dayRange: [22, 24],
    type: 'solar_term',
    season: 'summer',
    summary: '大暑是一年中最热的节气，"湿热交蒸"在此时到达顶点。',
    content: '大暑，是二十四节气中的第12个节气，也是夏季最后一个节气。大暑相对小暑，更加炎热，是一年中阳光最猛烈、最炎热的节气，"湿热交蒸"在此时到达顶点。\n\n大暑时节，正值中伏前后，天气酷热，气温最高。中国大部分地区进入一年中最热的时期。\n\n大暑有"饮伏茶"、"晒伏姜"、"烧伏香"等习俗。民间有"大暑不热，五谷不结"的农谚，说明大暑的高温对农作物生长有重要意义。',
    keywords: ['大暑', '节气', '最热', '三伏', '伏茶'],
    category: 'farming',
    customs: ['饮伏茶', '晒伏姜', '烧伏香', '吃仙草'],
    farming: '防暑降温、双抢（抢收抢种）'
  },
  {
    id: 'liqiu',
    name: '立秋',
    month: 8,
    dayRange: [7, 9],
    type: 'solar_term',
    season: 'autumn',
    summary: '立秋标志着秋季的开始，万物从繁茂成长趋向萧索成熟。',
    content: '立秋，是二十四节气中的第13个节气，秋季的第一个节气。立秋标志着孟秋时节的正式开始，万物从繁茂成长趋向萧索成熟。\n\n立秋并不代表酷热天气就此结束，初秋期间天气仍然很热。所谓"热在三伏"，又有"秋老虎"之说。\n\n立秋有"贴秋膘"、"啃秋"、"晒秋"等习俗。民间有"立秋下雨万物收"的农谚，立秋后如果下雨，对农作物的成熟十分有利。',
    keywords: ['立秋', '节气', '秋天', '贴秋膘', '秋老虎'],
    category: 'farming',
    customs: ['贴秋膘', '啃秋', '晒秋', '秋忙会'],
    farming: '秋收准备、田间管理'
  },
  {
    id: 'chushu',
    name: '处暑',
    month: 8,
    dayRange: [22, 24],
    type: 'solar_term',
    season: 'autumn',
    summary: '处暑即"出暑"，表示炎热离开，暑气将于这一天结束。',
    content: '处暑，是二十四节气中的第14个节气。"处"是终止的意思，处暑表示炎热的暑天结束。处暑之后，气温逐渐下降，暑气渐消。\n\n处暑时节，中国大部分地区气温逐渐下降，但南方地区仍可能有"秋老虎"的余威。此时正是秋高气爽的好时节。\n\n处暑有"放河灯"、"开渔节"、"吃鸭子"等习俗。民间有"处暑满田黄，家家修廪仓"的农谚。',
    keywords: ['处暑', '节气', '出暑', '秋凉', '河灯'],
    category: 'farming',
    customs: ['放河灯', '开渔节', '吃鸭子', '拜土地爷'],
    farming: '秋收准备、晒秋、收割'
  },
  {
    id: 'bailu',
    name: '白露',
    month: 9,
    dayRange: [7, 9],
    type: 'solar_term',
    season: 'autumn',
    summary: '白露是反映自然界寒气增长的重要节气，天气渐凉，露水凝白。',
    content: '白露，是二十四节气中的第15个节气。白露是反映自然界寒气增长的重要节气。进入白露节气后，天气渐凉，夜间空气中的水汽凝成白色露珠，故称白露。\n\n白露时节，秋风送爽，暑气渐消，是一年中最宜人的时节之一。此时，北方地区秋高气爽，南方地区也告别了酷暑。\n\n白露有"收清露"、"饮白露茶"、"吃龙眼"等习俗。民间有"白露秋分夜，一夜凉一夜"的说法。',
    keywords: ['白露', '节气', '秋凉', '露水', '白露茶'],
    category: 'farming',
    customs: ['收清露', '饮白露茶', '吃龙眼', '祭禹王'],
    farming: '秋收秋种、收获晚稻'
  },
  {
    id: 'qiufen',
    name: '秋分',
    month: 9,
    dayRange: [22, 24],
    type: 'solar_term',
    season: 'autumn',
    summary: '秋分这天昼夜等长，之后北半球白天越来越短，天气渐凉。',
    content: '秋分，是二十四节气中的第16个节气。秋分这天，太阳直射赤道，全球昼夜等长。秋分之后，太阳直射点南移，北半球白天越来越短。\n\n秋分时节，中国大部分地区已经进入凉爽的秋季。南下的冷空气与逐渐衰减的暖湿空气相遇，产生一次次的降水，气温也一次次下降。\n\n2018年起，秋分被设立为"中国农民丰收节"。秋分有"竖蛋"、"吃秋菜"、"送秋牛"等习俗。',
    keywords: ['秋分', '节气', '昼夜等长', '丰收节', '秋收'],
    category: 'farming',
    customs: ['竖蛋', '吃秋菜', '送秋牛', '放风筝'],
    farming: '秋收秋种、收获季节'
  },
  {
    id: 'hanlu',
    name: '寒露',
    month: 10,
    dayRange: [7, 9],
    type: 'solar_term',
    season: 'autumn',
    summary: '寒露时节气温更低，地面的露水更冷，快要凝结成霜了。',
    content: '寒露，是二十四节气中的第17个节气。寒露时节，气温比白露时更低，地面的露水更冷，快要凝结成霜了，故称寒露。\n\n寒露时节，中国南方大部分地区气温继续下降，华南日平均气温多不到20℃。北方地区已呈深秋景象，白云红叶，偶见早霜。\n\n寒露有"登高"、"饮菊花酒"、"吃芝麻"等习俗。民间有"寒露寒露，遍地冷露"的说法。',
    keywords: ['寒露', '节气', '秋深', '露寒', '登高'],
    category: 'farming',
    customs: ['登高', '饮菊花酒', '吃芝麻', '赏红叶'],
    farming: '秋收扫尾、播种小麦'
  },
  {
    id: 'shuangjiang',
    name: '霜降',
    month: 10,
    dayRange: [23, 24],
    type: 'solar_term',
    season: 'autumn',
    summary: '霜降是秋季的最后一个节气，天气渐冷，开始有霜。',
    content: '霜降，是二十四节气中的第18个节气，秋季的最后一个节气。霜降时节，天气渐冷，开始有霜。霜降不是表示"降霜"，而是表示气温骤降、昼夜温差大。\n\n霜降过后，植物渐渐失去生机，大地一片萧索。此时，中国黄河流域已出现白霜，千里沃野上，一片银色冰晶熠熠闪光。\n\n霜降有"赏菊"、"吃柿子"、"登高远眺"等习俗。民间有"霜降摘柿子，立冬砍白菜"的说法。',
    keywords: ['霜降', '节气', '秋末', '初霜', '柿子'],
    category: 'farming',
    customs: ['赏菊', '吃柿子', '登高远眺'],
    farming: '秋收结束、储藏过冬'
  },
  {
    id: 'lidong',
    name: '立冬',
    month: 11,
    dayRange: [7, 8],
    type: 'solar_term',
    season: 'winter',
    summary: '立冬表示冬季开始，万物收藏规避寒冷。',
    content: '立冬，是二十四节气中的第19个节气，冬季的第一个节气。立冬表示冬季开始，万物收藏规避寒冷。立冬后，意味着风雨、干湿、光照等都将处于转折点，开始向阴雨寒冻过渡。\n\n立冬时节，太阳已到达黄经225度，北半球获得的太阳辐射量越来越少。但由于地表贮存的热量还有一定的能量，所以一般还不会太冷。\n\n立冬有"补冬"、"吃饺子"、"酿黄酒"等习俗。民间有"立冬补冬，补嘴空"的说法。',
    keywords: ['立冬', '节气', '冬天', '补冬', '饺子'],
    category: 'farming',
    customs: ['补冬', '吃饺子', '酿黄酒', '冬泳'],
    farming: '冬耕、修水利、储藏粮食'
  },
  {
    id: 'xiaoxue',
    name: '小雪',
    month: 11,
    dayRange: [22, 23],
    type: 'solar_term',
    season: 'winter',
    summary: '小雪是反映降水与气温的节气，此时雪还未下大，故称小雪。',
    content: '小雪，是二十四节气中的第20个节气。小雪是反映降水与气温的节气，它是寒潮和强冷空气活动频数较高的节气。小雪节气的到来，意味着天气会越来越冷、降水量渐增。\n\n小雪时节，中国广大地区西北风开始成为常客，气温下降，逐渐降到0℃以下。但大地尚未过于寒冷，虽开始降雪，但雪量不大，故称小雪。\n\n小雪有"腌腊肉"、"吃糍粑"、"晒鱼干"等习俗。民间有"小雪腌菜，大雪腌肉"的说法。',
    keywords: ['小雪', '节气', '初雪', '腌肉', '糍粑'],
    category: 'farming',
    customs: ['腌腊肉', '吃糍粑', '晒鱼干'],
    farming: '兴修水利、冬季积肥'
  },
  {
    id: 'daxue',
    name: '大雪',
    month: 12,
    dayRange: [6, 8],
    type: 'solar_term',
    season: 'winter',
    summary: '大雪节气意味着天气更冷，降雪的可能性比小雪更大了。',
    content: '大雪，是二十四节气中的第21个节气。大雪节气意味着天气更冷，降雪的可能性比小雪时更大了。大雪节气是一个气候概念，它代表的是大雪节气期间的气候特征。\n\n大雪时节，中国大部分地区已进入冬季，最低温度都降到了0℃或以下。在强冷空气前沿冷暖空气交锋的地区，会降大雪甚至暴雪。\n\n大雪有"腌肉"、"吃红薯粥"、"进补"等习俗。民间有"瑞雪兆丰年"的说法，认为大雪对来年丰收有利。',
    keywords: ['大雪', '节气', '降雪', '腌肉', '进补'],
    category: 'farming',
    customs: ['腌肉', '吃红薯粥', '进补'],
    farming: '兴修水利、修整大棚'
  },
  {
    id: 'dongzhi',
    name: '冬至',
    month: 12,
    dayRange: [21, 23],
    type: 'solar_term',
    season: 'winter',
    summary: '冬至是北半球一年中白昼最短的一天，在中国有"冬至大如年"的说法。',
    content: '冬至，是二十四节气中的第22个节气。冬至这天，太阳直射南回归线，北半球白昼最短、黑夜最长。冬至之后，太阳直射点北移，北半球白天渐长。\n\n冬至是中国民间重要的传统节日，有"冬至大如年"的说法。在中国南方，冬至有吃汤圆的习俗；在北方，则习惯吃饺子。冬至也是"数九"的开始。\n\n冬至有"吃饺子"、"吃汤圆"、"祭祖"等习俗。民间有"冬至不端饺子碗，冻掉耳朵没人管"的说法。古人认为冬至是阴阳二气的转化点，是上天赐予的福气。',
    keywords: ['冬至', '节气', '节日', '饺子', '汤圆', '数九'],
    category: 'folklore',
    customs: ['吃饺子', '吃汤圆', '祭祖', '数九'],
    farming: '兴修水利、积肥'
  }
];

const FESTIVALS = [
  {
    id: 'chunjie',
    name: '春节',
    month: 1,
    day: 1,
    lunarDate: true,
    type: 'festival',
    summary: '春节是中国最隆重、最热闹的传统节日，象征团结与兴旺。',
    content: '春节，即中国农历新年，俗称新春、新岁、岁旦等，口头上又称过年、过大年。春节历史悠久，由上古时代岁首祈岁祭祀演变而来。\n\n春节是中华民族最隆重的传统佳节，它不仅集中体现了中华民族的思想信仰、理想愿望、生活娱乐和文化心理，而且还是祈福攘灾、饮食和娱乐活动的狂欢式展示。在春节期间，全国各地均有举行各种庆贺新春活动，带有浓郁的各地域特色。\n\n春节与清明节、端午节、中秋节并称为中国四大传统节日。春节民俗经国务院批准列入第一批国家级非物质文化遗产名录。',
    keywords: ['春节', '过年', '新年', '团圆', '红包', '春联'],
    category: 'folklore',
    customs: ['贴春联', '放鞭炮', '拜年', '发红包', '吃年夜饭', '守岁'],
    hasContribution: true,
    contributionPrompt: '分享你家乡的春节记忆'
  },
  {
    id: 'yuanxiao',
    name: '元宵节',
    month: 1,
    day: 15,
    lunarDate: true,
    type: 'festival',
    summary: '元宵节又称上元节，是春节后的第一个重要节日，有赏花灯、吃元宵的习俗。',
    content: '元宵节，又称上元节、小正月、元夕或灯节，为每年农历正月十五。正月是农历的元月，古人称"夜"为"宵"，正月十五是一年中第一个月圆之夜，所以称正月十五为"元宵节"。\n\n元宵节主要有赏花灯、吃汤圆、猜灯谜、放烟花等一系列传统民俗活动。不少地方还增加了游龙灯、舞狮子、踩高跷、划旱船、扭秧歌、打太平鼓等传统民俗表演。\n\n元宵节是中国与汉字文化圈地区以及海外华人的传统节日之一。2008年6月，元宵节被选入第二批国家级非物质文化遗产名录。',
    keywords: ['元宵节', '花灯', '汤圆', '灯谜', '舞龙'],
    category: 'folklore',
    customs: ['赏花灯', '吃元宵', '猜灯谜', '舞龙舞狮'],
    hasContribution: true,
    contributionPrompt: '分享你的元宵节灯会记忆'
  },
  {
    id: 'longtaitou',
    name: '龙抬头',
    month: 2,
    day: 2,
    lunarDate: true,
    type: 'festival',
    summary: '龙抬头又称"农事节"，象征着春回大地、万物复苏。',
    content: '龙抬头，又称春耕节、农事节、春龙节，是中国的传统节日，在农历二月初二。此时正值惊蛰前后，春回大地，万物复苏，蛰伏的昆虫和动物开始活动。\n\n"龙抬头"的"龙"指的是二十八宿中的东方苍龙七宿星象，每岁仲春卯月之初，"龙角星"就从东方地平线上升起，故称"龙抬头"。\n\n龙抬头有"理发"、"吃龙食"等习俗。民间有"二月二，龙抬头，大家小户使耕牛"的农谚。',
    keywords: ['龙抬头', '春耕', '二月二', '理发', '农事'],
    category: 'farming',
    customs: ['理发', '吃龙食', '祭祀龙王'],
    hasContribution: false
  },
  {
    id: 'duanwu',
    name: '端午节',
    month: 5,
    day: 5,
    lunarDate: true,
    type: 'festival',
    summary: '端午节是中国四大传统节日之一，有赛龙舟、吃粽子等习俗。',
    content: '端午节，又称端阳节、龙舟节、重午节、龙节等，是中国民间的传统节日，与春节、清明节、中秋节并称为中国四大传统节日。\n\n端午节的习俗甚多，全国各地因地域文化不同而又存在着习俗内容或细节上的差异。主要习俗有：扒龙舟、祭龙、采草药、挂艾草与菖蒲、拜神祭祖、洗草药水、打午时水、浸龙舟水、食粽、放纸鸢、睇龙船、拴五色丝线、薰苍术、佩香囊等等。\n\n扒龙舟活动在中国南方沿海一带十分盛行，传出国外后深受各国人民喜爱并形成了国际比赛。端午食粽之习俗，自古以来在中国各地盛行不衰，已成了中华民族影响最大、覆盖面最广的民间饮食习俗之一。',
    keywords: ['端午节', '粽子', '龙舟', '屈原', '艾草', '香囊'],
    category: 'folklore',
    customs: ['赛龙舟', '吃粽子', '挂艾草', '佩香囊', '拴五色丝线'],
    hasContribution: true,
    contributionPrompt: '分享你的端午记忆与家乡粽子'
  },
  {
    id: 'qixi',
    name: '七夕节',
    month: 7,
    day: 7,
    lunarDate: true,
    type: 'festival',
    summary: '七夕节又称乞巧节，源于牛郎织女的传说，是中国传统的情人节。',
    content: '七夕节，又称七巧节、七姐节、女儿节、乞巧节等，是中国民间的传统节日，由星宿崇拜衍化而来，为传统意义上的七姐诞，因拜祭"七姐"活动在七月七晩上举行，故名"七夕"。\n\n七夕节始于汉朝，经历史发展，七夕被赋予了"牛郎织女"的美丽爱情传说，使其成为了象征爱情的节日，从而被认为是中国最具浪漫色彩的传统节日。\n\n七夕有"乞巧"、"拜织女"、"吃巧果"等习俗。2006年，七夕节被列入第一批国家级非物质文化遗产名录。',
    keywords: ['七夕', '牛郎织女', '乞巧', '爱情', '巧果'],
    category: 'folklore',
    customs: ['乞巧', '拜织女', '吃巧果', '观星'],
    hasContribution: false
  },
  {
    id: 'zhongyuan',
    name: '中元节',
    month: 7,
    day: 15,
    lunarDate: true,
    type: 'festival',
    summary: '中元节俗称鬼节，是祭祖和缅怀先人的传统节日。',
    content: '中元节，是道教名称，民间世俗称为七月半、七月十五，佛教则称为盂兰盆节。节日习俗主要有祭祖、放河灯、祀亡魂、焚纸锭、祭祀土地等。\n\n七月半是民间初秋庆贺丰收、酬谢大地的节日，有若干农作物成熟，民间按例要祀祖，用新稻米等祭供，向祖先报告秋成。该节是追怀先人的一种文化传统节日，其文化核心是敬祖尽孝。\n\n中元节有"放河灯"、"祭祖"、"焚纸锭"等习俗。',
    keywords: ['中元节', '祭祖', '河灯', '鬼节', '盂兰盆'],
    category: 'folklore',
    customs: ['祭祖', '放河灯', '焚纸锭'],
    hasContribution: false
  },
  {
    id: 'zhongqiu',
    name: '中秋节',
    month: 8,
    day: 15,
    lunarDate: true,
    type: 'festival',
    summary: '中秋节以月之圆兆人之团圆，寄托思乡思亲之情。',
    content: '中秋节，又称祭月节、月光诞、月夕、秋节、仲秋节、拜月节、月娘节、月亮节、团圆节等，是中国民间的传统节日。中秋节源自天象崇拜，由上古时代秋夕祭月演变而来。\n\n中秋节自古便有祭月、赏月、吃月饼、玩花灯、赏桂花、饮桂花酒等民俗，流传至今，经久不息。中秋节以月之圆兆人之团圆，为寄托思念故乡、思念亲人之情，祈盼丰收、幸福，成为丰富多彩、弥足珍贵的文化遗产。\n\n中秋节与春节、清明节、端午节并称为中国四大传统节日。2006年，中秋节被列入首批国家级非物质文化遗产名录。',
    keywords: ['中秋节', '月饼', '赏月', '团圆', '桂花'],
    category: 'folklore',
    customs: ['赏月', '吃月饼', '玩花灯', '饮桂花酒'],
    hasContribution: true,
    contributionPrompt: '分享你的中秋团圆记忆'
  },
  {
    id: 'chongyang',
    name: '重阳节',
    month: 9,
    day: 9,
    lunarDate: true,
    type: 'festival',
    summary: '重阳节又称敬老节，有登高望远、赏菊饮酒的传统。',
    content: '重阳节，是中国传统节日，节期为每年农历九月初九。"九"数在《易经》中为阳数，"九九"两阳数相重，故曰"重阳"。因日与月皆逢九，故又称为"重九"。\n\n重阳节有登高祈福、秋游赏菊、佩插茱萸、拜神祭祖及饮宴祈寿等习俗。重阳节又被赋予了"敬老节"的新含义，在每年农历九月初九日，倡导全社会树立尊老、敬老、爱老、助老的风气。\n\n重阳节有"登高"、"赏菊"、"插茱萸"、"吃重阳糕"等习俗。2006年，重阳节被列入首批国家级非物质文化遗产名录。',
    keywords: ['重阳节', '敬老', '登高', '菊花', '茱萸'],
    category: 'folklore',
    customs: ['登高', '赏菊', '插茱萸', '吃重阳糕', '敬老'],
    hasContribution: true,
    contributionPrompt: '分享你的重阳敬老故事'
  },
  {
    id: 'laba',
    name: '腊八节',
    month: 12,
    day: 8,
    lunarDate: true,
    type: 'festival',
    summary: '腊八节有喝腊八粥的习俗，是春节前的序幕。',
    content: '腊八节，即每年农历十二月初八，又称为"法宝节"、"佛成道节"、"成道会"等。本为佛教纪念释迦牟尼佛成道之节日，后逐渐也成为民间节日。\n\n腊八节最著名的习俗就是喝腊八粥。腊八粥是一种在腊八节用多种食材熬制的粥，中国各地腊八粥的用料虽有不同，但基本上都包括大米、小米、糯米、高粱米、紫米、薏米等谷类，黄豆、红豆、绿豆、芸豆等豆类，红枣、花生、莲子、枸杞、果仁等干果。\n\n在北方，腊八节还有泡腊八蒜的习俗，用醋泡蒜，蒜瓣会变绿，颜色碧绿如翡翠。',
    keywords: ['腊八节', '腊八粥', '腊八蒜', '年味'],
    category: 'folklore',
    customs: ['喝腊八粥', '泡腊八蒜', '祭祀'],
    hasContribution: false
  },
  {
    id: 'chuyi',
    name: '除夕',
    month: 12,
    day: 30,
    lunarDate: true,
    type: 'festival',
    summary: '除夕是岁末的最后一天夜晚，是除旧布新、阖家团圆的日子。',
    content: '除夕，为岁末的最后一天夜晚。岁末的最后一天称为"岁除"，意为旧岁至此而除，另换新岁。除，即去除之意；夕，指夜晚。"除夕"是岁除之夜的意思，又称大年夜、除夕夜、除夜等。\n\n除夕是除旧布新、阖家团圆、祭祀祖先的日子。除夕自古就有祭祖、守岁、团圆饭、贴年红、挂灯笼等习俗，流传至今，经久不息。\n\n除夕有"吃年夜饭"、"守岁"、"贴春联"、"放鞭炮"等习俗。年夜饭是除夕最重要的一餐，象征合家团圆。',
    keywords: ['除夕', '年夜饭', '守岁', '团圆', '春联'],
    category: 'folklore',
    customs: ['吃年夜饭', '守岁', '贴春联', '放鞭炮', '祭祖'],
    hasContribution: true,
    contributionPrompt: '分享你家的除夕年夜饭'
  }
];

const LUNAR_TO_SOLAR_MAP = {
  2024: {
    '1_1': '2024-02-10',
    '1_15': '2024-02-24',
    '2_2': '2024-03-11',
    '5_5': '2024-06-10',
    '7_7': '2024-08-10',
    '7_15': '2024-08-18',
    '8_15': '2024-09-17',
    '9_9': '2024-10-11',
    '12_8': '2025-01-07',
    '12_30': '2025-01-28'
  },
  2025: {
    '1_1': '2025-01-29',
    '1_15': '2025-02-12',
    '2_2': '2025-03-01',
    '5_5': '2025-05-31',
    '7_7': '2025-08-29',
    '7_15': '2025-09-06',
    '8_15': '2025-10-06',
    '9_9': '2025-10-29',
    '12_8': '2026-01-07',
    '12_30': '2026-02-16'
  },
  2026: {
    '1_1': '2026-02-17',
    '1_15': '2026-03-03',
    '2_2': '2026-03-20',
    '5_5': '2026-06-19',
    '7_7': '2026-08-28',
    '7_15': '2026-09-05',
    '8_15': '2026-10-04',
    '9_9': '2026-10-27',
    '12_8': '2026-12-27',
    '12_30': '2027-02-05'
  }
};

const SOLAR_TERM_EXACT_DATES = {
  2024: {
    'xiaohan': '2024-01-06', 'dahan': '2024-01-20',
    'lichun': '2024-02-04', 'yushui': '2024-02-19',
    'jingzhe': '2024-03-05', 'chunfen': '2024-03-20',
    'qingming': '2024-04-04', 'guyu': '2024-04-19',
    'lixia': '2024-05-05', 'xiaoman': '2024-05-20',
    'mangzhong': '2024-06-05', 'xiazhi': '2024-06-21',
    'xiaoshu': '2024-07-06', 'dashu': '2024-07-22',
    'liqiu': '2024-08-07', 'chushu': '2024-08-22',
    'bailu': '2024-09-07', 'qiufen': '2024-09-22',
    'hanlu': '2024-10-08', 'shuangjiang': '2024-10-23',
    'lidong': '2024-11-07', 'xiaoxue': '2024-11-22',
    'daxue': '2024-12-06', 'dongzhi': '2024-12-21'
  },
  2025: {
    'xiaohan': '2025-01-05', 'dahan': '2025-01-20',
    'lichun': '2025-02-03', 'yushui': '2025-02-18',
    'jingzhe': '2025-03-05', 'chunfen': '2025-03-20',
    'qingming': '2025-04-04', 'guyu': '2025-04-20',
    'lixia': '2025-05-05', 'xiaoman': '2025-05-21',
    'mangzhong': '2025-06-05', 'xiazhi': '2025-06-21',
    'xiaoshu': '2025-07-07', 'dashu': '2025-07-22',
    'liqiu': '2025-08-07', 'chushu': '2025-08-23',
    'bailu': '2025-09-07', 'qiufen': '2025-09-22',
    'hanlu': '2025-10-08', 'shuangjiang': '2025-10-23',
    'lidong': '2025-11-07', 'xiaoxue': '2025-11-22',
    'daxue': '2025-12-07', 'dongzhi': '2025-12-21'
  },
  2026: {
    'xiaohan': '2026-01-05', 'dahan': '2026-01-20',
    'lichun': '2026-02-04', 'yushui': '2026-02-18',
    'jingzhe': '2026-03-05', 'chunfen': '2026-03-20',
    'qingming': '2026-04-05', 'guyu': '2026-04-20',
    'lixia': '2026-05-05', 'xiaoman': '2026-05-21',
    'mangzhong': '2026-06-05', 'xiazhi': '2026-06-21',
    'xiaoshu': '2026-07-07', 'dashu': '2026-07-22',
    'liqiu': '2026-08-07', 'chushu': '2026-08-23',
    'bailu': '2026-09-07', 'qiufen': '2026-09-23',
    'hanlu': '2026-10-08', 'shuangjiang': '2026-10-23',
    'lidong': '2026-11-07', 'xiaoxue': '2026-11-22',
    'daxue': '2026-12-07', 'dongzhi': '2026-12-21'
  }
};

const getFestivalSolarDate = (festival, year) => {
  if (!festival.lunarDate) {
    return `${year}-${String(festival.month).padStart(2, '0')}-${String(festival.day).padStart(2, '0')}`;
  }
  const yearMap = LUNAR_TO_SOLAR_MAP[year];
  if (!yearMap) return null;
  const key = `${festival.month}_${festival.day}`;
  return yearMap[key] || null;
};

const getEventsForDate = (year, month, day) => {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const events = [];

  const yearTerms = SOLAR_TERM_EXACT_DATES[year];
  if (yearTerms) {
    SOLAR_TERMS.forEach(term => {
      const termDate = yearTerms[term.id];
      if (termDate === dateStr) {
        events.push({ ...term, date: dateStr });
      }
    });
  }

  FESTIVALS.forEach(festival => {
    const solarDate = getFestivalSolarDate(festival, year);
    if (solarDate === dateStr) {
      events.push({ ...festival, date: dateStr });
    }
  });

  return events;
};

const getEventsForMonth = (year, month) => {
  const eventMap = {};

  const yearTerms = SOLAR_TERM_EXACT_DATES[year];
  if (yearTerms) {
    SOLAR_TERMS.forEach(term => {
      const termDate = yearTerms[term.id];
      if (termDate) {
        const termMonth = parseInt(termDate.split('-')[1], 10);
        if (termMonth === month) {
          const termDay = parseInt(termDate.split('-')[2], 10);
          if (!eventMap[termDay]) eventMap[termDay] = [];
          eventMap[termDay].push({ ...term, date: termDate });
        }
      }
    });
  }

  FESTIVALS.forEach(festival => {
    const solarDate = getFestivalSolarDate(festival, year);
    if (solarDate) {
      const festMonth = parseInt(solarDate.split('-')[1], 10);
      if (festMonth === month) {
        const festDay = parseInt(solarDate.split('-')[2], 10);
        if (!eventMap[festDay]) eventMap[festDay] = [];
        eventMap[festDay].push({ ...festival, date: solarDate });
      }
    }
  });

  return eventMap;
};

const matchArticlesByKeywords = (event, articles) => {
  if (!event || !event.keywords || !articles) return [];
  const keywords = event.keywords.map(k => k.toLowerCase());
  return articles.filter(article => {
    if (article.status !== 1) return false;
    const title = (article.title || '').toLowerCase();
    const content = (article.content || '').toLowerCase();
    const articleCategory = article.category || '';
    let score = 0;
    keywords.forEach(kw => {
      if (title.includes(kw)) score += 3;
      if (content.includes(kw)) score += 1;
    });
    if (event.category && articleCategory === event.category) score += 2;
    article._matchScore = score;
    return score > 0;
  }).sort((a, b) => b._matchScore - a._matchScore).map(a => {
    const { _matchScore, ...rest } = a;
    return rest;
  });
};

const getSubscriptions = () => {
  return wx.getStorageSync('calendarSubscriptions') || {};
};

const subscribeEvent = (eventId) => {
  const subs = getSubscriptions();
  subs[eventId] = { subscribed: true, subscribeTime: new Date().toISOString() };
  wx.setStorageSync('calendarSubscriptions', subs);
  return true;
};

const unsubscribeEvent = (eventId) => {
  const subs = getSubscriptions();
  delete subs[eventId];
  wx.setStorageSync('calendarSubscriptions', subs);
  return true;
};

const isSubscribed = (eventId) => {
  const subs = getSubscriptions();
  return !!(subs[eventId] && subs[eventId].subscribed);
};

const getAllEventIds = () => {
  const allEvents = [...SOLAR_TERMS, ...FESTIVALS];
  return allEvents.map(e => e.id);
};

const getSubscribedEventIds = () => {
  const subs = getSubscriptions();
  return Object.keys(subs).filter(id => subs[id] && subs[id].subscribed);
};

module.exports = {
  SOLAR_TERMS,
  FESTIVALS,
  LUNAR_TO_SOLAR_MAP,
  SOLAR_TERM_EXACT_DATES,
  getEventsForDate,
  getEventsForMonth,
  getFestivalSolarDate,
  matchArticlesByKeywords,
  getSubscriptions,
  subscribeEvent,
  unsubscribeEvent,
  isSubscribed,
  getAllEventIds,
  getSubscribedEventIds
};
