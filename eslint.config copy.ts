// import { type Linter } from 'eslint';
// import { fixupPluginRules } from '@eslint/compat';
// import globals from 'globals';
// import js from '@eslint/js';
// import jest from 'eslint-plugin-jest';
// import tseslint from 'typescript-eslint';
// // import * as importPlugin from 'eslint-plugin-import';
// import eslintPluginPrettier from 'eslint-plugin-prettier';
// import { FlatCompat } from '@eslint/eslintrc';
// // import typescriptParser from '@typescript-eslint/parser';
// import unicorn from 'eslint-plugin-unicorn';

// // Linter.Config[]

// // "@typescript-eslint/eslint-plugin": "7.0.0",
//     // "@typescript-eslint/parser": "7.0.0",
//     // "typescript-eslint": "7.16.1",

// const compat = new FlatCompat({
//   baseDirectory: import.meta.dirname,
// });

// const config = tseslint.config(
//   js.configs.recommended,
//   ...compat.extends('airbnb-base').map((config) => ({
//     ...config,
//     plugins: {}, // delete
//   })),
//   ...compat.extends('airbnb-typescript/base'),
//   // ...compat.extends('eslint-plugin-jest').map((config) => ({
//   //   ...config,
//   //   plugins: {}, // delete
//   // })),
//   // {
//   //   files: ['./src/**/**.test.ts'],
//   //   ...jest.configs['flat/recommended'],
//   //   rules: {
//   //     ...jest.configs['flat/recommended'].rules,
//   //     'jest/prefer-expect-assertions': 'off',
//   //   },
//   // },
//   ...compat.extends('plugin:jest/recommended'),
//   tseslint.configs.recommended[1],
//   // @ts-expect-error - no types
//   // eslint-disable-next-line
//   unicorn.configs['flat/recommended'],
//   {
//     languageOptions: {
//       parserOptions: {
//         project: 'tsconfig.json',
//         tsconfigRootDir: import.meta.dirname,
//       },
//       globals: {
//         ...globals.browser,
//         ...globals.es2024,
//       },
//     },
//     ignores: ['dist/*', 'node_modules/*'],
//     plugins: {
//       import: fixupPluginRules(compat.plugins('eslint-plugin-import')[0].plugins?.import ?? {}),
//       prettier: eslintPluginPrettier,
//     },
//     // settings: {
//     //   'import/resolver': {
//     //     typescript: {
//     //       project: '.',
//     //     },
//     //     alias: [['@core', './src/core']],
//     //   },
//     //   'import/parsers': {
//     //     '@typescript-eslint/parser': ['.ts', '.tsx'],
//     //   },
//     // },
//     rules: {
//       ...tseslint.configs.recommended[2].rules,
//       'unicorn/no-null': 0,
//       'unicorn/prevent-abbreviations': 0,
//       'unicorn/filename-case': 0,
//       'unicorn/no-array-reduce': 0,
//       'unicorn/no-array-for-each': 0,
//       'prettier/prettier': 'error',
//       '@typescript-eslint/no-explicit-any': 0,
//       'unicorn/prefer-node-protocol': 0,
//       '@typescript-eslint/ban-ts-comment': 0,
//       '@typescript-eslint/no-non-null-assertion': 0,
//       // 'import/order': [
//       //   'error',
//       //   {
//       //     'newlines-between': 'always',
//       //     groups: [['builtin', 'external'], ['internal', 'parent'], ['sibling', 'index'], 'object', 'type'],
//       //     pathGroups: [
//       //       {
//       //         pattern: '@core',
//       //         group: 'parent',
//       //         position: 'before',
//       //       },
//       //       {
//       //         pattern: '@utils',
//       //         group: 'parent',
//       //         position: 'before',
//       //       },
//       //     ],
//       //   },
//       // ],
//       'unicorn/no-for-loop': 0,
//       'jest/no-commented-out-tests': 0,
//       'unicorn/prefer-object-from-entries': 0,
//       // Сломанное правило
//       'unicorn/expiring-todo-comments': 0,
//       // Временно отключаю
//       '@typescript-eslint/ban-types': 0,
//       '@typescript-eslint/no-namespace': 0,
//       'unicorn/prefer-spread': 0,
//     },
//   },
// );

// export default config;

// // const globals = require('globals');
// // const js = require('@eslint/js');
// // const eslintPluginUnicorn = require('eslint-plugin-unicorn');
// // const jest = require('eslint-plugin-jest');
// // const tseslint = require('typescript-eslint');
// // module.exports = config;
