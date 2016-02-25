import pubsub from 'pubsub';
import manifest from '../extension/manifest.json';

function event() {
  const _pubsub = pubsub();
  _pubsub.addListener = _pubsub.subscribe;
  _pubsub.trigger = _pubsub.publish;
  return _pubsub;
}

const chromeApi = {
  runtime: {
    onMessageExternal: event(),
    getManifest: () => manifest,
  },
  identity: {
    getProfileUserInfo: () => {},
  },
  idle: {
    setDetectionInterval: () => {},
    onStateChanged: event(),
  },
  notifications: {
    onClicked: event(),
    clear: () => {},
    create: () => {},
  },
  browserAction: {
    setBadgeText: () => {},
    setBadgeBackgroundColor: () => {},
    onClicked: event(),
  },
  storage: {
    sync: {
      get: () => {},
      set: () => {},
    },
  },
  tabs: {
    create: () => {},
    get: () => {},
    update: () => {},
  },
};

export default chromeApi;
