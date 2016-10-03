import { updateWorkerState, iconClicked } from '../actions';
import { notifications, workerIdle } from './notifications';
import listenStoreChanges from '../listenStoreChanges';
import { playSoundOnce } from '../playSound';

const idlePeriod = 6 * 60;

const startIdleChecking = (store, chrome) => {
  const goIdle = () => {
    const { worker } = store.getState();
    switch (worker.get('state')) {
      case 'ready':
        store.dispatch(updateWorkerState('inactive'));
        chrome.notifications.create(workerIdle, notifications[workerIdle]);
        playSoundOnce(store.getState().plugin.get('options'));
        break;
      case 'working':
        if (worker.get('wantsMoreWork')) {
          // "Click icon" to indicate that the worker doesn't want more work
          store.dispatch(iconClicked());
        }
        break;
      default:
    }
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
