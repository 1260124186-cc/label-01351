import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useAdminStore } from '@/store/admin';
import './app.scss';

function App(props) {
  const initUserInfo = useAdminStore((state) => state.initUserInfo);

  useEffect(() => {
    initUserInfo();
  }, [initUserInfo]);

  useDidShow(() => {
    initUserInfo();
  });

  useDidHide(() => {});

  return props.children;
}

export default App;
