'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; // This file is auto-required for main.js to bootstrap the JS loading process.


require('babel-polyfill');

var _chrome = require('./chrome');

var inChromePlugin = function inChromePlugin() {
  return _typeof(window.chrome) === 'object' && document.querySelector('div#tester-chrome-extension') !== null;
};

var dataKeys = ['worker_uuid', 'websocket_auth', 'work_available_endpoint'];

window.onload = function () {
  if (inChromePlugin()) {
    window.chrome.storage.sync.get(dataKeys, function (data) {
      var auth = null;
      if (data.hasOwnProperty('worker_uuid') && data.hasOwnProperty('websocket_auth')) {
        auth = { workerUUID: data.worker_uuid, socketAuth: data.websocket_auth };
      }

      var pollUrl = null;
      if (data.hasOwnProperty('work_available_endpoint') && data.hasOwnProperty('worker_uuid')) {
        pollUrl = '' + data.work_available_endpoint + data.worker_uuid + '/work_available';
      }
      window.plugin = (0, _chrome.startChromePlugin)(auth, pollUrl, window.chrome);
    });
  }
};