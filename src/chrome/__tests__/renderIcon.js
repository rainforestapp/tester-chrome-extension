/*
  eslint-disable prefer-arrow-callback,
  func-names,
  space-before-function-paren,
  no-unused-expressions
*/
import { expect } from 'chai';
import pluginApp from '../../reducers';
import { createStore } from 'redux';
import { mockChrome } from '../__mocks__/chrome';
import { updateWorkerState, connect, authFailed } from '../../actions';
import renderIcon from '../renderIcon';
import { CONFIG, colors } from '../../constants';
import { alreadyWorking } from '../notifications';

const storeWithWorkerState = state => {
  const store = createStore(pluginApp);
  store.dispatch(updateWorkerState(state));

  return store;
};

describe('renderIcon', function() {
  describe('badge', function() {
    describe('when the worker is inactive', function() {
      it('says it is OFF', function() {
        const store = storeWithWorkerState('inactive');
        const chrome = mockChrome();

        renderIcon(store, chrome);

        const badge = chrome.getBadge();
        expect(badge.text).to.equal('OFF');
        expect(badge.color).to.equal(colors.RED);
      });
    });

    describe('when the worker is ready', function() {
      describe('when the socket is connected', function() {
        it('has no special badge', function() {
          const store = createStore(pluginApp);
          const chrome = mockChrome();

          renderIcon(store, chrome);

          store.dispatch(updateWorkerState('ready'));
          store.dispatch(connect());

          const badge = chrome.getBadge();
          expect(badge.text).to.equal('');
        });
      });
    });

    describe('when the worker is working', function() {
      it('says YES with green', function() {
        const store = createStore(pluginApp);
        const chrome = mockChrome();

        renderIcon(store, chrome);

        store.dispatch(updateWorkerState('working'));

        const badge = chrome.getBadge();
        expect(badge.text).to.equal('YES');
        expect(badge.color).to.equal(colors.GREEN);
      });
    });

    describe('when the socket is not connected', function() {
      it('has a grey icon', function() {
        const store = createStore(pluginApp);
        const chrome = mockChrome();

        renderIcon(store, chrome);

        store.dispatch(authFailed());

        expect(chrome.getIcon().path).to.equal(CONFIG.chrome.greyIcon.path);
      });
    });

    describe('when the socket is connected', function() {
      it('has a green icon', function() {
        const store = createStore(pluginApp);
        const chrome = mockChrome();

        renderIcon(store, chrome);

        store.dispatch(connect());

        expect(chrome.getIcon().path).to.equal(CONFIG.chrome.colorIcon.path);
      });
    });
  });

  describe('click handling', function() {
    it('toggles between worker states active and inactive', function() {
      const store = storeWithWorkerState('inactive');
      const chrome = mockChrome();

      renderIcon(store, chrome);

      chrome.clickIcon();

      expect(store.getState().worker.get('state')).to.equal('ready');

      chrome.clickIcon();

      expect(store.getState().worker.get('state')).to.equal('inactive');
    });

    describe('when the worker is working', function() {
      it('displays a notification to the worker', function() {
        const store = storeWithWorkerState('working');
        const chrome = mockChrome();

        renderIcon(store, chrome);

        chrome.clickIcon();

        expect(chrome.getCurrentNotifications()).to.have.property(alreadyWorking);
      });
    });
  });
});
