/* eslint-disable no-console */
import { CONFIG } from '../constants';
import { Socket } from 'phoenix';
import { startPlugin } from '..';
import listenAuth from './listenAuth';
import handleNotifications from './handleNotifications';
import handleWork from './handleWork';
import renderIcon from './renderIcon';

export const startChromePlugin = (auth, chrome, enhancer, socketConstructor = Socket) => {
  const reloader = () => window.location.reload(true);
  const plugin = startPlugin({ auth, enhancer, reloader, socketConstructor });
  const store = plugin.getStore();

  const getStore = () => store;

  listenAuth(store, chrome);
  handleNotifications(store, chrome);
  renderIcon(store, chrome);
  handleWork(store, chrome);

  if (CONFIG.env === 'dev') {
    // redux dev tools don't work with the plugin, so we have a dumb
    // replacement.
    store.subscribe(() => {
      const { worker, socket, plugin: pluginState } = store.getState();
      console.log('Worker:', worker.toJS(),
                  'Socket:', socket.toJS(),
                  'Plugin:', pluginState.toJS());
    });
  }

  return { getStore };
};
