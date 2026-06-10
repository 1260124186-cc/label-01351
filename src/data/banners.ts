import type { BannerItem } from '@/types/admin';

export const bannerList: BannerItem[] = [
  {
    id: 'b001',
    title: '端午文化周特别活动',
    imageUrl: 'https://picsum.photos/id/1044/750/400',
    link: '/pages/activity-detail/index?id=p001',
    sort: 1,
    active: true
  },
  {
    id: 'b002',
    title: '非遗手作体验季',
    imageUrl: 'https://picsum.photos/id/103/750/400',
    link: '/pages/activity-detail/index?id=p002',
    sort: 2,
    active: true
  },
  {
    id: 'b003',
    title: '乡村美食地图上线',
    imageUrl: 'https://picsum.photos/id/292/750/400',
    link: '/pages/activity-detail/index?id=p003',
    sort: 3,
    active: false
  },
  {
    id: 'b004',
    title: '古村落摄影大赛',
    imageUrl: 'https://picsum.photos/id/1018/750/400',
    link: '/pages/activity-detail/index?id=p004',
    sort: 4,
    active: true
  }
];
