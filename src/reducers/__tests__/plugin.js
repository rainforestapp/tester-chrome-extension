/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import chai, { expect } from 'chai';
import plugin from '../plugin';
import chaiImmutable from 'chai-immutable';
import { actions } from '../../constants';
import { setPluginVersion } from '../../actions';

chai.use(chaiImmutable);

const checkState = (state) => {
  expect(state).to.have.keys(['version', 'error']);
};

const initState = plugin(undefined, { type: 'INIT' });

describe('plugin reducer', function() {
  it('starts without a version', function() {
    const state = initState;
    checkState(state);
    expect(state.get('version')).to.be.null;
  });

  describe(actions.SET_PLUGIN_VERSION, function() {
    it('sets the version', function() {
      const state = plugin(initState, setPluginVersion('FOO'));
      checkState(state);
      expect(state.get('version')).to.equal('FOO');
    });
  });
});
