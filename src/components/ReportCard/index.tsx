import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import type { ReportItem, ReportStatus } from '@/types/admin';
import styles from './index.module.scss';

interface ReportCardProps {
  item: ReportItem;
  onTakedown?: (id: string) => void;
  onIgnore?: (id: string) => void;
  onTap?: (id: string) => void;
}

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

const ReportCard: React.FC<ReportCardProps> = ({ item, onTakedown, onIgnore, onTap }) => {
  return (
    <View className={styles.card} onClick={() => onTap?.(item.id)}>
      <Image className={styles.cover} src={item.coverImage} mode='aspectFill' />
      <View className={styles.body}>
        <View className={styles.header}>
          <Text className={classnames(styles.statusTag, statusStyleMap[item.status])}>
            {statusLabelMap[item.status]}
          </Text>
        </View>
        <Text className={styles.title}>{item.contentTitle}</Text>
        <Text className={styles.reason}>举报原因：{item.reason}</Text>
        <View className={styles.footer}>
          <View className={styles.reporter}>
            <Image className={styles.avatar} src={item.reporterAvatar} mode='aspectFill' />
            <Text className={styles.reporterName}>{item.reporter}</Text>
          </View>
          {item.status === 'pending' && (
            <View className={styles.actions}>
              <View
                className={classnames(styles.btn, styles.btnIgnore)}
                onClick={(e) => { e.stopPropagation(); onIgnore?.(item.id); }}
              >
                <Text className={styles.btnText}>忽略</Text>
              </View>
              <View
                className={classnames(styles.btn, styles.btnTakedown)}
                onClick={(e) => { e.stopPropagation(); onTakedown?.(item.id); }}
              >
                <Text className={styles.btnText}>下架</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ReportCard;
