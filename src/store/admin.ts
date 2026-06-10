import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { UserInfo } from '@/types/admin';

interface AdminState {
  userInfo: UserInfo | null;
  initUserInfo: () => void;
  setUserInfo: (info: UserInfo) => void;
  isAdmin: () => boolean;
  logout: () => void;
}

const GUEST_USER: UserInfo = {
  id: 'guest',
  nickname: '游客',
  avatar: '',
  role: 'user'
};

export const useAdminStore = create<AdminState>((set, get) => ({
  userInfo: null,

  initUserInfo: () => {
    try {
      const stored = Taro.getStorageSync('userInfo');
      if (stored && typeof stored === 'object' && stored.id) {
        const userInfo: UserInfo = {
          id: stored.id,
          nickname: stored.nickname || '用户',
          avatar: stored.avatar || '',
          role: stored.role === 'admin' ? 'admin' : 'user'
        };
        console.info('[Auth]', 'User loaded from storage:', userInfo.nickname, 'role:', userInfo.role);
        set({ userInfo });
      } else {
        console.info('[Auth]', 'No userInfo in storage, using guest');
        set({ userInfo: GUEST_USER });
      }
    } catch (error) {
      console.error('[Auth]', 'Failed to read userInfo:', error);
      set({ userInfo: GUEST_USER });
    }
  },

  setUserInfo: (info: UserInfo) => {
    try {
      Taro.setStorageSync('userInfo', info);
    } catch (error) {
      console.error('[Auth]', 'Failed to persist userInfo:', error);
    }
    set({ userInfo: info });
  },

  isAdmin: () => {
    const state = get();
    if (!state.userInfo) return false;
    return state.userInfo.role === 'admin';
  },

  logout: () => {
    try {
      Taro.removeStorageSync('userInfo');
    } catch (error) {
      console.error('[Auth]', 'Failed to remove userInfo:', error);
    }
    set({ userInfo: GUEST_USER });
  }
}));
