import React, { useState, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import ReportCard from '@/components/ReportCard';
import { reportList as mockReportList } from '@/data/reports';
import type { ReportItem, ReportStatus } from '@/types/admin';
import styles from './index.module.scss';

type FilterStatus = 'all' | ReportStatus;

const FILTER_OPTIONS: { label: string; value: FilterStatus }[] = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '已下架', value: 'takedown' },
  { label: '已忽略', value: 'ignored' }
];

const ReportsPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [list, setList] = useState<ReportItem[]>(mockReportList);

  const filteredList = filter === 'all' ? list : list.filter((item) => item.status === filter);

  const handleTakedown = useCallback((id: string) => {
    Taro.showModal({
      title: '确认下架',
      content: '下架后该内容将不再对外展示，确定下架吗？',
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm) {
          setList((prev) =>
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
          setList((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: 'ignored' as const } : item))
          );
          Taro.showToast({ title: '已忽略', icon: 'success' });
          console.info('[Report]', 'Report ignored:', id);
        }
      }
    });
  }, []);

  const handleTap = useCallback((id: string) => {
    Taro.navigateTo({ url: `/pages/report-detail/index?id=${id}` });
  }, []);

  return (
    <View className={styles.page}>
      <View className={styles.filterBar}>
        {FILTER_OPTIONS.map((opt) => (
          <View
            key={opt.value}
            className={classnames(styles.filterBtn, filter === opt.value && styles.filterBtnActive)}
            onClick={() => setFilter(opt.value)}
          >
            <Text className={styles.filterText}>{opt.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.countInfo}>
        <Text className={styles.countText}>共 {filteredList.length} 条举报</Text>
      </View>

      <View className={styles.listArea}>
        {filteredList.length > 0 ? (
          filteredList.map((item) => (
            <ReportCard
              key={item.id}
              item={item}
              onTakedown={handleTakedown}
              onIgnore={handleIgnore}
              onTap={handleTap}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无举报内容</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ReportsPage;
