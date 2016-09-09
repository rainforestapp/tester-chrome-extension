'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notifications = exports.captcha = exports.workerIdle = exports.notLoggedIn = undefined;

var _deepFreeze;

var _constants = require('../constants');

var _deepFreeze2 = require('deep-freeze');

var _deepFreeze3 = _interopRequireDefault(_deepFreeze2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var notLoggedIn = exports.notLoggedIn = 'notLoggedIn';
var workerIdle = exports.workerIdle = 'workerIdle';
var captcha = exports.captcha = 'captcha';

var notifications = exports.notifications = (0, _deepFreeze3.default)((_deepFreeze = {}, _defineProperty(_deepFreeze, notLoggedIn, {
  iconUrl: _constants.CONFIG.chrome.notificationIconUrl,
  isClickable: true,
  type: 'basic',
  title: "You're not logged in",
  message: "You don't seem to be logged in to Rainforest, click here to go to your profile and log in."
}), _defineProperty(_deepFreeze, workerIdle, {
  iconUrl: _constants.CONFIG.chrome.notificationIconUrl,
  isClickable: true,
  type: 'basic',
  title: 'We noticed you were idle',
  message: 'You seem to have been idle for a while, so we stopped ' + 'checking for work. Click here to start checking for work again.'
}), _defineProperty(_deepFreeze, captcha, {
  iconUrl: 'icons/icon_notification.png',
  isClickable: true,
  type: 'basic',
  title: 'There was a problem with the request',
  message: 'You may need to fill out a captcha. Click here to test the work endpoint. ' + 'Click the plugin icon to start polling for work again.'
}), _deepFreeze));