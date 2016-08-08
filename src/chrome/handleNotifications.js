import { CONFIG } from '../constants';
import listenStoreChanges from '../listenStoreChanges';

export const notLoggedIn = 'notLoggedIn';

const handleNotifications = (store, chrome) => {
  const notifications = {
    [notLoggedIn]: {
      iconUrl: CONFIG.chrome.notificationIconUrl,
      isClickable: true,
      type: 'basic',
      title: "You're not logged in",
      message:
      "You don't seem to be logged in to Rainforest, click here to go to your profile and log in.",
    },
  };

  const shouldSendAuthNotifications = (
    { socket: prevSocket, worker: prevWorker }, { socket: curSocket, worker: curWorker }
  ) => (
    curSocket.get('state') === 'unauthenticated' && (
      prevSocket.get('state') !== 'unauthenticated' ||
        (curWorker.get('state') === 'ready' && prevWorker.get('state') !== 'ready')
    )
  );

  const handleAuthNotification = (previousState, currentState) => {
    if (shouldSendAuthNotifications(previousState, currentState)) {
      chrome.notifications.create(notLoggedIn, notifications[notLoggedIn]);
    } else if (currentState.socket.get('state') === 'connected') {
      chrome.notifications.clear(notLoggedIn);
    }
  };

  const handleUpdate = (previousState, currentState) => {
    handleAuthNotification(previousState, currentState);
  };

  listenStoreChanges(store, handleUpdate);

  chrome.notifications.onClicked.addListener(notificationId => {
    switch (notificationId) {
      case notLoggedIn:
        chrome.tabs.create({ url: CONFIG.profileUrl });
        return;
      default:
    }
  });
};

export default handleNotifications;
