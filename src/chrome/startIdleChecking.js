import { CONFIG } from '../constants';
import { updateWorkerState } from '../actions';
import listenStoreChanges from '../listenStoreChanges';

const idlePeriod = 5 * 60;

const notification = {
  iconUrl: CONFIG.chrome.notificationIconUrl,
  isClickable: true,
  type: 'basic',
  title: 'We noticed you were idle',
  message: 'You seem to have been idle for a while, so we stopped ' +
    'checking for work. Click here to start checking for work again.',
};

const workerIdle = 'workerIdle';

const goIdle = (store, chrome) => {
  store.dispatch(updateWorkerState('inactive'));
  chrome.notifications.create(workerIdle, notification);
  chrome.notifications.onClicked.addListener(notificationId => {
    if (notificationId === workerIdle) {
      store.dispatch(updateWorkerState('ready'));
    }
  });
};

const startIdleChecking = (store, chrome) => {
  chrome.idle.setDetectionInterval(idlePeriod);

  const handleUpdate = (previousState, currentState) => {
    if (currentState.worker.get('state') === 'ready') {
      chrome.notifications.clear(workerIdle);
    }
  };

  chrome.idle.onStateChanged.addListener(state => {
    if (state === 'idle') {
      goIdle(store, chrome);
    }
  });

  listenStoreChanges(store, handleUpdate);
};

export default startIdleChecking;
