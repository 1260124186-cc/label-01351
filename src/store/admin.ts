import { create } from 'zustand';
import type { UserInfo } from '@/types/admin';

interface AdminState {
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo) => void;
  isAdmin: () => boolean;
}

const defaultUser: UserInfo = {
  id: 'admin001',
  nickname: '管理员',
  avatar: 'https://picsum.photos/id/64/200/200',
  role: 'admin'
};

export const useAdminStore = create<AdminState>((set, get) => ({
  userInfo: defaultUser,
  setUserInfo: (info) => set({ userInfo: info }),
  isAdmin: () => get().userInfo.role === 'admin'
}));
