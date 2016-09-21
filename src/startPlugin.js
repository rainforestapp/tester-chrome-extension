import pluginApp from './reducers';
import { startSocket } from './socket';
import startErrorHandling from './startErrorHandling';
import startReloader from './startReloader';
import handlePolling from './handlePolling';
import { authenticate } from './actions';
import { createStore } from 'redux';
import { Socket } from 'phoenix';

const startPlugin = ({ auth, enhancer, reloader, socketConstructor = Socket }) => {
  const store = createStore(pluginApp, enhancer);

  startErrorHandling(store);

  if (reloader) {
    startReloader(store, reloader);
  }

  if (auth) {
    store.dispatch(authenticate(auth));
  }

  startSocket(store, socketConstructor);
  handlePolling(store);

  const getStore = () => store;
  return { getStore };
};

export default startPlugin;
