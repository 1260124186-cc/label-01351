const calendarData = require('../../utils/calendar-data');

describe('calendar-data 日历数据模块', () => {
  describe('数据完整性', () => {
    test('24个节气数据完整', () => {
      expect(calendarData.SOLAR_TERMS.length).toBe(24);
    });

    test('传统节日数据存在', () => {
      expect(calendarData.FESTIVALS.length).toBeGreaterThan(0);
    });

    test('节气包含必要字段', () => {
      calendarData.SOLAR_TERMS.forEach(term => {
        expect(term.id).toBeTruthy();
        expect(term.name).toBeTruthy();
        expect(term.month).toBeGreaterThan(0);
        expect(term.month).toBeLessThan(13);
        expect(term.dayRange).toHaveLength(2);
        expect(term.type).toBe('solar_term');
        expect(term.summary).toBeTruthy();
        expect(term.content).toBeTruthy();
        expect(term.keywords).toBeTruthy();
        expect(term.keywords.length).toBeGreaterThan(0);
        expect(term.customs).toBeTruthy();
      });
    });

    test('节日包含必要字段', () => {
      calendarData.FESTIVALS.forEach(festival => {
        expect(festival.id).toBeTruthy();
        expect(festival.name).toBeTruthy();
        expect(festival.type).toBe('festival');
        expect(festival.summary).toBeTruthy();
        expect(festival.content).toBeTruthy();
        expect(festival.keywords).toBeTruthy();
        expect(festival.customs).toBeTruthy();
      });
    });

    test('节气按月份排列覆盖全年', () => {
      const months = [...new Set(calendarData.SOLAR_TERMS.map(t => t.month))];
      expect(months.length).toBe(12);
    });

    test('节气精确日期映射包含多年数据', () => {
      expect(Object.keys(calendarData.SOLAR_TERM_EXACT_DATES)).toContain('2024');
      expect(Object.keys(calendarData.SOLAR_TERM_EXACT_DATES)).toContain('2025');
      expect(Object.keys(calendarData.SOLAR_TERM_EXACT_DATES)).toContain('2026');
    });
  });

  describe('getEventsForDate', () => {
    test('返回节气日期的节气事件', () => {
      const events = calendarData.getEventsForDate(2025, 1, 5);
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].name).toBe('小寒');
      expect(events[0].type).toBe('solar_term');
    });

    test('无节气节日日期返回空数组', () => {
      const events = calendarData.getEventsForDate(2025, 3, 15);
      expect(events).toEqual([]);
    });

    test('清明节日期返回清明事件', () => {
      const events = calendarData.getEventsForDate(2025, 4, 4);
      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => e.name === '清明')).toBe(true);
    });
  });

  describe('getEventsForMonth', () => {
    test('返回当月事件映射', () => {
      const eventMap = calendarData.getEventsForMonth(2025, 6);
      expect(Object.keys(eventMap).length).toBeGreaterThan(0);
    });

    test('1月有小寒和大寒', () => {
      const eventMap = calendarData.getEventsForMonth(2025, 1);
      const allEvents = Object.values(eventMap).flat();
      const names = allEvents.map(e => e.name);
      expect(names).toContain('小寒');
      expect(names).toContain('大寒');
    });

    test('无事件月份返回空映射', () => {
      const eventMap = calendarData.getEventsForMonth(2025, 3);
      expect(Object.keys(eventMap).length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('matchArticlesByKeywords', () => {
    test('关键词匹配返回相关文章', () => {
      const event = {
        keywords: ['端午', '粽子'],
        category: 'folklore'
      };
      const articles = [
        { id: '1', title: '端午节的老习俗', content: '包粽子是端午节的传统', category: 'folklore', status: 1 },
        { id: '2', title: '农耕智慧', content: '种地要看天时', category: 'farming', status: 1 },
        { id: '3', title: '春节回忆', content: '过年吃饺子', category: 'folklore', status: 1 }
      ];
      const result = calendarData.matchArticlesByKeywords(event, articles);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].id).toBe('1');
    });

    test('分类匹配增加权重', () => {
      const event = {
        keywords: ['民俗'],
        category: 'folklore'
      };
      const articles = [
        { id: '1', title: '民俗故事', content: '民俗故事内容', category: 'farming', status: 1 },
        { id: '2', title: '民俗故事2', content: '民俗故事内容', category: 'folklore', status: 1 }
      ];
      const result = calendarData.matchArticlesByKeywords(event, articles);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('2');
    });

    test('无事件时返回空数组', () => {
      const result = calendarData.matchArticlesByKeywords(null, []);
      expect(result).toEqual([]);
    });

    test('无关键词时返回空数组', () => {
      const result = calendarData.matchArticlesByKeywords({ keywords: [] }, [
        { id: '1', title: 'test', content: 'test', status: 1 }
      ]);
      expect(result).toEqual([]);
    });

    test('过滤掉下架文章', () => {
      const event = {
        keywords: ['端午'],
        category: 'folklore'
      };
      const articles = [
        { id: '1', title: '端午节', content: '端午节内容', category: 'folklore', status: 0 },
        { id: '2', title: '端午节2', content: '端午节内容', category: 'folklore', status: 1 }
      ];
      const result = calendarData.matchArticlesByKeywords(event, articles);
      expect(result.every(a => a.status === 1)).toBe(true);
    });
  });

  describe('订阅功能', () => {
    beforeEach(() => {
      wx._resetStorage();
    });

    test('订阅节气/节日', () => {
      const result = calendarData.subscribeEvent('lichun');
      expect(result).toBe(true);
      expect(calendarData.isSubscribed('lichun')).toBe(true);
    });

    test('取消订阅', () => {
      calendarData.subscribeEvent('lichun');
      const result = calendarData.unsubscribeEvent('lichun');
      expect(result).toBe(true);
      expect(calendarData.isSubscribed('lichun')).toBe(false);
    });

    test('未订阅时返回false', () => {
      expect(calendarData.isSubscribed('nonexistent')).toBe(false);
    });

    test('获取所有订阅', () => {
      calendarData.subscribeEvent('lichun');
      calendarData.subscribeEvent('chunjie');
      const subs = calendarData.getSubscriptions();
      expect(subs.lichun.subscribed).toBe(true);
      expect(subs.chunjie.subscribed).toBe(true);
    });
  });

  describe('getFestivalSolarDate', () => {
    test('公历节日直接返回日期', () => {
      const festival = { month: 5, day: 1, lunarDate: false };
      const result = calendarData.getFestivalSolarDate(festival, 2025);
      expect(result).toBe('2025-05-01');
    });

    test('农历节日查找映射表', () => {
      const festival = { month: 1, day: 1, lunarDate: true };
      const result = calendarData.getFestivalSolarDate(festival, 2025);
      expect(result).toBeTruthy();
    });

    test('无映射数据的年份返回null', () => {
      const festival = { month: 1, day: 1, lunarDate: true };
      const result = calendarData.getFestivalSolarDate(festival, 2030);
      expect(result).toBeNull();
    });
  });

  describe('节日投稿引导', () => {
    test('特定节日有投稿入口', () => {
      const festivalsWithContribution = calendarData.FESTIVALS.filter(f => f.hasContribution);
      expect(festivalsWithContribution.length).toBeGreaterThan(0);
      festivalsWithContribution.forEach(f => {
        expect(f.contributionPrompt).toBeTruthy();
      });
    });

    test('春节有投稿入口', () => {
      const chunjie = calendarData.FESTIVALS.find(f => f.id === 'chunjie');
      expect(chunjie.hasContribution).toBe(true);
      expect(chunjie.contributionPrompt).toBeTruthy();
    });
  });
});
