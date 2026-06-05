module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup-globals.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-framework.js'],
  testTimeout: 10000
};
