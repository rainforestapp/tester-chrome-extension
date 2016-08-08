import { colors, CONFIG } from '../constants';
import { iconClicked } from '../actions';

const renderIcon = (store, chrome) => {
  const renderBadge = ({ worker }) => {
    const workerState = worker.get('state');

    switch (workerState) {
      case 'inactive':
        chrome.browserAction.setBadgeBackgroundColor({ color: colors.RED });
        chrome.browserAction.setBadgeText({ text: 'OFF' });
        break;
      case 'working':
        chrome.browserAction.setBadgeBackgroundColor({ color: colors.GREEN });
        chrome.browserAction.setBadgeText({ text: 'YES' });
        break;
      case 'ready':
        chrome.browserAction.setBadgeText({ text: '' });
        break;
      default:
        throw new Error(`unrecognized worker state: ${workerState}`);
    }
  };

  const renderIconImage = ({ socket }) => {
    if (socket.get('state') === 'connected') {
      chrome.browserAction.setIcon(CONFIG.chrome.colorIcon);
    } else {
      chrome.browserAction.setIcon(CONFIG.chrome.greyIcon);
    }
  };

  const render = (state) => {
    renderBadge(state);
    renderIconImage(state);
  };

  render(store.getState());

  store.subscribe(() => {
    render(store.getState());
  });

  chrome.browserAction.onClicked.addListener(() => {
    store.dispatch(iconClicked(store.getState().worker.get('state')));
  });
};

export default renderIcon;
