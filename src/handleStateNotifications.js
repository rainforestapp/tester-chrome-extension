import listenStoreChanges from './listenStoreChanges';
import { playSoundOnce } from './playSound';
import { notify, clearNotification } from './actions';

const handleStateNotifications = (store) => {
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
      store.dispatch(notify('notLoggedIn'));
      playSoundOnce(store.getState().plugin.get('options'));
    } else if (currentState.socket.get('state') === 'connected' &&
               previousState.socket.get('state') !== 'connected') {
      store.dispatch(clearNotification('notLoggedIn'));
    }
  };

  const handleChannelNotifications = ({ socket: prevSocket }, { socket: curSocket }) => {
    if (prevSocket.get('state') !== 'left' && curSocket.get('state') === 'left') {
      store.dispatch(notify('leftChannel'));
      playSoundOnce(store.getState().plugin.get('options'));
    }
  };

  const handleUpdate = (previousState, currentState) => {
    handleAuthNotification(previousState, currentState);
    handleChannelNotifications(previousState, currentState);
  };

  listenStoreChanges(store, handleUpdate);
};

export default handleStateNotifications;
