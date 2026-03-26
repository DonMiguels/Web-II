export default {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  setupFiles: ['<rootDir>/setupEnv.mjs'],
  setupFilesAfterEnv: ['<rootDir>/setupAfterEnv.mjs'],
  testMatch: [
    '<rootDir>/tests/bo/**/*.test.mjs',
    '<rootDir>/tests/dispatcher/**/*.test.mjs',
    '<rootDir>/tests/security/**/*.test.mjs',
    '<rootDir>/tests/session/**/*.test.mjs',
  ],
  verbose: true,
  collectCoverage: false,
  testTimeout: 30000,
};
