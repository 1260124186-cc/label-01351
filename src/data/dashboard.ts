import type { DashboardStats as DashboardStat, CategoryStat, DailySubmission } from '@/types/admin';

export const dashboardStats: DashboardStat = {
  totalUsers: 12856,
  totalArticles: 3421,
  dailySubmissions: 47,
  totalLandmarks: 186,
  totalActivities: 95,
  pendingReviews: 23,
  pendingReports: 8
};

export const categoryStats: CategoryStat[] = [
  { name: '民俗文化', count: 856, percentage: 28 },
  { name: '传统建筑', count: 642, percentage: 21 },
  { name: '乡土美食', count: 512, percentage: 17 },
  { name: '非遗技艺', count: 398, percentage: 13 },
  { name: '乡村节庆', count: 342, percentage: 11 },
  { name: '其他', count: 271, percentage: 10 }
];

export const dailySubmissions: DailySubmission[] = [
  { date: '06-04', count: 32 },
  { date: '06-05', count: 45 },
  { date: '06-06', count: 38 },
  { date: '06-07', count: 52 },
  { date: '06-08', count: 41 },
  { date: '06-09', count: 55 },
  { date: '06-10', count: 47 }
];
