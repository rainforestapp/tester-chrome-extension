import babel from 'rollup-plugin-babel';
import npm from 'rollup-plugin-npm';

export default {
  entry: 'src/index.js',
  dest: 'extension/js/main.js',
  format: 'iife',
  plugins: [ babel({babelrc: false, presets: 'es2015-rollup'}), npm() ],
};
