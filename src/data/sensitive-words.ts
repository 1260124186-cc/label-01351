import type { SensitiveWord } from '@/types/admin';

export const sensitiveWords: SensitiveWord[] = [
  { id: 'sw001', word: '虚假宣传', category: '广告违规', createdAt: '2026-05-15' },
  { id: 'sw002', word: '包治百病', category: '医疗违规', createdAt: '2026-05-15' },
  { id: 'sw003', word: '代购走私', category: '违法内容', createdAt: '2026-05-16' },
  { id: 'sw004', word: '刷单返利', category: '欺诈内容', createdAt: '2026-05-18' },
  { id: 'sw005', word: '赌博下注', category: '违法内容', createdAt: '2026-05-20' },
  { id: 'sw006', word: '低俗擦边', category: '低俗内容', createdAt: '2026-05-22' },
  { id: 'sw007', word: '投资理财稳赚', category: '欺诈内容', createdAt: '2026-05-25' },
  { id: 'sw008', word: '枪支交易', category: '违法内容', createdAt: '2026-05-28' },
  { id: 'sw009', word: '虚假中奖', category: '欺诈内容', createdAt: '2026-06-01' },
  { id: 'sw010', word: '封建迷信', category: '不良信息', createdAt: '2026-06-03' }
];
