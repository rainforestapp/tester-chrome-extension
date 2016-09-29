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
  setOptions } from '../../actions';
import { createStore } from 'redux';
import pluginApp from '../../reducers';
import handleWork from '../handleWork';
import { MockAudio } from '../../__mock__/audio';
import { NOTIFICATION_SOUND_URL, NOTIFICATION_SOUND_REPEAT } from '../../constants';

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

    it('plays sound when work assigned', function(done) {
      window.Audio = MockAudio;
      const store = createStore(pluginApp);
      const chrome = mockChrome();
      store.dispatch(updateWorkerState('ready'));
      const options = {
        [NOTIFICATION_SOUND_URL]: 'mockSound.mp3',
        [NOTIFICATION_SOUND_REPEAT]: 1,
      };
      store.dispatch(setOptions(options));

      handleWork(store, chrome);

      const url = 'http://www.example.com';
      store.dispatch(assignWork({ url }));

      setTimeout(() => {
        expect(window.audioPlayer).to.not.be.null;
        expect(window.audioPlayer.playCount).to.equal(1);
        done();
      }, 10);
    });
  });

  describe('when the worker stops working', function() {
    describe('disable sound', function() {
      it('does stop audioPlayer from playing', function(done) {
        window.Audio = MockAudio;
        const store = createStore(pluginApp);
        const chrome = mockChrome();
        store.dispatch(updateWorkerState('ready'));
        const options = {
          [NOTIFICATION_SOUND_URL]: 'mockSound.mp3',
          [NOTIFICATION_SOUND_REPEAT]: 10,
        };
        store.dispatch(setOptions(options));

        handleWork(store, chrome);

        const url = 'http://www.example.com';
        store.dispatch(assignWork({ url }));

        setTimeout(() => {
          store.dispatch(workFinished());
          expect(window.audioPlayer).to.not.be.null;
          expect(window.audioPlayer.paused).to.be.true;
          expect(window.audioPlayer.playCount).to.be.above(1);
          expect(window.audioPlayer.playCount).to.be.below(10);
          done();
        }, 10);
      });
    });

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
