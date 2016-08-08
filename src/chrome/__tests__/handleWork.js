/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/

import { mockChrome } from '../__mocks__/chrome';
import { expect } from 'chai';
import { assignWork, updateWorkerState } from '../../actions';
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
});
