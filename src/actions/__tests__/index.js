/*
  eslint-disable prefer-arrow-callback,
  func-names,
  space-before-function-paren,
  no-unused-expressions
*/
import { expect } from 'chai';
import { updateWorkerState } from '..';
import { actions } from '../../constants';

describe('updateWorkerState', function() {
  describe('with an invalid state', function() {
    it('throws an error', function() {
      expect(() => updateWorkerState('jumping')).to.throw(Error);
    });
  });

  describe('with a valid state', function() {
    it('returns a valid action', function() {
      expect(updateWorkerState('working')).to.deep.equal({
        type: actions.UPDATE_WORKER_STATE,
        payload: 'working',
      });
    });
  });
});
