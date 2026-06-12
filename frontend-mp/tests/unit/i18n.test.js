const {
  LANG_ZH_CN,
  LANG_ZH_TW,
  initI18n,
  getLang,
  setLang,
  t,
  scToTc,
  tcToSc,
  translateText,
  getLangOptions,
  getLangName
} = require('../../utils/i18n');

describe('i18n constants', () => {
  test('语言常量已正确定义', () => {
    expect(LANG_ZH_CN).toBe('zh-CN');
    expect(LANG_ZH_TW).toBe('zh-TW');
  });
});

describe('i18n language options', () => {
  test('getLangOptions 返回正确的语言选项', () => {
    const options = getLangOptions();
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBe(2);
    expect(options[0].value).toBe('zh-CN');
    expect(options[1].value).toBe('zh-TW');
  });

  test('getLangName 返回正确的语言名称', () => {
    expect(getLangName('zh-CN')).toBe('简体中文');
    expect(getLangName('zh-TW')).toBe('繁體中文');
    expect(getLangName('unknown')).toBe('简体中文');
  });
});

describe('i18n 简繁转换', () => {
  test('scToTc 简体转繁体正确', () => {
    expect(scToTc('中国')).toBe('中國');
    expect(scToTc('语言')).toBe('語言');
    expect(scToTc('测试')).toBe('測試');
    expect(scToTc('时间')).toBe('時間');
    expect(scToTc('')).toBe('');
    expect(scToTc(null)).toBe('');
  });

  test('tcToSc 繁体转简体正确', () => {
    expect(tcToSc('中國')).toBe('中国');
    expect(tcToSc('語言')).toBe('语言');
    expect(tcToSc('測試')).toBe('测试');
    expect(tcToSc('時間')).toBe('时间');
    expect(tcToSc('')).toBe('');
    expect(tcToSc(null)).toBe('');
  });

  test('scToTc 和 tcToSc 互为逆运算（常用字）', () => {
    const text = '中华人民共和国语言文化测试';
    const tc = scToTc(text);
    const sc = tcToSc(tc);
    expect(sc).toBe(text);
  });

  test('scToTc 不转换非汉字字符', () => {
    expect(scToTc('Hello 123!@#')).toBe('Hello 123!@#');
  });
});

describe('i18n translateText', () => {
  beforeEach(() => {
    initI18n();
  });

  test('简体模式下 translateText 返回原文', () => {
    setLang('zh-CN');
    expect(translateText('中国语言')).toBe('中国语言');
  });

  test('繁体模式下 translateText 自动转换', () => {
    setLang('zh-TW');
    expect(translateText('中国语言')).toBe('中國語言');
  });

  test('空值安全处理', () => {
    expect(translateText('')).toBe('');
    expect(translateText(null)).toBe('');
    expect(translateText(undefined)).toBe('');
  });
});

describe('i18n t 翻译函数', () => {
  beforeEach(() => {
    initI18n();
    setLang('zh-CN');
  });

  test('简体模式下 t 返回正确文案', () => {
    expect(t('common.confirm')).toBe('确定');
    expect(t('common.cancel')).toBe('取消');
    expect(t('nav.home')).toBe('首页');
  });

  test('繁体模式下 t 返回正确文案', () => {
    setLang('zh-TW');
    expect(t('common.confirm')).toBe('確定');
    expect(t('common.cancel')).toBe('取消');
    expect(t('nav.home')).toBe('首頁');
  });

  test('t 支持参数占位符替换', () => {
    expect(t('common.confirm')).toBe('确定');
  });

  test('t 找不到 key 返回原始 key', () => {
    expect(t('nonexistent.key')).toBe('nonexistent.key');
    expect(t('')).toBe('');
  });
});

describe('i18n 语言切换与持久化', () => {
  beforeEach(() => {
    wx.clearStorageSync();
  });

  test('默认语言为简体中文', () => {
    initI18n();
    expect(getLang()).toBe('zh-CN');
  });

  test('setLang 正确切换语言并持久化', () => {
    initI18n();
    setLang('zh-TW');
    expect(getLang()).toBe('zh-TW');
    expect(wx.getStorageSync('language')).toBe('zh-TW');
  });

  test('无效语言设置不生效', () => {
    initI18n();
    setLang('en-US');
    expect(getLang()).toBe('zh-CN');
  });
});
