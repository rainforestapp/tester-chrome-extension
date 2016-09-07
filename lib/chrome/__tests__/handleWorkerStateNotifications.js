'use strict';

var _chai = require('chai');

var _reducers = require('../../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _redux = require('redux');

var _actions = require('../../actions');

var _chrome = require('../__mocks__/chrome');

var _constants = require('../../constants');

var _handleWorkerStateNotifications = require('../handleWorkerStateNotifications');

var _handleWorkerStateNotifications2 = _interopRequireDefault(_handleWorkerStateNotifications);

var _notifications = require('../notifications');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
  eslint-disable prefer-arrow-callback,
  func-names,
  space-before-function-paren,
  no-unused-expressions
*/
describe('handleWorkerStateNotifications', function () {
  describe('when the user is unauthenticated', function () {
    describe('when the user was already unauthenticated', function () {
      it("doesn't show a notification", function () {
        var chrome = (0, _chrome.mockChrome)();
        var store = (0, _redux.createStore)(_reducers2.default);
        store.dispatch((0, _actions.authFailed)()); // already failed

        (0, _handleWorkerStateNotifications2.default)(store, chrome);

        store.dispatch((0, _actions.authFailed)());

        (0, _chai.expect)(chrome.getCurrentNotifications()).to.be.empty;
      });
    });

    describe('when the worker is moving to ready', function () {
      it('shows a notification', function () {
        var chrome = (0, _chrome.mockChrome)();
        var store = (0, _redux.createStore)(_reducers2.default);
        store.dispatch((0, _actions.authFailed)());

        (0, _handleWorkerStateNotifications2.default)(store, chrome);

        store.dispatch((0, _actions.updateWorkerState)('ready'));

        (0, _chai.expect)(chrome.getCurrentNotifications()).to.have.property('notLoggedIn');
      });
    });

    describe('when the user was not already unauthenticated', function () {
      it('shows a notification', function () {
        var chrome = (0, _chrome.mockChrome)();
        var store = (0, _redux.createStore)(_reducers2.default);

        (0, _handleWorkerStateNotifications2.default)(store, chrome);

        store.dispatch((0, _actions.authFailed)());

        (0, _chai.expect)(chrome.getCurrentNotifications()).to.have.property('notLoggedIn');
      });
    });
  });

  describe('when the user connects successfully', function () {
    it('clears the notification', function () {
      var chrome = (0, _chrome.mockChrome)();
      var store = (0, _redux.createStore)(_reducers2.default);

      (0, _handleWorkerStateNotifications2.default)(store, chrome);

      store.dispatch((0, _actions.authFailed)());

      store.dispatch((0, _actions.connect)());

      (0, _chai.expect)(chrome.getCurrentNotifications()).to.be.empty;
    });
  });

  describe('clicking on a login notification', function () {
    it('opens a new tab with the profile URL', function () {
      var chrome = (0, _chrome.mockChrome)();
      var store = (0, _redux.createStore)(_reducers2.default);

      (0, _handleWorkerStateNotifications2.default)(store, chrome);
      store.dispatch((0, _actions.authFailed)());

      chrome.clickNotification(_notifications.notLoggedIn);

      var tabs = chrome.getOpenTabs();
      (0, _chai.expect)(tabs.length).to.equal(1);
      (0, _chai.expect)(tabs[0].url).to.equal(_constants.CONFIG.profileUrl);
    });
  });
});