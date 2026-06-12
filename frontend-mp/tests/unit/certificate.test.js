// tests/unit/certificate.test.js
// 证书相关功能单元测试

const api = require('../../utils/api');
const certificateData = require('../../utils/certificate-data');
const { initStorage, loginAsAdmin, loginAsUser } = require('../helpers');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('certificate-data 模块', () => {
  describe('simpleHash 哈希算法', () => {
    test('相同字符串生成相同哈希', () => {
      const str = 'test string for hash';
      const hash1 = certificateData.simpleHash(str);
      const hash2 = certificateData.simpleHash(str);
      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBe(8);
    });

    test('不同字符串生成不同哈希', () => {
      const hash1 = certificateData.simpleHash('string1');
      const hash2 = certificateData.simpleHash('string2');
      expect(hash1).not.toBe(hash2);
    });

    test('空字符串也能生成哈希', () => {
      const hash = certificateData.simpleHash('');
      expect(hash).toBeDefined();
      expect(hash.length).toBe(8);
    });
  });

  describe('generateCertificateNumber 证书编号生成', () => {
    test('编号格式正确：类型前缀-日期-随机字符', () => {
      const number = certificateData.generateCertificateNumber('activity_completion', '2024-01-15');
      const parts = number.split('-');
      expect(parts.length).toBe(3);
      expect(parts[0]).toBe('ACT');
      expect(parts[1]).toBe('20240115');
      expect(parts[2].length).toBe(6);
      expect(/^[A-Z0-9]+$/.test(parts[2])).toBe(true);
    });

    test('不同类型有不同前缀', () => {
      const n1 = certificateData.generateCertificateNumber('activity_completion', '2024-01-01');
      const n2 = certificateData.generateCertificateNumber('collection_completion', '2024-01-01');
      const n3 = certificateData.generateCertificateNumber('annual_award', '2024-01-01');
      expect(n1.startsWith('ACT-')).toBe(true);
      expect(n2.startsWith('COL-')).toBe(true);
      expect(n3.startsWith('AWR-')).toBe(true);
    });

    test('相同参数多次调用生成不同编号', () => {
      const numbers = new Set();
      for (let i = 0; i < 100; i++) {
        numbers.add(certificateData.generateCertificateNumber('activity_completion', '2024-01-15'));
      }
      expect(numbers.size).toBe(100);
    });
  });

  describe('generateCertificateHash 证书哈希生成', () => {
    test('基于证书关键字段生成哈希', () => {
      const cert = {
        id: 'cert_001',
        certificateNumber: 'ACT-20240115-ABC123',
        userId: 'user_001',
        userName: '张三',
        title: '活动结业证书',
        reason: '完成了全部课程学习',
        issuingUnit: 'unit_001',
        issueDate: '2024-01-15'
      };
      const hash = certificateData.generateCertificateHash(cert);
      expect(hash).toBeDefined();
      expect(hash.length).toBe(8);
    });

    test('字段内容变化会导致哈希变化', () => {
      const cert1 = {
        id: 'cert_001',
        certificateNumber: 'ACT-20240115-ABC123',
        userId: 'user_001',
        userName: '张三',
        title: '活动结业证书',
        reason: '完成了全部课程学习',
        issuingUnit: 'unit_001',
        issueDate: '2024-01-15'
      };
      const cert2 = { ...cert1, userName: '李四' };
      const hash1 = certificateData.generateCertificateHash(cert1);
      const hash2 = certificateData.generateCertificateHash(cert2);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyCertificateHash 证书哈希验证', () => {
    test('正确的证书数据验证通过', () => {
      const certData = {
        id: 'cert_001',
        certificateNumber: 'ACT-20240115-ABC123',
        userId: 'user_001',
        userName: '张三',
        title: '活动结业证书',
        reason: '完成了全部课程学习',
        issuingUnit: 'unit_001',
        issueDate: '2024-01-15'
      };
      const hash = certificateData.generateCertificateHash(certData);
      const cert = { ...certData, hash };
      const result = certificateData.verifyCertificateHash(cert);
      expect(result.valid).toBe(true);
      expect(result.message).toBe('证书验真通过');
    });

    test('被篡改的证书数据验证不通过', () => {
      const certData = {
        id: 'cert_001',
        certificateNumber: 'ACT-20240115-ABC123',
        userId: 'user_001',
        userName: '张三',
        title: '活动结业证书',
        reason: '完成了全部课程学习',
        issuingUnit: 'unit_001',
        issueDate: '2024-01-15'
      };
      const hash = certificateData.generateCertificateHash(certData);
      const cert = { ...certData, hash, userName: '李四' };
      const result = certificateData.verifyCertificateHash(cert);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('篡改');
    });
  });

  describe('generateVerificationCode 验证码生成', () => {
    test('生成6位验证码', () => {
      const code = certificateData.generateVerificationCode();
      expect(code.length).toBe(6);
      expect(/^[A-Z0-9]+$/.test(code)).toBe(true);
    });

    test('不包含易混淆字符', () => {
      for (let i = 0; i < 100; i++) {
        const code = certificateData.generateVerificationCode();
        expect(code).not.toContain('O');
        expect(code).not.toContain('0');
        expect(code).not.toContain('I');
        expect(code).not.toContain('1');
        expect(code).not.toContain('L');
      }
    });

    test('多次生成不同验证码', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(certificateData.generateVerificationCode());
      }
      expect(codes.size).toBeGreaterThan(90);
    });
  });

  describe('createCertificateData 创建证书数据', () => {
    test('创建完整证书数据并自动生成哈希', () => {
      const params = {
        typeId: 'activity_completion',
        userId: 'user_001',
        userName: '张三',
        title: '活动结业证书',
        reason: '完成了全部课程学习',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      };
      const cert = certificateData.createCertificateData(params);
      expect(cert.id).toBeDefined();
      expect(cert.certificateNumber).toBeDefined();
      expect(cert.verificationCode).toBeDefined();
      expect(cert.hash).toBeDefined();
      expect(cert.status).toBe('issued');
      expect(cert.userId).toBe('user_001');
      const verifyResult = certificateData.verifyCertificateHash(cert);
      expect(verifyResult.valid).toBe(true);
    });
  });

  describe('CERTIFICATE_TYPES 证书类型配置', () => {
    test('包含所有必要的证书类型', () => {
      const types = certificateData.CERTIFICATE_TYPES;
      expect(types.activity_completion).toBeDefined();
      expect(types.collection_completion).toBeDefined();
      expect(types.annual_award).toBeDefined();
      expect(types.cultural_contribution).toBeDefined();
      expect(types.volunteer_service).toBeDefined();
      expect(types.special_achievement).toBeDefined();
    });

    test('每种类型都有完整配置', () => {
      const types = Object.values(certificateData.CERTIFICATE_TYPES);
      types.forEach(type => {
        expect(type.id).toBeDefined();
        expect(type.name).toBeDefined();
        expect(type.title).toBeDefined();
        expect(type.icon).toBeDefined();
        expect(type.color).toBeDefined();
        expect(type.prefix).toBeDefined();
        expect(type.defaultReason).toBeDefined();
      });
    });
  });
});

describe('证书 API', () => {
  beforeEach(() => {
    initStorage();
    loginAsAdmin();
  });

  describe('issueCertificate 颁发证书', () => {
    test('成功颁发单张证书', async () => {
      const res = await api.issueCertificate({
        typeId: 'activity_completion',
        userId: 'user_001',
        userName: '测试用户',
        title: '活动结业证书',
        reason: '完成活动学习',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      });
      expect(res.code).toBe(200);
      expect(res.data.certificate.id).toBeDefined();
      expect(res.data.certificate.certificateNumber).toBeDefined();
      expect(res.data.certificate.status).toBe('issued');
    });

    test('颁发的证书可以通过哈希验证', async () => {
      const res = await api.issueCertificate({
        typeId: 'annual_award',
        userId: 'user_001',
        userName: '测试用户',
        title: '年度荣誉证书',
        reason: '年度优秀贡献',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      });
      const cert = res.data.certificate;
      expect(certificateData.verifyCertificateHash(cert).valid).toBe(true);
    });
  });

  describe('batchIssueCertificates 批量颁发证书', () => {
    test('成功批量颁发多张证书', async () => {
      const recipients = [
        { userId: 'user_001', userName: '用户1' },
        { userId: 'user_002', userName: '用户2' },
        { userId: 'user_003', userName: '用户3' }
      ];
      const res = await api.batchIssueCertificates({
        typeId: 'activity_completion',
        issuingUnitId: 'unit_001',
        reason: '完成活动学习',
        issueDate: '2024-01-15',
        recipients
      });
      expect(res.code).toBe(200);
      expect(res.data.count).toBe(3);
      expect(res.data.certificates.length).toBe(3);
      res.data.certificates.forEach(cert => {
        expect(cert.id).toBeDefined();
        expect(cert.certificateNumber).toBeDefined();
        expect(certificateData.verifyCertificateHash(cert).valid).toBe(true);
      });
    });

    test('批量颁发的证书编号互不相同', async () => {
      const recipients = [];
      for (let i = 0; i < 10; i++) {
        recipients.push({ userId: `user_${i}`, userName: `用户${i}` });
      }
      const res = await api.batchIssueCertificates({
        typeId: 'activity_completion',
        issuingUnitId: 'unit_001',
        reason: '完成活动学习',
        issueDate: '2024-01-15',
        recipients
      });
      const numbers = res.data.certificates.map(c => c.certificateNumber);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(10);
    });
  });

  describe('getMyCertificates 获取我的证书列表', () => {
    test('返回当前用户的证书列表', async () => {
      await api.issueCertificate({
        typeId: 'activity_completion',
        userId: 'user_001',
        userName: '张大爷',
        title: '活动结业证书',
        reason: '完成活动学习',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      });
      loginAsUser('user_001', '张大爷', '13800000001');
      const res = await api.getMyCertificates();
      expect(res.code).toBe(200);
      expect(res.data.list.length).toBeGreaterThan(0);
    });

    test('支持按类型筛选', async () => {
      await api.issueCertificate({
        typeId: 'activity_completion',
        userId: 'user_001',
        userName: '张大爷',
        title: '活动结业证书',
        reason: '完成活动',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      });
      await api.issueCertificate({
        typeId: 'annual_award',
        userId: 'user_001',
        userName: '张大爷',
        title: '年度荣誉证书',
        reason: '年度优秀',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      });
      loginAsUser('user_001', '张大爷', '13800000001');
      const res = await api.getMyCertificates({ typeId: 'annual_award' });
      expect(res.code).toBe(200);
      expect(res.data.list.every(c => c.typeId === 'annual_award')).toBe(true);
    });

    test('支持分页', async () => {
      for (let i = 0; i < 5; i++) {
        await api.issueCertificate({
          typeId: 'activity_completion',
          userId: 'user_001',
          userName: '张大爷',
          title: `证书${i}`,
          reason: '测试',
          issuingUnitId: 'unit_001',
          issueDate: '2024-01-15'
        });
      }
      loginAsUser('user_001', '张大爷', '13800000001');
      const res1 = await api.getMyCertificates({ page: 1, pageSize: 2 });
      expect(res1.code).toBe(200);
      expect(res1.data.list.length).toBe(2);
      expect(res1.data.hasMore).toBe(true);

      const res2 = await api.getMyCertificates({ page: 2, pageSize: 2 });
      expect(res2.code).toBe(200);
      expect(res2.data.list.length).toBe(2);
      expect(res2.data.hasMore).toBe(true);
    });
  });

  describe('getCertificateDetail 获取证书详情', () => {
    test('返回完整的证书详情', async () => {
      const issueRes = await api.issueCertificate({
        typeId: 'activity_completion',
        userId: 'user_001',
        userName: '测试用户',
        title: '活动结业证书',
        reason: '完成活动学习',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      });
      const certId = issueRes.data.certificate.id;

      const res = await api.getCertificateDetail(certId);
      expect(res.code).toBe(200);
      expect(res.data.id).toBe(certId);
      expect(res.data.typeInfo).toBeDefined();
      expect(res.data.issuingUnitName).toBeDefined();
      expect(res.data.formattedDate).toBeDefined();
      expect(res.data.verifyResult).toBeDefined();
    });

    test('浏览量自动递增', async () => {
      const issueRes = await api.issueCertificate({
        typeId: 'activity_completion',
        userId: 'user_001',
        userName: '测试用户',
        title: '活动结业证书',
        reason: '完成活动学习',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      });
      const certId = issueRes.data.certificate.id;

      await api.getCertificateDetail(certId);
      await api.getCertificateDetail(certId);
      const res = await api.getCertificateDetail(certId);
      expect(res.data.viewCount).toBe(3);
    });

    test('不存在的证书返回错误', async () => {
      const res = await api.getCertificateDetail('non_existent_id');
      expect(res.code).toBe(404);
    });
  });

  describe('verifyCertificate 证书查验', () => {
    test('正确的编号和验证码验证通过', async () => {
      const issueRes = await api.issueCertificate({
        typeId: 'activity_completion',
        userId: 'user_001',
        userName: '测试用户',
        title: '活动结业证书',
        reason: '完成活动学习',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      });
      const cert = issueRes.data.certificate;

      const res = await api.verifyCertificate({
        certificateNumber: cert.certificateNumber,
        verificationCode: cert.verificationCode
      });
      expect(res.code).toBe(200);
      expect(res.data.verifyResult.valid).toBe(true);
      expect(res.data.verifyResult.hashValid).toBe(true);
      expect(res.data.verifyResult.codeValid).toBe(true);
    });

    test('错误的验证码验证失败', async () => {
      const issueRes = await api.issueCertificate({
        typeId: 'activity_completion',
        userId: 'user_001',
        userName: '测试用户',
        title: '活动结业证书',
        reason: '完成活动学习',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      });
      const cert = issueRes.data.certificate;

      const res = await api.verifyCertificate({
        certificateNumber: cert.certificateNumber,
        verificationCode: 'ABCDEF'
      });
      expect(res.code).toBe(400);
      expect(res.message).toContain('验证码');
    });

    test('不存在的证书编号验证失败', async () => {
      const res = await api.verifyCertificate({
        certificateNumber: 'ACT-20240101-XXXXXX',
        verificationCode: 'ABCDEF'
      });
      expect(res.code).toBe(404);
      expect(res.message).toContain('不存在');
    });

    test('被篡改的证书哈希验证失败', async () => {
      const issueRes = await api.issueCertificate({
        typeId: 'activity_completion',
        userId: 'user_001',
        userName: '测试用户',
        title: '活动结业证书',
        reason: '完成活动学习',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      });
      const cert = issueRes.data.certificate;

      const certificates = wx.getStorageSync('certificates') || [];
      const idx = certificates.findIndex(c => c.id === cert.id);
      if (idx > -1) {
        certificates[idx].userName = '被篡改的名字';
        wx.setStorageSync('certificates', certificates);
      }

      const res = await api.verifyCertificate({
        certificateNumber: cert.certificateNumber,
        verificationCode: cert.verificationCode
      });
      expect(res.code).toBe(200);
      expect(res.data.verifyResult.valid).toBe(false);
      expect(res.data.verifyResult.hashValid).toBe(false);
    });
  });

  describe('getCertificateStats 获取证书统计', () => {
    test('返回正确的统计数据', async () => {
      await api.issueCertificate({
        typeId: 'activity_completion',
        userId: 'user_001',
        userName: '张大爷',
        title: '活动结业证书',
        reason: '完成活动',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      });
      await api.issueCertificate({
        typeId: 'annual_award',
        userId: 'user_001',
        userName: '张大爷',
        title: '年度荣誉证书',
        reason: '年度优秀',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      });
      loginAsUser('user_001', '张大爷', '13800000001');
      const res = await api.getCertificateStats();
      expect(res.code).toBe(200);
      expect(res.data.totalCount).toBe(4);
      expect(res.data.typeStats.length).toBeGreaterThan(0);
    });
  });

  describe('revokeCertificate 撤销证书', () => {
    test('成功撤销证书', async () => {
      const issueRes = await api.issueCertificate({
        typeId: 'activity_completion',
        userId: 'user_001',
        userName: '测试用户',
        title: '活动结业证书',
        reason: '完成活动学习',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      });
      const certId = issueRes.data.certificate.id;

      const res = await api.revokeCertificate(certId, '违规操作');
      expect(res.code).toBe(200);

      const detailRes = await api.getCertificateDetail(certId);
      expect(detailRes.data.status).toBe('revoked');
      expect(detailRes.data.revokeReason).toBe('违规操作');
    });

    test('已撤销的证书验证不通过', async () => {
      const issueRes = await api.issueCertificate({
        typeId: 'activity_completion',
        userId: 'user_001',
        userName: '测试用户',
        title: '活动结业证书',
        reason: '完成活动学习',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      });
      const cert = issueRes.data.certificate;

      await api.revokeCertificate(cert.id, '测试撤销');

      const res = await api.verifyCertificate({
        certificateNumber: cert.certificateNumber,
        verificationCode: cert.verificationCode
      });
      expect(res.data.verifyResult.valid).toBe(false);
      expect(res.data.verifyResult.message).toContain('撤销');
    });
  });

  describe('issueCertificatesForActivity 活动结业联动', () => {
    test('为活动参与者颁发结业证书', async () => {
      const res = await api.issueCertificatesForActivity('activity_001');
      expect(res.code).toBe(200);
      expect(res.data.count).toBeGreaterThan(0);
      res.data.certificates.forEach(cert => {
        expect(cert.typeId).toBe('activity_completion');
        expect(cert.relatedId).toBe('activity_001');
        expect(certificateData.verifyCertificateHash(cert).valid).toBe(true);
      });
    });
  });

  describe('issueCertificateForArticle 征集完成联动', () => {
    test('为文章作者颁发征集完成证书', async () => {
      const res = await api.issueCertificateForArticle('article_001');
      expect(res.code).toBe(200);
      expect(res.data.certificate.typeId).toBe('collection_completion');
      expect(res.data.certificate.relatedId).toBe('article_001');
      expect(certificateData.verifyCertificateHash(res.data.certificate).valid).toBe(true);
    });
  });

  describe('shareCertificate 记录分享次数', () => {
    test('分享次数正确递增', async () => {
      const issueRes = await api.issueCertificate({
        typeId: 'activity_completion',
        userId: 'user_001',
        userName: '测试用户',
        title: '活动结业证书',
        reason: '完成活动学习',
        issuingUnitId: 'unit_001',
        issueDate: '2024-01-15'
      });
      const certId = issueRes.data.certificate.id;

      await api.shareCertificate(certId);
      await api.shareCertificate(certId);
      const res = await api.shareCertificate(certId);
      expect(res.code).toBe(200);
      expect(res.data.shareCount).toBe(3);
    });
  });
});
