import { CONFIG, REDUCERS } from './constants';
import Raven from 'raven-js';
import listenStoreChanges from './listenStoreChanges';

const startErrorHandling = (store, raven = Raven, testing = false) => {
  if (!testing && CONFIG.env === 'test' || CONFIG.env === 'dev') {
    return;
  }

  raven.config(CONFIG.ravenURL).install();

  const addExtensionInfo = () => {
    if (!window.chrome || !window.chrome.management || !window.chrome.management.getSelf) {
      return;
    }

    window.chrome.management.getSelf(info => {
      raven.setTagsContext({ 'extension.id': info.id, 'extension.version': info.version });
    });
  };

  const checkUUID = ({ worker: prevWorker }, { worker: curWorker }) => {
    if (!prevWorker.get('uuid') && curWorker.get('uuid')) {
      raven.setUserContext({ uuid: curWorker.get('uuid') });
    }
  };

  const checkRelease = ({ plugin: prevPlugin }, { plugin: curPlugin }) => {
    if (prevPlugin.get('version') !== curPlugin.get('version')) {
      raven.setRelease(curPlugin.get('version'));
    }
  };

  const handleUpdate = (previousState, currentState) => {
    checkUUID(previousState, currentState);
    checkRelease(previousState, currentState);
    REDUCERS.forEach(reducer => {
      const prev = previousState[reducer];
      const cur = currentState[reducer];

      if (prev.get('error') !== cur.get('error')) {
        raven.captureException(cur.get('error'), {
          extra: {
            reducer,
            state: cur.toJS(),
          },
        });
      }
    });
  };

  listenStoreChanges(store, handleUpdate);
  addExtensionInfo();
};

export default startErrorHandling;
