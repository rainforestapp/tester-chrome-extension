import listenStoreChanges from '../listenStoreChanges';
import { workFinished } from '../actions';
import { audioPlayer, playSound } from '../playSound';

const handleWork = (store, chrome) => {
  let workTabId = null;

  const handleAssignWork = ({ worker: prevWorker }, { worker: curWorker }) => {
    if (prevWorker.get('state') !== 'working' && curWorker.get('state') === 'working') {
      const url = curWorker.get('workUrl');
      if (!url) {
        throw new Error("Worker moved to 'working' state without a work URL");
      }

      const oldWorkTabId = workTabId;
      chrome.tabs.create({ url }, tab => {
        workTabId = tab.id;
        const { plugin } = store.getState();
        playSound(audioPlayer, plugin.get('options'));
      });
      if (oldWorkTabId) {
        chrome.tabs.remove(oldWorkTabId);
      }
    }
  };

  const workTabClosed = () => {
    const { worker } = store.getState();
    if (worker.get('state') === 'working' && !worker.get('workStarted')) {
      store.dispatch(workFinished());
    }
    workTabId = null;
  };

  const handleUpdate = (previous, current) => {
    handleAssignWork(previous, current);
  };

  chrome.tabs.onRemoved.addListener(tabId => {
    if (tabId === workTabId) {
      workTabClosed();
    }
  });

  listenStoreChanges(store, handleUpdate);
};

export default handleWork;
