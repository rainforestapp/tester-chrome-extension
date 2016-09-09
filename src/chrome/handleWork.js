import listenStoreChanges from '../listenStoreChanges';

const handleWork = (store, chrome) => {
  const handleUpdate = ({ worker: prevWorker }, { worker: curWorker }) => {
    if (prevWorker.get('state') !== 'working' && curWorker.get('state') === 'working') {
      const url = curWorker.get('workUrl');
      if (!url) {
        throw new Error("Worker moved to 'working' state without a work URL");
      }

      chrome.tabs.create({ url });
    }
  };

  listenStoreChanges(store, handleUpdate);
};

export default handleWork;
