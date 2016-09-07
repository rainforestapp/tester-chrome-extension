'use strict';

var _chrome = require('../__mocks__/chrome');

var _chai = require('chai');

var _actions = require('../../actions');

var _redux = require('redux');

var _reducers = require('../../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _handleCaptcha = require('../handleCaptcha');

var _handleCaptcha2 = _interopRequireDefault(_handleCaptcha);

var _notifications = require('../notifications');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('handleCaptcha', function () {
  it('shows a notification when a captcha is required', function () {
    var chrome = (0, _chrome.mockChrome)();
    var store = (0, _redux.createStore)(_reducers2.default);
    (0, _handleCaptcha2.default)(store, chrome);

    store.dispatch((0, _actions.captchaRequired)());

    (0, _chai.expect)(chrome.getCurrentNotifications()).to.have.property(_notifications.captcha);
  });

  describe('clicking a captcha notification', function () {
    it('opens a tab with the work URL', function () {
      var chrome = (0, _chrome.mockChrome)();
      var store = (0, _redux.createStore)(_reducers2.default);
      var url = 'http://example.com';

      (0, _handleCaptcha2.default)(store, chrome);
      store.dispatch((0, _actions.startPolling)({ url: url }));
      store.dispatch((0, _actions.captchaRequired)());

      chrome.clickNotification(_notifications.captcha);

      var tabs = chrome.getOpenTabs();
      (0, _chai.expect)(tabs.length).to.equal(1);
      (0, _chai.expect)(tabs[0].url).to.equal(url);
    });
  });
}); /*
     eslint-disable prefer-arrow-callback,
     func-names,
     space-before-function-paren,
     no-unused-expressions
    */