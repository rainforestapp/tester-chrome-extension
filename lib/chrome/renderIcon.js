'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('../constants');

var _actions = require('../actions');

var renderIcon = function renderIcon(store, chrome) {
  var renderBadge = function renderBadge(_ref) {
    var worker = _ref.worker;

    var workerState = worker.get('state');

    switch (workerState) {
      case 'working':
        chrome.browserAction.setBadgeBackgroundColor({ color: _constants.colors.GREEN });
        chrome.browserAction.setBadgeText({ text: 'WORK' });
        break;
      default:
        chrome.browserAction.setBadgeText({ text: '' });
        break;
    }
  };

  var iconConfig = function iconConfig(_ref2) {
    var socket = _ref2.socket;
    var worker = _ref2.worker;

    if (socket.get('state') !== 'connected') {
      return _constants.CONFIG.chrome.greyIcon;
    }

    switch (worker.get('state')) {
      case 'inactive':
        return _constants.CONFIG.chrome.greyIcon;
      case 'ready':
        return _constants.CONFIG.chrome.colorIcon;
      case 'working':
        return worker.get('wantsMoreWork') ? _constants.CONFIG.chrome.colorIcon : _constants.CONFIG.chrome.greyIcon;
      default:
        return _constants.CONFIG.chrome.greyIcon;
    }
  };

  var renderIconImage = function renderIconImage(state) {
    chrome.browserAction.setIcon(Object.assign({}, iconConfig(state)));
  };

  var render = function render(state) {
    renderBadge(state);
    renderIconImage(state);
  };

  render(store.getState());

  store.subscribe(function () {
    render(store.getState());
  });

  chrome.browserAction.onClicked.addListener(function () {
    return store.dispatch((0, _actions.iconClicked)());
  });
};

exports.default = renderIcon;