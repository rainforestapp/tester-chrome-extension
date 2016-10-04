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
import { updateWorkerState, iconClicked } from '../../actions';
import pluginApp from '../../reducers';

describe('handleStateSaving', function() {
  it("saves the worker state when it's updated", function() {
    const store = createStore(pluginApp);
    const chrome = mockChrome();

    handleStateSaving(store, chrome);

    store.dispatch(updateWorkerState('ready'));

    expect(chrome.getLocalStorage().workerState).to.equal('ready');
  });

  it('saves as "ready" when the worker wants more work', function() {
    const store = createStore(pluginApp);
    const chrome = mockChrome();

    handleStateSaving(store, chrome);

    store.dispatch(updateWorkerState('working'));
    expect(chrome.getLocalStorage().workerState).to.equal('ready');

    store.dispatch(iconClicked()); // indicate worker doesn't want more work
    expect(chrome.getLocalStorage().workerState).to.equal('inactive');

    store.dispatch(iconClicked());
    expect(chrome.getLocalStorage().workerState).to.equal('ready');
  });

  describe('when the state has been saved from before', function() {
    describe('when the worker was ready', function() {
      it('restores the state', function() {
        const store = createStore(pluginApp);
        const chrome = mockChrome({ localStorage: { workerState: 'ready' } });

        return new Promise((resolve, reject) => {
          handleStateSaving(store, chrome).then(() => {
            const workerState = store.getState().worker.get('state');
            if (workerState !== 'ready') {
              reject(new Error`Worker should have been ready but was ${workerState}`);
            }
            resolve();
          });
        });
      });
    });

    describe('when the worker was working', function() {
      it("doesn't set the state", function() {
        const store = createStore(pluginApp);
        const chrome = mockChrome({ localStorage: { workerState: 'working' } });

        return new Promise((resolve, reject) => {
          handleStateSaving(store, chrome).then(() => {
            const state = store.getState().worker.get('state');
            if (state !== 'inactive') {
              reject(new Error(`worker should have been inactive but is ${state}`));
            }
            resolve();
          });
        });
      });
    });
  });
});
