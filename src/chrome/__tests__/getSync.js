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
      const { worker, socket, polling } = store.getState();
      const expectedPollUrl = 'http://portal.rainforest.dev/api/1/testers/abc123/work_available';
      if (!success &&
          worker.get('uuid') === workerUUID &&
          socket.get('auth').equals(fromJS(socketAuth)) &&
          polling.get('pollUrl') === expectedPollUrl) {
        success = true;
        done();
      }
    });

    getSync(store, chrome);
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
