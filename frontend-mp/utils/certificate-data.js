// utils/certificate-data.js
// 电子荣誉证书数据和工具函数

const util = require('./util');

const CERTIFICATE_TYPES = {
  activity_completion: {
    id: 'activity_completion',
    name: '活动结业证书',
    title: '活动结业证书',
    icon: '🎓',
    color: '#1890ff',
    prefix: 'ACT',
    defaultReason: '已完成全部课程学习，成绩合格，准予结业。'
  },
  collection_completion: {
    id: 'collection_completion',
    name: '征集完成证书',
    title: '文化贡献证书',
    icon: '📜',
    color: '#52c41a',
    prefix: 'COL',
    defaultReason: '您的文化征集作品已被收录，感谢您为乡村文化传承做出的贡献。'
  },
  annual_award: {
    id: 'annual_award',
    name: '年度评选证书',
    title: '年度荣誉证书',
    icon: '🏆',
    color: '#faad14',
    prefix: 'AWR',
    defaultReason: '在年度评选活动中表现优异，特颁此证，以资鼓励。'
  },
  cultural_contribution: {
    id: 'cultural_contribution',
    name: '文化贡献证书',
    title: '文化贡献证书',
    icon: '⭐',
    color: '#eb2f96',
    prefix: 'CUL',
    defaultReason: '在乡村文化保护与传承工作中做出突出贡献，特颁此证。'
  },
  volunteer_service: {
    id: 'volunteer_service',
    name: '志愿服务证书',
    title: '志愿服务证书',
    icon: '💝',
    color: '#13c2c2',
    prefix: 'VOL',
    defaultReason: '感谢您无私奉献的志愿服务精神，您的付出让乡村文化更有温度。'
  },
  special_achievement: {
    id: 'special_achievement',
    name: '特殊成就证书',
    title: '特殊成就证书',
    icon: '🎖️',
    color: '#722ed1',
    prefix: 'SPA',
    defaultReason: '在文化相关领域取得特殊成就，特颁此证以资表彰。'
  }
};

const ISSUING_UNITS = [
  { id: 'village_culture', name: '乡村文化保护中心', seal: '乡村文化保护中心' },
  { id: 'cultural_bureau', name: '县文化和旅游局', seal: '县文化和旅游局' },
  { id: 'heritage_center', name: '非物质文化遗产保护中心', seal: '非物质文化遗产保护中心' },
  { id: 'education_base', name: '乡村文化教育基地', seal: '乡村文化教育基地' },
  { id: 'association', name: '乡村文化发展协会', seal: '乡村文化发展协会' }
];

const CERTIFICATE_STATUS = {
  issued: { id: 'issued', name: '已颁发', color: '#52c41a' },
  revoked: { id: 'revoked', name: '已撤销', color: '#ff4d4f' }
};

const simpleHash = (str) => {
  let hash = 0;
  const inputStr = String(str);
  if (inputStr.length === 0) {
    return '00000000';
  }
  for (let i = 0; i < inputStr.length; i++) {
    const char = inputStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};

const generateCertificateNumber = (typeId, issueDate) => {
  const date = issueDate ? new Date(issueDate) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const typeInfo = CERTIFICATE_TYPES[typeId];
  const typePrefix = typeInfo ? typeInfo.prefix : 'CER';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${typePrefix}-${year}${month}${day}-${random}`;
};

const generateCertificateHash = (certificate) => {
  const dataStr = [
    certificate.id,
    certificate.certificateNumber,
    certificate.userId,
    certificate.userName,
    certificate.title,
    certificate.reason,
    certificate.issuingUnit,
    certificate.issueDate
  ].join('|');
  return simpleHash(dataStr);
};

const verifyCertificateHash = (certificate) => {
  if (!certificate || !certificate.hash) {
    return { valid: false, message: '证书数据不完整' };
  }
  const computedHash = generateCertificateHash(certificate);
  const isValid = computedHash === certificate.hash;
  return {
    valid: isValid,
    message: isValid ? '证书验真通过' : '证书数据可能被篡改，验证失败',
    computedHash,
    storedHash: certificate.hash
  };
};

const generateVerificationCode = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const getCertificateTypeInfo = (typeId) => {
  return CERTIFICATE_TYPES[typeId] || {
    id: 'custom',
    name: '荣誉证书',
    title: '荣誉证书',
    icon: '📄',
    color: '#8B4513',
    defaultReason: '特颁此证，以资鼓励。'
  };
};

const getIssuingUnitInfo = (unitId) => {
  return ISSUING_UNITS.find(u => u.id === unitId) || ISSUING_UNITS[0];
};

const getCertificateStatusInfo = (statusId) => {
  return CERTIFICATE_STATUS[statusId] || CERTIFICATE_STATUS.issued;
};

const getCertificateTypes = () => Object.values(CERTIFICATE_TYPES);

const getIssuingUnits = () => [...ISSUING_UNITS];

const formatCertificateDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};

const createCertificateData = (params) => {
  const {
    userId,
    userName,
    userAvatar = '',
    typeId = 'participation',
    title = '',
    reason = '',
    issuingUnit = 'village_culture',
    issueDate = new Date().toISOString().split('T')[0],
    relatedType = '',
    relatedId = '',
    relatedTitle = '',
    issuerId = '',
    issuerName = '系统管理员'
  } = params;

  const typeInfo = getCertificateTypeInfo(typeId);
  const unitInfo = getIssuingUnitInfo(issuingUnit);

  const certificate = {
    id: util.generateId('cert'),
    certificateNumber: generateCertificateNumber(typeId, issueDate),
    userId,
    userName,
    userAvatar,
    typeId,
    typeName: typeInfo.name,
    title: title || typeInfo.title,
    reason: reason || typeInfo.defaultReason,
    issuingUnit: unitInfo.id,
    issuingUnitName: unitInfo.name,
    issuingUnitSeal: unitInfo.seal,
    issueDate,
    status: 'issued',
    verificationCode: generateVerificationCode(),
    relatedType,
    relatedId,
    relatedTitle,
    issuerId,
    issuerName,
    issueTime: new Date().toISOString(),
    viewCount: 0,
    shareCount: 0
  };

  certificate.hash = generateCertificateHash(certificate);

  return certificate;
};

const DEFAULT_CERTIFICATES = [
  {
    id: 'cert_001',
    certificateNumber: 'ACT-20241201-AB12CD',
    userId: 'user_001',
    userName: '张大爷',
    userAvatar: '',
    typeId: 'activity_completion',
    typeName: '活动结业证书',
    title: '活动结业证书',
    reason: '已完成"传统农耕文化"系列课程全部学习，考核成绩优秀，准予结业。',
    issuingUnit: 'education_base',
    issuingUnitName: '乡村文化教育基地',
    issuingUnitSeal: '乡村文化教育基地',
    issueDate: '2024-12-01',
    status: 'issued',
    verificationCode: 'K3M7P9',
    relatedType: 'activity',
    relatedId: 'activity_003',
    relatedTitle: '二十四节气文化讲座',
    issuerId: 'admin_001',
    issuerName: '系统管理员',
    issueTime: '2024-12-01T10:00:00.000Z',
    hash: '',
    viewCount: 156,
    shareCount: 23
  },
  {
    id: 'cert_002',
    certificateNumber: 'COL-20241210-CD34EF',
    userId: 'user_001',
    userName: '张大爷',
    userAvatar: '',
    typeId: 'collection_completion',
    typeName: '征集完成证书',
    title: '文化贡献证书',
    reason: '您的作品《记忆中的农耕岁月》已被收录至乡村文化库，感谢您为乡村文化传承做出的宝贵贡献。',
    issuingUnit: 'heritage_center',
    issuingUnitName: '非物质文化遗产保护中心',
    issuingUnitSeal: '非物质文化遗产保护中心',
    issueDate: '2024-12-10',
    status: 'issued',
    verificationCode: 'X8Y2Z5',
    relatedType: 'article',
    relatedId: 'article_001',
    relatedTitle: '记忆中的农耕岁月',
    issuerId: 'admin_001',
    issuerName: '系统管理员',
    issueTime: '2024-12-10T14:30:00.000Z',
    hash: '',
    viewCount: 89,
    shareCount: 12
  },
  {
    id: 'cert_003',
    certificateNumber: 'AWR-20241215-EF56GH',
    userId: 'user_002',
    userName: '李阿姨',
    userAvatar: '',
    typeId: 'annual_award',
    typeName: '年度评选证书',
    title: '年度荣誉证书',
    reason: '在2024年度"最美乡村文化传承人"评选活动中荣获一等奖，特颁此证，以资鼓励。',
    issuingUnit: 'cultural_bureau',
    issuingUnitName: '县文化和旅游局',
    issuingUnitSeal: '县文化和旅游局',
    issueDate: '2024-12-15',
    status: 'issued',
    verificationCode: 'A1B2C3',
    relatedType: 'award',
    relatedId: 'award_2024_01',
    relatedTitle: '2024年度最美乡村文化传承人',
    issuerId: 'admin_001',
    issuerName: '系统管理员',
    issueTime: '2024-12-15T09:00:00.000Z',
    hash: '',
    viewCount: 234,
    shareCount: 45
  }
];

DEFAULT_CERTIFICATES.forEach(cert => {
  cert.hash = generateCertificateHash(cert);
});

module.exports = {
  CERTIFICATE_TYPES,
  ISSUING_UNITS,
  CERTIFICATE_STATUS,
  simpleHash,
  generateCertificateNumber,
  generateCertificateHash,
  verifyCertificateHash,
  generateVerificationCode,
  getCertificateTypeInfo,
  getIssuingUnitInfo,
  getCertificateStatusInfo,
  getCertificateTypes,
  getIssuingUnits,
  formatCertificateDate,
  createCertificateData,
  DEFAULT_CERTIFICATES
};
