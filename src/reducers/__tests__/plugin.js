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
import { setPluginVersion, setOptions } from '../../actions';
import { fromJS } from 'immutable';

chai.use(chaiImmutable);

const checkState = (state) => {
  expect(state).to.have.keys(['version', 'error', 'options']);
};

const initState = plugin(undefined, { type: 'INIT' });

describe('plugin reducer', function() {
  it('starts without a version', function() {
    const state = initState;
    checkState(state);
    expect(state.get('version')).to.be.null;
  });

  it('starts with blank options', function() {
    const state = initState;
    checkState(state);
    expect(state.get('options')).to.equal(fromJS({}));
  });

  describe(actions.SET_PLUGIN_VERSION, function() {
    it('sets the version', function() {
      const state = plugin(initState, setPluginVersion('FOO'));
      checkState(state);
      expect(state.get('version')).to.equal('FOO');
    });
  });

  describe(actions.SET_OPTIONS, function() {
    it("merges the options that it's given", function() {
      let state = plugin(initState, setOptions({ foo: 'bar' }));
      state = plugin(state, setOptions({ baz: 'qux' }));
      state = plugin(state, setOptions({ foo: { bar: 'foogaloo' } }));

      expect(state.get('options')).to.equal(fromJS({ foo: { bar: 'foogaloo' }, baz: 'qux' }));
    });

    it('sets an error if given a blank payload', function() {
      const state = plugin(initState, setOptions());

      expect(state.get('error')).to.be.an('error');
    });
  });
});
