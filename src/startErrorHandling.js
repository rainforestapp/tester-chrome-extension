import { CONFIG, REDUCERS } from './constants';
import Raven from 'raven-js';
import listenStoreChanges from './listenStoreChanges';

const startErrorHandling = (store, raven = Raven, testing = false) => {
  if (!testing && CONFIG.env === 'test' || CONFIG.env === 'dev') {
    return;
  }

  raven.config(CONFIG.ravenURL).install();

  const checkUUID = ({ worker: prevWorker }, { worker: curWorker }) => {
    if (!prevWorker.get('uuid') && curWorker.get('uuid')) {
      raven.setUserContext({ uuid: curWorker.get('uuid') });
    }
  };

  const handleUpdate = (previousState, currentState) => {
    checkUUID(previousState, currentState);
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
};

export default startErrorHandling;
