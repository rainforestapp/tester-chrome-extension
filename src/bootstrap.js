// This file is auto-required for main.js to bootstrap the JS loading process.
import startPlugin from './startPlugin';
import * as actions from './actions';
import { startChromePlugin } from './chrome';

const inChromePlugin = () => (
  (typeof window.chrome === 'object') &&
    document.querySelector('div#tester-chrome-extension') !== null
);

window.onload = () => {
  if (inChromePlugin()) {
    window.plugin = startChromePlugin(window.chrome);
  }
};

window.PLUGIN = {
  startPlugin,
  actions,
};
