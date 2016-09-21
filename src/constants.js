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
  SET_PLUGIN_VERSION: 'SET_PLUGIN_VERSION',
  START_POLLING: 'START_POLLING',
  STOP_POLLING: 'STOP_POLLING',
  SET_POLLING_INTERVAL: 'SET_POLLING_INTERVAL',
  SET_POLL_URL: 'SET_POLL_URL',
  CAPTCHA_REQUIRED: 'CAPTCHA_REQUIRED',
  SET_WORKER_PROFILE: 'SET_WORKER_PROFILE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  APPLICATION_ERROR: 'APPLICATION_ERROR',
  RESET_INTERVAL: 'RESET_INTERVAL',
  CHANNEL_LEFT: 'CHANNEL_LEFT',
  SET_OPTIONS: 'SET_OPTIONS',
});

export const colors = deepFreeze({
  RED: [255, 0, 0, 230],
  GREEN: 'green',
  GREY: [0, 0, 0, 230],
});

export const REDUCERS = deepFreeze(['worker', 'socket', 'plugin', 'polling']);

export const DEFAULT_POLLING_INTERVAL = 30 * 1000;

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
        chrome: getChromeConfig(),
        ravenURL: 'BOGUS',
      };
    case 'staging':
      return {
        env: 'staging',
        socketURL: 'wss://schrute.rnfrst.com/socket',
        profileUrl: 'https://portal.rnfrst.com/profile',
        chrome: getChromeConfig(),
        ravenURL: 'https://0f911298f80c47d9b53d3e6a53d236e5@app.getsentry.com/88435',
      };
    case 'prod':
      return {
        env: 'prod',
        socketURL: 'wss://schrute.rainforestqa.com/socket',
        profileUrl: 'https://portal.rainforestqa.com/profile',
        chrome: getChromeConfig(),
        ravenURL: 'https://a7b0c76390cc47208e38b884fd60ff3d@sentry.io/68477',
      };
    default:
      return {
        env: 'test',
        socketURL: 'ws://localhost:4000/socket',
        profileUrl: 'http://portal.rainforest.dev/profile',
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
