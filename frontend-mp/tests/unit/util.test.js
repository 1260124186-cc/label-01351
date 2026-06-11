const {
  formatDate,
  formatRelativeTime,
  generateId,
  debounce,
  throttle,
  truncateText,
  validateForm,
  getCategoryName,
  checkSensitiveWords,
  SENSITIVE_WORDS,
  SUGGESTED_TAGS
} = require('../../utils/util');

describe('util.formatDate', () => {
  test('格式化 Date 对象为 YYYY-MM-DD', () => {
    const date = new Date(2024, 11, 15, 10, 30, 45);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-12-15');
  });

  test('格式化日期字符串', () => {
    expect(formatDate('2024-06-05', 'YYYY-MM-DD')).toBe('2024-06-05');
  });

  test('格式化为完整日期时间 YYYY-MM-DD HH:mm:ss', () => {
    const date = new Date(2024, 0, 9, 8, 5, 3);
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-01-09 08:05:03');
  });

  test('空值返回空字符串', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
  });

  test('月和日自动补零', () => {
    const date = new Date(2024, 0, 1);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-01');
  });
});

describe('util.formatRelativeTime', () => {
  test('空值返回空字符串', () => {
    expect(formatRelativeTime(null)).toBe('');
    expect(formatRelativeTime(undefined)).toBe('');
  });

  test('30秒内返回"刚刚"', () => {
    const date = new Date(Date.now() - 10 * 1000);
    expect(formatRelativeTime(date)).toBe('刚刚');
  });

  test('1小时内返回"X分钟前"', () => {
    const date = new Date(Date.now() - 30 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('30分钟前');
  });

  test('1天内返回"X小时前"', () => {
    const date = new Date(Date.now() - 5 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('5小时前');
  });

  test('30天内返回"X天前"', () => {
    const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('10天前');
  });

  test('超过30天返回格式化日期', () => {
    const date = new Date(2023, 0, 1);
    const result = formatRelativeTime(date);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('util.generateId', () => {
  test('无前缀时生成纯时间戳+随机串', () => {
    const id = generateId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
  });

  test('带前缀时生成 "前缀_时间戳随机串" 格式', () => {
    const id = generateId('article');
    expect(id).toMatch(/^article_/);
  });

  test('生成的 ID 具有唯一性', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId('test')));
    expect(ids.size).toBe(100);
  });
});

describe('util.truncateText', () => {
  test('空值返回空字符串', () => {
    expect(truncateText(null)).toBe('');
    expect(truncateText(undefined)).toBe('');
    expect(truncateText('')).toBe('');
  });

  test('短文本不截断', () => {
    expect(truncateText('你好世界', 100)).toBe('你好世界');
  });

  test('超长文本截断并加省略号', () => {
    const longText = 'a'.repeat(150);
    const result = truncateText(longText, 100);
    expect(result.length).toBe(103);
    expect(result.endsWith('...')).toBe(true);
  });

  test('等于长度时不截断', () => {
    expect(truncateText('abc', 3)).toBe('abc');
  });

  test('自定义截断长度', () => {
    expect(truncateText('abcdefg', 5)).toBe('abcde...');
  });
});

describe('util.validateForm', () => {
  const rules = [
    { field: 'title', required: true, message: '标题不能为空' },
    { field: 'title', minLength: 2, message: '标题至少2个字符' },
    { field: 'title', maxLength: 50, message: '标题不能超过50个字符' },
    { field: 'content', required: true, message: '内容不能为空' },
    { field: 'content', minLength: 10, message: '内容至少10个字符' }
  ];

  test('校验通过返回 valid: true', () => {
    const data = { title: '测试标题', content: '这是一段测试内容，长度足够' };
    const result = validateForm(data, rules);
    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  test('必填字段为空时校验失败', () => {
    const data = { title: '', content: '内容存在' };
    const result = validateForm(data, rules);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('标题不能为空');
  });

  test('必填字段为空白字符串时校验失败', () => {
    const data = { title: '   ', content: '内容存在' };
    const result = validateForm(data, rules);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('标题不能为空');
  });

  test('字段不满足最小长度时校验失败', () => {
    const data = { title: '短', content: '内容存在' };
    const result = validateForm(data, rules);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('标题至少2个字符');
  });

  test('字段超过最大长度时校验失败', () => {
    const data = { title: 'a'.repeat(51), content: '内容存在' };
    const result = validateForm(data, rules);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('标题不能超过50个字符');
  });

  test('多个字段校验时按顺序返回第一个错误', () => {
    const data = { title: '', content: '' };
    const result = validateForm(data, rules);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('标题不能为空');
  });

  test('空规则列表校验通过', () => {
    const result = validateForm({}, []);
    expect(result.valid).toBe(true);
  });
});

describe('util.getCategoryName', () => {
  test('正确映射已知分类', () => {
    expect(getCategoryName('all')).toBe('全部');
    expect(getCategoryName('folklore')).toBe('民俗故事');
    expect(getCategoryName('farming')).toBe('农耕智慧');
    expect(getCategoryName('craft')).toBe('传统技艺');
    expect(getCategoryName('memory')).toBe('乡土记忆');
  });

  test('未知分类返回"未知分类"', () => {
    expect(getCategoryName('unknown')).toBe('未知分类');
    expect(getCategoryName('')).toBe('未知分类');
  });
});

describe('util.debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('延迟执行函数', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('连续调用只执行最后一次', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);
    debounced('a');
    debounced('b');
    debounced('c');
    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });
});

describe('util.throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('首次调用立即执行', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 300);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('间隔时间内不会重复执行', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 300);
    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('间隔时间后可以再次执行', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 300);
    throttled('first');
    jest.advanceTimersByTime(300);
    throttled('second');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('util.SENSITIVE_WORDS 敏感词列表', () => {
  test('敏感词列表不为空', () => {
    expect(SENSITIVE_WORDS).toBeDefined();
    expect(Array.isArray(SENSITIVE_WORDS)).toBe(true);
    expect(SENSITIVE_WORDS.length).toBeGreaterThan(0);
  });

  test('敏感词列表包含常见违禁词', () => {
    expect(SENSITIVE_WORDS).toContain('虚假宣传');
    expect(SENSITIVE_WORDS).toContain('毒品');
    expect(SENSITIVE_WORDS).toContain('诈骗');
    expect(SENSITIVE_WORDS).toContain('传销');
  });
});

describe('util.checkSensitiveWords 敏感词检测', () => {
  test('空文本不包含敏感词', () => {
    expect(checkSensitiveWords('')).toEqual({ hasSensitive: false, matchedWords: [] });
    expect(checkSensitiveWords(null)).toEqual({ hasSensitive: false, matchedWords: [] });
    expect(checkSensitiveWords(undefined)).toEqual({ hasSensitive: false, matchedWords: [] });
  });

  test('正常文本不包含敏感词', () => {
    const result = checkSensitiveWords('这是一篇关于乡村文化的文章，讲述了农耕的故事');
    expect(result.hasSensitive).toBe(false);
    expect(result.matchedWords).toEqual([]);
  });

  test('包含单个敏感词时正确检测', () => {
    const result = checkSensitiveWords('这篇文章有虚假宣传的内容');
    expect(result.hasSensitive).toBe(true);
    expect(result.matchedWords).toContain('虚假宣传');
  });

  test('包含多个敏感词时全部返回', () => {
    const result = checkSensitiveWords('此内容涉及诈骗和传销活动');
    expect(result.hasSensitive).toBe(true);
    expect(result.matchedWords).toContain('诈骗');
    expect(result.matchedWords).toContain('传销');
  });

  test('大小写不敏感检测', () => {
    const result = checkSensitiveWords('涉及DRUG毒品交易');
    expect(result.hasSensitive).toBe(true);
    expect(result.matchedWords).toContain('毒品');
  });

  test('非字符串输入安全处理', () => {
    expect(checkSensitiveWords(123)).toEqual({ hasSensitive: false, matchedWords: [] });
    expect(checkSensitiveWords({})).toEqual({ hasSensitive: false, matchedWords: [] });
  });
});

describe('util.SUGGESTED_TAGS 推荐标签', () => {
  test('推荐标签列表不为空', () => {
    expect(SUGGESTED_TAGS).toBeDefined();
    expect(Array.isArray(SUGGESTED_TAGS)).toBe(true);
    expect(SUGGESTED_TAGS.length).toBeGreaterThan(10);
  });

  test('包含需求中指定的标签', () => {
    expect(SUGGESTED_TAGS).toContain('端午节');
    expect(SUGGESTED_TAGS).toContain('织布');
  });

  test('标签为非空字符串', () => {
    SUGGESTED_TAGS.forEach(tag => {
      expect(typeof tag).toBe('string');
      expect(tag.length).toBeGreaterThan(0);
    });
  });
});
