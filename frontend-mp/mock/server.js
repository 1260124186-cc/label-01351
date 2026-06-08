// mock/server.js - Mock 数据服务器
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// Mock 数据存储
let likes = {};
let favorites = {};

let articles = [
  {
    id: 'article_001',
    title: '记忆中的农耕岁月',
    content: '在我的记忆里，每年春耕时节，父亲总是天不亮就起床，扛着锄头走向田间。那时候没有机械化，全靠人力和牛力。父亲说，种地要看天时，要懂得节气。惊蛰一过，就该翻土了；清明前后，种瓜点豆。这些老话，是祖辈们千百年来总结出的智慧。\n\n记得有一年春天，连续下了半个月的雨，田里积水严重。父亲带着我们挖沟排水，一干就是三天三夜。他说："庄稼人就是这样，老天爷给什么天，我们就想什么办法。"这种与自然和谐相处、顺应天时的智慧，是现代人很难体会到的。',
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
    content: '外婆今年八十五岁了，她的织布手艺在村里是出了名的。从我记事起，外婆家的堂屋里就摆着一台老式织布机，那是外公年轻时亲手做的。\n\n外婆说，她十二岁就跟着太外婆学织布了。那时候，家家户户的衣服、被面都是自己织的。一匹布要经过纺线、浆线、经线、织布好几道工序，没有三五天是完不成的。外婆织的布，纹路细密均匀，摸起来又软又滑。\n\n现在村里会织布的老人越来越少了，外婆常说："这门手艺不能丢啊，这是老祖宗传下来的。"每到假期，她都会教村里的孩子们认识织布机，讲述那些关于布匹的故事。',
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
    content: '我们村口有一棵老槐树，听村里最年长的王爷爷说，这棵树少说也有三百年了。树干粗得要三个大人才能合抱，树冠像一把巨大的绿伞，夏天能遮住半个村口的阳光。\n\n这棵老槐树见证了村子的变迁。解放前，村民们在树下躲避过战乱；大集体时代，生产队在树下开会分工；改革开放后，第一批外出打工的年轻人就是在这棵树下告别家人的。\n\n现在，老槐树下成了村里老人们最爱聚集的地方。他们在树荫下下棋、聊天、讲古，把那些快要被遗忘的故事一代代传下去。每当我回到村里，总要在老槐树下坐一坐，听听那些关于岁月的故事。',
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
    content: '在我们村，端午节是一年中最热闹的节日之一。从五月初一开始，家家户户就忙活起来了。\n\n首先是包粽子。奶奶会提前一天把糯米泡好，粽叶洗净。包粽子是个技术活，要把粽叶折成漏斗状，填上糯米和馅料，再用棕绑紧。奶奶包的粽子，个个棱角分明，煮出来又香又糯。\n\n端午这天一大早，爷爷会去山上采艾草和菖蒲，挂在门楣上辟邪。中午，全家人围坐在一起吃粽子、咸鸭蛋，喝雄黄酒。下午，村里还会组织划龙舟比赛，锣鼓喧天，热闹非凡。\n\n这些习俗，是祖辈们留下的文化遗产，承载着对美好生活的祈愿。',
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
    content: '爷爷是村里有名的"老把式"，种了一辈子地，对节气了如指掌。他常念叨的二十四节气歌，我到现在还记得：\n\n"春雨惊春清谷天，夏满芒夏暑相连。秋处露秋寒霜降，冬雪雪冬小大寒。"\n\n爷爷说，这首歌是老祖宗的智慧结晶。每个节气该干什么农活，都有讲究。立春要开始准备农具，雨水要检修水渠，惊蛰要翻地，春分要播种...\n\n他还教我看天象："朝霞不出门，晚霞行千里"、"蚂蚁搬家蛇过道，大雨不久就来到"。这些谚语，都是农民们千百年来观察自然总结出来的经验。\n\n现在有了天气预报，年轻人不太在意这些了。但爷爷说，老祖宗的智慧不能丢，这是我们农耕文明的根。',
    category: 'farming',
    authorId: 'user_005',
    authorName: '刘大伯',
    viewCount: 389,
    likeCount: 145,
    createTime: '2024-12-01',
    status: 1
  }
];

const categories = [
  { id: 'all', name: '全部', icon: 'all', sort: 0 },
  { id: 'folklore', name: '民俗故事', icon: 'folklore', sort: 1 },
  { id: 'farming', name: '农耕智慧', icon: 'farming', sort: 2 },
  { id: 'craft', name: '传统技艺', icon: 'craft', sort: 3 },
  { id: 'memory', name: '乡土记忆', icon: 'memory', sort: 4 }
];

let users = {
  'user_001': {
    id: 'user_001',
    nickname: '乡村文化爱好者',
    avatar: '',
    phone: '138****8888',
    createTime: '2024-01-01'
  }
};

// 生成唯一ID
const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
};

// 鉴权校验
const requireAuth = (userId) => {
  if (!userId) {
    return { code: 401, data: null, message: '请先登录' };
  }
  return null;
};

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 获取文章列表
app.get('/api/article/list', (req, res) => {
  const { category = 'all', page = 1, pageSize = 10, keyword = '' } = req.query;

  let filteredArticles = articles.filter(item => item.status === 1);

  // 分类筛选
  if (category && category !== 'all') {
    filteredArticles = filteredArticles.filter(item => item.category === category);
  }

  // 关键词搜索
  if (keyword) {
    const kw = keyword.toLowerCase();
    filteredArticles = filteredArticles.filter(item =>
      item.title.toLowerCase().includes(kw) ||
      item.content.toLowerCase().includes(kw)
    );
  }

  // 按时间倒序
  filteredArticles.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

  // 分页
  const total = filteredArticles.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const list = filteredArticles.slice(start, start + parseInt(pageSize));

  res.json({
    code: 200,
    data: {
      list,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      hasMore: start + parseInt(pageSize) < total
    },
    message: 'success'
  });
});

// 获取文章详情
app.get('/api/article/detail/:id', (req, res) => {
  const { id } = req.params;
  const article = articles.find(item => item.id === id);

  if (!article) {
    return res.json({
      code: 404,
      data: null,
      message: '文章不存在'
    });
  }

  // 增加浏览量
  article.viewCount = (article.viewCount || 0) + 1;

  res.json({
    code: 200,
    data: article,
    message: 'success'
  });
});

// 发布文章
app.post('/api/article/publish', (req, res) => {
  const { title, content, category, authorId } = req.body;

  const authError = requireAuth(authorId);
  if (authError) {
    return res.json(authError);
  }

  if (!title || !content || !category) {
    return res.json({
      code: 400,
      data: null,
      message: '参数不完整'
    });
  }

  const user = users[authorId] || { ...users['user_001'], id: authorId, nickname: '用户' };

  const newArticle = {
    id: generateId('article'),
    title,
    content,
    category,
    authorId: user.id,
    authorName: user.nickname,
    viewCount: 0,
    likeCount: 0,
    createTime: new Date().toISOString().split('T')[0],
    status: 1
  };

  articles.unshift(newArticle);

  res.json({
    code: 200,
    data: newArticle,
    message: '发布成功'
  });
});

// 获取我的文章
app.get('/api/article/my', (req, res) => {
  const { authorId } = req.query;

  const authError = requireAuth(authorId);
  if (authError) {
    return res.json(authError);
  }

  const myArticles = articles
    .filter(item => item.authorId === authorId)
    .sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

  res.json({
    code: 200,
    data: {
      list: myArticles,
      total: myArticles.length
    },
    message: 'success'
  });
});

// 点赞文章
app.post('/api/article/like/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const authError = requireAuth(userId);
  if (authError) {
    return res.json(authError);
  }

  const article = articles.find(item => item.id === id);

  if (!article) {
    return res.json({
      code: 404,
      data: null,
      message: '文章不存在'
    });
  }

  const userLikes = likes[userId] || [];
  if (userLikes.includes(id)) {
    return res.json({
      code: 200,
      data: { isLike: true, likeCount: article.likeCount },
      message: '已点赞'
    });
  }

  article.likeCount = (article.likeCount || 0) + 1;
  userLikes.push(id);
  likes[userId] = userLikes;

  res.json({
    code: 200,
    data: { isLike: true, likeCount: article.likeCount },
    message: '点赞成功'
  });
});

// 取消点赞文章
app.post('/api/article/unlike/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const authError = requireAuth(userId);
  if (authError) {
    return res.json(authError);
  }

  const article = articles.find(item => item.id === id);

  if (!article) {
    return res.json({
      code: 404,
      data: null,
      message: '文章不存在'
    });
  }

  article.likeCount = Math.max((article.likeCount || 0) - 1, 0);

  const userLikes = likes[userId] || [];
  const index = userLikes.indexOf(id);
  if (index > -1) {
    userLikes.splice(index, 1);
    likes[userId] = userLikes;
  }

  res.json({
    code: 200,
    data: { isLike: false, likeCount: article.likeCount },
    message: '已取消点赞'
  });
});

// 检查点赞状态
app.get('/api/article/like/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  const authError = requireAuth(userId);
  if (authError) {
    return res.json(authError);
  }

  if (!id) {
    return res.json({
      code: 400,
      data: null,
      message: '文章ID不能为空'
    });
  }

  const userLikes = likes[userId] || [];
  const isLike = userLikes.includes(id);

  res.json({
    code: 200,
    data: { isLike },
    message: 'success'
  });
});

// 收藏文章
app.post('/api/article/favorite/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const authError = requireAuth(userId);
  if (authError) {
    return res.json(authError);
  }

  if (!id) {
    return res.json({
      code: 400,
      data: null,
      message: '文章ID不能为空'
    });
  }

  const userFavorites = favorites[userId] || [];
  if (userFavorites.includes(id)) {
    return res.json({
      code: 200,
      data: { isFavorite: true },
      message: '已收藏'
    });
  }

  userFavorites.push(id);
  favorites[userId] = userFavorites;

  res.json({
    code: 200,
    data: { isFavorite: true },
    message: '收藏成功'
  });
});

// 取消收藏文章
app.post('/api/article/unfavorite/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const authError = requireAuth(userId);
  if (authError) {
    return res.json(authError);
  }

  if (!id) {
    return res.json({
      code: 400,
      data: null,
      message: '文章ID不能为空'
    });
  }

  const userFavorites = favorites[userId] || [];
  const index = userFavorites.indexOf(id);
  if (index > -1) {
    userFavorites.splice(index, 1);
    favorites[userId] = userFavorites;
  }

  res.json({
    code: 200,
    data: { isFavorite: false },
    message: '已取消收藏'
  });
});

// 检查收藏状态
app.get('/api/article/favorite/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  const authError = requireAuth(userId);
  if (authError) {
    return res.json(authError);
  }

  if (!id) {
    return res.json({
      code: 400,
      data: null,
      message: '文章ID不能为空'
    });
  }

  const userFavorites = favorites[userId] || [];
  const isFavorite = userFavorites.includes(id);

  res.json({
    code: 200,
    data: { isFavorite },
    message: 'success'
  });
});

// 获取收藏文章列表
app.get('/api/article/favorites', (req, res) => {
  const { userId, category = 'all', page = 1, pageSize = 10, keyword = '' } = req.query;

  const authError = requireAuth(userId);
  if (authError) {
    return res.json(authError);
  }

  const userFavorites = favorites[userId] || [];

  if (userFavorites.length === 0) {
    return res.json({
      code: 200,
      data: {
        list: [],
        total: 0,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        hasMore: false
      },
      message: 'success'
    });
  }

  let filteredArticles = articles.filter(item => userFavorites.includes(item.id));

  if (category && category !== 'all') {
    filteredArticles = filteredArticles.filter(item => item.category === category);
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    filteredArticles = filteredArticles.filter(item =>
      item.title.toLowerCase().includes(kw) ||
      item.content.toLowerCase().includes(kw)
    );
  }

  filteredArticles.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

  const total = filteredArticles.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const list = filteredArticles.slice(start, start + parseInt(pageSize));

  res.json({
    code: 200,
    data: {
      list,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      hasMore: start + parseInt(pageSize) < total
    },
    message: 'success'
  });
});

// 获取分类列表
app.get('/api/category/list', (req, res) => {
  res.json({
    code: 200,
    data: categories,
    message: 'success'
  });
});

// 获取用户信息
app.get('/api/user/info', (req, res) => {
  const { userId } = req.query;

  const authError = requireAuth(userId);
  if (authError) {
    return res.json(authError);
  }

  const user = users[userId] || { ...users['user_001'], id: userId };

  res.json({
    code: 200,
    data: user,
    message: 'success'
  });
});

// 更新用户信息
app.post('/api/user/update', (req, res) => {
  const { userId, nickname } = req.body;

  const authError = requireAuth(userId);
  if (authError) {
    return res.json(authError);
  }

  if (!users[userId]) {
    users[userId] = { ...users['user_001'], id: userId };
  }

  if (nickname) {
    users[userId].nickname = nickname;
    articles.forEach(article => {
      if (article.authorId === userId) {
        article.authorName = nickname;
      }
    });
  }

  res.json({
    code: 200,
    data: users[userId],
    message: '更新成功'
  });
});

// 获取用户统计
app.get('/api/user/stats', (req, res) => {
  const { userId } = req.query;

  const authError = requireAuth(userId);
  if (authError) {
    return res.json(authError);
  }

  const myArticles = articles.filter(item => item.authorId === userId);
  const totalLikes = myArticles.reduce((sum, item) => sum + (item.likeCount || 0), 0);
  const totalViews = myArticles.reduce((sum, item) => sum + (item.viewCount || 0), 0);

  res.json({
    code: 200,
    data: {
      articleCount: myArticles.length,
      likeCount: totalLikes,
      viewCount: totalViews
    },
    message: 'success'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🌾 乡村文化库 Mock Server 已启动                          ║
║                                                            ║
║   服务地址: http://localhost:${PORT}                         ║
║                                                            ║
║   API 接口:                                                ║
║   - GET  /api/health               健康检查                ║
║   - GET  /api/article/list         文章列表                ║
║   - GET  /api/article/detail/:id   文章详情                ║
║   - POST /api/article/publish      发布文章                ║
║   - GET  /api/article/my           我的文章                ║
║   - POST /api/article/like/:id     点赞文章                ║
║   - POST /api/article/unlike/:id   取消点赞                ║
║   - GET  /api/article/like/:id     检查点赞状态            ║
║   - POST /api/article/favorite/:id 收藏文章                ║
║   - POST /api/article/unfavorite/:id 取消收藏              ║
║   - GET  /api/article/favorite/:id 检查收藏状态            ║
║   - GET  /api/article/favorites    收藏列表                ║
║   - GET  /api/category/list        分类列表                ║
║   - GET  /api/user/info            用户信息                ║
║   - POST /api/user/update          更新用户                ║
║   - GET  /api/user/stats           用户统计                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
