export default {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  setupFiles: ['<rootDir>/setupEnv.mjs'],
  setupFilesAfterEnv: ['<rootDir>/setupAfterEnv.mjs'],
  testMatch: ['<rootDir>/tests/**/*.test.mjs'],
  verbose: true,
  collectCoverage: false,
  testTimeout: 30000,
};
