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
  state: 'inactive',
  // wantsMoreWork indicates that a working worker wants to continue to work
  // after the current job (it's only relevant for working workers).
  wantsMoreWork: false,
  uuid: null,
  workUrl: null,
  profileInfo: null,
  error: null
});

var authenticate = function authenticate(state, _ref) {
  var payload = _ref.payload;

  if (!payload || !payload.workerUUID) {
    var err = new Error('AUTHENTICATE called without workerUUID parameter');
    return state.set('error', err);
  }

  return state.set('uuid', payload.workerUUID);
};

var updateWorkerState = function updateWorkerState(state, _ref2) {
  var newState = _ref2.payload;

  if (newState === 'working') {
    return state.merge({ state: newState, wantsMoreWork: true });
  }

  return state.set('state', newState);
};

var assignWork = function assignWork(state, _ref3) {
  var url = _ref3.payload.url;

  var oldState = state.get('state');
  if (oldState !== 'ready') {
    var err = new Error('Cannot assign work to worker in state \'' + oldState + '\'');
    return state.set('error', err);
  }

  return state.merge({ state: 'working', wantsMoreWork: true, workUrl: url });
};

var workFinished = function workFinished(state) {
  if (state.get('state') === 'working') {
    var newState = state.get('wantsMoreWork') ? 'ready' : 'inactive';
    return state.merge({
      state: newState,
      workUrl: null,
      wantsMoreWork: false
    });
  }

  return state;
};

var iconClicked = function iconClicked(state) {
  switch (state.get('state')) {
    case 'ready':
      return state.set('state', 'inactive');
    case 'inactive':
      return state.set('state', 'ready');
    case 'working':
      return state.set('wantsMoreWork', !state.get('wantsMoreWork'));
    default:
      return state;
  }
};

var captchaRequired = function captchaRequired(state) {
  if (state.get('state') === 'working') {
    return state.set('err', new Error('Worker needs CAPTCHA but is working.'));
  }

  return state.set('state', 'inactive');
};

var setWorkerProfile = function setWorkerProfile(state, _ref4) {
  var payload = _ref4.payload;
  return state.set('profileInfo', (0, _immutable.fromJS)(payload));
};

var worker = (0, _reduxActions.handleActions)((_handleActions = {}, _defineProperty(_handleActions, _constants.actions.AUTHENTICATE, authenticate), _defineProperty(_handleActions, _constants.actions.UPDATE_WORKER_STATE, updateWorkerState), _defineProperty(_handleActions, _constants.actions.ASSIGN_WORK, assignWork), _defineProperty(_handleActions, _constants.actions.WORK_FINISHED, workFinished), _defineProperty(_handleActions, _constants.actions.ICON_CLICKED, iconClicked), _defineProperty(_handleActions, _constants.actions.CAPTCHA_REQUIRED, captchaRequired), _defineProperty(_handleActions, _constants.actions.SET_WORKER_PROFILE, setWorkerProfile), _handleActions), initialState);

exports.default = worker;