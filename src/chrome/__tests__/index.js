/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import { startChromePlugin } from '..';
import { mockChrome } from '../__mocks__/chrome';
import { mockSocket } from '../../socket/__mocks__';
import { expect } from 'chai';
import { fromJS } from 'immutable';

describe('startChromePlugin', function() {
  it('listens for authentication', function() {
    const chrome = mockChrome();
    startChromePlugin(null, null, chrome, mockSocket());
    expect(chrome.getNumMessageListeners());
  });

  describe('when the user is unauthenticated', function() {
    it('marks the socket as unauthenticated', function() {
      const chrome = mockChrome();
      const plugin = startChromePlugin(null, null, chrome, mockSocket());
      const store = plugin.getStore();
      expect(store.getState().socket.get('state')).to.equal('unauthenticated');
    });
  });

  describe('when the user is already authenticated', function() {
    it('authenticates and connects', function() {
      const auth = {
        workerUUID: 'abc123',
        socketAuth: {
          auth: 'SEKRET',
          sig: 'SIG',
        },
      };
      const chrome = mockChrome({ storage: { websocket_auth: auth } });
      const socketConstructor = mockSocket({ joinReply: 'ok' });

      const plugin = startChromePlugin(auth, null, chrome, socketConstructor);
      const store = plugin.getStore();

      expect(store.getState().socket.get('state')).to.equal('connected');
    });
  });

  describe('when the poll url is specified', function() {
    it('sets the poll url', function() {
      const chrome = mockChrome();
      const url = 'http://www.work.com';

      const plugin = startChromePlugin(null, url, chrome);
      const store = plugin.getStore();

      expect(store.getState().polling.get('pollUrl')).to.equal(url);
    });
  });

  it("sets the worker's user profile", function(done) {
    const profileUserInfo = { email: 'bob@example.com', id: 'abc123' };
    const chrome = mockChrome({ profileUserInfo });

    const plugin = startChromePlugin(null, null, chrome);
    const store = plugin.getStore();

    store.subscribe(() => {
      const profile = store.getState().worker.get('profileInfo');
      if (profile && profile.equals(fromJS(profileUserInfo))) {
        done();
      }
    });
  });
});
