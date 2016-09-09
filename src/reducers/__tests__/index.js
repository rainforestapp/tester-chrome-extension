/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import { expect } from 'chai';
import { reducers } from '..';
import { REDUCERS } from '../../constants';

describe('reducers', function() {
  it('has the correct reducers', function() {
    expect(Object.keys(reducers)).to.deep.equal(REDUCERS);
  });
});
