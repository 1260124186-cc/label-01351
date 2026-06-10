import React, { useState } from 'react';
import { View, Text, Image, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAdminStore } from '@/store/admin';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const userInfo = useAdminStore((state) => state.userInfo);
  const initUserInfo = useAdminStore((state) => state.initUserInfo);
  const setUserInfo = useAdminStore((state) => state.setUserInfo);
  const logout = useAdminStore((state) => state.logout);
  const isAdmin = useAdminStore((state) => state.isAdmin());

  const [mockRole, setMockRole] = useState(userInfo?.role || 'user');

  React.useEffect(() => {
    if (!userInfo) {
      initUserInfo();
    }
  }, [userInfo, initUserInfo]);

  const goAdmin = () => {
    if (isAdmin) {
      Taro.navigateTo({ url: '/pages/admin/index' });
    } else {
      Taro.showModal({
        title: '无权限访问',
        content: '您当前不是管理员账号，无法访问管理后台。',
        showCancel: false
      });
    }
  };

  const handleSwitchRole = () => {
    const role = mockRole as 'user' | 'admin';
    const newUser = {
      id: 'u001',
      nickname: role === 'admin' ? '系统管理员' : '普通用户',
      avatar: role === 'admin' ? 'https://picsum.photos/id/64/200/200' : 'https://picsum.photos/id/338/200/200',
      role
    };
    setUserInfo(newUser);
    Taro.showToast({ title: `已切换为${role === 'admin' ? '管理员' : '普通用户'}`, icon: 'success' });
    console.info('[RoleSwitch]', 'Mock role switched to:', role);
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出？',
      content: '退出后需要重新登录',
      success: (res) => {
        if (res.confirm) {
          logout();
          Taro.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>
            {userInfo?.avatar ? (
              <Image className={styles.avatarImg} src={userInfo.avatar} mode='aspectFill' />
            ) : (
              <Text className={styles.avatarIcon}>👤</Text>
            )}
          </View>
          <View className={styles.userText}>
            <Text className={styles.nickname}>{userInfo?.nickname || '未登录'}</Text>
            <Text
              className={classnames(
                styles.roleTag,
                isAdmin && styles.roleTagAdmin
              )}
            >
              {isAdmin ? '🛡 管理员' : '普通用户'}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.card}>
          <Text className={styles.cardTitle}>角色模拟（调试用）</Text>
          <View className={styles.switchRow}>
            <Text className={styles.switchLabel}>当前 Role：</Text>
            <Input
              className={styles.switchInput}
              value={mockRole}
              onInput={(e) => setMockRole(e.detail.value)}
              placeholder='user 或 admin'
            />
            <View className={styles.switchBtn} onClick={handleSwitchRole}>
              <Text className={styles.switchBtnText}>写入 Storage</Text>
            </View>
          </View>
        </View>

        {isAdmin && (
          <View className={classnames(styles.card, styles.adminEntry)} onClick={goAdmin}>
            <View className={styles.menuItem} style={{ borderTop: 'none' }}>
              <Text className={styles.menuIcon}>🛠</Text>
              <View style={{ flex: 1 }}>
                <Text className={styles.adminTag}>ADMIN</Text>
                <Text className={styles.menuText}>管理后台</Text>
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        )}

        <View className={styles.card}>
          <Text className={styles.cardTitle}>常用功能</Text>
          <View
            className={styles.menuItem}
            style={{ borderTop: 'none' }}
            onClick={() => Taro.showToast({ title: '功能开发中', icon: 'none' })}
          >
            <Text className={styles.menuIcon}>📝</Text>
            <Text className={styles.menuText}>我的发布</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View
            className={styles.menuItem}
            onClick={() => Taro.showToast({ title: '功能开发中', icon: 'none' })}
          >
            <Text className={styles.menuIcon}>💝</Text>
            <Text className={styles.menuText}>我的收藏</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>设置</Text>
          <View
            className={styles.menuItem}
            style={{ borderTop: 'none' }}
            onClick={() => Taro.showToast({ title: '功能开发中', icon: 'none' })}
          >
            <Text className={styles.menuIcon}>⚙️</Text>
            <Text className={styles.menuText}>账号设置</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleLogout}>
            <Text className={styles.menuIcon}>🚪</Text>
            <Text className={styles.menuText}>退出登录</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MinePage;
