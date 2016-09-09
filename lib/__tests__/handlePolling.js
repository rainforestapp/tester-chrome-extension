'use strict';

var _chai = require('chai');

var _handlePolling = require('../handlePolling');

var _handlePolling2 = _interopRequireDefault(_handlePolling);

var _fetchMock = require('fetch-mock');

var _fetchMock2 = _interopRequireDefault(_fetchMock);

var _reducers = require('../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _redux = require('redux');

var _actions = require('../actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
describe('handlePolling', function () {
  var pollUrl = 'http://example.com/work_available';

  describe('when polling is on', function () {
    var storeWithPolling = function storeWithPolling() {
      var store = (0, _redux.createStore)(_reducers2.default);
      store.dispatch((0, _actions.setPollingInterval)(1));
      store.dispatch((0, _actions.startPolling)({ url: pollUrl }));
      store.dispatch((0, _actions.updateWorkerState)('ready'));

      return store;
    };

    it('pings periodically', function (done) {
      var store = storeWithPolling();
      store.dispatch((0, _actions.setPollingInterval)(1));

      var poller = null;

      var pingCounts = 0;
      _fetchMock2.default.get(pollUrl, function (url) {
        (0, _chai.expect)(url).to.equal(pollUrl);
        pingCounts++;
        if (pingCounts === 3) {
          poller.stop();
          _fetchMock2.default.restore();
          done();
        }
        return { work_available: false };
      });

      poller = (0, _handlePolling2.default)(store);
    });

    it("doesn't ping when the worker isn't ready", function (done) {
      var store = storeWithPolling();
      store.dispatch((0, _actions.updateWorkerState)('inactive'));

      var poller = null;
      var fail = false;
      _fetchMock2.default.get(pollUrl, function () {
        poller.stop();
        _fetchMock2.default.restore();
        fail = true;
        done(new Error("Shouldn't have polled because worker wasn't ready!"));
      });

      poller = (0, _handlePolling2.default)(store);

      setTimeout(function () {
        if (!fail) {
          poller.stop();
          _fetchMock2.default.restore();
          done();
        }
      }, 10);
    });

    it('checks for CAPTCHAs', function (done) {
      var store = storeWithPolling();
      var poller = null;
      _fetchMock2.default.get(pollUrl, {
        status: 503,
        body: '<html>CAPTCHA nonsense!</html>',
        headers: {
          'Content-Type': 'text/html'
        }
      });

      var success = false;
      store.subscribe(function () {
        var state = store.getState();
        if (state.polling.get('captchaRequired')) {
          success = true;
          _fetchMock2.default.restore();
          poller.stop();
          done();
        }
      });

      poller = (0, _handlePolling2.default)(store);

      setTimeout(function () {
        if (!success) {
          _fetchMock2.default.restore();
          poller.stop();
          done(new Error("CAPTCHA wasn't detected"));
        }
      }, 50);
    });

    it('assigns work when work is available', function (done) {
      var workUrl = 'http://work.com';
      var store = storeWithPolling();
      _fetchMock2.default.get(pollUrl, { work_available: true, url: workUrl });

      var poller = null;
      store.subscribe(function () {
        var _store$getState = store.getState();

        var worker = _store$getState.worker;
        var polling = _store$getState.polling;

        if (worker.get('state') === 'working') {
          (0, _chai.expect)(worker.get('workUrl')).to.equal(workUrl);
          (0, _chai.expect)(polling.get('polling')).to.be.false;
          poller.stop();
          _fetchMock2.default.restore();
          done();
        }
      });

      poller = (0, _handlePolling2.default)(store);
    });
  });

  describe('when polling is off', function () {
    it("doesn't poll", function (done) {
      var store = (0, _redux.createStore)(_reducers2.default);
      store.dispatch((0, _actions.setPollingInterval)(1));
      store.dispatch((0, _actions.updateWorkerState)('ready'));
      store.dispatch((0, _actions.stopPolling)());
      var fail = false;
      var poller = null;

      _fetchMock2.default.get(pollUrl, function () {
        poller.stop();
        _fetchMock2.default.restore();
        fail = true;

        done(new Error("Shouldn't have polled because polling is off!"));
      });

      poller = (0, _handlePolling2.default)(store);
      setTimeout(function () {
        if (!fail) {
          _fetchMock2.default.restore();
          poller.stop();
          done();
        }
      }, 10);
    });
  });
});