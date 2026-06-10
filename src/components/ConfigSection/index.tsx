import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface ConfigSectionProps {
  title: string;
  count?: number;
  actionText?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

const ConfigSection: React.FC<ConfigSectionProps> = ({
  title,
  count,
  actionText,
  onAction,
  children
}) => {
  return (
    <View className={styles.section}>
      <View className={styles.sectionHeader}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>{title}</Text>
          {count !== undefined && <Text className={styles.count}>{count}</Text>}
        </View>
        {actionText && (
          <View className={styles.actionBtn} onClick={onAction}>
            <Text className={styles.actionText}>{actionText}</Text>
          </View>
        )}
      </View>
      <View className={styles.sectionBody}>{children}</View>
    </View>
  );
};

export default ConfigSection;
