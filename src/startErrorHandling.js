import { CONFIG, REDUCERS } from './constants';
import * as Sentry from '@sentry/browser';
import listenStoreChanges from './listenStoreChanges';

const startErrorHandling = (store, sentry = Sentry, testing = false) => {
  if (!testing && CONFIG.env === 'test' || CONFIG.env === 'dev') {
    return;
  }

  sentry.init({
    dsn: CONFIG.sentryURL,
    environment: CONFIG.env,
  });

  const addExtensionInfo = () => {
    if (!window.chrome || !window.chrome.management || !window.chrome.management.getSelf) {
      return;
    }

    window.chrome.management.getSelf(info => {
      sentry.setTag('extension.id', info.id);
      sentry.setTag('extension.version', info.version);
    });
  };

  const checkUUID = ({ worker: prevWorker }, { worker: curWorker }) => {
    if (!prevWorker.get('uuid') && curWorker.get('uuid')) {
      sentry.setUser({ id: curWorker.get('uuid') });
    }
  };

  const checkRelease = ({ plugin: prevPlugin }, { plugin: curPlugin }) => {
    if (prevPlugin.get('version') !== curPlugin.get('version')) {
      sentry.configureScope(scope =>
        scope.addEventProcessor(event =>
          // eslint-disable-next-line no-new
          new Promise(resolve =>
            resolve({
              ...event,
              release: curPlugin.get('release'),
            })
          )
        )
      );
    }
  };

  const handleUpdate = (previousState, currentState) => {
    checkUUID(previousState, currentState);
    checkRelease(previousState, currentState);
    REDUCERS.forEach(reducer => {
      const prev = previousState[reducer];
      const cur = currentState[reducer];

      if (prev.get('error') !== cur.get('error')) {
        sentry.captureException(cur.get('error'), {
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
