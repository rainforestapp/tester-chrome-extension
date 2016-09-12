import { authenticate, setPollUrl, workFinished } from '../actions';
import { logDebug } from '../logging';

const listenMessages = (store, chrome) => {
  const handleAuthMessage = ({ worker_uuid: workerUUID, websocket_auth: socketAuth }) => {
    const auth = {
      workerUUID,
      socketAuth,
    };
    store.dispatch(authenticate(auth));
    chrome.storage.sync.set({
      worker_uuid: workerUUID,
      websocket_auth: socketAuth,
    });
  };

  const handlePollEndpointMessage = ({
    work_available_endpoint: pollEndpoint,
    worker_uuid: workerUUID,
  }) => {
    const pollUrl = `${pollEndpoint}${workerUUID}/work_available`;
    store.dispatch(setPollUrl(pollUrl));
    chrome.storage.sync.set({
      work_available_endpoint: pollEndpoint,
    });
  };

  const handleClearWork = () => {
    store.dispatch(workFinished());
  };

  chrome.runtime.onMessageExternal.addListener(({ data }, sender, sendResponse) => {
    logDebug('\n**Message received!**');
    logDebug('Data:', data);
    logDebug('Sender:', sender);

    if (!data) {
      sendResponse('no_data');
      return;
    }

    if (data.worker_uuid && data.websocket_auth) {
      handleAuthMessage(data);
    }

    if (data.work_available_endpoint && data.worker_uuid) {
      handlePollEndpointMessage(data);
    }

    if (data.clear_work) {
      handleClearWork(data);
    }

    sendResponse('ok');
  });
};

export default listenMessages;
