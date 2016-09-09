'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _mocks__ = require('../__mocks__');

var _redux = require('redux');

var _actions = require('../../actions');

var _reducers = require('../../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _ = require('..');

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _sinonChai = require('sinon-chai');

var _sinonChai2 = _interopRequireDefault(_sinonChai);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
_chai2.default.use(_sinonChai2.default);

var auth = {
  workerUUID: 'abc123',
  socketAuth: {
    auth: 'SEKRETAUTH',
    sig: 'SEKRETSIG'
  }
};

var authenticatedSocket = function authenticatedSocket(store, opts) {
  store.dispatch((0, _actions.authenticate)(auth));
  var socket = (0, _.startSocket)(store, (0, _mocks__.mockSocket)(Object.assign(opts, { joinReply: 'ok' })));

  return socket;
};

describe('startSocket', function () {
  describe('with no authentication', function () {
    it('does not connect to the socket', function () {
      var store = (0, _redux.createStore)(_reducers2.default);
      var socket = (0, _.startSocket)(store, (0, _mocks__.mockSocket)()).getSocket();
      (0, _chai.expect)(socket).to.be.null;
    });

    it('sets the store state to unauthenticated', function () {
      var store = (0, _redux.createStore)(_reducers2.default);
      (0, _.startSocket)(store, (0, _mocks__.mockSocket)());
      (0, _chai.expect)(store.getState().socket.get('state')).to.equal('unauthenticated');
    });
  });

  describe('with invalid authentication', function () {
    it('stays disconnected', function () {
      var store = (0, _redux.createStore)(_reducers2.default);
      store.dispatch((0, _actions.authenticate)(auth));
      (0, _.startSocket)(store, (0, _mocks__.mockSocket)({ joinReply: 'error' }));

      (0, _chai.expect)(store.getState().socket.get('state')).to.equal('unauthenticated');
    });
  });

  describe('with valid authentication', function () {
    it('connects to the socket', function () {
      var store = (0, _redux.createStore)(_reducers2.default);
      var socket = authenticatedSocket(store, {});

      (0, _chai.expect)(socket.getSocket().endpoint).to.equal('ws://localhost:4000/socket');
      (0, _chai.expect)(socket.getSocket().channelName).to.equal('workers:abc123');
      (0, _chai.expect)(socket.getSocket().opts.params).to.eql(auth.socketAuth);
      (0, _chai.expect)(store.getState().socket.get('state')).to.equal('connected');
    });

    it('pushes the worker state to the server', function () {
      var store = (0, _redux.createStore)(_reducers2.default);
      store.dispatch((0, _actions.updateWorkerState)('ready'));
      (0, _chai.expect)(store.getState().worker.get('state')).to.equal('ready');

      var pushCallback = _sinon2.default.spy();
      authenticatedSocket(store, { pushCallback: pushCallback });

      (0, _chai.expect)(pushCallback).to.have.been.calledWithExactly('update_state', { worker_state: 'ready' });
    });

    describe('when logged in as a different worker', function () {
      it('reconnects as a different worker', function () {
        var store = (0, _redux.createStore)(_reducers2.default);
        var socket = authenticatedSocket(store, {});
        var newAuth = {
          workerUUID: 'newworker',
          socketAuth: {
            auth: 'SEKRETAUTH',
            sig: 'SEKRETSIG'
          }
        };

        store.dispatch((0, _actions.authenticate)(newAuth));

        (0, _chai.expect)(socket.getSocket().channelName).to.equal('workers:newworker');
      });
    });
  });

  describe('authenticating after the plugin starts', function () {
    it('connects to the socket after authentication', function () {
      var store = (0, _redux.createStore)(_reducers2.default);
      var socket = (0, _.startSocket)(store, (0, _mocks__.mockSocket)({ joinReply: 'ok' }));

      (0, _chai.expect)(store.getState().socket.get('state')).to.equal('unauthenticated');

      store.dispatch((0, _actions.authenticate)(auth));

      (0, _chai.expect)(socket.getSocket()).to.not.be.null;

      (0, _chai.expect)(store.getState().socket.get('state')).to.equal('connected');
    });
  });

  describe('setting the plugin version', function () {
    it('dispatches to the store', function () {
      var store = (0, _redux.createStore)(_reducers2.default);
      var channel = authenticatedSocket(store, {}).getSocket().testChannel;

      channel.serverPush('check_version', { version: 'v1' });

      (0, _chai.expect)(store.getState().plugin.get('version')).to.equal('v1');
    });
  });

  describe('updating the worker state', function () {
    it('sends a message to the channel if the state has changed', function () {
      var store = (0, _redux.createStore)(_reducers2.default);
      (0, _chai.expect)(store.getState().worker.get('state')).to.equal('inactive');

      var pushCallback = _sinon2.default.spy();
      authenticatedSocket(store, { pushCallback: pushCallback });

      store.dispatch((0, _actions.updateWorkerState)('ready'));
      store.dispatch((0, _actions.updateWorkerState)('ready'));
      store.dispatch((0, _actions.updateWorkerState)('inactive'));
      store.dispatch((0, _actions.updateWorkerState)('ready'));

      (0, _chai.expect)(pushCallback).to.have.callCount(4);
      ['inactive', 'ready', 'inactive', 'ready'].forEach(function (state, idx) {
        (0, _chai.expect)(pushCallback.getCall(idx)).to.have.been.calledWithExactly('update_state', { worker_state: state });
      });
    });
  });

  it('starts polling when instructed', function () {
    var store = (0, _redux.createStore)(_reducers2.default);
    var socket = authenticatedSocket(store, {});
    var channel = socket.getSocket().testChannel;
    store.dispatch((0, _actions.setPollUrl)('http://work.com'));

    channel.serverPush('start_polling', {});

    (0, _chai.expect)(store.getState().polling.get('error')).to.be.null;
    (0, _chai.expect)(store.getState().polling.get('polling')).to.be.true;
  });

  describe('receiving a work assignment', function () {
    describe('when the worker is ready', function () {
      it('sets the worker state and work URL accordingly', function () {
        var store = (0, _redux.createStore)(_reducers2.default);
        store.dispatch((0, _actions.updateWorkerState)('ready'));
        var socket = authenticatedSocket(store, {});
        var channel = socket.getSocket().testChannel;
        var workUrl = 'http://example.com';

        channel.serverPush('assign_work', { url: workUrl });

        (0, _chai.expect)(store.getState().worker.get('state')).to.equal('working');
        (0, _chai.expect)(store.getState().worker.get('workUrl')).to.equal(workUrl);
      });
    });

    describe('when the worker is not ready', function () {
      it('replies that the worker is not ready', function () {
        var store = (0, _redux.createStore)(_reducers2.default);
        var pushCallback = _sinon2.default.spy();
        var socket = authenticatedSocket(store, { pushCallback: pushCallback });
        var channel = socket.getSocket().testChannel;

        channel.serverPush('assign_work', { url: 'foobar.com' });

        (0, _chai.expect)(store.getState().worker.get('state')).to.equal('inactive');
        (0, _chai.expect)(store.getState().worker.get('workUrl')).to.be.null;
        (0, _chai.expect)(pushCallback).to.have.been.calledWithExactly('work_rejected', { reason: 'invalid_worker_state', worker_state: 'inactive' });
      });
    });
  });

  describe('when the work is finished', function () {
    it('updates the worker state to ready', function () {
      var store = (0, _redux.createStore)(_reducers2.default);
      store.dispatch((0, _actions.updateWorkerState)('working'));
      var socket = authenticatedSocket(store, {});
      var channel = socket.getSocket().testChannel;

      channel.serverPush('work_finished', {});

      (0, _chai.expect)(store.getState().worker.get('state')).to.equal('ready');
    });
  });
});