import React from 'react';
import { View, Text } from '@tarojs/components';
import type { CategoryStat } from '@/types/admin';
import styles from './index.module.scss';

interface CategoryChartProps {
  data: CategoryStat[];
}

const chartColors = [
  '$color-chart-1',
  '$color-chart-2',
  '$color-chart-3',
  '$color-chart-4',
  '$color-chart-5',
  '$color-chart-6'
];

const colorValues = ['#165dff', '#00b42a', '#ff7d00', '#f53f3f', '#722ed1', '#0fc6c2'];

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <View className={styles.container}>
      <View className={styles.chartArea}>
        {data.map((item, index) => (
          <View
            key={item.name}
            className={styles.bar}
            style={{
              width: `${item.percentage}%`,
              backgroundColor: colorValues[index % colorValues.length]
            }}
          />
        ))}
      </View>
      <View className={styles.legend}>
        {data.map((item, index) => (
          <View key={item.name} className={styles.legendItem}>
            <View
              className={styles.dot}
              style={{ backgroundColor: colorValues[index % colorValues.length] }}
            />
            <Text className={styles.legendName}>{item.name}</Text>
            <Text className={styles.legendValue}>{item.percentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CategoryChart;
