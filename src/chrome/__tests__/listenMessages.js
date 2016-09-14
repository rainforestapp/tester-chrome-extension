/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import listenMessages from '../listenMessages';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { mockChrome } from '../__mocks__/chrome';
import { createStore } from 'redux';
import { updateWorkerState } from '../../actions';
import pluginApp from '../../reducers';
import { fromJS } from 'immutable';

chai.use(sinonChai);

describe('listenMessages', function() {
  describe('when it receives a message from chrome', function() {
    const auth = { auth: 'foobar', sig: 'sig' };

    const sendAuth = (chrome, spy) => {
      chrome.sendRuntimeMessage({
        type: 'AUTHENTICATE',
        payload: {
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
      listenMessages(store, chrome);

      sendAuth(chrome, spy);

      expect(spy).to.have.been.called;
    });

    it('updates the plugin auth', function() {
      const store = createStore(pluginApp);
      const chrome = mockChrome();
      listenMessages(store, chrome);

      sendAuth(chrome, () => {});

      const state = store.getState();
      expect(state.worker.get('uuid')).to.equal('abc123');
      expect(state.socket.get('auth')).to.equal(fromJS(auth));
    });

    it('sets the polling endpoint', function() {
      const store = createStore(pluginApp);
      const chrome = mockChrome();
      listenMessages(store, chrome);

      sendAuth(chrome, () => {});

      expect(store.getState().polling.get('pollUrl')).to.equal('http://www.work.com/abc123/work_available');
    });

    it('stores the data in the chrome sync storage', function() {
      const store = createStore(pluginApp);
      const chrome = mockChrome();
      listenMessages(store, chrome);

      sendAuth(chrome, () => {});

      const storage = chrome.getStorage();
      expect(storage.worker_uuid).to.equal('abc123');
      expect(storage.websocket_auth).to.equal(auth);
      expect(storage.work_available_endpoint).to.equal('http://www.work.com/');
    });

    describe('with a message to clear work', function() {
      it('changes the worker state correctly', function() {
        const store = createStore(pluginApp);
        const chrome = mockChrome();
        store.dispatch(updateWorkerState('working'));

        listenMessages(store, chrome);

        chrome.sendRuntimeMessage({
          type: 'WORK_ERROR',
          payload: {
            error: 'Problem!',
          },
        });

        expect(store.getState().worker.get('state')).to.equal('ready');
      });
    });

    describe('with a WORK_STARTED message', function() {
      it('sets workStarted to true', function() {
        const store = createStore(pluginApp);
        const chrome = mockChrome();
        store.dispatch(updateWorkerState('working'));

        listenMessages(store, chrome);

        chrome.sendRuntimeMessage({
          type: 'WORK_STARTED',
        });

        expect(store.getState().worker.get('workStarted')).to.be.true;
      });
    });
  });
});
