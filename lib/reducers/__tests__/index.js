'use strict';

var _chai = require('chai');

var _ = require('..');

var _constants = require('../../constants');

describe('reducers', function () {
  it('has the correct reducers', function () {
    (0, _chai.expect)(Object.keys(_.reducers)).to.deep.equal(_constants.REDUCERS);
  });
}); /*
     eslint-disable prefer-arrow-callback,
     func-names,
     space-before-function-paren,
     no-unused-expressions
    */