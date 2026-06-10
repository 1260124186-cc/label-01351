import React from 'react';
import { View, Text } from '@tarojs/components';
import StatCard from '@/components/StatCard';
import CategoryChart from '@/components/CategoryChart';
import TrendChart from '@/components/TrendChart';
import { dashboardStats, categoryStats, dailySubmissions } from '@/data/dashboard';
import styles from './index.module.scss';

const DashboardPage: React.FC = () => {
  const stats = dashboardStats;

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>管理后台</Text>
        <Text className={styles.headerSub}>数据看板 · 实时概览</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.statGrid}>
          <View className={styles.statItem}>
            <StatCard label='总用户数' value={stats.totalUsers.toLocaleString()} icon='👥' trend='↑ 12%' />
          </View>
          <View className={styles.statItem}>
            <StatCard label='文章总数' value={stats.totalArticles.toLocaleString()} icon='📝' trend='↑ 8%' />
          </View>
          <View className={styles.statItem}>
            <StatCard label='今日投稿' value={stats.dailySubmissions} icon='📤' trend='↑ 23%' />
          </View>
          <View className={styles.statItem}>
            <StatCard label='地标总数' value={stats.totalLandmarks} icon='🏛' />
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>待处理事项</Text>
          </View>
          <View className={styles.pendingRow}>
            <View className={styles.pendingItem}>
              <Text className={styles.pendingValue}>{stats.pendingReviews}</Text>
              <Text className={styles.pendingLabel}>待审核</Text>
            </View>
            <View className={styles.pendingItem}>
              <Text className={styles.pendingValue}>{stats.pendingReports}</Text>
              <Text className={styles.pendingLabel}>待处理举报</Text>
            </View>
            <View className={styles.pendingItem}>
              <Text className={styles.pendingValue}>{stats.totalActivities}</Text>
              <Text className={styles.pendingLabel}>活动数</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>日活投稿趋势</Text>
          </View>
          <TrendChart data={dailySubmissions} />
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>热门分类占比</Text>
          </View>
          <CategoryChart data={categoryStats} />
        </View>
      </View>
    </View>
  );
};

export default DashboardPage;
