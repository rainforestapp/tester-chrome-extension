import { authenticate, setPollUrl } from '../actions';

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
    }

    if (data && data.work_available_endpoint && data.worker_uuid) {
      const pollUrl = `${data.work_available_endpoint}${data.worker_uuid}/work_available`;
      store.dispatch(setPollUrl(pollUrl));
      chrome.storage.sync.set({
        work_available_endpoint: data.work_available_endpoint,
      });
    }
    sendResponse();
  });
};

export default listenAuth;
