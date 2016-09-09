'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _handleActions;

var _constants = require('../constants');

var _reduxActions = require('redux-actions');

var _immutable = require('immutable');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var initialState = (0, _immutable.fromJS)({
  state: 'unconnected',
  auth: null,
  messages: [],
  error: null
});

var authenticate = function authenticate(state, _ref) {
  var payload = _ref.payload;

  if (!payload || !payload.socketAuth) {
    var err = new Error('AUTHENTICATE called without necessary socketAuth parameter');
    return state.set('error', err);
  }

  return state.set('auth', (0, _immutable.fromJS)(payload.socketAuth));
};

var connect = function connect(state) {
  return state.set('state', 'connected');
};

var logMessage = function logMessage(state, _ref2) {
  var payload = _ref2.payload;
  return state.updateIn(['messages'], function (msgs) {
    return msgs.unshift(payload).take(20);
  });
};

var connectionClosed = function connectionClosed(state) {
  return state.set('state', 'unconnected');
};

var authFailed = function authFailed(state) {
  return state.set('state', 'unauthenticated');
};

var socket = (0, _reduxActions.handleActions)((_handleActions = {}, _defineProperty(_handleActions, _constants.actions.AUTHENTICATE, authenticate), _defineProperty(_handleActions, _constants.actions.CONNECT, connect), _defineProperty(_handleActions, _constants.actions.LOG_MESSAGE, logMessage), _defineProperty(_handleActions, _constants.actions.CONNECTION_CLOSED, connectionClosed), _defineProperty(_handleActions, _constants.actions.AUTH_FAILED, authFailed), _handleActions), initialState);

exports.default = socket;