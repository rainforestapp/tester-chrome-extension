export const mockChrome = (opts = {}) => {
  let storageStore = {};
  let localStorageStore = {};
  const messageListeners = [];
  const currentNotifications = {};
  const notificationListeners = [];
  const iconClickedListeners = [];
  const stateChangedListeners = [];
  const badge = { color: null, text: '' };
  const openTabs = [];
  const profileUserInfo = opts.profileUserInfo || {
    email: '',
    id: '',
  };
  let currentIcon;

  const addListener = (listener) => {
    messageListeners.push(listener);
  };

  if (opts.storage) {
    storageStore = opts.storage;
  }
  if (opts.localStorage) {
    localStorageStore = opts.localStorage;
  }
  const extension = {};
  const notifications = {
    create: (id, notificationOpts) => {
      currentNotifications[id] = notificationOpts;
    },
    onClicked: {
      addListener: (callback) => {
        notificationListeners.push(callback);
      },
    },
    clear: (id) => {
      delete currentNotifications[id];
    },
  };
  const runtime = {
    onMessageExternal: {
      addListener,
    },
  };
  const storage = {
    sync: {
      set: (data) => {
        storageStore = Object.assign({}, storageStore, data);
      },
    },
    local: {
      set: (data) => {
        localStorageStore = Object.assign({}, localStorageStore, data);
      },
      get: (keys, callback) => {
        setTimeout(() => {
          const data = keys.reduce(
            (acc, key) => Object.assign(acc, { [key]: localStorageStore[key] }),
            {}
          );
          callback(data);
        });
      },
    },
  };
  const browserAction = {
    setBadgeBackgroundColor: ({ color }) => {
      badge.color = color;
    },
    setBadgeText: ({ text }) => {
      badge.text = text;
    },
    setIcon: (icon) => {
      // bizarrely, setIcon mutates the object
      Object.assign(icon, { imageData: 'FOO' });
      currentIcon = icon;
    },
    onClicked: {
      addListener: (listener) => {
        iconClickedListeners.push(listener);
      },
    },
  };
  const tabs = {
    create: (tab) => {
      openTabs.push(tab);
    },
  };
  const idle = {
    setDetectionInterval: () => {},
    onStateChanged: {
      addListener: (listener) => {
        stateChangedListeners.push(listener);
      },
    },
  };
  const identity = {
    getProfileUserInfo: (callback) => {
      setTimeout(() => callback(profileUserInfo));
    },
  };

  // Mock actions

  // sendRuntimeMessage mocks the chrome.runtime.sendMessage action.
  const sendRuntimeMessage = (msg, callback) => {
    const safeCallback = typeof callback === 'function' ? callback : () => {};
    messageListeners.forEach(listener => {
      listener(msg, {}, safeCallback);
    });
  };

  // clickIcon simulates clicking the plugin icon
  const clickIcon = () => {
    iconClickedListeners.forEach(listener => listener());
  };

  // getStorage mocks chrome.storage.sync.get (it's synchronous to make testing
  // easier)
  const getStorage = () => storageStore;

  // getLocalStorage is like getStorage but for local storage instead of sync
  const getLocalStorage = () => localStorageStore;

  const stateChanged = (newState) => {
    stateChangedListeners.forEach(listener => {
      listener(newState);
    });
  };

  const getCurrentNotifications = () => currentNotifications;
  const clickNotification = (notificationId) => {
    notificationListeners.forEach(listener => {
      listener(notificationId);
    });
  };

  const getNumMessageListeners = () => messageListeners.length;

  const getBadge = () => badge;

  const getOpenTabs = () => openTabs;

  const getIcon = () => currentIcon;

  return {
    // "Real" objects
    extension,
    notifications,
    runtime,
    storage,
    tabs,
    browserAction,
    idle,
    identity,

    // Testing helpers
    sendRuntimeMessage,
    getStorage,
    getLocalStorage,
    getNumMessageListeners,
    getCurrentNotifications,
    clickNotification,
    clickIcon,
    getBadge,
    getOpenTabs,
    getIcon,
    stateChanged,
  };
};
