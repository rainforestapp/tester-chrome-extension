'use strict';

var _chai = require('chai');

var _reducers = require('../../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _redux = require('redux');

var _chrome = require('../__mocks__/chrome');

var _actions = require('../../actions');

var _renderIcon = require('../renderIcon');

var _renderIcon2 = _interopRequireDefault(_renderIcon);

var _constants = require('../../constants');

var _notifications = require('../notifications');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
  eslint-disable prefer-arrow-callback,
  func-names,
  space-before-function-paren,
  no-unused-expressions
*/
var storeWithWorkerState = function storeWithWorkerState(state) {
  var store = (0, _redux.createStore)(_reducers2.default);
  store.dispatch((0, _actions.updateWorkerState)(state));

  return store;
};

describe('renderIcon', function () {
  describe('badge', function () {
    describe('when the worker is inactive', function () {
      it('says it is OFF', function () {
        var store = storeWithWorkerState('inactive');
        var chrome = (0, _chrome.mockChrome)();

        (0, _renderIcon2.default)(store, chrome);

        var badge = chrome.getBadge();
        (0, _chai.expect)(badge.text).to.equal('OFF');
        (0, _chai.expect)(badge.color).to.equal(_constants.colors.RED);
      });
    });

    describe('when the worker is ready', function () {
      describe('when the socket is connected', function () {
        it('has no special badge', function () {
          var store = (0, _redux.createStore)(_reducers2.default);
          var chrome = (0, _chrome.mockChrome)();

          (0, _renderIcon2.default)(store, chrome);

          store.dispatch((0, _actions.updateWorkerState)('ready'));
          store.dispatch((0, _actions.connect)());

          var badge = chrome.getBadge();
          (0, _chai.expect)(badge.text).to.equal('');
        });
      });
    });

    describe('when the worker is working', function () {
      it('says YES with green', function () {
        var store = (0, _redux.createStore)(_reducers2.default);
        var chrome = (0, _chrome.mockChrome)();

        (0, _renderIcon2.default)(store, chrome);

        store.dispatch((0, _actions.updateWorkerState)('working'));

        var badge = chrome.getBadge();
        (0, _chai.expect)(badge.text).to.equal('YES');
        (0, _chai.expect)(badge.color).to.equal(_constants.colors.GREEN);
      });
    });

    describe('when the socket is not connected', function () {
      it('has a grey icon', function () {
        var store = (0, _redux.createStore)(_reducers2.default);
        var chrome = (0, _chrome.mockChrome)();

        (0, _renderIcon2.default)(store, chrome);

        store.dispatch((0, _actions.authFailed)());

        (0, _chai.expect)(chrome.getIcon().path).to.equal(_constants.CONFIG.chrome.greyIcon.path);
      });
    });

    describe('when the socket is connected', function () {
      it('has a green icon', function () {
        var store = (0, _redux.createStore)(_reducers2.default);
        var chrome = (0, _chrome.mockChrome)();

        (0, _renderIcon2.default)(store, chrome);

        store.dispatch((0, _actions.connect)());

        (0, _chai.expect)(chrome.getIcon().path).to.equal(_constants.CONFIG.chrome.colorIcon.path);
      });
    });
  });

  describe('click handling', function () {
    it('toggles between worker states active and inactive', function () {
      var store = storeWithWorkerState('inactive');
      var chrome = (0, _chrome.mockChrome)();

      (0, _renderIcon2.default)(store, chrome);

      chrome.clickIcon();

      (0, _chai.expect)(store.getState().worker.get('state')).to.equal('ready');

      chrome.clickIcon();

      (0, _chai.expect)(store.getState().worker.get('state')).to.equal('inactive');
    });

    describe('when the worker is working', function () {
      it('displays a notification to the worker', function () {
        var store = storeWithWorkerState('working');
        var chrome = (0, _chrome.mockChrome)();

        (0, _renderIcon2.default)(store, chrome);

        chrome.clickIcon();

        (0, _chai.expect)(chrome.getCurrentNotifications()).to.have.property(_notifications.alreadyWorking);
      });
    });
  });
});