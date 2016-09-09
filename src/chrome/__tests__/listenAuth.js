/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import listenAuth from '../listenAuth';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { mockChrome } from '../__mocks__/chrome';
import { createStore } from 'redux';
import pluginApp from '../../reducers';
import { fromJS } from 'immutable';

chai.use(sinonChai);

describe('listenAuth', function() {
  describe('when it receives a message from chrome', function() {
    const auth = { auth: 'foobar', sig: 'sig' };

    const sendAuth = (chrome, spy) => {
      chrome.sendRuntimeMessage({
        data: {
          worker_uuid: 'abc123',
          websocket_auth: auth,
          work_available_endpoint: 'http://www.work.com/',
        },
      }, spy);
    };

    it('triggers the "sent" callback', function() {
      const store = createStore(pluginApp);
      const chrome = mockChrome();
      const spy = sinon.spy();
      listenAuth(store, chrome);

      sendAuth(chrome, spy);

      expect(spy).to.have.been.called;
    });

    it('updates the plugin auth', function() {
      const store = createStore(pluginApp);
      const chrome = mockChrome();
      listenAuth(store, chrome);

      sendAuth(chrome, () => {});

      const state = store.getState();
      expect(state.worker.get('uuid')).to.equal('abc123');
      expect(state.socket.get('auth')).to.equal(fromJS(auth));
    });

    it('sets the polling endpoint', function() {
      const store = createStore(pluginApp);
      const chrome = mockChrome();
      listenAuth(store, chrome);

      sendAuth(chrome, () => {});

      expect(store.getState().polling.get('pollUrl')).to.equal('http://www.work.com/abc123/work_available');
    });

    it('stores the data in the chrome sync storage', function() {
      const store = createStore(pluginApp);
      const chrome = mockChrome();
      listenAuth(store, chrome);

      sendAuth(chrome, () => {});

      const storage = chrome.getStorage();
      expect(storage.worker_uuid).to.equal('abc123');
      expect(storage.websocket_auth).to.equal(auth);
      expect(storage.work_available_endpoint).to.equal('http://www.work.com/');
    });
  });
});
