/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import { expect } from 'chai';
import { fromJS } from 'immutable';
import { startPlugin } from '..';
import { mockSocket } from '../socket/__mocks__';

describe('startPlugin', function() {
  it('returns the store', function() {
    const plugin = startPlugin({});
    expect(plugin.getStore()).to.not.be.null;
  });

  it('authenticates if auth exists', function() {
    const workerUUID = 'abc123';
    const socketAuth = { auth: 'SEKRET', sig: 'SEKRETSIG' };
    const auth = { workerUUID, socketAuth };

    const plugin = startPlugin({ auth, socketConstructor: mockSocket() });
    const state = plugin.getStore().getState();
    expect(state.worker.get('uuid')).to.equal(workerUUID);
    expect(state.socket.get('auth')).to.equal(fromJS(socketAuth));
  });
});
