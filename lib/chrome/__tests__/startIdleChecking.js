'use strict';

var _chai = require('chai');

var _chrome = require('../__mocks__/chrome');

var _startIdleChecking = require('../startIdleChecking');

var _startIdleChecking2 = _interopRequireDefault(_startIdleChecking);

var _reducers = require('../../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _redux = require('redux');

var _actions = require('../../actions');

var _notifications = require('../notifications');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('startIdleChecking', function () {
  ['idle', 'locked'].forEach(function (state) {
    it('changes the worker state to inactive after chrome is ' + state, function () {
      var chrome = (0, _chrome.mockChrome)();
      var store = (0, _redux.createStore)(_reducers2.default);
      store.dispatch((0, _actions.updateWorkerState)('ready'));

      (0, _startIdleChecking2.default)(store, chrome);

      chrome.stateChanged('active');

      (0, _chai.expect)(store.getState().worker.get('state')).to.equal('ready');

      chrome.stateChanged(state);

      (0, _chai.expect)(store.getState().worker.get('state')).to.equal('inactive');
    });
  });

  it('gives the worker a notification and logs them back in if they click it', function () {
    var chrome = (0, _chrome.mockChrome)();
    var store = (0, _redux.createStore)(_reducers2.default);
    store.dispatch((0, _actions.updateWorkerState)('ready'));

    (0, _startIdleChecking2.default)(store, chrome);

    chrome.stateChanged('idle');

    (0, _chai.expect)(chrome.getCurrentNotifications()).to.have.property(_notifications.workerIdle);

    chrome.clickNotification(_notifications.workerIdle);

    (0, _chai.expect)(store.getState().worker.get('state')).to.equal('ready');
  });

  it("doesn't give a notification if the worker isn't active", function () {
    var chrome = (0, _chrome.mockChrome)();
    var store = (0, _redux.createStore)(_reducers2.default);
    store.dispatch((0, _actions.updateWorkerState)('inactive'));

    (0, _startIdleChecking2.default)(store, chrome);

    chrome.stateChanged('idle');

    (0, _chai.expect)(chrome.getCurrentNotifications()).to.not.have.property(_notifications.workerIdle);
  });

  it('clears the notification when the worker goes active', function () {
    var chrome = (0, _chrome.mockChrome)();
    var store = (0, _redux.createStore)(_reducers2.default);
    store.dispatch((0, _actions.updateWorkerState)('ready'));

    (0, _startIdleChecking2.default)(store, chrome);

    chrome.stateChanged('idle');

    store.dispatch((0, _actions.updateWorkerState)('ready'));

    (0, _chai.expect)(chrome.getCurrentNotifications()).to.not.have.property(_notifications.workerIdle);
  });
}); /*
      eslint-disable prefer-arrow-callback,
      func-names,
      space-before-function-paren,
      no-unused-expressions
    */