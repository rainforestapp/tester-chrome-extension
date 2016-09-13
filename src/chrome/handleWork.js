import listenStoreChanges from '../listenStoreChanges';

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
      });
      if (oldWorkTabId) {
        chrome.tabs.remove(oldWorkTabId);
      }
    }
  };

  const handleUpdate = (previous, current) => {
    handleAssignWork(previous, current);
  };

  chrome.tabs.onRemoved.addListener(tabId => {
    if (tabId === workTabId) {
      workTabId = null;
    }
  });

  listenStoreChanges(store, handleUpdate);
};

export default handleWork;
