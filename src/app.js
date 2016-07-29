import {SchruteConn} from './schrute';
import {RAVEN_URL, RED, GREEN, GREY, BASE_URL, WORK_AVAILABLE_URL, DEFAULT_INTERVAL, ABANDONED_URL} from './constants';
import Raven from 'raven-js';

let timeout;

// Set polling interval in milliseconds (note, this is rate limted,
// so if you change agressively, it will error)
let checkForWorkInterval = DEFAULT_INTERVAL;

// Start disabled: require the tester to enable if they want to
// work when the browser starts
const appState = {
  tester_state: 'active',
  webSocketConnection: undefined,
  work_available_endpoint: WORK_AVAILABLE_URL,
  email: '',
  profileUrl: '',
  id: '',
  workTab: null,
  isPolling: false,
  lastRefresh: 0,
};

const notifications = {
  notLoggedIn: {
    iconUrl: 'icons/icon_notification.png',
    isClickable: true,
    type: 'basic',
    title: "You're not logged in",
    message: "You don't seem to be logged in to Rainforest, click here to go to your profile and log in.",
  },
  captcha: {
    iconUrl: 'icons/icon_notification.png',
    isClickable: true,
    type: 'basic',
    title: 'There was a problem with the request',
    message: 'You may need to fill out a captcha. Click here to test the work endpoint.',
  },
};

function getWorkUrl() {
  const userInfo = {
    uuid: appState.uuid,
    email: appState.email,
    id: appState.id,
    version: appState.version,
    tester_state: appState.tester_state,
  };

  return `${appState.work_available_endpoint}${appState.uuid}/work_available?info=${JSON.stringify({userInfo})}`;
}

function pushState() {
  if (appState.webSocketConnection !== undefined) {
    appState.webSocketConnection.updateState(appState);
  }
}

function notifyCaptcha() {
  chrome.notifications.create('captcha', notifications.captcha);
}

function setupChromeEvents() {
  Raven.config(RAVEN_URL).install();
  const manifest = chrome.runtime.getManifest();
  appState.version = manifest.version;
  appState.profileUrl = `${BASE_URL}/profile?version=${manifest.version}`;
  app.togglePolling(appState.isPolling);

  chrome.notifications.onClicked.addListener(notificationId => {
    if (notificationId === 'not_logged_in') {
      makeNewSyncTab();
      chrome.notifications.clear('not_logged_in');
    } else if (notificationId === 'captcha') {
      makeNewTab(getWorkUrl());
      chrome.notifications.clear('captcha');
    }
  });

  // Load the initial id value from storage
  chrome.storage.sync.get('worker_uuid', data => {
    // Notify that we saved.
    if (data.worker_uuid !== undefined) {
      appState.uuid = data.worker_uuid;
    } else {
      notifyNotLoggedIn();
    }
  });

  //
  // Load the initial api endpoint value from storage
  //
  chrome.storage.sync.get('work_available_endpoint', data => {
    // Notify that we saved.
    if (data.work_available_endpoint !== undefined) {
      appState.work_available_endpoint = data.work_available_endpoint;
    } else {
      notifyNotLoggedIn();
    }
  });

  chrome.storage.sync.get(['worker_uuid', 'websocket_endpoint', 'websocket_auth'], data => {
    app.startWebsocket(data);
    app.pushState();
  });

  // Handle the icon being clicked
  //
  // this enables or disables checking for new work
  //
  chrome.browserAction.onClicked.addListener(() => {
    appState.isPolling = !appState.isPolling;
    app.togglePolling(appState.isPolling);
    app.pushState();
  });

  // Handle data coming from the main site
  chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    if (request.data &&
        request.data.worker_uuid &&
        request.data.work_available_endpoint) {
      app.startApp(request, sendResponse);
    }
  });

  // Get user information
  chrome.identity.getProfileUserInfo(info => {
    appState.email = info.email;
    appState.id = info.id;
  });

  // Get idle checking - this drops the polling rate
  // for "inactive" users (i.e. when AFK)

  let shutOffTimer;
  chrome.idle.setDetectionInterval(DEFAULT_INTERVAL * 3 / 1000);
  chrome.idle.onStateChanged.addListener(state => {
    appState.tester_state = state;
    app.pushState();
    if (state !== 'active') {
      checkForWorkInterval = DEFAULT_INTERVAL * 10;
      const TEN_MINUTES = (60 * 10) * 1000;
      shutOffTimer = setTimeout(() => {
        if (appState.tester_state !== 'active') {
          appState.isPolling = false;
          app.togglePolling(appState.isPolling);
          app.pushState();
          const ONE_MINUTE = 60 * 1000;
          if (appState.lastRefresh > Date.now() - ONE_MINUTE) { // confirm tab recently was refreshed
            chrome.tabs.update(appState.workTab.id, {url: ABANDONED_URL});
            setTimeout(() => { // make sure the job was actually abandoned
              chrome.tabs.get(appState.workTab.id, tab => {
                if (tab.url !== ABANDONED_URL) {
                  chrome.tabs.update(tab.id, {url: ABANDONED_URL});
                }
              });
            }, 3000);
          }
        }
      }, TEN_MINUTES);
    } else {
      clearTimeout(shutOffTimer);
      checkForWorkInterval = DEFAULT_INTERVAL;
    }
  });

  chrome.tabs.onUpdated.addListener((id, changed) => {
    if (appState.workTab !== null && id === appState.workTab.id) { // check if our tab
      if (changed.status !== undefined && Object.keys(changed).length === 1 &&
      changed.status === 'loading') { // check for refresh
        appState.lastRefresh = Date.now();
      }
    }
  });
}

function startApp(request, sendResponse) {
  appState.uuid = request.data.worker_uuid;
  appState.work_available_endpoint = request.data.work_available_endpoint;
  app.togglePolling(appState.isPolling);

  // comment this out in dev mode
  if (sendResponse) {
    sendResponse({ok: true});
  }

  chrome.storage.sync.set(
    {
      worker_uuid: request.data.worker_uuid,
      work_available_endpoint: request.data.work_available_endpoint,
      websocket_endpoint: request.data.websocket_endpoint,
      websocket_auth: request.data.websocket_auth,
    }
  );

  app.startWebsocket(request.data);
  app.pushState();
}

function startWebsocket(data) {
  if (data.websocket_endpoint === undefined ||
      data.worker_uuid === undefined ||
      data.websocket_auth === undefined ||
      appState.webSocketConnection !== undefined) {
    return;
  }

  appState.webSocketConnection = new SchruteConn(data.websocket_endpoint, data.worker_uuid, data.websocket_auth);
  appState.webSocketConnection.start();
}


// Set checking state

function notifyNotLoggedIn() {
  chrome.notifications.create('not_logged_in', notifications.notLoggedIn);
}

function togglePolling(enabled) {
  if (!enabled) {
    chrome.browserAction.setBadgeBackgroundColor({color: RED});
    chrome.browserAction.setBadgeText({text: 'OFF'});
  } else {
    if (appState.uuid) {
      app.checkForWork();
    } else {
      notifyNotLoggedIn();
    }
  }
}

// Open or focus the main work tab

function openOrFocusTab(url) {
  if (appState.workTab === null) {
    app.makeNewWorkTab(url);
  } else {
    app.refreshTabInfo();
  }
}

// Make sure the work tab is open and in focus
function refreshTabInfo() {
  chrome.tabs.get(appState.workTab.id, tab => {
    if (chrome.runtime.lastError) {
      appState.workTab = null;
    } else {
      appState.workTab = tab;

      // force selection
      if (!appState.workTab.selected) {
        chrome.tabs.update(appState.workTab.id, {selected: true});
      }
    }
  });
}

// Open a new work tab
function makeNewWorkTab(url) {
  // make a new tab
  chrome.tabs.create({url}, t => {
    appState.workTab = t;
  });
}

//
// Open a sync tab
//
function makeNewSyncTab() {
  // make a new tab
  chrome.tabs.create({url: appState.profileUrl});
}

function makeNewTab(url) {
  chrome.tabs.create({ url });
}

function pingServer(url) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && appState.isPolling) {
        const responseText = xhr.responseText;
        try {
          resolve(JSON.parse(responseText));
        } catch (error) {
          let errorMessage = 'Unexpected JSON';
          if (responseText[0] === '<' && responseText.indexOf('CAPTCHA') > -1) {
            errorMessage = 'Captcha Required';
            appState.isPolling = false;
            app.pushState();
            window.setTimeout(() => {
              notifyCaptcha();
              appState.isPolling = false;
              app.togglePolling(appState.isPolling);
              app.pushState();
            }, checkForWorkInterval); // protect against too many requests
          }
          Raven.captureMessage(errorMessage, {
            extra: {
              error: String(error),
              workerId: appState.uuid,
              testerState: appState.tester_state,
              workUrl: getWorkUrl(),
              statusCode: xhr.status,
              responseText,
            },
          });
        }
      }
    };

    xhr.send();
  });
}

// Poll for new work
function checkForWork() {
  app.pingServer(getWorkUrl()).then(resp => {
    if (resp.work_available) {
      chrome.browserAction.setBadgeBackgroundColor({color: GREEN});
      chrome.browserAction.setBadgeText({text: 'YES'});

      app.openOrFocusTab(resp.url);
    } else {
      chrome.browserAction.setBadgeBackgroundColor({color: GREY});
      chrome.browserAction.setBadgeText({text: 'NO'});
    }

    if (appState.isPolling) {
      clearTimeout(timeout);
      timeout = setTimeout(app.checkForWork, checkForWorkInterval);
    }
  });
}

const app = {
  startApp,
  setupChromeEvents,
  appState,
  togglePolling,
  pingServer,
  checkForWork,
  makeNewWorkTab,
  refreshTabInfo,
  startWebsocket,
  openOrFocusTab,
  pushState,
};

// exposing this for dev mode
// Use in dev mode
// window._startRainforestTesterApp({
//   data: {
//     worker_uuid: 'your-worker-id',
//     work_available_endpoint: 'bouncer-url'}});
window._startRainforestTesterApp = app.startApp;

export default app;
