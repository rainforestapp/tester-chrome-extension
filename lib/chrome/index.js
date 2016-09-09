'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startChromePlugin = undefined;

var _constants = require('../constants');

var _phoenix = require('phoenix');

var _ = require('..');

var _actions = require('../actions');

var _listenAuth = require('./listenAuth');

var _listenAuth2 = _interopRequireDefault(_listenAuth);

var _handleWorkerStateNotifications = require('./handleWorkerStateNotifications');

var _handleWorkerStateNotifications2 = _interopRequireDefault(_handleWorkerStateNotifications);

var _handleWork = require('./handleWork');

var _handleWork2 = _interopRequireDefault(_handleWork);

var _handleStateSaving = require('./handleStateSaving');

var _handleStateSaving2 = _interopRequireDefault(_handleStateSaving);

var _renderIcon = require('./renderIcon');

var _renderIcon2 = _interopRequireDefault(_renderIcon);

var _startIdleChecking = require('./startIdleChecking');

var _startIdleChecking2 = _interopRequireDefault(_startIdleChecking);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-console */
var startChromePlugin = exports.startChromePlugin = function startChromePlugin(auth, pollUrl, chrome, enhancer) {
  var socketConstructor = arguments.length <= 4 || arguments[4] === undefined ? _phoenix.Socket : arguments[4];

  var reloader = function reloader() {
    return window.location.reload(true);
  };
  var plugin = (0, _.startPlugin)({ auth: auth, pollUrl: pollUrl, enhancer: enhancer, reloader: reloader, socketConstructor: socketConstructor });
  var store = plugin.getStore();

  var getStore = function getStore() {
    return store;
  };

  var getUserInfo = function getUserInfo() {
    chrome.identity.getProfileUserInfo(function (data) {
      store.dispatch((0, _actions.setWorkerProfile)(data));
    });
  };

  (0, _handleStateSaving2.default)(store, chrome);
  (0, _listenAuth2.default)(store, chrome);
  (0, _handleWorkerStateNotifications2.default)(store, chrome);
  (0, _renderIcon2.default)(store, chrome);
  (0, _handleWork2.default)(store, chrome);
  (0, _startIdleChecking2.default)(store, chrome);
  getUserInfo();

  if (_constants.CONFIG.env === 'dev') {
    // redux dev tools don't work with the plugin, so we have a dumb
    // replacement.
    store.subscribe(function () {
      var state = store.getState();
      console.log('\n**STATE**');
      _constants.REDUCERS.forEach(function (reducer) {
        console.log(reducer + ': ', state[reducer].toJS());
      });
    });
  }

  return { getStore: getStore };
};