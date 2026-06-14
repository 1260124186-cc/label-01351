const {
  COLLECTION_TYPES,
  COLLECTION_STATUS,
  getCollectionStatus,
  getCollectionProgress,
  getCollectionRemainingDays,
  isCollectionUrgent,
  formatDate
} = require('../../utils/util');

describe('util.COLLECTION_TYPES', () => {
  test('征集类型定义完整（5种）', () => {
    expect(Object.keys(COLLECTION_TYPES).length).toBe(5);
    expect(COLLECTION_TYPES.figure).toBeDefined();
    expect(COLLECTION_TYPES.memory).toBeDefined();
    expect(COLLECTION_TYPES.object).toBeDefined();
    expect(COLLECTION_TYPES.story).toBeDefined();
    expect(COLLECTION_TYPES.custom).toBeDefined();
  });

  test('每种征集类型包含id、name、icon、description', () => {
    Object.values(COLLECTION_TYPES).forEach(type => {
      expect(type).toHaveProperty('id');
      expect(type).toHaveProperty('name');
      expect(type).toHaveProperty('icon');
      expect(type).toHaveProperty('description');
    });
  });

  test('征集类型id与键名一致', () => {
    Object.entries(COLLECTION_TYPES).forEach(([key, type]) => {
      expect(type.id).toBe(key);
    });
  });
});

describe('util.COLLECTION_STATUS', () => {
  test('征集状态定义完整（4种）', () => {
    expect(Object.keys(COLLECTION_STATUS).length).toBe(4);
    expect(COLLECTION_STATUS.recruiting).toBeDefined();
    expect(COLLECTION_STATUS.achieving).toBeDefined();
    expect(COLLECTION_STATUS.achieved).toBeDefined();
    expect(COLLECTION_STATUS.ended).toBeDefined();
  });

  test('每种征集状态包含id、name、color、icon', () => {
    Object.values(COLLECTION_STATUS).forEach(status => {
      expect(status).toHaveProperty('id');
      expect(status).toHaveProperty('name');
      expect(status).toHaveProperty('color');
      expect(status).toHaveProperty('icon');
    });
  });
});

describe('util.getCollectionProgress', () => {
  test('目标为0时进度为0%，防止除零错误', () => {
    const result = getCollectionProgress({ targetCount: 0, responseCount: 5 });
    expect(result.targetCount).toBe(0);
    expect(result.responseCount).toBe(5);
    expect(result.progress).toBe(0);
    expect(result.progressText).toBe('0%');
  });

  test('响应数为0时进度为0%', () => {
    const result = getCollectionProgress({ targetCount: 20, responseCount: 0 });
    expect(result.progress).toBe(0);
    expect(result.progressText).toBe('0%');
  });

  test('响应数等于目标数时进度为100%', () => {
    const result = getCollectionProgress({ targetCount: 20, responseCount: 20 });
    expect(result.progress).toBe(100);
    expect(result.progressText).toBe('100%');
  });

  test('响应数超过目标数时进度上限为100%', () => {
    const result = getCollectionProgress({ targetCount: 20, responseCount: 30 });
    expect(result.progress).toBe(100);
    expect(result.progressText).toBe('100%');
  });

  test('常规进度计算（5/20=25%）', () => {
    const result = getCollectionProgress({ targetCount: 20, responseCount: 5 });
    expect(result.progress).toBe(25);
    expect(result.progressText).toBe('25%');
  });

  test('返回值结构完整', () => {
    const result = getCollectionProgress({ targetCount: 20, responseCount: 8 });
    expect(result).toHaveProperty('targetCount', 20);
    expect(result).toHaveProperty('responseCount', 8);
    expect(result).toHaveProperty('progress');
    expect(result).toHaveProperty('progressText');
  });

  test('空数据安全处理', () => {
    const result = getCollectionProgress({});
    expect(result.targetCount).toBe(0);
    expect(result.responseCount).toBe(0);
    expect(result.progress).toBe(0);
  });
});

describe('util.getCollectionRemainingDays', () => {
  test('截止日期在未来时返回正数天数', () => {
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const result = getCollectionRemainingDays({ endTime: formatDate(futureDate, 'YYYY-MM-DD HH:mm:ss') });
    expect(result).toBeGreaterThanOrEqual(0);
  });

  test('截止日期在过去时返回0', () => {
    const pastDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const result = getCollectionRemainingDays({ endTime: formatDate(pastDate, 'YYYY-MM-DD HH:mm:ss') });
    expect(result).toBe(0);
  });

  test('截止日期为空时返回0', () => {
    expect(getCollectionRemainingDays({})).toBe(0);
    expect(getCollectionRemainingDays({ endTime: '' })).toBe(0);
    expect(getCollectionRemainingDays(null)).toBe(0);
  });
});

describe('util.getCollectionStatus', () => {
  const mockDate = (daysOffset) => {
    const date = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
    return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
  };

  test('已过期返回 ended 状态', () => {
    const collection = { targetCount: 20, responseCount: 10, endTime: mockDate(-1) };
    const status = getCollectionStatus(collection);
    expect(status.id).toBe('ended');
  });

  test('进度100%且未过期返回 achieved 状态', () => {
    const collection = { targetCount: 20, responseCount: 20, endTime: mockDate(5) };
    const status = getCollectionStatus(collection);
    expect(status.id).toBe('achieved');
  });

  test('进度达到80%阈值且未过期返回 achieving 状态', () => {
    const collection = { targetCount: 20, responseCount: 16, endTime: mockDate(5), completionThreshold: 80 };
    const status = getCollectionStatus(collection);
    expect(status.id).toBe('achieving');
  });

  test('进度低于阈值且未过期返回 recruiting 状态', () => {
    const collection = { targetCount: 20, responseCount: 5, endTime: mockDate(5), completionThreshold: 80 };
    const status = getCollectionStatus(collection);
    expect(status.id).toBe('recruiting');
  });

  test('默认 completionThreshold 为 80%', () => {
    const collection = { targetCount: 20, responseCount: 16, endTime: mockDate(5) };
    const status = getCollectionStatus(collection);
    expect(status.id).toBe('achieving');
  });

  test('返回状态信息包含所有字段', () => {
    const collection = { targetCount: 20, responseCount: 5, endTime: mockDate(5) };
    const status = getCollectionStatus(collection);
    expect(status).toHaveProperty('id');
    expect(status).toHaveProperty('name');
    expect(status).toHaveProperty('color');
    expect(status).toHaveProperty('icon');
  });
});

describe('util.isCollectionUrgent', () => {
  const mockDate = (daysOffset) => {
    const date = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
    return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
  };

  test('剩余2天且进度50% → 紧急 true', () => {
    const collection = { targetCount: 20, responseCount: 10, endTime: mockDate(2) };
    expect(isCollectionUrgent(collection)).toBe(true);
  });

  test('剩余3天且进度70% → 紧急 true', () => {
    const collection = { targetCount: 20, responseCount: 14, endTime: mockDate(3) };
    expect(isCollectionUrgent(collection)).toBe(true);
  });

  test('剩余4天且进度50% → 不紧急 false（天数>3）', () => {
    const collection = { targetCount: 20, responseCount: 10, endTime: mockDate(4) };
    expect(isCollectionUrgent(collection)).toBe(false);
  });

  test('剩余2天且进度90% → 不紧急 false（进度≥80%）', () => {
    const collection = { targetCount: 20, responseCount: 18, endTime: mockDate(2) };
    expect(isCollectionUrgent(collection)).toBe(false);
  });

  test('已过期 → 不紧急 false', () => {
    const collection = { targetCount: 20, responseCount: 5, endTime: mockDate(-1) };
    expect(isCollectionUrgent(collection)).toBe(false);
  });

  test('空数据安全处理返回 false', () => {
    expect(isCollectionUrgent({})).toBe(false);
    expect(isCollectionUrgent(null)).toBe(false);
  });
});
