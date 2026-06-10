import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { useAdminStore } from '@/store/admin';

export function useAdminGuard() {
  const userInfo = useAdminStore((state) => state.userInfo);
  const initUserInfo = useAdminStore((state) => state.initUserInfo);
  const isAdminFn = useAdminStore((state) => state.isAdmin);

  const [checked, setChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      initUserInfo();
      return;
    }

    const admin = isAdminFn();
    setHasAccess(admin);
    setChecked(true);

    if (!admin) {
      console.warn('[AuthGuard]', 'Access denied. Role:', userInfo.role);
      Taro.showModal({
        title: '无权限访问',
        content: '您当前不是管理员账号，无法访问管理后台。请联系系统管理员开通权限后重试。',
        showCancel: false,
        confirmText: '我知道了',
        success: () => {
          Taro.switchTab({ url: '/pages/mine/index' }).catch(() => {
            Taro.navigateBack().catch(() => {
              Taro.reLaunch({ url: '/pages/index/index' });
            });
          });
        }
      });
    }
  }, [userInfo, initUserInfo, isAdminFn]);

  return {
    loading: !checked,
    hasAccess,
    userInfo
  };
}
