import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import type { ContentItem, ContentType } from '@/types/admin';
import styles from './index.module.scss';

interface ReviewCardProps {
  item: ContentItem;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onTap?: (id: string) => void;
}

const typeLabelMap: Record<ContentType, string> = {
  article: '文章',
  landmark: '地标',
  activity: '活动'
};

const typeStyleMap: Record<ContentType, string> = {
  article: styles.tagArticle,
  landmark: styles.tagLandmark,
  activity: styles.tagActivity
};

const ReviewCard: React.FC<ReviewCardProps> = ({ item, onApprove, onReject, onTap }) => {
  return (
    <View className={styles.card} onClick={() => onTap?.(item.id)}>
      <Image className={styles.cover} src={item.coverImage} mode='aspectFill' />
      <View className={styles.body}>
        <View className={styles.header}>
          <Text className={classnames(styles.typeTag, typeStyleMap[item.type])}>
            {typeLabelMap[item.type]}
          </Text>
          <Text className={styles.time}>{item.createdAt}</Text>
        </View>
        <Text className={styles.title}>{item.title}</Text>
        <Text className={styles.desc}>{item.description}</Text>
        <View className={styles.footer}>
          <View className={styles.author}>
            <Image className={styles.avatar} src={item.authorAvatar} mode='aspectFill' />
            <Text className={styles.authorName}>{item.author}</Text>
          </View>
          {item.status === 'pending' && (
            <View className={styles.actions}>
              <View
                className={classnames(styles.btn, styles.btnReject)}
                onClick={(e) => { e.stopPropagation(); onReject?.(item.id); }}
              >
                <Text className={styles.btnText}>驳回</Text>
              </View>
              <View
                className={classnames(styles.btn, styles.btnApprove)}
                onClick={(e) => { e.stopPropagation(); onApprove?.(item.id); }}
              >
                <Text className={styles.btnText}>通过</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ReviewCard;
