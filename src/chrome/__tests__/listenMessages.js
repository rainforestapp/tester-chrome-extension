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
import { setPluginVersion, updateWorkerState } from '../../actions';
import pluginApp from '../../reducers';
import { fromJS } from 'immutable';
import buildContextMenus from '../buildContextMenus';
import { CONFIRM_WORK_ASSIGNMENT } from '../../constants';

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

    it('stores the data in the chrome sync storage', function() {
      const store = createStore(pluginApp);
      const chrome = mockChrome();
      listenMessages(store, chrome);

      sendAuth(chrome, () => {});

      const storage = chrome.getStorage();
      expect(storage.worker_uuid).to.equal('abc123');
      expect(storage.websocket_auth).to.equal(auth);
    });

    it('responds with plugin information', function(done) {
      const store = createStore(pluginApp);
      store.dispatch(setPluginVersion('12345'));
      const chrome = mockChrome();
      listenMessages(store, chrome);

      sendAuth(chrome, resp => {
        if (resp.status === 'ok' &&
            resp.plugin.version === '12345') {
          done();
        }
      });
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

    describe('with a SET_OPTIONS message', function() {
      const url = 'http://example.com/beep.ogg';

      const storeWithOptions = () => {
        const store = createStore(pluginApp);
        const chrome = mockChrome();

        listenMessages(store, chrome);

        chrome.sendRuntimeMessage({
          type: 'SET_OPTIONS',
          payload: { notificationSoundUrl: url },
        });

        return { store, chrome };
      };

      it('sets options', function() {
        const { store } = storeWithOptions();
        expect(store.getState().plugin.get('options'))
          .to.equal(fromJS({ notificationSoundUrl: url }));
      });

      it('saves the settings in sync storage', function() {
        const { chrome } = storeWithOptions();
        const storage = chrome.getStorage();

        expect(storage.options).to.deep.equal({ notificationSoundUrl: url });
      });

      it('merges options correctly', function() {
        const store = createStore(pluginApp);
        const chrome = mockChrome();

        listenMessages(store, chrome);

        chrome.sendRuntimeMessage({
          type: 'SET_OPTIONS',
          payload: { foo: 'bar' },
        });

        chrome.sendRuntimeMessage({
          type: 'SET_OPTIONS',
          payload: { baz: 'qux' },
        });

        expect(chrome.getStorage().options).to.deep.equal({
          foo: 'bar',
          baz: 'qux',
        });

        expect(store.getState().plugin.get('options')).to.equal(fromJS({
          foo: 'bar',
          baz: 'qux',
        }));
      });

      it('updates context menus', function() {
        const store = createStore(pluginApp);
        const chrome = mockChrome();

        buildContextMenus(store, chrome);
        expect(chrome.getCheckedMenus().length).to.equal(0);

        listenMessages(store, chrome);

        chrome.sendRuntimeMessage({
          type: 'SET_OPTIONS',
          payload: { [CONFIRM_WORK_ASSIGNMENT]: true },
        });

        expect(chrome.getCheckedMenus().length).to.equal(1);
        expect(chrome.getCheckedMenus()[0].title).to.equal('Yes');
      });
    });

    describe('with a PING message', function() {
      it('sends a generic response', function(done) {
        const store = createStore(pluginApp);
        const chrome = mockChrome();
        store.dispatch(setPluginVersion('12345'));

        listenMessages(store, chrome);

        chrome.sendRuntimeMessage({ type: 'PING' }, resp => {
          if (resp.status === 'ok' &&
              resp.plugin.version === '12345') {
            done();
          }
        });
      });
    });
  });
});
