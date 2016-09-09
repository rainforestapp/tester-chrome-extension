'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _redux = require('redux');

var _actions = require('../actions');

var _reducers = require('../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _sinonChai = require('sinon-chai');

var _sinonChai2 = _interopRequireDefault(_sinonChai);

var _startReloader = require('../startReloader');

var _startReloader2 = _interopRequireDefault(_startReloader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_chai2.default.use(_sinonChai2.default); /*
                                          eslint-disable prefer-arrow-callback,
                                          func-names,
                                          space-before-function-paren,
                                          no-unused-expressions
                                         */


describe('startReloader', function () {
  it('reloads the page when the plugin version changes', function () {
    var spy = _sinon2.default.spy();
    var store = (0, _redux.createStore)(_reducers2.default);
    (0, _startReloader2.default)(store, spy);
    (0, _chai.expect)(spy).to.not.have.been.called;

    store.dispatch((0, _actions.setPluginVersion)('v1'));

    (0, _chai.expect)(spy).to.not.have.been.called;
    spy.reset();

    store.dispatch((0, _actions.setPluginVersion)('v2'));

    (0, _chai.expect)(spy).to.have.been.called;
    spy.reset();

    store.dispatch((0, _actions.setPluginVersion)('v2'));

    (0, _chai.expect)(spy).to.not.have.been.called;
    spy.reset();
  });
});