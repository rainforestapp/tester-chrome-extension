/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import { mockChrome } from '../__mocks__/chrome';
import { expect } from 'chai';
import handleStateSaving from '../handleStateSaving';
import { createStore } from 'redux';
import { updateWorkerState } from '../../actions';
import pluginApp from '../../reducers';

describe('handleStateSaving', function() {
  it("saves the worker state when it's updated", function() {
    const store = createStore(pluginApp);
    const chrome = mockChrome();

    handleStateSaving(store, chrome);

    store.dispatch(updateWorkerState('ready'));

    expect(chrome.getLocalStorage().workerState).to.equal('ready');
  });

  describe('when the state has been saved from before', function() {
    describe('when the worker was ready', function() {
      it('restores the state', function(done) {
        const store = createStore(pluginApp);
        const chrome = mockChrome({ localStorage: { workerState: 'ready' } });

        store.subscribe(() => {
          if (store.getState().worker.get('state') === 'ready') {
            done();
          }
        });

        handleStateSaving(store, chrome);
      });
    });

    describe('when the worker was working', function() {
      it("doesn't set the state", function(done) {
        const store = createStore(pluginApp);
        const chrome = mockChrome({ localStorage: { workerState: 'working' } });

        setTimeout(() => {
          const state = store.getState().worker.get('state');
          if (state === 'inactive') {
            done();
          } else {
            done(new Error(`worker should have been inactive but is ${state}`));
          }
        }, 20);

        handleStateSaving(store, chrome);
      });
    });
  });
});
