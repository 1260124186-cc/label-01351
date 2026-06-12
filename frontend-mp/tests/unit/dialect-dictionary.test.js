const {
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
} = require('../../utils/dialect-dictionary');

describe('方言词典数据完整性', () => {
  test('DIALECT_DICTIONARY 不为空', () => {
    expect(DIALECT_DICTIONARY).toBeDefined();
    expect(typeof DIALECT_DICTIONARY).toBe('object');
    expect(Object.keys(DIALECT_DICTIONARY).length).toBeGreaterThan(0);
  });

  test('每个方言词条结构完整', () => {
    Object.values(DIALECT_DICTIONARY).forEach(entry => {
      expect(entry).toHaveProperty('word');
      expect(entry).toHaveProperty('pinyin');
      expect(entry).toHaveProperty('meaning');
      expect(entry).toHaveProperty('category');
      expect(entry).toHaveProperty('region');
      expect(entry).toHaveProperty('example');
      expect(typeof entry.word).toBe('string');
      expect(entry.word.length).toBeGreaterThan(0);
    });
  });

  test('方言词典 key 与 word 字段一致', () => {
    Object.keys(DIALECT_DICTIONARY).forEach(key => {
      expect(DIALECT_DICTIONARY[key].word).toBe(key);
    });
  });
});

describe('人名拼音库', () => {
  test('INTERVIEW_NAME_PINYIN 包含常用称呼', () => {
    expect(INTERVIEW_NAME_PINYIN['张大爷']).toBeDefined();
    expect(INTERVIEW_NAME_PINYIN['李阿姨']).toBeDefined();
    expect(INTERVIEW_NAME_PINYIN['王爷爷']).toBeDefined();
    expect(INTERVIEW_NAME_PINYIN['陈奶奶']).toBeDefined();
    expect(INTERVIEW_NAME_PINYIN['刘大伯']).toBeDefined();
    expect(INTERVIEW_NAME_PINYIN['赵大叔']).toBeDefined();
    expect(INTERVIEW_NAME_PINYIN['孙大娘']).toBeDefined();
  });

  test('每个人名结构完整', () => {
    Object.values(INTERVIEW_NAME_PINYIN).forEach(entry => {
      expect(entry).toHaveProperty('name');
      expect(entry).toHaveProperty('pinyin');
    });
  });
});

describe('地名拼音库', () => {
  test('PLACE_NAME_PINYIN 包含常见古镇', () => {
    expect(PLACE_NAME_PINYIN['乌镇']).toBeDefined();
    expect(PLACE_NAME_PINYIN['周庄']).toBeDefined();
    expect(PLACE_NAME_PINYIN['平遥']).toBeDefined();
    expect(PLACE_NAME_PINYIN['凤凰古城']).toBeDefined();
    expect(PLACE_NAME_PINYIN['宏村']).toBeDefined();
    expect(PLACE_NAME_PINYIN['西递']).toBeDefined();
    expect(PLACE_NAME_PINYIN['丽江']).toBeDefined();
    expect(PLACE_NAME_PINYIN['阳朔']).toBeDefined();
  });

  test('每个地名结构完整', () => {
    Object.values(PLACE_NAME_PINYIN).forEach(entry => {
      expect(entry).toHaveProperty('name');
      expect(entry).toHaveProperty('pinyin');
      expect(entry).toHaveProperty('description');
    });
  });
});

describe('findDialectWord', () => {
  test('查找存在的方言词', () => {
    const result = findDialectWord('晌午');
    expect(result).not.toBeNull();
    expect(result.word).toBe('晌午');
  });

  test('查找不存在的词返回 null', () => {
    expect(findDialectWord('不存在的词')).toBeNull();
    expect(findDialectWord('')).toBeNull();
    expect(findDialectWord(null)).toBeNull();
  });
});

describe('searchDialectWords', () => {
  test('搜索包含方言词的文本', () => {
    const text = '今天晌午，我们在老槐树下歇晌，唠唠家常。';
    const result = searchDialectWords(text);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result.some(r => r.word === '晌午')).toBe(true);
  });

  test('不包含方言词的文本返回空数组', () => {
    const result = searchDialectWords('今天天气真好');
    expect(result).toEqual([]);
  });

  test('空文本返回空数组', () => {
    expect(searchDialectWords('')).toEqual([]);
    expect(searchDialectWords(null)).toEqual([]);
    expect(searchDialectWords(undefined)).toEqual([]);
  });
});

describe('parseContentWithDialect', () => {
  test('解析纯文本', () => {
    const result = parseContentWithDialect('普通文本');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].type).toBe('text');
  });

  test('解析包含方言词的文本', () => {
    const result = parseContentWithDialect('今天晌午吃饭');
    expect(Array.isArray(result)).toBe(true);
    const hasDialect = result.some(seg => seg.type === 'dialect' && seg.content === '晌午');
    expect(hasDialect).toBe(true);
  });

  test('方言词片段包含完整信息', () => {
    const result = parseContentWithDialect('晌午');
    expect(result.length).toBe(1);
    expect(result[0].type).toBe('dialect');
    expect(result[0].info).toBeDefined();
    expect(result[0].info.word).toBe('晌午');
  });

  test('空文本安全处理', () => {
    expect(parseContentWithDialect('')).toEqual([{ type: 'text', content: '' }]);
    expect(parseContentWithDialect(null)).toEqual([{ type: 'text', content: null }]);
    expect(parseContentWithDialect(undefined)).toEqual([{ type: 'text', content: undefined }]);
  });

  test('方言词按长度降序匹配', () => {
    const result = parseContentWithDialect('这是老把式的话');
    const dialectSegs = result.filter(seg => seg.type === 'dialect');
    expect(dialectSegs.length).toBeGreaterThan(0);
    expect(dialectSegs.some(seg => seg.content === '老把式')).toBe(true);
  });
});

describe('getInterviewNamePinyin', () => {
  test('获取存在的人名拼音', () => {
    const result = getInterviewNamePinyin('张大爷');
    expect(result.name).toBe('张大爷');
    expect(result.pinyin).toBeTruthy();
  });

  test('获取不存在的人名返回空拼音', () => {
    const result = getInterviewNamePinyin('无名之人');
    expect(result.name).toBe('无名之人');
    expect(result.pinyin).toBe('');
  });
});

describe('getPlaceNamePinyin', () => {
  test('获取存在的地名拼音', () => {
    const result = getPlaceNamePinyin('乌镇');
    expect(result.name).toBe('乌镇');
    expect(result.pinyin).toBe('Wū Zhèn');
    expect(result.description).toBeTruthy();
  });

  test('获取不存在的地名返回空拼音', () => {
    const result = getPlaceNamePinyin('无名之地');
    expect(result.name).toBe('无名之地');
    expect(result.pinyin).toBe('');
  });
});

describe('getAllDialectWords', () => {
  test('返回所有方言词数组', () => {
    const all = getAllDialectWords();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBe(Object.keys(DIALECT_DICTIONARY).length);
  });
});

describe('getDialectByCategory', () => {
  test('按分类筛选方言词', () => {
    const result = getDialectByCategory('生活');
    expect(Array.isArray(result)).toBe(true);
    result.forEach(entry => {
      expect(entry.category).toBe('生活');
    });
  });

  test('不存在的分类返回空数组', () => {
    const result = getDialectByCategory('不存在的分类');
    expect(result).toEqual([]);
  });
});
