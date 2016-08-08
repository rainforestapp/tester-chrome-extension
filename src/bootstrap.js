// This file is auto-required for plugin.js to bootstrap the JS loading process.
import { startChromePlugin } from './chrome';

const inChromePlugin = () => (
  (typeof window.chrome === 'object') &&
    document.querySelector('div#tester-chrome-extension') !== null
);

const devTools = () => (
  window.devToolsExtension && window.devToolsExtension()
);

window.onload = () => {
  if (inChromePlugin()) {
    window.chrome.storage.sync.get(['worker_uuid', 'websocket_auth'], data => {
      let auth;
      if (data.hasOwnProperty('worker_uuid') &&
          data.hasOwnProperty('websocket_auth')) {
        auth = { workerUUID: data.worker_uuid, socketAuth: data.websocket_auth };
      } else {
        auth = null;
      }
      window.plugin = startChromePlugin(auth, window.chrome, devTools());
    });
  }
};
