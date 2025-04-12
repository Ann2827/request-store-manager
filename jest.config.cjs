const { TextEncoder } = require('node:util');

const config = {
  displayName: {
    color: 'blue',
    name: 'types',
  },

  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@core(.*)$': `<rootDir>/src/core$1`,
    '^@modules(.*)$': `<rootDir>/src/modules$1`,
    '^@types(.*)$': `<rootDir>/src/types$1`,
    '^@utils(.*)$': `<rootDir>/src/utils$1`,
  },
  // collectCoverageFrom: ['src/**/*.ts'],
  // testMatch: ['<rootDir>/src/**/*.test.ts'],
  testMatch: ['<rootDir>/__tests__/*.test.ts'],
  modulePathIgnorePatterns: ['/node_modules/', '/.github/', '/dist/'],
  globals: {
    TextEncoder: TextEncoder,
  },
  roots: [
    '<rootDir>/src/',
    "<rootDir>/__mocks__/",
    "<rootDir>/__tests__/"
  ],
  transform: {
    '\\.ts$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
};

module.exports = config;
