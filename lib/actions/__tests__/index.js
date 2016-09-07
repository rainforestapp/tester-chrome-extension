'use strict';

var _chai = require('chai');

var _ = require('..');

var _constants = require('../../constants');

describe('updateWorkerState', function () {
  describe('with an invalid state', function () {
    it('throws an error', function () {
      (0, _chai.expect)(function () {
        return (0, _.updateWorkerState)('jumping');
      }).to.throw(Error);
    });
  });

  describe('with a valid state', function () {
    it('returns a valid action', function () {
      (0, _chai.expect)((0, _.updateWorkerState)('working')).to.deep.equal({
        type: _constants.actions.UPDATE_WORKER_STATE,
        payload: 'working'
      });
    });
  });
}); /*
      eslint-disable prefer-arrow-callback,
      func-names,
      space-before-function-paren,
      no-unused-expressions
    */