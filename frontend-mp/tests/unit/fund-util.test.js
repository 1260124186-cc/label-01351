const {
  FUND_STATUS,
  getFundStatusName,
  getFundStatusInfo,
  getFundTimelineTypeInfo,
  formatAmount,
  DONATION_METHODS,
  getDonationMethodName,
  getDonationMethods
} = require('../../utils/util');

describe('util.FUND_STATUS', () => {
  test('定义了三种基金状态', () => {
    expect(FUND_STATUS).toHaveProperty('ongoing');
    expect(FUND_STATUS).toHaveProperty('achieved');
    expect(FUND_STATUS).toHaveProperty('ended');
  });

  test('每个状态包含 id 和 name 属性', () => {
    Object.values(FUND_STATUS).forEach(status => {
      expect(status).toHaveProperty('id');
      expect(status).toHaveProperty('name');
    });
  });
});

describe('util.getFundStatusName', () => {
  test('返回进行中状态名称', () => {
    expect(getFundStatusName('ongoing')).toBe('进行中');
  });

  test('返回已达成状态名称', () => {
    expect(getFundStatusName('achieved')).toBe('已达成');
  });

  test('返回已结束状态名称', () => {
    expect(getFundStatusName('ended')).toBe('已结束');
  });

  test('未知状态返回默认名称', () => {
    const result = getFundStatusName('unknown');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('util.getFundStatusInfo', () => {
  test('返回完整的状态信息对象', () => {
    const info = getFundStatusInfo('ongoing');
    expect(info).toHaveProperty('id');
    expect(info).toHaveProperty('name');
    expect(info).toHaveProperty('color');
    expect(info).toHaveProperty('icon');
  });

  test('进行中状态有正确的图标和颜色', () => {
    const info = getFundStatusInfo('ongoing');
    expect(info.id).toBe('ongoing');
    expect(typeof info.color).toBe('string');
    expect(info.color.startsWith('#')).toBe(true);
  });

  test('已达成状态有正确的信息', () => {
    const info = getFundStatusInfo('achieved');
    expect(info.id).toBe('achieved');
    expect(info.name).toBe('已达成');
  });

  test('已结束状态有正确的信息', () => {
    const info = getFundStatusInfo('ended');
    expect(info.id).toBe('ended');
    expect(info.name).toBe('已结束');
  });
});

describe('util.getFundTimelineTypeInfo', () => {
  test('返回里程碑类型信息', () => {
    const info = getFundTimelineTypeInfo('milestone');
    expect(info).toHaveProperty('name');
    expect(info).toHaveProperty('color');
    expect(info).toHaveProperty('icon');
    expect(typeof info.name).toBe('string');
  });

  test('返回资金拨付类型信息', () => {
    const info = getFundTimelineTypeInfo('funding');
    expect(info.name).toBe('资金拨付');
    expect(typeof info.color).toBe('string');
  });

  test('返回活动类型信息', () => {
    const info = getFundTimelineTypeInfo('event');
    expect(info.name).toBe('活动');
  });

  test('返回公示类型信息', () => {
    const info = getFundTimelineTypeInfo('report');
    expect(info.name).toBe('公示');
  });

  test('返回其他类型信息', () => {
    const info = getFundTimelineTypeInfo('other');
    expect(info.name).toBe('其他');
  });

  test('未知类型返回默认信息', () => {
    const info = getFundTimelineTypeInfo('unknown_type');
    expect(info).toHaveProperty('name');
    expect(info).toHaveProperty('color');
    expect(info).toHaveProperty('icon');
  });
});

describe('util.formatAmount', () => {
  test('小于 10000 的金额直接显示（带元单位）', () => {
    expect(formatAmount(5000)).toBe('5,000 元');
    expect(formatAmount(9999)).toBe('9,999 元');
  });

  test('大于等于 10000 的金额以万元为单位显示（一位小数）', () => {
    expect(formatAmount(10000)).toBe('1.0 万');
    expect(formatAmount(25000)).toBe('2.5 万');
    expect(formatAmount(123456)).toMatch(/^\d+\.\d+ 万$/);
  });

  test('零金额正确显示', () => {
    expect(formatAmount(0)).toBe('0 元');
  });

  test('字符串数字也能正确格式化', () => {
    expect(formatAmount('50000')).toMatch(/万/);
    expect(formatAmount('50000')).toBe('5.0 万');
  });

  test('空值返回默认值', () => {
    expect(formatAmount(null)).toBe('0 元');
    expect(formatAmount(undefined)).toBe('0 元');
    expect(formatAmount(NaN)).toBe('0 元');
  });
});

describe('util.DONATION_METHODS', () => {
  test('是一个数组', () => {
    expect(Array.isArray(DONATION_METHODS)).toBe(true);
  });

  test('包含多种捐赠方式', () => {
    expect(DONATION_METHODS.length).toBeGreaterThanOrEqual(3);
  });

  test('每种方式都有 id, name, icon 属性', () => {
    DONATION_METHODS.forEach(method => {
      expect(method).toHaveProperty('id');
      expect(method).toHaveProperty('name');
      expect(method).toHaveProperty('icon');
      expect(typeof method.id).toBe('string');
      expect(typeof method.name).toBe('string');
    });
  });
});

describe('util.getDonationMethodName', () => {
  test('根据 id 返回捐赠方式名称', () => {
    const firstMethod = DONATION_METHODS[0];
    expect(getDonationMethodName(firstMethod.id)).toBe(firstMethod.name);
  });

  test('未知 id 返回默认名称', () => {
    const result = getDonationMethodName('unknown_method');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('util.getDonationMethods', () => {
  test('返回捐赠方式数组', () => {
    const methods = getDonationMethods();
    expect(Array.isArray(methods)).toBe(true);
    expect(methods.length).toBeGreaterThanOrEqual(3);
  });

  test('返回的数组是 DONATION_METHODS 的副本或引用', () => {
    const methods = getDonationMethods();
    expect(methods.length).toBe(DONATION_METHODS.length);
    expect(methods[0].id).toBe(DONATION_METHODS[0].id);
  });
});
