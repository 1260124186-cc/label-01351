import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import styles from './index.module.scss';

interface RejectModalProps {
  visible: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

const RejectModal: React.FC<RejectModalProps> = ({ visible, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');

  if (!visible) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      return;
    }
    onConfirm(reason.trim());
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    onCancel();
  };

  return (
    <View className={styles.overlay}>
      <View className={styles.modal}>
        <Text className={styles.title}>驳回原因</Text>
        <Text className={styles.hint}>请输入驳回原因，将通知内容提交者</Text>
        <Input
          className={styles.input}
          placeholder='请输入驳回原因'
          value={reason}
          onInput={(e) => setReason(e.detail.value)}
          maxlength={200}
        />
        <View className={styles.actions}>
          <View className={styles.btnCancel} onClick={handleCancel}>
            <Text className={styles.btnText}>取消</Text>
          </View>
          <View
            className={reason.trim() ? styles.btnConfirm : styles.btnConfirmDisabled}
            onClick={handleConfirm}
          >
            <Text className={styles.btnTextWhite}>确认驳回</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RejectModal;
