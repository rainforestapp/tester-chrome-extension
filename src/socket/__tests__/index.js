/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import chai, { expect } from 'chai';
import { mockSocket } from '../__mocks__';
import { createStore } from 'redux';
import { authenticate, updateWorkerState, setPollUrl, iconClicked } from '../../actions';
import pluginApp from '../../reducers';
import { startSocket } from '..';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

const auth = {
  workerUUID: 'abc123',
  socketAuth: {
    auth: 'SEKRETAUTH',
    sig: 'SEKRETSIG',
  },
};

const authenticatedSocket = (store, opts) => {
  store.dispatch(authenticate(auth));
  const socket = startSocket(store, mockSocket(Object.assign(opts, { joinReply: 'ok' })));

  return socket;
};

describe('startSocket', function() {
  describe('with no authentication', function() {
    it('does not connect to the socket', function() {
      const store = createStore(pluginApp);
      const socket = startSocket(store, mockSocket()).getSocket();
      expect(socket).to.be.null;
    });

    it('sets the store state to unauthenticated', function() {
      const store = createStore(pluginApp);
      startSocket(store, mockSocket());
      expect(store.getState().socket.get('state')).to.equal('unauthenticated');
    });
  });

  describe('with invalid authentication', function() {
    it('stays disconnected', function() {
      const store = createStore(pluginApp);
      store.dispatch(authenticate(auth));
      startSocket(store, mockSocket({ joinReply: 'error' }));

      expect(store.getState().socket.get('state')).to.equal('unauthenticated');
    });
  });

  describe('with valid authentication', function() {
    it('connects to the socket', function() {
      const store = createStore(pluginApp);
      const socket = authenticatedSocket(store, {});

      expect(socket.getSocket().endpoint).to.equal('ws://localhost:4000/socket');
      expect(socket.getSocket().channelName).to.equal('workers:abc123');
      expect(socket.getSocket().opts.params).to.eql(auth.socketAuth);
      expect(store.getState().socket.get('state')).to.equal('connected');
    });

    it('pushes the worker state to the server', function() {
      const store = createStore(pluginApp);
      store.dispatch(updateWorkerState('ready'));
      expect(store.getState().worker.get('state')).to.equal('ready');

      const pushCallback = sinon.spy();
      authenticatedSocket(store, { pushCallback });

      expect(pushCallback).to.have.been.calledWithExactly(
        'update_state', { worker_state: 'ready' }
      );
    });

    describe('when logged in as a different worker', function() {
      it('reconnects as a different worker', function() {
        const store = createStore(pluginApp);
        const socket = authenticatedSocket(store, {});
        const newAuth = {
          workerUUID: 'newworker',
          socketAuth: {
            auth: 'SEKRETAUTH',
            sig: 'SEKRETSIG',
          },
        };

        store.dispatch(authenticate(newAuth));

        expect(socket.getSocket().channelName).to.equal('workers:newworker');
      });
    });

    describe('when reconnecting after being kicked off', function() {
      it('reconnectes', function() {
        const store = createStore(pluginApp);
        const socket = authenticatedSocket(store, {});
        const channel = socket.getSocket().testChannel;

        channel.serverPush('leave', {});

        store.dispatch(iconClicked());

        expect(store.getState().socket.get('state')).to.equal('connected');
        expect(socket.getSocket().testChannel.getState()).to.equal('connected');
      });
    });
  });

  describe('authenticating after the plugin starts', function() {
    it('connects to the socket after authentication', function() {
      const store = createStore(pluginApp);
      const socket = startSocket(store, mockSocket({ joinReply: 'ok' }));

      expect(store.getState().socket.get('state')).to.equal('unauthenticated');

      store.dispatch(authenticate(auth));

      expect(socket.getSocket()).to.not.be.null;

      expect(store.getState().socket.get('state')).to.equal('connected');
    });
  });

  describe('setting the plugin version', function() {
    it('dispatches to the store', function() {
      const store = createStore(pluginApp);
      const channel = authenticatedSocket(store, {}).getSocket().testChannel;

      channel.serverPush('check_version', { version: 'v1' });

      expect(store.getState().plugin.get('version')).to.equal('v1');
    });
  });

  describe('updating the worker state', function() {
    it('sends a message to the channel if the state has changed', function() {
      const store = createStore(pluginApp);
      expect(store.getState().worker.get('state')).to.equal('inactive');

      const pushCallback = sinon.spy();
      authenticatedSocket(store, { pushCallback });

      store.dispatch(updateWorkerState('ready'));
      store.dispatch(updateWorkerState('ready'));
      store.dispatch(updateWorkerState('inactive'));
      store.dispatch(updateWorkerState('ready'));

      expect(pushCallback).to.have.callCount(4);
      ['inactive', 'ready', 'inactive', 'ready'].forEach((state, idx) => {
        expect(pushCallback.getCall(idx)).to.have.been.calledWithExactly(
          'update_state', { worker_state: state }
        );
      });
    });
  });

  it('starts polling when instructed', function() {
    const store = createStore(pluginApp);
    const socket = authenticatedSocket(store, {});
    const channel = socket.getSocket().testChannel;
    store.dispatch(setPollUrl('http://work.com'));

    channel.serverPush('start_polling', {});

    expect(store.getState().polling.get('error')).to.be.null;
    expect(store.getState().polling.get('polling')).to.be.true;
  });

  describe('receiving a leave instruction', function() {
    it('leaves the channel', function() {
      const store = createStore(pluginApp);
      store.dispatch(updateWorkerState('ready'));
      const socket = authenticatedSocket(store, {});
      const channel = socket.getSocket().testChannel;

      channel.serverPush('leave', {});

      expect(store.getState().socket.get('state')).to.equal('left');
      expect(channel.getState()).to.equal('disconnected');
    });
  });

  describe('receiving a reload instruction', function() {
    it('sets needsReload to true', function() {
      const store = createStore(pluginApp);
      const socket = authenticatedSocket(store, {});
      const channel = socket.getSocket().testChannel;

      channel.serverPush('reload', {});

      expect(store.getState().plugin.get('needsReload')).to.be.true;
    });
  });

  describe('receiving a work assignment', function() {
    describe('when the worker is ready', function() {
      it('sets the worker state and work URL accordingly', function() {
        const store = createStore(pluginApp);
        store.dispatch(updateWorkerState('ready'));
        const socket = authenticatedSocket(store, {});
        const channel = socket.getSocket().testChannel;
        const workUrl = 'http://example.com';

        channel.serverPush('assign_work', { url: workUrl });

        expect(store.getState().worker.get('state')).to.equal('working');
        expect(store.getState().worker.get('workUrl')).to.equal(workUrl);
      });
    });

    describe('when the worker is not ready', function() {
      it('replies that the worker is not ready', function() {
        const store = createStore(pluginApp);
        const pushCallback = sinon.spy();
        const socket = authenticatedSocket(store, { pushCallback });
        const channel = socket.getSocket().testChannel;

        channel.serverPush('assign_work', { url: 'foobar.com' });

        expect(store.getState().worker.get('state')).to.equal('inactive');
        expect(store.getState().worker.get('workUrl')).to.be.null;
        expect(pushCallback).to.have.been.calledWithExactly(
          'work_rejected',
          { reason: 'invalid_worker_state', worker_state: 'inactive' }
        );
      });
    });
  });

  describe('when the work is finished', function() {
    it('updates the worker state to ready', function() {
      const store = createStore(pluginApp);
      store.dispatch(updateWorkerState('working'));
      const socket = authenticatedSocket(store, {});
      const channel = socket.getSocket().testChannel;

      channel.serverPush('work_finished', {});

      expect(store.getState().worker.get('state')).to.equal('ready');
    });
  });
});
