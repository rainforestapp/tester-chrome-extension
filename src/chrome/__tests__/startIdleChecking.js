/*
  eslint-disable prefer-arrow-callback,
  func-names,
  space-before-function-paren,
  no-unused-expressions
*/
import { expect } from 'chai';
import { mockChrome } from '../__mocks__/chrome';
import startIdleChecking from '../startIdleChecking';
import pluginApp from '../../reducers';
import { createStore } from 'redux';
import { updateWorkerState } from '../../actions';
import { workerIdle } from '../notifications';

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

  it('gives the worker a notification and logs them back in if they click it', function() {
    const chrome = mockChrome();
    const store = createStore(pluginApp);
    store.dispatch(updateWorkerState('ready'));

    startIdleChecking(store, chrome);

    chrome.stateChanged('idle');

    expect(chrome.getCurrentNotifications()).to.have.property(workerIdle);

    chrome.clickNotification(workerIdle);

    expect(store.getState().worker.get('state')).to.equal('ready');
  });

  it("doesn't give a notification if the worker isn't active", function() {
    const chrome = mockChrome();
    const store = createStore(pluginApp);
    store.dispatch(updateWorkerState('inactive'));

    startIdleChecking(store, chrome);

    chrome.stateChanged('idle');

    expect(chrome.getCurrentNotifications()).to.not.have.property(workerIdle);
  });

  it('clears the notification when the worker goes active', function() {
    const chrome = mockChrome();
    const store = createStore(pluginApp);
    store.dispatch(updateWorkerState('ready'));

    startIdleChecking(store, chrome);

    chrome.stateChanged('idle');

    store.dispatch(updateWorkerState('ready'));

    expect(chrome.getCurrentNotifications()).to.not.have.property(workerIdle);
  });
});
