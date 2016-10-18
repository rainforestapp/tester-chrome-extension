import { updateWorkerState } from '../actions';
import listenStoreChanges from '../listenStoreChanges';

const handleStateSaving = (store, chrome) => {
  const shouldSaveState = (prevWorker, curWorker) => (
    prevWorker.get('state') !== curWorker.get('state') ||
      prevWorker.get('wantsMoreWork') !== curWorker.get('wantsMoreWork')
  );

  const handleUpdate = ({ worker: prevWorker }, { worker: curWorker }) => {
    if (shouldSaveState(prevWorker, curWorker)) {
      let newState;
      switch (curWorker.get('state')) {
        case 'working':
          // We don't actually want to save that the worker is working, since if
          // the "work finished" message gets lost then they could get stuck in
          // "working" mode indefinitely. Instead we just restore to
          // ready/inactive depending on whether the worker wants more work
          // (double-assignment is checked on the backend so shouldn't be a
          // problem).
          if (curWorker.get('wantsMoreWork')) {
            newState = 'ready';
          } else {
            newState = 'inactive';
          }
          break;
        default:
          newState = curWorker.get('state');
      }
      chrome.storage.local.set({ workerState: newState });
    }
  };

  listenStoreChanges(store, handleUpdate);

  return new Promise(resolve => {
    chrome.storage.local.get(['workerState', 'reload'], data => {
      if (data.reload && data.workerState === 'ready') {
        store.dispatch(updateWorkerState(data.workerState));
      }
      chrome.storage.local.set({ reload: false }, resolve);
    });
  });
};

export default handleStateSaving;
