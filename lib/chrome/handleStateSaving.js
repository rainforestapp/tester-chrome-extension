'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _actions = require('../actions');

var _listenStoreChanges = require('../listenStoreChanges');

var _listenStoreChanges2 = _interopRequireDefault(_listenStoreChanges);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handleStateSaving = function handleStateSaving(store, chrome) {
  chrome.storage.local.get(['workerState'], function (data) {
    if (data.workerState === 'ready') {
      store.dispatch((0, _actions.updateWorkerState)(data.workerState));
    }
  });

  var handleUpdate = function handleUpdate(_ref, _ref2) {
    var prevWorker = _ref.worker;
    var curWorker = _ref2.worker;

    if (prevWorker.get('state') !== curWorker.get('state')) {
      chrome.storage.local.set({ workerState: curWorker.get('state') });
    }
  };

  (0, _listenStoreChanges2.default)(store, handleUpdate);
};

exports.default = handleStateSaving;