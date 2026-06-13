var DIFFICULTY_LEVELS = [
  { id: 'beginner', name: '入门', icon: '🟢', desc: '零基础可学' },
  { id: 'intermediate', name: '进阶', icon: '🟡', desc: '需要一定基础' },
  { id: 'advanced', name: '精通', icon: '🔴', desc: '需要丰富经验' }
];

var CRAFT_CATEGORIES = [
  { id: 'weaving', name: '编织', icon: '🧶', desc: '竹编、草编、藤编等' },
  { id: 'pottery', name: '陶艺', icon: '🏺', desc: '制陶、上釉、烧窑等' },
  { id: 'dyeing', name: '印染', icon: '🎨', desc: '扎染、蜡染、蓝印花布等' },
  { id: 'paper', name: '纸艺', icon: '📜', desc: '剪纸、扎纸、皮影等' },
  { id: 'wood', name: '木作', icon: '🪵', desc: '木雕、榫卯、家具等' },
  { id: 'metal', name: '金工', icon: '⚒️', desc: '锻打、铸造、錾刻等' },
  { id: 'embroidery', name: '刺绣', icon: '🧵', desc: '苏绣、湘绣、蜀绣等' },
  { id: 'lacquer', name: '漆艺', icon: '🖌️', desc: '大漆、推光、雕漆等' },
  { id: 'food', name: '饮食', icon: '🍜', desc: '传统酿造、腌制、糕点等' },
  { id: 'other', name: '其他', icon: '✨', desc: '其他传统工艺' }
];

var TOOL_LIST = [
  '竹篾', '刻刀', '剪刀', '织机', '染缸', '陶轮',
  '窑炉', '木槌', '刨子', '锯子', '锉刀', '砂纸',
  '绣针', '绣框', '漆刷', '蜡刀', '磨石', '铜锤',
  '砧板', '蒸笼', '酒曲', '卤锅', '擀面杖', '模具'
];

var TIME_RANGES = [
  { id: 'lt1h', name: '1小时以内', min: 0, max: 60 },
  { id: '1to4h', name: '1-4小时', min: 60, max: 240 },
  { id: '1to3d', name: '1-3天', min: 240, max: 4320 },
  { id: '1to2w', name: '1-2周', min: 4320, max: 20160 },
  { id: 'gt2w', name: '2周以上', min: 20160, max: Infinity }
];

var DEFAULT_TUTORIALS = [
  {
    id: 'tut_weaving_001',
    title: '竹编果篮制作教程',
    category: 'weaving',
    difficulty: 'beginner',
    timeRequired: 180,
    tools: ['竹篾', '剪刀', '刻刀'],
    summary: '从选竹到成品，一步步学会制作实用又美观的竹编果篮。传统竹编工艺入门首选，零基础也能完成。',
    introduction: '竹编是中国最古老的编织工艺之一，距今已有数千年历史。一把竹篾、一双巧手，就能编织出兼具实用与美感的器物。本教程以果篮为入门作品，带您体验竹编的基本技法——起底、编织、收口，完成一件可日常使用的竹编果篮。',
    materials: [
      { name: '毛竹', spec: '直径4-6cm，长约2m', quantity: '1根', note: '选3年以上老竹，质地坚韧' },
      { name: '清水', spec: '', quantity: '适量', note: '浸泡竹篾用' },
      { name: '细铁丝', spec: '0.5mm', quantity: '少量', note: '用于固定收口处' }
    ],
    steps: [
      { step: 1, title: '选竹与劈篾', keyPoint: '选取3年以上老竹，沿纵向劈成宽约8mm的竹篾', caution: '劈篾时注意安全，刀口朝外。竹篾宽窄需均匀，否则影响编织效果', duration: 30 },
      { step: 2, title: '浸泡竹篾', keyPoint: '将竹篾放入清水中浸泡30分钟以上，使其柔韧不易折断', caution: '浸泡时间不宜过长，否则竹篾变软变形', duration: 35 },
      { step: 3, title: '起底', keyPoint: '用6根竹篾交叉排列成"米"字形底架，再逐圈编织底部', caution: '底架交叉处需紧密贴合，可用细铁丝临时固定', duration: 40 },
      { step: 4, title: '编织侧面', keyPoint: '将竹篾从底部向上弯折，采用"挑一压一"技法逐圈编织侧面', caution: '保持编织张力均匀，松紧不一会导致篮体歪斜', duration: 50 },
      { step: 5, title: '收口', keyPoint: '将顶端竹篾向内折叠，穿插固定，形成平整的收口边沿', caution: '收口是竹编难点，需耐心操作，确保篾头藏入篮内不外露', duration: 20 },
      { step: 6, title: '整形与修整', keyPoint: '用手指或木槌轻敲篮体使其规整，修剪多余篾头', caution: '修整时不要剪太短，篾头至少留5mm以防松脱', duration: 5 }
    ],
    commonMistakes: [
      { title: '竹篾宽窄不一', desc: '新手常犯的错误是劈篾粗细不均，导致编织后表面凹凸不平。建议先用废竹多练习劈篾，熟练后再开始正式制作。' },
      { title: '浸泡不充分', desc: '竹篾未充分浸泡就直接编织，容易折断。尤其在干燥季节，至少浸泡30分钟。冬天可用温水加速软化。' },
      { title: '编织张力不均', desc: '编织时松紧不一，成品会歪斜变形。建议每编完一圈检查张力，保持手感一致。' },
      { title: '收口粗糙', desc: '收口处理不当会导致篾头外露，既不美观又可能划伤手。篾头一定要藏入篮内，反复确认无尖锐外露。' }
    ],
    furtherReading: [
      { title: '中国竹编艺术', type: 'book', desc: '系统介绍中国各地竹编流派与技法的经典著作' },
      { title: '竹编入门视频课', type: 'video', desc: '国家非遗传承人录制的系列教学视频' }
    ],
    relatedFigureId: '',
    relatedLandmarkId: '',
    relatedEncyclopediaId: '',
    tags: ['竹编', '编织', '果篮', '入门'],
    viewCount: 2856,
    likeCount: 723,
    checkInCount: 342,
    reviewCount: 89,
    authorId: 'admin_craft',
    authorName: '工艺编辑部',
    createTime: '2024-12-10',
    status: 1
  },
  {
    id: 'tut_dyeing_001',
    title: '扎染手帕制作教程',
    category: 'dyeing',
    difficulty: 'beginner',
    timeRequired: 240,
    tools: ['染缸', '橡皮筋', '剪刀'],
    summary: '学习传统扎染技艺，从扎花到染色，制作独一无二的扎染手帕。体验非遗魅力的最佳入门之选。',
    introduction: '扎染古称"绞缬"，是中国古老的纺织品染色工艺，以线绳扎结布料后浸入染液，形成独特花纹。本教程以手帕为载体，教您掌握基本的扎花手法和蓝染工艺，制作一条属于自己的扎染手帕。',
    materials: [
      { name: '白色棉布', spec: '30cm×30cm', quantity: '1块', note: '纯棉白布效果最佳' },
      { name: '板蓝根染料', spec: '天然植物染料', quantity: '50g', note: '可用市售蓝靛粉替代' },
      { name: '橡皮筋', spec: '普通款', quantity: '若干', note: '用于扎花' },
      { name: '棉线', spec: '粗棉线', quantity: '1卷', note: '用于绑扎' },
      { name: '食盐', spec: '', quantity: '20g', note: '固色用' }
    ],
    steps: [
      { step: 1, title: '准备染液', keyPoint: '将板蓝根染料用温水化开，加入食盐搅匀，放置30分钟使染液充分氧化', caution: '染液需在通风处配制，避免误食。调配时戴手套防染色', duration: 40 },
      { step: 2, title: '湿水处理', keyPoint: '将棉布用清水浸湿后拧至半干，使布料更容易上色均匀', caution: '布料需完全浸透，否则染后会出现生硬的色块分界', duration: 5 },
      { step: 3, title: '扎花', keyPoint: '用橡皮筋或棉线将布料扎出花纹，扎得越紧留白越多，花纹越清晰', caution: '扎花手法决定最终图案，新手建议先从简单的同心圆扎法开始', duration: 30 },
      { step: 4, title: '浸染', keyPoint: '将扎好的布料完全浸入染液，浸泡15-20分钟，期间轻轻翻动', caution: '浸泡时间越长颜色越深，但不超过30分钟，否则可能过度染色', duration: 20 },
      { step: 5, title: '氧化固色', keyPoint: '取出布料暴露在空气中氧化10分钟，布面会从黄绿变为蓝色', caution: '氧化过程不要解开扎线，否则花纹会模糊', duration: 15 },
      { step: 6, title: '清洗晾干', keyPoint: '先不解扎线，用清水冲洗至水变清，再解开扎线，晾干即可', caution: '清洗时水流不宜过猛，以免花纹散开。晾晒避免暴晒', duration: 15 }
    ],
    commonMistakes: [
      { title: '扎线不够紧', desc: '扎线松散会导致染液渗入留白区域，花纹模糊不清晰。扎线时一定要拧紧，用力拉扯确认不会松脱。' },
      { title: '布料未湿透', desc: '干布直接浸染，上色不均匀，容易出现色块。浸染前务必将布料完全浸湿。' },
      { title: '氧化时间不足', desc: '刚取出就拆线，花纹颜色偏绿且不稳固。至少氧化10分钟，等布面完全变蓝再拆线。' },
      { title: '清洗过度', desc: '用力搓洗会导致花纹边缘模糊，颜色变浅。轻轻漂洗至水变清即可。' }
    ],
    furtherReading: [
      { title: '中国扎染艺术史', type: 'book', desc: '梳理扎染工艺从古至今的发展脉络' },
      { title: '大理白族扎染', type: 'encyclopedia', desc: '国家级非遗项目，白族传统扎染工艺详解' }
    ],
    relatedFigureId: '',
    relatedLandmarkId: '',
    relatedEncyclopediaId: '',
    tags: ['扎染', '蓝染', '手帕', '入门'],
    viewCount: 3150,
    likeCount: 892,
    checkInCount: 456,
    reviewCount: 127,
    authorId: 'admin_craft',
    authorName: '工艺编辑部',
    createTime: '2024-12-08',
    status: 1
  },
  {
    id: 'tut_pottery_001',
    title: '手捏茶杯制作教程',
    category: 'pottery',
    difficulty: 'intermediate',
    timeRequired: 480,
    tools: ['陶轮', '窑炉', '砂纸', '刻刀'],
    summary: '从揉泥到烧制，完整学习手工制陶流程，亲手制作一只质朴温暖的手捏茶杯。',
    introduction: '陶艺是中国最重要的传统手工艺之一，从新石器时代延续至今。手捏法是最原始也最自由的制陶方式，无需拉坯机，仅凭双手塑形。本教程将带您完成从揉泥、捏制、修坯、上釉到烧制的完整流程，制作一只独一无二的手捏茶杯。',
    materials: [
      { name: '陶泥', spec: '中粗陶泥', quantity: '500g', note: '初学者建议用含砂陶泥，不易开裂' },
      { name: '釉料', spec: '透明釉或白釉', quantity: '适量', note: '可在陶艺店购买成品釉' },
      { name: '水', spec: '', quantity: '适量', note: '用于润湿和修坯' },
      { name: '海绵', spec: '', quantity: '1块', note: '用于抛光表面' }
    ],
    steps: [
      { step: 1, title: '揉泥', keyPoint: '将陶泥反复揉搓排气，揉至泥团均匀无气泡，约需10-15分钟', caution: '气泡是烧制开裂的主因，揉泥必须充分。揉泥时在帆布上操作防粘', duration: 15 },
      { step: 2, title: '捏制杯体', keyPoint: '用拇指从泥球中心按压，配合手指从外部捏塑，逐渐撑大杯体', caution: '杯壁厚薄要均匀，约5-8mm为宜。过厚烧制时易炸裂，过薄会变形', duration: 30 },
      { step: 3, title: '修整杯口', keyPoint: '用湿手指或海绵沿杯口轻轻抹平，使杯口圆润光滑', caution: '杯口是使用时嘴唇接触的部位，需格外注意修整平整', duration: 10 },
      { step: 4, title: '制作杯把', keyPoint: '搓一根粗细均匀的泥条，弯成把手形状，用泥浆粘接到杯体', caution: '粘接处需打毛涂泥浆，否则烧制后把子会脱落', duration: 15 },
      { step: 5, title: '阴干', keyPoint: '将做好的茶杯放在阴凉通风处自然干燥2-3天至完全干透', caution: '不可日晒或烘干，急速失水会导致开裂。阴干期间不要移动', duration: 2880 },
      { step: 6, title: '素烧', keyPoint: '将干透的茶杯放入窑中，缓慢升温至800°C素烧，使坯体硬化', caution: '升温速度不可过快，建议每小时升温不超过100°C', duration: 480 },
      { step: 7, title: '上釉与烧成', keyPoint: '素烧坯冷却后施釉，再放入窑中升温至1200°C烧成', caution: '釉层不可过厚，否则会流淌粘窑板。底部需留1cm不上釉', duration: 480 }
    ],
    commonMistakes: [
      { title: '揉泥不充分', desc: '泥中有残留气泡，烧制时气泡膨胀导致开裂甚至炸窑。揉泥时听到"啪"的气泡声，需继续揉至消失。' },
      { title: '杯壁厚薄不均', desc: '手捏时各处用力不均，导致杯壁一边厚一边薄。薄处烧制时可能变形穿孔。边捏边用手感受厚度。' },
      { title: '阴干过急', desc: '急于烧制而用烘干或暴晒加速干燥，坯体开裂报废。耐心等待是最稳妥的方法。' },
      { title: '釉层过厚', desc: '上釉过厚导致烧成时釉面流淌，粘连窑板。釉层以薄而均匀为佳，蘸釉一次即可。' }
    ],
    furtherReading: [
      { title: '中国陶瓷史', type: 'book', desc: '叶喆民著，系统阐述中国陶瓷发展全貌' },
      { title: '景德镇手工制瓷技艺', type: 'encyclopedia', desc: '国家级非遗，景德镇传统制瓷72道工序详解' }
    ],
    relatedFigureId: '',
    relatedLandmarkId: '',
    relatedEncyclopediaId: '',
    tags: ['陶艺', '茶杯', '手捏', '进阶'],
    viewCount: 2456,
    likeCount: 634,
    checkInCount: 198,
    reviewCount: 56,
    authorId: 'admin_craft',
    authorName: '工艺编辑部',
    createTime: '2024-12-05',
    status: 1
  },
  {
    id: 'tut_paper_001',
    title: '窗花剪纸入门教程',
    category: 'paper',
    difficulty: 'beginner',
    timeRequired: 60,
    tools: ['剪刀', '刻刀'],
    summary: '一把剪刀一张红纸，学习传统窗花剪纸的基本折剪法，剪出喜庆吉祥的窗花图案。',
    introduction: '剪纸是中国最普及的民间艺术之一，2009年入选联合国教科文组织人类非物质文化遗产代表作名录。窗花是最具代表性的剪纸形式，每逢春节贴于窗上，寓意吉祥喜庆。本教程从最基础的对折剪法开始，带您剪出第一张属于自己的窗花。',
    materials: [
      { name: '红色宣纸', spec: '单面红', quantity: '5张', note: '初学可用普通红纸替代' },
      { name: '剪刀', spec: '尖头小剪', quantity: '1把', note: '刀尖要尖细灵活' },
      { name: '铅笔', spec: 'HB', quantity: '1支', note: '用于画底稿' }
    ],
    steps: [
      { step: 1, title: '折纸', keyPoint: '将正方形红纸对折三次（三角折法），折出8层对称的三角形', caution: '每次折叠要对齐边缘，不对称会导致剪出的图案歪斜', duration: 3 },
      { step: 2, title: '画底稿', keyPoint: '在折好的三角形上用铅笔画出要剪的图案轮廓，注意预留连接点', caution: '图案各部分之间必须保留连接点，否则展开后会散架', duration: 10 },
      { step: 3, title: '剪轮廓', keyPoint: '沿铅笔线先剪外轮廓，再剪内部镂空部分，由大到小依次剪裁', caution: '右手持剪不动，左手转动纸张配合。剪细小部分时放慢速度', duration: 20 },
      { step: 4, title: '展开整形', keyPoint: '将剪好的纸轻轻展开，抚平折痕，检查对称性和完整性', caution: '展开时动作要轻，纸层粘连处用手轻轻拨开，不要用力拉扯', duration: 5 }
    ],
    commonMistakes: [
      { title: '未留连接点', desc: '剪的时候把图案各部分完全剪断，展开后图案散成碎片。画底稿时一定要检查各部分之间是否有连接。' },
      { title: '折叠不对齐', desc: '折纸时边缘未对齐，展开后图案不对称。每次折叠都要仔细对齐，这是窗花对称美的基础。' },
      { title: '剪口粗糙', desc: '剪刀不够锋利或手法不稳，导致剪口毛糙。建议使用尖头小剪，一次剪断不反复修剪。' },
      { title: '展开时撕裂', desc: '纸层粘在一起，用力拉扯导致撕裂。应耐心用手轻轻拨开，实在粘紧处可用针尖挑开。' }
    ],
    furtherReading: [
      { title: '中国民间剪纸艺术', type: 'book', desc: '全面介绍中国各地剪纸风格与技法' },
      { title: '剪纸艺术百科', type: 'encyclopedia', desc: '从历史渊源到现代创新的剪纸知识大全' }
    ],
    relatedFigureId: '',
    relatedLandmarkId: '',
    relatedEncyclopediaId: '',
    tags: ['剪纸', '窗花', '入门', '春节'],
    viewCount: 3890,
    likeCount: 1045,
    checkInCount: 678,
    reviewCount: 234,
    authorId: 'admin_craft',
    authorName: '工艺编辑部',
    createTime: '2024-12-01',
    status: 1
  }
];

var getDifficultyInfo = function(id) {
  return DIFFICULTY_LEVELS.find(function(d) { return d.id === id; }) || null;
};

var getCategoryInfo = function(id) {
  return CRAFT_CATEGORIES.find(function(c) { return c.id === id; }) || null;
};

var getCategoryList = function() {
  return CRAFT_CATEGORIES.map(function(c) {
    return { id: c.id, name: c.name, icon: c.icon, desc: c.desc };
  });
};

var getDifficultyList = function() {
  return DIFFICULTY_LEVELS.map(function(d) {
    return { id: d.id, name: d.name, icon: d.icon, desc: d.desc };
  });
};

var getTimeRangeInfo = function(id) {
  return TIME_RANGES.find(function(t) { return t.id === id; }) || null;
};

var formatTimeRequired = function(minutes) {
  if (!minutes || minutes <= 0) return '';
  if (minutes < 60) return minutes + '分钟';
  if (minutes < 1440) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return m > 0 ? h + '小时' + m + '分钟' : h + '小时';
  }
  var d = Math.floor(minutes / 1440);
  var remainH = Math.floor((minutes % 1440) / 60);
  return remainH > 0 ? d + '天' + remainH + '小时' : d + '天';
};

var filterTutorials = function(tutorials, options) {
  var category = options.category || 'all';
  var difficulty = options.difficulty || 'all';
  var timeRange = options.timeRange || 'all';
  var keyword = options.keyword || '';

  var filtered = tutorials;

  if (category && category !== 'all') {
    filtered = filtered.filter(function(item) { return item.category === category; });
  }
  if (difficulty && difficulty !== 'all') {
    filtered = filtered.filter(function(item) { return item.difficulty === difficulty; });
  }
  if (timeRange && timeRange !== 'all') {
    var range = TIME_RANGES.find(function(t) { return t.id === timeRange; });
    if (range) {
      filtered = filtered.filter(function(item) {
        return item.timeRequired >= range.min && item.timeRequired < range.max;
      });
    }
  }
  if (keyword && keyword.trim()) {
    var kw = keyword.toLowerCase().trim();
    filtered = filtered.filter(function(item) {
      return item.title.toLowerCase().includes(kw) ||
        item.summary.toLowerCase().includes(kw) ||
        (item.tags && item.tags.some(function(t) { return t.toLowerCase().includes(kw); }));
    });
  }

  return filtered;
};

var getDefaultTutorials = function() {
  return JSON.parse(JSON.stringify(DEFAULT_TUTORIALS));
};

var initCraftTutorialData = function() {
  var stored = wx.getStorageSync('craftTutorials');
  if (!stored || stored.length === 0) {
    wx.setStorageSync('craftTutorials', getDefaultTutorials());
  }
  var checkins = wx.getStorageSync('tutorialCheckins');
  if (!checkins) {
    wx.setStorageSync('tutorialCheckins', {});
  }
  var reviews = wx.getStorageSync('tutorialReviews');
  if (!reviews) {
    wx.setStorageSync('tutorialReviews', {});
  }
};

var convertArticleToTutorial = function(article) {
  return {
    title: article.title || '',
    category: '',
    difficulty: 'beginner',
    timeRequired: 0,
    tools: [],
    summary: article.summary || '',
    introduction: article.content ? article.content.substring(0, 200) : '',
    materials: [],
    steps: [],
    commonMistakes: [],
    furtherReading: [],
    relatedFigureId: article.figureId || '',
    relatedLandmarkId: '',
    relatedEncyclopediaId: '',
    tags: article.tags || [],
    sourceArticleId: article.id || ''
  };
};

module.exports = {
  DIFFICULTY_LEVELS: DIFFICULTY_LEVELS,
  CRAFT_CATEGORIES: CRAFT_CATEGORIES,
  TOOL_LIST: TOOL_LIST,
  TIME_RANGES: TIME_RANGES,
  DEFAULT_TUTORIALS: DEFAULT_TUTORIALS,
  getDifficultyInfo: getDifficultyInfo,
  getCategoryInfo: getCategoryInfo,
  getCategoryList: getCategoryList,
  getDifficultyList: getDifficultyList,
  getTimeRangeInfo: getTimeRangeInfo,
  formatTimeRequired: formatTimeRequired,
  filterTutorials: filterTutorials,
  getDefaultTutorials: getDefaultTutorials,
  initCraftTutorialData: initCraftTutorialData,
  convertArticleToTutorial: convertArticleToTutorial
};
