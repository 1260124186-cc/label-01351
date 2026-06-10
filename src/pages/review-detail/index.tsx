import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import RejectModal from '@/components/RejectModal';
import { reviewList } from '@/data/review';
import type { ContentItem, ContentType } from '@/types/admin';
import styles from './index.module.scss';

const typeLabelMap: Record<ContentType, string> = {
  article: '文章',
  landmark: '地标',
  activity: '活动'
};

const ReviewDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id || '';
  const item = reviewList.find((i) => i.id === id) || reviewList[0];
  const [status, setStatus] = useState(item.status);
  const [rejectReason, setRejectReason] = useState(item.rejectReason || '');
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  const handleApprove = () => {
    Taro.showModal({
      title: '确认通过',
      content: '确定通过该内容审核吗？',
      success: (res) => {
        if (res.confirm) {
          setStatus('approved');
          Taro.showToast({ title: '已通过', icon: 'success' });
        }
      }
    });
  };

  const handleRejectConfirm = (reason: string) => {
    setStatus('rejected');
    setRejectReason(reason);
    setRejectModalVisible(false);
    Taro.showToast({ title: '已驳回', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <Image className={styles.coverImage} src={item.coverImage} mode='aspectFill' />
      <View className={styles.contentArea}>
        <Text className={styles.contentType}>{typeLabelMap[item.type]}</Text>
        <Text className={styles.title}>{item.title}</Text>
        <View className={styles.authorRow}>
          <Image className={styles.authorAvatar} src={item.authorAvatar} mode='aspectFill' />
          <View className={styles.authorInfo}>
            <Text className={styles.authorName}>{item.author}</Text>
            <Text className={styles.authorTime}>{item.createdAt}</Text>
          </View>
        </View>
        <Text className={styles.category}>{item.category}</Text>
        <Text className={styles.description}>{item.description}</Text>

        {status === 'rejected' && rejectReason && (
          <View className={styles.rejectReason}>
            <Text className={styles.rejectLabel}>驳回原因</Text>
            <Text className={styles.rejectText}>{rejectReason}</Text>
          </View>
        )}
      </View>

      {status === 'pending' && (
        <View className={styles.bottomBar}>
          <View className={styles.btnReject} onClick={() => setRejectModalVisible(true)}>
            <Text className={styles.statusText}>驳回</Text>
          </View>
          <View className={styles.btnApprove} onClick={handleApprove}>
            <Text className={styles.statusText}>通过</Text>
          </View>
        </View>
      )}

      <RejectModal
        visible={rejectModalVisible}
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectModalVisible(false)}
      />
    </View>
  );
};

export default ReviewDetailPage;
