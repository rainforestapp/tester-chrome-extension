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
  const workerUUID = 'abc123';
  const socketAuth = {
    auth: 'SEKRET',
    sig: 'SIG',
  };

  it("sets the authentication if it's stored in sync", function() {
    const chrome = mockChrome({
      storage: {
        worker_uuid: workerUUID,
        websocket_auth: socketAuth,
      },
    });
    const store = createStore(pluginApp);

    return new Promise((resolve, reject) => {
      getSync(store, chrome).then(() => {
        const { worker, socket, polling } = store.getState();
        const expectedPollUrl = 'http://portal.rainforest.dev/api/1/testers/abc123/work_available';
        if (worker.get('uuid') !== workerUUID) {
          reject(new Error(`UUID should have been ${workerUUID} but was ${worker.get('uuid')}`));
        }
        if (!socket.get('auth').equals(fromJS(socketAuth))) {
          reject(new Error('socketAuth not set correctly'));
        }
        if (polling.get('pollUrl') !== expectedPollUrl) {
          reject(new Error(
            `pollUrl should have been set to ${expectedPollUrl} but was ${polling.get('pollUrl')}`
          ));
        }
        resolve();
      });
    });
  });

  it("sets the options if they're stored in sync", function() {
    const options = { soundUrl: 'whiz' };
    const store = createStore(pluginApp);
    const chrome = mockChrome({ storage: { options } });

    return new Promise((resolve, reject) => {
      getSync(store, chrome).then(() => {
        const { plugin } = store.getState();
        if (!plugin.get('options').equals(fromJS(options))) {
          reject(new Error('Plugin options set incorrectly'));
        }
        resolve();
      });
    });
  });
});
