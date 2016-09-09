'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _logging = require('./logging');

var _actions = require('./actions');

var _ravenJs = require('raven-js');

var _ravenJs2 = _interopRequireDefault(_ravenJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handlePolling = function handlePolling(store) {
  var running = true;
  var timeoutID = null;

  var checkForCaptcha = function checkForCaptcha(body) {
    if (body.indexOf('CAPTCHA') > -1) {
      store.dispatch((0, _actions.captchaRequired)());
    }
  };

  var checkForWork = function checkForWork(data) {
    if (data.work_available) {
      if (typeof data.url !== 'string') {
        var msg = 'work_available endpoint gave unexpected response: ' + JSON.stringify(data);
        throw new Error(msg);
      }

      // Double-check the worker state in case something changed since the fetch
      // started.

      var _store$getState = store.getState();

      var worker = _store$getState.worker;

      if (worker.get('state') === 'ready') {
        store.dispatch((0, _actions.assignWork)({ url: data.url }));
      }
    }
  };

  var ping = function ping(url) {
    var urlWithInfo = url;
    var profileInfo = store.getState().worker.get('profileInfo');
    if (profileInfo) {
      urlWithInfo = url + '?info=' + JSON.stringify(profileInfo);
    }
    (0, _logging.logDebug)('Pinging ' + urlWithInfo + '...');

    fetch(urlWithInfo).then(function (resp) {
      if (resp.ok) {
        resp.json().then(checkForWork);
      } else {
        resp.text().then(checkForCaptcha);
      }
    }).catch(function (err) {
      _ravenJs2.default.captureException(err);
    });
  };

  var shouldPing = function shouldPing(_ref) {
    var polling = _ref.polling;
    var worker = _ref.worker;
    return polling.get('polling') && polling.get('pollUrl') && worker.get('state') === 'ready';
  };

  var tick = function tick() {
    if (!running) {
      return;
    }

    var state = store.getState();
    if (shouldPing(state)) {
      ping(state.polling.get('pollUrl'));
    } else {
      (0, _logging.logDebug)('Not pinging work server');
    }
    timeoutID = setTimeout(tick, state.polling.get('interval'));
  };

  // This is really for testing; in general polling shouldn't be stopped
  // directly (instead it should be controlled through reducers).
  var stop = function stop() {
    running = false;
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
  };

  timeoutID = setTimeout(tick);

  return {
    stop: stop
  };
};

exports.default = handlePolling;