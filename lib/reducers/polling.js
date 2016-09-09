'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _handleActions;

var _immutable = require('immutable');

var _reduxActions = require('redux-actions');

var _constants = require('../constants');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var initialState = (0, _immutable.fromJS)({
  polling: false,
  pollUrl: null,
  error: null,
  interval: _constants.DEFAULT_POLLING_INTERVAL,
  captchaRequired: false
});

var startPolling = function startPolling(state, _ref) {
  var payload = _ref.payload;

  if (payload && payload.url) {
    return state.merge({ polling: true, pollUrl: payload.url });
  }

  return state.set('polling', true);
};

var stopPolling = function stopPolling(state) {
  return state.set('polling', false);
};

var setPollingInterval = function setPollingInterval(state, _ref2) {
  var payload = _ref2.payload;

  if (typeof payload !== 'number') {
    return state.set('error', new Error('setPollingInterval called with an incorrect payload: ' + payload));
  }

  return state.set('interval', payload);
};

var setPollUrl = function setPollUrl(state, _ref3) {
  var payload = _ref3.payload;

  if (typeof payload !== 'string') {
    return state.set('error', new Error('setPollUrl called with an incorrect payload: ' + payload));
  }

  return state.set('pollUrl', payload);
};

var captchaRequired = function captchaRequired(state) {
  return state.set('captchaRequired', true);
};

// Seems as good a way to clear "captcha required" as any
var iconClicked = function iconClicked(state) {
  return state.set('captchaRequired', false);
};

var polling = (0, _reduxActions.handleActions)((_handleActions = {}, _defineProperty(_handleActions, _constants.actions.START_POLLING, startPolling), _defineProperty(_handleActions, _constants.actions.STOP_POLLING, stopPolling), _defineProperty(_handleActions, _constants.actions.SET_POLLING_INTERVAL, setPollingInterval), _defineProperty(_handleActions, _constants.actions.SET_POLL_URL, setPollUrl), _defineProperty(_handleActions, _constants.actions.ASSIGN_WORK, stopPolling), _defineProperty(_handleActions, _constants.actions.CAPTCHA_REQUIRED, captchaRequired), _defineProperty(_handleActions, _constants.actions.ICON_CLICKED, iconClicked), _handleActions), initialState);

exports.default = polling;