'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _listenStoreChanges = require('./listenStoreChanges');

var _listenStoreChanges2 = _interopRequireDefault(_listenStoreChanges);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var startReloader = function startReloader(store, reloader) {
  var handleUpdate = function handleUpdate(_ref, _ref2) {
    var prevPlugin = _ref.plugin;
    var curPlugin = _ref2.plugin;

    if (prevPlugin.get('version') && curPlugin.get('version') !== prevPlugin.get('version')) {
      reloader();
    }
  };

  (0, _listenStoreChanges2.default)(store, handleUpdate);
};

exports.default = startReloader;