import {
  updateWorkerState,
  iconClicked,
  notify,
  clearNotification,
} from '../actions';
import listenStoreChanges from '../listenStoreChanges';
import { playSoundOnce } from '../playSound';

const idlePeriod = 6 * 60;

const startIdleChecking = (store, chrome) => {
  const goIdle = () => {
    const { worker } = store.getState();
    switch (worker.get('state')) {
      case 'ready':
        store.dispatch(updateWorkerState('inactive'));
        store.dispatch(notify('workerIdle'));
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

  const handleUpdate = (previousState, currentState) => {
    if (currentState.worker.get('state') === 'ready' &&
        previousState.worker.get('state') !== 'ready') {
      store.dispatch(clearNotification('workerIdle'));
    }
  };

  chrome.idle.setDetectionInterval(idlePeriod);

  chrome.idle.onStateChanged.addListener(state => {
    if (state === 'idle') {
      goIdle();
    }
  });

  listenStoreChanges(store, handleUpdate);
};

export default startIdleChecking;
