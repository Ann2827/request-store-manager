import { type Linter } from 'eslint';
import { fixupPluginRules, fixupConfigRules } from '@eslint/compat';
import globals from 'globals';
import js from '@eslint/js';
import jest from 'eslint-plugin-jest';
import tseslint from 'typescript-eslint';
// import * as importPlugin from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import { FlatCompat } from '@eslint/eslintrc';
// import typescriptParser from '@typescript-eslint/parser';
import unicorn from 'eslint-plugin-unicorn';

// "extends": [
//     "eslint:recommended",
//     "plugin:unicorn/recommended",
//    "plugin:jest/recommended",
//     "plugin:@typescript-eslint/recommended",
//     "plugin:import/errors",
//     "plugin:import/warnings",
//     "plugin:import/typescript",
//     "airbnb-typescript",
//     "prettier"
//   ],
//   "plugins": [
//     "unicorn",
//     "import",
//    "jest",
//     "@typescript-eslint",
//     "prettier"
//   ],

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  // recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const config = tseslint.config(
  { ignores: ['dist/*', 'node_modules/*'] },
  js.configs.recommended,
  unicorn.configs['flat/recommended'],
  ...compat.extends(
    // 'plugin:unicorn/recommended',
    'plugin:jest/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    // 'airbnb-typescript/base',
  ),
  // ...fixupConfigRules(...compat.config(...compat.extends('airbnb-typescript/base'))),
  // ...fixupConfigRules(
  //   compat.extends('airbnb-typescript/base').map((config) => ({
  //     ...config,
  //     plugins: {}, // delete
  //   })),
  // ),
  ...fixupConfigRules(
    compat.extends('airbnb-typescript/base'),
  ),
  {
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
    },
    plugins: {
      // '@typescript-eslint': fixupPluginRules(tseslint.plugin),
      // import: fixupPluginRules(compat.plugins('eslint-plugin-import')[0].plugins?.import ?? {}),
      // 'airbnb-typescript': fixupPluginRules(compat.('eslint-config-airbnb-typescript')),
      prettier: eslintPluginPrettier,
    },
    // settings: {
    //   'import/resolver': {
    //     typescript: {
    //       project: '.',
    //     },
    //     alias: [['@core', './src/core']],
    //   },
    //   'import/parsers': {
    //     '@typescript-eslint/parser': ['.ts', '.tsx'],
    //   },
    // },
    rules: {
      // ...tseslint.configs.recommended[2].rules,
      'unicorn/no-null': 0,
      'unicorn/prevent-abbreviations': 0,
      'unicorn/filename-case': 0,
      'unicorn/no-array-reduce': 0,
      'unicorn/no-array-for-each': 0,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 0,
      'unicorn/prefer-node-protocol': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      // 'import/order': [
      //   'error',
      //   {
      //     'newlines-between': 'always',
      //     groups: [['builtin', 'external'], ['internal', 'parent'], ['sibling', 'index'], 'object', 'type'],
      //     pathGroups: [
      //       {
      //         pattern: '@core',
      //         group: 'parent',
      //         position: 'before',
      //       },
      //       {
      //         pattern: '@utils',
      //         group: 'parent',
      //         position: 'before',
      //       },
      //     ],
      //   },
      // ],
      'unicorn/no-for-loop': 0,
      'jest/no-commented-out-tests': 0,
      'unicorn/prefer-object-from-entries': 0,
      // Сломанное правило
      'unicorn/expiring-todo-comments': 0,
      // Временно отключаю
      '@typescript-eslint/ban-types': 0,
      '@typescript-eslint/no-namespace': 0,
      'unicorn/prefer-spread': 0,
    },
  },
);

export default config;

// const globals = require('globals');
// const js = require('@eslint/js');
// const eslintPluginUnicorn = require('eslint-plugin-unicorn');
// const jest = require('eslint-plugin-jest');
// const tseslint = require('typescript-eslint');
// module.exports = config;
