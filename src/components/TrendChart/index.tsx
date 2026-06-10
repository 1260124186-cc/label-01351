import React from 'react';
import { View, Text } from '@tarojs/components';
import type { DailySubmission } from '@/types/admin';
import styles from './index.module.scss';

interface TrendChartProps {
  data: DailySubmission[];
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <View className={styles.container}>
      <View className={styles.chartArea}>
        {data.map((item) => {
          const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          return (
            <View key={item.date} className={styles.barGroup}>
              <Text className={styles.barValue}>{item.count}</Text>
              <View className={styles.barBg}>
                <View
                  className={styles.barFill}
                  style={{ height: `${height}%` }}
                />
              </View>
              <Text className={styles.barLabel}>{item.date}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default TrendChart;
