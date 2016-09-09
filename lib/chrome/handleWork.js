'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _listenStoreChanges = require('../listenStoreChanges');

var _listenStoreChanges2 = _interopRequireDefault(_listenStoreChanges);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handleWork = function handleWork(store, chrome) {
  var handleUpdate = function handleUpdate(_ref, _ref2) {
    var prevWorker = _ref.worker;
    var curWorker = _ref2.worker;

    if (prevWorker.get('state') !== 'working' && curWorker.get('state') === 'working') {
      var url = curWorker.get('workUrl');
      if (!url) {
        throw new Error("Worker moved to 'working' state without a work URL");
      }

      chrome.tabs.create({ url: url });
    }
  };

  (0, _listenStoreChanges2.default)(store, handleUpdate);
};

exports.default = handleWork;