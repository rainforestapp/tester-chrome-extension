/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/

import { mockChrome } from '../__mocks__/chrome';
import { expect } from 'chai';
import {
  assignWork,
  updateWorkerState,
  workStarted,
  workFinished,
} from '../../actions';
import { createStore } from 'redux';
import pluginApp from '../../reducers';
import handleWork from '../handleWork';

describe('handleWork', function() {
  describe('when work is assigned', function() {
    it('opens a tab with the work', function() {
      const store = createStore(pluginApp);
      const chrome = mockChrome();
      store.dispatch(updateWorkerState('ready'));

      handleWork(store, chrome);

      const url = 'http://www.example.com';
      store.dispatch(assignWork({ url }));

      const tabs = chrome.getOpenTabs();
      expect(tabs.length).to.equal(1);
      expect(tabs[0].url).to.equal(url);
    });
  });

  describe('when the worker goes to "working" without a work URL', function() {
    it("doesn't open up a work tab", function() {
      const store = createStore(pluginApp);
      const chrome = mockChrome();
      store.dispatch(updateWorkerState('ready'));

      handleWork(store, chrome);

      store.dispatch(updateWorkerState('working'));
      expect(chrome.getOpenTabs().length).to.equal(0);
    });
  });

  describe('when the worker stops working', function() {
    describe('when the work tab is open', function() {
      it('closes the work tab', function(done) {
        const store = createStore(pluginApp);
        const chrome = mockChrome();
        store.dispatch(updateWorkerState('ready'));

        handleWork(store, chrome);

        store.dispatch(assignWork({ url: 'http://work.com' }));

        setTimeout(() => {
          store.dispatch(workFinished());
          store.dispatch(assignWork({ url: 'http://work2.com' }));

          const tabs = chrome.getOpenTabs();
          if (tabs.length === 1) {
            done();
          }
        });
      });
    });

    describe('when the work tab is closed manually', function() {
      const stateWithAssignedWork = () => {
        const store = createStore(pluginApp);
        const chrome = mockChrome();
        store.dispatch(updateWorkerState('ready'));

        handleWork(store, chrome);

        store.dispatch(assignWork({ url: 'http://work.com' }));

        return { store, chrome };
      };

      const closeTab = chrome => {
        const tab = chrome.getOpenTabs()[0];
        chrome.tabs.remove(tab.id);
      };

      it("doesn't error", function(done) {
        const { store, chrome } = stateWithAssignedWork();

        setTimeout(() => {
          closeTab(chrome);

          store.dispatch(workFinished());
          store.dispatch(assignWork({ url: 'http://work2.com' }));

          const tabs = chrome.getOpenTabs();
          if (tabs.length === 1) {
            done();
          }
        });
      });

      describe('when the worker has started working', function() {
        it("doesn't change the worker state", function(done) {
          const { store, chrome } = stateWithAssignedWork();
          store.dispatch(workStarted());

          setTimeout(() => {
            closeTab(chrome);
            if (store.getState().worker.get('state') === 'working') {
              done();
            }
          });
        });
      });

      describe("when the worker hasn't started working", function() {
        it('changes the worker state', function(done) {
          const { store, chrome } = stateWithAssignedWork();

          setTimeout(() => {
            closeTab(chrome);
            if (store.getState().worker.get('state') === 'working') {
              done(new Error('Worker should not be working because tab was closed!'));
            } else {
              done();
            }
          });
        });
      });
    });
  });
});
