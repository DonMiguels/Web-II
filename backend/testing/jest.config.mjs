export default {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  setupFiles: ['<rootDir>/setupEnv.mjs'],
  testMatch: ['<rootDir>/tests/**/*.test.mjs'],
  verbose: true,
  collectCoverage: false,
  testTimeout: 30000,
};
