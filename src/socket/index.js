import { Socket } from 'phoenix';
import listenStoreChanges from '../listenStoreChanges';
import { logDebug } from '../logging';
import { CONFIG } from '../constants';
import {
  connect,
  logMessage,
  connectionClosed,
  authFailed,
  assignWork,
  workFinished,
  setPluginVersion,
  channelLeft,
  reloadPlugin,
} from '../actions';

export const startSocket = (store, socketConstructor = Socket) => {
  let socket = null;
  let channel = null;

  const pushWorkerState = (state) => {
    if (!channel) {
      // Channel hasn't been joined, but it's OK.
      return;
    }

    channel.push('update_state', { worker_state: state });
  };

  const workerState = () => store.getState().worker.get('state');

  const handleAssignWork = (payload) => {
    if (workerState() === 'ready') {
      store.dispatch(assignWork(payload));
    } else {
      channel.push(
        'work_rejected',
        { reason: 'invalid_worker_state', worker_state: workerState() }
      );
    }
  };

  const handleWorkFinished = () => {
    store.dispatch(workFinished());
  };

  const handleCheckVersion = ({ version }) => {
    store.dispatch(setPluginVersion(version));
  };

  const handleReload = () => {
    store.dispatch(reloadPlugin());
  };

  const handleLeave = () => {
    if (!channel) {
      throw new Error("Leaving a channel when channel isn't joined");
    }

    channel.leave();
    channel = null;
    store.dispatch(channelLeft());
    socket.disconnect();
  };

  const joinLobby = () => {
    const lobby = socket.channel('workers:lobby');
    lobby.on('reload', handleReload);
    lobby.join().receive('ok', resp => {
      logDebug('Joined lobby successfully', resp);
    }).receive('error', resp => {
      throw new Error(`Error joining lobby: ${resp}`);
    });
  };

  const connectToSocket = ({ socket: socketState, worker }) => {
    const workerUUID = worker.get('uuid');
    const socketAuth = socketState.get('auth');
    const SocketConstructor = socketConstructor;

    socket = new SocketConstructor(CONFIG.socketURL, {
      params: socketAuth.toObject(),
      logger: (kind, msg, data) => {
        let payload;
        try {
          payload = JSON.stringify(data);
        } catch (ex) {
          if (ex instanceof TypeError) {
            payload = '<binary>';
          } else {
            throw ex;
          }
        }
        const log = `${kind}: ${msg} ${payload}`;
        store.dispatch(logMessage(log));
      },
    });
    socket.onClose(() => store.dispatch(connectionClosed()));
    socket.connect();

    channel = socket.channel(`workers:${workerUUID}`);
    channel.on('assign_work', handleAssignWork);
    channel.on('work_finished', handleWorkFinished);
    channel.on('check_version', handleCheckVersion);
    channel.on('reload', handleReload);
    channel.on('leave', handleLeave);
    channel.join()
      .receive('ok', resp => {
        pushWorkerState(workerState());
        store.dispatch(connect(resp));
        // We only want to join the lobby if the actual channel connection was
        // successful
        joinLobby();
      }).receive('error', resp => store.dispatch(authFailed(resp)));
  };

  const reconnectSocket = (state) => {
    if (!socket) {
      throw Error('reconnectSocket called without a current socket');
    }

    socket.disconnect();
    socket = null;
    connectToSocket(state);
  };

  const shouldConnect = ({ socket: socketState, worker }) => {
    const currentState = socketState.get('state');
    return socket === null &&
      socketState.get('auth') !== null &&
      (currentState === 'unconnected' || currentState === 'unauthenticated') &&
      worker.get('uuid') !== null;
  };

  const shouldReconnect = (
    { worker: prevWorker, socket: prevSocket }, { worker: curWorker, socket: curSocket }
  ) => {
    if (prevSocket.get('state') !== 'reconnecting' && curSocket.get('state') === 'reconnecting') {
      return true;
    }
    const prevUUID = prevWorker.get('uuid');
    const curUUID = curWorker.get('uuid');

    return socket && prevUUID && curUUID && prevUUID !== curUUID;
  };

  const handleWorkerState = (previousState, currentState) => {
    const oldState = previousState.worker.get('state');
    const newState = currentState.worker.get('state');

    if (oldState !== newState) {
      pushWorkerState(newState);
    }
  };

  const handleUpdate = (previousState, currentState) => {
    if (shouldConnect(currentState)) {
      connectToSocket(currentState);
    } else if (shouldReconnect(previousState, currentState)) {
      reconnectSocket(currentState);
    }
    handleWorkerState(previousState, currentState);
  };

  const getSocket = () => socket;

  listenStoreChanges(store, handleUpdate);
  if (!store.getState().socket.get('auth')) {
    store.dispatch(authFailed('No credentials'));
  }

  return {
    getSocket,
  };
};
