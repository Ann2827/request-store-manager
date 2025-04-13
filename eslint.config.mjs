import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import unicorn from 'eslint-plugin-unicorn';
import _import from 'eslint-plugin-import';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const config = [
  { ignores: [
    'dist/*',
    'node_modules/*',
    // '.config.*'
  ] },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:unicorn/recommended',
      // 'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-type-checked',
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/typescript',
      'airbnb-typescript/base',
      'prettier',
    ),
  ),
  {
    plugins: {
      unicorn: fixupPluginRules(unicorn),
      import: fixupPluginRules(_import),
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },

      parser: tsParser,
      ecmaVersion: 2024,
      sourceType: 'module',

      parserOptions: {
        // project: 'tsconfig.test.json',
        tsconfigRootDir: import.meta.dirname,
        projectService: true,
        // tsconfigRootDir: __dirname,
      },
      // parserOptions: {
      //   project: 'tsconfig.json',
      //   tsconfigRootDir: '.',
      // },
    },

    rules: {
      'unicorn/no-null': 0,
      'unicorn/prevent-abbreviations': 0,
      'unicorn/filename-case': 0,
      'unicorn/no-array-reduce': 0,
      'unicorn/no-array-for-each': 0,
      'prettier/prettier': 'error',

      '@typescript-eslint/no-unused-vars': [
        2,
        {
          args: 'none',
        },
      ],
      '@typescript-eslint/no-explicit-any': 0,
      'unicorn/prefer-node-protocol': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      '@typescript-eslint/no-unsafe-assignment': 1,
      '@typescript-eslint/prefer-promise-reject-errors': 0,

      'import/order': [
        'error',
        {
          'newlines-between': 'always',

          groups: [['builtin', 'external'], ['internal', 'parent'], ['sibling', 'index'], 'object', 'type'],

          pathGroups: [
            {
              pattern: '@core',
              group: 'parent',
              position: 'before',
            },
            {
              pattern: '@modules',
              group: 'parent',
              position: 'before',
            },
            {
              pattern: '@utils',
              group: 'parent',
              position: 'before',
            },
            {
              pattern: '@types',
              group: 'parent',
              position: 'before',
            },
          ],
        },
      ],

      'unicorn/no-for-loop': 0,
      'jest/no-commented-out-tests': 0,
      'unicorn/prefer-object-from-entries': 0,
      '@typescript-eslint/no-empty-object-type': 0,
      // Сломанное правило
      'unicorn/expiring-todo-comments': 0,
      // правила от airbnb-typescript, но @typescript-eslint перенес их в stylelint
      '@typescript-eslint/lines-between-class-members': 0,
      '@typescript-eslint/no-throw-literal': 0,
      // Временно отключаю
      '@typescript-eslint/ban-types': 0,
      '@typescript-eslint/no-namespace': 0,
      'unicorn/prefer-spread': 0,
    },
  },
];

export default config;
