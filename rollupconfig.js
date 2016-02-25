import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/index.js',
  dest: 'extension/js/main.js',
  format: 'iife',
  plugins: [ babel() ],
};
