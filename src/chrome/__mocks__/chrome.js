export const mockChrome = (opts = {}) => {
  let storageStore = {};
  const messageListeners = [];
  const currentNotifications = {};
  const notificationListeners = [];
  const iconClickedListeners = [];
  const badge = { color: null, text: '' };
  const openTabs = [];
  let currentIcon;

  const addListener = (listener) => {
    messageListeners.push(listener);
  };

  if (opts.storage) {
    storageStore = opts.storage;
  } else {
    storageStore = {};
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
        storageStore = data;
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

  // Mock actions

  // sendRuntimeMessage mocks the chrome.runtime.sendMessage action.
  const sendRuntimeMessage = (msg, callback) => {
    messageListeners.forEach(listener => {
      listener(msg, {}, callback);
    });
  };

  // clickIcon simulates clicking the plugin icon
  const clickIcon = () => {
    iconClickedListeners.forEach(listener => listener());
  };

  // getStorage mocks chrome.storage.sync.get (it's synchronous to make testing
  // easier)
  const getStorage = () => storageStore;

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

    // Testing helpers
    sendRuntimeMessage,
    getStorage,
    getNumMessageListeners,
    getCurrentNotifications,
    clickNotification,
    clickIcon,
    getBadge,
    getOpenTabs,
    getIcon,
  };
};
