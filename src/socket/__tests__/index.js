/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import chai, { expect } from 'chai';
import { mockSocket } from '../__mocks__';
import { createStore } from 'redux';
import { authenticate, updateWorkerState, iconClicked } from '../../actions';
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

const channelName = 'workers:abc123';

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
      expect(Object.keys(socket.getSocket().testChannels))
        .to.eql(['workers:abc123', 'workers:lobby']);
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

        expect(Object.keys(socket.getSocket().testChannels))
          .to.eql(['workers:newworker', 'workers:lobby']);
      });
    });

    describe('when reconnecting after being kicked off', function() {
      it('reconnectes', function() {
        const store = createStore(pluginApp);
        const socket = authenticatedSocket(store, {});
        const channel = socket.getSocket().testChannels[channelName];

        channel.serverPush('leave', {});

        store.dispatch(iconClicked());

        expect(store.getState().socket.get('state')).to.equal('connected');
        expect(socket.getSocket().testChannels[channelName].getState()).to.equal('connected');
      });
    });

    describe('reconnecting after having been disconnected for a while', function() {
      it('makes a new connection', function() {
        const clock = sinon.useFakeTimers();
        clock.tick(1200); // some non-important non-0 time
        const store = createStore(pluginApp);
        const socketHandler = authenticatedSocket(store, {});
        let socket = socketHandler.getSocket();

        socket.serverDisconnect();
        expect(socket.disconnected).to.be.true;
        expect(store.getState().socket.get('state')).to.eq('unconnected');

        clock.tick(1000);
        store.dispatch(iconClicked());

        socket = socketHandler.getSocket();
        expect(socket.disconnected).to.be.true;

        clock.tick(60000);
        store.dispatch(iconClicked());

        socket = socketHandler.getSocket();
        expect(socket.disconnected).to.be.false;
        expect(store.getState().socket.get('state')).to.eq('connected');
        clock.restore();
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
      const channel = authenticatedSocket(store, {}).getSocket().testChannels[channelName];

      channel.serverPush('check_version', { version: 'v1' });

      expect(store.getState().plugin.get('version')).to.equal('v1');
    });
  });

  describe('checking plugin state', function() {
    it('dispatches to the store', function() {
      const store = createStore(pluginApp);
      const channel = authenticatedSocket(store, {}).getSocket().testChannels[channelName];

      channel.serverPush('check_state', { worker_state: 'working' });

      expect(store.getState().worker.get('state')).to.equal('working');
    });

    it("signals the state if it's different from what's on the server", function() {
      const store = createStore(pluginApp);
      const pushCallback = sinon.spy();
      const channel = authenticatedSocket(store, { pushCallback })
            .getSocket().testChannels[channelName];
      store.dispatch(updateWorkerState('ready'));

      pushCallback.reset();

      channel.serverPush('check_state', { worker_state: 'inactive' });
      expect(pushCallback).to.have.been.calledWithExactly(
        'update_state', { worker_state: 'ready' }
      );
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

    describe('when the worker is ready on another computer', function() {
      it('makes the worker inactive and makes a notification', function() {
        const store = createStore(pluginApp);
        const channel = authenticatedSocket(store, {}).getSocket().testChannels[channelName];

        store.dispatch(updateWorkerState('ready'));
        // simulate reply
        channel.serverPush('already_ready');

        const { worker, notifications } = store.getState();
        expect(worker.get('state')).to.equal('inactive');
        expect(notifications.get('activeNotifications').includes('doubleReady')).to.be.true;
      });
    });
  });

  describe('receiving a leave instruction', function() {
    it('leaves the channel and disconnects', function() {
      const store = createStore(pluginApp);
      store.dispatch(updateWorkerState('ready'));
      const socket = authenticatedSocket(store, {});
      const channel = socket.getSocket().testChannels[channelName];

      channel.serverPush('leave', {});

      expect(store.getState().socket.get('state')).to.equal('left');
      expect(channel.getState()).to.equal('disconnected');
      expect(socket.getSocket().disconnected).to.be.true;
    });
  });

  describe('receiving a reload instruction', function() {
    it('sets needsReload to true', function() {
      const store = createStore(pluginApp);
      const socket = authenticatedSocket(store, {});
      const channel = socket.getSocket().testChannels[channelName];

      channel.serverPush('reload', {});

      expect(store.getState().plugin.get('needsReload')).to.be.true;
    });
  });

  describe('receiving a reload instruction from the lobby channel', function() {
    it('sets needsReload to true', function() {
      const store = createStore(pluginApp);
      const socket = authenticatedSocket(store, {});
      const channel = socket.getSocket().testChannels['workers:lobby'];

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
        const channel = socket.getSocket().testChannels[channelName];
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
        const channel = socket.getSocket().testChannels[channelName];

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
      const channel = socket.getSocket().testChannels[channelName];

      channel.serverPush('work_finished', {});

      expect(store.getState().worker.get('state')).to.equal('ready');
    });
  });
});
