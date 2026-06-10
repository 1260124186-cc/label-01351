import Taro from '@tarojs/taro';
import type { ContentItem, ReportItem, ContentStatus, ReportStatus, BannerItem, HotRecommendation, SensitiveWord } from '@/types/admin';

const BASE_URL = '/api/admin';

async function request<T>(url: string, method: keyof typeof Taro.request = 'GET', data?: any): Promise<T> {
  try {
    const res = await Taro.request({ url: `${BASE_URL}${url}`, method, data });
    return res.data as T;
  } catch (error) {
    console.error('[AdminService]', url, error);
    throw error;
  }
}

export const adminService = {
  getUserRole(): string {
    const userInfo = Taro.getStorageSync('userInfo');
    return userInfo?.role || 'user';
  },

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  },

  async getReviewList(type?: string): Promise<ContentItem[]> {
    const params = type && type !== 'all' ? `?type=${type}` : '';
    return request(`/reviews${params}`);
  },

  async approveContent(id: string): Promise<void> {
    return request(`/reviews/${id}/approve`, 'PUT');
  },

  async rejectContent(id: string, reason: string): Promise<void> {
    return request(`/reviews/${id}/reject`, 'PUT', { reason });
  },

  async getReportList(): Promise<ReportItem[]> {
    return request('/reports');
  },

  async takedownContent(reportId: string): Promise<void> {
    return request(`/reports/${reportId}/takedown`, 'PUT');
  },

  async ignoreReport(reportId: string): Promise<void> {
    return request(`/reports/${reportId}/ignore`, 'PUT');
  },

  async getDashboardStats() {
    return request('/dashboard/stats');
  },

  async getBanners(): Promise<BannerItem[]> {
    return request('/banners');
  },

  async updateBanner(banner: Partial<BannerItem>): Promise<void> {
    return request(`/banners/${banner.id}`, 'PUT', banner);
  },

  async deleteBanner(id: string): Promise<void> {
    return request(`/banners/${id}`, 'DELETE');
  },

  async getHotRecommendations(): Promise<HotRecommendation[]> {
    return request('/hot-recommendations');
  },

  async updateHotRecommendation(item: Partial<HotRecommendation>): Promise<void> {
    return request(`/hot-recommendations/${item.id}`, 'PUT', item);
  },

  async deleteHotRecommendation(id: string): Promise<void> {
    return request(`/hot-recommendations/${id}`, 'DELETE');
  },

  async getSensitiveWords(): Promise<SensitiveWord[]> {
    return request('/sensitive-words');
  },

  async addSensitiveWord(word: string, category: string): Promise<void> {
    return request('/sensitive-words', 'POST', { word, category });
  },

  async deleteSensitiveWord(id: string): Promise<void> {
    return request(`/sensitive-words/${id}`, 'DELETE');
  }
};
