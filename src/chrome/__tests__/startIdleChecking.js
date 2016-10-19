/*
  eslint-disable prefer-arrow-callback,
  func-names,
  space-before-function-paren,
  no-unused-expressions
*/
import chai, { expect } from 'chai';
import chaiImmutable from 'chai-immutable';
import { Set } from 'immutable';
import { mockChrome } from '../__mocks__/chrome';
import startIdleChecking from '../startIdleChecking';
import pluginApp from '../../reducers';
import { createStore } from 'redux';
import { updateWorkerState } from '../../actions';

chai.use(chaiImmutable);

const activeNotifications = store => (
  store.getState().notifications.get('activeNotifications')
);

describe('startIdleChecking', function() {
  it('changes the worker state to inactive after chrome is idle', function() {
    const chrome = mockChrome();
    const store = createStore(pluginApp);
    store.dispatch(updateWorkerState('ready'));

    startIdleChecking(store, chrome);

    chrome.stateChanged('active');

    expect(store.getState().worker.get('state')).to.equal('ready');

    chrome.stateChanged('idle');

    expect(store.getState().worker.get('state')).to.equal('inactive');
  });

  it('changes wantsMoreWork to false if the worker is working', function() {
    const chrome = mockChrome();
    const store = createStore(pluginApp);
    store.dispatch(updateWorkerState('working'));

    startIdleChecking(store, chrome);

    chrome.stateChanged('idle');

    const { worker } = store.getState();
    expect(worker.get('state')).to.equal('working');
    expect(worker.get('wantsMoreWork')).to.be.false;
  });

  it("doesn't give a notification if the worker isn't active", function() {
    const chrome = mockChrome();
    const store = createStore(pluginApp);
    store.dispatch(updateWorkerState('inactive'));

    startIdleChecking(store, chrome);

    chrome.stateChanged('idle');

    expect(activeNotifications(store)).to.equal(Set([]));
  });

  it('clears the notification when the worker goes active', function() {
    const chrome = mockChrome();
    const store = createStore(pluginApp);
    store.dispatch(updateWorkerState('ready'));

    startIdleChecking(store, chrome);

    chrome.stateChanged('idle');

    store.dispatch(updateWorkerState('ready'));

    expect(activeNotifications(store)).to.equal(Set([]));
  });
});
