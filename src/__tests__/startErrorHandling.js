/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import chai, { expect } from 'chai';
import startErrorHandling from '../startErrorHandling';
import { authenticate } from '../actions';
import { createStore } from 'redux';
import pluginApp from '../reducers';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

const mockRaven = ({ captureException, setUserContext }) => (
  {
    config: () => ({ install: () => {} }),
    captureException,
    setUserContext,
  }
);

describe('startErrorHandling', function() {
  it('reports any errors to Raven', function() {
    const captureException = sinon.spy();
    const raven = mockRaven({ captureException });
    const store = createStore(pluginApp);

    startErrorHandling(store, raven, true);

    // Bad call to authenticate
    store.dispatch(authenticate());

    expect(captureException).to.have.been.calledTwice;
  });

  it("records the worker UUID when it's set", function() {
    const setUserContext = sinon.spy();
    const raven = mockRaven({ setUserContext });
    const store = createStore(pluginApp);

    startErrorHandling(store, raven, true);

    store.dispatch(authenticate({ workerUUID: 'abc123', socketAuth: { auth: 'foo', sig: 'bar' } }));

    expect(setUserContext).to.have.been.calledWithExactly({ uuid: 'abc123' });
  });
});
