import listenStoreChanges from '../listenStoreChanges';
import { NOTIFICATIONS, CONFIG } from '../constants';
import { updateWorkerState, clearNotification } from '../actions';
import deepFreeze from 'deep-freeze';

const handleNotifications = (store, chrome) => {
  const basicNotification = deepFreeze({
    iconUrl: CONFIG.chrome.notificationIconUrl,
    type: 'basic',
  });

  const notificationClickActions = deepFreeze({
    notLoggedIn: () => {
      chrome.tabs.create({ url: CONFIG.profileUrl });
    },
    captcha: () => {
      const url = store.getState().polling.get('pollUrl');
      if (!url) {
        // Not polling, so not a problem
        return;
      }

      chrome.tabs.create({ url });
    },
    workerIdle: () => {
      store.dispatch(updateWorkerState('ready'));
    },
  });

  const createNotification = notificationId => (
    Object.assign(
      {},
      basicNotification,
      { isClickable: notificationClickActions.hasOwnProperty(notificationId) },
      NOTIFICATIONS[notificationId]
    )
  );

  const handleUpdate = (
    { notifications: prevNotifications }, { notifications: curNotifications }
  ) => {
    const prevActive = prevNotifications.get('activeNotifications');
    const curActive = curNotifications.get('activeNotifications');
    curActive.subtract(prevActive).forEach(notificationId => {
      chrome.notifications.create(notificationId, createNotification(notificationId));
    });
    prevActive.subtract(curActive).forEach(notificationId => {
      chrome.notifications.clear(notificationId, () => {});
    });
  };

  chrome.notifications.onClosed.addListener(notificationId => {
    store.dispatch(clearNotification(notificationId));
  });

  chrome.notifications.onClicked.addListener(notificationId => {
    const action = notificationClickActions[notificationId];
    if (typeof action === 'function') {
      action();
    }
  });

  listenStoreChanges(store, handleUpdate);
};

export default handleNotifications;
