'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _constants = require('../../constants');

var _actions = require('../../actions');

var _chaiImmutable = require('chai-immutable');

var _chaiImmutable2 = _interopRequireDefault(_chaiImmutable);

var _polling = require('../polling');

var _polling2 = _interopRequireDefault(_polling);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_chai2.default.use(_chaiImmutable2.default); /*
                                               eslint-disable prefer-arrow-callback,
                                               func-names,
                                               space-before-function-paren,
                                               no-unused-expressions
                                             */


var checkState = function checkState(state) {
  (0, _chai.expect)(state).to.have.keys(['polling', 'pollUrl', 'error', 'interval', 'captchaRequired']);
};

var initState = (0, _polling2.default)(undefined, { type: 'INIT' });

describe('polling reducer', function () {
  it('starts without polling', function () {
    var state = initState;
    checkState(initState);
    (0, _chai.expect)(state.get('polling')).to.be.false;
    (0, _chai.expect)(state.get('pollUrl')).to.be.null;
    (0, _chai.expect)(state.get('interval')).to.equal(_constants.DEFAULT_POLLING_INTERVAL);
  });

  describe(_constants.actions.START_POLLING, function () {
    it('sets the polling params', function () {
      var url = 'http://example.com';
      var state = (0, _polling2.default)(undefined, (0, _actions.startPolling)({ url: url }));
      checkState(state);

      (0, _chai.expect)(state.get('polling')).to.be.true;
      (0, _chai.expect)(state.get('pollUrl')).to.equal(url);
    });

    describe('without a URL', function () {
      it('sets the polling param', function () {
        var state = (0, _polling2.default)(initState, (0, _actions.startPolling)());
        checkState(state);

        (0, _chai.expect)(state.get('polling')).to.be.true;
        (0, _chai.expect)(state.get('pollUrl')).to.be.null;
        (0, _chai.expect)(state.get('error')).to.be.null;
      });
    });
  });

  describe(_constants.actions.STOP_POLLING, function () {
    it('sets the polling params', function () {
      var state = (0, _polling2.default)(undefined, (0, _actions.startPolling)({ url: 'http://example.com' }));
      checkState(state);
      state = (0, _polling2.default)(state, (0, _actions.stopPolling)());
      checkState(state);

      (0, _chai.expect)(state.get('polling')).to.be.false;
    });
  });

  describe(_constants.actions.SET_POLLING_INTERVAL, function () {
    it('sets the polling interval', function () {
      var state = (0, _polling2.default)(undefined, (0, _actions.setPollingInterval)(42));
      checkState(state);

      (0, _chai.expect)(state.get('interval')).to.equal(42);
    });
  });

  describe(_constants.actions.SET_POLL_URL, function () {
    it('sets the URL for polling', function () {
      var state = (0, _polling2.default)(undefined, (0, _actions.setPollUrl)('http://work.com'));
      checkState(state);

      (0, _chai.expect)(state.get('pollUrl')).to.equal('http://work.com');
    });
  });

  describe(_constants.actions.ASSIGN_WORK, function () {
    it('stops polling', function () {
      var state = (0, _polling2.default)(undefined, (0, _actions.startPolling)({ url: 'http://example.com' }));
      checkState(state);
      state = (0, _polling2.default)(state, (0, _actions.assignWork)({ url: 'http://work.com' }));
      checkState(state);

      (0, _chai.expect)(state.get('polling')).to.be.false;
    });
  });

  describe(_constants.actions.CAPTCHA_REQUIRED, function () {
    it('sets captchaRequired to true', function () {
      var state = initState;
      state = (0, _polling2.default)(state, (0, _actions.startPolling)({ url: 'http://example.com' }));
      state = (0, _polling2.default)(state, (0, _actions.captchaRequired)());
      checkState(state);

      (0, _chai.expect)(state.get('captchaRequired')).to.be.true;
    });
  });

  describe(_constants.actions.ICON_CLICKED, function () {
    it('sets captchaRequired to false', function () {
      var state = initState;
      state = (0, _polling2.default)(state, (0, _actions.startPolling)({ url: 'http://example.com' }));
      state = (0, _polling2.default)(state, (0, _actions.captchaRequired)());
      state = (0, _polling2.default)(state, (0, _actions.iconClicked)());
      checkState(state);

      (0, _chai.expect)(state.get('captchaRequired')).to.be.false;
    });
  });
});