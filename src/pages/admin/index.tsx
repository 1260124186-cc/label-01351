import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Image, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAdminGuard } from '@/hooks/useAdminGuard';

import StatCard from '@/components/StatCard';
import CategoryChart from '@/components/CategoryChart';
import TrendChart from '@/components/TrendChart';
import ReviewCard from '@/components/ReviewCard';
import ReportCard from '@/components/ReportCard';
import RejectModal from '@/components/RejectModal';
import ConfigSection from '@/components/ConfigSection';

import { dashboardStats, categoryStats, dailySubmissions } from '@/data/dashboard';
import { reviewList as mockReviewList } from '@/data/review';
import { reportList as mockReportList } from '@/data/reports';
import { bannerList as mockBanners } from '@/data/banners';
import { hotRecommendations as mockHot } from '@/data/hot-recommendations';
import { sensitiveWords as mockWords } from '@/data/sensitive-words';

import type {
  ContentItem, ContentType, ReportItem, ReportStatus,
  BannerItem, HotRecommendation, SensitiveWord
} from '@/types/admin';
import styles from './index.module.scss';

type TabType = 'dashboard' | 'review' | 'reports' | 'config';
type ReviewFilter = 'all' | ContentType;
type ReportFilter = 'all' | ReportStatus;

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: 'dashboard', label: '看板', icon: '📊' },
  { key: 'review', label: '审核', icon: '✅' },
  { key: 'reports', label: '举报', icon: '⚠️' },
  { key: 'config', label: '配置', icon: '⚙️' }
];

const REVIEW_FILTERS: { label: string; value: ReviewFilter }[] = [
  { label: '全部', value: 'all' },
  { label: '文章', value: 'article' },
  { label: '地标', value: 'landmark' },
  { label: '活动', value: 'activity' }
];

const REPORT_FILTERS: { label: string; value: ReportFilter }[] = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '已下架', value: 'takedown' },
  { label: '已忽略', value: 'ignored' }
];

const AdminPage: React.FC = () => {
  const { loading, hasAccess, userInfo } = useAdminGuard();
  const [tab, setTab] = useState<TabType>('dashboard');

  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [reviewList, setReviewList] = useState<ContentItem[]>(mockReviewList);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectingId, setRejectingId] = useState('');

  const [reportFilter, setReportFilter] = useState<ReportFilter>('all');
  const [reportList, setReportList] = useState<ReportItem[]>(mockReportList);

  const [banners, setBanners] = useState<BannerItem[]>(mockBanners);
  const [hotList, setHotList] = useState<HotRecommendation[]>(mockHot);
  const [words, setWords] = useState<SensitiveWord[]>(mockWords);
  const [newWord, setNewWord] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const pendingReviewCount = useMemo(
    () => reviewList.filter((i) => i.status === 'pending').length,
    [reviewList]
  );
  const pendingReportCount = useMemo(
    () => reportList.filter((i) => i.status === 'pending').length,
    [reportList]
  );

  const filteredReview = reviewFilter === 'all'
    ? reviewList.filter((i) => i.status === 'pending')
    : reviewList.filter((i) => i.status === 'pending' && i.type === reviewFilter);

  const filteredReport = reportFilter === 'all'
    ? reportList
    : reportList.filter((i) => i.status === reportFilter);

  const handleApprove = useCallback((id: string) => {
    Taro.showModal({
      title: '确认通过',
      content: '确定通过该内容审核吗？',
      success: (res) => {
        if (res.confirm) {
          setReviewList((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: 'approved' as const } : item))
          );
          Taro.showToast({ title: '已通过', icon: 'success' });
          console.info('[Review]', 'Content approved:', id);
        }
      }
    });
  }, []);

  const handleReject = useCallback((id: string) => {
    setRejectingId(id);
    setRejectModalVisible(true);
  }, []);

  const handleRejectConfirm = useCallback((reason: string) => {
    setReviewList((prev) =>
      prev.map((item) =>
        item.id === rejectingId ? { ...item, status: 'rejected' as const, rejectReason: reason } : item
      )
    );
    setRejectModalVisible(false);
    setRejectingId('');
    Taro.showToast({ title: '已驳回', icon: 'success' });
    console.info('[Review]', 'Content rejected:', rejectingId, 'Reason:', reason);
  }, [rejectingId]);

  const handleReviewTap = useCallback((id: string) => {
    Taro.navigateTo({ url: `/pages/review-detail/index?id=${id}` });
  }, []);

  const handleTakedown = useCallback((id: string) => {
    Taro.showModal({
      title: '确认下架',
      content: '下架后该内容将不再对外展示，确定下架吗？',
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm) {
          setReportList((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: 'takedown' as const } : item))
          );
          Taro.showToast({ title: '已下架', icon: 'success' });
          console.info('[Report]', 'Content taken down:', id);
        }
      }
    });
  }, []);

  const handleIgnore = useCallback((id: string) => {
    Taro.showModal({
      title: '确认忽略',
      content: '确定忽略该举报吗？',
      success: (res) => {
        if (res.confirm) {
          setReportList((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: 'ignored' as const } : item))
          );
          Taro.showToast({ title: '已忽略', icon: 'success' });
          console.info('[Report]', 'Report ignored:', id);
        }
      }
    });
  }, []);

  const handleReportTap = useCallback((id: string) => {
    Taro.navigateTo({ url: `/pages/report-detail/index?id=${id}` });
  }, []);

  const toggleBanner = useCallback((id: string) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));
    Taro.showToast({ title: '状态已更新', icon: 'success' });
  }, []);

  const deleteBanner = useCallback((id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定删除该Banner吗？',
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm) {
          setBanners((prev) => prev.filter((b) => b.id !== id));
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }, []);

  const toggleHot = useCallback((id: string) => {
    setHotList((prev) => prev.map((h) => (h.id === id ? { ...h, active: !h.active } : h)));
    Taro.showToast({ title: '状态已更新', icon: 'success' });
  }, []);

  const deleteHot = useCallback((id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定删除该推荐吗？',
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm) {
          setHotList((prev) => prev.filter((h) => h.id !== id));
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }, []);

  const deleteWord = useCallback((id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
    Taro.showToast({ title: '已删除', icon: 'success' });
  }, []);

  const addWord = useCallback(() => {
    if (!newWord.trim() || !newCategory.trim()) {
      Taro.showToast({ title: '请填写完整', icon: 'none' });
      return;
    }
    const word: SensitiveWord = {
      id: `sw${Date.now()}`,
      word: newWord.trim(),
      category: newCategory.trim(),
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setWords((prev) => [...prev, word]);
    setNewWord('');
    setNewCategory('');
    Taro.showToast({ title: '已添加', icon: 'success' });
    console.info('[Config]', 'Sensitive word added:', word.word);
  }, [newWord, newCategory]);

  const goBack = () => {
    Taro.switchTab({ url: '/pages/mine/index' }).catch(() => Taro.navigateBack());
  };

  if (loading) {
    return (
      <View className={styles.page}>
        <View className={styles.loading}>
          <Text className={styles.loadingIcon}>⏳</Text>
          <Text className={styles.loadingText}>权限校验中...</Text>
        </View>
      </View>
    );
  }

  if (!hasAccess) {
    return (
      <View className={styles.page}>
        <View className={styles.noAccess}>
          <Text className={styles.noAccessIcon}>🔒</Text>
          <Text className={styles.noAccessTitle}>无权限访问</Text>
          <Text className={styles.noAccessDesc}>
            您当前账号为「{userInfo?.role === 'user' ? '普通用户' : '游客'}」，
            暂无管理后台访问权限。
            请使用管理员账号登录后重新进入。
          </Text>
          <View className={styles.backBtn} onClick={goBack}>
            <Text className={styles.backBtnText}>返回我的</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        {TABS.map((t) => (
          <View
            key={t.key}
            className={classnames(styles.tabBtn, tab === t.key && styles.tabBtnActive)}
            onClick={() => setTab(t.key)}
          >
            <Text className={styles.tabText}>{t.label}</Text>
            {t.key === 'review' && pendingReviewCount > 0 && (
              <View className={styles.tabBadge}>{pendingReviewCount}</View>
            )}
            {t.key === 'reports' && pendingReportCount > 0 && (
              <View className={styles.tabBadge}>{pendingReportCount}</View>
            )}
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.panel}>
        {tab === 'dashboard' && (
          <View style={{ padding: '$spacing-md $spacing-lg 0'.replace(/\$spacing-/g, '') }}>
            <View style={{ padding: '24rpx 32rpx 0' }}>
              <View className='statGrid' style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 32 }}>
                <View style={{ width: 'calc(50% - 12rpx)' }}>
                  <StatCard label='总用户数' value={dashboardStats.totalUsers.toLocaleString()} icon='👥' trend='↑ 12%' />
                </View>
                <View style={{ width: 'calc(50% - 12rpx)' }}>
                  <StatCard label='文章总数' value={dashboardStats.totalArticles.toLocaleString()} icon='📝' trend='↑ 8%' />
                </View>
                <View style={{ width: 'calc(50% - 12rpx)' }}>
                  <StatCard label='今日投稿' value={dashboardStats.dailySubmissions} icon='📤' trend='↑ 23%' />
                </View>
                <View style={{ width: 'calc(50% - 12rpx)' }}>
                  <StatCard label='地标总数' value={dashboardStats.totalLandmarks} icon='🏛' />
                </View>
              </View>
              <View style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.08)', marginBottom: 32, overflow: 'hidden' }}>
                <View style={{ padding: '32rpx 32rpx 16rpx', fontSize: 32, fontWeight: 600, color: '#1D2129' }}>待处理事项</View>
                <View style={{ display: 'flex', gap: 24, padding: '16rpx 32rpx 32rpx' }}>
                  <View style={{ flex: 1, background: '#f5f6f7', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    onClick={() => setTab('review')}
                  >
                    <Text style={{ fontSize: 36, fontWeight: 700, color: '#ff7d00' }}>{pendingReviewCount}</Text>
                    <Text style={{ fontSize: 22, color: '#86909C', marginTop: 8 }}>待审核</Text>
                  </View>
                  <View style={{ flex: 1, background: '#f5f6f7', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    onClick={() => setTab('reports')}
                  >
                    <Text style={{ fontSize: 36, fontWeight: 700, color: '#ff7d00' }}>{pendingReportCount}</Text>
                    <Text style={{ fontSize: 22, color: '#86909C', marginTop: 8 }}>待处理举报</Text>
                  </View>
                  <View style={{ flex: 1, background: '#f5f6f7', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Text style={{ fontSize: 36, fontWeight: 700, color: '#165dff' }}>{dashboardStats.totalActivities}</Text>
                    <Text style={{ fontSize: 22, color: '#86909C', marginTop: 8 }}>活动数</Text>
                  </View>
                </View>
              </View>
              <View style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.08)', marginBottom: 32, overflow: 'hidden' }}>
                <View style={{ padding: '32rpx 32rpx 0', fontSize: 32, fontWeight: 600, color: '#1D2129' }}>日活投稿趋势</View>
                <TrendChart data={dailySubmissions} />
              </View>
              <View style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.08)', marginBottom: 32, overflow: 'hidden' }}>
                <View style={{ padding: '32rpx 32rpx 0', fontSize: 32, fontWeight: 600, color: '#1D2129' }}>热门分类占比</View>
                <CategoryChart data={categoryStats} />
              </View>
            </View>
          </View>
        )}

        {tab === 'review' && (
          <View style={{ padding: '24rpx 32rpx 40rpx' }}>
            <View style={{ display: 'flex', padding: 16, gap: 16, background: '#fff', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 4rpx 16rpx rgba(0,0,0,0.1)', borderRadius: 12, marginBottom: 16 }}>
              {REVIEW_FILTERS.map((opt) => (
                <View
                  key={opt.value}
                  style={{
                    flex: 1,
                    height: 64,
                    padding: '0 32rpx',
                    borderRadius: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: reviewFilter === opt.value ? 'rgba(22,93,255,0.08)' : '#f5f6f7',
                    transition: 'all 0.25s ease'
                  }}
                  onClick={() => setReviewFilter(opt.value)}
                >
                  <Text style={{ fontSize: 28, fontWeight: 500, color: reviewFilter === opt.value ? '#165dff' : '#4E5969' }}>
                    {opt.label}
                  </Text>
                </View>
              ))}
            </View>
            <View style={{ padding: '16rpx 0' }}>
              <Text style={{ fontSize: 24, color: '#86909C' }}>待审核 {filteredReview.length} 条</Text>
            </View>
            {filteredReview.length > 0 ? (
              filteredReview.map((item) => (
                <ReviewCard
                  key={item.id}
                  item={item}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onTap={handleReviewTap}
                />
              ))
            ) : (
              <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120rpx 0' }}>
                <Text style={{ fontSize: 80, marginBottom: 24 }}>📋</Text>
                <Text style={{ fontSize: 28, color: '#86909C' }}>暂无待审核内容</Text>
              </View>
            )}
          </View>
        )}

        {tab === 'reports' && (
          <View style={{ padding: '24rpx 32rpx 40rpx' }}>
            <View style={{ display: 'flex', padding: 16, gap: 16, background: '#fff', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 4rpx 16rpx rgba(0,0,0,0.1)', borderRadius: 12, marginBottom: 16 }}>
              {REPORT_FILTERS.map((opt) => (
                <View
                  key={opt.value}
                  style={{
                    flex: 1,
                    height: 64,
                    padding: '0 32rpx',
                    borderRadius: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: reportFilter === opt.value ? 'rgba(22,93,255,0.08)' : '#f5f6f7',
                    transition: 'all 0.25s ease'
                  }}
                  onClick={() => setReportFilter(opt.value)}
                >
                  <Text style={{ fontSize: 28, fontWeight: 500, color: reportFilter === opt.value ? '#165dff' : '#4E5969' }}>
                    {opt.label}
                  </Text>
                </View>
              ))}
            </View>
            <View style={{ padding: '16rpx 0' }}>
              <Text style={{ fontSize: 24, color: '#86909C' }}>共 {filteredReport.length} 条举报</Text>
            </View>
            {filteredReport.length > 0 ? (
              filteredReport.map((item) => (
                <ReportCard
                  key={item.id}
                  item={item}
                  onTakedown={handleTakedown}
                  onIgnore={handleIgnore}
                  onTap={handleReportTap}
                />
              ))
            ) : (
              <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120rpx 0' }}>
                <Text style={{ fontSize: 80, marginBottom: 24 }}>📭</Text>
                <Text style={{ fontSize: 28, color: '#86909C' }}>暂无举报内容</Text>
              </View>
            )}
          </View>
        )}

        {tab === 'config' && (
          <View style={{ padding: '24rpx 32rpx 40rpx' }}>
            <ConfigSection title='Banner管理' count={banners.length} actionText='添加'>
              {banners.map((banner) => (
                <View key={banner.id} style={{ display: 'flex', alignItems: 'center', padding: '24rpx 0', borderBottom: '1rpx solid #f2f3f5' }}>
                  <Image
                    src={banner.imageUrl}
                    mode='aspectFill'
                    style={{ width: 160, height: 90, borderRadius: 8, flexShrink: 0 }}
                  />
                  <View style={{ flex: 1, marginLeft: 24, minWidth: 0 }}>
                    <Text
                      style={{
                        display: 'block',
                        fontSize: 28,
                        color: '#1D2129',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {banner.title}
                    </Text>
                    <Text
                      style={{ display: 'block', fontSize: 22, color: '#86909C', marginTop: 8 }}
                    >
                      排序: {banner.sort}
                    </Text>
                  </View>
                  <View style={{ display: 'flex', gap: 16, marginLeft: 16 }}>
                    <View
                      style={{
                        height: 48,
                        padding: '0 16rpx',
                        borderRadius: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: banner.active ? 'rgba(0,180,42,0.1)' : '#f2f3f5',
                        transition: 'all 0.25s ease'
                      }}
                      onClick={() => toggleBanner(banner.id)}
                    >
                      <Text style={{ fontSize: 22, fontWeight: 500, color: banner.active ? '#00B42A' : '#86909C' }}>
                        {banner.active ? '启用' : '禁用'}
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 48,
                        padding: '0 16rpx',
                        borderRadius: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(245,63,63,0.1)'
                      }}
                      onClick={() => deleteBanner(banner.id)}
                    >
                      <Text style={{ fontSize: 22, fontWeight: 500, color: '#f53f3f' }}>删除</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ConfigSection>

            <ConfigSection title='热门推荐' count={hotList.length} actionText='添加'>
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                {hotList.map((item) => (
                  <View key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'calc(33.33% - 16rpx)' }}>
                    <Image
                      src={item.coverImage}
                      mode='aspectFill'
                      style={{ width: 160, height: 160, borderRadius: 12 }}
                    />
                    <Text
                      style={{
                        fontSize: 22,
                        color: '#1D2129',
                        marginTop: 16,
                        display: 'block',
                        width: 160,
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.title}
                    </Text>
                    <View style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                      <View
                        style={{
                          height: 48,
                          padding: '0 16rpx',
                          borderRadius: 48,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: item.active ? 'rgba(0,180,42,0.1)' : '#f2f3f5',
                          transition: 'all 0.25s ease'
                        }}
                        onClick={() => toggleHot(item.id)}
                      >
                        <Text style={{ fontSize: 22, fontWeight: 500, color: item.active ? '#00B42A' : '#86909C' }}>
                          {item.active ? '启用' : '禁用'}
                        </Text>
                      </View>
                      <View
                        style={{
                          height: 48,
                          padding: '0 16rpx',
                          borderRadius: 48,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(245,63,63,0.1)'
                        }}
                        onClick={() => deleteHot(item.id)}
                      >
                        <Text style={{ fontSize: 22, fontWeight: 500, color: '#f53f3f' }}>删除</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ConfigSection>

            <ConfigSection title='敏感词库' count={words.length}>
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {words.map((w) => (
                  <View
                    key={w.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8rpx 24rpx',
                      background: '#f5f6f7',
                      borderRadius: 48,
                      gap: 8
                    }}
                  >
                    <Text style={{ fontSize: 28, color: '#1D2129', whiteSpace: 'nowrap' }}>{w.word}</Text>
                    <Text style={{ fontSize: 22, color: '#86909C', whiteSpace: 'nowrap' }}>{w.category}</Text>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        fontSize: 24,
                        color: '#86909C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => deleteWord(w.id)}
                    >
                      <Text style={{ fontSize: 24, color: '#86909C' }}>✕</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 32 }}>
                <Input
                  placeholder='敏感词'
                  value={newWord}
                  onInput={(e) => setNewWord(e.detail.value)}
                  style={{
                    flex: 1,
                    height: 64,
                    background: '#f5f6f7',
                    borderRadius: 8,
                    padding: '0 24rpx',
                    fontSize: 28,
                    color: '#1D2129',
                    boxSizing: 'border-box'
                  }}
                />
                <Input
                  placeholder='分类'
                  value={newCategory}
                  onInput={(e) => setNewCategory(e.detail.value)}
                  style={{
                    width: 180,
                    height: 64,
                    background: '#f5f6f7',
                    borderRadius: 8,
                    padding: '0 24rpx',
                    fontSize: 28,
                    color: '#1D2129',
                    boxSizing: 'border-box'
                  }}
                />
                <View
                  style={{
                    height: 64,
                    padding: '0 24rpx',
                    background: '#165dff',
                    borderRadius: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.25s ease'
                  }}
                  onClick={addWord}
                >
                  <Text style={{ color: '#fff', fontSize: 28, fontWeight: 500, whiteSpace: 'nowrap' }}>添加</Text>
                </View>
              </View>
            </ConfigSection>
          </View>
        )}
      </ScrollView>

      <RejectModal
        visible={rejectModalVisible}
        onConfirm={handleRejectConfirm}
        onCancel={() => { setRejectModalVisible(false); setRejectingId(''); }}
      />
    </View>
  );
};

export default AdminPage;
