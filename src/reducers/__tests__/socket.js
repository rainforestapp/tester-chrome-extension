/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import chai, { expect } from 'chai';
import chaiImmutable from 'chai-immutable';
import { fromJS } from 'immutable';
import {
  authenticate,
  connect,
  logMessage,
  connectionClosed,
  authFailed,
} from '../../actions';
import socket from '../socket';
import { actions } from '../../constants';

chai.use(chaiImmutable);

const checkState = (state) => {
  expect(state).to.have.keys(['state', 'auth', 'messages', 'error']);
};

const initState = socket(undefined, { type: 'INIT' });

describe('socket reducer', function() {
  it('starts with everything inactive', function() {
    const state = initState;
    checkState(state);
    expect(state.get('state')).to.equal('unconnected');
    expect(state.get('auth')).to.be.null;
  });

  describe(actions.AUTHENTICATE, function() {
    it("sets the authentication but doesn't connect", function() {
      const auth = {
        auth: 'SEKRET',
        sig: 'SIG',
      };
      const action = authenticate({
        workerUUID: 'abc123',
        socketAuth: auth,
      });

      const state = socket(undefined, action);
      checkState(state);
      expect(state.get('state')).to.equal('unconnected');
      expect(state.get('auth')).to.equal(fromJS(auth));
    });

    describe('when the payload is invalid', function() {
      it('updates the error', function() {
        const state = socket(undefined, authenticate({}));
        checkState(state);
        expect(state.get('auth')).to.be.null;
        expect(state.get('error')).to.be.an('error');
      });
    });
  });

  describe(actions.CONNECT, function() {
    it('sets the socket to be connected', function() {
      const action = connect();
      const state = socket(undefined, action);

      expect(state.get('state')).to.equal('connected');
    });
  });

  describe(actions.LOG_MESSAGE, function() {
    it('prepends the message to socket state, keeping up to 20 logs', function() {
      const msgs = [];
      for (let idx = 1; idx <= 30; idx++) {
        msgs.push(idx);
      }
      const state = msgs.reduce((acc, msg) => socket(acc, logMessage(msg)), initState);

      const loggedMessages = state.get('messages');
      expect(loggedMessages.count()).to.equal(20);
      expect(loggedMessages.slice(0, 5)).to.equal(fromJS([30, 29, 28, 27, 26]));
    });
  });

  describe(actions.CONNECTION_CLOSED, function() {
    it('sets the socket state to unconnected', function() {
      let state = initState;
      state = socket(state, connect());
      state = socket(state, connectionClosed());
      expect(state.get('state')).to.equal('unconnected');

      state = socket(state, connectionClosed());
      expect(state.get('state')).to.equal('unconnected');
    });
  });

  describe(actions.AUTH_FAILED, function() {
    it('marks the socket as unauthenticated', function() {
      const state = socket(initState, authFailed());
      expect(state.get('state')).to.equal('unauthenticated');
    });
  });
});
