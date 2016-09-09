import { colors, CONFIG } from '../constants';
import { iconClicked } from '../actions';

const renderIcon = (store, chrome) => {
  const renderBadge = ({ worker }) => {
    const workerState = worker.get('state');

    switch (workerState) {
      case 'working':
        chrome.browserAction.setBadgeBackgroundColor({ color: colors.GREEN });
        chrome.browserAction.setBadgeText({ text: 'WORK' });
        break;
      default:
        chrome.browserAction.setBadgeText({ text: '' });
        break;
    }
  };

  const iconConfig = ({ socket, worker }) => {
    if (socket.get('state') !== 'connected') {
      return CONFIG.chrome.greyIcon;
    }

    switch (worker.get('state')) {
      case 'inactive':
        return CONFIG.chrome.greyIcon;
      case 'ready':
        return CONFIG.chrome.colorIcon;
      case 'working':
        return worker.get('wantsMoreWork') ? CONFIG.chrome.colorIcon : CONFIG.chrome.greyIcon;
      default:
        return CONFIG.chrome.greyIcon;
    }
  };

  const renderIconImage = (state) => {
    chrome.browserAction.setIcon(Object.assign({}, iconConfig(state)));
  };


  const render = (state) => {
    renderBadge(state);
    renderIconImage(state);
  };

  render(store.getState());

  store.subscribe(() => {
    render(store.getState());
  });

  chrome.browserAction.onClicked.addListener(() => store.dispatch(iconClicked()));
};

export default renderIcon;
