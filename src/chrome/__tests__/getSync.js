/*
  eslint-disable prefer-arrow-callback,
  func-names,
  space-before-function-paren,
  no-unused-expressions
*/
import pluginApp from '../../reducers';
import { mockChrome } from '../__mocks__/chrome';
import { createStore } from 'redux';
import { fromJS } from 'immutable';
import getSync from '../getSync';

describe('getSync', function() {
  it("sets the authentication if it's stored in sync", function(done) {
    const workerUUID = 'abc123';
    const socketAuth = {
      auth: 'SEKRET',
      sig: 'SIG',
    };
    const chrome = mockChrome({
      storage: {
        worker_uuid: workerUUID,
        websocket_auth: socketAuth,
      },
    });
    const store = createStore(pluginApp);

    let success = false;
    store.subscribe(() => {
      const { worker, socket } = store.getState();
      if (!success &&
          worker.get('uuid') === workerUUID &&
          socket.get('auth').equals(fromJS(socketAuth))) {
        success = true;
        done();
      }
    });

    getSync(store, chrome);
  });

  it("sets the poll URL if it's stored in sync", function(done) {
    const workerUUID = 'abc123';
    const storage = {
      worker_uuid: workerUUID,
      work_available_endpoint: 'http://work.com/',
    };
    const store = createStore(pluginApp);
    const chrome = mockChrome({ storage });

    let success = false;
    store.subscribe(() => {
      const { polling } = store.getState();
      if (!success && polling.get('pollUrl') === 'http://work.com/abc123/work_available') {
        success = true;
        done();
      }
    });

    getSync(store, chrome);
  });

  it("doesn't set the poll URL if it would be invalid", function(done) {
    const workerUUID = 'abc123';
    const storage = {
      worker_uuid: workerUUID,
      work_available_endpoint: '',
    };

    const store = createStore(pluginApp);
    const chrome = mockChrome({ storage });

    store.subscribe(() => {
      const { polling } = store.getState();
      if (polling.get('error')) {
        done(polling.get('error'));
      }
      if (polling.get('pollUrl')) {
        done(new Error(`pollUrl was set to ${polling.get('pollUrl')} but shouldn't have`));
      }
    });

    getSync(store, chrome);

    setTimeout(done, 50);
  });

  it("sets the options if they're stored in sync", function(done) {
    const options = { soundUrl: 'whiz' };
    const store = createStore(pluginApp);
    const chrome = mockChrome({ storage: { options } });

    let success = false;
    store.subscribe(() => {
      const { plugin } = store.getState();
      if (!success && plugin.get('options').equals(fromJS(options))) {
        success = true;
        done();
      }
    });

    getSync(store, chrome);
  });
});
