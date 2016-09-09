'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _actions = require('../actions');

var _notifications = require('./notifications');

var _listenStoreChanges = require('../listenStoreChanges');

var _listenStoreChanges2 = _interopRequireDefault(_listenStoreChanges);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var idlePeriod = 3 * 60;

var startIdleChecking = function startIdleChecking(store, chrome) {
  var goIdle = function goIdle() {
    if (store.getState().worker.get('state') !== 'ready') {
      return;
    }

    store.dispatch((0, _actions.updateWorkerState)('inactive'));
    chrome.notifications.create(_notifications.workerIdle, _notifications.notifications[_notifications.workerIdle]);
  };

  var handleUpdate = function handleUpdate(_previousState, currentState) {
    if (currentState.worker.get('state') === 'ready') {
      chrome.notifications.clear(_notifications.workerIdle);
    }
  };

  chrome.idle.setDetectionInterval(idlePeriod);

  chrome.idle.onStateChanged.addListener(function (state) {
    if (state === 'idle' || state === 'locked') {
      goIdle();
    }
  });

  chrome.notifications.onClicked.addListener(function (notificationId) {
    if (notificationId === _notifications.workerIdle) {
      store.dispatch((0, _actions.updateWorkerState)('ready'));
    }
  });

  (0, _listenStoreChanges2.default)(store, handleUpdate);
};

exports.default = startIdleChecking;