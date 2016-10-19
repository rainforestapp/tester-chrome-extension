/*
  eslint-disable prefer-arrow-callback,
  func-names,
  space-before-function-paren,
  no-unused-expressions
*/
import chai, { expect } from 'chai';
import chaiImmutable from 'chai-immutable';
import { Set } from 'immutable';
import { notify, clearNotification, updateWorkerState } from '../../actions';
import pluginApp from '../../reducers';
import { createStore } from 'redux';
import { mockChrome } from '../__mocks__/chrome';
import handleNotifications from '../handleNotifications';
import { NOTIFICATIONS, CONFIG } from '../../constants';

chai.use(chaiImmutable);

const init = (opts = {}) => {
  const store = createStore(pluginApp);
  const chrome = mockChrome(opts.chrome);

  handleNotifications(store, chrome);

  return { store, chrome };
};

describe('handleNotifications', function() {
  it('shows no notifications by default', function() {
    const { chrome } = init();
    expect(chrome.getCurrentNotifications()).to.be.empty;
  });

  it("shows a notification when it's added", function() {
    const { store, chrome } = init();
    store.dispatch(notify('notLoggedIn'));
    let notification = chrome.getCurrentNotifications().notLoggedIn;
    expect(notification.title).to.eq(NOTIFICATIONS.notLoggedIn.title);
    expect(notification.message).to.eq(NOTIFICATIONS.notLoggedIn.message);
    expect(notification.type).to.eq('basic');
    expect(notification.isClickable).to.be.true;

    store.dispatch(notify('leftChannel'));
    notification = chrome.getCurrentNotifications().leftChannel;
    expect(notification.isClickable).to.be.false;
  });

  it("clears a notification when it's removed", function() {
    const { store, chrome } = init();
    store.dispatch(notify('notLoggedIn'));
    store.dispatch(notify('workerIdle'));
    store.dispatch(clearNotification('workerIdle'));

    const notifications = chrome.getCurrentNotifications();
    expect(notifications).to.have.keys(['notLoggedIn']);
  });

  it('notifies when a notification is manually cleared', function() {
    const { store, chrome } = init();
    store.dispatch(notify('notLoggedIn'));
    chrome.closeNotification('notLoggedIn');

    expect(store.getState().notifications.get('activeNotifications')).to.equal(Set([]));
  });

  describe('clicking the notification', function() {
    describe('for notLoggedIn', function() {
      it('opens a tab to log in', function() {
        const { store, chrome } = init();
        store.dispatch(notify('notLoggedIn'));

        chrome.clickNotification('notLoggedIn');

        const tabs = chrome.getOpenTabs();
        expect(tabs.length).to.equal(1);
        expect(tabs[0].url).to.equal(CONFIG.profileUrl);
      });
    });

    describe('for workerIdle', function() {
      it('sets the worker to ready', function() {
        const { store, chrome } = init();
        store.dispatch(updateWorkerState('inactive'));
        store.dispatch(notify('workerIdle'));

        chrome.clickNotification('workerIdle');

        expect(store.getState().worker.get('state')).to.equal('ready');
      });
    });
  });
});
