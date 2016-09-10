'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('./constants');

var _ravenJs = require('raven-js');

var _ravenJs2 = _interopRequireDefault(_ravenJs);

var _listenStoreChanges = require('./listenStoreChanges');

var _listenStoreChanges2 = _interopRequireDefault(_listenStoreChanges);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var startErrorHandling = function startErrorHandling(store) {
  var raven = arguments.length <= 1 || arguments[1] === undefined ? _ravenJs2.default : arguments[1];
  var testing = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  if (!testing && _constants.CONFIG.env === 'test' || _constants.CONFIG.env === 'dev') {
    return;
  }

  raven.config(_constants.CONFIG.ravenURL).install();

  var checkUUID = function checkUUID(_ref, _ref2) {
    var prevWorker = _ref.worker;
    var curWorker = _ref2.worker;

    if (!prevWorker.get('uuid') && curWorker.get('uuid')) {
      raven.setUserContext({ uuid: curWorker.get('uuid') });
    }
  };

  var handleUpdate = function handleUpdate(previousState, currentState) {
    checkUUID(previousState, currentState);
    _constants.REDUCERS.forEach(function (reducer) {
      var prev = previousState[reducer];
      var cur = currentState[reducer];

      if (prev.get('error') !== cur.get('error')) {
        raven.captureException(cur.get('error'), {
          extra: {
            reducer: reducer,
            state: cur.toJS()
          }
        });
      }
    });
  };

  (0, _listenStoreChanges2.default)(store, handleUpdate);
};

exports.default = startErrorHandling;