export interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  role: 'user' | 'admin';
}

export type ContentStatus = 'pending' | 'approved' | 'rejected';
export type ContentType = 'article' | 'landmark' | 'activity';
export type ReportStatus = 'pending' | 'takedown' | 'ignored';

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  author: string;
  authorAvatar: string;
  coverImage: string;
  description: string;
  status: ContentStatus;
  category: string;
  createdAt: string;
  rejectReason?: string;
}

export interface ReportItem {
  id: string;
  contentId: string;
  contentTitle: string;
  contentType: ContentType;
  coverImage: string;
  reporter: string;
  reporterAvatar: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalArticles: number;
  dailySubmissions: number;
  totalLandmarks: number;
  totalActivities: number;
  pendingReviews: number;
  pendingReports: number;
}

export interface CategoryStat {
  name: string;
  count: number;
  percentage: number;
}

export interface DailySubmission {
  date: string;
  count: number;
}

export interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  sort: number;
  active: boolean;
}

export interface HotRecommendation {
  id: string;
  title: string;
  coverImage: string;
  sort: number;
  active: boolean;
}

export interface SensitiveWord {
  id: string;
  word: string;
  category: string;
  createdAt: string;
}
