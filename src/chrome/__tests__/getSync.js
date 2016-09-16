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
});
