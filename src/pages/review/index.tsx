import React, { useState, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import ReviewCard from '@/components/ReviewCard';
import RejectModal from '@/components/RejectModal';
import { reviewList as mockReviewList } from '@/data/review';
import type { ContentItem, ContentType } from '@/types/admin';
import styles from './index.module.scss';

type FilterType = 'all' | ContentType;

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: '全部', value: 'all' },
  { label: '文章', value: 'article' },
  { label: '地标', value: 'landmark' },
  { label: '活动', value: 'activity' }
];

const ReviewPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [list, setList] = useState<ContentItem[]>(mockReviewList);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectingId, setRejectingId] = useState('');

  const filteredList = filter === 'all' ? list : list.filter((item) => item.type === filter);

  const handleApprove = useCallback((id: string) => {
    Taro.showModal({
      title: '确认通过',
      content: '确定通过该内容审核吗？',
      success: (res) => {
        if (res.confirm) {
          setList((prev) =>
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
    setList((prev) =>
      prev.map((item) =>
        item.id === rejectingId ? { ...item, status: 'rejected' as const, rejectReason: reason } : item
      )
    );
    setRejectModalVisible(false);
    setRejectingId('');
    Taro.showToast({ title: '已驳回', icon: 'success' });
    console.info('[Review]', 'Content rejected:', rejectingId, 'Reason:', reason);
  }, [rejectingId]);

  const handleTap = useCallback((id: string) => {
    Taro.navigateTo({ url: `/pages/review-detail/index?id=${id}` });
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
        <Text className={styles.countText}>待审核 {filteredList.length} 条</Text>
      </View>

      <View className={styles.listArea}>
        {filteredList.length > 0 ? (
          filteredList.map((item) => (
            <ReviewCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onReject={handleReject}
              onTap={handleTap}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无待审核内容</Text>
          </View>
        )}
      </View>

      <RejectModal
        visible={rejectModalVisible}
        onConfirm={handleRejectConfirm}
        onCancel={() => { setRejectModalVisible(false); setRejectingId(''); }}
      />
    </View>
  );
};

export default ReviewPage;
