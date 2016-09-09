// This file is auto-required for main.js to bootstrap the JS loading process.
import { startChromePlugin } from './chrome';

const inChromePlugin = () => (
  (typeof window.chrome === 'object') &&
    document.querySelector('div#tester-chrome-extension') !== null
);

const dataKeys = ['worker_uuid', 'websocket_auth', 'work_available_endpoint'];

window.onload = () => {
  if (inChromePlugin()) {
    window.chrome.storage.sync.get(dataKeys, data => {
      let auth = null;
      if (data.hasOwnProperty('worker_uuid') &&
          data.hasOwnProperty('websocket_auth')) {
        auth = { workerUUID: data.worker_uuid, socketAuth: data.websocket_auth };
      }

      let pollUrl = null;
      if (data.hasOwnProperty('work_available_endpoint') && data.hasOwnProperty('worker_uuid')) {
        pollUrl = `${data.work_available_endpoint}${data.worker_uuid}/work_available`;
      }
      window.plugin = startChromePlugin(auth, pollUrl, window.chrome);
    });
  }
};
