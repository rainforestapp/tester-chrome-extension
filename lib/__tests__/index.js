'use strict';

var _chai = require('chai');

var _ = require('..');

/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
describe('index', function () {
  it('exports startPlugin', function () {
    (0, _chai.expect)(_.startPlugin).to.be.a('function');
  });

  it('exports actions', function () {
    (0, _chai.expect)(_.actions.assignWork).to.be.a('function');
    (0, _chai.expect)(_.actions.authenticate).to.be.a('function');
  });
});