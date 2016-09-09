/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import { expect } from 'chai';
import { startPlugin, actions } from '..';

describe('index', function() {
  it('exports startPlugin', function() {
    expect(startPlugin).to.be.a('function');
  });

  it('exports actions', function() {
    expect(actions.assignWork).to.be.a('function');
    expect(actions.authenticate).to.be.a('function');
  });
});
