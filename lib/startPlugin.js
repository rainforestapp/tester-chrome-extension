'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reducers = require('./reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _socket = require('./socket');

var _startErrorHandling = require('./startErrorHandling');

var _startErrorHandling2 = _interopRequireDefault(_startErrorHandling);

var _startReloader = require('./startReloader');

var _startReloader2 = _interopRequireDefault(_startReloader);

var _handlePolling = require('./handlePolling');

var _handlePolling2 = _interopRequireDefault(_handlePolling);

var _actions = require('./actions');

var _redux = require('redux');

var _phoenix = require('phoenix');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var startPlugin = function startPlugin(_ref) {
  var auth = _ref.auth;
  var pollUrl = _ref.pollUrl;
  var enhancer = _ref.enhancer;
  var reloader = _ref.reloader;
  var _ref$socketConstructo = _ref.socketConstructor;
  var socketConstructor = _ref$socketConstructo === undefined ? _phoenix.Socket : _ref$socketConstructo;

  var store = (0, _redux.createStore)(_reducers2.default, enhancer);

  (0, _startErrorHandling2.default)(store);

  if (reloader) {
    (0, _startReloader2.default)(store, reloader);
  }

  if (auth) {
    store.dispatch((0, _actions.authenticate)(auth));
  }

  if (pollUrl) {
    store.dispatch((0, _actions.setPollUrl)(pollUrl));
  }

  (0, _socket.startSocket)(store, socketConstructor);
  (0, _handlePolling2.default)(store);

  var getStore = function getStore() {
    return store;
  };
  return { getStore: getStore };
};

exports.default = startPlugin;