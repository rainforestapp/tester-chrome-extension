'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startSocket = undefined;

var _phoenix = require('phoenix');

var _listenStoreChanges = require('../listenStoreChanges');

var _listenStoreChanges2 = _interopRequireDefault(_listenStoreChanges);

var _constants = require('../constants');

var _actions = require('../actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var startSocket = exports.startSocket = function startSocket(store) {
  var socketConstructor = arguments.length <= 1 || arguments[1] === undefined ? _phoenix.Socket : arguments[1];

  var socket = null;
  var channel = null;

  var pushWorkerState = function pushWorkerState(state) {
    if (!channel) {
      // Channel hasn't been joined, but it's OK.
      return;
    }

    channel.push('update_state', { worker_state: state });
  };

  var workerState = function workerState() {
    return store.getState().worker.get('state');
  };

  var handleAssignWork = function handleAssignWork(payload) {
    if (workerState() === 'ready') {
      store.dispatch((0, _actions.assignWork)(payload));
    } else {
      channel.push('work_rejected', { reason: 'invalid_worker_state', worker_state: workerState() });
    }
  };

  var handleWorkFinished = function handleWorkFinished() {
    store.dispatch((0, _actions.workFinished)());
  };

  var handleCheckVersion = function handleCheckVersion(_ref) {
    var version = _ref.version;

    store.dispatch((0, _actions.setPluginVersion)(version));
  };

  var handleStartPolling = function handleStartPolling(payload) {
    store.dispatch((0, _actions.startPolling)(payload));
  };

  var connectToSocket = function connectToSocket(_ref2) {
    var socketState = _ref2.socket;
    var worker = _ref2.worker;

    var workerUUID = worker.get('uuid');
    var socketAuth = socketState.get('auth');
    var SocketConstructor = socketConstructor;

    socket = new SocketConstructor(_constants.CONFIG.socketURL, {
      params: socketAuth.toObject(),
      logger: function logger(kind, msg, data) {
        var payload = void 0;
        try {
          payload = JSON.stringify(data);
        } catch (ex) {
          if (ex instanceof TypeError) {
            payload = '<binary>';
          } else {
            throw ex;
          }
        }
        var log = kind + ': ' + msg + ' ' + payload;
        store.dispatch((0, _actions.logMessage)(log));
      }
    });
    socket.onClose(function () {
      return store.dispatch((0, _actions.connectionClosed)());
    });
    socket.connect();

    channel = socket.channel('workers:' + workerUUID);
    channel.on('assign_work', function (payload) {
      handleAssignWork(payload);
    });
    channel.on('work_finished', function (payload) {
      handleWorkFinished(payload);
    });
    channel.on('check_version', function (payload) {
      handleCheckVersion(payload);
    });
    channel.on('start_polling', function (payload) {
      handleStartPolling(payload);
    });
    channel.join().receive('ok', function (resp) {
      pushWorkerState(workerState());
      store.dispatch((0, _actions.connect)(resp));
    }).receive('error', function (resp) {
      return store.dispatch((0, _actions.authFailed)(resp));
    });
  };

  var reconnectSocket = function reconnectSocket(state) {
    if (!socket) {
      throw Error('reconnectSocket called without a current socket');
    }

    socket.disconnect();
    socket = null;
    connectToSocket(state);
  };

  var shouldConnect = function shouldConnect(_ref3) {
    var socketState = _ref3.socket;
    var worker = _ref3.worker;

    var currentState = socketState.get('state');
    return socket === null && socketState.get('auth') !== null && (currentState === 'unconnected' || currentState === 'unauthenticated') && worker.get('uuid') !== null;
  };

  var shouldReconnect = function shouldReconnect(_ref4, _ref5) {
    var prevWorker = _ref4.worker;
    var curWorker = _ref5.worker;

    var prevUUID = prevWorker.get('uuid');
    var curUUID = curWorker.get('uuid');

    return socket && prevUUID && curUUID && prevUUID !== curUUID;
  };

  var handleWorkerState = function handleWorkerState(previousState, currentState) {
    var oldState = previousState.worker.get('state');
    var newState = currentState.worker.get('state');

    if (oldState !== newState) {
      pushWorkerState(newState);
    }
  };

  var handleUpdate = function handleUpdate(previousState, currentState) {
    if (shouldConnect(currentState)) {
      connectToSocket(currentState);
    } else if (shouldReconnect(previousState, currentState)) {
      reconnectSocket(currentState);
    }
    handleWorkerState(previousState, currentState);
  };

  var getSocket = function getSocket() {
    return socket;
  };

  (0, _listenStoreChanges2.default)(store, handleUpdate);
  if (!store.getState().socket.get('auth')) {
    store.dispatch((0, _actions.authFailed)('No credentials'));
  }

  return {
    getSocket: getSocket
  };
};