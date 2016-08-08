export const actions = Object.freeze({
  ASSIGN_WORK: 'ASSIGN_WORK',
  AUTHENTICATE: 'AUTHENTICATE',
  AUTH_FAILED: 'AUTH_FAILED',
  CONNECT: 'CONNECT',
  CONNECTION_CLOSED: 'CONNECTION_CLOSED',
  UPDATE_WORKER_STATE: 'UPDATE_WORKER_STATE',
  LOG_MESSAGE: 'LOG_MESSAGE',
  ICON_CLICKED: 'ICON_CLICKED',
  WORK_FINISHED: 'WORK_FINISHED',
  SET_PLUGIN_VERSION: 'SET_PLUGIN_VERSION',
});

export const colors = Object.freeze({
  RED: [255, 0, 0, 230],
  GREEN: [0, 255, 0, 230],
  GREY: [0, 0, 0, 230],
});

export const REDUCERS = Object.freeze(['worker', 'socket', 'plugin']);

const getChromeConfig = () => (
  Object.freeze({
    notificationIconUrl: window.CHROME_NOTIFICATION_ICON_URL,
    greyIcon: window.CHROME_GREY_ICON,
    colorIcon: window.CHROME_COLOR_ICON,
  })
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
        socketURL: 'wss://schrute-stg.herokuapp.com/socket',
        profileUrl: 'https://portal.rnfrst.com/profile',
        chrome: getChromeConfig(),
        ravenURL: 'https://0f911298f80c47d9b53d3e6a53d236e5@app.getsentry.com/88435',
      };
    default:
      return {
        env: 'test',
        socketURL: 'ws://localhost:4000/socket',
        profileUrl: 'http://portal.rainforest.dev/profile',
        chrome: {
          notificationIconUrl: 'bogusNotifications.png',
          greyIcon: 'GREY',
          colorIcon: 'COLOR',
        },
        ravenURL: 'BOGUS',
      };
  }
};

export const CONFIG = Object.freeze(getConfig());
