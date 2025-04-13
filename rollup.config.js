import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import bundleAnalyzer from 'rollup-plugin-bundle-analyzer';
import tscAlias from 'rollup-plugin-tsc-alias';

const args = process.argv.slice(2);
const getArgvParameter = (argv, key) => {
  const value = argv.find((item) => item.includes(key))?.split('=')[1] || '';
  return value.trim().replace(/"/g, '').replace(/'/g, '');
};

const plugins = [];
const analyze = getArgvParameter(args, '--analyze');
if (analyze) plugins.push(bundleAnalyzer());
plugins.push(terser({ output: { comments: false } }));
const tsOptions = {
  tsconfig: './tsconfig.json',
  include: ['src/**/**/*.ts'],
  exclude: ['__tests__', '__mocks__'],
};

export default [
  {
    input: 'src/index.ts',
    output: {
      exports: 'named',
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: false,
    },
    plugins: [
      typescript({
        ...tsOptions,
        compilerOptions: {
          declaration: false,
        },
      }),
      tscAlias(),
      ...plugins,
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      exports: 'named',
      file: 'dist/index.modern.js',
      format: 'es',
      sourcemap: false,
    },
    plugins: [commonjs(), typescript(tsOptions), tscAlias(), ...plugins],
  },
];
