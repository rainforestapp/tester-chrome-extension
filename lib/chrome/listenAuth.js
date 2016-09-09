'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _actions = require('../actions');

var listenAuth = function listenAuth(store, chrome) {
  chrome.runtime.onMessageExternal.addListener(function (_ref, sender, sendResponse) {
    var data = _ref.data;

    if (data && data.worker_uuid && data.websocket_auth) {
      var auth = {
        workerUUID: data.worker_uuid,
        socketAuth: data.websocket_auth
      };
      store.dispatch((0, _actions.authenticate)(auth));
      chrome.storage.sync.set({
        worker_uuid: auth.workerUUID,
        websocket_auth: auth.socketAuth
      });
    }

    if (data && data.work_available_endpoint) {
      store.dispatch((0, _actions.setPollUrl)(data.work_available_endpoint));
      chrome.storage.sync.set({
        work_available_endpoint: data.work_available_endpoint
      });
    }
    sendResponse();
  });
};

exports.default = listenAuth;