/*
  eslint-disable prefer-arrow-callback,
  func-names,
  space-before-function-paren,
  no-unused-expressions
*/
import chai, { expect } from 'chai';
import chaiImmutable from 'chai-immutable';
import pluginApp from '../reducers';
import { createStore } from 'redux';
import { authFailed, connect, channelLeft, updateWorkerState } from '../actions';
import { Set } from 'immutable';
import handleStateNotifications from '../handleStateNotifications';

chai.use(chaiImmutable);

const activeNotifications = store => (
  store.getState().notifications.get('activeNotifications')
);

describe('handleStateNotifications', function() {
  describe('when the user is unauthenticated', function() {
    describe('when the user was already unauthenticated', function() {
      it("doesn't show a notification", function() {
        const store = createStore(pluginApp);
        store.dispatch(authFailed()); // already failed

        handleStateNotifications(store);

        store.dispatch(authFailed());

        expect(activeNotifications(store)).to.equal(Set([]));
      });
    });

    describe('when the worker is moving to ready', function() {
      it('shows a notification', function() {
        const store = createStore(pluginApp);
        store.dispatch(authFailed());

        handleStateNotifications(store);

        store.dispatch(updateWorkerState('ready'));

        expect(activeNotifications(store)).to.equal(Set(['notLoggedIn']));
      });
    });

    describe('when the user was not already unauthenticated', function() {
      it('shows a notification', function() {
        const store = createStore(pluginApp);

        handleStateNotifications(store);

        store.dispatch(authFailed());

        expect(activeNotifications(store)).to.equal(Set(['notLoggedIn']));
      });
    });
  });

  describe('when the user connects successfully', function() {
    it('clears the notification', function() {
      const store = createStore(pluginApp);

      handleStateNotifications(store);

      store.dispatch(authFailed());

      store.dispatch(connect());

      expect(activeNotifications(store)).to.equal(Set([]));
    });
  });

  describe('when the user leaves the channel', function() {
    it('shows a notification', function() {
      const store = createStore(pluginApp);
      store.dispatch(connect());

      handleStateNotifications(store);

      store.dispatch(channelLeft());

      expect(activeNotifications(store)).to.equal(Set(['leftChannel']));
    });
  });
});
