/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import chai, { expect } from 'chai';
import chaiImmutable from 'chai-immutable';
import {
  assignWork,
  authenticate,
  updateWorkerState,
  iconClicked,
  workFinished,
  captchaRequired,
} from '../../actions';
import * as actions from '../../constants';
import worker from '../worker';

chai.use(chaiImmutable);

const checkState = (state) => {
  expect(state).to.have.keys(['state', 'uuid', 'workUrl', 'error']);
};

const initState = worker(undefined, { type: 'INIT' });

const workerWithState = (state) => (
  worker(initState, updateWorkerState(state))
);

describe('worker reducer', function() {
  it('starts with everything inactive', function() {
    const state = initState;
    checkState(state);

    expect(state.get('state')).to.equal('inactive');
    expect(state.get('uuid')).to.be.null;
  });

  describe(actions.AUTHENTICATE, function() {
    it('sets the worker UUID', function() {
      const auth = {
        auth: 'SEKRET',
        sig: 'SIG',
      };
      const action = authenticate({
        workerUUID: 'abc123',
        socketAuth: auth,
      });

      const state = worker(undefined, action);
      checkState(state);

      expect(state.get('state')).to.equal('inactive');
      expect(state.get('uuid')).to.equal('abc123');
    });
  });

  describe(actions.UPDATE_WORKER_STATE, function() {
    it('updates the worker state', function() {
      let state = initState;
      expect(state.get('state')).to.equal('inactive');
      state = worker(state, updateWorkerState('inactive'));
      expect(state.get('state')).to.equal('inactive');
      state = worker(state, updateWorkerState('ready'));
      expect(state.get('state')).to.equal('ready');
      state = worker(state, updateWorkerState('inactive'));
      expect(state.get('state')).to.equal('inactive');
    });
  });

  describe(actions.ASSIGN_WORK, function() {
    describe('when the worker is ready', function() {
      it('updates the worker state to "working"', function() {
        let state = initState;
        state = worker(state, updateWorkerState('ready'));
        const workUrl = 'http://www.example.com';
        state = worker(state, assignWork({ url: workUrl }));
        expect(state.get('state')).to.equal('working');
        expect(state.get('workUrl')).to.equal(workUrl);
      });
    });

    describe('when the worker is not ready', function() {
      it('updates the error and returns the same state', function() {
        let state = workerWithState('inactive');
        state = worker(state, assignWork({ url: 'whatever' }));

        expect(state.get('state')).to.equal('inactive');
        expect(state.get('error')).to.be.an('error');
      });
    });
  });

  describe(actions.WORK_FINISHED, function() {
    describe('when the worker is working', function() {
      it('changes the worker to ready', function() {
        let state = workerWithState('working');
        state = worker(state, workFinished());

        expect(state.get('state')).to.equal('ready');
      });

      it('clears the work URL', function() {
        let state = workerWithState('ready');
        state = worker(state, assignWork({ url: 'http://www.example.com' }));
        state = worker(state, workFinished());

        expect(state.get('workUrl')).to.be.null;
      });
    });

    describe('when the worker is inactive', function() {
      it('keeps the worker inactive', function() {
        let state = workerWithState('inactive');
        state = worker(state, workFinished());

        expect(state.get('state')).to.equal('inactive');
      });
    });
  });

  describe(actions.ICON_CLICKED, function() {
    describe('when the worker is inactive', function() {
      it('updates the worker state to "ready"', function() {
        let state = workerWithState('inactive');

        state = worker(state, iconClicked());
        expect(state.get('state')).to.equal('ready');
      });
    });

    describe('when the worker is ready', function() {
      it('updates the worker state to "inactive"', function() {
        let state = workerWithState('ready');

        state = worker(state, iconClicked());
        expect(state.get('state')).to.equal('inactive');
      });
    });

    describe('when the worker is working', function() {
      it("doesn't change the state", function() {
        let state = workerWithState('working');

        state = worker(state, iconClicked());
        expect(state.get('state')).to.equal('working');
      });
    });
  });

  describe(actions.CAPTCHA_REQUIRED, function() {
    it('sets the worker to inactive', function() {
      let state = workerWithState('ready');

      state = worker(state, captchaRequired());
      expect(state.get('state')).to.equal('inactive');
    });
  });
});
