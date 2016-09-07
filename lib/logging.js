'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logDebug = undefined;

var _constants = require('./constants');

var logDebug = exports.logDebug = function logDebug(msg) {
  if (_constants.CONFIG.env === 'dev') {
    console.log(msg);
  }
}; /* eslint-disable no-console */