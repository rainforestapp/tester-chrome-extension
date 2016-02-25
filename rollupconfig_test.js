import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'test/tests.js',
  dest: 'tmp/tests.js',
  format: 'umd',
  plugins: [ babel(), commonjs(), nodeResolve() ],
};
