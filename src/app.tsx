import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useAdminStore } from '@/store/admin';
import './app.scss';

function App(props) {
  const setUserInfo = useAdminStore((state) => state.setUserInfo);

  useEffect(() => {
    const defaultUser = {
      id: 'admin001',
      nickname: '管理员',
      avatar: 'https://picsum.photos/id/64/200/200',
      role: 'admin' as const
    };
    setUserInfo(defaultUser);
  }, []);

  useDidShow(() => {});

  useDidHide(() => {});

  return props.children;
}

export default App;
