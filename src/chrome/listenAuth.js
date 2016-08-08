import { authenticate } from '../actions';

const listenAuth = (store, chrome) => {
  chrome.runtime.onMessageExternal.addListener(({ data }, sender, sendResponse) => {
    if (data && data.worker_uuid && data.websocket_auth) {
      const auth = {
        workerUUID: data.worker_uuid,
        socketAuth: data.websocket_auth,
      };
      store.dispatch(authenticate(auth));
      chrome.storage.sync.set({
        worker_uuid: auth.workerUUID,
        websocket_auth: auth.socketAuth,
      });
      sendResponse();
    }
  });
};

export default listenAuth;
