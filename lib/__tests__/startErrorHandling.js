'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _startErrorHandling = require('../startErrorHandling');

var _startErrorHandling2 = _interopRequireDefault(_startErrorHandling);

var _actions = require('../actions');

var _redux = require('redux');

var _reducers = require('../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _sinonChai = require('sinon-chai');

var _sinonChai2 = _interopRequireDefault(_sinonChai);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_chai2.default.use(_sinonChai2.default); /*
                                          eslint-disable prefer-arrow-callback,
                                          func-names,
                                          space-before-function-paren,
                                          no-unused-expressions
                                         */


var mockRaven = function mockRaven(_ref) {
  var captureException = _ref.captureException;
  var setUserContext = _ref.setUserContext;
  return {
    config: function config() {
      return { install: function install() {} };
    },
    captureException: captureException,
    setUserContext: setUserContext
  };
};

describe('startErrorHandling', function () {
  it('reports any errors to Raven', function () {
    var captureException = _sinon2.default.spy();
    var raven = mockRaven({ captureException: captureException });
    var store = (0, _redux.createStore)(_reducers2.default);

    (0, _startErrorHandling2.default)(store, raven, true);

    // Bad call to authenticate
    store.dispatch((0, _actions.authenticate)());

    (0, _chai.expect)(captureException).to.have.been.called.twice;
  });

  it("records the worker UUID when it's set", function () {
    var setUserContext = _sinon2.default.spy();
    var raven = mockRaven({ setUserContext: setUserContext });
    var store = (0, _redux.createStore)(_reducers2.default);

    (0, _startErrorHandling2.default)(store, raven, true);

    store.dispatch((0, _actions.authenticate)({ workerUUID: 'abc123', socketAuth: { auth: 'foo', sig: 'bar' } }));

    (0, _chai.expect)(setUserContext).to.have.been.calledWithExactly({ uuid: 'abc123' });
  });
});