'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('../constants');

var _actions = require('../actions');

var _notifications = require('./notifications');

var renderIcon = function renderIcon(store, chrome) {
  var renderBadge = function renderBadge(_ref) {
    var worker = _ref.worker;

    var workerState = worker.get('state');

    switch (workerState) {
      case 'inactive':
        chrome.browserAction.setBadgeBackgroundColor({ color: _constants.colors.RED });
        chrome.browserAction.setBadgeText({ text: 'OFF' });
        break;
      case 'working':
        chrome.browserAction.setBadgeBackgroundColor({ color: _constants.colors.GREEN });
        chrome.browserAction.setBadgeText({ text: 'YES' });
        break;
      case 'ready':
        chrome.browserAction.setBadgeText({ text: '' });
        break;
      default:
        throw new Error('unrecognized worker state: ' + workerState);
    }
  };

  var renderIconImage = function renderIconImage(_ref2) {
    var socket = _ref2.socket;

    var icon = void 0;
    if (socket.get('state') === 'connected') {
      icon = Object.assign({}, _constants.CONFIG.chrome.colorIcon);
    } else {
      icon = Object.assign({}, _constants.CONFIG.chrome.greyIcon);
    }
    chrome.browserAction.setIcon(icon);
  };

  var handleClick = function handleClick() {
    var workerState = store.getState().worker.get('state');
    if (workerState === 'working') {
      var notificationDuration = 3000;
      chrome.notifications.create(_notifications.alreadyWorking, _notifications.notifications[_notifications.alreadyWorking]);
      window.setTimeout(function () {
        return chrome.notifications.clear(_notifications.alreadyWorking);
      }, notificationDuration);
    } else {
      store.dispatch((0, _actions.iconClicked)(store.getState().worker.get('state')));
    }
  };

  var render = function render(state) {
    renderBadge(state);
    renderIconImage(state);
  };

  render(store.getState());

  store.subscribe(function () {
    render(store.getState());
  });

  chrome.browserAction.onClicked.addListener(handleClick);
};

exports.default = renderIcon;