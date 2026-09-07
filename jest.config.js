/**
 * Minimal Jest config for the pure logic tests.
 *
 * We only test pure modules (utils + mock API), so we deliberately avoid the
 * React Native transform stack. This keeps the test runner fast and free of
 * platform-specific setup that isn't relevant to business logic.
 */
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react', esModuleInterop: true, strict: true } }],
  },
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/.expo-export-test/'],
  clearMocks: true,
};