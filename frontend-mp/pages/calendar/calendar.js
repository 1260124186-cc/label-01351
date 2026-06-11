const calendarData = require('../../utils/calendar-data');
const api = require('../../utils/api');

Page({
  data: {
    currentYear: 0,
    currentMonth: 0,
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [],
    monthEvents: {},
    selectedDate: '',
    selectedEvents: [],
    showDetail: false,
    detailEvent: null,
    relatedArticles: [],
    isSubscribed: false,
    todayStr: ''
  },

  onLoad() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const todayStr = `${year}-${String(month).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.setData({
      currentYear: year,
      currentMonth: month,
      todayStr,
      selectedDate: todayStr
    });
    this.generateCalendar(year, month);
    this.loadDateEvents(year, month, now.getDate());
  },

  generateCalendar(year, month) {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
    const monthEvents = calendarData.getEventsForMonth(year, month);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const calendarDays = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      calendarDays.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        hasEvent: false,
        events: [],
        dateStr: ''
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const events = monthEvents[day] || [];
      calendarDays.push({
        day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        hasEvent: events.length > 0,
        events,
        dateStr
      });
    }

    const remaining = 42 - calendarDays.length;
    for (let day = 1; day <= remaining; day++) {
      calendarDays.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        hasEvent: false,
        events: [],
        dateStr: ''
      });
    }

    this.setData({ calendarDays, monthEvents });
  },

  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    this.setData({ currentYear, currentMonth, showDetail: false, selectedDate: '' });
    this.generateCalendar(currentYear, currentMonth);
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    this.setData({ currentYear, currentMonth, showDetail: false, selectedDate: '' });
    this.generateCalendar(currentYear, currentMonth);
  },

  goToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const todayStr = `${year}-${String(month).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.setData({
      currentYear: year,
      currentMonth: month,
      selectedDate: todayStr
    });
    this.generateCalendar(year, month);
    this.loadDateEvents(year, month, now.getDate());
  },

  onDateTap(e) {
    const { index } = e.currentTarget.dataset;
    const dayInfo = this.data.calendarDays[index];
    if (!dayInfo.isCurrentMonth) return;

    this.setData({ selectedDate: dayInfo.dateStr });
    this.loadDateEvents(this.data.currentYear, this.data.currentMonth, dayInfo.day);
  },

  async loadDateEvents(year, month, day) {
    const events = calendarData.getEventsForDate(year, month, day);
    this.setData({ selectedEvents: events, showDetail: false, detailEvent: null });

    if (events.length > 0) {
      this.showEventDetail(events[0]);
    }
  },

  showEventDetail(event) {
    const isSubscribed = calendarData.isSubscribed(event.id);
    this.setData({
      showDetail: true,
      detailEvent: event,
      isSubscribed
    });
    this.loadRelatedArticles(event);
  },

  async loadRelatedArticles(event) {
    const res = await api.getArticleList({ pageSize: 50 });
    if (res.code === 200) {
      const allArticles = res.data.list;
      const related = calendarData.matchArticlesByKeywords(event, allArticles);
      this.setData({ relatedArticles: related.slice(0, 5) });
    }
  },

  onEventTab(e) {
    const { index } = e.currentTarget.dataset;
    const event = this.data.selectedEvents[index];
    if (event) {
      this.showEventDetail(event);
    }
  },

  toggleSubscribe() {
    const event = this.data.detailEvent;
    if (!event) return;

    const app = getApp();
    if (!app.checkLogin()) return;

    if (this.data.isSubscribed) {
      calendarData.unsubscribeEvent(event.id);
      this.setData({ isSubscribed: false });
      wx.showToast({ title: '已取消订阅', icon: 'none' });
    } else {
      calendarData.subscribeEvent(event.id);
      this.setData({ isSubscribed: true });
      wx.showToast({ title: '订阅成功，将在节日前提醒您', icon: 'none' });
      this.scheduleReminder(event);
    }
  },

  scheduleReminder(event) {
    if (event.date) {
      const eventDate = new Date(event.date);
      const now = new Date();
      const oneDayBefore = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
      const delay = oneDayBefore.getTime() - now.getTime();
      if (delay > 0) {
        wx.requestSubscribeMessage({
          tmplIds: [],
          success: () => {},
          fail: () => {}
        });
      }
    }
  },

  goToPublish() {
    const event = this.data.detailEvent;
    if (!event) return;
    const prompt = event.contributionPrompt || `分享你的${event.name}记忆`;
    wx.navigateTo({
      url: `/pages/publish/publish?prompt=${encodeURIComponent(prompt)}&tag=${encodeURIComponent(event.name)}`
    });
  },

  goToArticleDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  goToEncyclopedia() {
    wx.navigateTo({
      url: '/pages/encyclopedia/encyclopedia?category=festival'
    });
  },

  onShareAppMessage() {
    const event = this.data.detailEvent;
    return {
      title: event ? `${event.name} - 乡村文化日历` : '乡村文化日历',
      path: '/pages/calendar/calendar'
    };
  }
});
