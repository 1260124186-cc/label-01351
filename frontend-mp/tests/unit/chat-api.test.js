const api = require('../../utils/api');
const { initStorage, loginAsUser } = require('../helpers');

const ALICE = { id: 'user_alice', nickname: 'Alice', phone: '13800000001' };
const BOB = { id: 'user_bob', nickname: 'Bob', phone: '13800000002' };
const CAROL = { id: 'user_carol', nickname: 'Carol', phone: '13800000003' };

describe('站内私信核心 API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initStorage({});
  });

  describe('陌生人会话流程（防骚扰）', () => {
    test('陌生人首条消息 -> acceptStatus 为 pending', async () => {
      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);
      const res = await api.sendMessage(BOB.id, '你好，我是 Alice，看到你的活动想咨询一下～');
      expect(res.code).toBe(200);
      expect(res.data.isFirstStrangerMessage).toBe(true);

      const listRes = await api.getConversationList();
      expect(listRes.code).toBe(200);
      const conv = listRes.data.list.find(c => c.peerUserId === BOB.id);
      expect(conv).toBeDefined();
      expect(conv.acceptStatus).toBe('sent_pending');
    });

    test('接收方视角：收到陌生人首条 -> acceptStatus 为 pending', async () => {
      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);
      const sendRes = await api.sendMessage(BOB.id, '你好 Bob！');
      expect(sendRes.code).toBe(200);

      loginAsUser(BOB.id, BOB.nickname, BOB.phone);
      const listRes = await api.getConversationList();
      expect(listRes.code).toBe(200);
      const conv = listRes.data.list.find(c => c.peerUserId === ALICE.id);
      expect(conv).toBeDefined();
      expect(conv.acceptStatus).toBe('pending');
    });

    test('接收方可以接受会话请求 -> acceptStatus 变为 accepted', async () => {
      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);
      await api.sendMessage(BOB.id, '你好 Bob！');

      loginAsUser(BOB.id, BOB.nickname, BOB.phone);
      const acceptRes = await api.acceptConversationRequest(ALICE.id);
      expect(acceptRes.code).toBe(200);
      expect(acceptRes.data.acceptStatus).toBe('accepted');

      const listRes = await api.getConversationList();
      const conv = listRes.data.list.find(c => c.peerUserId === ALICE.id);
      expect(conv.acceptStatus).toBe('accepted');
    });

    test('接收方可以拒绝会话请求 -> acceptStatus 变为 rejected', async () => {
      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);
      await api.sendMessage(BOB.id, '你好 Bob！');

      loginAsUser(BOB.id, BOB.nickname, BOB.phone);
      const rejectRes = await api.rejectConversationRequest(ALICE.id);
      expect(rejectRes.code).toBe(200);
      expect(rejectRes.data.acceptStatus).toBe('rejected');
    });

    test('被拒绝后发送消息 -> 403 错误', async () => {
      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);
      await api.sendMessage(BOB.id, '你好 Bob！');

      loginAsUser(BOB.id, BOB.nickname, BOB.phone);
      await api.rejectConversationRequest(ALICE.id);

      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);
      const res = await api.sendMessage(BOB.id, '请回复我一下～');
      expect(res.code).toBe(403);
      expect(res.message).toContain('拒绝');
    });

    test('发送方等待对方接受期间，不能继续发送消息', async () => {
      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);
      const first = await api.sendMessage(BOB.id, '首条消息');
      expect(first.code).toBe(200);
      const second = await api.sendMessage(BOB.id, '第二条消息');
      expect(second.code).toBe(403);
      expect(second.message).toContain('等待');
    });
  });

  describe('接受后双方可正常通信', () => {
    async function establishAccepted(peer1, peer2) {
      loginAsUser(peer1.id, peer1.nickname, peer1.phone);
      await api.sendMessage(peer2.id, `你好 ${peer2.nickname}`);
      loginAsUser(peer2.id, peer2.nickname, peer2.phone);
      await api.acceptConversationRequest(peer1.id);
    }

    test('接受后双方可互发消息并保存到各自消息列表', async () => {
      await establishAccepted(ALICE, BOB);
      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);
      const m1 = await api.sendMessage(BOB.id, '最近好吗？');
      expect(m1.code).toBe(200);
      expect(m1.data.content).toBe('最近好吗？');

      loginAsUser(BOB.id, BOB.nickname, BOB.phone);
      const m2 = await api.sendMessage(ALICE.id, '挺好的，你呢？');
      expect(m2.code).toBe(200);

      const msgRes = await api.getMessageList(ALICE.id);
      expect(msgRes.code).toBe(200);
      expect(msgRes.data.list.length).toBeGreaterThanOrEqual(2);
    });

    test('消息字数限制：2-500 字', async () => {
      await establishAccepted(ALICE, BOB);
      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);

      const short = await api.sendMessage(BOB.id, '');
      expect(short.code).toBe(400);

      const char1 = await api.sendMessage(BOB.id, '你');
      expect(char1.code).toBe(400);

      const long = await api.sendMessage(BOB.id, 'a'.repeat(600));
      expect(long.code).toBe(400);

      const ok = await api.sendMessage(BOB.id, '今天天气真好');
      expect(ok.code).toBe(200);
    });

    test('敏感词检测会被拦截', async () => {
      await establishAccepted(ALICE, BOB);
      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);

      // util.checkSensitiveWords 对 '诈骗'、'色情'、'毒品' 等有检测
      const bad = await api.sendMessage(BOB.id, '这是一条诈骗消息，请勿相信');
      expect(bad.code).toBe(400);
      expect(bad.message).toContain('敏感');
    });
  });

  describe('会话列表和未读数', () => {
    test('多会话按最后更新时间倒序', async () => {
      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);
      await api.sendMessage(BOB.id, '给 Bob 的消息');
      const lastMsgCarol = await api.sendMessage(CAROL.id, '给 Carol 的消息');
      expect(lastMsgCarol.code).toBe(200);

      const listRes = await api.getConversationList();
      expect(listRes.code).toBe(200);
      expect(listRes.data.list.length).toBe(2);
      expect(listRes.data.list[0].peerUserId).toBe(CAROL.id);
    });

    test('未读数：发送者不会增加，接收者未读数+1，已读后清零', async () => {
      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);
      const sendRes = await api.sendMessage(BOB.id, '未读数测试');
      expect(sendRes.code).toBe(200);

      loginAsUser(BOB.id, BOB.nickname, BOB.phone);
      const unreadRes = await api.getMessageUnreadCount();
      expect(unreadRes.code).toBe(200);
      expect(unreadRes.data.unreadCount).toBeGreaterThanOrEqual(1);

      await api.markConversationAsRead(ALICE.id);
      const afterRead = await api.getMessageUnreadCount();
      expect(afterRead.code).toBe(200);
      expect(afterRead.data.unreadCount).toBe(0);
    });
  });

  describe('拉黑机制', () => {
    test('拉黑用户后会话不可见且发送被阻断', async () => {
      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);
      const msgRes = await api.sendMessage(BOB.id, '拉黑前最后一条');
      expect(msgRes.code).toBe(200);

      const blockRes = await api.blockUser(BOB.id, '不想说话');
      expect(blockRes.code).toBe(200);

      const listRes = await api.getConversationList();
      const conv = listRes.data.list.find(c => c.peerUserId === BOB.id);
      expect(conv).toBeUndefined();

      const sendBlocked = await api.sendMessage(BOB.id, '试试还能发吗');
      expect(sendBlocked.code).toBe(403);
    });

    test('解除拉黑后可以重新发送', async () => {
      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);
      await api.blockUser(BOB.id);
      const blockedSend = await api.sendMessage(BOB.id, '被拉黑');
      expect(blockedSend.code).toBe(403);

      const unblockRes = await api.unblockUser(BOB.id);
      expect(unblockRes.code).toBe(200);

      const afterSend = await api.sendMessage(BOB.id, '已解除');
      expect(afterSend.code).toBe(200);
    });

    test('双向检查：被对方拉黑时发送也被阻断', async () => {
      loginAsUser(BOB.id, BOB.nickname, BOB.phone);
      await api.blockUser(ALICE.id);

      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);
      const send = await api.sendMessage(BOB.id, '我想联系你');
      expect(send.code).toBe(403);
      expect(send.message).toContain('拉黑');
    });
  });

  describe('举报机制', () => {
    test('举报用户返回 200 且记录保存', async () => {
      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);
      const reasons = await api.getReportReasons();
      expect(reasons.code).toBe(200);
      expect(Array.isArray(reasons.data)).toBe(true);
      expect(reasons.data.length).toBeGreaterThan(0);

      const reasonId = reasons.data[0].id;
      const reportRes = await api.reportUser({
        targetUserId: BOB.id,
        reasonType: reasonId,
        description: '对方辱骂我',
        source: 'chat'
      });
      expect(reportRes.code).toBe(200);
      expect(reportRes.data.id).toBeDefined();
      expect(reportRes.data.status).toBe('pending');

      const mine = await api.getMyReports();
      expect(mine.code).toBe(200);
      expect(mine.data.list.length).toBe(1);
      expect(mine.data.list[0].targetUserId).toBe(BOB.id);
    });
  });

  describe('Storage key 独立性', () => {
    test('消息相关 Storage 使用独立 key，不污染其他模块', async () => {
      loginAsUser(ALICE.id, ALICE.nickname, ALICE.phone);
      await api.sendMessage(BOB.id, 'Storage 隔离测试');
      await api.blockUser(CAROL.id);
      await api.reportUser({ targetUserId: BOB.id, reasonType: 'r1', source: 'chat' });

      const info = wx.getStorageInfoSync ? wx.getStorageInfoSync() : { keys: Object.keys(wx._storage) };
      const keys = info.keys || [];
      const chatRelated = keys.filter(k =>
        k === 'conversations' ||
        k === 'messages' ||
        k === 'blockedUsers' ||
        k === 'reports'
      );
      expect(chatRelated.length).toBeGreaterThanOrEqual(3);
    });
  });
});
