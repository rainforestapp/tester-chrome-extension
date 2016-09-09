'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _listenStoreChanges = require('../listenStoreChanges');

var _listenStoreChanges2 = _interopRequireDefault(_listenStoreChanges);

var _notifications = require('./notifications');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handleCaptcha = function handleCaptcha(store, chrome) {
  var handleUpdate = function handleUpdate(_ref, _ref2) {
    var prevPolling = _ref.polling;
    var curPolling = _ref2.polling;

    if (!prevPolling.get('captchaRequired') && curPolling.get('captchaRequired')) {
      chrome.notifications.create(_notifications.captcha, _notifications.notifications[_notifications.captcha]);
    }
  };

  (0, _listenStoreChanges2.default)(store, handleUpdate);

  chrome.notifications.onClicked.addListener(function (notificationId) {
    if (notificationId === _notifications.captcha) {
      var url = store.getState().polling.get('pollUrl');
      if (!url) {
        // Not polling, so not a problem
        return;
      }

      chrome.tabs.create({ url: url });
    }
  });
};

exports.default = handleCaptcha;