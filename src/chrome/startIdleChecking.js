import { updateWorkerState } from '../actions';
import { notifications, workerIdle } from './notifications';
import listenStoreChanges from '../listenStoreChanges';

const idlePeriod = 3 * 60;

const goIdle = (store, chrome) => {
  store.dispatch(updateWorkerState('inactive'));
  chrome.notifications.create(workerIdle, notifications[workerIdle]);
};

const startIdleChecking = (store, chrome) => {
  chrome.idle.setDetectionInterval(idlePeriod);

  const handleUpdate = (_previousState, currentState) => {
    if (currentState.worker.get('state') === 'ready') {
      chrome.notifications.clear(workerIdle);
    }
  };

  chrome.idle.onStateChanged.addListener(state => {
    if (state === 'idle' || state === 'locked') {
      goIdle(store, chrome);
    }
  });

  chrome.notifications.onClicked.addListener(notificationId => {
    if (notificationId === workerIdle) {
      store.dispatch(updateWorkerState('ready'));
    }
  });

  listenStoreChanges(store, handleUpdate);
};

export default startIdleChecking;
