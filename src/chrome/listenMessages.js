import { authenticate, workStarted, workFinished, setOptions } from '../actions';
import { logDebug } from '../logging';
import buildContextMenus from './buildContextMenus';

const listenMessages = (store, chrome) => {
  const handleAuthMessage = ({
    worker_uuid: workerUUID,
    websocket_auth: socketAuth,
  }) => {
    if (!workerUUID || !socketAuth) {
      throw new Error('Invalid authentication message received!');
    }

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

  const handleWorkError = () => {
    store.dispatch(workFinished());
  };

  const handleWorkStarted = () => {
    store.dispatch(workStarted());
  };

  const handleSetOptions = (payload) => {
    store.dispatch(setOptions(payload));

    buildContextMenus(store, chrome);

    chrome.storage.sync.set({
      options: store.getState().plugin.get('options').toJS(),
    });
  };

  const okResponse = () => (
    {
      status: 'ok',
      plugin: store.getState().plugin.toJS(),
    }
  );

  const handleActionMessage = ({ type, payload }) => {
    switch (type) {
      case 'AUTHENTICATE':
        handleAuthMessage(payload);
        return okResponse();
      case 'WORK_ERROR':
        handleWorkError();
        return okResponse();
      case 'WORK_STARTED':
        handleWorkStarted();
        return okResponse();
      case 'SET_OPTIONS':
        handleSetOptions(payload);
        return okResponse();
      case 'PING':
        return okResponse();
      default:
        return 'unrecognized_message';
    }
  };

  chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    logDebug('\n**Message received!**');
    logDebug('Message:', message);
    logDebug('Sender:', sender);

    if (message.type) {
      const resp = handleActionMessage(message);
      sendResponse(resp);
      return;
    }

    sendResponse('no_data');
  });
};

export default listenMessages;
