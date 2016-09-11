import { REDUCERS } from '../constants';
import { Socket } from 'phoenix';
import { startPlugin } from '..';
import { setWorkerProfile } from '../actions';
import listenMessages from './listenMessages';
import { logDebug } from '../logging';
import handleWorkerStateNotifications from './handleWorkerStateNotifications';
import handleWork from './handleWork';
import handleStateSaving from './handleStateSaving';
import renderIcon from './renderIcon';
import startIdleChecking from './startIdleChecking';

export const startChromePlugin = (auth, pollUrl, chrome, enhancer, socketConstructor = Socket) => {
  const reloader = () => window.location.reload(true);
  const plugin = startPlugin({ auth, pollUrl, enhancer, reloader, socketConstructor });
  const store = plugin.getStore();

  const getStore = () => store;

  const getUserInfo = () => {
    chrome.identity.getProfileUserInfo((data) => {
      store.dispatch(setWorkerProfile(data));
    });
  };

  handleStateSaving(store, chrome);
  listenMessages(store, chrome);
  handleWorkerStateNotifications(store, chrome);
  renderIcon(store, chrome);
  handleWork(store, chrome);
  startIdleChecking(store, chrome);
  getUserInfo();

  // redux dev tools don't work with the plugin, so we have a dumb replacement.
  store.subscribe(() => {
    const state = store.getState();
    logDebug('\n**STATE**');
    REDUCERS.forEach(reducer => {
      logDebug(`${reducer}: `, state[reducer]);
    });
  });

  return { getStore };
};
