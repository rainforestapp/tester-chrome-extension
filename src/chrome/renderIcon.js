import { colors, CONFIG } from '../constants';
import { iconClicked } from '../actions';
import { alreadyWorking, notifications } from './notifications';

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
    let icon;
    if (socket.get('state') === 'connected') {
      icon = Object.assign({}, CONFIG.chrome.colorIcon);
    } else {
      icon = Object.assign({}, CONFIG.chrome.greyIcon);
    }
    chrome.browserAction.setIcon(icon);
  };


  const handleClick = () => {
    const workerState = store.getState().worker.get('state');
    if (workerState === 'working') {
      const notificationDuration = 3000;
      chrome.notifications.create(alreadyWorking, notifications[alreadyWorking]);
      window.setTimeout(() => chrome.notifications.clear(alreadyWorking), notificationDuration);
    } else {
      store.dispatch(iconClicked(store.getState().worker.get('state')));
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

  chrome.browserAction.onClicked.addListener(handleClick);
};

export default renderIcon;
