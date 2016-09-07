'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiImmutable = require('chai-immutable');

var _chaiImmutable2 = _interopRequireDefault(_chaiImmutable);

var _immutable = require('immutable');

var _actions = require('../../actions');

var _socket = require('../socket');

var _socket2 = _interopRequireDefault(_socket);

var _constants = require('../../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
_chai2.default.use(_chaiImmutable2.default);

var checkState = function checkState(state) {
  (0, _chai.expect)(state).to.have.keys(['state', 'auth', 'messages', 'error']);
};

var initState = (0, _socket2.default)(undefined, { type: 'INIT' });

describe('socket reducer', function () {
  it('starts with everything inactive', function () {
    var state = initState;
    checkState(state);
    (0, _chai.expect)(state.get('state')).to.equal('unconnected');
    (0, _chai.expect)(state.get('auth')).to.be.null;
  });

  describe(_constants.actions.AUTHENTICATE, function () {
    it("sets the authentication but doesn't connect", function () {
      var auth = {
        auth: 'SEKRET',
        sig: 'SIG'
      };
      var action = (0, _actions.authenticate)({
        workerUUID: 'abc123',
        socketAuth: auth
      });

      var state = (0, _socket2.default)(undefined, action);
      checkState(state);
      (0, _chai.expect)(state.get('state')).to.equal('unconnected');
      (0, _chai.expect)(state.get('auth')).to.equal((0, _immutable.fromJS)(auth));
    });

    describe('when the payload is invalid', function () {
      it('updates the error', function () {
        var state = (0, _socket2.default)(undefined, (0, _actions.authenticate)({}));
        checkState(state);
        (0, _chai.expect)(state.get('auth')).to.be.null;
        (0, _chai.expect)(state.get('error')).to.be.an('error');
      });
    });
  });

  describe(_constants.actions.CONNECT, function () {
    it('sets the socket to be connected', function () {
      var action = (0, _actions.connect)();
      var state = (0, _socket2.default)(undefined, action);

      (0, _chai.expect)(state.get('state')).to.equal('connected');
    });
  });

  describe(_constants.actions.LOG_MESSAGE, function () {
    it('prepends the message to socket state, keeping up to 20 logs', function () {
      var msgs = [];
      for (var idx = 1; idx <= 30; idx++) {
        msgs.push(idx);
      }
      var state = msgs.reduce(function (acc, msg) {
        return (0, _socket2.default)(acc, (0, _actions.logMessage)(msg));
      }, initState);

      var loggedMessages = state.get('messages');
      (0, _chai.expect)(loggedMessages.count()).to.equal(20);
      (0, _chai.expect)(loggedMessages.slice(0, 5)).to.equal((0, _immutable.fromJS)([30, 29, 28, 27, 26]));
    });
  });

  describe(_constants.actions.CONNECTION_CLOSED, function () {
    it('sets the socket state to unconnected', function () {
      var state = initState;
      state = (0, _socket2.default)(state, (0, _actions.connect)());
      state = (0, _socket2.default)(state, (0, _actions.connectionClosed)());
      (0, _chai.expect)(state.get('state')).to.equal('unconnected');

      state = (0, _socket2.default)(state, (0, _actions.connectionClosed)());
      (0, _chai.expect)(state.get('state')).to.equal('unconnected');
    });
  });

  describe(_constants.actions.AUTH_FAILED, function () {
    it('marks the socket as unauthenticated', function () {
      var state = (0, _socket2.default)(initState, (0, _actions.authFailed)());
      (0, _chai.expect)(state.get('state')).to.equal('unauthenticated');
    });
  });
});