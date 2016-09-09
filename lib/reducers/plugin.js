'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('../constants');

var _reduxActions = require('redux-actions');

var _immutable = require('immutable');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var initialState = (0, _immutable.fromJS)({
  version: null,
  error: null
});

var setPluginVersion = function setPluginVersion(state, _ref) {
  var payload = _ref.payload;
  return state.set('version', payload);
};

var plugin = (0, _reduxActions.handleActions)(_defineProperty({}, _constants.actions.SET_PLUGIN_VERSION, setPluginVersion), initialState);

exports.default = plugin;