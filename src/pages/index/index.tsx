import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAdminStore } from '@/store/admin';
import styles from './index.module.scss';

const FEATURES = [
  { icon: '📝', text: '文章库', path: '/pages/articles/index' },
  { icon: '🏛', text: '古地标', path: '/pages/landmarks/index' },
  { icon: '🎉', text: '民俗活动', path: '/pages/activities/index' },
  { icon: '💝', text: '我的收藏', path: '/pages/favorites/index' },
  { icon: '📌', text: '发布内容', path: '/pages/publish/index' },
  { icon: '🔍', text: '搜索', path: '/pages/search/index' }
];

const IndexPage: React.FC = () => {
  const userInfo = useAdminStore((state) => state.userInfo);
  const isAdmin = useAdminStore((state) => state.isAdmin());

  const goAdmin = () => {
    Taro.navigateTo({ url: '/pages/admin/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>乡村文化库</Text>
        <Text className={styles.headerSub}>
          你好，{userInfo?.nickname || '访客'} · 传承乡土文脉
        </Text>
      </View>

      <View className={styles.content}>
        {isAdmin && (
          <View className={styles.card} onClick={goAdmin}>
            <View className={styles.iconWrap}>
              <Text className={styles.icon}>🛠</Text>
            </View>
            <View className={styles.cardInfo}>
              <Text className={styles.cardTitle}>管理后台</Text>
              <Text className={styles.cardDesc}>内容审核 · 举报处理 · 数据看板 · 运营配置</Text>
            </View>
          </View>
        )}

        <View className={styles.featureGrid}>
          {FEATURES.map((f) => (
            <View
              key={f.text}
              className={styles.featureItem}
              onClick={() => Taro.showToast({ title: `${f.text}功能开发中`, icon: 'none' })}
            >
              <Text className={styles.featureIcon}>{f.icon}</Text>
              <Text className={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default IndexPage;
