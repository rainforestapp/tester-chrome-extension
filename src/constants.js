import deepFreeze from 'deep-freeze';

export const actions = deepFreeze({
  ASSIGN_WORK: 'ASSIGN_WORK',
  AUTHENTICATE: 'AUTHENTICATE',
  AUTH_FAILED: 'AUTH_FAILED',
  CONNECT: 'CONNECT',
  CONNECTION_CLOSED: 'CONNECTION_CLOSED',
  UPDATE_WORKER_STATE: 'UPDATE_WORKER_STATE',
  LOG_MESSAGE: 'LOG_MESSAGE',
  ICON_CLICKED: 'ICON_CLICKED',
  WORK_STARTED: 'WORK_STARTED',
  WORK_FINISHED: 'WORK_FINISHED',
  CHECK_STATE: 'CHECK_STATE',
  SET_PLUGIN_VERSION: 'SET_PLUGIN_VERSION',
  SET_WORKER_PROFILE: 'SET_WORKER_PROFILE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  CHANNEL_LEFT: 'CHANNEL_LEFT',
  SET_OPTIONS: 'SET_OPTIONS',
  RELOAD_PLUGIN: 'RELOAD_PLUGIN',
  NOTIFY: 'NOTIFY',
  CLEAR_NOTIFICATION: 'CLEAR_NOTIFICATION',
});

export const colors = deepFreeze({
  RED: [255, 0, 0, 230],
  GREEN: 'green',
  GREY: [0, 0, 0, 230],
});

export const REDUCERS = deepFreeze(['worker', 'socket', 'plugin', 'notifications']);

export const NOTIFICATION_SOUND_URL = 'notificationSoundUrl';
export const NOTIFICATION_SOUND_REPEAT = 'notificationSoundRepeat';

const getChromeConfig = () => (
  {
    notificationIconUrl: window.CHROME_NOTIFICATION_ICON_URL,
    greyIcon: window.CHROME_GREY_ICON,
    colorIcon: window.CHROME_COLOR_ICON,
  }
);

const getConfig = () => {
  switch (window.ENV) {
    case 'dev':
      return {
        env: 'dev',
        socketURL: 'ws://localhost:4000/socket',
        profileUrl: 'http://portal.rainforest.dev/profile',
        workAvailableEndpoint: 'http://portal.rainforest.dev/api/1/testers',
        chrome: getChromeConfig(),
        ravenURL: 'BOGUS',
      };
    case 'staging':
      return {
        env: 'staging',
        socketURL: 'wss://schrute.rnfrst.com/socket',
        profileUrl: 'https://portal.rnfrst.com/profile',
        workAvailableEndpoint: 'https://portal.rainforestqa.com/api/1/testers',
        chrome: getChromeConfig(),
        ravenURL: 'https://7f2a3dc2e6644d98a2411c6883724589@sentry.io/68477',
      };
    case 'prod':
      return {
        env: 'prod',
        socketURL: 'wss://schrute.rainforestqa.com/socket',
        profileUrl: 'https://portal.rainforestqa.com/profile',
        workAvailableEndpoint: 'https://bouncer.rainforestqa.com/1/testers',
        chrome: getChromeConfig(),
        ravenURL: 'https://a7b0c76390cc47208e38b884fd60ff3d@sentry.io/68477',
      };
    default:
      return {
        env: 'test',
        socketURL: 'ws://localhost:4000/socket',
        profileUrl: 'http://portal.rainforest.dev/profile',
        workAvailableEndpoint: 'http://portal.rainforest.dev/api/1/testers',
        chrome: {
          notificationIconUrl: 'bogusNotifications.png',
          greyIcon: { path: 'GREY' },
          colorIcon: { path: 'COLOR' },
        },
        ravenURL: 'BOGUS',
      };
  }
};

export const CONFIG = deepFreeze(getConfig());

export const NOTIFICATIONS = deepFreeze({
  notLoggedIn: {
    title: "You're not logged in",
    message:
    "You don't seem to be logged in to Rainforest, click here to go to your profile and log in.",
  },
  leftChannel: {
    title: 'You have been disconnected',
    message: 'You have disconnected, probably because you logged in on another computer. ' +
      'Click the extension icon to reconnect.',
  },
  workerIdle: {
    title: 'We noticed you were idle',
    message: 'You seem to have been idle for a while, so we stopped ' +
      'checking for work. Click here to start checking for work again.',
  },
  doubleReady: {
    title: 'You are active on another computer',
    message: 'Please turn off your extension elsewhere before turning it on here.',
  },
});
