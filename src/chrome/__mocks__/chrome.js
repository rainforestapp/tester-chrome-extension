export const mockChrome = (opts = {}) => {
  let storageStore = {};
  let localStorageStore = {};
  const messageListeners = [];
  const currentNotifications = {};
  const notificationListeners = [];
  const notificationClosedListeners = [];
  const iconClickedListeners = [];
  const stateChangedListeners = [];
  const badge = { color: null, text: '' };
  const openTabs = [];
  let openWindows = [{ tabs: [] }];
  let tabCounter = 42;
  const tabOnRemoveListeners = [];
  let currentIcon;
  let createdMenus = [];
  let checkedMenus = [];

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
    onClosed: {
      addListener: (callback) => {
        notificationClosedListeners.push(callback);
      },
    },
    clear: (id, callback) => {
      if (typeof callback !== 'function') {
        // Older versions of chrome fail without this
        const msg = "errorInvocation of form notifications.clear(string) doesn't match definition";
        throw new Error(msg);
      }
      delete currentNotifications[id];
      setTimeout(() => {
        callback(true);
        notificationClosedListeners.forEach(listener => {
          listener(id, false); // second arg is byUser
        });
      });
    },
  };

  const runtime = {
    onMessageExternal: {
      addListener,
    },
  };

  const dataWithKeys = (store, keys) => (
    keys.reduce(
      (acc, key) => Object.assign(acc, { [key]: store[key] }),
      {}
    )
  );

  const storage = {
    sync: {
      set: (data) => {
        storageStore = Object.assign({}, storageStore, data);
      },
      get: (keys, callback) => {
        setTimeout(() => {
          const data = dataWithKeys(storageStore, keys);
          callback(data);
        });
      },
    },
    local: {
      set: (data, callback) => {
        const safeCallback = typeof callback === 'function' ? callback : () => {};
        localStorageStore = Object.assign({}, localStorageStore, data);
        safeCallback();
      },
      get: (keys, callback) => {
        setTimeout(() => {
          const data = dataWithKeys(localStorageStore, keys);
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
    create: (tab, callback) => {
      const chromeTab = Object.assign({}, tab, {
        id: tabCounter++,
      });
      openTabs.push(chromeTab);
      setTimeout(() => {
        if (callback) {
          callback(chromeTab);
        }
      });
    },
    remove: (tabId, callback) => {
      const idx = openTabs.findIndex(tab => tab.id === tabId);
      if (idx === -1) {
        throw new Error(`tab ${tabId} not found`);
      }
      openTabs.splice(idx, 1);
      tabOnRemoveListeners.forEach(listener => listener(tabId, {}));
      if (callback) {
        setTimeout(callback);
      }
    },
    onRemoved: {
      addListener: (listener) => {
        tabOnRemoveListeners.push(listener);
      },
    },
  };

  const windows = {
    getAll: (callback) => {
      // This should really be async, but it complicates the tests horribly
      callback(openWindows);
    },

    create: (tabSpec, callback) => {
      const tab = Object.assign({}, tabSpec, {
        id: tabCounter++,
      });
      openTabs.push(tab);
      const windowSpec = { tabs: [tab] };
      openWindows.push(windowSpec);
      setTimeout(() => {
        if (callback) {
          callback(windowSpec);
        }
      });
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

  const contextMenus = {
    create: (option, callback) => {
      createdMenus.push(option);
      if (option.checked) {
        checkedMenus.push(option);
      }
      const safeCallback = typeof callback === 'function' ? callback : () => {};
      safeCallback();
    },
    removeAll: () => {
      createdMenus = [];
      checkedMenus = [];
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
    if (currentNotifications[notificationId] &&
        currentNotifications[notificationId].isClickable) {
      notificationListeners.forEach(listener => {
        listener(notificationId);
      });
    }
  };
  const closeNotification = (notificationId) => {
    notificationClosedListeners.forEach(listener => {
      listener(notificationId, true); // second arg is byUser
    });
  };

  const getNumMessageListeners = () => messageListeners.length;

  const getBadge = () => badge;

  const getOpenTabs = () => openTabs;

  const closeWindows = () => {
    openWindows = [];
  };

  const getIcon = () => currentIcon;

  const getCreatedMenus = () => createdMenus;

  const getCheckedMenus = () => checkedMenus;

  return {
    // "Real" objects
    extension,
    notifications,
    runtime,
    storage,
    tabs,
    windows,
    browserAction,
    idle,
    contextMenus,

    // Testing helpers
    sendRuntimeMessage,
    getStorage,
    getLocalStorage,
    getNumMessageListeners,
    getCurrentNotifications,
    clickNotification,
    closeNotification,
    closeWindows,
    clickIcon,
    getBadge,
    getOpenTabs,
    getIcon,
    stateChanged,
    getCreatedMenus,
    getCheckedMenus,
  };
};
