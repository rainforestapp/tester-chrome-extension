'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var mockChrome = exports.mockChrome = function mockChrome() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var storageStore = {};
  var localStorageStore = {};
  var messageListeners = [];
  var currentNotifications = {};
  var notificationListeners = [];
  var iconClickedListeners = [];
  var stateChangedListeners = [];
  var badge = { color: null, text: '' };
  var openTabs = [];
  var profileUserInfo = opts.profileUserInfo || {
    email: '',
    id: ''
  };
  var currentIcon = void 0;

  var addListener = function addListener(listener) {
    messageListeners.push(listener);
  };

  if (opts.storage) {
    storageStore = opts.storage;
  }
  if (opts.localStorage) {
    localStorageStore = opts.localStorage;
  }
  var extension = {};
  var notifications = {
    create: function create(id, notificationOpts) {
      currentNotifications[id] = notificationOpts;
    },
    onClicked: {
      addListener: function addListener(callback) {
        notificationListeners.push(callback);
      }
    },
    clear: function clear(id) {
      delete currentNotifications[id];
    }
  };
  var runtime = {
    onMessageExternal: {
      addListener: addListener
    }
  };
  var storage = {
    sync: {
      set: function set(data) {
        storageStore = Object.assign({}, storageStore, data);
      }
    },
    local: {
      set: function set(data) {
        localStorageStore = Object.assign({}, localStorageStore, data);
      },
      get: function get(keys, callback) {
        setTimeout(function () {
          var data = keys.reduce(function (acc, key) {
            return Object.assign(acc, _defineProperty({}, key, localStorageStore[key]));
          }, {});
          callback(data);
        });
      }
    }
  };
  var browserAction = {
    setBadgeBackgroundColor: function setBadgeBackgroundColor(_ref) {
      var color = _ref.color;

      badge.color = color;
    },
    setBadgeText: function setBadgeText(_ref2) {
      var text = _ref2.text;

      badge.text = text;
    },
    setIcon: function setIcon(icon) {
      // bizarrely, setIcon mutates the object
      Object.assign(icon, { imageData: 'FOO' });
      currentIcon = icon;
    },
    onClicked: {
      addListener: function addListener(listener) {
        iconClickedListeners.push(listener);
      }
    }
  };
  var tabs = {
    create: function create(tab) {
      openTabs.push(tab);
    }
  };
  var idle = {
    setDetectionInterval: function setDetectionInterval() {},
    onStateChanged: {
      addListener: function addListener(listener) {
        stateChangedListeners.push(listener);
      }
    }
  };
  var identity = {
    getProfileUserInfo: function getProfileUserInfo(callback) {
      setTimeout(function () {
        return callback(profileUserInfo);
      });
    }
  };

  // Mock actions

  // sendRuntimeMessage mocks the chrome.runtime.sendMessage action.
  var sendRuntimeMessage = function sendRuntimeMessage(msg, callback) {
    messageListeners.forEach(function (listener) {
      listener(msg, {}, callback);
    });
  };

  // clickIcon simulates clicking the plugin icon
  var clickIcon = function clickIcon() {
    iconClickedListeners.forEach(function (listener) {
      return listener();
    });
  };

  // getStorage mocks chrome.storage.sync.get (it's synchronous to make testing
  // easier)
  var getStorage = function getStorage() {
    return storageStore;
  };

  // getLocalStorage is like getStorage but for local storage instead of sync
  var getLocalStorage = function getLocalStorage() {
    return localStorageStore;
  };

  var stateChanged = function stateChanged(newState) {
    stateChangedListeners.forEach(function (listener) {
      listener(newState);
    });
  };

  var getCurrentNotifications = function getCurrentNotifications() {
    return currentNotifications;
  };
  var clickNotification = function clickNotification(notificationId) {
    notificationListeners.forEach(function (listener) {
      listener(notificationId);
    });
  };

  var getNumMessageListeners = function getNumMessageListeners() {
    return messageListeners.length;
  };

  var getBadge = function getBadge() {
    return badge;
  };

  var getOpenTabs = function getOpenTabs() {
    return openTabs;
  };

  var getIcon = function getIcon() {
    return currentIcon;
  };

  return {
    // "Real" objects
    extension: extension,
    notifications: notifications,
    runtime: runtime,
    storage: storage,
    tabs: tabs,
    browserAction: browserAction,
    idle: idle,
    identity: identity,

    // Testing helpers
    sendRuntimeMessage: sendRuntimeMessage,
    getStorage: getStorage,
    getLocalStorage: getLocalStorage,
    getNumMessageListeners: getNumMessageListeners,
    getCurrentNotifications: getCurrentNotifications,
    clickNotification: clickNotification,
    clickIcon: clickIcon,
    getBadge: getBadge,
    getOpenTabs: getOpenTabs,
    getIcon: getIcon,
    stateChanged: stateChanged
  };
};