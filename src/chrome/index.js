import { Socket } from 'phoenix';
import { startPlugin } from '..';
import { setWorkerProfile } from '../actions';
import listenMessages from './listenMessages';
import handleWorkerStateNotifications from './handleWorkerStateNotifications';
import handleWork from './handleWork';
import handleStateSaving from './handleStateSaving';
import renderIcon from './renderIcon';
import startIdleChecking from './startIdleChecking';
import { applyMiddleware } from 'redux';
import { logMiddleware } from '../logging';

export const startChromePlugin = (auth, pollUrl, chrome, socketConstructor = Socket) => {
  const reloader = () => window.location.reload(true);
  const enhancer = applyMiddleware(logMiddleware);
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

  return { getStore };
};
