'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiImmutable = require('chai-immutable');

var _chaiImmutable2 = _interopRequireDefault(_chaiImmutable);

var _immutable = require('immutable');

var _actions = require('../../actions');

var _constants = require('../../constants');

var _worker = require('../worker');

var _worker2 = _interopRequireDefault(_worker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
_chai2.default.use(_chaiImmutable2.default);

var checkState = function checkState(state) {
  (0, _chai.expect)(state).to.have.keys(['state', 'wantsMoreWork', 'uuid', 'workUrl', 'profileInfo', 'error']);
};

var initState = (0, _worker2.default)(undefined, { type: 'INIT' });

var workerWithState = function workerWithState(state) {
  return (0, _worker2.default)(initState, (0, _actions.updateWorkerState)(state));
};

describe('worker reducer', function () {
  it('starts with everything inactive', function () {
    var state = initState;
    checkState(state);

    (0, _chai.expect)(state.get('state')).to.equal('inactive');
    (0, _chai.expect)(state.get('wantsMoreWork')).to.be.false;
    (0, _chai.expect)(state.get('uuid')).to.be.null;
  });

  describe(_constants.actions.AUTHENTICATE, function () {
    it('sets the worker UUID', function () {
      var auth = {
        auth: 'SEKRET',
        sig: 'SIG'
      };
      var action = (0, _actions.authenticate)({
        workerUUID: 'abc123',
        socketAuth: auth
      });

      var state = (0, _worker2.default)(undefined, action);
      checkState(state);

      (0, _chai.expect)(state.get('state')).to.equal('inactive');
      (0, _chai.expect)(state.get('uuid')).to.equal('abc123');
    });
  });

  describe(_constants.actions.UPDATE_WORKER_STATE, function () {
    it('updates the worker state', function () {
      var state = initState;
      (0, _chai.expect)(state.get('state')).to.equal('inactive');
      state = (0, _worker2.default)(state, (0, _actions.updateWorkerState)('inactive'));
      (0, _chai.expect)(state.get('state')).to.equal('inactive');
      state = (0, _worker2.default)(state, (0, _actions.updateWorkerState)('ready'));
      (0, _chai.expect)(state.get('state')).to.equal('ready');
      state = (0, _worker2.default)(state, (0, _actions.updateWorkerState)('inactive'));
      (0, _chai.expect)(state.get('state')).to.equal('inactive');
    });
  });

  describe(_constants.actions.SET_WORKER_PROFILE, function () {
    it('updates the worker profile', function () {
      var profile = { email: 'bob@example.com', id: 'abc123' };
      var state = (0, _worker2.default)(initState, (0, _actions.setWorkerProfile)(profile));

      (0, _chai.expect)(state.get('profileInfo')).to.equal((0, _immutable.fromJS)(profile));
    });
  });

  describe(_constants.actions.ASSIGN_WORK, function () {
    describe('when the worker is ready', function () {
      var workUrl = 'http://www.example.com';

      var stateWithWork = function stateWithWork() {
        var state = initState;
        state = (0, _worker2.default)(state, (0, _actions.updateWorkerState)('ready'));
        return (0, _worker2.default)(state, (0, _actions.assignWork)({ url: workUrl }));
      };

      it('updates the worker state to "working"', function () {
        var state = stateWithWork();

        (0, _chai.expect)(state.get('state')).to.equal('working');
        (0, _chai.expect)(state.get('workUrl')).to.equal(workUrl);
      });

      it('defaults wantsMoreWork to true', function () {
        var state = stateWithWork();

        (0, _chai.expect)(state.get('wantsMoreWork')).to.be.true;
      });
    });

    describe('when the worker is not ready', function () {
      it('updates the error and returns the same state', function () {
        var state = workerWithState('inactive');
        state = (0, _worker2.default)(state, (0, _actions.assignWork)({ url: 'whatever' }));

        (0, _chai.expect)(state.get('state')).to.equal('inactive');
        (0, _chai.expect)(state.get('error')).to.be.an('error');
      });
    });
  });

  describe(_constants.actions.WORK_FINISHED, function () {
    describe('when the worker is working', function () {
      describe('when the worker wants more work', function () {
        it('changes the worker to ready', function () {
          var state = workerWithState('working').set('wantsMoreWork', true);

          state = (0, _worker2.default)(state, (0, _actions.workFinished)());

          (0, _chai.expect)(state.get('state')).to.equal('ready');
        });
      });

      describe("when the worker doesn't want more work", function () {
        it('changes the worker to inactive', function () {
          var state = workerWithState('working').set('wantsMoreWork', false);

          state = (0, _worker2.default)(state, (0, _actions.workFinished)());

          (0, _chai.expect)(state.get('state')).to.equal('inactive');
        });
      });

      it('clears the work URL', function () {
        var state = workerWithState('ready');
        state = (0, _worker2.default)(state, (0, _actions.assignWork)({ url: 'http://www.example.com' }));
        state = (0, _worker2.default)(state, (0, _actions.workFinished)());

        (0, _chai.expect)(state.get('workUrl')).to.be.null;
      });

      it('sets wantsMoreWork to false', function () {
        var state = workerWithState('working');
        state = (0, _worker2.default)(state, (0, _actions.workFinished)());

        (0, _chai.expect)(state.get('wantsMoreWork')).to.be.false;
      });
    });

    describe('when the worker is inactive', function () {
      it('keeps the worker inactive', function () {
        var state = workerWithState('inactive');
        state = (0, _worker2.default)(state, (0, _actions.workFinished)());

        (0, _chai.expect)(state.get('state')).to.equal('inactive');
      });
    });
  });

  describe(_constants.actions.ICON_CLICKED, function () {
    describe('when the worker is inactive', function () {
      it('updates the worker state to "ready"', function () {
        var state = workerWithState('inactive');

        state = (0, _worker2.default)(state, (0, _actions.iconClicked)());
        (0, _chai.expect)(state.get('state')).to.equal('ready');
      });
    });

    describe('when the worker is ready', function () {
      it('updates the worker state to "inactive"', function () {
        var state = workerWithState('ready');

        state = (0, _worker2.default)(state, (0, _actions.iconClicked)());
        (0, _chai.expect)(state.get('state')).to.equal('inactive');
      });
    });

    describe('when the worker is working', function () {
      it("doesn't change the state", function () {
        var state = workerWithState('working');

        state = (0, _worker2.default)(state, (0, _actions.iconClicked)());
        (0, _chai.expect)(state.get('state')).to.equal('working');
      });

      it('toggles wantsMoreWork', function () {
        var state = workerWithState('ready');
        state = (0, _worker2.default)(state, (0, _actions.assignWork)({ url: 'http://www.example.com' }));
        (0, _chai.expect)(state.get('wantsMoreWork')).to.be.true;

        state = (0, _worker2.default)(state, (0, _actions.iconClicked)());
        (0, _chai.expect)(state.get('wantsMoreWork')).to.be.false;

        state = (0, _worker2.default)(state, (0, _actions.iconClicked)());
        (0, _chai.expect)(state.get('wantsMoreWork')).to.be.true;
      });
    });
  });

  describe(_constants.actions.CAPTCHA_REQUIRED, function () {
    it('sets the worker to inactive', function () {
      var state = workerWithState('ready');

      state = (0, _worker2.default)(state, (0, _actions.captchaRequired)());
      (0, _chai.expect)(state.get('state')).to.equal('inactive');
    });
  });
});