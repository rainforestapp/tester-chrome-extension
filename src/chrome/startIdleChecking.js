import { updateWorkerState } from '../actions';
import { notifications, workerIdle } from './notifications';
import listenStoreChanges from '../listenStoreChanges';

const idlePeriod = 6 * 60;

const startIdleChecking = (store, chrome) => {
  const goIdle = () => {
    if (store.getState().worker.get('state') !== 'ready') {
      return;
    }

    store.dispatch(updateWorkerState('inactive'));
    chrome.notifications.create(workerIdle, notifications[workerIdle]);
  };

  const handleUpdate = (_previousState, currentState) => {
    if (currentState.worker.get('state') === 'ready') {
      chrome.notifications.clear(workerIdle, () => {});
    }
  };

  chrome.idle.setDetectionInterval(idlePeriod);

  chrome.idle.onStateChanged.addListener(state => {
    if (state === 'idle') {
      goIdle();
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
