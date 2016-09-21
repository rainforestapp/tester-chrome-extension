/*
  eslint-disable prefer-arrow-callback,
  func-names,
  space-before-function-paren,
  no-unused-expressions
*/
import { expect } from 'chai';
import pluginApp from '../../reducers';
import { createStore } from 'redux';
import { authFailed, connect, channelLeft, updateWorkerState } from '../../actions';
import { mockChrome } from '../__mocks__/chrome';
import { CONFIG } from '../../constants';
import handleStateNotifications from '../handleStateNotifications';
import { notLoggedIn, leftChannel } from '../notifications';

describe('handleStateNotifications', function() {
  describe('when the user is unauthenticated', function() {
    describe('when the user was already unauthenticated', function() {
      it("doesn't show a notification", function() {
        const chrome = mockChrome();
        const store = createStore(pluginApp);
        store.dispatch(authFailed()); // already failed

        handleStateNotifications(store, chrome);

        store.dispatch(authFailed());

        expect(chrome.getCurrentNotifications()).to.be.empty;
      });
    });

    describe('when the worker is moving to ready', function() {
      it('shows a notification', function() {
        const chrome = mockChrome();
        const store = createStore(pluginApp);
        store.dispatch(authFailed());

        handleStateNotifications(store, chrome);

        store.dispatch(updateWorkerState('ready'));

        expect(chrome.getCurrentNotifications()).to.have.property(notLoggedIn);
      });

      it('sends the worker state back to inactive', function() {
        const store = createStore(pluginApp);
        const chrome = mockChrome();
        store.dispatch(authFailed());

        handleStateNotifications(store, chrome);

        store.dispatch(updateWorkerState('ready'));

        expect(store.getState().worker.get('state')).to.equal('inactive');
      });
    });

    describe('when the user was not already unauthenticated', function() {
      it('shows a notification', function() {
        const chrome = mockChrome();
        const store = createStore(pluginApp);

        handleStateNotifications(store, chrome);

        store.dispatch(authFailed());

        expect(chrome.getCurrentNotifications()).to.have.property(notLoggedIn);
      });
    });
  });

  describe('when the user connects successfully', function() {
    it('clears the notification', function() {
      const chrome = mockChrome();
      const store = createStore(pluginApp);

      handleStateNotifications(store, chrome);

      store.dispatch(authFailed());

      store.dispatch(connect());

      expect(chrome.getCurrentNotifications()).to.be.empty;
    });
  });

  describe('when the user leaves the channel', function() {
    it('shows a notification', function() {
      const chrome = mockChrome();
      const store = createStore(pluginApp);
      store.dispatch(connect());

      handleStateNotifications(store, chrome);

      store.dispatch(channelLeft());

      expect(chrome.getCurrentNotifications()).to.have.property(leftChannel);
    });
  });

  describe('clicking on a login notification', function() {
    it('opens a new tab with the profile URL', function() {
      const chrome = mockChrome();
      const store = createStore(pluginApp);

      handleStateNotifications(store, chrome);
      store.dispatch(authFailed());

      chrome.clickNotification(notLoggedIn);

      const tabs = chrome.getOpenTabs();
      expect(tabs.length).to.equal(1);
      expect(tabs[0].url).to.equal(CONFIG.profileUrl);
    });
  });
});
