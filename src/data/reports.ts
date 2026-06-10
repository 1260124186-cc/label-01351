import type { ReportItem } from '@/types/admin';

export const reportList: ReportItem[] = [
  {
    id: 'rp001',
    contentId: 'c023',
    contentTitle: '某地农家乐推广软文（含虚假宣传）',
    contentType: 'article',
    coverImage: 'https://picsum.photos/id/431/750/500',
    reporter: '乡野清风',
    reporterAvatar: 'https://picsum.photos/id/64/200/200',
    reason: '虚假宣传，夸大收益，误导消费者',
    status: 'pending',
    createdAt: '2026-06-10 08:15'
  },
  {
    id: 'rp002',
    contentId: 'c045',
    contentTitle: '违规商业广告（无资质保健品）',
    contentType: 'article',
    coverImage: 'https://picsum.photos/id/625/750/500',
    reporter: '守护者',
    reporterAvatar: 'https://picsum.photos/id/91/200/200',
    reason: '涉及无资质保健品推广，违反平台规范',
    status: 'pending',
    createdAt: '2026-06-10 07:42'
  },
  {
    id: 'rp003',
    contentId: 'c067',
    contentTitle: '涉嫌抄袭的文章内容',
    contentType: 'article',
    coverImage: 'https://picsum.photos/id/312/750/500',
    reporter: '原创保护',
    reporterAvatar: 'https://picsum.photos/id/177/200/200',
    reason: '全文抄袭其他作者已发布内容',
    status: 'pending',
    createdAt: '2026-06-09 22:30'
  },
  {
    id: 'rp004',
    contentId: 'c089',
    contentTitle: '不当言论的评论区内容',
    contentType: 'article',
    coverImage: 'https://picsum.photos/id/835/750/500',
    reporter: '正义之声',
    reporterAvatar: 'https://picsum.photos/id/338/200/200',
    reason: '评论区含有不当政治言论',
    status: 'pending',
    createdAt: '2026-06-09 18:15'
  },
  {
    id: 'rp005',
    contentId: 'c102',
    contentTitle: '虚假地标信息',
    contentType: 'landmark',
    coverImage: 'https://picsum.photos/id/3/750/500',
    reporter: '实地探勘',
    reporterAvatar: 'https://picsum.photos/id/1027/200/200',
    reason: '地标位置信息错误，实际地点不存在该建筑',
    status: 'pending',
    createdAt: '2026-06-09 16:45'
  },
  {
    id: 'rp006',
    contentId: 'c115',
    contentTitle: '已过期的活动信息',
    contentType: 'activity',
    coverImage: 'https://picsum.photos/id/1080/750/500',
    reporter: '活动达人',
    reporterAvatar: 'https://picsum.photos/id/64/200/200',
    reason: '活动已于上月结束，但仍显示为进行中',
    status: 'pending',
    createdAt: '2026-06-09 14:20'
  },
  {
    id: 'rp007',
    contentId: 'c128',
    contentTitle: '重复发布的活动内容',
    contentType: 'activity',
    coverImage: 'https://picsum.photos/id/326/750/500',
    reporter: '秩序维护',
    reporterAvatar: 'https://picsum.photos/id/91/200/200',
    reason: '同一活动被不同用户重复发布3次',
    status: 'pending',
    createdAt: '2026-06-09 10:55'
  },
  {
    id: 'rp008',
    contentId: 'c142',
    contentTitle: '包含低俗图片的文章',
    contentType: 'article',
    coverImage: 'https://picsum.photos/id/401/750/500',
    reporter: '文明卫士',
    reporterAvatar: 'https://picsum.photos/id/177/200/200',
    reason: '文章配图包含低俗内容',
    status: 'pending',
    createdAt: '2026-06-08 21:30'
  }
];
