'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateWorkerState = exports.setWorkerProfile = exports.captchaRequired = exports.setPollUrl = exports.setPollingInterval = exports.stopPolling = exports.startPolling = exports.setPluginVersion = exports.workFinished = exports.iconClicked = exports.authFailed = exports.connectionClosed = exports.logMessage = exports.connect = exports.authenticate = exports.assignWork = undefined;

var _reduxActions = require('redux-actions');

var _constants = require('../constants');

var assignWork = exports.assignWork = (0, _reduxActions.createAction)(_constants.actions.ASSIGN_WORK);
var authenticate = exports.authenticate = (0, _reduxActions.createAction)(_constants.actions.AUTHENTICATE);
var connect = exports.connect = (0, _reduxActions.createAction)(_constants.actions.CONNECT);
var logMessage = exports.logMessage = (0, _reduxActions.createAction)(_constants.actions.LOG_MESSAGE);
var connectionClosed = exports.connectionClosed = (0, _reduxActions.createAction)(_constants.actions.CONNECTION_CLOSED);
var authFailed = exports.authFailed = (0, _reduxActions.createAction)(_constants.actions.AUTH_FAILED);
var iconClicked = exports.iconClicked = (0, _reduxActions.createAction)(_constants.actions.ICON_CLICKED);
var workFinished = exports.workFinished = (0, _reduxActions.createAction)(_constants.actions.WORK_FINISHED);
var setPluginVersion = exports.setPluginVersion = (0, _reduxActions.createAction)(_constants.actions.SET_PLUGIN_VERSION);
var startPolling = exports.startPolling = (0, _reduxActions.createAction)(_constants.actions.START_POLLING);
var stopPolling = exports.stopPolling = (0, _reduxActions.createAction)(_constants.actions.STOP_POLLING);
var setPollingInterval = exports.setPollingInterval = (0, _reduxActions.createAction)(_constants.actions.SET_POLLING_INTERVAL);
var setPollUrl = exports.setPollUrl = (0, _reduxActions.createAction)(_constants.actions.SET_POLL_URL);
var captchaRequired = exports.captchaRequired = (0, _reduxActions.createAction)(_constants.actions.CAPTCHA_REQUIRED);
var setWorkerProfile = exports.setWorkerProfile = (0, _reduxActions.createAction)(_constants.actions.SET_WORKER_PROFILE);

var validWorkerStates = ['ready', 'inactive', 'working'];

var updateWorkerState = exports.updateWorkerState = function updateWorkerState(state) {
  if (!validWorkerStates.includes(state)) {
    throw new Error('Unrecognized worker state: \'' + state + '\'');
  }

  return {
    type: _constants.actions.UPDATE_WORKER_STATE,
    payload: state
  };
};