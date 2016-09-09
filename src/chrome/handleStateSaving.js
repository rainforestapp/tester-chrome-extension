import { updateWorkerState } from '../actions';
import listenStoreChanges from '../listenStoreChanges';

const handleStateSaving = (store, chrome) => {
  chrome.storage.local.get(['workerState'], data => {
    if (data.workerState === 'ready') {
      store.dispatch(updateWorkerState(data.workerState));
    }
  });

  const handleUpdate = ({ worker: prevWorker }, { worker: curWorker }) => {
    if (prevWorker.get('state') !== curWorker.get('state')) {
      chrome.storage.local.set({ workerState: curWorker.get('state') });
    }
  };

  listenStoreChanges(store, handleUpdate);
};

export default handleStateSaving;
