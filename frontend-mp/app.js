// app.js
const api = require('./utils/api');
const figureData = require('./utils/figure-data');

App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    baseUrl: 'http://localhost:3000',
    useRemote: false
  },

  onLaunch() {
    this.initApiConfig();
    this.checkLoginStatus();
    this.initMockData();
  },

  initApiConfig() {
    api.setConfig({
      useRemote: this.globalData.useRemote,
      baseUrl: this.globalData.baseUrl
    });
    console.log('[API] 配置已初始化:', api.getConfig());
  },

  switchDataSource(useRemote) {
    this.globalData.useRemote = useRemote;
    api.setConfig({
      useRemote: useRemote,
      baseUrl: this.globalData.baseUrl
    });
    console.log('[API] 数据源已切换:', useRemote ? '远程服务' : '本地存储');
  },

  setBaseUrl(baseUrl) {
    this.globalData.baseUrl = baseUrl;
    api.setConfig({
      baseUrl: baseUrl
    });
    console.log('[API] baseUrl 已更新:', baseUrl);
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn') || false;
    const userInfo = wx.getStorageSync('userInfo');

    if (isLoggedIn && userInfo) {
      this.globalData.isLoggedIn = true;
      this.globalData.userInfo = userInfo;
    } else {
      this.globalData.isLoggedIn = false;
      this.globalData.userInfo = null;
    }
  },

  // 登录
  login(userInfo) {
    const user = userInfo || {
      id: 'user_' + Date.now(),
      nickname: '乡村文化爱好者',
      avatar: '',
      phone: '',
      createTime: new Date().toISOString().split('T')[0]
    };

    wx.setStorageSync('userInfo', user);
    wx.setStorageSync('isLoggedIn', true);
    this.globalData.userInfo = user;
    this.globalData.isLoggedIn = true;

    return user;
  },

  // 退出登录
  logout() {
    wx.removeStorageSync('isLoggedIn');
    wx.removeStorageSync('userInfo');
    this.globalData.isLoggedIn = false;
    this.globalData.userInfo = null;
  },

  // 检查是否登录，未登录则跳转登录页
  checkLogin() {
    if (!this.globalData.isLoggedIn) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return false;
    }
    return true;
  },

  // 获取用户信息
  getUserInfo() {
    return this.globalData.userInfo;
  },

  // 获取登录状态
  getLoginStatus() {
    return this.globalData.isLoggedIn;
  },

  // 更新用户信息
  updateUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  },

  // 初始化 Mock 数据
  initMockData() {
    // 初始化人物数据
    figureData.initFigureData();

    // 检查是否已有文章数据
    const articles = wx.getStorageSync('articles');
    if (!articles || articles.length === 0) {
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
      wx.setStorageSync('articles', defaultArticles);
    }

    // 初始化分类数据
    const categories = wx.getStorageSync('categories');
    if (!categories || categories.length === 0) {
      const defaultCategories = [
        { id: 'all', name: '全部', icon: 'all', sort: 0 },
        { id: 'folklore', name: '民俗故事', icon: 'folklore', sort: 1 },
        { id: 'farming', name: '农耕智慧', icon: 'farming', sort: 2 },
        { id: 'craft', name: '传统技艺', icon: 'craft', sort: 3 },
        { id: 'memory', name: '乡土记忆', icon: 'memory', sort: 4 }
      ];
      wx.setStorageSync('categories', defaultCategories);
    }

    // 初始化专题数据
    const topics = wx.getStorageSync('topics');
    if (!topics || topics.length === 0) {
      const defaultTopics = [
        {
          id: 'topic_001',
          title: '端午民俗专题',
          cover: '',
          introduction: '端午节，又称端阳节、龙舟节，是中国传统四大节日之一。两千多年来，端午节的习俗代代相传，承载着中华民族的文化记忆和家国情怀。本专题将带您深入了解端午节的由来、各地习俗以及相关的文化故事。',
          category: 'festival',
          articleIds: ['article_004', 'article_005'],
          extendedReading: [
            { title: '屈原与端午节的传说', source: '人民日报', url: '' },
            { title: '全国各地端午习俗一览', source: '中国文化报', url: '' }
          ],
          relatedTopicIds: ['topic_003'],
          tags: ['端午节', '民俗', '传统文化'],
          authorId: 'user_admin',
          authorName: '管理员',
          viewCount: 1256,
          likeCount: 328,
          createTime: '2024-12-20',
          status: 1
        },
        {
          id: 'topic_002',
          title: '传统织布技艺',
          cover: '',
          introduction: '中国传统织布技艺源远流长，距今已有七千多年历史。从原始的腰机到复杂的花楼织机，从质朴的土布到华丽的云锦，织布技艺见证了中华文明的发展。本专题带您探索这项古老技艺的魅力。',
          category: 'craft',
          articleIds: ['article_002'],
          extendedReading: [
            { title: '中国四大名锦', source: '中国非物质文化遗产网', url: '' },
            { title: '黄道婆与纺织技术革新', source: '历史春秋', url: '' }
          ],
          relatedTopicIds: ['topic_005'],
          tags: ['织布', '传统技艺', '非物质文化遗产'],
          authorId: 'user_admin',
          authorName: '管理员',
          viewCount: 892,
          likeCount: 256,
          createTime: '2024-12-18',
          status: 1
        },
        {
          id: 'topic_003',
          title: '二十四节气与农耕',
          cover: '',
          introduction: '二十四节气是中国古代农耕文明的产物，被誉为"中国的第五大发明"。它不仅指导着传统农业生产，更蕴含着中华民族对自然规律的深刻认知。本专题详细解读二十四节气的文化内涵。',
          category: 'festival',
          articleIds: ['article_001', 'article_005'],
          extendedReading: [
            { title: '二十四节气的科学依据', source: '中国气象局', url: '' },
            { title: '节气与养生', source: '健康时报', url: '' }
          ],
          relatedTopicIds: ['topic_001'],
          tags: ['二十四节气', '农耕', '传统文化'],
          authorId: 'user_admin',
          authorName: '管理员',
          viewCount: 2134,
          likeCount: 567,
          createTime: '2024-12-15',
          status: 1
        },
        {
          id: 'topic_004',
          title: '乡村记忆·老物件',
          cover: '',
          introduction: '每一件老物件都承载着一段历史，每一个老故事都记录着一种生活。从石磨、纺车到煤油灯，这些曾经与我们生活息息相关的物品，如今已渐渐淡出人们的视野。让我们一起重温那些温暖的乡村记忆。',
          category: 'custom',
          articleIds: ['article_003'],
          extendedReading: [
            { title: '正在消失的老物件', source: '中国文化报', url: '' },
            { title: '老物件里的时光故事', source: '读者', url: '' }
          ],
          relatedTopicIds: ['topic_005'],
          tags: ['老物件', '乡村记忆', '怀旧'],
          authorId: 'user_admin',
          authorName: '管理员',
          viewCount: 1567,
          likeCount: 412,
          createTime: '2024-12-12',
          status: 1
        },
        {
          id: 'topic_005',
          title: '民间传统手工艺人',
          cover: '',
          introduction: '在乡村的角落里，有这样一群人，他们用双手传承着千百年的技艺，用匠心守护着文化的根脉。本专题带您走近那些坚守传统的手工艺人，聆听他们的故事。',
          category: 'figure',
          articleIds: [],
          extendedReading: [
            { title: '非遗传承人的坚守与创新', source: '光明日报', url: '' }
          ],
          relatedTopicIds: ['topic_002', 'topic_004'],
          tags: ['手工艺人', '非遗', '传承'],
          authorId: 'user_admin',
          authorName: '管理员',
          viewCount: 789,
          likeCount: 198,
          createTime: '2024-12-10',
          status: 1
        }
      ];
      wx.setStorageSync('topics', defaultTopics);
    }

    // 初始化百科词条数据
    const encyclopedia = wx.getStorageSync('encyclopedia');
    if (!encyclopedia || encyclopedia.length === 0) {
      const defaultEncyclopedia = [
        {
          id: 'encyclopedia_001',
          title: '二十四节气',
          cover: '',
          summary: '二十四节气是中国古代订立的一种用来指导农事和日常生活的补充历法，是中华民族劳动人民长期经验的积累和智慧的结晶。',
          content: '二十四节气，是干支历中表示自然节律变化以及确立"十二月建"的特定节令。它最初是依据斗转星移制定，北斗七星循环旋转，斗柄绕东、南、西、北旋转一圈，为一周期，谓之一"岁"（摄提），每一旋转周期始于立春、终于大寒。\n\n现行的"二十四节气"是依据太阳在回归黄道上的位置制定，即把太阳周年运动轨迹划分为24等份，每15°为1等份，每1等份为一个节气，始于立春，终于大寒。\n\n"二十四节气"是中华民族悠久历史文化的重要组成部分，凝聚着中华文明的历史文化精华。2016年11月30日，二十四节气被正式列入联合国教科文组织人类非物质文化遗产代表作名录。',
          category: 'festival',
          catalog: [
            { id: '1', title: '历史渊源', level: 1 },
            { id: '2', title: '发展沿革', level: 1 },
            { id: '3', title: '节气含义', level: 1 },
            { id: '3-1', title: '春季节气', level: 2 },
            { id: '3-2', title: '夏季节气', level: 2 },
            { id: '3-3', title: '秋季节气', level: 2 },
            { id: '3-4', title: '冬季节气', level: 2 },
            { id: '4', title: '文化意义', level: 1 },
            { id: '5', title: '社会影响', level: 1 }
          ],
          relatedArticleIds: ['article_001', 'article_005'],
          relatedTopicIds: ['topic_003'],
          tags: ['二十四节气', '历法', '非遗', '传统文化'],
          authorId: 'user_admin',
          authorName: '管理员',
          viewCount: 3567,
          likeCount: 892,
          createTime: '2024-12-20',
          status: 1
        },
        {
          id: 'encyclopedia_002',
          title: '榫卯',
          cover: '',
          summary: '榫卯是古代中国建筑、家具及其它器械的主要结构方式，是在两个构件上采用凹凸部位相结合的一种连接方式。凸出部分叫榫（或榫头），凹进部分叫卯（或榫眼、榫槽）。',
          content: '榫卯结构是中国古建筑以木材、砖瓦为主要建筑材料，以木构架结构为主要的结构方式，由立柱、横梁、顺檩等主要构件建造而成，各个构件之间的结点以榫卯相吻合，构成富有弹性的框架。\n\n榫卯是极为精巧的发明，这种构件连接方式，使得中国传统的木结构成为超越了当代建筑排架、框架或者刚架的特殊柔性结构体，不但可以承受较大的荷载，而且允许产生一定的变形，在地震荷载下通过变形抵消一定的地震能量，减小结构的地震响应。\n\n榫卯工艺广泛应用于建筑和家具制作中，如北京故宫、山西应县木塔等都是典型的榫卯结构建筑，历经千年而不倒，充分展示了这一古老工艺的智慧。',
          category: 'craft',
          catalog: [
            { id: '1', title: '基本概念', level: 1 },
            { id: '2', title: '历史演变', level: 1 },
            { id: '3', title: '工艺特点', level: 1 },
            { id: '4', title: '常见类型', level: 1 },
            { id: '5', title: '应用领域', level: 1 },
            { id: '6', title: '文化价值', level: 1 }
          ],
          relatedArticleIds: ['article_002'],
          relatedTopicIds: ['topic_002'],
          tags: ['榫卯', '传统工艺', '建筑', '家具'],
          authorId: 'user_admin',
          authorName: '管理员',
          viewCount: 2890,
          likeCount: 756,
          createTime: '2024-12-18',
          status: 1
        },
        {
          id: 'encyclopedia_003',
          title: '端午节',
          cover: '',
          summary: '端午节，又称端阳节、龙舟节、重午节、龙节、正阳节、天中节等，是中国民间的传统节日，与春节、清明节、中秋节并称为中国四大传统节日。',
          content: '端午节，本是南方吴越先民创立用于拜祭龙祖、祈福辟邪的节日。因传说战国时期的楚国诗人屈原在五月五日跳汨罗江自尽，后来人们亦将端午节作为纪念屈原的节日；也有纪念伍子胥、曹娥及介子推等说法。\n\n端午节的习俗甚多，全国各地因地域文化不同而又存在着习俗内容或细节上的差异。主要习俗有：扒龙舟、祭龙、采草药、挂艾草与菖蒲、拜神祭祖、洗草药水、打午时水、浸龙舟水、食粽、放纸鸢、睇龙船、拴五色丝线、薰苍术、佩香囊等等。\n\n扒龙舟活动在中国南方沿海一带十分盛行，传出国外后深受各国人民喜爱并形成了国际比赛。端午食粽之习俗，自古以来在中国各地盛行不衰，已成了中华民族影响最大、覆盖面最广的民间饮食习俗之一。',
          category: 'festival',
          catalog: [
            { id: '1', title: '节日起源', level: 1 },
            { id: '2', title: '历史发展', level: 1 },
            { id: '3', title: '民间习俗', level: 1 },
            { id: '4', title: '各地特色', level: 1 },
            { id: '5', title: '文化内涵', level: 1 },
            { id: '6', title: '传承保护', level: 1 }
          ],
          relatedArticleIds: ['article_004'],
          relatedTopicIds: ['topic_001'],
          tags: ['端午节', '传统节日', '屈原', '龙舟', '粽子'],
          authorId: 'user_admin',
          authorName: '管理员',
          viewCount: 4123,
          likeCount: 1023,
          createTime: '2024-12-16',
          status: 1
        },
        {
          id: 'encyclopedia_004',
          title: '土布纺织',
          cover: '',
          summary: '土布纺织是中国传统手工技艺之一，又称"老粗布"、"家织布"，是劳动人民以纯棉为原料，用原始的纺车、木织布机一梭一梭精心编织而成。',
          content: '中国土布纺织技艺历史悠久，距今已有七千多年的历史。在新石器时代，中国就已经出现了原始的纺织工具。到了商周时期，纺织技术有了较大发展，出现了专门的纺织作坊。\n\n土布纺织工艺复杂，从采棉纺线到上机织布，要经过轧花、弹花、纺线、打线、浆染、沌线、落线、经线、刷线、作综、闯杼、掏综、吊机子、栓布、织布、了机等大小72道工序。\n\n土布的图案丰富多彩，从传统的"双喜"、"福"字到现代的几何图案、花卉图案，种类繁多。土布具有柔软舒适、透气吸汗、冬暖夏凉、不起静电、抗辐射等特点，深受人们喜爱。\n\n2008年，土布纺织技艺被列入国家级非物质文化遗产名录，这一古老的传统技艺得到了更好的保护和传承。',
          category: 'craft',
          catalog: [
            { id: '1', title: '历史渊源', level: 1 },
            { id: '2', title: '工艺流程', level: 1 },
            { id: '3', title: '工艺特点', level: 1 },
            { id: '4', title: '图案纹样', level: 1 },
            { id: '5', title: '文化价值', level: 1 },
            { id: '6', title: '传承与创新', level: 1 }
          ],
          relatedArticleIds: ['article_002'],
          relatedTopicIds: ['topic_002'],
          tags: ['土布', '纺织', '传统技艺', '非遗', '手工'],
          authorId: 'user_admin',
          authorName: '管理员',
          viewCount: 1987,
          likeCount: 543,
          createTime: '2024-12-14',
          status: 1
        },
        {
          id: 'encyclopedia_005',
          title: '剪纸艺术',
          cover: '',
          summary: '剪纸是中国最古老的民间艺术之一，是一种镂空艺术，其在视觉上给人以透空的感觉和艺术享受。剪纸的载体可以是纸张、金银箔、树皮、树叶、布、皮革。',
          content: '剪纸艺术是中国民间传统艺术中的瑰宝，距今已有三千多年的历史。早在新石器时代，我们的祖先就产生了用材料进行雕刻、镂空的审美意识。\n\n剪纸的制作方法主要有两种：一种是用剪刀剪，一种是用刻刀刻。剪纸的题材广泛，内容丰富，有人物、花鸟、山水、吉祥图案等。从表现形式上看，剪纸可分为单色剪纸、彩色剪纸、套色剪纸、填色剪纸、分色剪纸、衬色剪纸、勾绘剪纸等多种类型。\n\n剪纸艺术在中国分布很广，各地的剪纸风格各异。北方剪纸粗犷豪放、简练淳朴，南方剪纸则细腻精巧、玲珑剔透。著名的剪纸产地有陕西、山东、江苏、广东、浙江等地。\n\n2006年，剪纸艺术被列入第一批国家级非物质文化遗产名录。2009年，中国剪纸项目入选"人类非物质文化遗产代表作名录"。',
          category: 'art',
          catalog: [
            { id: '1', title: '历史沿革', level: 1 },
            { id: '2', title: '制作工艺', level: 1 },
            { id: '3', title: '艺术流派', level: 1 },
            { id: '4', title: '题材内容', level: 1 },
            { id: '5', title: '文化内涵', level: 1 },
            { id: '6', title: '传承保护', level: 1 }
          ],
          relatedArticleIds: [],
          relatedTopicIds: [],
          tags: ['剪纸', '民间艺术', '非遗', '传统美术'],
          authorId: 'user_admin',
          authorName: '管理员',
          viewCount: 2456,
          likeCount: 678,
          createTime: '2024-12-12',
          status: 1
        },
        {
          id: 'encyclopedia_006',
          title: '春节',
          cover: '',
          summary: '春节，即中国农历新年，俗称新春、新岁、岁旦等，口头上又称过年、过大年。春节历史悠久，由上古时代岁首祈岁祭祀演变而来。',
          content: '春节是中华民族最隆重的传统佳节，它不仅集中体现了中华民族的思想信仰、理想愿望、生活娱乐和文化心理，而且还是祈福攘灾、饮食和娱乐活动的狂欢式展示。\n\n春节的起源蕴含着深邃的文化内涵，在传承发展中承载了丰厚的历史文化底蕴。在春节期间，全国各地均有举行各种庆贺新春活动，带有浓郁的各地域特色。这些活动以除旧布新、驱邪攘灾、拜神祭祖、纳福祈年为主要内容，形式丰富多彩，凝聚着中华传统文化精华。\n\n春节与清明节、端午节、中秋节并称为中国四大传统节日。春节民俗经国务院批准列入第一批国家级非物质文化遗产名录。',
          category: 'festival',
          catalog: [
            { id: '1', title: '节日起源', level: 1 },
            { id: '2', title: '历史发展', level: 1 },
            { id: '3', title: '传统习俗', level: 1 },
            { id: '4', title: '食俗文化', level: 1 },
            { id: '5', title: '各地特色', level: 1 },
            { id: '6', title: '文化影响', level: 1 }
          ],
          relatedArticleIds: [],
          relatedTopicIds: ['topic_001'],
          tags: ['春节', '传统节日', '过年', '传统文化'],
          authorId: 'user_admin',
          authorName: '管理员',
          viewCount: 5678,
          likeCount: 1456,
          createTime: '2024-12-10',
          status: 1
        }
      ];
      wx.setStorageSync('encyclopedia', defaultEncyclopedia);
    }
  }
});
