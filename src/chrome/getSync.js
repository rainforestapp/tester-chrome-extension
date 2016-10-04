import { authenticate, setOptions } from '../actions';

const getSync = (store, chrome) => (
  new Promise(resolve => {
    const dataKeys = ['worker_uuid', 'websocket_auth', 'options'];
    chrome.storage.sync.get(dataKeys, data => {
      let auth = null;
      if (data.worker_uuid && data.websocket_auth) {
        auth = { workerUUID: data.worker_uuid, socketAuth: data.websocket_auth };
      }
      if (auth) {
        store.dispatch(authenticate(auth));
      }

      if (data.options) {
        store.dispatch(setOptions(data.options));
      }

      resolve();
    });
  })
);

export default getSync;
