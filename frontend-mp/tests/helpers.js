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
  initStorage,
  createPageInstance
};
