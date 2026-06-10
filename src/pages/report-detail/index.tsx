import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { reportList } from '@/data/reports';
import type { ReportItem, ReportStatus, ContentType } from '@/types/admin';
import styles from './index.module.scss';

const typeLabelMap: Record<ContentType, string> = {
  article: '文章',
  landmark: '地标',
  activity: '活动'
};

const statusLabelMap: Record<ReportStatus, string> = {
  pending: '待处理',
  takedown: '已下架',
  ignored: '已忽略'
};

const statusStyleMap: Record<ReportStatus, string> = {
  pending: styles.statusPending,
  takedown: styles.statusTakedown,
  ignored: styles.statusIgnored
};

const ReportDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id || '';
  const item = reportList.find((i) => i.id === id) || reportList[0];
  const [status, setStatus] = useState<ReportStatus>(item.status);

  const handleTakedown = () => {
    Taro.showModal({
      title: '确认下架',
      content: '下架后该内容将不再对外展示，确定下架吗？',
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm) {
          setStatus('takedown');
          Taro.showToast({ title: '已下架', icon: 'success' });
        }
      }
    });
  };

  const handleIgnore = () => {
    Taro.showModal({
      title: '确认忽略',
      content: '确定忽略该举报吗？',
      success: (res) => {
        if (res.confirm) {
          setStatus('ignored');
          Taro.showToast({ title: '已忽略', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <Image className={styles.coverImage} src={item.coverImage} mode='aspectFill' />
      <View className={styles.contentArea}>
        <Text className={classnames(styles.statusTag, statusStyleMap[status])}>
          {statusLabelMap[status]}
        </Text>
        <Text className={styles.title}>{item.contentTitle}</Text>

        <View className={styles.infoCard}>
          <Text className={styles.infoTitle}>举报信息</Text>
          <View className={styles.reporterRow}>
            <Image className={styles.reporterAvatar} src={item.reporterAvatar} mode='aspectFill' />
            <View className={styles.reporterInfo}>
              <Text className={styles.reporterName}>{item.reporter}</Text>
              <Text className={styles.reporterTime}>{item.createdAt} 举报</Text>
            </View>
          </View>
          <View className={styles.reasonArea}>
            <Text className={styles.reasonLabel}>举报原因</Text>
            <Text className={styles.reasonText}>{item.reason}</Text>
          </View>
        </View>
      </View>

      {status === 'pending' && (
        <View className={styles.bottomBar}>
          <View className={styles.btnIgnore} onClick={handleIgnore}>
            <Text className={styles.statusText}>忽略</Text>
          </View>
          <View className={styles.btnTakedown} onClick={handleTakedown}>
            <Text className={styles.statusText}>下架</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ReportDetailPage;
