'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _plugin = require('../plugin');

var _plugin2 = _interopRequireDefault(_plugin);

var _chaiImmutable = require('chai-immutable');

var _chaiImmutable2 = _interopRequireDefault(_chaiImmutable);

var _constants = require('../../constants');

var _actions = require('../../actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_chai2.default.use(_chaiImmutable2.default); /*
                                              eslint-disable prefer-arrow-callback,
                                              func-names,
                                              space-before-function-paren,
                                              no-unused-expressions
                                             */


var checkState = function checkState(state) {
  (0, _chai.expect)(state).to.have.keys(['version', 'error']);
};

var initState = (0, _plugin2.default)(undefined, { type: 'INIT' });

describe('plugin reducer', function () {
  it('starts without a version', function () {
    var state = initState;
    checkState(state);
    (0, _chai.expect)(state.get('version')).to.be.null;
  });

  describe(_constants.actions.SET_PLUGIN_VERSION, function () {
    it('sets the version', function () {
      var state = (0, _plugin2.default)(initState, (0, _actions.setPluginVersion)('FOO'));
      checkState(state);
      (0, _chai.expect)(state.get('version')).to.equal('FOO');
    });
  });
});