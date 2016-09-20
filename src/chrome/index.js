import { Socket } from 'phoenix';
import { startPlugin } from '..';
import { setWorkerProfile } from '../actions';
import listenMessages from './listenMessages';
import handleStateNotifications from './handleStateNotifications';
import handleWork from './handleWork';
import getSync from './getSync';
import handleStateSaving from './handleStateSaving';
import renderIcon from './renderIcon';
import startIdleChecking from './startIdleChecking';
import handleCaptcha from './handleCaptcha';
import { applyMiddleware } from 'redux';
import { logMiddleware } from '../logging';

export const startChromePlugin = (chrome, socketConstructor = Socket) => {
  const reloader = () => window.location.reload(true);
  const enhancer = applyMiddleware(logMiddleware);
  const plugin = startPlugin({ enhancer, reloader, socketConstructor });
  const store = plugin.getStore();

  const getStore = () => store;

  const getUserInfo = () => {
    if (chrome.identity.getProfileUserInfo) {
      chrome.identity.getProfileUserInfo(data => {
        store.dispatch(setWorkerProfile(data));
      });
    }
  };

  getSync(store, chrome);
  handleStateSaving(store, chrome);
  listenMessages(store, chrome);
  handleStateNotifications(store, chrome);
  renderIcon(store, chrome);
  handleWork(store, chrome);
  startIdleChecking(store, chrome);
  getUserInfo();
  handleCaptcha(store, chrome);

  return { getStore };
};
