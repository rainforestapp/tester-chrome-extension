import { authenticate, setOptions, setPollUrl } from '../actions';

const getSync = (store, chrome) => {
  const dataKeys = ['worker_uuid', 'websocket_auth', 'work_available_endpoint', 'options'];
  chrome.storage.sync.get(dataKeys, data => {
    let auth = null;
    if (data.hasOwnProperty('worker_uuid') &&
        data.hasOwnProperty('websocket_auth')) {
      auth = { workerUUID: data.worker_uuid, socketAuth: data.websocket_auth };
    }
    if (auth) {
      store.dispatch(authenticate(auth));
    }

    let pollUrl = null;
    if (data.hasOwnProperty('work_available_endpoint') && data.hasOwnProperty('worker_uuid')) {
      pollUrl = `${data.work_available_endpoint}${data.worker_uuid}/work_available`;
    }
    if (pollUrl) {
      store.dispatch(setPollUrl(pollUrl));
    }

    if (data.options) {
      store.dispatch(setOptions(data.options));
    }
  });
};

export default getSync;
