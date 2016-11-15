import listenStoreChanges from '../listenStoreChanges';
import { workFinished, updateWorkerState, notify, clearNotification } from '../actions';
import { playSound } from '../playSound';

const WORK_NOTIFICATION_TIMEOUT = 30 * 1000;

const handleWork = (store, chrome) => {
  let workTabId = null;
  let notificationTimer = null;

  const shouldConfirmWorkAssignment = () => (
    store.getState().plugin.getIn(['options', 'confirmWorkAssignment'])
  );

  const assignWork = (url) => {
    const oldWorkTabId = workTabId;
    chrome.tabs.create({ url }, tab => {
      workTabId = tab.id;
    });
    if (oldWorkTabId) {
      chrome.tabs.remove(oldWorkTabId);
    }
  };

  const showConfirmationNotification = () => {
    store.dispatch(notify('workAssigned'));
    notificationTimer = setTimeout(() => {
      store.dispatch(clearNotification('workAssigned'));
      store.dispatch(updateWorkerState('inactive'));
      notificationTimer = null;
    }, WORK_NOTIFICATION_TIMEOUT);
  };

  const handleAssignWork = ({ worker: prevWorker }, { worker: curWorker }) => {
    if (prevWorker.get('state') !== 'working' && curWorker.get('state') === 'working') {
      const url = curWorker.get('workUrl');
      if (!url) {
        // This means that the worker moved to "working" without an explicit
        // assignment, which is fine.
        return;
      }

      playSound(store.getState().plugin.get('options'));
      if (shouldConfirmWorkAssignment()) {
        showConfirmationNotification(url);
      } else {
        assignWork(url);
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

  chrome.notifications.onClicked.addListener(notificationId => {
    const { worker } = store.getState();
    if (notificationId === 'workAssigned' && worker.get('state') === 'working') {
      const url = worker.get('workUrl');
      if (!url) {
        throw new Error('Worker got notified of work without a valid URL!');
      }

      store.dispatch(clearNotification('workAssigned'));
      clearTimeout(notificationTimer);
      notificationTimer = null;
      assignWork(url);
    }
  });

  listenStoreChanges(store, handleUpdate);
};

export default handleWork;
