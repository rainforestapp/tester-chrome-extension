'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reducers = undefined;

var _redux = require('redux');

var _worker = require('./worker');

var _worker2 = _interopRequireDefault(_worker);

var _socket = require('./socket');

var _socket2 = _interopRequireDefault(_socket);

var _plugin = require('./plugin');

var _plugin2 = _interopRequireDefault(_plugin);

var _polling = require('./polling');

var _polling2 = _interopRequireDefault(_polling);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var reducers = exports.reducers = Object.freeze({
  worker: _worker2.default,
  socket: _socket2.default,
  plugin: _plugin2.default,
  polling: _polling2.default
});

var pluginApp = (0, _redux.combineReducers)(reducers);

exports.default = pluginApp;