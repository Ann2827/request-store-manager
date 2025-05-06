import { TextEncoder } from 'util';
import { ReadableStream } from 'node:stream/web';

// const { TextEncoder } = require('node:util');
// const { ReadableStream } = require('node:stream/web');

/** @type {import('jest').Config} */
const config = {
  displayName: {
    color: 'blue',
    name: 'types',
  },

  testEnvironment: 'jest-fixed-jsdom',
  moduleNameMapper: {
    '^@core(.*)$': `<rootDir>/src/core$1`,
    '^@modules(.*)$': `<rootDir>/src/modules$1`,
    '^@types(.*)$': `<rootDir>/src/types$1`,
    '^@utils(.*)$': `<rootDir>/src/utils$1`,
  },
  // collectCoverageFrom: ['src/**/*.ts'],
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  modulePathIgnorePatterns: ['/node_modules/', '/.github/', '/dist/', '/.plop/'],
  globals: {
    TextEncoder: TextEncoder,
    ReadableStream: ReadableStream,
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

// module.exports = config;
export default config;
