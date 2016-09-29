import { notifications, notLoggedIn, leftChannel } from './notifications';
import { CONFIG } from '../constants';
import { updateWorkerState } from '../actions';
import listenStoreChanges from '../listenStoreChanges';
import { playSoundOnce } from '../playSound';

const handleStateNotifications = (store, chrome) => {
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
      playSoundOnce(store.getState().plugin.get('options'));
      store.dispatch(updateWorkerState('inactive'));
    } else if (currentState.socket.get('state') === 'connected') {
      chrome.notifications.clear(notLoggedIn, () => {});
    }
  };

  const handleChannelNotifications = ({ socket: prevSocket }, { socket: curSocket }) => {
    if (prevSocket.get('state') !== 'left' && curSocket.get('state') === 'left') {
      chrome.notifications.create(leftChannel, notifications[leftChannel]);
      playSoundOnce(store.getState().plugin.get('options'));
    }
  };

  const handleUpdate = (previousState, currentState) => {
    handleAuthNotification(previousState, currentState);
    handleChannelNotifications(previousState, currentState);
  };

  chrome.notifications.onClicked.addListener(notificationId => {
    switch (notificationId) {
      case notLoggedIn:
        chrome.tabs.create({ url: CONFIG.profileUrl });
        return;
      default:
    }
  });

  listenStoreChanges(store, handleUpdate);
};

export default handleStateNotifications;
