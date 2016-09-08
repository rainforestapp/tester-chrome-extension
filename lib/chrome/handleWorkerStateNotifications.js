'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _notifications = require('./notifications');

var _constants = require('../constants');

var _actions = require('../actions');

var _listenStoreChanges = require('../listenStoreChanges');

var _listenStoreChanges2 = _interopRequireDefault(_listenStoreChanges);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handleWorkerStateNotifications = function handleWorkerStateNotifications(store, chrome) {
  var shouldSendAuthNotifications = function shouldSendAuthNotifications(_ref, _ref2) {
    var prevSocket = _ref.socket;
    var prevWorker = _ref.worker;
    var curSocket = _ref2.socket;
    var curWorker = _ref2.worker;
    return curSocket.get('state') === 'unauthenticated' && (prevSocket.get('state') !== 'unauthenticated' || curWorker.get('state') === 'ready' && prevWorker.get('state') !== 'ready');
  };

  var handleAuthNotification = function handleAuthNotification(previousState, currentState) {
    if (shouldSendAuthNotifications(previousState, currentState)) {
      chrome.notifications.create(_notifications.notLoggedIn, _notifications.notifications[_notifications.notLoggedIn]);
      store.dispatch((0, _actions.updateWorkerState)('inactive'));
    } else if (currentState.socket.get('state') === 'connected') {
      chrome.notifications.clear(_notifications.notLoggedIn);
    }
  };

  var handleUpdate = function handleUpdate(previousState, currentState) {
    handleAuthNotification(previousState, currentState);
  };

  chrome.notifications.onClicked.addListener(function (notificationId) {
    switch (notificationId) {
      case _notifications.notLoggedIn:
        chrome.tabs.create({ url: _constants.CONFIG.profileUrl });
        return;
      default:
    }
  });

  (0, _listenStoreChanges2.default)(store, handleUpdate);
};

exports.default = handleWorkerStateNotifications;