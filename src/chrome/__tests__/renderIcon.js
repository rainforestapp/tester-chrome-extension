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
import { updateWorkerState, connect, authFailed, assignWork, iconClicked } from '../../actions';
import renderIcon from '../renderIcon';
import { CONFIG, colors } from '../../constants';

const storeWithWorkerState = state => {
  const store = createStore(pluginApp);
  store.dispatch(updateWorkerState(state));

  return store;
};

const greyIconPath = CONFIG.chrome.greyIcon.path;
const greenIconPath = CONFIG.chrome.colorIcon.path;

describe('renderIcon', function() {
  describe('color', function() {
    describe('when the socket is disconnected', function() {
      it('is grey regardless of worker state', function() {
        const store = createStore(pluginApp);
        const chrome = mockChrome();

        renderIcon(store, chrome);

        store.dispatch(authFailed());

        expect(chrome.getIcon().path).to.equal(greyIconPath);

        store.dispatch(updateWorkerState('ready'));

        expect(chrome.getIcon().path).to.equal(greyIconPath);
      });
    });

    describe('when the socket is connected', function() {
      const connectedStoreWithWorkerState = state => {
        const store = createStore(pluginApp);
        store.dispatch(connect());
        store.dispatch(updateWorkerState(state));

        return store;
      };

      describe('when the worker is inactive', function() {
        it('is grey', function() {
          const store = connectedStoreWithWorkerState('inactive');
          const chrome = mockChrome();

          renderIcon(store, chrome);

          expect(chrome.getIcon().path).to.equal(greyIconPath);
        });
      });

      describe('when the worker is ready', function() {
        it('is green', function() {
          const store = connectedStoreWithWorkerState('ready');
          const chrome = mockChrome();

          renderIcon(store, chrome);

          expect(chrome.getIcon().path).to.equal(greenIconPath);
        });
      });

      describe('when the worker is working', function() {
        const storeWithWorkingWorker = () => {
          const store = connectedStoreWithWorkerState('ready');
          store.dispatch(assignWork({ url: 'http://www.example.com' }));

          return store;
        };

        describe('when the worker wants more work', function() {
          it('is green', function() {
            const store = storeWithWorkingWorker();
            expect(store.getState().worker.get('wantsMoreWork')).to.be.true;
            const chrome = mockChrome();

            renderIcon(store, chrome);

            expect(chrome.getIcon().path).to.equal(greenIconPath);
          });
        });

        describe("when the worker doesn't want more work", function() {
          it('is grey', function() {
            const store = storeWithWorkingWorker();
            store.dispatch(iconClicked());
            expect(store.getState().worker.get('wantsMoreWork')).to.be.false;
            const chrome = mockChrome();

            renderIcon(store, chrome);

            expect(chrome.getIcon().path).to.equal(greyIconPath);
          });
        });
      });
    });
  });

  describe('badge', function() {
    describe('when the worker is working', function() {
      it('is green and says IN P', function() {
        const store = storeWithWorkerState('working');
        const chrome = mockChrome();

        renderIcon(store, chrome);

        const badge = chrome.getBadge();
        expect(badge.text).to.equal('WORK');
        expect(badge.color).to.equal(colors.GREEN);
      });
    });

    describe('when the worker is inactive', function() {
      it('is blank', function() {
        const store = storeWithWorkerState('inactive');
        const chrome = mockChrome();

        renderIcon(store, chrome);

        expect(chrome.getBadge().text).to.equal('');
      });
    });

    describe('when the worker is ready', function() {
      it('is blank', function() {
        const store = storeWithWorkerState('ready');
        const chrome = mockChrome();

        renderIcon(store, chrome);

        expect(chrome.getBadge().text).to.equal('');
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
      it('toggles whether the worker wants more work', function() {
        const store = storeWithWorkerState('working');
        const chrome = mockChrome();

        renderIcon(store, chrome);

        chrome.clickIcon();

        expect(store.getState().worker.get('wantsMoreWork')).to.be.false;

        chrome.clickIcon();

        expect(store.getState().worker.get('wantsMoreWork')).to.be.true;
      });
    });
  });
});
