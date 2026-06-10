import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StatCardProps {
  label: string;
  value: number | string;
  trend?: string;
  icon?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, icon }) => {
  return (
    <View className={styles.card}>
      <View className={styles.iconWrap}>
        <Text className={styles.icon}>{icon || '📊'}</Text>
      </View>
      <View className={styles.info}>
        <Text className={styles.value}>{value}</Text>
        <Text className={styles.label}>{label}</Text>
      </View>
      {trend && <Text className={styles.trend}>{trend}</Text>}
    </View>
  );
};

export default StatCard;
