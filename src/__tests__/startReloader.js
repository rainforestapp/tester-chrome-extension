/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import chai, { expect } from 'chai';
import { createStore } from 'redux';
import { setPluginVersion } from '../actions';
import pluginApp from '../reducers';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import startReloader from '../startReloader';

chai.use(sinonChai);

describe('startReloader', function() {
  it('reloads the page when the plugin version changes', function() {
    const spy = sinon.spy();
    const store = createStore(pluginApp);
    startReloader(store, spy);
    expect(spy).to.not.have.been.called;

    store.dispatch(setPluginVersion('v1'));

    expect(spy).to.have.been.called;
    spy.reset();

    store.dispatch(setPluginVersion('v1'));

    expect(spy).to.not.have.been.called;
    spy.reset();

    store.dispatch(setPluginVersion('v2'));

    expect(spy).to.have.been.called;
  });
});
